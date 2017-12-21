/*
 * httpd.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "lib/python.h"   // at first du to symbol conflict with older python headers

#include <sys/signal.h>
#include <sys/select.h>

#include <vector>

#include "lib/common.h"
#include "lib/epgservice.h"
#include "lib/curl.h"
#include "lib/wol.h"

#include "svdrpclient.h"
#include "httpd.h"

const char* logPrefix = LOG_PREFIX;
class Python;

const char* realm = "Maintenance";

//***************************************************************************
// EPG Http Daemon
//***************************************************************************

int cEpgHttpd::shutdown = no;
cEpgHttpd* cEpgHttpd::singleton = 0;
const char* confDir = (char*)confDirDefault;

//***************************************************************************
// Rights Management
//***************************************************************************

cEpgHttpd::UserRight cEpgHttpd::userrights[] =
{
   { "/data/parameters",        umAll|umNologin          },
   { "/data/channels",          umAll|umNologin          },
   { "/data/vdrs",              umAll|umNologin          },
   { "/data/login",             umAll|umNologin          },

   { "/data/channellogo",       umAll|umNologin          },
   { "/data/eventimg",          umAll|umNologin          },
   { "/data/moviemedia",        umAll|umNologin          },
   { "/data/seriesmedia",       umAll|umNologin          },
   { "/data/genres",            umAll|umNologin          },
   { "/data/categories",        umAll|umNologin          },

   { "/data/events",            umAll                    },
   { "/data/event",             umAll                    },
   { "/data/timers",            umAll                    },
   { "/data/recordings",        umAll                    },
   { "/data/recording",         umAll                    },
   { "/data/recordingdirs",     umAll                    },
   { "/data/pendingtimerjobs",  umAll                    },
   { "/data/deltimerjob",       umTimerEdit              },
   { "/data/donetimers",        umAll                    },
   { "/data/donetimer",         umAll                    },
   { "/data/searchtimers",      umAll                    },
   { "/data/updatesearchtimer", umAll                    },
   { "/data/updaterecordings",  umAll                    },
   { "/data/replayrecording",   umRecordings             },
   { "/data/channelswitch",     umAll                    },
   { "/data/hitkey",            umAll                    },
   { "/data/log",               umAll|umNologin          },
   { "/data/debug",             umAll                    },
   { "/data/proxy",             umAll                    },
   { "/data/wakeupvdr",         umAll                    },
   { "/data/messages",          umAll                    },

   // needed for store of needLogin :o !

   { "/data/save-parameters",   umAll                    },

   // data request

   { "/data/users",             umConfig                 },

   // data store

   { "/data/sendmail",          umAll                    },
   { "/data/save-channels",     umConfigEdit             },
   { "/data/delete-timerjobs",  umTimerEdit              },
   { "/data/store-donetimers",  umTimerEdit              },
   { "/data/save-timer",        umTimerEdit              },
   { "/data/save-searchtimer",  umSearchTimerEdit        },
   { "/data/search",            umSearchTimer            },
   { "/data/save-users",        umConfigEdit             },
   { "/data/renamerecording",   umRecordingsEdit         },
   { "/data/deleterecording",   umRecordingsEdit         },
   { "/data/markmessages",      umAll                    },

   { 0, umNone }
};

UserMask cEpgHttpd::toRightMask(const char* url)
{
   for (int i = 0; userrights[i].url; i++)
   {
      if (strcmp(userrights[i].url, url) == 0)
         return (UserMask)userrights[i].mask;
   }

   return umNone;
}

//***************************************************************************
// Object
//***************************************************************************

cEpgHttpd::cEpgHttpd()
{
   daemon = 0;
   connection = 0;
   useeventsDb = 0;
   mapDb = 0;
   imageDb = 0;
   imageRefDb = 0;
   vdrDb = 0;
   timerDb = 0;
   timersDoneDb = 0;
   searchtimerDb = 0;
   movieDb = 0;
   movieActorDb = 0;
   movieActorsDb = 0;
   movieMediaDb = 0;
   seriesDb = 0;
   seriesEpisodeDb = 0;
   seriesActorsDb = 0;
   seriesMediaDb = 0;
   recordingDirDb = 0;
   recordingListDb = 0;
   userDb = 0;
   messageDb = 0;

   currentSession = 0;
   loginWithSession = no;
   lastSdWatchdogAt = time(0);

   selectEventsAt = 0;
   selectEventsNext = 0;
   selectEventsStartInRange = 0;
   selectGenres = 0;
   selectCategories = 0;
   selectEvent = 0;
   selectEventByTime = 0;
   selectAllMap = 0;
   selectPendingTimerActions = 0;
   selectDoneTimers = 0;
   selectMapById = 0;
   selectVdrs = 0;
   selectUsers = 0;
   updateMap = 0;
   updateTimerAName = 0;
   updateDoneAName = 0;
   selectAllTimer = 0;
   selectTimerById = 0;
   selectTimerByEventId = 0;
   selectAllSearchTimer = 0;
   selectMovie = 0;
   selectMovieActors = 0;
   selectMovieMedia = 0;
   selectSerie = 0;
   selectSeriesEpisode = 0;
   selectSeriesMedia = 0;
   selectActiveVdrs = 0;
   selectRecordingDirs = 0;
   selectRecordingByPath = 0;
   selectChannelFromMap = 0;
   selectUserByMd5 = 0;
   selectAllRecordings = 0;
   selectRecordingForEventByLv = 0;
   selectPendingMessages = 0;
   selectWebUsers = 0;

   withutf8 = no;

   search = new cSearchTimer(this);
   ptyRecName = new Python("recording", "name");

   setlocale(LC_CTYPE, "");
   const char* lang = setlocale(LC_CTYPE, 0);

   if (lang)
   {
      tell(0, "Set locale to '%s'", lang);

      if ((strcasestr(lang, "UTF-8") != 0) || (strcasestr(lang, "UTF8") != 0))
      {
         tell(0, "detected UTF-8");
         withutf8 = yes;
      }
   }
   else
   {
      tell(0, "Warning: Detecting locale setting for LC_CTYPE failed");
   }

   tzset();  // init timezone environment
}

cEpgHttpd::~cEpgHttpd()
{
   cSystemNotification::notify(evStopping);

   delete search;
   delete ptyRecName;
}

//***************************************************************************
// Init /  Exit
//***************************************************************************

int cEpgHttpd::init()
{
   char* dictPath = 0;
#if MHD_VERSION >= 0x00095102
   int mhdFlags = MHD_USE_EPOLL_INTERNALLY;
#else
   int mhdFlags = MHD_USE_SELECT_INTERNALLY;
#endif
   singleton = this;

   if (readConfig() != success)
      return fail;

   tell(0, "Log level is set to (%d)", EpgdConfig.loglevel);

   if (search->init(confDir) != success)
      return fail;

   if (ptyRecName->init(confDir) != success)
      return fail;

   // initialize the dictionary

   asprintf(&dictPath, "%s/epg.dat", confDir);

   if (dbDict.in(dictPath) != success)
   {
      tell(0, "Fatal: Dictionary not loaded, aborting!");
      return 1;
   }

   tell(0, "Dictionary '%s' loaded", dictPath);
   free(dictPath);

   // init database ...

   cDbConnection::init();
   cDbConnection::setEncoding(withutf8 ? "utf8": "latin1"); // mysql use latin1 for ISO8851-1
   cDbConnection::setHost(EpgdConfig.dbHost);
   cDbConnection::setPort(EpgdConfig.dbPort);
   cDbConnection::setName(EpgdConfig.dbName);
   cDbConnection::setUser(EpgdConfig.dbUser);
   cDbConnection::setPass(EpgdConfig.dbPass);
   cDbConnection::setConfPath(confDir);

   initDb();

   if (EpgdConfig.httpUseTls)
   {
      int status;
      char* path = 0;

#if MHD_VERSION >= 0x00095102
      mhdFlags |= MHD_USE_TLS;
#else
      mhdFlags |= MHD_USE_SSL;
#endif
      asprintf(&path, "%s/server.key", confDir);
      status = loadFromFile(path, &keyPem);
      free(path);
      keyPem.append("\0", 1);
      asprintf(&path, "%s/server.pem", confDir);
      status += loadFromFile(path, &certPem);
      free(path);
      certPem.append("\0", 1);

      if (status != success)
      {
         tell(0, "The key/certificate files could not be loaded");
         return fail;
      }

      tell(0, "Loading key and certificate files succeeded");
   }

   // bind to net device - if configured

   if (!isEmpty(EpgdConfig.httpDevice))
   {
      struct sockaddr_in localSockAddr;
      const char* bindIp = getIpOf(EpgdConfig.httpDevice);
      long localAddr;

      memset((char*)&localSockAddr, 0, sizeof(localSockAddr));
      localSockAddr.sin_family = AF_INET;

      if ((localAddr = inet_addr(bindIp)) == INADDR_NONE)
         return fail;

      // set local endpoint

      memcpy(&localSockAddr.sin_addr, &localAddr, sizeof(struct in_addr));
      localSockAddr.sin_port = htons(EpgdConfig.httpPort);

      tell(0, "Binding listener to '%s' at '%s'", bindIp, EpgdConfig.httpDevice);

      // establish listener

      tell(0, "Starting http server ...");

      if (!EpgdConfig.httpUseTls)
      {
         daemon = MHD_start_daemon(mhdFlags,
                                   EpgdConfig.httpPort,
                                   0, 0,                        // accept policy callback
                                   &dispatcher, 0,              // access handler callback
                                   MHD_OPTION_SOCK_ADDR, (struct sockaddr*)&localSockAddr,
                                   MHD_OPTION_END);
      }
      else
      {
         daemon = MHD_start_daemon(mhdFlags,
                                   EpgdConfig.httpPort,
                                   0, 0,                        // accept policy callback
                                   &dispatcher, 0,              // access handler callback
                                   MHD_OPTION_SOCK_ADDR, (struct sockaddr*)&localSockAddr,
                                   MHD_OPTION_HTTPS_MEM_KEY, keyPem.memory,
                                   MHD_OPTION_HTTPS_MEM_CERT, certPem.memory,
                                   MHD_OPTION_END);
      }
   }
   else
   {
      // establish listener

      tell(0, "Starting http server ...");

      if (!EpgdConfig.httpUseTls)
      {
         daemon = MHD_start_daemon(mhdFlags,
                                   EpgdConfig.httpPort,
                                   0, 0,                        // accept policy callback
                                   &dispatcher, 0,              // access handler callback
                                   MHD_OPTION_END);
      }
      else
      {
         daemon = MHD_start_daemon(mhdFlags,
                                   EpgdConfig.httpPort,
                                   0, 0,                        // accept policy callback
                                   &dispatcher, 0,              // access handler callback
                                   MHD_OPTION_HTTPS_MEM_KEY, keyPem.memory,
                                   MHD_OPTION_HTTPS_MEM_CERT, certPem.memory,
                                   MHD_OPTION_END);
      }
   }

   if (!daemon)
   {
      tell(0, "Error: Start of http server failed");
      return fail;
   }

   tell(0, "Listener at port %d established, waiting for connections", EpgdConfig.httpPort);

   cSystemNotification::notify(evReady);
   cSystemNotification::getWatchdogState(10);

   return success;
}

int cEpgHttpd::exit()
{
   singleton = 0;

   if (daemon)
      MHD_stop_daemon(daemon);

   exitDb();

   cDbConnection::exit();

   return done;
}

//***************************************************************************
// Init DB
//***************************************************************************

cDbFieldDef endTimeDef("ENDTIME", "cnt_starttime+cnt_duration", cDBS::ffInt, 10, cDBS::ftData);
cDbFieldDef startTimeDef("STARTTIME", "cnt_starttime", cDBS::ffInt, 10, cDBS::ftData);
cDbFieldDef mergeDef("MERGE", "merge", cDBS::ffAscii, 50, cDBS::ftData);
cDbFieldDef imageidDef("IMAGEID", "imageid", cDBS::ffUBigInt, 0, cDBS::ftData);
cDbFieldDef matchDensityTitleDef("MATCHDENSITYTITLE", "matchdensitytitle", cDBS::ffInt, 0, cDBS::ftData);
cDbFieldDef matchDensityShorttextDef("MATCHDENSITYSHORTTEXT", "matchdensityshorttext", cDBS::ffInt, 0, cDBS::ftData);
//cDbFieldDef timerStateDef("STATE", "state", cDBS::ffAscii, 100, cDBS::ftData);
//cDbFieldDef timerActionDef("ACTION", "action", cDBS::ffAscii, 100, cDBS::ftData);

//***************************************************************************

int cEpgHttpd::initDb()
{
   int status = success;

   // db connection

   tell(0, "Connecting to database at '%s:%d'", cDbConnection::getHost(), cDbConnection::getPort());

   if (!connection)
      connection = new cDbConnection();

   // open tables

   vdrDb = new cDbTable(connection, "vdrs");
   if (vdrDb->open() != success) return fail;

   useeventsDb = new cDbTable(connection, "useevents");
   if (useeventsDb->open() != success) return fail;

   mapDb = new cDbTable(connection, "channelmap");
   if (mapDb->open() != success) return fail;

   imageDb = new cDbTable(connection, "images");
   if (imageDb->open() != success) return fail;

   imageRefDb = new cDbTable(connection, "imagerefs");
   if (imageRefDb->open() != success) return fail;

   timerDb = new cDbTable(connection, "timers");
   if (timerDb->open() != success) return fail;

   timersDoneDb = new cDbTable(connection, "timersdone");
   if (timersDoneDb->open(yes) != success) return fail;

   searchtimerDb = new cDbTable(connection, "searchtimers");
   if (searchtimerDb->open() != success) return fail;

   movieDb = new cDbTable(connection, "movie");
   if (movieDb->open() != success) return fail;

   movieActorDb = new cDbTable(connection, "movie_actor");
   if (movieActorDb->open() != success) return fail;

   movieActorsDb = new cDbTable(connection, "movie_actors");
   if (movieActorsDb->open() != success) return fail;

   movieMediaDb = new cDbTable(connection, "movie_media");
   if (movieMediaDb->open() != success) return fail;

   seriesDb = new cDbTable(connection, "series");
   if (seriesDb->open() != success) return fail;

   seriesEpisodeDb = new cDbTable(connection, "series_episode");
   if (seriesEpisodeDb->open() != success) return fail;

   seriesMediaDb = new cDbTable(connection, "series_media");
   if (seriesMediaDb->open() != success) return fail;

   seriesActorsDb = new cDbTable(connection, "series_actor");
   if (seriesActorsDb->open() != success) return fail;

   recordingDirDb = new cDbTable(connection, "recordingdirs");
   if (recordingDirDb->open() != success) return fail;

   recordingListDb = new cDbTable(connection, "recordinglist");
   if ((status = recordingListDb->open()) != success) return status;

   userDb = new cDbTable(connection, "users");
   if ((status = userDb->open()) != success) return status;

   messageDb = new cDbTable(connection, "messages");
   if (messageDb->open() != success) return fail;

   if ((status = cParameters::initDb(connection)) != success)
       return status;

   // ----------
   // select *
   //    from vdrs

   selectVdrs = new cDbStatement(vdrDb);

   selectVdrs->build("select ");
   selectVdrs->bindAllOut();
   selectVdrs->build(" from %s", vdrDb->TableName());

   status += selectVdrs->prepare();

   // ----------
   // select ip, svdrp from vdrs
   //   where state = 'attached'

   selectActiveVdrs = new cDbStatement(vdrDb);

   selectActiveVdrs->build("select ");
   selectActiveVdrs->bind("IP", cDBS::bndOut);
   selectActiveVdrs->bind("SVDRP", cDBS::bndOut, ", ");
   selectActiveVdrs->bind("SHAREINWEB", cDBS::bndOut, ", ");
   selectActiveVdrs->build(" from %s where state = 'attached' and svdrp > 0", vdrDb->TableName());

   status += selectActiveVdrs->prepare();

   // ----------
   // select *
   //    from users

   selectUsers = new cDbStatement(userDb);

   selectUsers->build("select ");
   selectUsers->bindAllOut();
   selectUsers->build(" from %s", userDb->TableName());

   status += selectUsers->prepare();

   // select distinct(genre)
   //    from events

   selectGenres = new cDbStatement(useeventsDb);

   selectGenres->build("select distinct(");
   selectGenres->bind("Genre", cDBS::bndOut);
   selectGenres->build(") from %s", useeventsDb->TableName());

   status += selectGenres->prepare();

   // select distinct(category)
   //    from events

   selectCategories = new cDbStatement(useeventsDb);

   selectCategories->build("select distinct(");
   selectCategories->bind("Category", cDBS::bndOut);
   selectCategories->build(") from %s", useeventsDb->TableName());

   status += selectCategories->prepare();

   // -> select events running at specific time
   //
   // select e.useid, e.channelid,
   //        e.imagecount, e.title, e.shorttext, e.shortdescription,
   //        e.starttime, e.duration, e.category, e.genre, e.tipp, e.numrating
   //    from eventsviewplain e, (select distinct channelid,channelname,ord,visible from channelmap) c
   //      where
   //        e.channelid = c.channelid
   //        and c.visible & 1
   //        and e.starttime <= ?
   //        and e.cnt_starttime+cnt_duration >= ?
   //        and e.channelid like ?
   //        and e.updflg in (...)
   //      order by c.ord, e.cnt_starttime

   selectEventsAt = new cDbStatement(useeventsDb);

   endTime.setField(&endTimeDef);

   selectEventsAt->build("select ");
   selectEventsAt->setBindPrefix("e.");
   selectEventsAt->bind("UseId", cDBS::bndOut);
   selectEventsAt->bind("ChannelId", cDBS::bndOut, ", ");
   // selectEventsAt->bind("UpdFlg", cDBS::bndOut, ", ");
   selectEventsAt->bind("ImageCount", cDBS::bndOut, ", ");
   selectEventsAt->bind("Title", cDBS::bndOut, ", ");
   selectEventsAt->bind("ShortText", cDBS::bndOut, ", ");
   selectEventsAt->bind("ShortDescription", cDBS::bndOut, ", ");
   selectEventsAt->bind("StartTime", cDBS::bndOut, ", ");
   selectEventsAt->bind("Duration", cDBS::bndOut, ", ");
   selectEventsAt->bind("Category", cDBS::bndOut, ", ");
   selectEventsAt->bind("Genre", cDBS::bndOut, ", ");
   selectEventsAt->bind("Tipp", cDBS::bndOut, ", ");
   selectEventsAt->bind("Numrating", cDBS::bndOut, ", ");
   selectEventsAt->build(" from eventsviewplain e, (select distinct channelid,channelname,ord,visible from %s) c where ", mapDb->TableName());
   selectEventsAt->build("e.%s = c.%s and c.visible & 1",
                         useeventsDb->getField("ChannelId")->getDbName(),
                         mapDb->getField("ChannelId")->getDbName());
   selectEventsAt->bindCmp(0, "StartTime", 0, "<=", " and ");
   selectEventsAt->bindCmp(0, &endTime, ">", " and ");
   selectEventsAt->bindCmp(0, "ChannelId", 0, "like", " and ");
   selectEventsAt->build(" and e.updflg in (%s) order by c.ord, e.cnt_starttime", cEventState::getVisible());

   status += selectEventsAt->prepare();

   // -> select events starting in specified range
   //
   // select e.useid, e.channelid,
   //        e.imagecount, e.title, e.shorttext, e.shortdescription,
   //        e.starttime, e.duration, e.category, e.genre, e.tipp, e.numrating
   //    from eventsviewplain e, (select distinct channelid, channelname, ord, visible from channelmap) c
   //      where
   //        e.channelid = c.channelid
   //        and c.visible & 1
   //        and e.cnt_starttime >= ?
   //        and e.cnt_starttime <= ?
   //        and e.channelid like ?
   //        and e.updflg in (...)
   //      order by c.ord, e.cnt_starttime

   selectEventsStartInRange = new cDbStatement(useeventsDb);

   startTime.setField(&startTimeDef);

   selectEventsStartInRange->build("select ");
   selectEventsStartInRange->setBindPrefix("e.");
   selectEventsStartInRange->bind("UseId", cDBS::bndOut);
   selectEventsStartInRange->bind("ChannelId", cDBS::bndOut, ", ");
   // selectEventsStartInRange->bind("UpdFlg", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("ImageCount", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("Title", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("ShortText", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("ShortDescription", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("StartTime", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("Duration", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("Category", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("Genre", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("Tipp", cDBS::bndOut, ", ");
   selectEventsStartInRange->bind("Numrating", cDBS::bndOut, ", ");
   selectEventsStartInRange->build(" from eventsviewplain e, (select distinct channelid,channelname,ord,visible from %s) c where ", mapDb->TableName());
   selectEventsStartInRange->build("e.%s = c.%s and c.visible & 1",
                                   useeventsDb->getField("ChannelId")->getDbName(),
                                   mapDb->getField("ChannelId")->getDbName());
   selectEventsStartInRange->bindCmp(0, "StartTime", 0, ">=", " and ");
   selectEventsStartInRange->bindCmp(0, &startTime, "<=", " and ");
   selectEventsStartInRange->bindCmp(0, "ChannelId", 0, "like", " and ");
   selectEventsStartInRange->build(" and e.updflg in (%s) order by c.ord, e.cnt_starttime", cEventState::getVisible());

   status += selectEventsStartInRange->prepare();

   // -> select events running after current event
   //
   // select e.useid, e.channelid,
   //        e.imagecount, e.title, e.shorttext, e.shortdescription, e.starttime,
   //        e.duration, e.category, e.genre, e.tipp, e.numrating
   //   from
   //      (select
   //         min(concat(e.starttime,e.channelid,e.source)) PK,
   //         e.channelid,
   //         c.ord
   //       from eventsviewplain e, (select distinct channelid,channelname,ord,visible from channelmap) c
   //       where
   //        e.channelid = c.channelid and
   //        e.updflg in ('A','L','P') and
   //        c.visible & 1 and
   //        e.starttime between unix_timestamp() and unix_timestamp() + 127800
   //       group by e.channelid, c.ord
   //       ) s,
   //    eventsviewplain e
   //   where
   //    s.PK = concat(e.starttime, e.channelid, e.source) and
   //    e.starttime between unix_timestamp() and unix_timestamp() + 127800
   //    order by s.ord, e.starttime;

   selectEventsNext = new cDbStatement(useeventsDb);

   selectEventsNext->build("select ");
   selectEventsNext->setBindPrefix("e.");
   selectEventsNext->bind("UseId", cDBS::bndOut);
   selectEventsNext->bind("ChannelId", cDBS::bndOut, ", ");
   selectEventsNext->bind("ImageCount", cDBS::bndOut, ", ");
   selectEventsNext->bind("Title", cDBS::bndOut, ", ");
   selectEventsNext->bind("ShortText", cDBS::bndOut, ", ");
   selectEventsNext->bind("ShortDescription", cDBS::bndOut, ", ");
   selectEventsNext->bind("StartTime", cDBS::bndOut, ", ");
   selectEventsNext->bind("Duration", cDBS::bndOut, ", ");
   selectEventsNext->bind("Category", cDBS::bndOut, ", ");
   selectEventsNext->bind("Genre", cDBS::bndOut, ", ");
   selectEventsNext->bind("Tipp", cDBS::bndOut, ", ");
   selectEventsNext->bind("Numrating", cDBS::bndOut, ", ");
   selectEventsNext->build(" from (select min(concat(e.%s, e.%s, e.%s)) PK, e.%s, c.%s",
                           useeventsDb->getField("STARTTIME")->getDbName(),
                           useeventsDb->getField("CHANNELID")->getDbName(),
                           useeventsDb->getField("CNTSOURCE")->getDbName(),
                           useeventsDb->getField("CHANNELID")->getDbName(),
                           mapDb->getField("ORDER")->getDbName());
   selectEventsNext->build(" from eventsviewplain e, (select distinct channelid,channelname,ord,visible from %s) c where ", mapDb->TableName());

   selectEventsNext->build("e.%s = c.%s and c.visible & 1 and e.updflg in (%s)",
                           useeventsDb->getField("ChannelId")->getDbName(),
                           mapDb->getField("ChannelId")->getDbName(),
                           cEventState::getVisible());
   selectEventsNext->bindCmp(0, "STARTTIME", 0, ">", " and ");
   selectEventsNext->bindCmp(0, "STARTTIME", 0, "< 127800 +", " and ");
   selectEventsNext->build(" group by e.%s, c.%s) s,", useeventsDb->getField("CHANNELID")->getDbName(), mapDb->getField("ORDER")->getDbName());
   selectEventsNext->build(" eventsviewplain e where ");
   selectEventsNext->build("s.PK = concat(e.%s, e.%s, e.%s)",
                           useeventsDb->getField("STARTTIME")->getDbName(),
                           useeventsDb->getField("CHANNELID")->getDbName(),
                           useeventsDb->getField("CNTSOURCE")->getDbName());
   selectEventsNext->bindCmp(0, "STARTTIME", 0, ">", " and ");
   selectEventsNext->bindCmp(0, "STARTTIME", 0, "< 127800 +", " and ");
   selectEventsNext->build(" order by s.%s, e.%s",
                           mapDb->getField("ORDER")->getDbName(),
                           useeventsDb->getField("STARTTIME")->getDbName());

   status += selectEventsNext->prepare();

   // prepare fields for selects

   merge.setField(&mergeDef);
   imageid.setField(&imageidDef);

   // select imageid, merge, *
   //    from eventsviewplain  where
   //        useid = ?

   selectEvent = new cDbStatement(useeventsDb);

   selectEvent->build("select ");
   selectEvent->bind(&imageid, cDBS::bndOut);
   selectEvent->bind(&merge, cDBS::bndOut, ", ");
   selectEvent->bindAllOut(", ");
   selectEvent->build(" from eventsviewplain where ");
   selectEvent->bind("USEID",  cDBS::bndIn | cDBS::bndSet);

   status += selectEvent->prepare();

   // select imageid, merge, *
   //    from eventsviewplain  where
   //          channleid = ?
   //      and cnt_starttime <= ?
   //      and cnt_starttime+cnt_duration >= ?

   selectEventByTime = new cDbStatement(useeventsDb);

   selectEventByTime->build("select ");
   selectEventByTime->bind(&imageid, cDBS::bndOut);
   selectEventByTime->bind(&merge, cDBS::bndOut, ", ");
   selectEventByTime->bindAllOut(", ");
   selectEventByTime->build(" from eventsviewplain where ");
   selectEventByTime->bind("CHANNELID",  cDBS::bndIn | cDBS::bndSet);
   selectEventByTime->bindCmp(0, "STARTTIME", 0, "<=", " and ");
   selectEventByTime->bindCmp(0, &endTime, ">=", " and ");

   status += selectEventByTime->prepare();

   // select * from movie
   //   where movie_id = ?

   selectMovie = new cDbStatement(movieDb);

   selectMovie->build("select ");
   selectMovie->bindAllOut();
   selectMovie->build(" from %s where ", movieDb->TableName());
   selectMovie->bind("MOVIEID",  cDBS::bndIn | cDBS::bndSet);

   status += selectMovie->prepare();

   // select act.actor_id, act.actor_name, actors.actor_role, media.media_url, media.media_type,
   //      length(media.media_content)
   //   from movie_actor act, movie_actors actors
   //      left outer join movie_media media on (actors.actor_id = media.actor_id)
   //   where act.actor_id = actors.actor_id  and actors.movie_id = ?

   // imageSize.setField(&imageSizeDef);
   selectMovieActors = new cDbStatement(movieActorDb);
   selectMovieActors->build("select ");
   selectMovieActors->setBindPrefix("act.");
   selectMovieActors->bind("ActorId", cDBS::bndOut);
   selectMovieActors->bind("ActorName", cDBS::bndOut, ", ");
   selectMovieActors->setBindPrefix("actors.");
   selectMovieActors->bind(movieActorsDb, "Role", cDBS::bndOut, ", ");
   selectMovieActors->setBindPrefix("media.");
   selectMovieActors->bind(movieMediaDb, "MediaUrl", cDBS::bndOut, ", ");
   selectMovieActors->bind(movieMediaDb, "MediaType", cDBS::bndOut, ", ");
   // selectMovieActors->build(", length(");
   // selectMovieActors->bind(&imageSize, cDBS::bndOut);
   // selectMovieActors->build(")");
   selectMovieActors->clrBindPrefix();
   selectMovieActors->build(" from %s act, %s actors left outer join %s media on (actors.%s = media.%s) where ",
                            movieActorDb->TableName(), movieActorsDb->TableName(), movieMediaDb->TableName(),
                            movieActorsDb->getField("ActorId")->getDbName(),
                            movieMediaDb->getField("ActorId")->getDbName());
   selectMovieActors->build("act.%s = actors.%s ",
                            movieActorDb->getField("ActorId")->getDbName(),
                            movieActorsDb->getField("ActorId")->getDbName());
   selectMovieActors->setBindPrefix("actors.");
   selectMovieActors->bind(movieActorsDb, "MovieId", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectMovieActors->prepare();

   // select media_type, media.media_url, length(media_content)
   //   from movie_media
   //   where
   //     media.movie_id  = ?

   selectMovieMedia = new cDbStatement(movieMediaDb);

   selectMovieMedia->build("select ");
   selectMovieMedia->bind("MediaUrl", cDBS::bndOut);
   selectMovieMedia->bind("MediaType", cDBS::bndOut, ", ");
   // selectMovieMedia->build(", length(");
   // selectMovieMedia->bind(&imageSize, cDBS::bndOut);
   // selectMovieMedia->build(")");
   selectMovieMedia->build(" from %s where ", movieMediaDb->TableName());
   selectMovieMedia->bind("MovieId", cDBS::bndIn | cDBS::bndSet);

   status += selectMovieMedia->prepare();

   // select .... from series
   //   where series_id = ?

   selectSerie = new cDbStatement(seriesDb);

   selectSerie->build("select ");
   selectSerie->bindAllOut();
   selectSerie->build(" from %s where ", seriesDb->TableName());
   selectSerie->bind("SeriesId",  cDBS::bndIn | cDBS::bndSet);

   status += selectSerie->prepare();

   // select .... from series_episode
   //   where episode_id = ?

   selectSeriesEpisode = new cDbStatement(seriesEpisodeDb);

   selectSeriesEpisode->build("select ");
   selectSeriesEpisode->bindAllOut();
   selectSeriesEpisode->build(" from %s where ", seriesEpisodeDb->TableName());
   selectSeriesEpisode->bind("EPISODEID",  cDBS::bndIn | cDBS::bndSet);

   status += selectSeriesEpisode->prepare();

   // select
   //     m.episode_id, m.season_number, m.actor_id, m.media_type, m.media_url, m.media_rating,
   //     a.actor_name, a.actor_role, a.actor_sortorder
   //   from series_media m
   //     left outer join series_actor a on (a.actor_id = m.actor_id)
   //   where m.series_id = ?
   //     and (m.episode_id    = 0 or m.episode_id    = ?)
   //     and (m.season_number = 0 or m.season_number = ?)

   selectSeriesMedia = new cDbStatement(seriesMediaDb);

   selectSeriesMedia->build("select ");
   selectSeriesMedia->setBindPrefix("m.");
   selectSeriesMedia->bind("EpisodeId",    cDBS::bndOut);
   selectSeriesMedia->bind("SeasonNumber", cDBS::bndOut, ", ");
   selectSeriesMedia->bind("ActorId",      cDBS::bndOut, ", ");
   selectSeriesMedia->bind("MediaType",    cDBS::bndOut, ", ");
   selectSeriesMedia->bind("MediaUrl",     cDBS::bndOut, ", ");
   selectSeriesMedia->bind("MediaRating",  cDBS::bndOut, ", ");
   selectSeriesMedia->setBindPrefix("a.");
   selectSeriesMedia->bind(seriesActorsDb, "ActorName", cDBS::bndOut, ", ");
   selectSeriesMedia->bind(seriesActorsDb, "ActorRole", cDBS::bndOut, ", ");
   selectSeriesMedia->bind(seriesActorsDb, "SortOrder", cDBS::bndOut, ", ");
   selectSeriesMedia->clrBindPrefix();
   selectSeriesMedia->build(" from %s m left outer join %s a on (m.%s = a.%s) where ",
                           seriesMediaDb->TableName(), seriesActorsDb->TableName(),
                           movieActorsDb->getField("ActorId")->getDbName(),
                           movieMediaDb->getField("ActorId")->getDbName());
   selectSeriesMedia->setBindPrefix("m.");
   selectSeriesMedia->bind("SeriesId", cDBS::bndIn | cDBS::bndSet);
   selectSeriesMedia->build(" and (m.episode_id = 0 or ");
   selectSeriesMedia->bind("EpisodeId", cDBS::bndIn | cDBS::bndSet);
   selectSeriesMedia->build(") and (m.season_number = 0 or ");
   selectSeriesMedia->bind("SeasonNumber", cDBS::bndIn | cDBS::bndSet);
   selectSeriesMedia->build(")");

   status += selectSeriesMedia->prepare();

   // select *
   //    from channelmap order by ord;

   selectAllMap = new cDbStatement(mapDb);

   selectAllMap->build("select ");
   selectAllMap->bindAllOut();
   selectAllMap->build(" from %s order by %s", mapDb->TableName(),
                       mapDb->getField("ORDER")->getDbName());

   status += selectAllMap->prepare();

   // select t.*,
   //       e.eventid, e.channelid, e.title, e.shorttext, e.shortdescription, e.category, e.genre, e.tipp, e.numrating
   //    from timers t left outer join events e
   //       on (t.eventid = e.masterid and e.updflg in (...))
   //    where
   //      t.state in (?)

   // timerIncState.setField(&timerStateDef);
   // timerExcState.setField(&timerStateDef);
   // timerIncAction.setField(&timerActionDef);
   // timerExcAction.setField(&timerActionDef);

   selectAllTimer = new cDbStatement(timerDb);

   selectAllTimer->build("select ");
   selectAllTimer->setBindPrefix("t.");
   selectAllTimer->bindAllOut();
   selectAllTimer->setBindPrefix("e.");
   selectAllTimer->bind(useeventsDb, "USEID", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "CHANNELID", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "CNTSOURCE", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "CNTEVENTID", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "TITLE", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "SHORTTEXT", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "SHORTDESCRIPTION", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "CATEGORY", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "GENRE", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "TIPP", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "NUMRATING", cDBS::bndOut, ", ");
   selectAllTimer->clrBindPrefix();
   selectAllTimer->build(" from %s t left outer join %s e",
                         timerDb->TableName(), "eventsviewplain");
   selectAllTimer->build(" on (t.eventid = e.cnt_useid) and e.updflg in (%s)", cEventState::getVisible());
   // selectAllTimer->build(" where ");
   // selectAllTimer->bindInChar("t", "STATE", &timerIncState);
   // selectAllTimer->bindInChar("t", "STATE", &timerExcState, " and not ");
   // selectAllTimer->bindInChar("t", "ACTION", &timerIncAction, " and ");
   // selectAllTimer->bindInChar("t", "ACTION", &timerExcAction, " and not ");

   status += selectAllTimer->prepare();

   // select *
   //   from timers where
   //     id = ?

   selectTimerById = new cDbStatement(timerDb);

   selectTimerById->build("select ");
   selectTimerById->bindAllOut();
   selectTimerById->build(" from %s where ", timerDb->TableName());
   selectTimerById->bind("ID", cDBS::bndIn | cDBS::bndSet);

   status += selectTimerById->prepare();

   // select *
   //   from timers where
   //     state not in ('D','E')
   //     eventid = ? and channelid = ?

   selectTimerByEventId = new cDbStatement(timerDb);

   selectTimerByEventId->build("select ");
   selectTimerByEventId->bindAllOut();
   selectTimerByEventId->build(" from %s where ", timerDb->TableName());
   selectTimerByEventId->build(" %s not in ('D', 'E', '-')", timerDb->getField("STATE")->getDbName());
   selectTimerByEventId->bind("EVENTID", cDBS::bndIn | cDBS::bndSet, " and ");
   selectTimerByEventId->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectTimerByEventId->prepare();

   // select *
   //  from searchtimers
   //  where state <> 'D'

   selectAllSearchTimer = new cDbStatement(searchtimerDb);

   selectAllSearchTimer->build("select ");
   selectAllSearchTimer->bindAllOut();
   selectAllSearchTimer->build(" from %s where ", searchtimerDb->TableName());
   selectAllSearchTimer->build(" %s <> 'D'",
                               searchtimerDb->getField("STATE")->getDbName());

   status += selectAllSearchTimer->prepare();

   // update searchtimers set autotimername = ?
   //    whrer autotimerid = ?

   updateTimerAName = new cDbStatement(timerDb);

   updateTimerAName->build("update %s set ", timerDb->TableName());
   updateTimerAName->bind("AUTOTIMERNAME", cDBS::bndIn | cDBS::bndSet);
   updateTimerAName->build(" where ");
   updateTimerAName->bind("AUTOTIMERID", cDBS::bndIn | cDBS::bndSet);

   status += updateTimerAName->prepare();

   // update timersdonedb set autotimername = ?
   //    whrer autotimerid = ?

   updateDoneAName = new cDbStatement(timersDoneDb);

   updateDoneAName->build("update %s set ", timersDoneDb->TableName());
   updateDoneAName->bind("AUTOTIMERNAME", cDBS::bndIn | cDBS::bndSet);
   updateDoneAName->build(" where ");
   updateDoneAName->bind("AUTOTIMERID", cDBS::bndIn | cDBS::bndSet);

   status += updateDoneAName->prepare();

   // select *, inssp, updsp
   //   from timers
   //   where ACTION != 'A'

   selectPendingTimerActions = new cDbStatement(timerDb);

   selectPendingTimerActions->build("select ");
   selectPendingTimerActions->bindAllOut();
   selectPendingTimerActions->bind("INSSP", cDBS::bndOut, ", ");
   selectPendingTimerActions->bind("UPDSP", cDBS::bndOut, ", ");
   selectPendingTimerActions->build(" from %s where %s != 'A'",    // taAssumed
                                 timerDb->TableName(),
                                 timerDb->getField("ACTION")->getDbName());

   status += selectPendingTimerActions->prepare();

   // select *, inssp, updsp
   //   from timersdone

   selectDoneTimers = new cDbStatement(timersDoneDb);

   selectDoneTimers->build("select ");
   selectDoneTimers->bindAllOut();
   selectDoneTimers->bind("INSSP", cDBS::bndOut, ", ");
   selectDoneTimers->bind("UPDSP", cDBS::bndOut, ", ");
   selectDoneTimers->build(" from %s", timersDoneDb->TableName());

   status += selectDoneTimers->prepare();

   // select channelname
   //    from channelmap
   //    where channelid = ?
   //      and channelname is not null

   selectMapById = new cDbStatement(mapDb);

   selectMapById->build("select ");
   selectMapById->bind("ChannelName", cDBS::bndOut);
   selectMapById->build(" from %s where ", mapDb->TableName());
   selectMapById->bind("ChannelId", cDBS::bndIn | cDBS::bndSet);
   selectMapById->build(" and channelname is not null");

   status += selectMapById->prepare();

   // update channelmap set ord = ?, visible = ?, channelname = ?
   //    where channelid = ?

   updateMap = new cDbStatement(mapDb);

   updateMap->build("update %s set ", mapDb->TableName());
   updateMap->bind("ORDER", cDBS::bndIn | cDBS::bndSet);
   updateMap->bind("VISIBLE", cDBS::bndIn | cDBS::bndSet, ", ");
   updateMap->bind("CHANNELNAME", cDBS::bndIn | cDBS::bndSet, ", ");
   updateMap->build(" where ");
   updateMap->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet);

   status += updateMap->prepare();

   // ----------
   // select channelname
   //   from channelmap
   //   where channelid = ?

   selectChannelFromMap = new cDbStatement(mapDb);

   selectChannelFromMap->build("select ");
   selectChannelFromMap->bind("CHANNELNAME", cDBS::bndOut);
   selectChannelFromMap->bind("UNKNOWNATVDR", cDBS::bndOut, ", ");
   selectChannelFromMap->build(" from %s where ", mapDb->TableName());
   selectChannelFromMap->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet);

   status += selectChannelFromMap->prepare();

   // ----------
   // select * from recordingdirs
   //   where owner = ?

   selectRecordingDirs = new cDbStatement(recordingDirDb);

   selectRecordingDirs->build("select ");
   selectRecordingDirs->bindAllOut();
   selectRecordingDirs->build(" from %s order by vdruuid, directory", recordingDirDb->TableName());

   status += selectRecordingDirs->prepare();

   // ----------
   // select * from users
   //   where passwd = ?

   selectUserByMd5 = new cDbStatement(userDb);

   selectUserByMd5->build("select ");
   selectUserByMd5->bindAllOut();
   selectUserByMd5->build(" from %s where ", userDb->TableName());
   selectUserByMd5->bind("PASSWD", cDBS::bndIn | cDBS::bndSet);
   // selectUserByMd5->bindText("md5(passwd)", userDb->getValue("passwd"), "=");

   status += selectUserByMd5->prepare();

   // ----------
   // select *
   //   from recordinglist

   selectAllRecordings = new cDbStatement(recordingListDb);

   selectAllRecordings->build("select ");
   selectAllRecordings->setBindPrefix("r.");
   selectAllRecordings->bindAllOut();
   selectAllRecordings->setBindPrefix("v.");
   selectAllRecordings->bind(vdrDb, "SHAREINWEB", cDBS::bndOut, ", ");
   selectAllRecordings->clrBindPrefix();
   selectAllRecordings->build(" from %s r, %s v where",
                              recordingListDb->TableName(),
                              vdrDb->TableName());
   selectAllRecordings->build(" r.%s = v.%s",
                              recordingListDb->getField("VDRUUID")->getDbName(),
                              vdrDb->getField("UUID")->getDbName());
   selectAllRecordings->build(" and (r.%s <> 'D' or r.%s is null)",
                              recordingListDb->getField("STATE")->getDbName(),
                              vdrDb->getField("STATE")->getDbName());

   status += selectAllRecordings->prepare();

   // select *,
   //    epglvr(title, ?)
   //    epglvr(shorttext, ?)
   //   from recordinglist where
   //      (state <> 'D' or state is null)
   //   and epglvr(title, ?) < 50
//   // order by lv

   matchDensityTitle.setField(&matchDensityTitleDef);
   matchDensityShorttext.setField(&matchDensityShorttextDef);

   selectRecordingForEventByLv = new cDbStatement(recordingListDb);

   selectRecordingForEventByLv->build("select ");
   selectRecordingForEventByLv->bindAllOut();
   selectRecordingForEventByLv->bindTextFree(", 100 - ifNull(epglvr(title, ?), 100)", &matchDensityTitle, cDBS::bndOut);
   selectRecordingForEventByLv->appendBinding(recordingListDb->getValue("TITLE"), cDBS::bndIn);
   selectRecordingForEventByLv->bindTextFree(", 100 - ifNull(epglvr(shorttext, ?), 100)", &matchDensityShorttext, cDBS::bndOut);
   selectRecordingForEventByLv->appendBinding(recordingListDb->getValue("SHORTTEXT"), cDBS::bndIn);
   selectRecordingForEventByLv->build(" from %s where ", recordingListDb->TableName());
   selectRecordingForEventByLv->build(" (%s <> 'D' or %s is null)",
                                  recordingListDb->getField("STATE")->getDbName(),
                                  recordingListDb->getField("STATE")->getDbName());
   selectRecordingForEventByLv->bindTextFree("and epglvr(title, ?) < 47", recordingListDb->getValue("TITLE"), cDBS::bndIn);

   status += selectRecordingForEventByLv->prepare();

   // select *
   //   from recordinglist where
   //      state <> 'D'
   //     snd path = ?

   selectRecordingByPath = new cDbStatement(recordingListDb);

   selectRecordingByPath->build("select ");
   selectRecordingByPath->bindAllOut();
   selectRecordingByPath->build(" from %s where ", recordingListDb->TableName());
   selectRecordingByPath->build(" (%s <> 'D' or %s is null)",
                             recordingListDb->getField("STATE")->getDbName(),
                             recordingListDb->getField("STATE")->getDbName());
   selectRecordingByPath->bind("PATH", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectRecordingByPath->prepare();

   // select *, inssp, updsp
   //   from messages
   //   where STATE != 'D'

   selectPendingMessages = new cDbStatement(messageDb);

   selectPendingMessages->build("select ");
   selectPendingMessages->bindAllOut();
   selectPendingMessages->bind("INSSP", cDBS::bndOut, ", ");
   selectPendingMessages->bind("UPDSP", cDBS::bndOut, ", ");
   selectPendingMessages->build(" from %s where %s != 'D'",
                                messageDb->TableName(),
                                messageDb->getField("STATE")->getDbName());

   status += selectPendingMessages->prepare();

   // ----------
   // select distinct(owner) from parameters
   //   where owner like '@%';

   selectWebUsers = new cDbStatement(parametersDb);

   selectWebUsers->build("select distinct(");
   selectWebUsers->bind("OWNER", cDBS::bndOut);
   selectWebUsers->build(") from %s where %s like '@%%'",
                         parametersDb->TableName(),
                         parametersDb->getField("OWNER")->getDbName());

   status += selectWebUsers->prepare();

   // ---------
   // ....

   status += search->initDb();

   // init some DB values for faster and easier access

   status += vdrDb->init(vdrState, "State")
      + vdrDb->init(vdrIp, "Ip")
      + vdrDb->init(vdrSvdrp, "Svdrp")
      + vdrDb->init(vdrUuid, "UUID")

      + useeventsDb->init(eventsUpdSp, "UpdSp")
      + useeventsDb->init(eventsGenre, "Genre")
      + useeventsDb->init(eventsCategory, "Category")

      + mapDb->init(mapChannelName, "ChannelName")
      + mapDb->init(mapChannelId, "ChannelId")
      + mapDb->init(mapSource, "Source")

      + imageRefDb->init(imagerefImgName, "ImgName")
      + imageDb->init(imageUpdSp, "UpdSp")
      + imageDb->init(imageImage, "Image")

      + movieActorDb->init(movieactorActorId, "ActorId")
      + movieMediaDb->init(moviemediaMediaContent, "MediaContent")
      + movieMediaDb->init(moviemediaMediaType, "MediaType")
      + seriesEpisodeDb->init(seriesepisodeSeasonNumber, "SeasonNumber")
      + seriesEpisodeDb->init(seriesepisodeEpisodeId, "EpisodeId")

      + seriesMediaDb->init(seriesmediaMediaContent, "MediaContent")
      + seriesMediaDb->init(seriesmediaMediaType, "MediaType")
      + seriesMediaDb->init(seriesmediaActorId, "ActorId");

   return status;
}

//***************************************************************************
// ExitDb
//***************************************************************************

int cEpgHttpd::exitDb()
{
   search->exitDb();
   cParameters::exitDb();

   delete selectEventsAt;            selectEventsAt = 0;
   delete selectEventsNext;          selectEventsNext = 0;
   delete selectEventsStartInRange;  selectEventsStartInRange = 0;
   delete selectGenres;              selectGenres = 0;
   delete selectCategories;          selectCategories = 0;
   delete selectEvent;               selectEvent = 0;
   delete selectEventByTime;         selectEventByTime = 0;
   delete selectAllMap;              selectAllMap = 0;
   delete selectMapById;             selectMapById = 0;
   delete selectVdrs;                selectVdrs = 0;
   delete selectUsers;               selectUsers = 0;
   delete updateMap;                 updateMap = 0;
   delete updateTimerAName;          updateTimerAName = 0;
   delete updateDoneAName;           updateDoneAName = 0;

   delete selectAllTimer;            selectAllTimer = 0;
   delete selectTimerById;           selectTimerById = 0;
   delete selectTimerByEventId;      selectTimerByEventId = 0;
   delete selectAllSearchTimer;      selectAllSearchTimer = 0;
   delete selectMovie;               selectMovie = 0;
   delete selectMovieActors;         selectMovieActors = 0;
   delete selectMovieMedia;          selectMovieMedia = 0;
   delete selectSerie;               selectSerie = 0;
   delete selectSeriesEpisode;       selectSeriesEpisode = 0;
   delete selectSeriesMedia;         selectSeriesMedia = 0;
   delete selectPendingTimerActions; selectPendingTimerActions = 0;
   delete selectDoneTimers;          selectDoneTimers = 0;
   delete selectActiveVdrs;          selectActiveVdrs = 0;
   delete selectRecordingDirs;       selectRecordingDirs = 0;
   delete selectRecordingByPath;     selectRecordingByPath = 0;
   delete selectRecordingForEventByLv; selectRecordingForEventByLv = 0;
   delete selectChannelFromMap;      selectChannelFromMap = 0;
   delete selectPendingMessages;     selectPendingMessages = 0;
   delete selectWebUsers;            selectWebUsers = 0;

   delete timerDb;                   timerDb = 0;
   delete timersDoneDb;              timersDoneDb = 0;
   delete searchtimerDb;             searchtimerDb = 0;
   delete vdrDb;                     vdrDb = 0;
   delete useeventsDb;               useeventsDb = 0;
   delete mapDb;                     mapDb = 0;
   delete imageDb;                   imageDb = 0;
   delete imageRefDb;                imageRefDb = 0;
   delete movieDb;                   movieDb = 0;
   delete movieActorsDb;             movieActorsDb = 0;
   delete movieActorDb;              movieActorDb = 0;
   delete movieMediaDb;              movieMediaDb = 0;
   delete seriesDb;                  seriesDb = 0;
   delete seriesEpisodeDb;           seriesEpisodeDb = 0;
   delete seriesMediaDb;             seriesMediaDb= 0;
   delete seriesActorsDb;            seriesActorsDb = 0;
   delete recordingDirDb;            recordingDirDb = 0;
   delete recordingListDb;           recordingListDb = 0;
   delete userDb;                    userDb = 0;
   delete messageDb;                 messageDb = 0;

   delete connection;                connection = 0;

   return done;
}

//***************************************************************************
// Loop
//***************************************************************************

int cEpgHttpd::loop()
{
   while (!doShutDown())
   {
      cSystemNotification::check();
      sleep(1);
   }

   return done;
}

//***************************************************************************
// Check Connection
//***************************************************************************

int cEpgHttpd::checkConnection()
{
   static int retry = 0;

   // check connection

   if (!dbConnected(yes))
   {
      // try to connect

      tell(0, "Trying to re-connect to database!");
      retry++;

      if (initDb() != success)
      {
         tell(0, "Retry #%d failed!", retry);
         exitDb();

         return fail;
      }

      retry = 0;
      tell(0, "Connection established successfull!");
   }

   return success;
}

//***************************************************************************
// Check Session
//***************************************************************************

int cEpgHttpd::setSession(const char* sessionId)
{
   std::map<std::string,Session>::iterator it;
   Session* s;

   currentSession = 0;
   loginWithSession = yes;

   if ((it = sessions.find(std::string(sessionId))) != sessions.end())
   {
      s =  &it->second;

      if (time(0) > s->last + tmeSecondsPerHour)
      {
         tell(0, "Session '%s' for user '%s' expired, removing it",
              s->id.c_str(), s->user.c_str());

         sessions.erase(it);

         return fail;
      }

      tell(2, "Session now '%s' for user '%s'",
           s->id.c_str(), s->user.c_str());

      currentSession = s;
      currentSession->last = time(0);

      return success;
   }

   return fail;
}

//***************************************************************************
// Need Login
//***************************************************************************

int cEpgHttpd::needLogin()
{
   long int need = no;

   getParameter("webif", "needLogin", need);

   return need;
}

//***************************************************************************
// Has Rights
//***************************************************************************

int cEpgHttpd::hasRights(const char* url, json_t* response, int& statusCode)
{
   UserMask mask = toRightMask(url);

   statusCode = MHD_HTTP_OK;

   if (!needLogin())
      return yes;

   tell(2, "Checking rights of '%s' for user '%s' with%s session", url,
        currentSession ? currentSession->user.c_str() : "<null>",
        currentSession ? "" : "out");

   if (!currentSession || !hasUserMask(currentSession->rights, mask))
   {
      if (currentSession)
      {
         statusCode = buildResponse(response, MHD_HTTP_FORBIDDEN, "Rejecting '%s' request of user "
                                    "'%s' due to insufficient rights!",
                                    url, currentSession->user.c_str());
         return no;
      }
      else if (!hasUserMask(umNologin, mask))
      {
         statusCode = buildResponse(response, MHD_HTTP_UNAUTHORIZED, "Rejecting '%s' request, missing login!", url);
         return no;
      }
   }

   // special case, request has invalid or expired session
   //  -> reject even in umNologin case

   if (!currentSession && loginWithSession)
   {
      statusCode = buildResponse(response, MHD_HTTP_UNAUTHORIZED, "Rejecting '%s' request "
                                 "due to invalid session!", url);
      return no;
   }

   return yes;
}

//***************************************************************************
// Build Response
//***************************************************************************

int cEpgHttpd::buildResponse(json_t* obj, int state, const char* format, ...)
{
   va_list ap;
   json_t* oResult = json_object();
   char* message;

   // {"result": {"state": 200, "message": "success"}}

   va_start(ap, format);
   vasprintf(&message, format, ap);
   va_end(ap);

   if (state != MHD_HTTP_OK)
      tell(0, "Error: %s", message);

   json_object_set_new(oResult, "state", json_integer(state));
   json_object_set_new(oResult, "message", json_string(message));
   json_object_set_new(obj, "result", oResult);

   free(message);

   return state;
}

//***************************************************************************
// Method Of
//***************************************************************************

const char* cEpgHttpd::methodOf(const char* url)
{
   const char* p;

   if (url && (p = strchr(url+1, '/')))
      return p+1;

   return "";
}

//***************************************************************************
// Perform Data Request
//***************************************************************************

int cEpgHttpd::performDataRequest(MHD_Connection* tcp, const char* url, MemoryStruct* data)
{
   const char* method = methodOf(url);
   const char* encoding = MHD_lookup_connection_value(tcp, MHD_HEADER_KIND, "Accept-Encoding");
   json_t* response = json_object();
   int statusCode = MHD_HTTP_OK;
   int jsonResponse = yes;

   if (checkConnection() != success)                // check connection ..
   {
      statusCode = buildResponse(response, MHD_HTTP_SERVICE_UNAVAILABLE, "Lost database connection, retry later");
   }

   else if (!hasRights(url, response, statusCode))  // check rights ..
   {
      // ...
   }

   else
   {
      data->modTime = time(0);

      if (strcmp(method, "events") == 0)
         statusCode = doEvents(tcp, response);
      else if (strcmp(method, "timers") == 0)
         statusCode = doTimers(tcp, response);
      else if (strcmp(method, "recordings") == 0)
         statusCode = doRecordings(tcp, response);
      else if (strcmp(method, "recording") == 0)
         statusCode = doRecording(tcp, response);
      else if (strcmp(method, "parameters") == 0)
         statusCode = doParameters(tcp, response);
      else if (strcmp(method, "recordingdirs") == 0)
         statusCode = doRecDirs(tcp, response);
      else if (strcmp(method, "pendingtimerjobs") == 0)
         statusCode = doTimerJobs(tcp, response);
      else if (strcmp(method, "messages") == 0)
         statusCode = doMessages(tcp, response);
      else if (strcmp(method, "donetimers") == 0)
         statusCode = doDoneTimers(tcp, response);
      else if (strcmp(method, "donetimer") == 0)
         statusCode = doDoneTimer(tcp, response);
     else if (strcmp(method, "searchtimers") == 0)
         statusCode = doSearchtimers(tcp, response);
      else if (strcmp(method, "event") == 0)
         statusCode = doEvent(tcp, response, data);
      else if (strcmp(method, "channels") == 0)
         statusCode = doChannels(tcp, response);
      else if (strcmp(method, "genres") == 0)
         statusCode = doGenres(tcp, response);
      else if (strcmp(method, "categories") == 0)
         statusCode = doCategories(tcp, response);
      else if (strcmp(method, "vdrs") == 0)
         statusCode = doVdrs(tcp, response);
      else if (strcmp(method, "users") == 0)
         statusCode = doUsers(tcp, response);
      else if (strcmp(method, "updatesearchtimer") == 0)
         statusCode = doUpdateSearchtimer(tcp, response);
      else if (strcmp(method, "updaterecordings") == 0)
         statusCode = doUpdateRecordingTable(tcp, response);
      else if (strcmp(method, "wakeupvdr") == 0)
         statusCode = doWakeupVdr(tcp, response);
      else if (strcmp(method, "renamerecording") == 0)
         statusCode = doRenameRecording(tcp, response);
      else if (strcmp(method, "replayrecording") == 0)
         statusCode = doReplayRecording(tcp, response);
      else if (strcmp(method, "deleterecording") == 0)
         statusCode = doDeleteRecording(tcp, response);
      else if (strcmp(method, "channelswitch") == 0)
         statusCode = doChannelSwitch(tcp, response);
      else if (strcmp(method, "hitkey") == 0)
         statusCode = doHitKey(tcp, response);
      else if (strcmp(method, "log") == 0)
         statusCode = doLog(tcp, response);
      else if (strcmp(method, "debug") == 0)
         statusCode = doDebug(tcp, response);
      else
      {
         // requests with *non* json response (data buffer is ready - nothing to prepare later)

         jsonResponse = no;

         if (strcmp(method, "channellogo") == 0)
            statusCode = doChannelLogo(tcp, response, data);
         else if (strcmp(method, "eventimg") == 0)
            statusCode = doEpgImage(tcp, response, data);
         else if (strcmp(method, "moviemedia") == 0)
            statusCode = doMovieMedia(tcp, response, data);
         else if (strcmp(method, "seriesmedia") == 0)
            statusCode = doSeriesMedia(tcp, response, data);
         else if (strcmp(method, "proxy") == 0)
            statusCode = doProxy(tcp, response, data);
         else
         {
            statusCode = buildResponse(response, MHD_HTTP_NOT_FOUND, "Unexpected method '%s' requested, ignoring", method);
            jsonResponse = yes;
         }
      }
   }

   // if json response convert to data

   if (jsonResponse)
   {
      json2Data(response, data, encoding);

      if (EpgdConfig.loglevel >= 2)
         json_dump_file(response, "debug-dump.json", JSON_PRESERVE_ORDER);
   }

   json_decref(response);      // free the json object

   return statusCode;
}

//***************************************************************************
// Perform Http Get
//***************************************************************************

int cEpgHttpd::performHttpGet(MHD_Connection* tcp, const char* inurl, MemoryStruct* data)
{
   const char* url;
   int statusCode = MHD_HTTP_OK;

   if (strcmp(inurl, "/") == 0)
      url = "index.html";
   else
      url = inurl;

   data->modTime = getModTimeOf(url, "");

   tell(3, "file: %s; expire: %s", l2pTime(data->modTime).c_str(), l2pTime(data->expireAt).c_str());

   if (!data->expireAt || data->modTime > data->expireAt)
   {
      if (loadFromFs(data, url, "") == success)
      {
         const char* encoding = MHD_lookup_connection_value(tcp, MHD_HEADER_KIND, "Accept-Encoding");

         sprintf(data->name, "%.*s", (int)sizeof(data->name), url);

         if (encoding && strstr(encoding, "gzip"))
         {
            if (data->toGzip() != success)
               statusCode = 500;
         }
      }
      else
      {
         statusCode = MHD_HTTP_NOT_FOUND;
      }
   }
   else
   {
      statusCode = MHD_HTTP_NOT_MODIFIED;
   }

   return statusCode;
}

//***************************************************************************
// Perform Post Data
//***************************************************************************

int cEpgHttpd::performPostData(const char* url, MemoryStruct* data)
{
   int statusCode = MHD_HTTP_OK;;
   json_t* response = json_object();
   json_error_t error;
   json_t* jInData = json_loads(data->memory, 0, &error);

   tell(2, "<- post (%s) '%s'", url, data->memory);

   if (!jInData)
   {
      statusCode = buildResponse(response, MHD_HTTP_UNSUPPORTED_MEDIA_TYPE, "Ignoring invalid post object [%s]", data->memory);
   }

   else if (checkConnection() != success)           // check db connection ..
   {
      statusCode = buildResponse(response, MHD_HTTP_SERVICE_UNAVAILABLE, "Lost database connection, retry later");
   }

   else if (!hasRights(url, response, statusCode))  // check rights ..
   {
      // ...
   }

   else
   {
      // dispatch post requests

      if (strcmp(url, "/data/save-channels") == 0)
         statusCode = storeChannels(jInData, response);
      else if (strcmp(url, "/data/delete-timerjobs") == 0)
         statusCode = deleteTimerJobs(jInData, response);
      else if (strcmp(url, "/data/store-donetimers") == 0)
         statusCode = deleteDoneTimers(jInData, response);
      else if (strcmp(url, "/data/save-timer") == 0)
         statusCode = storeTimerJob(jInData, response);
      else if (strcmp(url, "/data/save-searchtimer") == 0)
         statusCode = storeSearchTimer(jInData, response);
      else if (strcmp(url, "/data/save-parameters") == 0)
         statusCode = storeParameters(jInData, response);
      else if (strcmp(url, "/data/search") == 0)
         statusCode = doSearch(jInData, response);
      else if (strcmp(url, "/data/sendmail") == 0)
         statusCode = doSendMail(jInData, response);
      else if (strcmp(url, "/data/save-users") == 0)
         statusCode = storeUsers(jInData, response);
      else if (strcmp(url, "/data/login") == 0)
         statusCode = doLogin(jInData, response);
      else if (strcmp(url, "/data/markmessages") == 0)
         statusCode = markMessages(jInData, response);

      else
         statusCode = buildResponse(response, MHD_HTTP_NOT_FOUND, "Unexpected post request '%s', ignoring", url);
   }

   json_decref(jInData);            // free the json object
   data->clear();

   // prepare response data

   json2Data(response, data);
   json_decref(response);           // free the json object

   return statusCode;
}

//***************************************************************************
// Debug ...
//***************************************************************************

int debugPrint(void *cls, enum MHD_ValueKind kind, const char *key, const char *value)
{
   if (kind == MHD_GET_ARGUMENT_KIND)
      tell(0, "Parameter: '%s' - '%s'", key, value);
   else if (kind == MHD_HEADER_KIND)
      tell(0, "Header: '%s' - '%s'", key, value);

   return MHD_YES;
}

int parameterInfo(void* cls, enum MHD_ValueKind kind, const char* key, const char* value)
{
   if (strlen((char*)cls) < 1000 - strlen(notNull(value)) - strlen(notNull(key)) - 10)
      sprintf(eos((char*)cls), "%s:%s;", notNull(key), notNull(value));

   return MHD_YES;
}

//***************************************************************************
// Dispatcher
//***************************************************************************

int cEpgHttpd::dispatcher(void* cls, MHD_Connection* tcp,
                          const char* url, const char* method,
                          const char* version, const char* upload_data,
                          size_t* upload_data_size, void** con_cls)
{
   const char* contentNotFound = "<html><body>Page not found</body></html>";
   unsigned int statusCode = MHD_HTTP_OK;
   MHD_Response* response;
   MemoryStruct data;
   double requestStartAt = cMyTimeMs::Now();

   // int acceptRequest = no;
   int state;

   // reset session

   singleton->currentSession = 0;
   singleton->loginWithSession = no;

   // get header infos

   const char* id = getStrParameter(tcp, "id");
   data.expireAt = getTimeHeader(tcp, "If-Modified-Since", "");           // Sat, 08 May 2010 11:25:27 GMT.
   const char* cacheTag = getStrHeader(tcp, "If-None-Match", "");         // "2a28c-73a1-6eb997c0"
   const char* cacheControl = getStrHeader(tcp, "Cache-Control", "")  ;   // max-age=0
   int checkCache = strstr(cacheControl, "max-age=0") != 0;

   if (!checkCache)
      data.expireAt = 0;

   // debug

   if (EpgdConfig.loglevel >= 3)
   {
      // MHD_get_connection_values(tcp, MHD_GET_ARGUMENT_KIND, debugPrint, 0);
      MHD_get_connection_values(tcp, MHD_HEADER_KIND, debugPrint, 0);
   }

   // check session in url
   //    "/sid3cf33d41332e3e2702e7a8e39429f848/data/parameters"

   if (strncmp(url, "/sid", 4) == 0)
   {
      char* session = 0;

      asprintf(&session, "%.*s", (int)(strchr(url+4, '/') - url - 4), url + 4);
      url = strchr(url+4, '/');

      tell(3, "SESSION: '%s'", session);
      singleton->setSession(session);
      free(session);
   }

   tell(3, "Cache info: cacheExpire = %s; cacheTag = %s; cacheControl = %s", l2pTime(data.expireAt).c_str(), cacheTag, cacheControl);

   // dispatch ...

   if (strcmp(method, "POST") == 0)
   {
      if (EpgdConfig.loglevel >= 2)
         tell(3, "<- '%s' / %s%s [%s](%d)", url, id ? "id=" : "", id ? id : "", upload_data, (int)(*upload_data_size));

      if (!(*con_cls))                     // start of new incoming data
      {
         *con_cls = (void*) new MemoryStruct;
         return MHD_YES;
      }

      if (EpgdConfig.httpUseTls && !isEmpty(EpgdConfig.httpUser))
      {
         if (!isAuthenticated(tcp, EpgdConfig.httpUser, EpgdConfig.httpPass))
            return askForAuthentication(tcp, realm);
      }

      MemoryStruct* postData = (MemoryStruct*)*con_cls;

      if (*upload_data_size)               // chunk of POST data?
      {
         // processing of POST data

         postData->append(upload_data, (int)*upload_data_size);
         *upload_data_size = 0;            // set 0 to indicate 'successfully processed'

         return MHD_YES;
      }
      else                                 // end of incoming data
      {
         postData->memory = (char*)realloc(postData->memory, postData->size+1);
         postData->memory[postData->size] = 0;
         postData->size++;

         data.size = postData->size;
         data.memory = (char*)malloc(data.size);
         urlUnescape(data.memory, postData->memory);
         delete postData;

         statusCode = singleton->performPostData(url, &data);
      }
   }

   else if (strcmp(method, "GET") == 0)
   {
      if (EpgdConfig.httpUseTls && !isEmpty(EpgdConfig.httpUser))
      {
         if (!isAuthenticated(tcp, EpgdConfig.httpUser, EpgdConfig.httpPass))
            return askForAuthentication(tcp, realm);
      }

      if (EpgdConfig.loglevel >= 2)
      {
         char parmDebug[1000+TB] = "";

         MHD_get_connection_values(tcp, MHD_GET_ARGUMENT_KIND, parameterInfo, parmDebug);
         tell(2, "<- %s with [%s] (expire at %s)", url, parmDebug, l2pTime(data.expireAt).c_str());
         tell(3, "data: %s; expire: %s", l2pTime(data.modTime).c_str(), l2pTime(data.expireAt).c_str());
      }

      if (strstr(url, "/data") == url)                                // data requested ...
         statusCode = cEpgHttpd::singleton->performDataRequest(tcp, url, &data);
      else                                                            // file request ...
         statusCode = cEpgHttpd::singleton->performHttpGet(tcp, url, &data);

      if (statusCode == MHD_HTTP_OK)
      {
         if (data.modTime <= data.expireAt)
         {
            statusCode = MHD_HTTP_NOT_MODIFIED;
            tell(2, "-> %d 'not modified'", statusCode);
         }
         else if (!data.size)
         {
            data.memory = strdup(contentNotFound);
            data.size = strlen(data.memory);

            statusCode = MHD_HTTP_NOT_FOUND;
            tell(1, "-> %d 'file not found'", statusCode);
         }
      }
   }

   // ---------------------
   // prepare response ...

   response = createHttpResponse(&data);

   // header

   char* server;
   asprintf(&server, "epghttpd/%s from %s\n", VERSION, VERSION_DATE);
   addHeaderItem(response, "Server", "server");

   if (strcmp(method, "POST") == 0)
      addHeaderItem(response, "Cache-Control", "max-age=0, must-revalidate");
   else
      addHeaderItem(response, "Cache-Control", "max-age=300, must-revalidate");

   free(server);

   if (statusCode == MHD_HTTP_OK)
   {
      addHeaderItem(response, "Last-Modified", l2HttpTime(data.modTime).c_str());
      addHeaderItem(response, "Content-Type", data.contentType);
   }

   if (!isEmpty(data.contentEncoding))
      addHeaderItem(response, "Content-Encoding", data.contentEncoding);

   // response

   state = MHD_queue_response(tcp, statusCode, response);
   MHD_destroy_response(response);

   // log and debug ...
   {
//      const uint dspWidth = 6000;  // debug, later around 50 or 100 ...?
      const char* dump = "...";
//      uint dumpSize = 3;

      if ((strncmp(data.contentType, "test", 4) == 0 || strstr(data.contentType, "json")))
      {
         dump = data.memory;
         // dumpSize = data.size;
      }
      else if (!isEmpty(data.name))
      {
         dump = data.name;
         // dumpSize = strlen(data.name);
      }

      tell(2, "-> %s (%ld) (%s); Content-Type: %s; %s%s [%s]",
           !isEmpty(data.name) ? "file" : "data",
           data.size,
           ms2Dur(cMyTimeMs::Now()-requestStartAt).c_str(),
           data.contentType,
           !isEmpty(data.contentEncoding) ? "Content-Encoding: " : "", data.contentEncoding,
           dump);

//       tell(2, "-> %s (%ld); Content-Type: %s; %s%s [%.*s%s]",
//            !isEmpty(data.name) ? "file" : "data",
//            data.size, data.contentType,
//            !isEmpty(data.contentEncoding) ? "Content-Encoding: " : "", data.contentEncoding,
//            dspWidth,dump, dumpSize > dspWidth ? "..." : "");
   }

   return state;
}

//***************************************************************************
// Trigger Epgd
//***************************************************************************

int cEpgHttpd::triggerEpgd()
{
   int pid = na;

   vdrDb->clear();
   vdrDb->setValue("UUID", EPGDNAME);

   if (!vdrDb->find() || vdrDb->getValue("PID")->isNull())
   {
      tell(0, "Error: Can't lookup epgd information, abort trigger");
      return fail;
   }

   vdrDb->reset();

   pid = vdrDb->getIntValue("PID");

   if (pid > 0)
   {
      if (kill(pid, SIGUSR1) == 0)
         tell(1, "Triggered searchtimer update at %s", EPGDNAME);
   }

   return success;
}

//***************************************************************************
// Trigger VDRs
//***************************************************************************

int cEpgHttpd::triggerVdrs(const char* trg, const char* plug, const char* options)
{
   if (!selectActiveVdrs)  // wait for dbInit ;)
      return done;

   vdrDb->clear();

   for (int f = selectActiveVdrs->find(); f; f = selectActiveVdrs->fetch())
   {
      const char* ip = vdrDb->getStrValue("IP");
      unsigned int port = vdrDb->getIntValue("SVDRP");

      if (vdrDb->getIntValue("SHAREINWEB"))
         triggerVdr(ip, port, trg, plug, options);
   }

   selectActiveVdrs->freeResult();

   return success;
}

//***************************************************************************
// Trigger VDRs
//***************************************************************************

int cEpgHttpd::triggerVdr(const char* ip, unsigned int port, const char* trg,
                          const char* plug, const char* options, char* res)
{
   int status = success;
   char* command = 0;
   cList<cLine> result;

   cSvdrpClient cl(ip, port);

   // open tcp connection

   if (cl.open() != success)
      return fail;

   if (!isEmpty(plug))
      asprintf(&command, "PLUG %s %s %s", plug, trg, !isEmpty(options) ? options : "");
   else
      asprintf(&command, "%s %s", trg, !isEmpty(options) ? options : "");

   tell(1, "Send '%s' to '%s:%d'", command, ip, port);

   if (!cl.send(command))
   {
      status = fail;
      tell(0, "Error: Send '%s' at '%s:%d' failed!", command, ip, port);
   }
   else
   {
      int code = cl.receive(&result);

      if (code != 900)
      {
         status = fail;

         if (res && result.First())
            sprintf(res, "%.*s", 512, result.First()->Text());
      }
   }

   free(command);
   cl.close(no);

   return status;
}

//***************************************************************************
// IP of VDR
//***************************************************************************

int cEpgHttpd::ipOfVdr(const char* uuid, const char*& ip, int& port)
{
   int alive = no;

   port = 0;
   ip = 0;

   vdrDb->clear();
   vdrDb->setValue("UUID", uuid);

   if (vdrDb->find())
   {
      ip = vdrDb->getStrValue("IP");
      port = vdrDb->getIntValue("SVDRP");
      alive = vdrDb->hasValue("STATE", "attached");
   }

   vdrDb->reset();

   return alive;
}

//***************************************************************************
// Wakekup VDR
//***************************************************************************

int cEpgHttpd::wakeupVdr(const char* uuid)
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
// Message
//***************************************************************************

int cEpgHttpd::message(int level, char type, const char* title, const char* format, ...)
{
   va_list ap;
   char* message;
   std::string receivers;

   va_start(ap, format);
   vasprintf(&message, format, ap);
   va_end(ap);

   messageDb->setCharValue("TYPE", type);
   messageDb->setValue("TITLE", title);
   messageDb->setValue("STATE", "N");
   messageDb->setValue("TEXT", message);
   messageDb->insert();

   tell(level, "%s: %s", title, message);

   // loop over web users

   parametersDb->clear();

   for (int found = selectWebUsers->find(); found; found = selectWebUsers->fetch())
   {
      char receiver[255+TB] = "";
      char typesToMail[10+TB] = "";
      const char* owner = parametersDb->getStrValue("OWNER");

      getParameter(owner, "messageMailTypes", typesToMail);

      if (!strchr(typesToMail, type))
         continue;

      getParameter(owner, "mailReceiver", receiver);

      if (isEmpty(receiver))
         tell(0, "Warning: Missing mail receiver, can't send mail to '%s'", owner+1);
      else
         receivers += receiver + std::string(",");
   }

   sendMail("text/plain", receivers.c_str(), title, message);

   free(message);

   return done;
}

//***************************************************************************
// Configuration
//***************************************************************************

int cEpgHttpd::atConfigItem(const char* Name, const char* Value)
{
   // Parse setup parameters and store values.

   if      (!strcasecmp(Name, "DbHost"))             sstrcpy(EpgdConfig.dbHost, Value, sizeof(EpgdConfig.dbHost));
   else if (!strcasecmp(Name, "DbPort"))             EpgdConfig.dbPort = atoi(Value);
   else if (!strcasecmp(Name, "DbName"))             sstrcpy(EpgdConfig.dbName, Value, sizeof(EpgdConfig.dbName));
   else if (!strcasecmp(Name, "DbUser"))             sstrcpy(EpgdConfig.dbUser, Value, sizeof(EpgdConfig.dbUser));
   else if (!strcasecmp(Name, "DbPass"))             sstrcpy(EpgdConfig.dbPass, Value, sizeof(EpgdConfig.dbPass));

   else if (!strcasecmp(Name, "NetDevice"))          sstrcpy(EpgdConfig.netDevice, Value, sizeof(EpgdConfig.netDevice));

   else if (!strcasecmp(Name, "CachePath"))          sstrcpy(EpgdConfig.cachePath, Value, sizeof(EpgdConfig.cachePath));
   else if (!strcasecmp(Name, "LogLevel"))           EpgdConfig.loglevel = EpgdConfig.argLoglevel == na ? atoi(Value) : EpgdConfig.argLoglevel;
   else if (!strcasecmp(Name, "HttpDevice"))         sstrcpy(EpgdConfig.httpDevice, Value, sizeof(EpgdConfig.httpDevice));
   else if (!strcasecmp(Name, "HttpPort"))           EpgdConfig.httpPort = atoi(Value);
   else if (!strcasecmp(Name, "HttpTls"))            EpgdConfig.httpUseTls = atoi(Value);
   else if (!strcasecmp(Name, "HttpUser"))           sstrcpy(EpgdConfig.httpUser, Value, sizeof(EpgdConfig.httpUser));
   else if (!strcasecmp(Name, "HttpPass"))           sstrcpy(EpgdConfig.httpPass, Value, sizeof(EpgdConfig.httpPass));

   return success;
}

//***************************************************************************
// Usage
//***************************************************************************

void showUsage()
{
   printf("Usage: epghttpd [-n][-c <config-dir>][-l <log-level>][-t]\n");
   printf("    -v              show version and exit\n");
   printf("    -n              don't daemonize\n");
   printf("    -t              log to stdout\n");
   printf("    -c <config-dir> use config in <config-dir>\n");
   printf("    -l <log-level>  set log level\n");
   printf("    -i <pidfile>\n");
}

//***************************************************************************
// Main
//***************************************************************************

int main(int argc, char** argv)
{
   cEpgHttpd* job;
   int nofork = no;
   int pid;
   int logstdout = na;
   int loglevel = na;

   // Usage ..

   if (argc > 1 && (argv[1][0] == '?' || (strcmp(argv[1], "-h") == 0) || (strcmp(argv[1], "--help") == 0)))
   {
      showUsage();
      return 0;
   }

   // Parse command line

   for (int i = 0; argv[i]; i++)
   {
      if (argv[i][0] != '-' || strlen(argv[i]) != 2)
         continue;

      switch (argv[i][1])
      {
         case 'v': printf("epghttpd version %s from %s\n", VERSION, VERSION_DATE); return 0;
         case 't': logstdout = yes;                           break;
         case 'n': nofork = yes;                              break;
         case 'l': if (argv[i+1]) loglevel = atoi(argv[++i]); break;
         case 'c': if (argv[i+1]) confDir = argv[++i];        break;
         case 'i':
         {
            if (argv[i+1])
               cSystemNotification::setPidFile(argv[++i]);
            break;
         }

         default:
         {
            showUsage();
            return 0;
         }
      }
   }

   if (logstdout != na) EpgdConfig.logstdout = logstdout;
   if (loglevel != na)  EpgdConfig.loglevel = loglevel;
   if (loglevel != na)  EpgdConfig.argLoglevel = loglevel;

   EpgdConfig.logName = "epghttpd";
   EpgdConfig.logFacility = Syslog::toCode("user");

   // fork daemon

   if (!nofork)
   {
      if ((pid = fork()) < 0)
      {
         printf("Can't fork daemon, %s\n", strerror(errno));
         return 1;
      }

      if (pid != 0)
         return 0;
   }

   job = new cEpgHttpd;

   if (job->init() != success)
   {
      job->exit();
      delete job;
      return 1;
   }

   // register signal handler

   ::signal(SIGINT, cEpgHttpd::downF);
   ::signal(SIGTERM, cEpgHttpd::downF);

   // do work ...

   job->loop();

   // shutdown

   job->exit();
   tell(0, "normal exit");

   delete job;

   return 0;
}
