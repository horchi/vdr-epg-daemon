/*
 * epgd.h
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#ifndef __EPGD_H
#define __EPGD_H

#include <libxslt/transform.h>
#include <libxslt/xsltutils.h>
#include <libexslt/exslt.h>

#include <unistd.h>

#include <vector>

#include "lib/common.h"
#include "lib/db.h"
#include "lib/epgservice.h"
#include "lib/configuration.h"
#include "lib/searchtimer.h"

#include "epgdconfig.h"

#include "series.h"
#include "levenshtein.h"

#include "tvdbmanager.h"
#include "moviedbmanager.h"

#include "HISTORY.h"

#define confDirDefault "/etc/epgd"

extern const char* confDir;

//***************************************************************************
// Statistic
//***************************************************************************

struct Statistic
{
   int bytes;
   int files;
   int rejected;
   int nonUpdates;
};

class cEpgd;

//***************************************************************************
// Plugin
//***************************************************************************

class Plugin
{
   public:

      Plugin()          { obj = 0; utf8 = yes; }
      virtual ~Plugin() {}

      virtual int init(cEpgd* aObject, int aUtf8)
      {
         obj = aObject;
         utf8 = aUtf8;
         return success;
      }

      virtual int exit()   { return done; }
      virtual int initDb() { return done; }
      virtual int exitDb() { return done; }

      virtual int atConfigItem(const char* Name, const char* Value) = 0;
      virtual const char* getSource() = 0;
      virtual int hasSource(const char* source) { return strcmp(getSource(), source) == 0; }

      virtual int getPicture(const char* imagename, const char* fileRef, MemoryStruct* data) = 0;
      virtual int processDay(int day, int fullupdate, Statistic* stat) = 0;

      virtual int cleanupBefore()  { return done; }
      virtual int cleanupAfter()   { return done; }

      virtual int ready() = 0;

   protected:

      cEpgd* obj;
      int utf8;
};

//***************************************************************************
// Plugin Loader
//***************************************************************************

class PluginLoader
{
   public:

      PluginLoader(const char* name, Plugin* p = 0);
      virtual ~PluginLoader();

      int load();
      Plugin* getPlugin()    { return plugin; }

   private:

      char* fileName;
      void* handle;
      Plugin* plugin;
};

//***************************************************************************
// EPG Deamon
//***************************************************************************

class cEpgd : public cFrame, public cSystemNotification
{
   public:

      cEpgd();
      virtual ~cEpgd();

      // interface

      int init();
      int initUuid();
      void loop();
      void scheduleAutoUpdate(int wait = 0);
      int atConfigItem(const char* Name, const char* Value);
      int parseEvent(cDbRow* event, xmlNode* node);

      int dbConnected(int force = no)
      { return connection && connection->isConnected() && (!force || connection->check() == success); }

      // static stuff

      static void downF(int signal)     { tell(0, "Shutdown triggered with signal %d", signal); shutdown = yes; }
      static void triggerF(int aSignal);
      static int doShutDown()           { return shutdown; }

      int wakeupVdr(const char* uuid);
      int triggerVdrs(const char* trg, const char* plug = 0, const char* options = 0);
      int __attribute__ ((format(printf, 5, 6)))  message(int level, char type, const char* title, const char* format, ...);
      int sendTccMail(string& mailBody);
      int sendTccTestMail();

      xmlDocPtr transformXml(const char* buffer, int size, xsltStylesheetPtr stylesheet, const char* fileRef);
      int storeToFs(MemoryStruct* data, const char* filename, const char* subPath);
      int loadFromFs(MemoryStruct* data, const char* filename, const char* subPath);
      int downloadFile(const char* url, int& size, MemoryStruct* data, int timeout = 30, const char* userAgent = "libcurl-agent/1.0");

      // public for plugins access

      cDbConnection* connection;

      cDbTable* eventsDb;
      cDbTable* useeventsDb;
      cDbTable* compDb;
      cDbTable* fileDb;
      cDbTable* imageDb;
      cDbTable* imageRefDb;
      cDbTable* episodeDb;
      cDbTable* mapDb;
      cDbTable* vdrDb;
      cDbTable* parameterDb;
      cDbTable* recordingListDb;
      cDbTable* timerDb;
      cDbTable* messageDb;

      cDbStatement* selectAllMap;
      cDbStatement* selectByCompTitle;
      cDbStatement* selectMaxUpdSp;
      cDbStatement* selectDistCompname;
      cDbStatement* selectByCompName;
      cDbStatement* selectByCompNames;
      cDbStatement* updateEpisodeAtEvents;
      cDbStatement* updateScrReference;
      cDbStatement* selectMaxMapOrd;
      cDbStatement* selectMapOrdOf;
      cDbStatement* countDvbChanges;
      cDbStatement* selectNewRecordings;
      cDbStatement* countNewRecordings;
      cDbStatement* selectRecordingEvent;
      cDbStatement* selectRecOtherClient;
      cDbStatement* selectActiveVdrs;
      cDbStatement* selectWebUsers;
      cDbStatement* cleanupTimerActions;
      cDbStatement* selectNotAssumedTimers;

      cDbValue changeCount;
      cDbValue newRecCount;

      cDbProcedure* procMergeEpg;
      cDbProcedure* procUser;

   private:

      // functions

      int initDb();
      int exitDb();
      int migrateFromDbApi4();
      int tryFillEmptyRecTableFields();
      int checkProcedure(const char* name, cDBS::ProcType type, cDbProcedure* fp = 0);
      int checkView(const char* name, const char* file);
      int registerMe();

      int loadPlugins();
      int initPlugins();
      int initPluginDb();
      int exitPluginDb();

      void setState(cEpgdState::State state, time_t lastUpdate = 0, int silent = no);

      int loadChannelmap();
      int updateMapRow(char* extid, const char* source, const char* chan, int merge, int vps);
      int applyChannelmapChanges();
      int checkConnection();

      // work

      int update();
      int cleanupEvents();
      int cleanupPictures();
      int getPictures();
      int storeImageRefs(tEventId evtId, const char* source, const char* images,
                         const char* ext, const char* fileref);
      int scrapNewEvents();
      int cleanupSeriesAndMovies();
      void scrapNewRecordings(int count);

      int updateSearchTimers(int force = yes, const char* reason = "");

      // plugin interface

      int cleanupBefore();
      int cleanupAfter();
      int getPicture(const char* source, const char* imagename,
                     const char* fileRef, MemoryStruct* data);
      int processDay(int day, int fullupdate, Statistic* stat);

      // series

      int evaluateEpisodes();
      int downloadEpisodes();

      // scraper stuff

      int initScrapers();
      void exitScrapers();
      bool checkEventsForRecording(int eventId, string channelId, int &seriesId, int &episodeId, int &movieId);
      bool checkRecOtherClients(string uuid, string recPath, int recStart);

      // data

      int withutf8;

      time_t nextUpdateAt;
      time_t lastUpdateAt;
      time_t lastMergeAt;

      int fullupdate;
      int fullreload;

      static int shutdown;
      static int epgTrigger;
      static int searchTimerTrigger;
      static int recTableFixTrigger;

      std::vector<PluginLoader*> plugins;

      cTVDBManager* tvdbManager;
      cMovieDBManager* movieDbManager;
      cSearchTimer* search;
};

//***************************************************************************
#endif //__EPGD_H
