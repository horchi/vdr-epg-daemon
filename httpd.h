/*
 * httpd.h
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#ifndef __EPG_HTTPD_H
#define __EPG_HTTPD_H

#include <sys/types.h>
#include <arpa/inet.h>

#include <stdio.h>            // before microhttpd.h
#include <stdint.h>           // for old microhttpd.h versions

#include <microhttpd.h>

#include "lib/epgservice.h"
#include "lib/json.h"
#include "lib/configuration.h"
#include "lib/searchtimer.h"

#include "epgdconfig.h"

#include "HISTORY.h"

#define confDirDefault "/etc/epgd"
#define EPGDNAME "epgd"

extern const char* confDir;

/*
enum mediaType
{
   mtBanner1,       // 0
   mtBanner2,       // 1
   mtBanner3,       // 2
   mtPoster1,       // 3
   mtPoster2,       // 4
   mtPoster3,       // 5
   mtSeasonPoster,  // 6
   mtFanart1,       // 7
   mtFanart2,       // 8
   mtFanart3,       // 9
   mtEpisodePic,    // 10
   mtActorThumb     // 11
};
*/

//***************************************************************************
// Http Tools
//***************************************************************************

class cWebTools
{
   public:

      static int loadFromFs(MemoryStruct* data, const char* filename, const char* subPath);
      static time_t getModTimeOf(const char* filename, const char* subPath);
      static int getIntParameter(MHD_Connection* tcp, const char* name, int def = 0);
      static const char* getStrParameter(MHD_Connection* tcp, const char* name, const char* def = 0);
      static const char* getStrHeader(MHD_Connection* tcp, const char* name, const char* def = 0);
      static time_t getTimeHeader(MHD_Connection* tcp, const char* name, const char* def = 0);

      static MHD_Response* createHttpResponse(MemoryStruct* data);
      static int addHeaderItem(MHD_Response* response, const char* name, const char* value);
};

//***************************************************************************
// EPG Http Daemon
//***************************************************************************

class cEpgHttpd : public cFrame, public cWebTools, public cSystemNotification
{
   public:

      struct Session
      {
         std::string id;    // session id
         std::string user;
         int rights;
         time_t start;
         time_t last;  // last activity
      };

      struct UserRight
      {
         const char* url;
         unsigned int mask;
      };

      cEpgHttpd();
      ~cEpgHttpd();

      int init();
      int exit();
      int initDb();
      int exitDb();
      int checkConnection();
      int setSession(const char* sessionId);
      int hasRights(const char* url, json_t* response, int& statusCode);
      int needLogin();

      int loop();
      int atConfigItem(const char* Name, const char* Value);

      int doShutDown()               { return shutdown; }

      static void downF(int signal)  { tell(0, "Shutdown triggered with signal %d", signal); shutdown = yes; }

   protected:

      //

      int dbConnected(int force = no) { return connection && (!force || connection->check() == success); }

      // dispatcher

      int performHttpGet(MHD_Connection* connection, const char* inurl, MemoryStruct* data);
      int performDataRequest(MHD_Connection* connection, const char* url, MemoryStruct* data);
      int performPostData(const char* url, MemoryStruct* data);

      //

      int collectScraperData(json_t* oScraperData, int movieId, int seriesId, int episodeId);

      // action requests

      int doChannelSwitch(MHD_Connection* tcp, json_t* obj);
      int doUpdateSearchtimer(MHD_Connection* tcp, json_t* obj);
      int doUpdateRecordingTable(MHD_Connection* tcp, json_t* obj);
      int doWakeupVdr(MHD_Connection* tcp, json_t* obj);

      int doRenameRecording(MHD_Connection* tcp, json_t* obj);
      int doReplayRecording(MHD_Connection* tcp, json_t* obj);
      int doDeleteRecording(MHD_Connection* tcp, json_t* obj);
      int doHitKey(MHD_Connection* tcp, json_t* obj);

      // post requests

      int storeChannels(json_t* jobj, json_t* obj);
      int deleteTimerJobs(json_t* jInData, json_t* response);
      int deleteDoneTimers(json_t* jInData, json_t* response);
      int storeTimerJob(json_t* jobj, json_t* obj);
      int storeSearchTimer(json_t* jobj, json_t* obj);
      int storeParameters(json_t* jInData, json_t* response);
      int doSearch(json_t* jInData, json_t* response);
      int doSendMail(json_t* jInData, json_t* response);
      int doLogin(json_t* jInData, json_t* response);
      int storeUsers(json_t* jInData, json_t* response);
      int markMessages(json_t* jInData, json_t* response);

      // tools

      int modifyCreateTimer(cDbRow* timerRow);

      // query requests

      int doEvents(MHD_Connection* connection, json_t* obj);
      int doEvent(MHD_Connection* connection, json_t* obj, MemoryStruct* data);
      int doTimers(MHD_Connection* connection, json_t* obj);
      int doRecordings(MHD_Connection* connection, json_t* obj);
      int doRecording(MHD_Connection* connection, json_t* obj);
      int doParameters(MHD_Connection* tcp, json_t* obj);
      int doRecDirs(MHD_Connection* connection, json_t* obj);
      int doTimerJobs(MHD_Connection* tcp, json_t* obj);
      int doMessages(MHD_Connection* tcp, json_t* obj);
      int doDoneTimers(MHD_Connection* tcp, json_t* obj);
      int doDoneTimer(MHD_Connection* tcp, json_t* obj);
      int doSearchtimers(MHD_Connection* tcp, json_t* obj);
      int doEpgImage(MHD_Connection* connection, json_t* obj, MemoryStruct* data);
      int doChannelLogo(MHD_Connection* connection, json_t* obj, MemoryStruct* data);
      int doMovieMedia(MHD_Connection* connection, json_t* obj, MemoryStruct* data);
      int doSeriesMedia(MHD_Connection* connection, json_t* obj, MemoryStruct* data);
      int doGenres(MHD_Connection* connection, json_t* obj);
      int doCategories(MHD_Connection* connection, json_t* obj);
      int doChannels(MHD_Connection* connection, json_t* obj);
      int doVdrs(MHD_Connection* connection, json_t* obj);
      int doUsers(MHD_Connection* connection, json_t* obj);
      int doProxy(MHD_Connection* tcp, json_t* obj, MemoryStruct* data);
      int doLog(MHD_Connection* tcp, json_t* obj);
      int doDebug(MHD_Connection* tcp, json_t* obj);

      // helper ..

      int __attribute__ ((format(printf, 4, 5)))  buildResponse(json_t* obj, int state, const char* format, ...);
      int __attribute__ ((format(printf, 5, 6)))  message(int level, char type, const char* title, const char* format, ...);

      const char* methodOf(const char* url);
      int ipOfVdr(const char* uuid, const char*& ip, int& port);
      int triggerVdrs(const char* trg, const char* plug = 0, const char* options = 0);
      int triggerVdr(const char* ip, unsigned int port, const char* trg,
                     const char* plug = 0, const char* options = 0, char* res = 0);

      int triggerEpgd();
      int wakeupVdr(const char* uuid);

      // static

      static int dispatcher(void* cls, struct MHD_Connection* connection,
                            const char* url, const char* method,
                            const char* version, const char* upload_data,
                            size_t* upload_data_size, void** con_cls);

      static int askForAuthentication(struct MHD_Connection* connection, const char* realm);
      static int isAuthenticated(struct MHD_Connection* connection,
                                 const char* username, const char* password);

      // data

      MHD_Daemon* daemon;
      MemoryStruct keyPem;
      MemoryStruct certPem;

      std::map<std::string,Session> sessions;
      Session* currentSession;
      int loginWithSession;
      time_t lastSdWatchdogAt;

      int withutf8;
      cSearchTimer* search;
      Python* ptyRecName;

      // database stuff

      cDbConnection* connection;
      cDbTable* useeventsDb;
      cDbTable* mapDb;
      cDbTable* imageDb;
      cDbTable* imageRefDb;
      cDbTable* vdrDb;
      cDbTable* timerDb;
      cDbTable* timersDoneDb;
      cDbTable* searchtimerDb;
      cDbTable* movieDb;
      cDbTable* movieActorsDb;
      cDbTable* movieActorDb;
      cDbTable* movieMediaDb;
      cDbTable* seriesDb;
      cDbTable* seriesEpisodeDb;
      cDbTable* seriesMediaDb;
      cDbTable* seriesActorsDb;
      cDbTable* recordingDirDb;
      cDbTable* recordingListDb;
      cDbTable* userDb;
      cDbTable* messageDb;

      cDbStatement* updateMap;
      cDbStatement* updateTimerAName;
      cDbStatement* updateDoneAName;
      cDbStatement* selectEventsAt;
      cDbStatement* selectEventsNext;
      cDbStatement* selectEventsStartInRange;
      cDbStatement* selectGenres;
      cDbStatement* selectCategories;
      cDbStatement* selectEvent;
      cDbStatement* selectEventByTime;
      cDbStatement* selectAllMap;
      cDbStatement* selectMapById;
      cDbStatement* selectVdrs;
      cDbStatement* selectUsers;
      cDbStatement* selectAllTimer;
      cDbStatement* selectTimerById;
      cDbStatement* selectTimerByEventId;
      cDbStatement* selectAllSearchTimer;
      cDbStatement* selectPendingTimerActions;
      cDbStatement* selectDoneTimers;
      cDbStatement* selectMovie;
      cDbStatement* selectMovieActors;
      cDbStatement* selectMovieMedia;
      cDbStatement* selectSerie;
      cDbStatement* selectSeriesEpisode;
      cDbStatement* selectSeriesMedia;
      cDbStatement* selectActiveVdrs;
      cDbStatement* selectRecordingDirs;
      cDbStatement* selectRecordingByPath;
      cDbStatement* selectChannelFromMap;
      cDbStatement* selectUserByMd5;
      cDbStatement* selectAllRecordings;
      cDbStatement* selectRecordingForEventByLv;
      cDbStatement* selectPendingMessages;
      cDbStatement* selectWebUsers;

      // special values for statements

      cDbValue endTime;
      cDbValue startTime;
      cDbValue imageSize;
      cDbValue merge;
      cDbValue imageid;
      cDbValue matchDensityTitle;
      cDbValue matchDensityShorttext;

      // just pointer to the values of cDbTable instances. Don't free them ;)

      cDbValue* vdrState;
      cDbValue* vdrIp;
      cDbValue* vdrSvdrp;
      cDbValue* vdrUuid;

      cDbValue* eventsUpdSp;
      cDbValue* eventsGenre;
      cDbValue* eventsCategory;

      cDbValue* mapChannelName;
      cDbValue* mapChannelId;
      cDbValue* mapSource;

      cDbValue* imagerefImgName;
      cDbValue* imageUpdSp;
      cDbValue* imageImage;

      cDbValue* moviemediaMediaContent;
      cDbValue* moviemediaMediaType;
      cDbValue* movieactorActorId;
      cDbValue* seriesepisodeSeasonNumber;
      cDbValue* seriesepisodeEpisodeId;

      cDbValue* seriesmediaMediaType;
      cDbValue* seriesmediaActorId;
      cDbValue* seriesmediaMediaContent;

      // static

      static int shutdown;
      static cEpgHttpd* singleton;
      static UserRight userrights[];

      UserMask toRightMask(const char* url);
};

//***************************************************************************
// cHttpService
//***************************************************************************

/*

class cHttpService
{
   public:

      cHttpService()
      {
         daemon = 0;
      }

      virtual int init()
      {
         if (!(daemon = MHD_start_daemon(MHD_USE_SELECT_INTERNALLY,
                                         EPG2VDRConfig.httpPort,
                                         0, 0,                        // accept policy callback
                                         &dispatcher, 0,              // access handler callback
                                         MHD_OPTION_END)))
         {
            tell(0, "Error: Start of http server failed '%s'", strerror(errno));
            return fail;
         }

         return success;
      }

      virtual int exit()
      {
         MHD_stop_daemon(daemon);
         daemon = 0;
         return success;
      }

   protected:

      static int dispatcher(void* cls, MHD_Connection* con,
                            const char* url, const char* method,
                            const char* version, const char* upload_data,
                            size_t* upload_data_size, void** con_cls);


      MHD_Daemon* daemon;
};
*/

//***************************************************************************
#endif // __EPG_HTTPD_H
