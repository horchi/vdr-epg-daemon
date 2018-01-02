/*
 * update.c
 *
 * See the README file for copyright information
 *
 */

#include <dirent.h>
#include <unistd.h>

#include <locale.h>
#include <stdio.h>
#include <signal.h>

#include "lib/curl.h"
#include "lib/searchtimer.h"
#include "lib/wol.h"

#include "epgd.h"

//***************************************************************************
// Class cEpgd
//***************************************************************************

int cEpgd::shutdown = no;
int cEpgd::epgTrigger = no;
int cEpgd::searchTimerTrigger = no;
int cEpgd::recTableFixTrigger = no;

//***************************************************************************
// Signal Handler
//***************************************************************************

void cEpgd::triggerF(int aSignal)
{
   if (aSignal == SIGHUP)
      epgTrigger = yes;

   else if (aSignal == SIGUSR1)
      searchTimerTrigger = yes;

   else if (aSignal == SIGUSR2)
      recTableFixTrigger = yes;
}

//***************************************************************************
// Class Update
//***************************************************************************

cEpgd::cEpgd()
{
   const char* lang;

   selectAllMap = 0;
   selectByCompTitle = 0;
   selectMaxUpdSp = 0;
   selectDistCompname = 0;
   selectByCompName = 0;
   selectByCompNames = 0;
   selectMaxMapOrd = 0;
   selectMapOrdOf = 0;
   updateEpisodeAtEvents = 0;
   updateScrReference = 0;
   selectNewRecordings = 0;
   countNewRecordings = 0;
   selectRecordingEvent = 0;
   selectRecOtherClient = 0;
   countDvbChanges = 0;
   selectActiveVdrs = 0;
   selectWebUsers = 0;
   cleanupTimerActions = 0;
   selectNotAssumedTimers = 0;

   procMergeEpg = 0;
   procUser = 0;

   connection = 0;

   vdrDb = 0;
   eventsDb = 0;
   useeventsDb = 0;
   fileDb = 0;
   imageRefDb = 0;
   imageDb = 0;
   episodeDb = 0;
   mapDb = 0;
   compDb = 0;
   parameterDb = 0;
   recordingListDb = 0;
   timerDb = 0;
   messageDb = 0;

   // thread / update control

   connection = 0;
   fullupdate = no;
   fullreload = no;
   nextUpdateAt = time(0) + 10;
   lastUpdateAt = 0;
   lastMergeAt = 0;

   // search timer

   search = new cSearchTimer((cFrame*)this);

   // ..

   xmlSubstituteEntitiesDefault(1);
   xmlLoadExtDtdDefaultValue = 1;
   withutf8 = no;

   // scraper stuff

   tvdbManager = 0;
   movieDbManager = 0;

   // create global cCurl instance

   cCurl::create();
   curl.init(EpgdConfig.proxy);
   curl.setSystemNotification(this);

   // registers all available EXSLT extensions (libexslt API)

   exsltRegisterAll();

   // set a locale to "" means 'reset it to the environment'
   // as defined by the ISO-C standard the locales after start are C

   setlocale(LC_CTYPE, "");
   lang = setlocale(LC_CTYPE, 0);  // 0 for query the setting

   if (lang)
   {
      tell(0, "Set locale to '%s'", lang);

      if ((strcasestr(lang, "UTF-8") != 0) || (strcasestr(lang, "UTF8") != 0))
      {
         tell(2, "detected UTF-8");
         withutf8 = yes;
      }
   }
   else
   {
      tell(0, "Info: Detecting locale setting for LC_CTYPE failed");
   }
}

cEpgd::~cEpgd()
{
   cSystemNotification::notify(evStopping);

   xsltCleanupGlobals();
   xmlCleanupParser();

   exitDb();

   delete search;

   cDbConnection::exit();

   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
      delete *it;

   plugins.clear();

   // destroy global cCurl instance

   curl.exit();
   cCurl::destroy();
}

//***************************************************************************
// Init
//***************************************************************************

int cEpgd::init()
{
   char* dictPath = 0;
   int status;

   // register at systems 'init' service

   cSystemNotification::notify(evReady);
   cSystemNotification::getWatchdogState(10);

   // first - prepare my uuid

   initUuid();

   // initialize the dictionary

   asprintf(&dictPath, "%s/epg.dat", confDir);
   dbDict.setFilterFromNameFct(toFieldFilter);

   if (dbDict.in(dictPath, ffEpgd) != success)
   {
      tell(0, "Fatal: Dictionary not loaded, aborting!");
      return 1;
   }

   tell(0, "Dictionary '%s' loaded", dictPath);
   free(dictPath);

   if (search->init(confDir) != success)
      return fail;

   // load plugins

   loadPlugins();

   // read configuration ..

   if (readConfig() != success)
      return fail;

   tell(0, "Using syslog facility '%s' (%d), log level set to (%d)",
        Syslog::toName(EpgdConfig.logFacility), EpgdConfig.logFacility, EpgdConfig.loglevel);

   // init database ...

   cDbConnection::init();
   cDbConnection::setEncoding(withutf8 ? "utf8": "latin1"); // mysql uses latin1 for ISO8851-1
   cDbConnection::setHost(EpgdConfig.dbHost);
   cDbConnection::setPort(EpgdConfig.dbPort);
   cDbConnection::setName(EpgdConfig.dbName);
   cDbConnection::setUser(EpgdConfig.dbUser);
   cDbConnection::setPass(EpgdConfig.dbPass);
   cDbConnection::setConfPath(confDir);

   // cDbStatement::explain = EpgdConfig.loglevel >= 4;

   chkDir(EpgdConfig.cachePath);

   initPlugins();

   // open tables ..

   if ((status = initDb()) != success)
   {
      exitDb();

      // abort on fatal errors like configuration, dictionary, ...

      if (status == abrt)
         return status;
   }

   // sendTccTestMail();

   return success;
}

//***************************************************************************
// Init Uuid
//***************************************************************************

int cEpgd::initUuid()
{
   MemoryStruct data;
   char* uuidFile;

   asprintf(&uuidFile, "%s/uuid", confDir);

   if (fileExists(uuidFile))
   {
      if (loadFromFile(uuidFile, &data) == success)
      {
         memset(EpgdConfig.uuid, 0, sizeof(EpgdConfig.uuid));
         memcpy(EpgdConfig.uuid, data.memory, min(data.size, sizeof(EpgdConfig.uuid)));
         tell(1, "Loading uuid from '%s' succeeded [%s]", uuidFile, EpgdConfig.uuid);
      }
      else
      {
         tell(0, "Error: Load of uuid from '%s' failed, using '<unknown>' instead", uuidFile);
         sstrcpy(EpgdConfig.uuid, "<unknown>", sizeof(EpgdConfig.uuid));
      }
   }
   else
   {
      tell(1, "Initially creating uuid, storing to '%s'", uuidFile);
      sstrcpy(EpgdConfig.uuid, getUniqueId(), sizeof(EpgdConfig.uuid));
      storeToFile(uuidFile, EpgdConfig.uuid, strlen(EpgdConfig.uuid));
   }

   free(uuidFile);

   return done;
}

//***************************************************************************
// Configuration
//***************************************************************************

int cEpgd::atConfigItem(const char* Name, const char* Value)
{
   char* par;
   char* plug = strdup(Name);

   // config for plugin ?

   if ((par = strchr(plug, '.')))
   {
      vector<PluginLoader*>::iterator it;

      *par++ = 0;

      for (it = plugins.begin(); it < plugins.end(); it++)
      {
         Plugin* p = (*it)->getPlugin();

         if (p->hasSource(plug))
         {
            int status = p->atConfigItem(par, Value);
            free(plug);
            return status;
         }
      }

      free(plug);

      return success;
   }

   free(plug);

   // Parse setup parameters and store values.

   if      (!strcasecmp(Name, "DbHost"))             sstrcpy(EpgdConfig.dbHost, Value, sizeof(EpgdConfig.dbHost));
   else if (!strcasecmp(Name, "DbPort"))             EpgdConfig.dbPort = atoi(Value);
   else if (!strcasecmp(Name, "DbName"))             sstrcpy(EpgdConfig.dbName, Value, sizeof(EpgdConfig.dbName));
   else if (!strcasecmp(Name, "DbUser"))             sstrcpy(EpgdConfig.dbUser, Value, sizeof(EpgdConfig.dbUser));
   else if (!strcasecmp(Name, "DbPass"))             sstrcpy(EpgdConfig.dbPass, Value, sizeof(EpgdConfig.dbPass));

   else if (!strcasecmp(Name, "EpgView"))            sstrcpy(EpgdConfig.epgView, Value, sizeof(EpgdConfig.epgView));
   else if (!strcasecmp(Name, "EpgViewWeb"))         sstrcpy(EpgdConfig.epgViewWeb, Value, sizeof(EpgdConfig.epgViewWeb));
   else if (!strcasecmp(Name, "TheTvDBView"))        sstrcpy(EpgdConfig.theTvDBView, Value, sizeof(EpgdConfig.theTvDBView));

   else if (!strcasecmp(Name, "CheckInitial"))       EpgdConfig.checkInitial = atoi(Value);
   else if (!strcasecmp(Name, "DaysInAdvance"))      EpgdConfig.days = atoi(Value);
   else if (!strcasecmp(Name, "DaysToUpdate"))       EpgdConfig.upddays = atoi(Value);
   else if (!strcasecmp(Name, "UpdateTime"))         EpgdConfig.updatetime = atoi(Value);
   else if (!strcasecmp(Name, "XmlStoreToFs"))       EpgdConfig.storeXmlToFs = atoi(Value);
   else if (!strcasecmp(Name, "UpdateThreshold"))    EpgdConfig.updateThreshold = atoi(Value);

   else if (!strcasecmp(Name, "GetEPGImages"))       EpgdConfig.getepgimages = atoi(Value);
   else if (!strcasecmp(Name, "MaxImagesPerEvent"))  EpgdConfig.maximagesperevent = atoi(Value);
   else if (!strcasecmp(Name, "EpgImageSize"))       EpgdConfig.epgImageSize = atoi(Value);

   else if (!strcasecmp(Name, "SeriesUrl") || !strcasecmp(Name, "SeriesHost"))
   {
      if (const char* p = strstr(Value, "://"))
         sstrcpy(EpgdConfig.seriesUrl, p+3, sizeof(EpgdConfig.seriesUrl));
      else
         sstrcpy(EpgdConfig.seriesUrl, Value, sizeof(EpgdConfig.seriesUrl));
   }

   else if (!strcasecmp(Name, "SeriesMail"))         sstrcpy(EpgdConfig.seriesMail, Value, sizeof(EpgdConfig.seriesMail));
   else if (!strcasecmp(Name, "SeriesEnabled"))      EpgdConfig.seriesEnabled = atoi(Value);
   else if (!strcasecmp(Name, "SeriesPort"))         EpgdConfig.seriesPort = atoi(Value);
   else if (!strcasecmp(Name, "SeriesStoreToFs"))    EpgdConfig.storeSeriesToFs = atoi(Value);

   else if (!strcasecmp(Name, "CachePath"))          sstrcpy(EpgdConfig.cachePath, Value, sizeof(EpgdConfig.cachePath));

   else if (!strcasecmp(Name, "HTTPProxy"))          sstrcpy(EpgdConfig.proxy, Value, sizeof(EpgdConfig.proxy));
   else if (!strcasecmp(Name, "UserName"))           sstrcpy(EpgdConfig.proxyuser, Value, sizeof(EpgdConfig.proxyuser));
   else if (!strcasecmp(Name, "Password"))           sstrcpy(EpgdConfig.proxypwd, Value, sizeof(EpgdConfig.proxypwd));

   else if (!strcasecmp(Name, "ScrapEpg"))           EpgdConfig.scrapEpg = atoi(Value);
   else if (!strcasecmp(Name, "ScrapRecordings"))    EpgdConfig.scrapRecordings = atoi(Value);
   else if (!strcasecmp(Name, "ScrapMovieDbApiKey")) sstrcpy(EpgdConfig.scrapMovieDbApiKey, Value, sizeof(EpgdConfig.scrapMovieDbApiKey));

   else if (!strcasecmp(Name, "NetDevice"))          sstrcpy(EpgdConfig.netDevice, Value, sizeof(EpgdConfig.netDevice));
   else if (!strcasecmp(Name, "HttpDevice"))         sstrcpy(EpgdConfig.httpDevice, Value, sizeof(EpgdConfig.httpDevice));
   else if (!strcasecmp(Name, "HttpPort"))           EpgdConfig.httpPort = atoi(Value);
   else if (!strcasecmp(Name, "HttpTls"))            EpgdConfig.httpUseTls = atoi(Value);
   else if (!strcasecmp(Name, "HttpUser"))           sstrcpy(EpgdConfig.httpUser, Value, sizeof(EpgdConfig.httpUser));
   else if (!strcasecmp(Name, "HttpPass"))           sstrcpy(EpgdConfig.httpPass, Value, sizeof(EpgdConfig.httpPass));

   else if (!strcasecmp(Name, "LogLevel"))           EpgdConfig.loglevel = EpgdConfig.argLoglevel == na ? atoi(Value) : EpgdConfig.argLoglevel;

   else
      return fail;

   return success;
}

//***************************************************************************
// Init/Exit Database Connections
//***************************************************************************

cDbFieldDef changeCountDef("CHG_COUNT", "count(1)", cDBS::ffUInt, 0, cDBS::ftData);

int cEpgd::initDb()
{
   int status = success;
   int count = 0;

   if (!connection)
      connection = new cDbConnection();

   // -------------------------

   static int initial = yes;

   if (initial)
   {
      // ------------------------------------------
      // initially create/alter tables and indices
      // ------------------------------------------

      tell(0, "Checking database connection ...");

      if (connection->attachConnection() != success)
      {
         tell(0, "Fatal: Initial database connect failed, aborting");
         return abrt;
      }

      std::map<std::string, cDbTableDef*>::iterator t;

      tell(0, "Checking table structure and indices ...");

      for (t = dbDict.getFirstTableIterator(); t != dbDict.getTableEndIterator(); t++)
      {
         cDbTable* table = new cDbTable(connection, t->first.c_str());

         tell(1, "Checking table '%s'", t->first.c_str());

         if (!table->exist())
         {
            if ((status += table->createTable()) != success)
               continue;
         }
         else
         {
            cSystemNotification::startNotifyThread(20*tmeSecondsPerMinute);
            status += table->validateStructure();
            cSystemNotification::stopNotifyThread();
         }

         status += table->createIndices();

         delete table;
      }

      connection->detachConnection();

      if (status != success)
         return abrt;

      tell(0, "Checking table structure and indices succeeded");
   }

   // ------------------------
   // create/open other tables
   // ------------------------

   vdrDb = new cDbTable(connection, "vdrs");
   if ((status = vdrDb->open()) != success) return status;

   if (initial)
   {
      if (!dbConnected())
         return fail;

      vdrDb->clear();
      vdrDb->setValue("UUID", "epgd");
      vdrDb->find();

      int lastApi = vdrDb->getIntValue("DBAPI");

      // migration some specials

      if (lastApi <= 4)
      {
         // we have to migrate the recording description

         if (migrateFromDbApi4() != success)
            return fail;
      }

      registerMe();   // and update DB_API info at vdrs table
      initial = no;
   }

   mapDb = new cDbTable(connection, "channelmap");
   if ((status = mapDb->open()) != success) return status;

   fileDb = new cDbTable(connection, "fileref");
   if ((status = fileDb->open()) != success) return status;

   imageDb = new cDbTable(connection, "images");
   if ((status = imageDb->open()) != success) return status;

   imageRefDb = new cDbTable(connection, "imagerefs");
   if ((status = imageRefDb->open()) != success) return status;

   episodeDb = new cDbTable(connection, "episodes");
   if ((status = episodeDb->open()) != success) return status;

   eventsDb = new cDbTable(connection, "events");
   if ((status = eventsDb->open() != success)) return status;

   useeventsDb = new cDbTable(connection, "useevents");
   if ((status = useeventsDb->open() != success)) return status;

   compDb = new cDbTable(connection, "components");
   if ((status = compDb->open()) != success) return status;

   parameterDb = new cDbTable(connection, "parameters");
   if ((status = parameterDb->open()) != success) return status;

   recordingListDb = new cDbTable(connection, "recordinglist");
   if ((status = recordingListDb->open()) != success) return status;

   timerDb = new cDbTable(connection, "timers");
   if ((status = timerDb->open() != success)) return status;

   messageDb = new cDbTable(connection, "messages");
   if (messageDb->open() != success) return fail;

   if ((status = cParameters::initDb(connection)) != success)
       return status;

   // ------------------------------------
   // check if epglv/epglvr are installed

   status += connection->query("%s", "select epglv('123', '123')");
   connection->queryReset();
   status += connection->query("%s", "select epglvr('123', '123')");
   connection->queryReset();

   if (status != success)
   {
      tell(0, "Error: Missing functions epglv/epglvr, please install first!");
      return abrt;
   }

   // ---------------------------
   // prepare statements
   // ---------------------------

   // --------------------
   // select max(ord) from channelmap

   selectMaxMapOrd = new cDbStatement(mapDb);

   selectMaxMapOrd->build("select ");
   selectMaxMapOrd->bind("ORDER", cDBS::bndOut, "max(");
   selectMaxMapOrd->build(") from %s", mapDb->TableName());

   status += selectMaxMapOrd->prepare();

   // --------------------
   // select ord from channelmap where
   //  channelid = ?

   selectMapOrdOf = new cDbStatement(mapDb);

   selectMapOrdOf->build("select ");
   selectMapOrdOf->bind("ORDER", cDBS::bndOut);
   selectMapOrdOf->bind("VISIBLE", cDBS::bndOut, ", ");
   selectMapOrdOf->build(" from %s where ", mapDb->TableName());
   selectMapOrdOf->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet);

   status += selectMapOrdOf->prepare();

   // ----------
   // select extid, source, updflg
   //   from channelmap

   selectAllMap = new cDbStatement(mapDb);

   selectAllMap->build("select ");
   selectAllMap->bind("EXTERNALID", cDBS::bndOut);
   selectAllMap->bind("CHANNELID", cDBS::bndOut, ", ");
   selectAllMap->bind("SOURCE", cDBS::bndOut, ", ");
   selectAllMap->bind("UPDFLG", cDBS::bndOut, ", ");
   selectAllMap->build(" from %s", mapDb->TableName());

   status += selectAllMap->prepare();

   // ----------
   // update useevents u, events e
   //    set
   //      u.sub_scrseriesid = e.scrseriesid,
   //      u.sub_scrseriesepisode = e.scrseriesepisode,
   //      u.sub_scrmovieid = e.scrmovieid,
   //      u.sub_scrsp = e.scrsp
   //    where
   //      e.masterid = u.cnt_useid and
   //      e.scrsp != ifnull(u.sub_scrsp, 0) and
   //      e.scrsp >= ?

   updateScrReference = new cDbStatement(useeventsDb);

   updateScrReference->build("update %s u, %s e set ", useeventsDb->TableName(), eventsDb->TableName());
   updateScrReference->build("u.%s = e.%s", useeventsDb->getField("SCRSERIESID")->getDbName(), eventsDb->getField("SCRSERIESID")->getDbName());
   updateScrReference->build(", u.%s = e.%s", useeventsDb->getField("SCRSERIESEPISODE")->getDbName(), eventsDb->getField("SCRSERIESEPISODE")->getDbName());
   updateScrReference->build(", u.%s = e.%s", useeventsDb->getField("SCRMOVIEID")->getDbName(), eventsDb->getField("SCRMOVIEID")->getDbName());
   updateScrReference->build(", u.%s = e.%s", useeventsDb->getField("SCRSP")->getDbName(), eventsDb->getField("SCRSP")->getDbName());
   updateScrReference->build(" where ");
   updateScrReference->build("e.%s = u.%s", eventsDb->getField("MASTERID")->getDbName(), useeventsDb->getField("USEID")->getDbName());
   updateScrReference->build(" and e.%s != ifnull(u.%s, 0)", eventsDb->getField("SCRSP")->getDbName(), useeventsDb->getField("SCRSP")->getDbName());
   updateScrReference->setBindPrefix("e.");
   updateScrReference->bindCmp(0, eventsDb->getValue("SCRSP"), ">=", " and ");

   status += updateScrReference->prepare();

   // ----------
   // update events set episodecompname = ?, episodecompshortname = ?, episodecomppartname = ?, episodelang = ?
   //     where eventid = ? and channelid = ?

   updateEpisodeAtEvents = new cDbStatement(eventsDb);

   updateEpisodeAtEvents->build("update %s set ", eventsDb->TableName());
   updateEpisodeAtEvents->bind("UPDSP", cDBS::bndIn | cDBS::bndSet);
   updateEpisodeAtEvents->bind("EPISODECOMPNAME", cDBS::bndIn | cDBS::bndSet, ", ");
   updateEpisodeAtEvents->bind("EPISODECOMPSHORTNAME", cDBS::bndIn | cDBS::bndSet, ", ");
   updateEpisodeAtEvents->bind("EPISODECOMPPARTNAME", cDBS::bndIn | cDBS::bndSet, ", ");
   updateEpisodeAtEvents->bind("EPISODELANG", cDBS::bndIn | cDBS::bndSet, ", ");
   updateEpisodeAtEvents->build(", %s = null", eventsDb->getField("SCRSERIESEPISODE")->getDbName());
   updateEpisodeAtEvents->build(", %s = null", eventsDb->getField("SCRSERIESID")->getDbName());
   updateEpisodeAtEvents->build(", %s = null", eventsDb->getField("SCRSP")->getDbName());
   updateEpisodeAtEvents->build(" where ");
   updateEpisodeAtEvents->bind("EVENTID", cDBS::bndIn | cDBS::bndSet);
   updateEpisodeAtEvents->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet, " and ");

   status += updateEpisodeAtEvents->prepare();

   // ----------
   // select eventid, compshorttext, episodecomppart, episodelang
   //   from events
   //     where comptitle = ?

   selectByCompTitle = new cDbStatement(eventsDb);

   selectByCompTitle->build("select ");
   selectByCompTitle->bind("EVENTID", cDBS::bndOut);
   selectByCompTitle->bind("CHANNELID", cDBS::bndOut, ", ");
   selectByCompTitle->bind("COMPSHORTTEXT", cDBS::bndOut, ", ");
   selectByCompTitle->bind("EPISODECOMPPARTNAME", cDBS::bndOut, ", ");
   selectByCompTitle->bind("EPISODELANG", cDBS::bndOut, ", ");
   selectByCompTitle->build(" from %s where ", eventsDb->TableName());
   selectByCompTitle->bind("COMPTITLE", cDBS::bndIn | cDBS::bndSet);

   status += selectByCompTitle->prepare();

   //---------------------
   // select count(1) from events
   //  where source = ?
   //    and updsp > ?

   changeCount.setField(&changeCountDef);

   countDvbChanges = new cDbStatement(eventsDb);

   countDvbChanges->build("select ");
   countDvbChanges->bind(&changeCount, cDBS::bndOut);
   countDvbChanges->build(" from %s where ", eventsDb->TableName());
   countDvbChanges->bind("Source", cDBS::bndIn | cDBS::bndSet);
   countDvbChanges->bindCmp(0, "UpdSp", 0, ">", " and ");

   status += countDvbChanges->prepare();

   // --------------------
   // select max(updsp) from episodes

   selectMaxUpdSp = new cDbStatement(episodeDb);

   selectMaxUpdSp->build("select ");
   selectMaxUpdSp->bind("UPDSP", cDBS::bndOut, "max(");
   selectMaxUpdSp->build(") from %s", episodeDb->TableName());

   status += selectMaxUpdSp->prepare();

   // --------------------
   // select distinct compname, compshortname from episodes

   selectDistCompname = new cDbStatement(episodeDb);

   selectDistCompname->build("select ");
   selectDistCompname->bind("COMPNAME", cDBS::bndOut, "distinct ");
   selectDistCompname->bind("COMPSHORTNAME", cDBS::bndOut, ", ");
   selectDistCompname->build(" from %s", episodeDb->TableName());

   status += selectDistCompname->prepare();

   // --------------------
   // select comppartname, lang
   //   from episodes
   //     where compname = ?

   selectByCompName = new cDbStatement(episodeDb);

   selectByCompName->build("select ");
   selectByCompName->bind("COMPPARTNAME", cDBS::bndOut);
   selectByCompName->bind("LANG", cDBS::bndOut, ", ");
   selectByCompName->build(" from %s where ", episodeDb->TableName());
   selectByCompName->bind("COMPNAME", cDBS::bndIn | cDBS::bndSet);

   status += selectByCompName->prepare();

   // --------------------
   // select episodename, partname, lang
   //   from episodes
   //     where compname = ? and comppartname = ?

   selectByCompNames = new cDbStatement(episodeDb);

   selectByCompNames->build("select ");
   selectByCompNames->bind("EPISODENAME", cDBS::bndOut);
   selectByCompNames->bind("PARTNAME", cDBS::bndOut, ", ");
   selectByCompNames->bind("LANG", cDBS::bndOut, ", ");
   selectByCompNames->build(" from %s where ", episodeDb->TableName());
   selectByCompNames->bind("COMPNAME", cDBS::bndIn | cDBS::bndSet);
   selectByCompNames->bind("COMPPARTNAME", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectByCompNames->prepare();

   // --------------------
   // select count(1)
   //   from recordinglist
   //     where scrnew = ?

   newRecCount.setField(&changeCountDef);

   countNewRecordings = new cDbStatement(recordingListDb);
   countNewRecordings->build("select ");
   countNewRecordings->bind(&newRecCount, cDBS::bndOut);
   countNewRecordings->build(" from %s where ", recordingListDb->TableName());
   countNewRecordings->bind("SCRNEW", cDBS::bndIn | cDBS::bndSet);

   status += countNewRecordings->prepare();

   // --------------------
   // select *
   //   from recordinglist
   //     where scrnew = ?

   selectNewRecordings = new cDbStatement(recordingListDb);
   selectNewRecordings->build("select ");
   selectNewRecordings->bindAllOut();
   selectNewRecordings->build(" from %s where ", recordingListDb->TableName());
   selectNewRecordings->bind("SCRNEW", cDBS::bndIn | cDBS::bndSet);

   status += selectNewRecordings->prepare();

   // --------------------
   // select scrseriesid, scrseriesepisode, scrmovieid
   //   from events
   //     where useid = ? and channelid = ? and (series_id is not null or movie_id is not null);

   selectRecordingEvent = new cDbStatement(eventsDb);
   selectRecordingEvent->build("select ");
   selectRecordingEvent->bind("ScrSeriesId", cDBS::bndOut);
   selectRecordingEvent->bind("ScrSeriesEpisode", cDBS::bndOut, ", ");
   selectRecordingEvent->bind("ScrMovieId", cDBS::bndOut, ", ");
   selectRecordingEvent->build(" from %s where ", eventsDb->TableName());
   selectRecordingEvent->bind("MasterId", cDBS::bndIn | cDBS::bndSet);
   selectRecordingEvent->bind("ChannelId", cDBS::bndIn | cDBS::bndSet, " and ");
   selectRecordingEvent->build(" and (%s is not null or %s is not null)", eventsDb->getField("ScrSeriesId")->getDbName(),
                               eventsDb->getField("ScrMovieId")->getDbName());

   status += selectRecordingEvent->prepare();

//    // --------------------
//    // select series_id, episode_id, movie_id
//    //   from recordings
//    //   where vdruuid != ?
//    //     and rec_path like ?
//    //     and rec_start = ?
//    //     and (series_id > 0 or movie_id > 0);

//    selectRecOtherClient = new cDbStatement(recordingsDb);
//    selectRecOtherClient->build("select ");
//    selectRecOtherClient->bind("SeriesId", cDBS::bndOut);
//    selectRecOtherClient->bind("EpisodeId", cDBS::bndOut, ", ");
//    selectRecOtherClient->bind("MovieId", cDBS::bndOut, ", ");
//    selectRecOtherClient->build(" from %s where ", recordingsDb->TableName());
//    selectRecOtherClient->bindCmp(0, "VDRUUID", 0, "!=");
//    selectRecOtherClient->bindCmp(0, "RecPath", 0, " like ", " and ");
//    selectRecOtherClient->bind("RecStart", cDBS::bndIn | cDBS::bndSet, " and ");
//    selectRecOtherClient->build(" and (%s > 0 or %s > 0)", recordingsDb->getField("SeriesId")->getDbName(),
//                                recordingsDb->getField("MovieId")->getDbName());

//    status += selectRecOtherClient->prepare();

   // --------------------
   // select scrseriesid, scrseriesepisode, scrmovieid
   //   from recordinglist
   //   where vdruuid != ?
   //     and path like ?
   //     and starttime = ?
   //     and (scrseriesid > 0 or scrmovieid > 0);

   selectRecOtherClient = new cDbStatement(recordingListDb);
   selectRecOtherClient->build("select ");
   selectRecOtherClient->bind("SCRSERIESID", cDBS::bndOut);
   selectRecOtherClient->bind("SCRSERIESEPISODE", cDBS::bndOut, ", ");
   selectRecOtherClient->bind("SCRMOVIEID", cDBS::bndOut, ", ");
   selectRecOtherClient->build(" from %s where ", recordingListDb->TableName());
   selectRecOtherClient->bindCmp(0, "VDRUUID", 0, "!=");
   selectRecOtherClient->bindCmp(0, "PATH", 0, " like ", " and ");
   selectRecOtherClient->bind("STARTTIME", cDBS::bndIn | cDBS::bndSet, " and ");
   selectRecOtherClient->build(" and (%s > 0 or %s > 0)",
                               recordingListDb->getField("SCRSERIESID")->getDbName(),
                               recordingListDb->getField("SCRMOVIEID")->getDbName());

   status += selectRecOtherClient->prepare();

   // ----------
   // select ip, svdrp from vdrs
   //   where state = 'attached'

   selectActiveVdrs = new cDbStatement(vdrDb);

   selectActiveVdrs->build("select ");
   selectActiveVdrs->bind("IP", cDBS::bndOut);
   selectActiveVdrs->bind("SVDRP", cDBS::bndOut, ", ");
   selectActiveVdrs->bind("OSD2WEBP", cDBS::bndOut, ", ");
   selectActiveVdrs->build(" from %s where state = 'attached' and svdrp > 0", vdrDb->TableName());

   status += selectActiveVdrs->prepare();

   // ----------
   // select distinct(owner) from parameters
   //   where owner like '@%';

   selectWebUsers = new cDbStatement(parameterDb);

   selectWebUsers->build("select distinct(");
   selectWebUsers->bind("OWNER", cDBS::bndOut);
   selectWebUsers->build(") from %s where %s like '@%%'",
                         parameterDb->TableName(),
                         parameterDb->getField("OWNER")->getDbName());

   status += selectWebUsers->prepare();

   // delete from timers where
   //  action = ?
   //  and updsp < ?

   cleanupTimerActions = new cDbStatement(timerDb);

   cleanupTimerActions->build("delete from %s where ", timerDb->TableName());
   cleanupTimerActions->bind("ACTION", cDBS::bndIn | cDBS::bndSet);
   cleanupTimerActions->bindCmp(0, "UPDSP", 0, "<", " and ");

   status += cleanupTimerActions->prepare();

   // select * from timers where
   //  action in (....)

   selectNotAssumedTimers = new cDbStatement(timerDb);

   selectNotAssumedTimers->build("select ");
   selectNotAssumedTimers->bindAllOut();
   selectNotAssumedTimers->build(" from %s where ", timerDb->TableName());
   selectNotAssumedTimers->build("%s in ('%c', '%c')",
                                 timerDb->getField("ACTION")->getDbName(),
                                 taCreate, taModify);

   status += selectNotAssumedTimers->prepare();

   // ----------

   if (status != success)
   {
      tell(0, "Error: At least %d statements not prepared successfully", status*-1);
      return status;
   }

   // --------------------
   // update Channel Map

   loadChannelmap();
   applyChannelmapChanges();

   initPluginDb();

   // --------------------------
   // procedures / views

   if (!status)
   {
      procMergeEpg = new cDbProcedure(connection, "mergeepg");
      status += checkProcedure("mergeepg", cDbProcedure::ptProcedure, procMergeEpg);

      status += checkProcedure("reverseepg", cDbProcedure::ptProcedure);
      status += checkProcedure("getupdflg", cDbProcedure::ptFunction);
      status += checkProcedure("getcrosslvr", cDbProcedure::ptFunction);
      status += checkProcedure("getlvrmin", cDbProcedure::ptFunction);

      // optional create user procedure ...

      if (cDbProcedure::existOnFs(confDir, "userexit"))
      {
         procUser = new cDbProcedure(connection, "userexit");
         status += checkProcedure("userexit", cDbProcedure::ptProcedure, procUser);
      }

      // ------------------
      // views ...

      status += checkView("eventsview", EpgdConfig.epgView);
      status += checkView("eventsviewplain", EpgdConfig.epgViewWeb);
      status += checkView("thetvdbview", EpgdConfig.theTvDBView);
   }

   // search timer stuff

   if (!status)
   {
      if ((status = search->initDb()) != success)
         return status;
   }

   // scraper stuff

   if (EpgdConfig.scrapEpg || EpgdConfig.scrapRecordings)
   {
      int res = initScrapers();

      // abort on fatal errors like configuration, dictionary, ...

      if (res == abrt)
         return res;

      status += res;
   }

   // force initial check on start with empty tables

   eventsDb->countWhere("source != 'vdr'", count);

   if (!count)
   {
      tell(0, "Info: No external events on database, force initial check!");
      EpgdConfig.checkInitial = yes;
   }

   // wakeupVdr("920654A9-28C8-439B-97F2-F6F3A7A2C583");

   // ----------------------------------------------------------
   // init parameter 'mergeStart' (used by merge procedure)
   //   reset it on empty useevents table

   useeventsDb->countWhere("", count);

   getParameter("epgd", "mergeStart");   // if not set -> init to default

   if (!count)
      setParameter("epgd", "mergeStart", 0L);

   // lookback

   getParameter("epgd", "lastMergeAt", lastMergeAt);

   // -----------------
   // Maintanance Mode

   if (status == success && EpgdConfig.maintanance)
   {
      time_t start = time(0);
      int count = 0;

      cDbStatement sel(eventsDb);
      sel.build("select ");
      sel.bind("EVENTID", cDBS::bndOut);
      sel.bind("CHANNELID", cDBS::bndOut, ", ");
      sel.bind("TITLE", cDBS::bndOut, ", ");
      sel.bind("SHORTTEXT", cDBS::bndOut, ", ");
      sel.build(" from events");
      sel.prepare();

      cDbStatement upd(eventsDb);
      upd.build("update events set ");
      upd.bind("COMPTITLE", cDBS::bndIn | cDBS::bndSet);
      upd.bind("COMPSHORTTEXT", cDBS::bndIn | cDBS::bndSet, ", ");
      upd.build(" where ");
      upd.bind("EVENTID", cDBS::bndIn | cDBS::bndSet);
      upd.bind("CHANNELID", cDBS::bndIn | cDBS::bndSet, " and ");
      upd.prepare();

      connection->startTransaction();

      for (int f = sel.find(); f; f = sel.fetch())
      {
         string comp;

         tell(0, "Update comp of %ld in 'Maintanance Mode'", eventsDb->getBigintValue("EVENTID"));

         if (!eventsDb->isNull("TITLE"))
         {
            comp = eventsDb->getStrValue("Title");
            prepareCompressed(comp);
            eventsDb->setValue("COMPTITLE", comp.c_str());
         }

         if (!eventsDb->isNull("SHORTTEXT"))
         {
            comp = eventsDb->getStrValue("SHORTTEXT");
            prepareCompressed(comp);
            eventsDb->setValue("COMPSHORTTEXT", comp.c_str());
         }

         upd.execute();
         count++;
      }

      connection->commit();

      tell(0, "Info: Updated %d events in %ld seconds", count, time(0) - start);
      upd.freeResult();
      sel.freeResult();
      exitDb();
      exit(1);
   }

   return status;
}

int cEpgd::exitDb()
{
   exitPluginDb();
   exitScrapers();

   search->exitDb();
   cParameters::exitDb();

   delete selectMaxMapOrd;           selectMaxMapOrd = 0;
   delete selectMapOrdOf;            selectMapOrdOf = 0;
   delete selectAllMap;              selectAllMap = 0;
   delete selectByCompTitle;         selectByCompTitle = 0;
   delete selectMaxUpdSp;            selectMaxUpdSp = 0;
   delete selectDistCompname;        selectDistCompname = 0;
   delete selectByCompName;          selectByCompName = 0;
   delete selectByCompNames;         selectByCompNames = 0;
   delete updateEpisodeAtEvents;     updateEpisodeAtEvents = 0;
   delete updateScrReference;        updateScrReference = 0;
   delete countDvbChanges;           countDvbChanges = 0;
   delete selectNewRecordings;       selectNewRecordings = 0;
   delete countNewRecordings;        countNewRecordings = 0;
   delete selectRecordingEvent;      selectRecordingEvent = 0;
   delete selectRecOtherClient;      selectRecOtherClient = 0;
   delete selectActiveVdrs;          selectActiveVdrs = 0;
   delete selectWebUsers;            selectWebUsers = 0;
   delete cleanupTimerActions;       cleanupTimerActions = 0;
   delete selectNotAssumedTimers;    selectNotAssumedTimers = 0;

   delete procMergeEpg;              procMergeEpg = 0;
   delete procUser;                  procUser = 0;

   delete eventsDb;                  eventsDb = 0;
   delete useeventsDb;               useeventsDb = 0;
   delete fileDb;                    fileDb = 0;
   delete imageRefDb;                imageRefDb = 0;
   delete imageDb;                   imageDb = 0;
   delete episodeDb;                 episodeDb = 0;
   delete mapDb;                     mapDb = 0;
   delete vdrDb;                     vdrDb = 0;
   delete compDb;                    compDb = 0;
   delete parameterDb;               parameterDb = 0;
   delete recordingListDb;           recordingListDb = 0;
   delete timerDb;                   timerDb = 0;
   delete messageDb;                 messageDb = 0;

   delete connection; connection = 0;

   return done;
}

//***************************************************************************
// migrateFromDbApi4
//***************************************************************************

int startWith(const char* buf, const char* token)
{
   return strncmp(buf, token, strlen(token)) == 0;
}

const char* endOf(const char* buf, const char* token)
{
   if (strncmp(buf, token, strlen(token)) == 0)
      return buf + strlen(token);
   return 0;
}

int cEpgd::migrateFromDbApi4()
{
   int status = success;

   recordingListDb = new cDbTable(connection, "recordinglist");
   if ((status = recordingListDb->open()) != success) return status;

   tell(0, "Migration of table '%s' from version <= 4 ...", recordingListDb->TableName());

   // we have to port the longdescription ito description
   //  and create a longdescription by best guess of it :o

   cDbStatement* select = new cDbStatement(recordingListDb);
   select->build("select ");
   select->bindAllOut();
   select->build(" from %s where %s is null", recordingListDb->TableName(),
                 recordingListDb->getField("DESCRIPTION")->getDbName());

   status += select->prepare();

   if (status == success)
   {
      for (int f = select->find(); f; f = select->fetch())
      {
         const char* longDesc = recordingListDb->getStrValue("LONGDESCRIPTION");
         recordingListDb->setValue("DESCRIPTION", longDesc);

         // try patching the 'description' created by the view to likely the real original event description

         const char* p = longDesc;

         while (true)
         {
            int toSkip = startWith(p, "Kategorie: ") ||
               startWith(p, "Genre: ") ||
               startWith(p, "Land: ") ||
               startWith(p, "Jahr: ") ||
               startWith(p, "Bewertung: ") ||
               startWith(p, "Thema: ") ||
               startWith(p, "Serie: ") ||
               startWith(p, "Quelle: ") ||
               startWith(p, "Audio: ") ||
               startWith(p, "Flags: ") ||
               startWith(p, "Originaltitel: ") ||
               startWith(p, "TagesTipp") ||
               startWith(p, "Tagestipp") ||
               startWith(p, "TopTipp") ||
               startWith(p, "Toptipp") ||
               startWith(p, "Tipp") ||
               startWith(p, "[") ||
               *p == '\n';

            if (!toSkip)
               break;

            if (!(p = strchr(p, '\n')) || !*(p++))
                break;
         }

         recordingListDb->setValue("LONGDESCRIPTION", p);
         recordingListDb->update();
      }
   }

   tell(0, "... done");

   delete select;
   delete recordingListDb; recordingListDb = 0;

   return status;
}

const char* getLine(const char* buf, const char* startChar = 0, const char* endChar = 0)
{
   static char line[100+TB];

   const char* p;
   int len = strlen(buf);

   if (startChar && strchr(buf, *startChar))
   {
      buf = strchr(buf, *startChar);
      len = strlen(buf);
   }

   if ((p = strchr(buf, '\n')))
      len = p - buf;

   if (endChar && (p = strchr(buf, *endChar)))
      len = p - buf;

   if (len > 100)
      len = 100;

   sprintf(line, "%.*s", len, buf);

   return line;
}

int cEpgd::tryFillEmptyRecTableFields()
{
   int status = success;

   recTableFixTrigger = no;

   tell(0, "tryFillEmptyRecTableFields ...");

   cDbStatement* select = new cDbStatement(recordingListDb);
   select->build("select ");
   select->bindAllOut();
   select->build(" from %s", recordingListDb->TableName());
   status += select->prepare();

   if (status == success)
   {
      for (int f = select->find(); f; f = select->fetch())
      {
         const char* description = recordingListDb->getStrValue("DESCRIPTION");
         const char* p = description;
         const char* s = 0;

         while (true)
         {
            if ((s = endOf(p, "Actor: ")) && recordingListDb->getValue("ACTOR")->isEmpty())
               recordingListDb->setValue("ACTOR", getLine(s));
            else if ((s = endOf(p, "Audio: ")) && recordingListDb->getValue("AUDIO")->isEmpty())
               recordingListDb->setValue("AUDIO", getLine(s));
            else if ((s = endOf(p, "Kategorie: ")) && recordingListDb->getValue("CATEGORY")->isEmpty())
               recordingListDb->setValue("CATEGORY", getLine(s));
            else if ((s = endOf(p, "Genre: ")) && recordingListDb->getValue("GENRE")->isEmpty())
               recordingListDb->setValue("GENRE", getLine(s));
            else if ((s = endOf(p, "Land: ")) && recordingListDb->getValue("COUNTRY")->isEmpty())
               recordingListDb->setValue("COUNTRY", getLine(s));
            else if ((s = endOf(p, "Jahr: ")) && recordingListDb->getValue("YEAR")->isEmpty())
            {
               recordingListDb->setValue("YEAR", getLine(s, 0, "["));

               // #TODO don't work
               //  Examples:  select flags, year, title, genre, category, description from recordinglist  where description like '%Jahr: 2014[%';
               if ((strchr(getLine(s, 0, "["), '[')) && recordingListDb->getValue("FLAGS")->isEmpty())
                  recordingListDb->setValue("FLAGS", getLine(s, "["));
            }
            else if ((s = endOf(p, "Flags: ")) && recordingListDb->getValue("FLAGS")->isEmpty())
               recordingListDb->setValue("FLAGS", getLine(s));
            else if ((s = endOf(p, "Kamera: ")) && recordingListDb->getValue("CAMERA")->isEmpty())
               recordingListDb->setValue("CAMERA", getLine(s));
            else if ((s = endOf(p, "Musik: ")) && recordingListDb->getValue("MUSIC")->isEmpty())
               recordingListDb->setValue("MUSIC", getLine(s));
            else if ((s = endOf(p, "TagesTipp")) && recordingListDb->getValue("TIPP")->isEmpty())
               recordingListDb->setValue("TIPP", "TagesTipp");
            else if ((s = endOf(p, "Tagestipp")) && recordingListDb->getValue("TIPP")->isEmpty())
               recordingListDb->setValue("TIPP", "TagesTipp");
            else if ((s = endOf(p, "TopTipp")) && recordingListDb->getValue("TIPP")->isEmpty())
               recordingListDb->setValue("TIPP", "TopTipp");
            else if ((s = endOf(p, "Toptipp")) && recordingListDb->getValue("TIPP")->isEmpty())
               recordingListDb->setValue("TIPP", "TopTipp");
            else if ((s = endOf(p, "Tipp")) && recordingListDb->getValue("TIPP")->isEmpty())
               recordingListDb->setValue("TIPP", "Tipp");
            else if ((s = endOf(p, "Bewertung: ")) && recordingListDb->getValue("RATING")->isEmpty())
               recordingListDb->setValue("RATING", getLine(s));

            if (!(p = strchr(p, '\n')) || !*(p++))
               break;
         }

         recordingListDb->update();
      }
   }

   tell(0, "... done");

   delete select;

   return status;
}

//***************************************************************************
// Check Function
//***************************************************************************

int cEpgd::checkProcedure(const char* name, cDBS::ProcType type, cDbProcedure* fp)
{
   char* file = 0;
   char* param = 0;
   int status = success;
   char md5[100+TB] = "";
   md5Buf md5New = "";
   cDbProcedure* p = 0;

   asprintf(&file, "%s.sql", name);

   if (createMd5OfFile(confDir, file, md5New) != success)
   {
      tell(0, "Error: Can't access procedure '%s/%s'", confDir, file);
      free(file);
      return fail;
   }

   asprintf(&param, "%s.md5", name);
   p = fp ? fp : new cDbProcedure(connection, name, type);

   if (p->created())
   {
      getParameter("epgd", param, md5);

      if (strcmp(md5, md5New) != 0)          // drop if changed
         p->drop();
   }

   if (!p->created())
   {
      status = p->create(confDir);
      setParameter("epgd", param, md5New);
   }

   free(file);
   free(param);

   if (!fp)
      delete p;

   return status;
}

//***************************************************************************
// Check View
//***************************************************************************

int cEpgd::checkView(const char* name, const char* file)
{
   int status = success;
   char md5[100+TB] = "";
   md5Buf md5New = "";
   char* param = 0;

   // create/check view

   cDbView view(connection, name);

   asprintf(&param, "%s.md5", name);

   if (createMd5OfFile(confDir, file, md5New) != success)
   {
      tell(0, "Error: Can't access view '%s/%s'", confDir, file);
      status = fail;
   }

   if (status == success)
   {
      if (view.exist())
      {
         getParameter("epgd", param, md5);

         if (strcmp(md5, md5New) != 0)          // drop if changed
            view.drop();
      }

      if (!view.exist())
      {
         status += view.create(confDir, file);
         setParameter("epgd", param, md5New);
      }
   }

   free(param);

   return status;
}

//***************************************************************************
// Register Me
//***************************************************************************

int cEpgd::registerMe()
{
   char* v = 0;

   if (!dbConnected())
      return fail;

   // -------------------------------------------
   // register me to the clients table

   asprintf(&v, "epgd %s (%s)", VERSION, VERSION_DATE);

   vdrDb->clear();
   vdrDb->setValue("UUID", "epgd");
   vdrDb->find();

   vdrDb->setValue("IP", getIpOf(EpgdConfig.netDevice));
   vdrDb->setValue("NAME", getHostName());
   vdrDb->setValue("DBAPI", DB_API);
   vdrDb->setValue("VERSION", v);
   vdrDb->setValue("MASTER", "-");
   vdrDb->setValue("PID", getpid());
   vdrDb->store();

   setState(Es::esInit);

   free(v);

   return dbConnected() ? success : fail;
}

//***************************************************************************
// Set State
//***************************************************************************

void cEpgd::setState(Es::State state, time_t lastUpdate, int silent)
{
   static Es::State actualState = Es::esUnknown;

   if (!dbConnected())
      return;

   if (actualState != state)
   {
      if (!silent)
         tell(0, "State now '%s'", Es::toName(state));

      vdrDb->clear();
      vdrDb->setValue("UUID", "EPGD");
      vdrDb->find();
      vdrDb->setValue("STATE", Es::toName(state));
      vdrDb->setValue("NextUpdate", nextUpdateAt);

      if (lastUpdate)
         vdrDb->setValue("LastUpdate", lastUpdate);

      if (actualState == Es::esBusyMatch && state == Es::esStandby)
         vdrDb->setValue("LastMerge", time(0));

      vdrDb->store();

      // inform clients about state change

      actualState = state;
      triggerVdrs("STATE", "epg2vdr", Es::toName(actualState));

      if (actualState >= Es::esBusy && actualState <= Es::esBusyScraping)
         sleep(2);      // wait until vdrs detecting the busy state
   }
}

//***************************************************************************
// Load Plugins
//***************************************************************************

int cEpgd::loadPlugins()
{
   DIR* dir;
   dirent* dp;

   if (!(dir = opendir(EpgdConfig.pluginPath)))
   {
      tell(0, "Error: Opening plugin directory '%s' failed, %s",
           EpgdConfig.pluginPath, strerror(errno));
      return fail;
   }

   while ((dp = readdir(dir)))
   {
      if (strncmp(dp->d_name, "libepgd-", 8) == 0 && strstr(dp->d_name, ".so"))
      {
         char* path;

         asprintf(&path, "%s/%s", EpgdConfig.pluginPath, dp->d_name);

         PluginLoader* pl = new PluginLoader(path);

         free(path);

         if (pl->load() != success)
         {
            delete pl;
            continue;
         }

         plugins.push_back(pl);
      }
   }

   closedir(dir);

   return success;
}

int cEpgd::initPlugins()
{
   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
      (*it)->getPlugin()->init(this, withutf8);

   return done;
}

int cEpgd::initPluginDb()
{
   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
      (*it)->getPlugin()->initDb();

   return done;
}

int cEpgd::exitPluginDb()
{
   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
      (*it)->getPlugin()->exitDb();

   return done;
}

//***************************************************************************
// Schedule Auto Update
//***************************************************************************

void cEpgd::scheduleAutoUpdate(int wait)
{
   if (wait)
      nextUpdateAt = time(0) + wait;
   else
      nextUpdateAt = time(0) + EpgdConfig.updatetime * 60 * 60;

   if ((nextUpdateAt-time(0))/60 < 1)
      tell(0, "Scheduled next update in %ld second(s)",
           nextUpdateAt-time(0));
   else if ((nextUpdateAt-time(0))/60/60 < 1)
      tell(0, "Scheduled next update in %ld minute(s)",
           (nextUpdateAt-time(0))/60);
   else
      tell(0, "Scheduled next update in %ld hour(s)",
           (nextUpdateAt-time(0))/60/60);
}

//***************************************************************************
// Loop
//***************************************************************************

void cEpgd::loop()
{
   time_t lastCheckAt = 0;
   time_t lastUpdCheckAt = 0;
   time_t lastRecCheckAt = 0;
   time_t lastTccCheckAt = 0;

   shutdown = no;

   // first run 10 seconds after start (if configured)

   scheduleAutoUpdate(EpgdConfig.checkInitial ? 10 : 0);

   // scrapNewEvents();   // # to debug scarper at Start

   while (!doShutDown())
   {
      setState(Es::esStandby);

      // wait for update and perform meanwhile actions

      while (!epgTrigger && !doShutDown() && nextUpdateAt > time(0))
      {
         sleep(1);

         cSystemNotification::check();

         if (lastCheckAt < time(0) - 60)
         {
            // check active vdrs every 60 seconds
            //   and reset if they are silent over 5 minutes

            lastCheckAt = time(0);

            if (checkConnection() != success)
               continue;

            connection->query("%s", "update vdrs set"
                              " state = 'crashed', master = 'n'"
                              " where state = 'attached'"
                              " and from_unixtime(updsp) < (now() - interval 5 minute);");
         }

         if (!dbConnected())
            continue;

         // all 15 minutes perform timer conflict check

         if (!doShutDown() && lastTccCheckAt < time(0) - 15*tmeSecondsPerMinute)
         {
            string mailBody;

            lastTccCheckAt = time(0);

            if (search->checkTimerConflicts(mailBody) > 0)
               sendTccMail(mailBody);
         }

         // --------

         // check all 30 seconds if new 'recordings' are in db

         if (!doShutDown() && lastRecCheckAt < time(0) - 30 && nextUpdateAt > time(0) + 30 && EpgdConfig.scrapRecordings)
         {
            lastRecCheckAt = time(0);

            // check if we need a recording scrap

            recordingListDb->clear();
            recordingListDb->setValue("SCRNEW", 1);
            countNewRecordings->execute();

            // if more than x new recordings pending ...

            if (newRecCount.getIntValue() >= 1)
            {
               setState(Es::esBusyScraping, 0, no);

               if (!doShutDown())
                  scrapNewRecordings(newRecCount.getIntValue());

               setState(Es::esStandby, 0, no);
               triggerVdrs("UPDREC", "osd2web");
            }

            countNewRecordings->freeResult();
         }

         // check all 30 seconds if we need a mergeepg call

         if (!doShutDown() && lastUpdCheckAt < time(0) - 30 && nextUpdateAt > time(0) + 30)
         {
            lastUpdCheckAt = time(0);

            // check if we need a merge

            eventsDb->clear();
            eventsDb->setValue("SOURCE", "vdr");
            eventsDb->setValue("UPDSP", lastMergeAt);
            countDvbChanges->execute();

            // if more than x DVB updates pending call mergeepg

            if (changeCount.getIntValue() > EpgdConfig.updateThreshold)
            {
               setState(Es::esBusyMatch, 0, no);

               if (!doShutDown())
               {
                  uint64_t start = cMyTimeMs::Now();

                  connection->startTransaction();

                  cSystemNotification::startNotifyThread(5*tmeSecondsPerMinute);
                  procMergeEpg->call(2);
                  cSystemNotification::stopNotifyThread();

                  connection->commit();

                  tell(1, "%ld DVB pending, mergeepg done after %s",
                       changeCount.getIntValue(), ms2Dur(cMyTimeMs::Now()-start).c_str());

                  lastMergeAt = time(0);
                  setParameter("epgd", "lastMergeAt", lastMergeAt);

                  // check searchtimer due to events have changed!

                  updateSearchTimers(yes, "events changed");
               }

               setState(Es::esStandby, 0, no);
            }

            countDvbChanges->freeResult();
         }

         // check searchtimer if searchtimer-table modified

         if (search->modified() || searchTimerTrigger)
            updateSearchTimers(searchTimerTrigger, searchTimerTrigger ? "triggered by user" : "search timer changed");

         if (recTableFixTrigger)
            tryFillEmptyRecTableFields();

         // print sql statistic for statement debugging

         if (EpgdConfig.loglevel > 2)
            connection->showStat("merge/rec-scrap");
      }

      epgTrigger = no;                          // reset SIGHUB trigger

      if (doShutDown())
         break;

      // database connection established ?

      if (checkConnection() != success)
      {
         nextUpdateAt = time(0) + 10;
         continue;
      }

      // the real work ...

      setState(Es::esBusyEvents);

      if (!doShutDown())
         if (cleanupEvents() != success)        // cleanup event and fileref table
            continue;

      if (!doShutDown())
         if (cleanupBefore() != success)        // cleanup plugins
            continue;

      if (!doShutDown())
         if (update() != success)               // update epg data
            continue;

      if (!doShutDown())
         downloadEpisodes();                    // download and store optionally on local fs

      if (!doShutDown() && procUser)            // call user procedure if defined
         procUser->call();

      if (!doShutDown())
         evaluateEpisodes();                    // try series match

      if (!doShutDown())
      {
         cSystemNotification::startNotifyThread(5*tmeSecondsPerMinute);
         procMergeEpg->call();
         cSystemNotification::stopNotifyThread();
      }

      lastUpdateAt = time(0);
      setState(Es::esBusyImages, lastUpdateAt);

      if (!dbConnected())
         continue;

      if (!doShutDown())
         if (cleanupPictures() != success)      // cleanup pictures
            continue;

      if (!doShutDown())
         if (getPictures() != success)          // get pictures
            continue;

      if (!doShutDown())
         if (cleanupAfter() != success)         // cleanup plugins
            continue;

      if (!doShutDown())
         if (updateSearchTimers(yes, "external epg update") != success)  // process searchtimer after epg update
            continue;

      if (!doShutDown() && EpgdConfig.scrapEpg)
      {
         setState(Es::esBusyScraping);

         if (!doShutDown())
            if (scrapNewEvents() != success)    // scrap new events
               continue;
      }

      if (!doShutDown() && (EpgdConfig.scrapEpg || EpgdConfig.scrapRecordings))
         if (cleanupSeriesAndMovies() != success)  // cleanup scraped movies and series
            continue;

      if (dbConnected())
         scheduleAutoUpdate();

      setState(Es::esStandby, time(0));

      if (EpgdConfig.loglevel > 2)
         connection->showStat("main loop");
   }

   setState(Es::esStopped);
}

//***************************************************************************
// Check Connection
//***************************************************************************

int cEpgd::checkConnection()
{
   static int retry = 0;

   // check connection

   if (!dbConnected())
   {
      // try to connect

      tell(0, "Trying to re-connect to database!");
      retry++;

      if (initDb() != success)
      {
         tell(0, "Retry #%d failed, retrying in 60 seconds!", retry);
         exitDb();

         return fail;
      }

      retry = 0;
      tell(0, "Connection established successfull!");
   }

   return success;
}

//***************************************************************************
// Download File
//***************************************************************************

int cEpgd::downloadFile(const char* url, int& size, MemoryStruct* data, int timeout, const char* userAgent)
{
   cSystemNotification::check();
   return curl.downloadFile(url, size, data, timeout, userAgent);
}

//***************************************************************************
// Update Search Timers
//***************************************************************************

int cEpgd::updateSearchTimers(int force, const char* reason)
{
   int hits = 0;

   // check existing, pending timers against updated epg

   hits += search->checkTimers();

   // update searchtimers

   hits += search->updateSearchTimers(force, reason);
   searchTimerTrigger = no;

   if (hits)
      triggerVdrs("TIMERJOB", "epg2vdr");

   // check 'not assumed' timers and wakeup VDR if necessary

   timerDb->clear();

   for (int f = selectNotAssumedTimers->find(); f; f = selectNotAssumedTimers->fetch())
   {
      // timer should start in the next

      if (timerDb->getIntValue("_STARTTIME") < time(0) + 2*tmeSecondsPerDay)
      {
         if (!timerDb->hasValue("VDRUUID", "any"))
         {
            tell(1, "Info: Timer (%ld) for '%s' start in the next 48 hours, "
                 "try to wakeup VDR to permit takeover",
                 timerDb->getIntValue("ID"),
                 timerDb->getStrValue("FILE"));

            wakeupVdr(timerDb->getStrValue("VDRUUID"));
         }
      }
   }

   selectNotAssumedTimers->freeResult();

   return done;
}

//***************************************************************************
// Update
//***************************************************************************

int cEpgd::update()
{
   Statistic stat;

   memset(&stat, 0, sizeof(Statistic));

   cSystemNotification::notify(evStatus, "STATUS=%s %s", "Busy, started", fullupdate ? "Full-Update" : fullreload ? "Reload" : "Update");

   tell(0, "EPG %s started", fullupdate ? "Full-Update" : fullreload ? "Reload" : "Update");

   // loop from today over configured range ..

   for (int day = 0; day < EpgdConfig.days && !doShutDown(); day++)
   {
      processDay(day, fullupdate, &stat);

      if (!dbConnected())
         return fail;
   }

   fullupdate = no;
   double mb = (double)stat.bytes / 1024.0 / 1024.0;

   tell(0, "EPG Update finished, loaded %d files (%.3f %cB), %d non-updates "
           "skipped, %d rejected due to format error.",
           stat.files, mb > 2 ? mb : (double)stat.bytes/1024.0, mb > 2 ? 'M' : 'K',
           stat.nonUpdates, stat.rejected);

   // store max event time to parameters

   setParameter("epgd", "maxEventTime", time(0) + EpgdConfig.days * tmeSecondsPerDay);
   cSystemNotification::notify(evStatus, "STATUS=Ready");

   return success;
}

//***************************************************************************
// Transform Xml
//***************************************************************************

xmlDocPtr cEpgd::transformXml(const char* buffer, int size,
                              xsltStylesheetPtr stylesheet,
                              const char* fileRef)
{
   xmlDocPtr doc, transformedDoc = 0;
   int readOptions = 0;

#if LIBXML_VERSION >= 20900
   readOptions |=  XML_PARSE_HUGE;
#endif

      if ((doc = xmlReadMemory(buffer, size, "tmp.xml.gz", 0, readOptions)))
   {
      if ((transformedDoc = xsltApplyStylesheet(stylesheet, doc, 0)) == 0)
         tell(1, "Error applying XSLT stylesheet");

      xmlFreeDoc(doc);
   }
   else
   {
      tell(1, "Error parsing XML File '%s'", fileRef);
   }

   return transformedDoc;
}

//***************************************************************************
// Parse XML Event
//***************************************************************************

int cEpgd::parseEvent(cDbRow* event, xmlNode* node)
{
   const char* name;
   char* content;
   char* images = 0;
   char* imagetype = 0;
   int imgCnt = 0;
   string comp;

   cSystemNotification::check();

   for (xmlNodePtr n = node->xmlChildrenNode; n; n = n->next)
   {
      if (n->type != XML_ELEMENT_NODE)
         continue;

      name = (const char*)n->name;
      content = (char*)xmlNodeGetContent(n);

      if (strcmp(name, "images") == 0)
         images = strdup(content);

      else if (strcmp(name, "imagetype") == 0)
         imagetype = strdup(content);

      else if (cDbFieldDef* f = eventsDb->getField(name))
      {
         if (strcmp(name, "starttime") == 0 && atoi(content) == 0)
            tell(0, "Warning: Invalid event, starttime is null!");

         if (f->getFormat() == cDbService::ffAscii || f->getFormat() == cDbService::ffText || f->getFormat() == cDbService::ffMText)
            event->setValue(f, content);
         else
            event->setValue(f, (long)atoi(content));
      }

      else
         tell(1, "Ignoring unexpected element <%s>\n", name);

      xmlFree(content);
   }

   // compressed

   if (!eventsDb->isNull("TITLE"))
   {
      comp = eventsDb->getStrValue("TITLE");
      prepareCompressed(comp);
      eventsDb->setValue("COMPTITLE", comp.c_str());
   }

   if (!eventsDb->isNull("SHORTTEXT"))
   {
      comp = eventsDb->getStrValue("SHORTTEXT");
      prepareCompressed(comp);
      eventsDb->setValue("COMPSHORTTEXT", comp.c_str());
   }

   if (!eventsDb->isNull("LONGDESCRIPTION"))
   {
      comp = eventsDb->getStrValue("LONGDESCRIPTION");
      prepareCompressed(comp);
      eventsDb->setValue("COMPLONGDESCRIPTION", comp.c_str());
   }

   // image references

   if (images && imagetype)
      imgCnt = storeImageRefs(event->getBigintValue("EVENTID"),
                              event->getStrValue("SOURCE"),
                              images, imagetype,
                              event->getStrValue("FILEREF"));

   else
      tell(4, "no images for event %ld in %s",
           event->getBigintValue("EVENTID"),
           event->getStrValue("FILEREF"));

   event->setValue("IMAGECOUNT", min(imgCnt, EpgdConfig.maximagesperevent));

   free(images);
   free(imagetype);

   return success;
}

//***************************************************************************
// Store Images
//***************************************************************************

int cEpgd::storeImageRefs(tEventId evtId, const char* source, const char* images,
                          const char* ext, const char* fileRef)
{
   char* next;
   char* image;
   int lfn = 0;
   char* imagesCsv = strdup(images);
   int count = 0;

   // #TODO limit here to EpgdConfig.maximagesperevent

   for (char* p = imagesCsv; p && *p; p = next, lfn++)
   {
      if ((next = strchr(p, ',')))
      {
         *next = 0;     // terminate
         next++;
      }

      asprintf(&image, "%s.%s", p, ext);

      imageRefDb->clear();

      imageRefDb->setBigintValue("EVENTID", evtId);
      imageRefDb->setValue("LFN", lfn);
      imageRefDb->setValue("IMGNAME", image);
      imageRefDb->setValue("SOURCE", source);
      imageRefDb->setValue("FILEREF", fileRef);

      imageRefDb->store();
      count++;

      free(image);
   }

   free(imagesCsv);

   tell(3, "There are %d images for event %lld", count, evtId);

   return count;
}

//***************************************************************************
// Get Pictures
//***************************************************************************

int cEpgd::getPictures()
{
   time_t start = time(0);
   int count = 0;
   int notFound = 0;
   int total = 0;
   unsigned int bytes = 0;
   MemoryStruct data;
   int rows = -1;

   if (!EpgdConfig.getepgimages)
      return done;

   // fetch all images

   tell(0, "Start download of new images");

   char* where;
   asprintf(&where, "lfn < %d", EpgdConfig.maximagesperevent);
   imageRefDb->countWhere(where, rows, "count(distinct imagename)");
   free(where);

   cDbStatement* stmt = new cDbStatement(imageRefDb);

   stmt->build("select ");
   stmt->bind("IMGNAME", cDBS::bndOut);
   stmt->bind("SOURCE", cDBS::bndOut,", ");
   stmt->bind("FILEREF", cDBS::bndOut, ", max(");
   stmt->build(") from %s where ", imageRefDb->TableName());
   stmt->bindCmp(0, "LFN", 0, "<");
   stmt->build(" group by %s, %s",
               imageRefDb->getField("IMGNAME")->getDbName(),
               imageRefDb->getField("SOURCE")->getDbName());

   if (stmt->prepare() != success)
   {
      delete stmt;
      return fail;
   }

   imageRefDb->clear();
   imageRefDb->setValue("LFN", EpgdConfig.maximagesperevent);  // limit to config

   connection->startTransaction();

   for (int f = stmt->find(); f && !doShutDown(); f = stmt->fetch())
   {
      const char* imagename = imageRefDb->getStrValue("IMGNAME");

      cSystemNotification::check();

      if (!(++total % 500))
      {
         connection->commit();

         double mb = (double)bytes / 1024.0 / 1024.0;
         tell(0, "Still updating images, now %d of %d checked and %d loaded (%.3f %cB)",
              total, rows, count, mb > 2 ? mb : (double)bytes/1024.0, mb > 2 ? 'M' : 'K');

         connection->startTransaction();
      }

      // get image if missing

      imageDb->clear();
      imageDb->setValue("IMGNAME", imagename);

      int found = imageDb->find();

      if (!found || imageDb->isNull("IMAGE"))
      {
         int fileSize = getPicture(imageRefDb->getStrValue("SOURCE"), imagename,
                                   imageRefDb->getStrValue("FILEREF"), &data);

         if (fileSize > 0)
         {
            int maxSize = imageDb->getField("IMAGE")->getSize();

            bytes += fileSize;
            count++;

            tell(2, "Downloaded image '%s' with (%d) bytes", imagename, fileSize);

            if (fileSize < maxSize)
            {
               imageDb->setValue("Image", data.memory, data.size);
               imageDb->store();
            }
            else
            {
               tell(0, "Warning, skipping storage of image due to size "
                    "limit of %d byte, got image with %d bytes", maxSize, fileSize);
            }

            data.clear();
         }
         else
         {
            notFound++;
         }
      }

      imageDb->reset();
   }

   stmt->freeResult();
   delete stmt;

   connection->commit();

   double mb = (double)bytes / 1024.0 / 1024.0;

   tell(0, "Loaded %d images (%.3f %cB), checked %d; %d failed to load in %ld seconds",
        count, mb > 2 ? mb : (double)bytes/1024.0, mb > 2 ? 'M' : 'K',
        total, notFound, time(0)-start);

   return dbConnected() ? success : fail;
}

//***************************************************************************
// Remove Old Files
//***************************************************************************

int cEpgd::cleanupEvents()
{
   char* where;
   struct tm tm;
   time_t historyFrom;

   tell(1, "Starting cleanup of events");

   // detete all fileref entrys older than 24 hours (works only for epgdata events)

   historyFrom = time(0) - tmeSecondsPerDay;
   localtime_r(&historyFrom, &tm);

   asprintf(&where, "substr(name,1,8) <= '%4d%02d%02d' and source = 'epgdata'",
            tm.tm_year + 1900, tm.tm_mon+1, tm.tm_mday);
   tell(1, "Delete fileref [%s]", where);
   fileDb->deleteWhere("%s", where);
   free(where);

   // NOTE:
   // -> events with missing fileref entries will deleted by the plugins of epgd!

   // delete events and useevents ended (starttime+duration) before 6 hours

   time_t minEventTime = time(0) - 6 * tmeSecondsPerHour;

   asprintf(&where, "starttime+duration < %ld", minEventTime);
   tell(1, "Delete events [%s]", where);
   eventsDb->deleteWhere("%s", where);
   free(where);

   asprintf(&where, "cnt_starttime+cnt_duration < %ld", minEventTime);
   tell(1, "Delete useevents [%s]", where);
   useeventsDb->deleteWhere("%s", where);
   free(where);

   // store min event time to parameters

   setParameter("epgd", "minEventTime", minEventTime);

   // cleanup components

   compDb->deleteWhere("eventid not in (select eventid from events where source = 'vdr');");

   tell(1, "Cleanup of events finished");

   long int hist = 3;

   getParameter("epgd", "timerJobFailedHistory", hist);

   tell(1, "Starting cleanup of failed timer actions, older than %ld days", hist);

   timerDb->clear();
   timerDb->setCharValue("ACTION", taFailed);
   timerDb->setValue("UPDSP", time(0) - hist * tmeSecondsPerDay);
   cleanupTimerActions->execute();
   cleanupTimerActions->freeResult();

   tell(1, "Cleanup of timer actions finished");

   return dbConnected() ? success : fail;
}

//***************************************************************************
// Remove Pictures
//***************************************************************************

int cEpgd::cleanupPictures()
{
   if (EpgdConfig.getepgimages)
   {
      // remove unused images

      cSystemNotification::check();
      tell(1, "Starting cleanup of imagerefs");
      imageRefDb->deleteWhere("eventid not in (select eventid from events)");

      cSystemNotification::check(yes);
      tell(1, "Starting cleanup of images");
      imageDb->deleteWhere("imagename not in (select imagename from imagerefs)");

      tell(1, "Image cleanup finished");
   }

   return dbConnected() ? success : fail;
}

//***************************************************************************
// Store to FS
//***************************************************************************

int cEpgd::storeToFs(MemoryStruct* data, const char* filename, const char* subPath)
{
   char* path = 0;
   char* outfile = 0;

   asprintf(&path, "%s/%s", EpgdConfig.cachePath, subPath);
   chkDir(path);
   asprintf(&outfile, "%s/%s", path, filename);
   free(path);

   storeToFile(outfile, data->memory, data->size);

   free(outfile);

   return success;
}

//***************************************************************************
// Load from FS
//***************************************************************************

int cEpgd::loadFromFs(MemoryStruct* data, const char* filename, const char* subPath)
{
   char* path = 0;
   char* infile = 0;

   cSystemNotification::check();

   asprintf(&path, "%s/%s", EpgdConfig.cachePath, subPath);
   chkDir(path);

   asprintf(&infile, "%s/%s", path, filename);
   free(path);

   loadFromFile(infile, data);

   free(infile);

   return success;
}

//***************************************************************************
// Plugin Interface
//***************************************************************************
//***************************************************************************
// Cleanup Before
//***************************************************************************

int cEpgd::cleanupBefore()
{
   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
   {
      Plugin* p = (*it)->getPlugin();

      cSystemNotification::check();

      if (p->ready())
         p->cleanupBefore();
   }

   return dbConnected() ? success : fail;
}

//***************************************************************************
// Cleanup After
//***************************************************************************

int cEpgd::cleanupAfter()
{
   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
   {
      Plugin* p = (*it)->getPlugin();

      cSystemNotification::check();

      if (p->ready())
         p->cleanupAfter();
   }

   return dbConnected() ? success : fail;
}

//***************************************************************************
// Get Picture
//***************************************************************************

int cEpgd::getPicture(const char* source, const char* imagename,
                      const char* fileRef, MemoryStruct* data)
{
   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
   {
      Plugin* p = (*it)->getPlugin();

      cSystemNotification::check();

      if (p->ready() && p->hasSource(source))
         return p->getPicture(imagename, fileRef, data);
   }

   return 0;
}

//***************************************************************************
// Process Day
//***************************************************************************

int cEpgd::processDay(int day, int fullupdate, Statistic* stat)
{
   vector<PluginLoader*>::iterator it;

   for (it = plugins.begin(); it < plugins.end(); it++)
   {
      Plugin* p = (*it)->getPlugin();

      cSystemNotification::check();

      if (p->ready())
      {
         tell(1, "Updating '%s' day today+%d now", p->getSource(), day);

         p->processDay(day, fullupdate, stat);
      }
   }

   return dbConnected() ? success : fail;
}

//***************************************************************************
// Init Scrapers
//***************************************************************************

int cEpgd::initScrapers()
{
   int status;
   tvdbManager = new cTVDBManager();

   if (!tvdbManager->ConnectScraper())
   {
      tell(0, "Error while connecting tvdb scraper");
      return fail;
   }

   if ((status = tvdbManager->ConnectDatabase(connection)) != success)
   {
      tell(0, "Error while connecting to series database");
      return status;
   }

   tell(0, "TVDB scraper connected");

   movieDbManager = new cMovieDBManager();

   if (!movieDbManager->ConnectScraper())
   {
      tell(0, "Error while connecting movieDb scraper");
      return fail;
   }

   if ((status = movieDbManager->ConnectDatabase(connection)) != success)
   {
      tell(0, "Error while connecting to movies database");
      return status;
   }

   tell(0, "MOVIEDB scraper connected");

   return success;
}

//***************************************************************************
// Exit Scrapers
//***************************************************************************

void cEpgd::exitScrapers()
{
   delete tvdbManager;     tvdbManager = 0;
   delete movieDbManager;  movieDbManager = 0;
}

//***************************************************************************
// Scrap New Events
//***************************************************************************

int cEpgd::scrapNewEvents()
{
   if (!tvdbManager || !movieDbManager)
      return done;

   // ------------------------------
   // update existing series with new data from thetvdb.com

   time_t start = time(0);

   tell(0, "Scraping new series and episodes");

   tvdbManager->SetServerTime();
   tvdbManager->ResetBytesDownloaded();
   tvdbManager->UpdateSeries();

   int bytes = tvdbManager->GetBytesDownloaded();
   double mb = (double)bytes / 1024.0 / 1024.0;

   tell(0, "Update of series and episodes done in %ld s, downloaded %.3f %cB",
        time(0) - start, mb > 2 ? mb : (double)bytes/1024.0, mb > 2 ? 'M' : 'K');

   // ------------------------------
   // scrap new series in EPG

   vector<sSeriesResult> seriesToScrap;

   if (!tvdbManager->GetSeriesWithEpisodesFromEPG(&seriesToScrap))
      return fail;

   start = time(0);
   tvdbManager->ResetBytesDownloaded();

   int seriesTotal = seriesToScrap.size();
   int seriesCur = 0;

   tell(0, "%d new series events to scrap in db", seriesTotal);

   for (vector<sSeriesResult>::iterator it = seriesToScrap.begin(); it != seriesToScrap.end(); ++it)
   {
      seriesCur++;

      cSystemNotification::check();

      if (seriesCur % 10 == 0)
         tell(0, "series episode %d / %d scraped...continuing scraping", seriesCur, seriesTotal);

      tvdbManager->ProcessSeries(*it);

      if (doShutDown())
         break;

      if (!dbConnected())
         return fail;
   }

   bytes = tvdbManager->GetBytesDownloaded();
   mb = (double)bytes / 1024.0 / 1024.0;

   tell(0, "%d of %d series episodes scraped in %ld s, downloaded %.3f %cB",
        seriesCur, seriesTotal, time(0) - start,
        mb > 2 ? mb : (double)bytes/1024.0, mb > 2 ? 'M' : 'K');

   // ------------------------------
   // scrap movies

   if (doShutDown())
      return success;

   start = time(0);
   vector<sMovieResult> moviesToScrap;

   tell(0, "Scraping new movies");

   movieDbManager->ResetBytesDownloaded();

   if (!movieDbManager->GetMoviesFromEPG(&moviesToScrap))
      return fail;

   int moviesTotal = moviesToScrap.size();
   int movieCur = 0;

   tell(0, "%d new movies to scrap in db", moviesTotal);

   time_t sectionStartAt = time(0);  // split download in parts of 40

   for (vector<sMovieResult>::iterator it = moviesToScrap.begin(); it != moviesToScrap.end(); ++it)
   {
      movieCur++;

      if (movieCur % 10 == 0)
         tell(0, "movie %d / %d scraped...continuing scraping", movieCur, moviesTotal);

      if (movieCur % 40 == 0)
      {
         int duration = time(0) - sectionStartAt;

         if (duration < 10)
         {
            duration = 10 - duration;
            tell(0, "Waiting %d seconds..", duration);
            sleep(duration);
         }

         sectionStartAt = time(0);
      }

      movieDbManager->ProcessMovie(*it);

      if (doShutDown())
         break;

      if (!dbConnected())
         return fail;
   }

   bytes = movieDbManager->GetBytesDownloaded();
   mb = (double)bytes / 1024.0 / 1024.0;

   tell(0, "%d of %d movies scraped in %ld s, downloaded %.3f %cB",
        movieCur, moviesTotal, time(0) - start, mb > 2 ? mb : (double)bytes/1024.0, mb > 2 ? 'M' : 'K');

   // ------------------------------
   // copy changed scraper refereces from event to useevents

   if (dbConnected())
   {
      time_t lastScrRefUpdate = 0;

      getParameter("epgd", "lastScrRefUpdate", lastScrRefUpdate);

      eventsDb->clear();
      useeventsDb->clear();
      eventsDb->setValue("SCRSP", lastScrRefUpdate-5);

      updateScrReference->execute();

      setParameter("epgd", "lastScrRefUpdate", lastScrRefUpdate);
   }

   return success;
}

//***************************************************************************
// Cleanup Series and Movies
//***************************************************************************

int cEpgd::cleanupSeriesAndMovies()
{
   if (tvdbManager)
   {
      cSystemNotification::check();
      tell(0, "cleaning up series...");
      int numDeleted = tvdbManager->CleanupSeries();
      tell(0, "%d outdated series deleted", numDeleted);
   }

   if (movieDbManager)
   {
      cSystemNotification::check();
      tell(0, "cleaning up movies...");
      int numDeleted = movieDbManager->CleanupMovies();
      tell(0, "%d outdated movies deleted", numDeleted);
   }

   return success;
}

//***************************************************************************
// Check new Recordings
//***************************************************************************

void cEpgd::scrapNewRecordings(int count)
{
   int total = 0;

   if (!tvdbManager || !movieDbManager)
      return ;

   recordingListDb->clear();
   recordingListDb->setValue("SCRNEW", yes);

   tell(0, "SCRAP: Scraping new recordings, %d pending", count);

   connection->startTransaction();

   for (int res = selectNewRecordings->find(); res; res = selectNewRecordings->fetch())
   {
      int seriesId = 0;
      int episodeId = 0;
      int movieId = 0;
      int found = no;

      string recPath = recordingListDb->getStrValue("PATH");
      long starttime = recordingListDb->getIntValue("STARTTIME");
      string recTitle = recordingListDb->getStrValue("TITLE");
      string recSubtitle = recordingListDb->getStrValue("SHORTTEXT");
      string category = recordingListDb->getStrValue("CATEGORY");
      int eventId = recordingListDb->getIntValue("EVENTID");
      string channelId = recordingListDb->getStrValue("CHANNELID");
      int scrapInfoMovieId = recordingListDb->getIntValue("SCRINFOMOVIEID");
      int scrapInfoSeriesId = recordingListDb->getIntValue("SCRINFOSERIESID");
      int scrapInfoEpisodeId = recordingListDb->getIntValue("SCRINFOEPISODEID");

      int isSeries = category == "Serie" ? yes : no;

      cSystemNotification::check();

      total++;

      tell(1, "-------------------------------------------------------");
      tell(1, "Found new recording '%s'/'%s'", recTitle.c_str(), recSubtitle.c_str());

      // --------------------------------------------
      // first -  scrap by scrapInfo if available
      //  -> info is set by user therefore prefer it

      if (isSeries && scrapInfoSeriesId > 0)
      {
         found = tvdbManager->CheckScrapInfoDB(scrapInfoSeriesId, scrapInfoEpisodeId);

         if (!found)
            found = tvdbManager->CheckScrapInfoOnline(scrapInfoSeriesId, scrapInfoEpisodeId);
      }
      else if (!isSeries && scrapInfoMovieId > 0)
      {
         found = movieDbManager->CheckScrapInfoDB(scrapInfoMovieId);

         if (!found)
            found = movieDbManager->CheckScrapInfoOnline(scrapInfoMovieId);
      }

      if (found)
      {
         tell(1, "SCRAP: Scrap for recording '%s' successfully done by user defined scrapinfo", recTitle.c_str());
         recordingListDb->setValue("SCRNEW", no);
         recordingListDb->setValue("SCRSERIESID", scrapInfoSeriesId);
         recordingListDb->setValue("SCRSERIESEPISODE", scrapInfoEpisodeId);
         recordingListDb->setValue("SCRMOVIEID", scrapInfoMovieId);
         recordingListDb->setValue("SCRSP", time(0));
         recordingListDb->update();

         continue;
      }

      // --------------------------------------------
      // second - for 'actual' recordings check if event with scrap info is available
      //   don't use lookup later sine the event ids can reused in between!

      if (starttime > time(0) - 3*tmeSecondsPerHour)
      {
         if (eventId > 0 && channelId.size() > 0)
            found = checkEventsForRecording(eventId, channelId, seriesId, episodeId, movieId);

         if (found)
         {
            tell(1, "SCRAP: Found active event for recording '%s'", recTitle.c_str());

            recordingListDb->setValue("SCRSERIESID", seriesId);
            recordingListDb->setValue("SCRSERIESEPISODE", episodeId);
            recordingListDb->setValue("SCRMOVIEID", movieId);
            recordingListDb->setValue("SCRNEW", no);
            recordingListDb->setValue("SCRSP", time(0));
            recordingListDb->update();

            continue;
         }
      }

/*
      // --------------
      // maybe another client got the recording earlier ..

      found = checkRecOtherClients(uuid, recPath, recStart);

      if (found)
      {
         tell(1, "SCRAP: Found same recording from other client for recording '%s'", recTitle.c_str());
         recordingListDb->setValue("SCRNEW", no);
         recordingListDb->setValue("SCRSP", time(0));
         recordingListDb->update();

         continue;
      }
*/

      // ------------------------------------
      // third - try scrap by title and subtitle

      seriesId = 0;
      episodeId = 0;
      movieId = 0;

      if (isSeries)
      {
         // series ...

         tell(1, "SCRAP: Searching '%s' as series in database", recTitle.c_str());

         found = tvdbManager->SearchRecordingDB(recTitle, recSubtitle, seriesId, episodeId);

         if (found)
            tell(1, "SCRAP: Found '%s'/'%s' in database", recTitle.c_str(), recSubtitle.c_str());

         if (!found)
         {
            tell(1, "SCRAP: Nothing found in db, searching '%s' as series online", recTitle.c_str());
            found = tvdbManager->SearchRecordingOnline(recTitle, recSubtitle, seriesId, episodeId);

            if (found)
               tell(1, "SCRAP: Found '%s'/'%s' as series online, seriesId %d, episodeId %d",
                    recTitle.c_str(), recSubtitle.c_str(), seriesId, episodeId);
         }
      }
      else
      {
         // movie ...

         tell(1, "SCRAP: Searching '%s' as movie in database", recTitle.c_str());
         found = movieDbManager->SearchRecordingDB(recTitle, movieId);

         if (found)
            tell(1, "SCRAP: Found '%s' in database", recTitle.c_str());

         if (!found)
         {

            tell(1, "SCRAP: Nothing found in db, searching '%s' as movie online", recTitle.c_str());
            found = movieDbManager->SearchRecordingOnline(recTitle, movieId);

            if (found)
               tell(1, "SCRAP: Found '%s' as movie online, movieId %d", recTitle.c_str(), movieId);
         }
      }

      tell(1, "SCRAP: Recording %s scraped '%s'", found ? "successfully" : "NOT successfully", recTitle.c_str());

      recordingListDb->setValue("SCRNEW", no);
      recordingListDb->setValue("SCRSERIESID", seriesId);
      recordingListDb->setValue("SCRSERIESEPISODE", episodeId);
      recordingListDb->setValue("SCRMOVIEID", movieId);
      recordingListDb->setValue("SCRSP", time(0));
      recordingListDb->update();
   }

   connection->commit();

   tell(1, "-------------------------------------------------------");
   tell(0, "SCRAP: Scraping %d new recordings done", total);
}

//***************************************************************************
// Check Events For Recording
//***************************************************************************

bool cEpgd::checkEventsForRecording(int eventId, string channelId, int& seriesId,
                                    int& episodeId, int& movieId)
{
   eventsDb->clear();
   eventsDb->setValue("MASTERID", eventId);
   eventsDb->setValue("CHANNELID", channelId.c_str());

   if (!selectRecordingEvent->find())
      return false;

   seriesId = eventsDb->getIntValue("SCRSERIESID");
   episodeId = eventsDb->getIntValue("SCRSERIESEPISODE");
   movieId = eventsDb->getIntValue("SCRMOVIEID");

   if (seriesId > 0 || movieId > 0)
      return true;

   return false;
}

//***************************************************************************
// Check Recording at Other Clients
//***************************************************************************

bool cEpgd::checkRecOtherClients(string uuid, string recPath, int recStart)
{
   int res = true;

//    // take only last two directorys from path for comparison

//    size_t firstSlash = recPath.find_last_of('/');

//    if (firstSlash == string::npos)
//       return false;

//    size_t secondSlash = recPath.find_last_of('/', firstSlash-1);

//    if (secondSlash == string::npos)
//       return false;

//    string compPath = recPath.substr(secondSlash);
//    compPath = '%' + compPath;
//    recordingListDb->setValue("PATH", compPath.c_str());
//    recordingListDb->setValue("VDRUUID", uuid.c_str());
//    recordingListDb->setValue("STARTTIME", recStart);

//    if (selectRecOtherClient->find())
//    {
//       if (recordingListDb->getIntValue("SERIESID") > 0
//           || recordingListDb->getIntValue("MOVIEID") > 0)
//          res = false;
//    }

//    // primary key was changed through function call

//    recordingListDb->setValue("VDRUUID", uuid.c_str());
//    recordingListDb->setValue("PATH", recPath.c_str());
//    recordingListDb->setValue("STARTTIME", recStart);

   return res;
}

//***************************************************************************
// Trigger VDRs
//***************************************************************************

int cEpgd::triggerVdrs(const char* trg, const char* plug, const char* options)
{
   // wait for dbInit ;)

   if (!selectActiveVdrs)
      return done;

   vdrDb->clear();

   for (int f = selectActiveVdrs->find(); f; f = selectActiveVdrs->fetch())
   {
      const char* ip = vdrDb->getStrValue("IP");
      unsigned int port = vdrDb->getIntValue("SVDRP");

      if (strcmp(plug, "osd2web") == 0)
      {
         if (vdrDb->getIntValue("OSD2WEBP") <= 0)
            continue;
      }

      cSvdrpClient cl(ip, port);

      // open tcp connection

      if (cl.open() == success)
      {
         char* command = 0;
         cList<cLine> result;

         if (!isEmpty(plug))
            asprintf(&command, "PLUG %s %s %s", plug, trg, !isEmpty(options) ? options : "");
         else
            asprintf(&command, "%s %s", trg, !isEmpty(options) ? options : "");

         tell(1, "Send '%s' to '%s:%d'", command,ip, port);

         if (!cl.send(command))
            tell(0, "Error: Send '%s' to '%s:%d' failed!", command, ip, port);
         else
            cl.receive(&result, 2);

         free(command);
      }

      cl.close(no);
   }

   selectActiveVdrs->freeResult();

   return success;
}

//***************************************************************************
// Wakekup VDR
//***************************************************************************

int cEpgd::wakeupVdr(const char* uuid)
{
   int status = fail;

   vdrDb->clear();
   vdrDb->setValue("UUID", uuid);

   if (vdrDb->find())
   {
      const char* mac = vdrDb->getStrValue("MAC");

      if (!isEmpty(mac))
         status = sendWol(mac, EpgdConfig.netDevice);
   }

   vdrDb->reset();

   return status;
}

//***************************************************************************
// Send TCC TEST Mail
//***************************************************************************

struct cTccTimerData
{
   long id;
   int begin;
   int end;
   std::string channel;
   std::string file;
};

struct cTccTransponder
{
   int count;
   std::list<cTccTimerData> timers;
};

int cEpgd::sendTccTestMail()
{
   int conflicts = 0;
   std::string mailBody;

   for (int tt = 1; tt < 3; tt++)
   {
      cTccTimerData timer;
      std::string mailPart;
      conflicts++;

      mailBody +=
         "<tbody>"
         "<tr>"
         "<th style=\"text-align:left;vertical-align:top;white-space:nowrap;padding:15px 0 5px 0;border-bottom: 1px solid #ccc;\" colspan=\"6\">  conflict #" + num2Str(conflicts) + " on VDR '" + "vdrfoobar" + "' at " + l2pDate(time(0)) + "</th>"
         "</tr>";

      std::map<std::string, cTccTransponder> transponders;
      std::map<std::string, cTccTransponder>::iterator it;

      for (int f = 0; f < 3; f++)
      {
         std::string transponder = "TRA01";
         std::string tspTxt;

         transponders[transponder].count++;

         timer.id = 8154711;
         timer.channel = "SAT 77 HD";
         timer.file = "krime/foobar.rec";
         timer.begin = 1215;
         timer.end = 1702;
         transponders[transponder].timers.push_back(timer);
      }

      for (it = transponders.begin(); it != transponders.end(); it++)
      {
         char buf[1024+TB];
         std::list<cTccTimerData>::iterator li;

         for (li = it->second.timers.begin(); li != it->second.timers.end(); ++li)
         {
            tell(3, "TCC: found (%ld) '%s'", (*li).id, (*li).file.c_str());

            sprintf(buf,
                    "<tr>"
                    "<td style=\"text-align:left;vertical-align:top;white-space:nowrap;padding:3px 2px;\"><div>%s</div></td>"
                    "<td style=\"text-align:left;vertical-align:top;white-space:nowrap;padding:3px 2px;\"><div>%s</div></td>"
                    "<td style=\"text-align:left;vertical-align:top;white-space:nowrap;padding:3px 2px;\"><div>%ld</div></td>"
                    "<td style=\"text-align:left;vertical-align:top;white-space:nowrap;padding:3px 2px;\"><div>%s</div></td>"
                    "<td style=\"text-align:right;vertical-align:top;white-space:nowrap;padding:3px 2px;\"><div>%s</div></td>"
                    "<td style=\"text-align:right;vertical-align:top;white-space:nowrap;padding:3px 2px;\"><div>%s</div></td>"
                    "</tr>",
                    it->first.c_str(),
                    (*li).channel.c_str(),
                    (*li).id,
                    (*li).file.c_str(),
                    hhmm2pTime((*li).begin).c_str(),
                    hhmm2pTime((*li).end).c_str());

            mailPart += buf;
         }
      }

      mailBody += mailPart;
      mailBody +=
                       "</tbody>";
   }

   sendTccMail(mailBody);

   return done;
}

//***************************************************************************
// Send TCC Mail
//***************************************************************************

int cEpgd::sendTccMail(string& mailBody)
{
   static time_t lastMailAt = 0;

   const char* htmlHead =
      "<head>"
      "<title>Conflicting Timers</title>"
      "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />"
      "</head>";

   // string subject = "EPGD: Timer conflicts";
   // string receivers;
   char* html = 0;

   // max one mail per hour

   if (lastMailAt > time(0) - tmeSecondsPerHour)
      return done;

   if (!mailBody.length())
      return fail;

   // build mail body ..

   asprintf(&html,
            "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">"
            "<html xmlns=\"http://www.w3.org/1999/xhtml\">"
            "%s"
              "<body style=\"margin: 0; padding: 0; min-width: 100%% !important;\">"
                "<br />"
             "<!--[if (gte mso 9)|(IE)]>"
             "<table width=\"600\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
                 "<tr>"
                     "<td>"
             "<![endif]-->"
                "<table align=\"center\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width: 600px; width:100%%; background:#ffffff;  margin:0 auto 30px; font-size:12px; line-height:16px; font-family:arial, tahoma, verdana, sans-serif; color:#333333; border-collapse:collapse;\">"
                  "<tbody>"
                    "<tr>"
                      "<td style=\"min-width:20px;\">&nbsp;</td>"
                      "<td style=\"width:600px; width:700px;\">"
                        "<h2>Conflicting Timers</h2>"
                        "<table style=\"width:100%%; font-size:12px; line-height:16px; font-family:arial, tahoma, verdana, sans-serif; color:#333333; border-collapse:collapse; \">"
                          "<thead>"
                            "<tr>"
                              "<th style=\"padding:5px 2px;font-size:11px;line-height:14px;color:#999999;vertical-align:top;white-space:nowrap;border-bottom: 2px solid #ccc;text-align:  left;width: 15%%;min-width: 80px;\" >Transponder</th>"
                              "<th style=\"padding:5px 2px;font-size:11px;line-height:14px;color:#999999;vertical-align:top;white-space:nowrap;border-bottom: 2px solid #ccc;text-align:  left;width: 20%%;min-width: 100px;\">Channel</th>"
                              "<th style=\"padding:5px 2px;font-size:11px;line-height:14px;color:#999999;vertical-align:top;white-space:nowrap;border-bottom: 2px solid #ccc;text-align: right;width:  5%%;min-width: 35px;\" >Timer</th>"
                              "<th style=\"padding:5px 2px;font-size:11px;line-height:14px;color:#999999;vertical-align:top;white-space:nowrap;border-bottom: 2px solid #ccc;text-align:  left;width: 50%%;                \" >File</th>"
                              "<th style=\"padding:5px 2px;font-size:11px;line-height:14px;color:#999999;vertical-align:top;white-space:nowrap;border-bottom: 2px solid #ccc;text-align: right;width:  5%%;min-width: 35px;\" >Begin</th>"
                              "<th style=\"padding:5px 2px;font-size:11px;line-height:14px;color:#999999;vertical-align:top;white-space:nowrap;border-bottom: 2px solid #ccc;text-align: right;width:  5%%;min-width: 45px;\" >End</th>"
                            "</tr>"
                          "</thead>"
                          "%s"
                        "</table>"
                        "<br/>"
                        "<a href=\"http://%s:%d/#menu_timerList\">Timer List</a>"
                      "</td>"
                      "<td style=\"min-width:20px;\">&nbsp;</td>"
                    "</tr>"
                  "</tbody>"
                "</table>"
             "<!--[if (gte mso 9)|(IE)]>"
                     "</td>"
                 "</tr>"
             "</table>"
             "<![endif]-->"
              "</body>"
            "</html>",
            htmlHead,
            mailBody.c_str(),
            !isEmpty(EpgdConfig.httpDevice) ? getIpOf(EpgdConfig.httpDevice) : getIpOf(EpgdConfig.netDevice),
            EpgdConfig.httpPort
      );

   // printf("%s\n", html);  // #DEBUG

   message(3, 'E', "EPGD: Timer conflicts", "%s", html);
   lastMailAt = time(0);
   free(html);

   return success;
}

//***************************************************************************
// Message
//***************************************************************************

int cEpgd::message(int level, char type, const char* title, const char* format, ...)
{
   va_list ap;
   char* message;
   string receivers;
   const char* mimeType = "text/plain";

   va_start(ap, format);
   vasprintf(&message, format, ap);
   va_end(ap);

   messageDb->setCharValue("TYPE", type);
   messageDb->setValue("TITLE", title);
   messageDb->setValue("STATE", "N");
   messageDb->setValue("TEXT", message);
   messageDb->insert();

   tell(level, "(%s) %s", title, message);

   // loop over web users

   parameterDb->clear();

   for (int found = selectWebUsers->find(); found; found = selectWebUsers->fetch())
   {
      char receiver[255+TB] = "";
      char typesToMail[10+TB] = "";
      const char* owner = parameterDb->getStrValue("OWNER");

      getParameter(owner, "messageMailTypes", typesToMail);

      if (!strchr(typesToMail, type))
         continue;

      getParameter(owner, "mailReceiver", receiver);

      if (isEmpty(receiver))
         tell(2, "Info: No mail receiver for user '%s', can't send mail", owner+1);
      else
         receivers += receiver + string(",");
   }

   if (strstr(message, "DOCTYPE html PUBLIC"))
      mimeType = "text/html";

   sendMail(mimeType, receivers.c_str(), title, message);

   free(message);

   return done;
}
