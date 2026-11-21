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
 * Live TV: ffmpeg reads the HTTP stream of streamdev-server (parameter epgd/liveStreamUrl,
 * e.g. http://vdr:3000/TS/ + channel id), a shell wrapper probes the video format first
 * (probe.txt in the session directory) and then runs ffmpeg (copy or encode as above).
 * The playlist is a sliding window (timeshift of hlsLiveWindow segments), ffmpeg deletes
 * the old segments itself and isn't throttled (streamdev would drop the client).
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include <fcntl.h>
#include <poll.h>
#include <netdb.h>
#include <sys/socket.h>
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
// ffmpeg has the encoder libx264 (checked once)
//***************************************************************************

static int hasX264()
{
   static int has {na};

   if (has != na)
      return has;

   has = no;

   if (FILE* fp = popen("ffmpeg -hide_banner -encoders 2>/dev/null", "r"))
   {
      char l[300+TB];

      while (fgets(l, sizeof(l), fp))
         if (strstr(l, " libx264 "))
            has = yes;

      pclose(fp);
   }

   if (!has)
      tell(0, "Error: ffmpeg without encoder 'libx264', MPEG-2 and interlaced H.264 can't be played in the browser");

   return has;
}

//***************************************************************************
// VAAPI (hardware decoding, deinterlacing and encoding, e.g. Intel GPUs)
//   the first render node, checked once by a short test encode
//***************************************************************************

static std::string vaapiDevice()
{
   std::vector<std::string> nodes;

   if (DIR* d = opendir("/dev/dri"))
   {
      while (dirent* e = readdir(d))
         if (strncmp(e->d_name, "renderD", 7) == 0)
            nodes.push_back(std::string("/dev/dri/") + e->d_name);

      closedir(d);
   }

   std::sort(nodes.begin(), nodes.end());

   return nodes.empty() ? "" : nodes[0];
}

static int vaapiWorks(const std::string& device)
{
   static std::map<std::string,int> works;

   if (works.count(device))
      return works[device];

   std::string cmd = "ffmpeg -hide_banner -loglevel error -nostdin -init_hw_device vaapi=va:" + device
      + " -filter_hw_device va -f lavfi -i testsrc2=size=720x576:rate=25 -t 0.5"
        " -vf 'format=nv12,hwupload,deinterlace_vaapi=rate=frame:auto=1,scale_vaapi=w=-2:h=min(ih\\,360)'"
        " -c:v h264_vaapi -f null - >/dev/null 2>&1 </dev/null";

   works[device] = system(cmd.c_str()) == 0;

   tell(eloInfo, "VAAPI encoding with '%s' %s", device.c_str(),
        works[device] ? "works" : "doesn't work (driver missing? e.g. package i965-va-driver or intel-media-va-driver), using libx264");

   return works[device];
}

//***************************************************************************
// Stream Encoding
//   parameters epgd/streamEncoder (auto|vaapi|x264), streamX264Preset, streamMaxHeight
//   -> encoder "vaapi", "x264" or "" (none available)
//***************************************************************************

struct StreamEncoding
{
   std::string encoder;
   std::string device;                       // VAAPI render node
   std::string preset {"veryfast"};          // libx264 preset
   int maxHeight {0};                        // scale down to (0 = keep)
};

static StreamEncoding streamEncoding(cEpgHttpd* httpd)
{
   StreamEncoding enc;
   char value[100+TB] {};
   long int maxHeight {0};

   httpd->getParameter("epgd", "streamEncoder", value);
   std::string mode = isEmpty(value) ? "auto" : value;

   if (httpd->getParameter("epgd", "streamX264Preset", value) && !isEmpty(value))
      enc.preset = value;

   httpd->getParameter("epgd", "streamMaxHeight", maxHeight);
   enc.maxHeight = std::max(0L, maxHeight);

   if (mode != "x264")
   {
      std::string device = vaapiDevice();

      if (!device.empty() && vaapiWorks(device))
      {
         enc.encoder = "vaapi";
         enc.device = device;
      }
   }

   if (enc.encoder.empty() && hasX264())
      enc.encoder = "x264";

   return enc;
}

//***************************************************************************
// Stream Parameter Options
//   the possible values of the stream parameters for the select boxes of the web frontend,
//   streamEncoder: only the encoders available on this host
//***************************************************************************

json_t* cEpgHttpd::streamParameterOptions(const char* name)
{
   std::vector<std::string> values;

   if (strcmp(name, "streamEncoder") == 0)
   {
      std::string device = vaapiDevice();

      values.push_back("auto");

      if (!device.empty() && vaapiWorks(device))
         values.push_back("vaapi");

      if (hasX264())
         values.push_back("x264");
   }
   else if (strcmp(name, "streamX264Preset") == 0)
      values = { "ultrafast", "superfast", "veryfast", "faster", "fast", "medium" };
   else if (strcmp(name, "streamMaxHeight") == 0)
      values = { "0", "1080", "720", "576", "540", "480", "360" };
   else
      return nullptr;

   json_t* oArray = json_array();

   for (const auto& v : values)
      json_array_append_new(oArray, json_string(v.c_str()));

   return oArray;
}

// ffmpeg arguments before the input (hardware decoding) and for the video output
//   deinterlace only frames flagged as interlaced (one frame per frame), scale down to maxHeight,
//   key frame every segment (2 or 4 seconds)

static void encoderArgs(const StreamEncoding& enc, int segDuration,
                        std::vector<std::string>& in, std::vector<std::string>& out)
{
   std::string keys = "expr:gte(t,n_forced*" + std::to_string(segDuration) + ")";
   std::string scale = enc.maxHeight > 0 ? "min(ih\\," + std::to_string(enc.maxHeight) + ")" : "";

   in.clear();
   out.clear();

   if (enc.encoder == "vaapi")
   {
      // decoded on the GPU if possible, else by software and uploaded (format=nv12|vaapi,hwupload)

      in = { "-init_hw_device", "vaapi=va:" + enc.device, "-hwaccel", "vaapi", "-hwaccel_device", "va",
             "-hwaccel_output_format", "vaapi", "-filter_hw_device", "va" };
      out = { "-vf", "format=nv12|vaapi,hwupload,deinterlace_vaapi=rate=frame:auto=1"
                     + (scale.empty() ? "" : ",scale_vaapi=w=-2:h=" + scale),
              "-c:v", "h264_vaapi", "-qp", "24", "-g", "50", "-force_key_frames", keys };
   }
   else if (enc.encoder == "x264")
   {
      out = { "-vf", "yadif=0:-1:1" + (scale.empty() ? "" : ",scale=-2:" + scale),
              "-c:v", "libx264", "-preset", enc.preset, "-crf", "22", "-pix_fmt", "yuv420p",
              "-g", "50", "-force_key_frames", keys };
   }
}

//***************************************************************************
// H.264 without IDR frames (e.g. the ARD channels, open GOP with I slices only)
//   the browsers can't decode segments which don't start with an IDR frame -> encode
//***************************************************************************

static const char* idrCheck = "timeout 15 ffmpeg -hide_banner -nostdin -t 3 -i %s -map 0:v:0 -c copy -bsf:v trace_headers -f null - 2>&1 </dev/null"
   " | grep -cE 'nal_unit_type +[01]+ = 5$'";

static int hasIdrFrames(const std::string& quotedInput)
{
   char cmd[1000+TB];
   int count {0};

   snprintf(cmd, sizeof(cmd), idrCheck, quotedInput.c_str());

   if (FILE* fp = popen(cmd, "r"))
   {
      if (fscanf(fp, "%d", &count) != 1)
         count = 0;

      pclose(fp);
   }

   return count > 0;
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

   StreamEncoding enc = streamEncoding(this);
   int interlaced = !fieldOrder.empty() && fieldOrder != "progressive" && fieldOrder != "unknown";
   int noIdr = video == "h264" && !interlaced && !hasIdrFrames(quoted);
   int transcode = video == "mpeg2video" || (video == "h264" && (interlaced || noIdr))
      || (enc.maxHeight > 0 && height > enc.maxHeight);
   int playable = video == "h264" || video == "mpeg2video";

   json_object_set_new(obj, "video", json_string(video.c_str()));
   json_object_set_new(obj, "audio", json_string(audio.c_str()));
   json_object_set_new(obj, "width", json_integer(width));
   json_object_set_new(obj, "height", json_integer(height));
   json_object_set_new(obj, "fieldorder", json_string(fieldOrder.c_str()));
   json_object_set_new(obj, "interlaced", json_boolean(interlaced));
   json_object_set_new(obj, "noidr", json_boolean(noIdr));
   json_object_set_new(obj, "encoder", json_string(transcode ? enc.encoder.c_str() : "copy"));

   // transcoding needs VAAPI or the libx264 encoder of ffmpeg

   if (transcode && enc.encoder.empty())
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
static const int hlsLiveSegDuration {2};     // live: seconds per segment
static const int hlsLiveWindow {900};        // live: segments in the playlist (30 minutes timeshift)
static const int hlsLiveIdleTimeout {30};    // live: seconds without request -> remove session (frees the tuner)

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
   bool live {false};                        // live TV (sliding window playlist)
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

// signal to the process group of the child (live: shell wrapper with ffprobe / ffmpeg)

static void hlsSignal(pid_t pid, int sig)
{
   if (kill(-pid, sig) != 0)
      kill(pid, sig);
}

static void hlsKill(HlsSession& s)
{
   if (s.pid > 0)
   {
      hlsSignal(s.pid, SIGCONT);
      hlsSignal(s.pid, SIGTERM);

      for (int i = 0; i < 20 && waitpid(s.pid, 0, WNOHANG) == 0; i++)
         usleep(25000);

      if (waitpid(s.pid, 0, WNOHANG) == 0)
      {
         hlsSignal(s.pid, SIGKILL);
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

      if (all || now - s.lastAccess > (s.live ? hlsLiveIdleTimeout : hlsIdleTimeout))
      {
         hlsKill(s);
         it = hlsSessions.erase(it);
         continue;
      }

      // ffmpeg finished?

      if (s.pid > 0 && waitpid(s.pid, 0, WNOHANG) == s.pid)
         s.pid = 0;

      hlsReadPlaylist(s);

      if (s.live)                           // ffmpeg deletes the segments of a live stream itself
      {
         ++it;
         continue;
      }

      // throttle ffmpeg

      if (s.pid > 0)
      {
         int ahead = s.segments - s.lastSegment;

         if (!s.paused && ahead > hlsAhead)
         {
            hlsSignal(s.pid, SIGSTOP);
            s.paused = true;
         }
         else if (s.paused && ahead < hlsAhead - 10)
         {
            hlsSignal(s.pid, SIGCONT);
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
// HLS Spawn
//   create the session directory and start the program (argv) in it,
//   the child gets its own process group (killed as a whole)
//***************************************************************************

static int hlsSpawn(HlsSession& s, const std::vector<const char*>& argv, std::string& error)
{
   std::lock_guard<std::mutex> lock(hlsMutex);

   // limit the number of sessions, remove the oldest

   while (hlsSessions.size() >= hlsMaxSessions)
   {
      auto oldest = std::min_element(hlsSessions.begin(), hlsSessions.end(),
                                     [](const auto& a, const auto& b) { return a.second.lastAccess < b.second.lastAccess; });
      hlsKill(oldest->second);
      hlsSessions.erase(oldest);
   }

   s.id = hlsNewId();
   s.dir = std::string(HLS_BASE) + "/" + s.id;
   s.lastAccess = time(0);

   mkdir(HLS_BASE, 0700);

   if (mkdir(s.dir.c_str(), 0700) != 0)
   {
      error = "Can't create directory '" + s.dir + "', " + strerror(errno);
      return fail;
   }

   pid_t pid = fork();

   if (pid < 0)
   {
      hlsRemoveDir(s.dir);
      error = std::string("Can't fork ") + argv[0] + ", " + strerror(errno);
      return fail;
   }

   if (pid == 0)
   {
      // child: own process group, work in the session directory,
      //   close all descriptors of epghttpd (sockets)

      setpgid(0, 0);

      if (chdir(s.dir.c_str()) != 0)
         _exit(126);

      int devNull = open("/dev/null", O_RDWR);
      dup2(devNull, STDIN_FILENO);
      dup2(devNull, STDOUT_FILENO);
      closeFdsFrom(3);
      execvp(argv[0], (char* const*)argv.data());
      _exit(127);
   }

   setpgid(pid, pid);                        // also here, avoids a race with the child
   s.pid = pid;
   hlsSessions[s.id] = s;

   return success;
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

   // transcode=0: copy the video (progressive H.264 with IDR frames)
   // transcode=1: deinterlace and encode (VAAPI or libx264, see encoderArgs())

   StreamEncoding enc;
   std::vector<std::string> encIn, encOut;

   if (transcode)
   {
      enc = streamEncoding(this);

      if (enc.encoder.empty())
         return buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE, "No video encoder available (VAAPI or libx264)");

      encoderArgs(enc, hlsSegDuration, encIn, encOut);
   }
   else
      encOut = { "-c:v", "copy" };

   std::vector<const char*> argv = { "ffmpeg", "-hide_banner", "-loglevel", "fatal", "-nostdin" };

   for (const auto& a : encIn)
      argv.push_back(a.c_str());

   argv.insert(argv.end(), { "-ss", ss.c_str(), "-i", input.c_str(), "-map", "0:v:0", "-map", "0:a:0?" });

   for (const auto& a : encOut)
      argv.push_back(a.c_str());

   argv.insert(argv.end(), { "-c:a", "aac", "-b:a", "192k", "-ac", "2",
                             "-sn", "-dn",
                             "-f", "hls", "-hls_time", hlsTime.c_str(), "-hls_list_size", "0",
                             "-hls_playlist_type", "event", "-hls_flags", "independent_segments+temp_file",
                             "-hls_segment_filename", "seg%05d.ts",
                             "index.m3u8", nullptr });

   HlsSession s;
   std::string error;
   s.name = files[0];

   if (hlsSpawn(s, argv, error) != success)
      return buildResponse(obj, MHD_HTTP_INTERNAL_SERVER_ERROR, "%s", error.c_str());

   pid_t pid = s.pid;

   tell(eloInfo, "HLS session '%s': recording '%s' from %d seconds (ffmpeg pid %d, %zu files, %s)",
        s.id.c_str(), files[0].c_str(), start, pid, files.size(), transcode ? ("encode " + enc.encoder).c_str() : "copy");

   json_object_set_new(obj, "id", json_string(s.id.c_str()));
   json_object_set_new(obj, "url", json_string(("data/rechls/" + s.id + "/index.m3u8").c_str()));

   return MHD_HTTP_OK;
}

//***************************************************************************
// Init Live Stream URL
//   as long as the parameter epgd/liveStreamUrl isn't stored: check the attached VDRs for the
//   HTTP server of streamdev-server (port 3000), the first one answering is taken
//   (http://<ip>:3000/TS/). Called at start and with data/parameters, at most every
//   5 minutes (the VDRs may attach later), a stored value (also an empty one) ends it.
//***************************************************************************

static int tcpPortOpen(const char* host, int port, int timeoutMs)
{
   addrinfo hints {};
   addrinfo* res {};
   int open {no};

   hints.ai_socktype = SOCK_STREAM;

   if (getaddrinfo(host, std::to_string(port).c_str(), &hints, &res) != 0)
      return no;

   for (addrinfo* ai = res; ai && !open; ai = ai->ai_next)
   {
      int fd = socket(ai->ai_family, ai->ai_socktype | SOCK_NONBLOCK | SOCK_CLOEXEC, ai->ai_protocol);

      if (fd < 0)
         continue;

      if (connect(fd, ai->ai_addr, ai->ai_addrlen) == 0)
         open = yes;
      else if (errno == EINPROGRESS)
      {
         pollfd pfd { fd, POLLOUT, 0 };
         int err {0};
         socklen_t len = sizeof(err);

         if (poll(&pfd, 1, timeoutMs) == 1 && getsockopt(fd, SOL_SOCKET, SO_ERROR, &err, &len) == 0 && !err)
            open = yes;
      }

      close(fd);
   }

   freeaddrinfo(res);

   return open;
}

void cEpgHttpd::initLiveStreamUrl()
{
   static time_t lastCheck {0};
   static bool finished {false};
   const int streamdevPort {3000};

   if (finished || !parametersDb || !selectVdrs || time(0) - lastCheck < 5*tmeSecondsPerMinute)
      return;

   lastCheck = time(0);

   // already stored (by this check or by the user)?

   parametersDb->clear();
   parametersDb->setValue("OWNER", "epgd");
   parametersDb->setValue("NAME", "liveStreamUrl");
   int stored = parametersDb->find();
   parametersDb->reset();

   if (stored)
   {
      finished = true;
      return;
   }

   // the attached VDRs

   std::vector<std::string> ips;

   vdrDb->clear();

   for (int f = selectVdrs->find(); f; f = selectVdrs->fetch())
   {
      const char* ip = vdrDb->getStrValue("IP");

      if (vdrDb->hasValue("STATE", "attached") && !isEmpty(ip) && std::find(ips.begin(), ips.end(), ip) == ips.end())
         ips.push_back(ip);
   }

   selectVdrs->freeResult();

   for (const auto& ip : ips)
   {
      if (tcpPortOpen(ip.c_str(), streamdevPort, 500))
      {
         std::string host = ip.find(':') != std::string::npos ? "[" + ip + "]" : ip;
         std::string url = "http://" + host + ":" + std::to_string(streamdevPort) + "/TS/";

         setParameter("epgd", "liveStreamUrl", url.c_str());
         finished = true;
         tell(eloInfo, "Live TV: streamdev-server found at '%s', parameter 'liveStreamUrl' set to '%s'", ip.c_str(), url.c_str());
         return;
      }
   }

   tell(eloDetail, "Live TV: no streamdev-server (HTTP port %d) found on the %zu attached VDR(s), checking again later",
        streamdevPort, ips.size());
}

//***************************************************************************
// Do Live HLS Start
//   data/livehlsstart?channelid=..  -> { id, url, live: true }
//   the shell wrapper probes the stream (-> probe.txt, see data/rechlsstate) and runs
//   ffmpeg, so epghttpd isn't blocked while the VDR tunes and ffprobe analyzes
//***************************************************************************

static const char* liveScript =
   "url=$1; window=$2; segtime=$3; maxh=$4; enc=$5; cache=$6; encin=$7; encout=$8\n"
   "set -f\n"
   "val() { printf '%s\\n' \"$2\" | tr '|' '\\n' | sed -n \"s/^$1=//p\" | head -n 1; }\n"
   "info=\n"
   "if [ -f \"$cache\" ] && [ $(( $(date +%s) - $(stat -c %Y \"$cache\") )) -lt 86400 ]; then info=$(cat \"$cache\"); fi\n"
   "if [ -z \"$info\" ]; then\n"
   "   probe=$(timeout 25 ffprobe -v error -rw_timeout 15000000 -probesize 5000000 -analyzeduration 3000000"
   " -select_streams v:0 -show_entries stream=codec_name,width,height,field_order -of compact=p=0 \"$url\" 2>&1 </dev/null)\n"
   "   video=$(val codec_name \"$probe\"); field=$(val field_order \"$probe\")\n"
   "   if [ -z \"$video\" ]; then\n"
   "      msg=$(printf '%s\\n' \"$probe\" | grep -v '^ *$' | tail -n 1)\n"
   "      printf 'error=%s\\n' \"${msg:-no video stream}\" > probe.txt; exit 3\n"
   "   fi\n"
   "   idr=1\n"
   "   if [ \"$video\" = h264 ] && [ \"$field\" = progressive ]; then\n"
   "      n=$(timeout 15 ffmpeg -hide_banner -nostdin -rw_timeout 15000000 -t 3 -i \"$url\" -map 0:v:0 -c copy"
   " -bsf:v trace_headers -f null - 2>&1 </dev/null | grep -cE 'nal_unit_type +[01]+ = 5$')\n"
   "      [ \"${n:-0}\" -gt 0 ] || idr=0\n"
   "   fi\n"
   "   info=\"codec_name=$video|width=$(val width \"$probe\")|height=$(val height \"$probe\")|field_order=$field|idr=$idr\"\n"
   "   printf '%s\\n' \"$info\" > \"$cache.$$\" && mv \"$cache.$$\" \"$cache\"\n"
   "fi\n"
   "video=$(val codec_name \"$info\"); width=$(val width \"$info\"); height=$(val height \"$info\")\n"
   "field=$(val field_order \"$info\"); idr=$(val idr \"$info\")\n"
   "mode=copy\n"
   "case \"$video\" in\n"
   "   h264)       case \"$field\" in\n"
   "                  progressive) [ \"$idr\" = 0 ] && mode=encode ;;\n"
   "                  unknown|'')  [ \"${height:-0}\" -ge 1080 ] && mode=encode ;;\n"
   "                  *)           mode=encode ;;\n"
   "               esac ;;\n"
   "   mpeg2video) mode=encode ;;\n"
   "   *)          mode=unsupported ;;\n"
   "esac\n"
   "[ $mode = copy ] && [ \"$maxh\" -gt 0 ] && [ \"${height:-0}\" -gt \"$maxh\" ] && mode=encode\n"
   "[ $mode = encode ] && [ -z \"$enc\" ] && mode=noencoder\n"
   "printf 'video=%s\\nwidth=%s\\nheight=%s\\nfieldorder=%s\\nidr=%s\\nmode=%s\\nencoder=%s\\n'"
   " \"$video\" \"$width\" \"$height\" \"$field\" \"$idr\" $mode \"$enc\" > probe.txt\n"
   "case $mode in\n"
   "   copy)   encin=; encout='-c:v copy' ;;\n"
   "   encode) ;;\n"
   "   *)      exit 4 ;;\n"
   "esac\n"
   "exec ffmpeg -hide_banner -loglevel fatal -nostdin $encin -rw_timeout 15000000 -probesize 5000000 -analyzeduration 2000000"
   " -i \"$url\" -map 0:v:0 -map '0:a:0?' $encout -c:a aac -b:a 160k -ac 2 -sn -dn -max_muxing_queue_size 1024"
   " -f hls -hls_time \"$segtime\" -hls_list_size \"$window\" -hls_delete_threshold 10"
   " -hls_flags delete_segments+independent_segments+temp_file -hls_segment_filename 'seg%05d.ts' index.m3u8\n";

int cEpgHttpd::doLiveHlsStart(MHD_Connection* tcp, json_t* obj)
{
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

   // read without getParameter(), it would store the empty default and end the preset (initLiveStreamUrl())

   std::string base;

   parametersDb->clear();
   parametersDb->setValue("OWNER", "epgd");
   parametersDb->setValue("NAME", "liveStreamUrl");

   if (parametersDb->find())
      base = parametersDb->getStrValue("VALUE");

   parametersDb->reset();

   if (base.empty())
      return buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE, "Live TV not configured (parameter 'liveStreamUrl' of epgd)");

   // channel id like S19.2E-1-1019-10301 (also as part of the URL -> check the characters)

   std::string channelId = getStrParameter(tcp, "channelid", "");

   if (channelId.empty() || channelId.size() > 50
       || strspn(channelId.c_str(), "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.+-") != channelId.size())
      return buildResponse(obj, MHD_HTTP_BAD_REQUEST, "Invalid channel id '%s'", channelId.c_str());

   // URL: placeholder {channelid} or the id appended

   std::string url = base;
   size_t pos = url.find("{channelid}");

   if (pos != std::string::npos)
      url.replace(pos, strlen("{channelid}"), channelId);
   else
      url += (url.back() == '/' ? "" : "/") + channelId;

   std::string window = std::to_string(hlsLiveWindow);
   std::string segTime = std::to_string(hlsLiveSegDuration);

   // encoder arguments (used by the wrapper if the video has to be encoded), joined by blanks
   //   (the single arguments contain no blanks), probe results cached per channel for a day

   StreamEncoding enc = streamEncoding(this);
   std::vector<std::string> encIn, encOut;
   std::string in, out;

   encoderArgs(enc, hlsLiveSegDuration, encIn, encOut);

   for (const auto& a : encIn)
      in += (in.empty() ? "" : " ") + a;

   for (const auto& a : encOut)
      out += (out.empty() ? "" : " ") + a;

   std::string maxHeight = std::to_string(enc.maxHeight);
   std::string cache = std::string(HLS_BASE) + "/.probe";

   mkdir(HLS_BASE, 0700);
   mkdir(cache.c_str(), 0700);
   cache += "/" + channelId;

   std::vector<const char*> argv =
   {
      "/bin/sh", "-c", liveScript, "epgd-live",
      url.c_str(), window.c_str(), segTime.c_str(), maxHeight.c_str(), enc.encoder.c_str(),
      cache.c_str(), in.c_str(), out.c_str(),
      nullptr
   };

   HlsSession s;
   std::string error;
   s.name = "live " + channelId;
   s.live = true;

   if (hlsSpawn(s, argv, error) != success)
      return buildResponse(obj, MHD_HTTP_INTERNAL_SERVER_ERROR, "%s", error.c_str());

   tell(eloInfo, "HLS session '%s': live '%s' from '%s' (pid %d)", s.id.c_str(), channelId.c_str(), url.c_str(), s.pid);

   json_object_set_new(obj, "id", json_string(s.id.c_str()));
   json_object_set_new(obj, "url", json_string(("data/rechls/" + s.id + "/index.m3u8").c_str()));
   json_object_set_new(obj, "live", json_true());

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
   json_object_set_new(obj, "ready", json_boolean(s.segments >= (s.live ? 3 : 2) || s.done));
   json_object_set_new(obj, "live", json_boolean(s.live));

   if (s.live)
   {
      // result of the probe of the shell wrapper (key=value lines)

      std::map<std::string,std::string> probe;

      if (FILE* fp = fopen((s.dir + "/probe.txt").c_str(), "r"))
      {
         char line[500+TB];

         while (fgets(line, sizeof(line), fp))
         {
            line[strcspn(line, "\n")] = 0;

            if (char* eq = strchr(line, '='))
            {
               *eq = 0;
               probe[line] = eq + 1;
            }
         }

         fclose(fp);
      }

      for (const char* key : { "video", "width", "height", "fieldorder", "mode", "encoder", "idr" })
         if (probe.count(key))
            json_object_set_new(obj, key, json_string(probe[key].c_str()));

      if (!s.pid && !s.segments)
      {
         const std::string& mode = probe["mode"];

         if (mode == "unsupported")
            return buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE, "Video format '%s' of the channel can't be played in the browser",
                                 probe["video"].c_str());

         if (mode == "noencoder")
         {
            json_object_set_new(obj, "missing", json_string("libx264"));
            json_object_set_new(obj, "package", json_string("ffmpeg"));
            json_object_set_new(obj, "host", json_string(getHostName()));
            json_object_set_new(obj, "neededfor", json_string(probe["video"] == "mpeg2video" ? "MPEG-2 (SD)" : "interlaced H.264 (1080i)"));
            return buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE, "No video encoder on the epgd host '%s' (VAAPI or libx264)", getHostName());
         }

         if (probe.count("error"))
            return buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE, "Live stream not readable (streamdev): %s", probe["error"].c_str());

         return buildResponse(obj, MHD_HTTP_INTERNAL_SERVER_ERROR, "ffmpeg stopped without output");
      }
   }

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
   bool live {false};

   {
      std::lock_guard<std::mutex> lock(hlsMutex);
      auto it = hlsSessions.find(id);

      if (it == hlsSessions.end())
         return hlsAnswer(tcp, MHD_HTTP_NOT_FOUND, "{\"result\": {\"state\": 404, \"message\": \"Unknown stream session\"}}");

      it->second.lastAccess = time(0);

      if (segment >= 0)
         it->second.lastSegment = segment;

      path = it->second.dir + "/" + file;
      live = it->second.live;
   }

   MHD_Response* response {};

   if (segment < 0 && live)
   {
      // live: sliding window playlist, the players start near its end

      int fd = open(path.c_str(), O_RDONLY);
      struct stat st;

      if (fd < 0 || fstat(fd, &st) != 0)
      {
         if (fd >= 0)
            close(fd);

         return hlsAnswer(tcp, MHD_HTTP_NOT_FOUND, "{}");
      }

      response = MHD_create_response_from_fd(st.st_size, fd);    // MHD closes fd
      MHD_add_response_header(response, "Content-Type", "application/vnd.apple.mpegurl");
   }
   else if (segment < 0)
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
