/*
 * webstream.c
 *
 * Play recordings in the browser via HLS: ffmpeg writes the recording (TS files) as
 * HLS segments of 4 seconds and a playlist to a session directory below /var/tmp,
 * epghttpd serves them (data/rechls/<id>/...). Video is copied (progressive H.264)
 * or deinterlaced and encoded with libx264 (interlaced H.264, MPEG-2), audio to AAC.
 *
 * ffmpeg is paused (SIGSTOP) if it is more than hlsAhead segments ahead of the last
 * one requested by the browser, segments far behind are deleted and sessions without
 * request for hlsIdleTimeout seconds are removed (housekeeping of the main loop).
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include <fcntl.h>
#include <poll.h>
#include <signal.h>
#include <dirent.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <sys/syscall.h>
#include <unistd.h>

#include <string>
#include <vector>
#include <algorithm>
#include <map>
#include <mutex>

#include "httpd.h"

//***************************************************************************
// Close all file descriptors >= 'first' (in the child after fork)
//   close_range() needs glibc >= 2.34 and kernel >= 5.9 (not on e.g. Ubuntu 20.04),
//   fallback: close them one by one
//***************************************************************************

static void closeFdsFrom(int first)
{
#ifdef SYS_close_range
   if (syscall(SYS_close_range, first, ~0U, 0) == 0)
      return;
#endif

   long maxFd = sysconf(_SC_OPEN_MAX);

   if (maxFd < 0 || maxFd > 65536)
      maxFd = 65536;

   for (int fd = first; fd < maxFd; fd++)
      close(fd);
}

//***************************************************************************
// Find program in PATH
//***************************************************************************

static int inPath(const char* name)
{
   const char* env = getenv("PATH");
   std::string path = env ? env : "/usr/local/bin:/usr/bin:/bin";
   size_t pos {0};

   while (pos <= path.size())
   {
      size_t end = path.find(':', pos);

      if (end == std::string::npos)
         end = path.size();

      std::string file = path.substr(pos, end - pos) + "/" + name;

      if (end > pos && access(file.c_str(), X_OK) == 0)
         return yes;

      pos = end + 1;
   }

   return no;
}

//***************************************************************************
// Recording Files
//   lookup the recording (md5path, starttime, owner) and its TS files
//   (00001.ts, 00002.ts, ...) below the video directory of one of the VDRs
//***************************************************************************

int cEpgHttpd::recordingFiles(MHD_Connection* tcp, std::vector<std::string>& files, json_t* obj)
{
   const char* md5path = getStrParameter(tcp, "md5path", "");
   const char* owner = getStrParameter(tcp, "owner", "");
   time_t starttime = getIntParameter(tcp, "starttime");

   files.clear();

   if (isEmpty(md5path) || !starttime)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Missing recording reference in request");

   if (strcasecmp(owner, "undefined") == 0)
      owner = "";

   recordingListDb->clear();
   recordingListDb->setValue("MD5PATH", md5path);
   recordingListDb->setValue("STARTTIME", starttime);
   recordingListDb->setValue("OWNER", owner);

   if (!recordingListDb->find())
   {
      recordingListDb->reset();
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Recording '%s/%s/%ld' not found", md5path, owner, starttime);
   }

   std::string path = recordingListDb->getStrValue("PATH");
   std::string vdrUuid = recordingListDb->getStrValue("VDRUUID");
   recordingListDb->reset();

   if (path.empty() || path.find("..") != std::string::npos)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Invalid recording path '%s'", path.c_str());

   // video directories, the one of the recording's VDR first

   std::vector<std::string> videoDirs;

   vdrDb->clear();

   for (int f = selectVdrs->find(); f; f = selectVdrs->fetch())
   {
      const char* dir = vdrDb->getStrValue("VIDEODIR");

      if (isEmpty(dir) || std::find(videoDirs.begin(), videoDirs.end(), dir) != videoDirs.end())
         continue;

      if (vdrUuid == vdrDb->getStrValue("UUID"))
         videoDirs.insert(videoDirs.begin(), dir);
      else
         videoDirs.push_back(dir);
   }

   selectVdrs->freeResult();

   for (const auto& vdir : videoDirs)
   {
      std::string recDir = vdir + "/" + path;
      DIR* dir = opendir(recDir.c_str());

      if (!dir)
         continue;

      while (dirent* e = readdir(dir))
      {
         int n = strlen(e->d_name);

         if (n == 8 && strcmp(e->d_name + 5, ".ts") == 0 && strspn(e->d_name, "0123456789") == 5)
            files.push_back(recDir + "/" + e->d_name);
      }

      closedir(dir);

      if (!files.empty())
      {
         std::sort(files.begin(), files.end());
         return success;
      }
   }

   return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Files of recording '%s' not found on the epgd host", path.c_str());
}

//***************************************************************************
// Do Recording Stream Info
//   -> { video: 'h264', width, height, audio: 'ac3', interlaced, transcode, playable }
//***************************************************************************

int cEpgHttpd::doRecStreamInfo(MHD_Connection* tcp, json_t* obj)
{
   std::vector<std::string> files;

   // ffmpeg/ffprobe are optional dependencies, only needed for this feature

   for (const char* prg : { "ffprobe", "ffmpeg" })
   {
      if (!inPath(prg))
      {
         json_object_set_new(obj, "missing", json_string(prg));
         json_object_set_new(obj, "package", json_string("ffmpeg"));
         json_object_set_new(obj, "host", json_string(getHostName()));
         return buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE,
                              "Program '%s' not found on the epgd host '%s', install package 'ffmpeg'", prg, getHostName());
      }
   }

   if (recordingFiles(tcp, files, obj) != success)
      return MHD_HTTP_NOT_FOUND;

   // the path is from the DB and may contain a "'" -> quote for the shell

   std::string quoted = "'";

   for (char c : files[0])
      quoted += c == '\'' ? std::string("'\\''") : std::string(1, c);

   quoted += "'";

   std::string cmd = "ffprobe -v error -probesize 5000000 -analyzeduration 3000000"
      " -show_entries stream=codec_name,codec_type,width,height,field_order -of compact=p=0 " + quoted + " 2>/dev/null";

   FILE* fp = popen(cmd.c_str(), "r");

   if (!fp)
      return buildResponse(obj, MHD_HTTP_INTERNAL_SERVER_ERROR, "Can't start ffprobe");

   char line[500+TB];
   std::string video, audio, fieldOrder;
   int width {0}, height {0};

   // one line per stream like "codec_name=h264|codec_type=video|width=1920|height=1080|field_order=tt"

   while (fgets(line, sizeof(line), fp))
   {
      std::map<std::string,std::string> kv;

      for (char* tok = strtok(line, "|\n"); tok; tok = strtok(nullptr, "|\n"))
      {
         if (char* eq = strchr(tok, '='))
         {
            *eq = 0;
            kv[tok] = eq + 1;
         }
      }

      if (kv["codec_type"] == "video" && video.empty())
      {
         video = kv["codec_name"];
         width = atoi(kv["width"].c_str());
         height = atoi(kv["height"].c_str());
         fieldOrder = kv["field_order"];
      }
      else if (kv["codec_type"] == "audio" && audio.empty())
         audio = kv["codec_name"];
   }

   pclose(fp);

   // interlaced H.264 (e.g. 1080i with field pictures) can't be played by the browsers
   //   if just copied and MPEG-2 (SD) not at all -> deinterlace and encode the video,
   //   other formats (e.g. UHD H.265) are not supported (encoding too slow)

   int interlaced = !fieldOrder.empty() && fieldOrder != "progressive" && fieldOrder != "unknown";
   int transcode = video == "mpeg2video" || (video == "h264" && interlaced);
   int playable = video == "h264" || video == "mpeg2video";

   json_object_set_new(obj, "video", json_string(video.c_str()));
   json_object_set_new(obj, "audio", json_string(audio.c_str()));
   json_object_set_new(obj, "width", json_integer(width));
   json_object_set_new(obj, "height", json_integer(height));
   json_object_set_new(obj, "fieldorder", json_string(fieldOrder.c_str()));
   json_object_set_new(obj, "interlaced", json_boolean(interlaced));
   // transcoding needs the libx264 encoder of ffmpeg (checked once)

   static int hasX264 {na};

   if (transcode && hasX264 == na)
   {
      hasX264 = no;

      if (FILE* fp = popen("ffmpeg -hide_banner -encoders 2>/dev/null", "r"))
      {
         char l[300+TB];

         while (fgets(l, sizeof(l), fp))
            if (strstr(l, " libx264 "))
               hasX264 = yes;

         pclose(fp);
      }

      if (!hasX264)
         tell(0, "Error: ffmpeg without encoder 'libx264', recordings in %s can't be played in the browser",
              "MPEG-2 or interlaced H.264");
   }

   if (transcode && !hasX264)
   {
      json_object_set_new(obj, "missing", json_string("libx264"));
      json_object_set_new(obj, "package", json_string("ffmpeg"));
      json_object_set_new(obj, "host", json_string(getHostName()));
      json_object_set_new(obj, "neededfor", json_string(video == "mpeg2video" ? "MPEG-2 (SD)" : "interlaced H.264 (1080i)"));
      return buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE,
                           "ffmpeg on the epgd host '%s' has no encoder 'libx264' (needed for %s recordings)",
                           getHostName(), video == "mpeg2video" ? "MPEG-2 (SD)" : "interlaced H.264");
   }

   json_object_set_new(obj, "transcode", json_boolean(transcode));
   json_object_set_new(obj, "playable", json_boolean(playable));
   json_object_set_new(obj, "files", json_integer(files.size()));

   return MHD_HTTP_OK;
}

//***************************************************************************
// HLS Sessions
//***************************************************************************

#define HLS_BASE "/var/tmp/epghttpd-hls"

static const int hlsSegDuration {4};         // seconds per segment
static const int hlsAhead {30};              // max segments ahead of the last requested one (2 minutes)
static const int hlsKeepBehind {450};        // keep segments up to 30 minutes behind
static const int hlsIdleTimeout {60};        // seconds without request -> remove session
static const size_t hlsMaxSessions {4};

struct HlsSession
{
   std::string id;
   std::string dir;
   std::string name;                         // recording (for the log)
   pid_t pid {0};
   time_t lastAccess {0};
   int lastSegment {0};                      // last segment requested by the browser
   int deletedBelow {0};                     // segments below are deleted
   int segments {0};                         // segments in the playlist
   bool paused {false};
   bool done {false};                        // playlist complete (#EXT-X-ENDLIST)
};

static std::map<std::string,HlsSession> hlsSessions;
static std::mutex hlsMutex;

static std::string hlsNewId()
{
   unsigned char rnd[12] {};
   char id[2*sizeof(rnd)+TB] {};
   int fd = open("/dev/urandom", O_RDONLY);

   if (fd < 0 || read(fd, rnd, sizeof(rnd)) != (ssize_t)sizeof(rnd))
   {
      for (auto& c : rnd)
         c = rand() & 0xff;
   }

   if (fd >= 0)
      close(fd);

   for (size_t i = 0; i < sizeof(rnd); i++)
      sprintf(id + 2*i, "%02x", rnd[i]);

   return id;
}

static void hlsRemoveDir(const std::string& dir)
{
   if (DIR* d = opendir(dir.c_str()))
   {
      while (dirent* e = readdir(d))
      {
         if (strcmp(e->d_name, ".") && strcmp(e->d_name, ".."))
            unlink((dir + "/" + e->d_name).c_str());
      }

      closedir(d);
   }

   rmdir(dir.c_str());
}

static void hlsKill(HlsSession& s)
{
   if (s.pid > 0)
   {
      kill(s.pid, SIGCONT);
      kill(s.pid, SIGTERM);

      for (int i = 0; i < 20 && waitpid(s.pid, 0, WNOHANG) == 0; i++)
         usleep(25000);

      if (waitpid(s.pid, 0, WNOHANG) == 0)
      {
         kill(s.pid, SIGKILL);
         waitpid(s.pid, 0, 0);
      }

      s.pid = 0;
   }

   hlsRemoveDir(s.dir);
   tell(eloInfo, "HLS session '%s' of '%s' removed", s.id.c_str(), s.name.c_str());
}

// segments of the playlist and end flag

static void hlsReadPlaylist(HlsSession& s)
{
   FILE* fp = fopen((s.dir + "/index.m3u8").c_str(), "r");

   if (!fp)
      return;

   char line[200+TB];
   int count {0};

   while (fgets(line, sizeof(line), fp))
   {
      if (strncmp(line, "#EXTINF", 7) == 0)
         count++;
      else if (strncmp(line, "#EXT-X-ENDLIST", 14) == 0)
         s.done = true;
   }

   fclose(fp);
   s.segments = count;
}

//***************************************************************************
// HLS Housekeeping (called by the main loop every second)
//***************************************************************************

void cEpgHttpd::hlsHousekeeping(int all)
{
   std::lock_guard<std::mutex> lock(hlsMutex);
   time_t now = time(0);
   static bool initialized {false};

   // remove left overs of a former run

   if (!initialized)
   {
      initialized = true;

      if (DIR* d = opendir(HLS_BASE))
      {
         while (dirent* e = readdir(d))
         {
            if (e->d_name[0] != '.')
               hlsRemoveDir(std::string(HLS_BASE) + "/" + e->d_name);
         }

         closedir(d);
      }
   }

   for (auto it = hlsSessions.begin(); it != hlsSessions.end(); )
   {
      HlsSession& s = it->second;

      if (all || now - s.lastAccess > hlsIdleTimeout)
      {
         hlsKill(s);
         it = hlsSessions.erase(it);
         continue;
      }

      // ffmpeg finished?

      if (s.pid > 0 && waitpid(s.pid, 0, WNOHANG) == s.pid)
         s.pid = 0;

      hlsReadPlaylist(s);

      // throttle ffmpeg

      if (s.pid > 0)
      {
         int ahead = s.segments - s.lastSegment;

         if (!s.paused && ahead > hlsAhead)
         {
            kill(s.pid, SIGSTOP);
            s.paused = true;
         }
         else if (s.paused && ahead < hlsAhead - 10)
         {
            kill(s.pid, SIGCONT);
            s.paused = false;
         }
      }

      // delete segments far behind

      for (; s.deletedBelow < s.lastSegment - hlsKeepBehind; s.deletedBelow++)
      {
         char file[50+TB];
         sprintf(file, "/seg%05d.ts", s.deletedBelow);
         unlink((s.dir + file).c_str());
      }

      ++it;
   }
}

//***************************************************************************
// Do HLS Start
//   data/rechlsstart?md5path=..&starttime=..&owner=..&start=<sec>&transcode=0|1
//   -> { id, url }
//***************************************************************************

int cEpgHttpd::doRecHlsStart(MHD_Connection* tcp, json_t* obj)
{
   std::vector<std::string> files;

   if (recordingFiles(tcp, files, obj) != success)
      return MHD_HTTP_NOT_FOUND;

   int start = std::max(0, getIntParameter(tcp, "start", 0));
   int transcode = getIntParameter(tcp, "transcode", 0);

   std::string input = "concat:";

   for (size_t i = 0; i < files.size(); i++)
      input += (i ? "|" : "") + files[i];

   std::string ss = std::to_string(start);
   std::string hlsTime = std::to_string(hlsSegDuration);

   // transcode=0: copy the video (progressive H.264)
   // transcode=1: deinterlace (yadif, one frame per frame, only frames flagged as interlaced)
   //              and encode (libx264, a key frame every 2 seconds)

   std::vector<const char*> argv =
   {
      "ffmpeg", "-hide_banner", "-loglevel", "fatal", "-nostdin",
      "-ss", ss.c_str(),
      "-i", input.c_str(),
      "-map", "0:v:0", "-map", "0:a:0?"
   };

   if (transcode)
      argv.insert(argv.end(), { "-vf", "yadif=0:-1:1", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
                                "-g", "50", "-pix_fmt", "yuv420p" });
   else
      argv.insert(argv.end(), { "-c:v", "copy" });

   argv.insert(argv.end(), { "-c:a", "aac", "-b:a", "192k", "-ac", "2",
                             "-sn", "-dn",
                             "-f", "hls", "-hls_time", hlsTime.c_str(), "-hls_list_size", "0",
                             "-hls_playlist_type", "event", "-hls_flags", "independent_segments+temp_file",
                             "-hls_segment_filename", "seg%05d.ts",
                             "index.m3u8", nullptr });

   std::lock_guard<std::mutex> lock(hlsMutex);

   // limit the number of sessions, remove the oldest

   while (hlsSessions.size() >= hlsMaxSessions)
   {
      auto oldest = std::min_element(hlsSessions.begin(), hlsSessions.end(),
                                     [](const auto& a, const auto& b) { return a.second.lastAccess < b.second.lastAccess; });
      hlsKill(oldest->second);
      hlsSessions.erase(oldest);
   }

   HlsSession s;
   s.id = hlsNewId();
   s.dir = std::string(HLS_BASE) + "/" + s.id;
   s.name = files[0];
   s.lastAccess = time(0);

   mkdir(HLS_BASE, 0700);

   if (mkdir(s.dir.c_str(), 0700) != 0)
      return buildResponse(obj, MHD_HTTP_INTERNAL_SERVER_ERROR, "Can't create directory '%s', %s", s.dir.c_str(), strerror(errno));

   pid_t pid = fork();

   if (pid < 0)
   {
      hlsRemoveDir(s.dir);
      return buildResponse(obj, MHD_HTTP_INTERNAL_SERVER_ERROR, "Can't fork ffmpeg, %s", strerror(errno));
   }

   if (pid == 0)
   {
      // child: work in the session directory, close all descriptors of epghttpd (sockets)

      if (chdir(s.dir.c_str()) != 0)
         _exit(126);

      int devNull = open("/dev/null", O_RDWR);
      dup2(devNull, STDIN_FILENO);
      dup2(devNull, STDOUT_FILENO);
      closeFdsFrom(3);
      execvp("ffmpeg", (char* const*)argv.data());
      _exit(127);
   }

   s.pid = pid;
   hlsSessions[s.id] = s;

   tell(eloInfo, "HLS session '%s': recording '%s' from %d seconds (ffmpeg pid %d, %zu files, %s)",
        s.id.c_str(), files[0].c_str(), start, pid, files.size(), transcode ? "deinterlace + encode" : "copy");

   json_object_set_new(obj, "id", json_string(s.id.c_str()));
   json_object_set_new(obj, "url", json_string(("data/rechls/" + s.id + "/index.m3u8").c_str()));

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do HLS State / Stop
//   data/rechlsstate?id=..  -> { segments, done, ready, running }
//   data/rechlsstop?id=..
//***************************************************************************

int cEpgHttpd::doRecHlsState(MHD_Connection* tcp, json_t* obj)
{
   std::lock_guard<std::mutex> lock(hlsMutex);
   auto it = hlsSessions.find(getStrParameter(tcp, "id", ""));

   if (it == hlsSessions.end())
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Unknown stream session");

   HlsSession& s = it->second;

   s.lastAccess = time(0);

   if (s.pid > 0 && waitpid(s.pid, 0, WNOHANG) == s.pid)
      s.pid = 0;

   hlsReadPlaylist(s);

   json_object_set_new(obj, "segments", json_integer(s.segments));
   json_object_set_new(obj, "done", json_boolean(s.done));
   json_object_set_new(obj, "running", json_boolean(s.pid > 0));
   json_object_set_new(obj, "ready", json_boolean(s.segments >= 2 || s.done));

   if (!s.pid && !s.segments)
      return buildResponse(obj, MHD_HTTP_INTERNAL_SERVER_ERROR, "ffmpeg stopped without output");

   return MHD_HTTP_OK;
}

int cEpgHttpd::doRecHlsStop(MHD_Connection* tcp, json_t* obj)
{
   std::lock_guard<std::mutex> lock(hlsMutex);
   auto it = hlsSessions.find(getStrParameter(tcp, "id", ""));

   if (it != hlsSessions.end())
   {
      hlsKill(it->second);
      hlsSessions.erase(it);
   }

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Serve HLS
//   GET data/rechls/<id>/index.m3u8 | data/rechls/<id>/seg00000.ts
//***************************************************************************

static MHD_Result hlsAnswer(MHD_Connection* tcp, int status, const char* text)
{
   MHD_Response* response = MHD_create_response_from_buffer(strlen(text), (void*)text, MHD_RESPMEM_MUST_COPY);
   MHD_add_response_header(response, "Content-Type", "application/json; charset=utf-8");
   MHD_Result res = MHD_queue_response(tcp, status, response);
   MHD_destroy_response(response);
   return res;
}

MHD_Result cEpgHttpd::serveHls(MHD_Connection* tcp, const char* url)
{
   // rights (the session id is random, so the segments are protected by it too)

   {
      json_t* obj = json_object();
      int statusCode {MHD_HTTP_OK};

      if (!hasRights("/data/rechls", obj, statusCode))
      {
         char* text = json_dumps(obj, 0);
         MHD_Result res = hlsAnswer(tcp, statusCode, text);
         free(text);
         json_decref(obj);
         return res;
      }

      json_decref(obj);
   }

   // "/data/rechls/<id>/<file>"

   std::string rest = url + strlen("/data/rechls/");
   size_t slash = rest.find('/');

   if (slash == std::string::npos)
      return hlsAnswer(tcp, MHD_HTTP_NOT_FOUND, "{}");

   std::string id = rest.substr(0, slash);
   std::string file = rest.substr(slash + 1);
   int segment {-1};

   if (file != "index.m3u8")
   {
      if (file.size() != 11 || file.compare(0, 3, "seg") || file.compare(8, 3, ".ts")
          || strspn(file.c_str() + 3, "0123456789") != 5)
         return hlsAnswer(tcp, MHD_HTTP_NOT_FOUND, "{}");

      segment = atoi(file.c_str() + 3);
   }

   std::string path;

   {
      std::lock_guard<std::mutex> lock(hlsMutex);
      auto it = hlsSessions.find(id);

      if (it == hlsSessions.end())
         return hlsAnswer(tcp, MHD_HTTP_NOT_FOUND, "{\"result\": {\"state\": 404, \"message\": \"Unknown stream session\"}}");

      it->second.lastAccess = time(0);

      if (segment >= 0)
         it->second.lastSegment = segment;

      path = it->second.dir + "/" + file;
   }

   MHD_Response* response {};

   if (segment < 0)
   {
      // playlist: start at the beginning (it is an EVENT playlist which grows while playing,
      //   without EXT-X-START the players would start at its end)

      MemoryStruct data;

      if (loadFromFile(path.c_str(), &data) != success)
         return hlsAnswer(tcp, MHD_HTTP_NOT_FOUND, "{}");

      std::string m3u(data.memory, data.size);
      size_t eol = m3u.find('\n');

      if (eol != std::string::npos)
         m3u.insert(eol + 1, "#EXT-X-START:TIME-OFFSET=0,PRECISE=YES\n");

      response = MHD_create_response_from_buffer(m3u.size(), (void*)m3u.c_str(), MHD_RESPMEM_MUST_COPY);
      MHD_add_response_header(response, "Content-Type", "application/vnd.apple.mpegurl");
   }
   else
   {
      int fd = open(path.c_str(), O_RDONLY);
      struct stat st;

      if (fd < 0 || fstat(fd, &st) != 0)
      {
         if (fd >= 0)
            close(fd);

         return hlsAnswer(tcp, MHD_HTTP_NOT_FOUND, "{}");
      }

      response = MHD_create_response_from_fd(st.st_size, fd);    // MHD closes fd
      MHD_add_response_header(response, "Content-Type", "video/mp2t");
   }

   MHD_add_response_header(response, "Cache-Control", "no-store");
   MHD_Result res = MHD_queue_response(tcp, MHD_HTTP_OK, response);
   MHD_destroy_response(response);

   return res;
}
