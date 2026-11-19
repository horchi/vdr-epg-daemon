/*
 * webstream.c
 *
 * Play recordings in the browser: the TS files of a recording are remuxed by
 * ffmpeg to fragmented MP4 (video copied, audio to AAC) and streamed to the browser.
 * For now only H.264 recordings (HD) are supported.
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

#include <string>
#include <vector>
#include <algorithm>
#include <map>

#include "httpd.h"

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
// Stream Context
//***************************************************************************

struct RecStream
{
   pid_t pid {0};
   int fd {-1};
};

static ssize_t recStreamRead(void* cls, uint64_t pos, char* buf, size_t max)
{
   RecStream* s = (RecStream*)cls;

   // don't block the (single threaded) http server for long, if ffmpeg has
   //   nothing for us yet MHD calls again

   pollfd pfd { s->fd, POLLIN, 0 };

   if (poll(&pfd, 1, 100) == 0)
      return 0;

   ssize_t n = read(s->fd, buf, max);

   if (n > 0)
      return n;

   if (n < 0 && (errno == EAGAIN || errno == EINTR))
      return 0;

   return MHD_CONTENT_READER_END_OF_STREAM;
}

static void recStreamFree(void* cls)
{
   RecStream* s = (RecStream*)cls;

   if (s->fd >= 0)
      close(s->fd);

   if (s->pid > 0)
   {
      kill(s->pid, SIGTERM);

      for (int i = 0; i < 20 && waitpid(s->pid, 0, WNOHANG) == 0; i++)
         usleep(50000);

      if (waitpid(s->pid, 0, WNOHANG) == 0)
      {
         kill(s->pid, SIGKILL);
         waitpid(s->pid, 0, 0);
      }
   }

   tell(eloDetail, "Recording stream (ffmpeg pid %d) closed", s->pid);
   delete s;
}

//***************************************************************************
// Stream Recording
//   GET data/recstream?md5path=..&starttime=..&owner=..&start=<seconds>
//***************************************************************************

MHD_Result cEpgHttpd::streamRecording(MHD_Connection* tcp, const char* url)
{
   json_t* obj = json_object();
   int statusCode {MHD_HTTP_OK};
   std::vector<std::string> files;

   if (checkConnection() != success)
      statusCode = buildResponse(obj, MHD_HTTP_SERVICE_UNAVAILABLE, "Lost database connection, retry later");
   else if (!hasRights(url, obj, statusCode))
      ;
   else if (recordingFiles(tcp, files, obj) != success)
      statusCode = MHD_HTTP_NOT_FOUND;

   if (statusCode != MHD_HTTP_OK)
   {
      char* text = json_dumps(obj, 0);
      MHD_Response* response = MHD_create_response_from_buffer(strlen(text), text, MHD_RESPMEM_MUST_FREE);
      MHD_add_response_header(response, "Content-Type", "application/json; charset=utf-8");
      MHD_Result res = MHD_queue_response(tcp, statusCode, response);
      MHD_destroy_response(response);
      json_decref(obj);
      return res;
   }

   json_decref(obj);

   int start = std::max(0, getIntParameter(tcp, "start", 0));
   std::string input = "concat:";

   for (size_t i = 0; i < files.size(); i++)
      input += (i ? "|" : "") + files[i];

   std::string ss = std::to_string(start);

   // transcode=0: copy the video (progressive H.264)
   // transcode=1: deinterlace (yadif, one frame per frame, only frames flagged as interlaced)
   //              and encode (libx264, a key frame every 2 seconds -> short fragments)

   int transcode = getIntParameter(tcp, "transcode", 0);

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
                             "-f", "mp4", "-movflags", "frag_keyframe+empty_moov+default_base_moof",
                             "pipe:1", nullptr });

   int pfd[2];

   if (pipe2(pfd, O_CLOEXEC) < 0)
   {
      tell(0, "Error: Can't create pipe for recording stream, %s", strerror(errno));
      return MHD_NO;
   }

   pid_t pid = fork();

   if (pid < 0)
   {
      tell(0, "Error: Can't fork ffmpeg, %s", strerror(errno));
      close(pfd[0]);
      close(pfd[1]);
      return MHD_NO;
   }

   if (pid == 0)
   {
      // child: stdout -> pipe, close all other descriptors (sockets of epghttpd)

      dup2(pfd[1], STDOUT_FILENO);
      int devNull = open("/dev/null", O_RDONLY);
      dup2(devNull, STDIN_FILENO);
      close_range(3, ~0U, 0);
      execvp("ffmpeg", (char* const*)argv.data());
      _exit(127);
   }

   close(pfd[1]);
   fcntl(pfd[0], F_SETPIPE_SZ, 1024*1024);

   tell(eloInfo, "Streaming recording '%s' from %d seconds (ffmpeg pid %d, %zu files, %s)",
        files[0].c_str(), start, pid, files.size(), transcode ? "deinterlace + encode" : "copy");

   RecStream* s = new RecStream;
   s->pid = pid;
   s->fd = pfd[0];

   MHD_Response* response = MHD_create_response_from_callback(MHD_SIZE_UNKNOWN, 64*1024,
                                                              &recStreamRead, s, &recStreamFree);
   MHD_add_response_header(response, "Content-Type", "video/mp4");
   MHD_add_response_header(response, "Cache-Control", "no-store");

   MHD_Result res = MHD_queue_response(tcp, MHD_HTTP_OK, response);
   MHD_destroy_response(response);

   return res;
}
