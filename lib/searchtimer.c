/*
 * searchtimer.c
 *
 * See the README file for copyright information
 *
 */

#include "python.h"
#include "searchtimer.h"

#include <list>

//***************************************************************************
//
//***************************************************************************

int cSearchTimer::searchField[] =
{
   sfTitle,
   sfFolge,
   sfDescription,
   0
};

const char* cSearchTimer::searchFieldName[] =
{
   "TITLE",
   "SHORTTEXT",
   "COMPLONGDESCRIPTION",
   0
};

int cSearchTimer::repeadCheckField[] =
{
   sfTitle,             // 1
   sfFolge,             // 2
   sfDescription,       // 4

   0
};

const char* cSearchTimer::repeadCheckFieldName[] =
{
   "COMPTITLE",           // <- "EPISODECOMPNAME" <- "EPISODECOMPSHORTNAME"
   "COMPSHORTTEXT",       // <- "EPISODECOMPPARTNAME"
   "COMPLONGDESCRIPTION",

   0
};

//***************************************************************************
// Class Search Timer
//***************************************************************************

cSearchTimer::cSearchTimer(cFrame* aParent)
   : startValue("START", cDBS::ffInt, 10),
     endValue("END", cDBS::ffInt, 10)
{
   parent = aParent;
   connection = 0;
   useeventsDb = 0;
   searchtimerDb = 0;
   timerDb = 0;
   timersDoneDb = 0;
   mapDb = 0;
   vdrDb = 0;

   selectChannelFromMap = 0;
   selectDoneTimer = 0;
   selectActiveSearchtimers = 0;
   selectSearchtimerMaxModSp = 0;
   selectAllTimer = 0;
   selectRPTimerByEvent = 0;
   selectTimerByEventId = 0;
   selectConflictingTimers = 0;
   selectFailedTimerByEvent = 0;
   selectSearchTimerByName = 0;
   selectSearchTimerById = 0;
   selectEvent = 0;

   lastSearchTimerUpdate = 0;

   ptyRecName = new Python("recording", "name");
}

cSearchTimer::~cSearchTimer()
{
   delete ptyRecName;
}

int cSearchTimer::init(const char* confDir)
{
   if (ptyRecName->init(confDir) != success)
   {
      tell(0, "Error: Init of python script recording.py failed, aborting");
      return fail;
   }

   return done;
}

int cSearchTimer::initDb()
{
   int status = success;

   exitDb();

   connection = new cDbConnection();

   useeventsDb = new cDbTable(connection, "useevents");
   if ((status = useeventsDb->open(yes) != success)) return status;

   searchtimerDb = new cDbTable(connection, "searchtimers");
   if (searchtimerDb->open(yes) != success) return fail;

   timerDb = new cDbTable(connection, "timers");
   if (timerDb->open(yes) != success) return fail;

   timersDoneDb = new cDbTable(connection, "timersdone");
   if (timersDoneDb->open(yes) != success) return fail;

   mapDb = new cDbTable(connection, "channelmap");
   if ((status = mapDb->open(yes)) != success) return status;

   vdrDb = new cDbTable(connection, "vdrs");
   if ((status = vdrDb->open(yes)) != success) return status;

   // ----------
   // select ...
   //     from searchtimers
   //  where state <> 'D' and active > 0
   //      and (type = 'R' or type is null)

   selectActiveSearchtimers = new cDbStatement(searchtimerDb);

   selectActiveSearchtimers->build("select ");
   selectActiveSearchtimers->bindAllOut();
   selectActiveSearchtimers->bind("UPDSP", cDBS::bndOut, ", ");
   selectActiveSearchtimers->bind("INSSP", cDBS::bndOut, ", ");
   selectActiveSearchtimers->build(" from %s where %s <> 'D' and %s > 0 and (%s = 'R' or %s is null)",
                                   searchtimerDb->TableName(),
                                   searchtimerDb->getField("STATE")->getDbName(),
                                   searchtimerDb->getField("ACTIVE")->getDbName(),
                                   searchtimerDb->getField("TYPE")->getDbName(),
                                   searchtimerDb->getField("TYPE")->getDbName());

   status += selectActiveSearchtimers->prepare();

   // --------------------
   // select max(modsp) from searchtimers

   selectSearchtimerMaxModSp = new cDbStatement(searchtimerDb);

   selectSearchtimerMaxModSp->build("select ");
   selectSearchtimerMaxModSp->bind("MODSP", cDBS::bndOut, "max(");
   selectSearchtimerMaxModSp->build(") from %s", searchtimerDb->TableName());

   status += selectSearchtimerMaxModSp->prepare();

   // ----------
   // select * from searchtimers
   //   where state != 'D'
   //         and name = ?

   selectSearchTimerByName = new cDbStatement(searchtimerDb);

   selectSearchTimerByName->build("select ");
   selectSearchTimerByName->bindAllOut();
   selectSearchTimerByName->build(" from %s where %s != 'D'",
                                  searchtimerDb->TableName(),
                                  searchtimerDb->getField("STATE")->getDbName());
   selectSearchTimerByName->bind("NAME", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectSearchTimerByName->prepare();

   // ----------
   // select * from searchtimers
   //   where state != 'D'
   //         and id = ?

   selectSearchTimerById = new cDbStatement(searchtimerDb);

   selectSearchTimerById->build("select ");
   selectSearchTimerById->bindAllOut();
   selectSearchTimerById->build(" from %s where %s != 'D'",
                                  searchtimerDb->TableName(),
                                  searchtimerDb->getField("STATE")->getDbName());
   selectSearchTimerById->bind("ID", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectSearchTimerById->prepare();

   // ----------
   // select id
   //   from timersdone
   //    ...

   selectDoneTimer = new cDbStatement(timersDoneDb);

   // selectDoneTimer - will build and prepared later at runtime ...

   // ----------
   // select channelname
   //   from channelmap

   selectChannelFromMap = new cDbStatement(mapDb);

   selectChannelFromMap->build("select ");
   selectChannelFromMap->bind("CHANNELNAME", cDBS::bndOut);
   selectChannelFromMap->build(" from %s where ", mapDb->TableName());
   selectChannelFromMap->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet);

   status += selectChannelFromMap->prepare();

   // select t.*, v.name, v.tunercount
   //   from timers t, vdrs v
   //     where t.state in ('P','R')
   //       and  t.vdruuid = v.uuid
   //   order by t.day, t.starttime

   selectAllTimer = new cDbStatement(timerDb);

   selectAllTimer->build("select ");
   selectAllTimer->setBindPrefix("t.");
   selectAllTimer->bindAllOut();
   selectAllTimer->setBindPrefix("v.");
   selectAllTimer->bind(vdrDb, "NAME", cDBS::bndOut, ", ");
   selectAllTimer->bind(vdrDb, "TUNERCOUNT", cDBS::bndOut, ", ");
   selectAllTimer->build(" from %s t, %s v ", timerDb->TableName(), vdrDb->TableName());
   selectAllTimer->build(" where t.%s in ('P','R')", timerDb->getField("STATE")->getDbName());
   selectAllTimer->build(" and t.VDRUUID = v.UUID");
   selectAllTimer->build(" order by t.%s, t.%s",
                         timerDb->getField("DAY")->getDbName(),
                         timerDb->getField("STARTTIME")->getDbName());

   status += selectAllTimer->prepare();

   // select *
   //    from timers where
   //     eventid = ?

   selectRPTimerByEvent = new cDbStatement(timerDb);

   selectRPTimerByEvent->build("select ");
   selectRPTimerByEvent->bindAllOut();
   selectRPTimerByEvent->build(" from %s where ", timerDb->TableName());
   selectRPTimerByEvent->bind("EVENTID", cDBS::bndIn | cDBS::bndSet);
   status += selectRPTimerByEvent->prepare();

   // select *
   //   from timers where
   //     state not in ('D','E')
   //     eventid = ? and channelid = ?

   selectTimerByEventId = new cDbStatement(timerDb);

   selectTimerByEventId->build("select ");
   selectTimerByEventId->bindAllOut();
   selectTimerByEventId->build(" from %s where ", timerDb->TableName());
   selectTimerByEventId->build(" %s not in ('D', 'E')", timerDb->getField("STATE")->getDbName());
   selectTimerByEventId->bind("EVENTID", cDBS::bndIn | cDBS::bndSet, " and ");
   selectTimerByEventId->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectTimerByEventId->prepare();

/*
   // select * from timers
   //  where state in ('P','R')
   //        and active = 1
   //        and day + starttime div 100 * 60 * 60 + starttime % 100 * 60 >= ?
   //        and day + starttime div 100 * 60 * 60 + starttime % 100 * 60 <= ?
   //        and vdruuid = ?
   //     group by SUBSTRING_INDEX(channelid, '-', 3);

   selectConflictingTimers = new cDbStatement(timerDb);

   selectConflictingTimers->build("select ");
   selectConflictingTimers->bindAllOut();
   selectConflictingTimers->build(" from %s where %s in ('P','R')",
                                  timerDb->TableName(), timerDb->getField("STATE")->getDbName());
   selectConflictingTimers->build(" and active = 1");
   selectConflictingTimers->bindText("day + starttime div 100 * 60 * 60 + starttime % 100 * 60", &startValue, ">=", " and ");
   selectConflictingTimers->bindText("day + starttime div 100 * 60 * 60 + starttime % 100 * 60", &endValue, "<=", " and ");
   selectConflictingTimers->bind("VDRUUID", cDBS::bndIn | cDBS::bndSet, " and ");
   selectConflictingTimers->build(" group by SUBSTRING_INDEX(channelid, '-', 3)");

   status += selectConflictingTimers->prepare();
*/

   // select * from timers
   //  where state in ('P','R')
   //        and active = 1
   //        and day + starttime div 100 * 60 * 60 + starttime % 100 * 60 >= ?
   //        and day + starttime div 100 * 60 * 60 + starttime % 100 * 60 <= ?
   //        and vdruuid = ?

   selectConflictingTimers = new cDbStatement(timerDb);

   selectConflictingTimers->build("select ");
   selectConflictingTimers->bindAllOut();
   selectConflictingTimers->build(" from %s where %s in ('P','R')",
                                  timerDb->TableName(), timerDb->getField("STATE")->getDbName());
   selectConflictingTimers->build(" and active = 1");
   selectConflictingTimers->bindText("day + starttime div 100 * 60 * 60 + starttime % 100 * 60", &startValue, ">=", " and ");
   selectConflictingTimers->bindText("day + starttime div 100 * 60 * 60 + starttime % 100 * 60", &endValue, "<=", " and ");
   selectConflictingTimers->bind("VDRUUID", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectConflictingTimers->prepare();

   // select * from timers
   //   where
   //           eventid = ?
   //       and channelid = ?
   //       and vdruuid = ?
   //       and state = ?

   selectFailedTimerByEvent = new cDbStatement(timerDb);

   selectFailedTimerByEvent->build("select ");
   selectFailedTimerByEvent->bindAllOut();
   selectFailedTimerByEvent->build(" from %s where ", timerDb->TableName());
   selectFailedTimerByEvent->bind("EVENTID", cDBS::bndIn | cDBS::bndSet);
   selectFailedTimerByEvent->bind("CHANNELID", cDBS::bndIn | cDBS::bndSet, " and ");
   selectFailedTimerByEvent->bind("VDRUUID", cDBS::bndIn | cDBS::bndSet, " and ");
   selectFailedTimerByEvent->bind("STATE", cDBS::bndIn | cDBS::bndSet, " and ");

   selectFailedTimerByEvent->prepare();

   // select *
   //    from eventsviewplain  where
   //        useid = ?

   selectEvent = new cDbStatement(useeventsDb);

   selectEvent->build("select ");
   selectEvent->bindAllOut();
   selectEvent->build(" from eventsviewplain where ");
   selectEvent->bind("USEID",  cDBS::bndIn | cDBS::bndSet);

   status += selectEvent->prepare();

   // ----------

   if (status != success)
   {
      tell(0, "Error: At least %d statements not prepared successfully", status*-1);
      return status;
   }

   return success;
}

int cSearchTimer::exitDb()
{
   if (connection)
   {
      delete selectActiveSearchtimers;  selectActiveSearchtimers = 0;
      delete selectSearchtimerMaxModSp; selectSearchtimerMaxModSp = 0;
      delete selectDoneTimer;           selectDoneTimer = 0;
      delete selectChannelFromMap;      selectChannelFromMap = 0;
      delete selectAllTimer;            selectAllTimer = 0;
      delete selectConflictingTimers;   selectConflictingTimers = 0;
      delete selectRPTimerByEvent;      selectRPTimerByEvent = 0;
      delete selectTimerByEventId;      selectTimerByEventId = 0;
      delete selectFailedTimerByEvent;  selectFailedTimerByEvent = 0;
      delete selectSearchTimerByName;   selectSearchTimerByName = 0;
      delete selectSearchTimerById;     selectSearchTimerById = 0;
      delete selectEvent;               selectEvent = 0;

      delete mapDb;                     mapDb = 0;
      delete useeventsDb;               useeventsDb = 0;
      delete searchtimerDb;             searchtimerDb = 0;
      delete timerDb;                   timerDb = 0;
      delete timersDoneDb;              timersDoneDb = 0;
      delete vdrDb;                     vdrDb = 0;

      delete connection;                connection = 0;
   }

   return success;
}

//***************************************************************************
// Check Connection
//***************************************************************************

int cSearchTimer::checkConnection()
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
// Any Search Timer Modified
//***************************************************************************

int cSearchTimer::modified()
{
   int modsp = 0;

   if (selectSearchtimerMaxModSp->find())
      modsp = searchtimerDb->getIntValue("MODSP");

   selectSearchtimerMaxModSp->freeResult();

   return modsp && modsp > lastSearchTimerUpdate;
}

//***************************************************************************
// Prepare Search Statement
//***************************************************************************

cDbStatement* cSearchTimer::prepareSearchStatement(cDbRow* searchTimer)
{
   cDbTable* db = useeventsDb;

   cDbStatement* select = new cDbStatement(db);

   const char* searchOp = "=";
   const char* expression = searchTimer->getStrValue("EXPRESSION");
   const char* expression1 = searchTimer->getStrValue("EXPRESSION1");
   const char* episodename = searchTimer->getStrValue("EPISODENAME");
   const char* season = searchTimer->getStrValue("SEASON");
   const char* seasonpart = searchTimer->getStrValue("SEASONPART");
   const char* category = searchTimer->getStrValue("CATEGORY");
   const char* genre = searchTimer->getStrValue("GENRE");
   const char* tipp = searchTimer->getStrValue("TIPP");
   const char* year = searchTimer->getStrValue("YEAR");
   const char* chformat = searchTimer->getStrValue("CHFORMAT");

   int noepgmatch = searchTimer->getIntValue("NOEPGMATCH");
   int searchmode = searchTimer->getIntValue("SEARCHMODE");
   int searchfields = searchTimer->getIntValue("SEARCHFIELDS");
   int searchfields1 = searchTimer->getIntValue("SEARCHFIELDS1");
   int casesensitiv = searchTimer->getIntValue("CASESENSITIV");
   int weekdays = searchTimer->getValue("WEEKDAYS")->isNull() ? (int)na : searchTimer->getIntValue("WEEKDAYS");

   switch (searchmode)
   {
      case smExact:     searchOp = casesensitiv ? "= BINARY"      : "=";      break;
      case smRegexp:    searchOp = casesensitiv ? "regexp BINARY" : "regexp"; break;
      case smLike:      searchOp = casesensitiv ? "like BINARY"   : "like";   break;
      case smContained: searchOp = casesensitiv ? "like BINARY"   : "like";   break;
   }

   select->build("select ");
   select->bindAllOut();
   select->setBindPrefix("c.");
   select->bind(mapDb, "FORMAT", cDBS::bndOut, ", ");
   select->clrBindPrefix();
   select->build(" from eventsviewplain e, (select distinct channelid,channelname,format,ord,visible from %s) c where ",
                 mapDb->TableName());
   select->build("e.%s = c.%s",
                         db->getField("CHANNELID")->getDbName(),
                         mapDb->getField("CHANNELID")->getDbName());
   select->build(" and e.updflg in (%s)", cEventState::getVisible());
   select->build(" and e.cnt_starttime >= unix_timestamp()-120");  // not more than 2 minutes running

   // search fields 1

   if (!isEmpty(expression) && strcmp(expression, "%") != 0 && strcmp(expression, "%%") != 0 && searchfields)
   {
      select->build(" and (");

      for (int i = 0, n = 0; searchField[i]; i++)
      {
         if (!db->getField(searchFieldName[i]))
            tell(0, "Fatal: Search field '%s' not known!", searchFieldName[i]);

         else if (searchfields & searchField[i])
         {
            select->build("%s(%s %s '%s%s%s')", n++ ? " or " : "",
                          db->getField(searchFieldName[i])->getDbName(),
                          searchOp,
                          searchmode == smContained ? "%" : "",
                          connection->escapeSqlString(expression).c_str(),
                          searchmode == smContained ? "%" : "");
         }
      }

      select->build(")");
   }

   // search fields 2

   if (!isEmpty(expression1) && strcmp(expression1, "%") != 0 && strcmp(expression1, "%%") != 0 && searchfields1)
   {
      select->build(" and (");

      for (int i = 0, n = 0; searchField[i]; i++)
      {
         if (!db->getField(searchFieldName[i]))
            tell(0, "Fatal: Search field '%s' not known!", searchFieldName[i]);

         else if (searchfields1 & searchField[i])
         {
            select->build("%s(%s %s '%s%s%s')", n++ ? " or " : "",
                          db->getField(searchFieldName[i])->getDbName(),
                          searchOp,
                          searchmode == smContained ? "%" : "",
                          connection->escapeSqlString(expression1).c_str(),
                          searchmode == smContained ? "%" : "");
         }
      }

      select->build(")");
   }

   // Channel Format (CHFORMAT)

   if (!isEmpty(chformat))
   {
      std::string format;

      format = "'" + strReplace(",", "','", chformat) + "'";

      select->build(" and (");

      select->build(" c.%s in (%s) ",
                    mapDb->getField("FORMAT")->getDbName(),
                    format.c_str());

      select->build(")");
  }

   // Kategorie 'Spielfilm','Serie' (CATEGORY)

   if (!isEmpty(category))
   {
      select->build(" and (");

      if (noepgmatch)
         select->build("%s is null or ", db->getField("CATEGORY")->getDbName());

      select->build(" %s in (%s) ",
                    db->getField("CATEGORY")->getDbName(),
                    category);

      select->build(")");
   }

   // Genre 'Krimi','Action' (GENRE)

   if (!isEmpty(genre))
   {
      select->build(" and (");

      if (noepgmatch)
         select->build("%s is null or ", db->getField("GENRE")->getDbName());

      select->build(" %s in (%s) ",
                    db->getField("GENRE")->getDbName(),
                    genre);

      select->build(")");
   }

   // Tipp (TIPP)

   if (!isEmpty(tipp))
   {
      select->build(" and (");

      if (noepgmatch)
         select->build("%s is null or ", db->getField("TIPP")->getDbName());

      select->build(" %s in (%s) ",
                    db->getField("TIPP")->getDbName(),
                    tipp);

      select->build(")");
   }

   // Serien Titel (EPISODENAME)

   if (!isEmpty(episodename))
   {
      select->build(" and (");

      select->build(" %s = BINARY '%s' or (%s is null and %s = BINARY '%s')",
                    db->getField("EPISODENAME")->getDbName(),
                    connection->escapeSqlString(episodename).c_str(),
                    db->getField("EPISODENAME")->getDbName(),
                    db->getField("TITLE")->getDbName(),
                    connection->escapeSqlString(episodename).c_str());

      select->build(")");
   }

   // Staffel like 3-5 (SEASON)

   if (!isEmpty(season))
   {
      select->build(" and (");

      if (noepgmatch)
         select->build("%s is null or ", db->getField("EPISODESEASON")->getDbName());

      select->build(" %s between %d and %d ",
                    db->getField("EPISODESEASON")->getDbName(),
                    rangeFrom(season), rangeTo(season));

      select->build(")");
   }

   // Staffelfolge (SEASONPART)

   if (!isEmpty(seasonpart))
   {
      select->build(" and (");

      if (noepgmatch)
         select->build("%s is null or ", db->getField("EPISODEPART")->getDbName());

      select->build(" %s between %d and %d ",
                    db->getField("EPISODEPART")->getDbName(),
                    rangeFrom(seasonpart), rangeTo(seasonpart));

      select->build(")");
   }

   // Jahr (YEAR)

   if (!isEmpty(year))
   {
      select->build(" and (");

      if (noepgmatch)
         select->build("%s is null or ", db->getField("YEAR")->getDbName());

      select->build(" %s between %d and %d ",
                    db->getField("YEAR")->getDbName(),
                    rangeFrom(year), rangeTo(year));

      select->build(")");
   }

   if (weekdays > 0)
   {
      select->build(" and ");
      select->build("(%d & (1 << weekday(from_unixtime(%s)))) <> 0",
                    weekdays, db->getField("STARTTIME")->getDbName());
   }

   select->build(" order by e.cnt_starttime, c.ord");

   if (select->prepare() != success)
   {
      delete select;
      select = 0;
      tell(0, "Error: AUTOTIMER: Prepare of statement for searchtimer failed, skipping");
      return 0;
   }

   const char* p = strstr(select->asText(), " from ");

   tell(2, "AUTOTIMER: Search statement [%s;]", p ? p : select->asText());

   return select;
}

//***************************************************************************
// Check Timers
//    - check existing, pending timers against epg
//    - check existing, pending timers against searchtimers
//***************************************************************************

int cSearchTimer::checkTimers()
{
   int count = 0;

   tell(1, "Checking timers against actual epg and searchtimer settings");

   if (checkConnection() != success)
      return 0;

   timerDb->clear();
   vdrDb->clear();

   for (int f = selectAllTimer->find(); f; f = selectAllTimer->fetch())
   {
      long aid = na;
      int namingmode = timerDb->getIntValue("NAMINGMODE");
      const char* tmplExpression = timerDb->getStrValue("TEMPLATE");

      // check only active and pending timers with eventid

      if (!timerDb->getIntValue("ACTIVE") || !timerDb->hasValue("STATE", "P") || !timerDb->getIntValue("EVENTID"))
         continue;

      if (timerDb->hasValue("SOURCE", "epgs"))   // 'epgs' => epgsearch plugin
         continue;

      // -------------------
      // lookups

      if (timerDb->getIntValue("AUTOTIMERID"))
      {
         searchtimerDb->clear();
         searchtimerDb->setValue("ID", timerDb->getIntValue("AUTOTIMERID"));

         if (selectSearchTimerById->find())
         {
            aid = searchtimerDb->getIntValue("ID");
            namingmode = searchtimerDb->getIntValue("NAMINGMODE");
            tmplExpression = timerDb->getStrValue("TEMPLATE");
         }
      }

      tell(2, "Checking timer(%ld) of event (%ld) against EPG",
           timerDb->getIntValue("ID"), timerDb->getIntValue("EVENTID"));

      useeventsDb->clear();
      useeventsDb->setValue("USEID", timerDb->getIntValue("EVENTID"));

      if (!selectEvent->find())
      {
         if (aid != na)
         {
            parent->message(0, 'W', "EPGD: Timer action", "Event (%ld) '%s' of timer (%ld) '%s' / autotimer (%ld) "
                            "not found; timer rejected!",
                            timerDb->getIntValue("EVENTID"), useeventsDb->getStrValue("TITLE"),
                            timerDb->getIntValue("ID"), timerDb->getStrValue("FILE"), aid);
            modifyTimer(timerDb, taReject);
            count++;
         }
         else
         {
            int warningCount = timerDb->getIntValue("WRNCOUNT");

            if (!warningCount)
            {
               warningCount++;
               parent->message(0, 'W', "EPGD: Timer action", "Event (%ld) '%s' of timer (%ld) '%s' not found."
                               "It's a manual timer, take your own solution!",
                               timerDb->getIntValue("EVENTID"), useeventsDb->getStrValue("TITLE"),
                               timerDb->getIntValue("ID"), timerDb->getStrValue("FILE"));

               timerDb->setValue("WRNCOUNT", warningCount);
               timerDb->update();
            }
         }

         continue;
      }

      // ------------------------
      // work - check timer data

      // Check Start Time

      if (!timerDb->hasValue("_STARTTIME", useeventsDb->getIntValue("STARTTIME")))
      {
         // if difference < 2 minutes adjust silent

         if (std::abs(timerDb->getIntValue("_STARTTIME") - useeventsDb->getIntValue("STARTTIME")) > 2*tmeSecondsPerMinute)
            parent->message(0, 'I', "EPGD: Timer action", "Info: Starttime of event (%ld) '%s' changed from '%s' to '%s', updating timer (%ld)",
                            timerDb->getIntValue("EVENTID"), useeventsDb->getStrValue("TITLE"),
                            l2pTime(timerDb->getIntValue("_STARTTIME")).c_str(), l2pTime(useeventsDb->getIntValue("STARTTIME")).c_str(),
                            timerDb->getIntValue("ID"));

         modifyTimer(timerDb, taAdjust);
         count++;
      }

      // Check recording name

      if (namingmode != tnmDefault)
      {
         // execute python - calc recording name

         if (ptyRecName->execute(useeventsDb, namingmode, tmplExpression) == success)
         {
            if (!timerDb->hasValue("FILE", ptyRecName->getResult()))
            {
               parent->message(0, 'I', "EPGD: Timer action", "Calculated name of event (%ld) changed from '%s' to '%s', updating timer (%ld)!",
                               timerDb->getIntValue("EVENTID"), timerDb->getStrValue("FILE"),
                               ptyRecName->getResult(), timerDb->getIntValue("ID"));

               timerDb->setValue("FILE", ptyRecName->getResult());
               modifyTimer(timerDb, taModify);
               count++;
            }
         }
      }

      selectEvent->freeResult();
      selectSearchTimerById->freeResult();
   }

   selectAllTimer->freeResult();

   tell(1, "Timers check done");

   return count;
}

//***************************************************************************
// Modify Timer
//***************************************************************************

int cSearchTimer::modifyTimer(cDbTable* timerDb, TimerAction action)
{
   // create a 'M'odify request ...

   timerDb->setCharValue("ACTION", action);
   timerDb->getValue("STATE")->setNull();
   timerDb->update();

   tell(0, "Created '%s' request for timer (%ld) at vdr '%s'",
        toName(action),
        timerDb->getIntValue("ID"), timerDb->getStrValue("VDRUUID"));

   // triggerVdrs("TIMERJOB", timerDb->getStrValue("VDRUUID"));

   return success;
}

//***************************************************************************
// Match Criterias
//***************************************************************************

int cSearchTimer::matchCriterias(cDbRow* searchTimer, cDbRow* event)
{
   const char* channelids = searchTimer->getStrValue("CHANNELIDS");
   int chexclude = searchTimer->getIntValue("CHEXCLUDE");
   int rangeStart = searchTimer->getValue("STARTTIME")->isNull() ? (int)na : searchTimer->getIntValue("STARTTIME");
   int rangeEnd = searchTimer->getValue("ENDTIME")->isNull() ? (int)na : searchTimer->getIntValue("ENDTIME");
   int nextDays = searchTimer->getValue("NEXTDAYS")->isNull() ? (int)na : searchTimer->getIntValue("NEXTDAYS");

   const char* channelid = event->getStrValue("CHANNELID");
   time_t starttime = event->getIntValue("STARTTIME");
   int hhmm = l2hhmm(starttime);

   // check if channel known to VDRs

   mapDb->clear();
   mapDb->setValue("CHANNELID", channelid);

   if (!selectChannelFromMap->find() || mapDb->getIntValue("UNKNOWNATVDR") > 0)
   {
      mapDb->reset();
      tell(3, "AUTOTIMER: Skipping hit, channelid '%s' is unknown at least on one VDR!",
           event->getStrValue("CHANNELID"));
      return no;
   }

   mapDb->reset();

   // check channel matches

   if (!isEmpty(channelids))
   {
      if (!chexclude && !strstr(channelids, channelid))
      {
         tell(3, "AUTOTIMER: Skipping hit due to channelid - '%s' not in '%s'",
              event->getStrValue("CHANNELID"), channelids);
         return no;
      }
      else if (chexclude && strstr(channelids, channelid))
      {
         tell(3, "AUTOTIMER: Skipping hit due to channelid - '%s' it in '%s'",
              event->getStrValue("CHANNELID"), channelids);
         return no;
      }
   }

   // check start

   if (rangeStart > 0 && hhmm < rangeStart)
   {
      tell(2, "AUTOTIMER: Skipping due to range (start before range)");
      return no;
   }

   if (rangeEnd > 0 && hhmm > rangeEnd)
   {
      tell(3, "AUTOTIMER: Skipping due to range (start behind range)");
      return no;
   }

   if (nextDays > 0 && event->getIntValue("STARTTIME") > time(0) + tmeSecondsPerDay * nextDays)
   {
      tell(3, "AUTOTIMER: Skipping event starting at '%s' due to nextdays of (%d) (start behind range)",
           l2pTime(event->getIntValue("STARTTIME")).c_str(), nextDays);
      return no;
   }

   // check range ... is start event in nextdays ...

   return yes;
}

//***************************************************************************
// Get Search Matches
//***************************************************************************

int cSearchTimer::getSearchMatches(cDbRow* searchTimer, json_t* obj, int start, int max)
{
   cDbStatement* select = 0;
   long searchtimerid = searchTimer->getIntValue("ID");
   const char* searchtimername = searchTimer->getStrValue("NAME");
   int count = 0;
   int end = max != na ? start + max : INT_MAX;

   if (checkConnection() != success)
      return fail;

   searchtimerDb->clear();

   if (searchtimerid > 0)
   {
      searchtimerDb->setValue("ID", searchtimerid);

      if (!searchtimerDb->find())
      {
         tell(0, "Warning: Searchtimer %ld not found!", searchtimerid);
         return fail;
      }

      searchTimer = searchtimerDb->getRow();
   }
   else if (!isEmpty(searchtimername))
   {
      searchtimerDb->setValue("NAME", searchtimername);

      if (!selectSearchTimerByName->find())
      {
         tell(0, "Warning: Searchtimer '%s' not found!", searchtimername);
         return fail;
      }

      searchTimer = searchtimerDb->getRow();
   }

   if (!(select = prepareSearchStatement(searchTimer)))
      return fail;

   json_t* oEvents = json_array();

   useeventsDb->clear();

   for (int res = select->find(); res; res = select->fetch())
   {
      useeventsDb->find();  // get all fields ..

      if (!matchCriterias(searchTimer, useeventsDb->getRow()))
         continue;

      count++;

      if (count < start || count >= end)
         continue;

         // add to json object

      json_t* oData = json_object();

      addFieldToJson(oData, useeventsDb, "USEID", no, "id");
      addFieldToJson(oData, useeventsDb, "CHANNELID");
      addFieldToJson(oData, useeventsDb, "STARTTIME");
      addFieldToJson(oData, useeventsDb, "DURATION");
      addFieldToJson(oData, useeventsDb, "CATEGORY");
      addFieldToJson(oData, useeventsDb, "GENRE");
      addFieldToJson(oData, useeventsDb, "TITLE");
      addFieldToJson(oData, useeventsDb, "SHORTTEXT");
      addFieldToJson(oData, useeventsDb, "SHORTDESCRIPTION");
      addFieldToJson(oData, useeventsDb, "NUMRATING");
      addFieldToJson(oData, useeventsDb, "TIPP");
      addFieldToJson(oData, useeventsDb, "IMAGECOUNT");

      isAlreadyDone(searchTimer->getIntValue("REPEATFIELDS"), oData, yes);

      // timer for this Event pending?

      timerDb->clear();
      timerDb->setValue("EVENTID", useeventsDb->getIntValue("USEID"));
      timerDb->setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));

      if (selectTimerByEventId->find())
         addFieldToJson(oData, timerDb, "ID", no, "TIMERID");

      selectTimerByEventId->freeResult();

      json_array_append_new(oEvents, oData);
   }

   select->freeResult();
   delete select;

   searchtimerDb->reset();

   json_object_set_new(obj, "start", json_integer(start));
   json_object_set_new(obj, "count", json_integer(count));
   json_object_set_new(obj, "events", oEvents);

   return success;
}

//***************************************************************************
// Get Done For Event by Searchtimer
//***************************************************************************

int cSearchTimer::getDoneFor(cDbRow* searchTimer, cDbRow* useevent, json_t* obj)
{
   if (checkConnection() != success)
      return fail;

   searchtimerDb->clear();
   searchtimerDb->setValue("ID", searchTimer->getIntValue("ID"));

   if (!searchtimerDb->find())
   {
      tell(0, "Warning: Searchtimer %ld not found", searchTimer->getIntValue("ID"));
      return fail;
   }

   useeventsDb->clear();
   useeventsDb->setBigintValue("CNTEVENTID", useevent->getBigintValue("CNTEVENTID"));
   useeventsDb->setValue("CHANNELID", useevent->getStrValue("CHANNELID"));
   useeventsDb->setValue("CNTSOURCE", useevent->getStrValue("CNTSOURCE"));

   if (!useeventsDb->find())
   {
      tell(0, "Warning: Event '%s/%lu/%s' not found",
           useevent->getStrValue("CHANNELID"),
           useevent->getBigintValue("CNTEVENTID"),
           useevent->getStrValue("CNTSOURCE"));

      return fail;
   }

   isAlreadyDone(searchtimerDb->getIntValue("REPEATFIELDS"), obj, yes);

   useeventsDb->reset();
   searchtimerDb->reset();

   return success;
}

//***************************************************************************
// Update Search Timers
//***************************************************************************

int cSearchTimer::updateSearchTimers(int force, const char* reason)
{
   uint64_t start = cMyTimeMs::Now();
   long total = 0;

   tell(1, "AUTOTIMER: Updating searchtimers due to '%s' %s", reason, force ? "(force)" : "");

   if (checkConnection() != success)
      return fail;

   searchtimerDb->clear();

   for (int res = selectActiveSearchtimers->find(); res; res = selectActiveSearchtimers->fetch())
   {
      long hits = 0;
      cDbStatement* select = 0;

      // searchtimer updated after last run or force?

      if (!force && searchtimerDb->getIntValue("MODSP") <= searchtimerDb->getIntValue("LASTRUN"))
         continue;

      select = prepareSearchStatement(searchtimerDb->getRow());

      if (!select)
      {
         lastSearchTimerUpdate = time(0);                         // protect for infinite call on error
         return 0;
      }

      useeventsDb->clear();

      for (int res = select->find(); res; res = select->fetch())
      {
         time_t starttime = useeventsDb->getIntValue("STARTTIME");
         int weekday = weekdayOf(starttime);

         tell(3, "AUTOTIMER: Found event (%s) '%s' / '%s'  (%ld/%s) at day %d",
              l2pTime(starttime).c_str(),
              useeventsDb->getStrValue("TITLE"),
              useeventsDb->getStrValue("SHORTTEXT"),
              useeventsDb->getIntValue("USEID"),
              useeventsDb->getStrValue("CHANNELID"),
              weekday);

         useeventsDb->find();  // get all fields ..

         // match

         if (!matchCriterias(searchtimerDb->getRow(), useeventsDb->getRow()))
         {
            useeventsDb->reset();
            continue;
         }

         // check if event already recorded or schedule for recording

         if (!isAlreadyDone(searchtimerDb->getIntValue("REPEATFIELDS")))
         {
            timerDb->clear();
            timerDb->setValue("EVENTID", useeventsDb->getIntValue("USEID"));

            if (selectRPTimerByEvent->find())
            {
               tell(3, "AUTOTIMER: Timer for event (%ld) '%s/%s' already scheduled, skipping",
                    useeventsDb->getIntValue("USEID"),
                    useeventsDb->getStrValue("TITLE"),
                    useeventsDb->getStrValue("SHORTTEXT"));
            }
            else
            {
// #TODO       time_t lEndTime = useeventsDb->getIntValue("DURATION");
// #TODO       int count = getUsedTransponderAt(useeventsDb->getIntValue("STARTTIME"), lEndTime);
// #TODO       if (count <= availableTransponders)
               {
                  if (createTimer(searchtimerDb->getIntValue("ID")) == success)
                     hits++;
               }
//             else
//                tell(1, "AUTOTIMER: Skipping due to");
            }

            selectRPTimerByEvent->freeResult();
            useeventsDb->reset();
         }
      }

      total += hits;

      select->freeResult();
      delete select;

      searchtimerDb->find();
      searchtimerDb->setValue("LASTRUN", time(0));

      if (hits)
         searchtimerDb->setValue("HITS", searchtimerDb->getIntValue("HITS") + hits);

      searchtimerDb->update();
   }

   selectActiveSearchtimers->freeResult();
   lastSearchTimerUpdate = time(0);

   tell(1, "AUTOTIMER: Update done after %s, created (%ld) timers",
        ms2Dur(cMyTimeMs::Now()-start).c_str(), total);

   return total;
}

//***************************************************************************
// Is Alreayd Done
//***************************************************************************

int cSearchTimer::isAlreadyDone(int repeatfields, json_t* obj, int silent)
{
   // std::string chkFields = "";

   if (repeatfields <= 0)
      return no;

   tell(3, "Check if '%s/%s' already recorded by fields (%d)",
        useeventsDb->getStrValue("TITLE"),
        useeventsDb->getStrValue("SHORTTEXT"),
        repeatfields);

   // --------------------------------------
   // check timersdone to avoid repeading

   // prepare statement ...

   selectDoneTimer->clear();
   selectDoneTimer->build("select ");
   selectDoneTimer->bind("ID", cDBS::bndOut);
   selectDoneTimer->bind("STATE", cDBS::bndOut, ", ");
   selectDoneTimer->build(" from %s where ", timersDoneDb->TableName());

   // retry only 'F'ailed and re'J'ected timers, don't retry 'D'eleted timers sice they are deleted by user
   /*
     select id, state, title,comptitle, shorttext,compshorttext from timersdone where
     state not in ('F','J')
     and
          (field('DERSTAATSANWALTDASLUDER', ifnull(comptitle,''),ifnull(episodecompshortname,'')) > 0
       or  field('',ifnull(comptitle,''),ifnull(episodecompshortname,'NoShortnameAvailable')) > 0)
     and
          (field('',ifnull(compshorttext,''),ifnull(episodecomppartname,'')) > 0
       or  field('',ifnull(compshorttext,''),ifnull(episodecomppartname,'')) > 0);
   */

   selectDoneTimer->build(" %s not in ('F','J')",      // mysql ignoring case by default!
                          timersDoneDb->getField("STATE")->getDbName());

   if (repeatfields & sfTitle)
   {
      selectDoneTimer->build(" and (field('%s', ifnull(comptitle,''),ifnull(episodecompshortname,'')) > 0"
                             "   or field('%s',ifnull(comptitle,''),ifnull(episodecompshortname,'NoShortnameAvailable')) > 0)",
                             useeventsDb->getStrValue("COMPTITLE"), useeventsDb->getStrValue("EPISODECOMPSHORTNAME"));
   }

   if (repeatfields & sfFolge)
   {
      selectDoneTimer->build(" and (field('%s',ifnull(compshorttext,'NoShortnameAvailable'),ifnull(episodecomppartname,'NoShortnameAvailable')) > 0"
                             "   or field('%s',ifnull(compshorttext,''),ifnull(episodecomppartname,'NoShortnameAvailable')) > 0)",
                             useeventsDb->getStrValue("COMPSHORTTEXT"), useeventsDb->getStrValue("EPISODECOMPPARTNAME"));
   }

   if (selectDoneTimer->prepare() != success)
   {
      tell(0, "Error: AUTOTIMER: Prepare of statement for 'done' check failed, skipping");
      return yes;
   }

   timersDoneDb->clear();

   json_t* oDones = json_array();
   int cnt = 0;

   for (int f = selectDoneTimer->find(); f; f = selectDoneTimer->fetch())
   {
      json_t* oData = json_object();
      long id = timersDoneDb->getIntValue("ID");
      const char* state = timersDoneDb->getStrValue("STATE");

      if (!silent)
         tell(3, "AUTOTIMER: The timer/recording exists with timerdone "
              "id %ld and state '%s', checked by '%s', skipping ...",
              id, state, selectDoneTimer->asText());

      if (!obj)
      {
         selectDoneTimer->freeResult();
         return yes;
      }

      // add to json object

      json_object_set_new(oData, "id", json_integer(id));
      json_object_set_new(oData, "state", json_string(state));
      json_array_append_new(oDones, oData);
      cnt++;

      selectDoneTimer->freeResult();
   }

   if (obj && cnt)
      json_object_set_new(obj, "dones", oDones);

   return no;
}

//***************************************************************************
// Create Timer
//
//  - searchtimerDb and useeventsDb has to be positioned and loaded
//***************************************************************************

int cSearchTimer::createTimer(int id)
{
   int status;
   int timerid;
   int retry = no;
   int doneid = 0;

   if (checkConnection() != success)
      return fail;

   const char* channelname = "";
   int namingmode = searchtimerDb->getIntValue("NAMINGMODE");
   const char* tmplExpression = searchtimerDb->getStrValue("TEMPLATE");

   // ------------------------------------------
   // lookup channel name to store in timersdone
   // (just as a additional 'debug' info)

   mapDb->clear();
   mapDb->setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));

   if (selectChannelFromMap->find())
      channelname = mapDb->getStrValue("CHANNELNAME");

   if (isEmpty(channelname))
      channelname = useeventsDb->getStrValue("CHANNELID");

   selectChannelFromMap->freeResult();

   // ------------------------------------------
   // Create timer in timerdistribution ...

   cDbRow timerRow("timers");

   timerRow.clear();

   timerRow.setValue("ID", na);      // 'na' is the signal for modifyCreateTimer to create new timer
   timerRow.setValue("ACTIVE", yes);
   timerRow.setValue("TYPE", searchtimerDb->getStrValue("TYPE"));
   timerRow.setValue("SOURCE", "epgd");
   timerRow.setValue("EVENTID", useeventsDb->getIntValue("USEID"));
   timerRow.setValue("_STARTTIME", useeventsDb->getIntValue("STARTTIME"));
   timerRow.setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));
   timerRow.setValue("NAMINGMODE", namingmode);
   timerRow.setValue("TEMPLATE", tmplExpression);
   timerRow.setValue("CHILDLOCK", searchtimerDb->getIntValue("CHILDLOCK"));
   timerRow.setValue("VDRUUID", searchtimerDb->getStrValue("VDRUUID"));
   timerRow.setValue("VPS", searchtimerDb->getIntValue("VPS"));
   timerRow.setValue("PRIORITY", searchtimerDb->getIntValue("PRIORITY"));
   timerRow.setValue("LIFETIME", searchtimerDb->getIntValue("LIFETIME"));
   timerRow.setValue("DIRECTORY", searchtimerDb->getStrValue("DIRECTORY"));

   timerRow.setValue("AUTOTIMERID", searchtimerDb->getIntValue("ID"));
   timerRow.setValue("AUTOTIMERNAME", searchtimerDb->getStrValue("NAME"));
   timerRow.setValue("AUTOTIMERINSSP", searchtimerDb->getIntValue("INSSP"));
   timerRow.setValue("EXPRESSION", searchtimerDb->getStrValue("EXPRESSION"));

   if (namingmode != tnmDefault)
   {
      // execupe python - calc recording name

      if (ptyRecName->execute(useeventsDb, namingmode, tmplExpression) == success)
      {
         tell(0, "Info: The recording name calculated by 'recording.py' is '%s'",
              ptyRecName->getResult());

         if (!isEmpty(ptyRecName->getResult()))
            timerRow.setValue("FILE", ptyRecName->getResult());
      }
   }

   // for 'event' based timers, check on failed attemps for this eventid

   if (!timerRow.getValue("EVENTID")->isEmpty())
   {
      timerDb->clear();
      timerDb->setValue("EVENTID", timerRow.getIntValue("EVENTID"));
      timerDb->setValue("CHANNELID", timerRow.getStrValue("CHANNELID"));
      timerDb->setValue("VDRUUID", timerRow.getStrValue("VDRUUID"));
      timerDb->setCharValue("STATE", tsError);

      // max three retrys ..

      if (selectFailedTimerByEvent->find())
      {
         if (timerDb->getIntValue("RETRYS") > 3)
         {
            tell(0, "Error: AUTOTIMER: Aborting timer create for event %ld, already %ld attempts failed ",
                 timerDb->getIntValue("EVENTID"),
                 timerDb->getIntValue("RETRYS"));

            selectFailedTimerByEvent->freeResult();

            return fail;
         }

         retry = yes;
         doneid = timerDb->getIntValue("DONEID");

         timerRow.setValue("ID", timerDb->getIntValue("ID"));            // signal for modifyCreateTimer to modify the existing timer
         timerRow.setValue("RETRYS", timerDb->getIntValue("RETRYS")+1);
      }

      selectFailedTimerByEvent->freeResult();
   }

   status = modifyCreateTimer(&timerRow, timerid, /*resetState = */ retry);

   // on scuccess add to timersdone ..

   if (status == success)
   {
      timersDoneDb->clear();

      if (doneid)
      {
         timersDoneDb->setValue("ID", doneid);

         if (!timersDoneDb->find())
            doneid = 0;
      }

      timersDoneDb->setCharValue("STATE", tdsTimerRequested);
      timersDoneDb->setValue("SOURCE", "epgd");
      timersDoneDb->setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));
      timersDoneDb->setValue("STARTTIME", useeventsDb->getIntValue("STARTTIME"));
      timersDoneDb->setValue("DURATION", useeventsDb->getIntValue("DURATION"));
      timersDoneDb->setValue("EXPRESSION", searchtimerDb->getStrValue("EXPRESSION"));
      timersDoneDb->setValue("AUTOTIMERID", id);
      timersDoneDb->setValue("AUTOTIMERNAME", searchtimerDb->getStrValue("NAME"));
      timersDoneDb->setValue("TIMERID", timerid);
      timersDoneDb->setValue("TITLE", useeventsDb->getStrValue("TITLE"));
      timersDoneDb->setValue("COMPTITLE", useeventsDb->getStrValue("COMPTITLE"));

      if (!useeventsDb->getValue("SHORTTEXT")->isEmpty())
         timersDoneDb->setValue("SHORTTEXT", useeventsDb->getStrValue("SHORTTEXT"));
      if (!useeventsDb->getValue("COMPSHORTTEXT")->isEmpty())
         timersDoneDb->setValue("COMPSHORTTEXT", useeventsDb->getStrValue("COMPSHORTTEXT"));

      if (!useeventsDb->getValue("LONGDESCRIPTION")->isEmpty())
         timersDoneDb->setValue("LONGDESCRIPTION", useeventsDb->getStrValue("LONGDESCRIPTION"));
      if (!useeventsDb->getValue("COMPLONGDESCRIPTION")->isEmpty())
         timersDoneDb->setValue("COMPLONGDESCRIPTION", useeventsDb->getStrValue("COMPLONGDESCRIPTION"));

      if (!useeventsDb->getValue("EPISODECOMPNAME")->isEmpty())
         timersDoneDb->setValue("EPISODECOMPNAME", useeventsDb->getStrValue("EPISODECOMPNAME"));
      if (!useeventsDb->getValue("EPISODECOMPSHORTNAME")->isEmpty())
         timersDoneDb->setValue("EPISODECOMPSHORTNAME", useeventsDb->getStrValue("EPISODECOMPSHORTNAME"));

      if (!useeventsDb->getValue("EPISODECOMPPARTNAME")->isEmpty())
         timersDoneDb->setValue("EPISODECOMPPARTNAME", useeventsDb->getStrValue("EPISODECOMPPARTNAME"));
      if (!useeventsDb->getValue("EPISODELANG")->isEmpty())
         timersDoneDb->setValue("EPISODELANG", useeventsDb->getStrValue("EPISODELANG"));
      if (!useeventsDb->getValue("EPISODESEASON")->isEmpty())
         timersDoneDb->setValue("EPISODESEASON", useeventsDb->getIntValue("EPISODESEASON"));
      if (!useeventsDb->getValue("EPISODEPART")->isEmpty())
         timersDoneDb->setValue("EPISODEPART", useeventsDb->getIntValue("EPISODEPART"));

      if (!isEmpty(channelname))
         timersDoneDb->setValue("CHANNELNAME", channelname);

      if (doneid)
      {
         timersDoneDb->update();
      }
      else
      {
         timersDoneDb->insert();
         doneid = timersDoneDb->getLastInsertId();
      }

      parent->message(1, 'I', "EPGD: Timer action", "Created timer (%d) for event '%s - %s / %s on channel '%s' at '%s', doneid is (%d)",
           timerid,
           l2pTime(useeventsDb->getIntValue("STARTTIME")).c_str(),
           useeventsDb->getStrValue("TITLE"), useeventsDb->getStrValue("SHORTTEXT"),
           channelname, toWeekdayName(weekdayOf(useeventsDb->getIntValue("STARTTIME"))),
           doneid);

      timerDb->clear();
      timerDb->setValue("ID", timerid);
      timerDb->setValue("VDRUUID", searchtimerDb->getStrValue("VDRUUID"));

      if (timerDb->find())
      {
         timerDb->setValue("DONEID", doneid);
         timerDb->update();
      }
   }

   return status;
}

//***************************************************************************
// Modify Timer (copy paste from cMenuDb of epg2vdr/httpd)
//
//    - timerRow contains the destination vdrUuid
//***************************************************************************

int cSearchTimer::modifyCreateTimer(cDbRow* timerRow, int& newid, int createRetry)
{
   int status = success;
   int timerid = timerRow->getIntValue("ID");
   int knownTimer = timerid != na;
   int move = no;

   newid = na;
   connection->startTransaction();

   timerDb->clear();

   // lookup known (existing) timer

   if (knownTimer)
   {
      timerDb->copyValues(timerRow, cDBS::ftPrimary);

      if (!timerDb->find())
      {
         connection->commit();

         tell(0, "Error: Timer (%d) at vdr '%s' not found, aborting modify request!",
              timerid, timerDb->getStrValue("VDRUUID"));

         return fail;
      }

      // found and all values are loaded!

      // move to another vdr?

      if (!timerDb->hasValue("VDRUUID", timerRow->getStrValue("VDRUUID")))
         move = yes;
   }
   else
   {
      timerDb->setValue("VDRUUID", timerRow->getStrValue("VDRUUID"));
   }

   if (move)
   {
      // request 'D'elete of 'old' timer

      timerDb->setCharValue("ACTION", taDelete);
      timerDb->setValue("SOURCE", timerRow->getStrValue("SOURCE"));
      status = timerDb->update();

      // triggerVdrs("TIMERJOB", timerDb->getStrValue("VDRUUID"));

      // create new on other vdr

      timerDb->copyValues(timerRow, cDBS::ftData);          // takeover all data (can be modified by user)
      timerDb->setValue("ID", 0);
      timerDb->setCharValue("ACTION", taCreate);
      status += timerDb->insert();
      newid = timerDb->getLastInsertId();

      if (status == success)
         tell(1, "Created 'move' request for timer (%d) at vdr '%s'",
              timerid, timerDb->getStrValue("VDRUUID"));
   }
   else
   {
      // create 'C'reate oder 'M'odify request ...

      timerDb->copyValues(timerRow, cDBS::ftData);

      // createRetry ... verry special case ...

      if (createRetry)
      {
         timerDb->getValue("STATE")->setNull();
         timerDb->setCharValue("ACTION", taCreate);
      }
      else
      {
         timerDb->setCharValue("ACTION", knownTimer ? taModify : taCreate);
      }

      if (knownTimer)
      {
         status = timerDb->update();
         newid = timerid;
      }
      else
      {
         status = timerDb->insert();
         newid = timerDb->getLastInsertId();
      }

      if (status == success)
      {
         tell(1, "Created '%s' request for timer (%d), event (%ld) at vdr '%s' by autotimer (%ld)",
              knownTimer ? "modify" : "create",
              newid, timerDb->getIntValue("EVENTID"), timerDb->getStrValue("VDRUUID"),
              timerDb->getIntValue("AUTOTIMERID"));
      }
   }

   connection->commit();

   // triggerVdrs("TIMERJOB", timerDb->getStrValue("VDRUUID"));

   return status;
}

//***************************************************************************
// Check Timer Conficts
//***************************************************************************

int cSearchTimer::checkTimerConflicts(std::string& mailBody)
{
   int conflicts = 0;

   tell(1, "TCC: Starting timer conflict check");
   mailBody = "";

   if (checkConnection() != success)
      return fail;

   timerDb->clear();
   vdrDb->clear();

   for (int f = selectAllTimer->find(); f; f = selectAllTimer->fetch())
   {
      if (!timerDb->getIntValue("ACTIVE"))
         continue;

      if (timerDb->getIntValue("TCCMAILCNT") > 0)
         continue;

      tell(2, "TCC: Check conflicts for timer (%ld) '%s' on '%s'; channel '%s'",
           timerDb->getIntValue("ID"), timerDb->getStrValue("FILE"),
           vdrDb->getStrValue("NAME"), timerDb->getStrValue("CHANNELID"));

      // calc 'start' and 'end' time of this timer ..

      int sDay = timerDb->getIntValue("DAY");
      int sTime = timerDb->getIntValue("STARTTIME");
      int eDay = timerDb->getIntValue("DAY");
      int eTime = timerDb->getIntValue("ENDTIME");

      if (eTime < sTime)
         eDay += tmeSecondsPerDay;

      time_t lStartTime = sDay + sTime / 100 * tmeSecondsPerHour + sTime % 100 * tmeSecondsPerMinute;
      time_t lEndTime = eDay + eTime / 100 * tmeSecondsPerHour + eTime % 100 * tmeSecondsPerMinute;

      // check for conflicts

      std::string mailPart;
      int tunerCount = getUsedTransponderAt(lStartTime, lEndTime, mailPart);

      if (tunerCount > vdrDb->getIntValue("TUNERCOUNT"))
      {
         conflicts++;

         tell(1, "TCC: Timer (%ld) '%s' conflict at '%s - %s' needed %d transponders on '%s'",
              timerDb->getIntValue("ID"),
              timerDb->getStrValue("FILE"),
              l2pTime(lStartTime).c_str(),
              l2pTime(lEndTime).c_str(),
              tunerCount,
              vdrDb->getStrValue("NAME"));

         mailBody +=
            "<tbody>"
            "<tr>"
            "<th style=\"text-align:left;vertical-align:top;white-space:nowrap;padding:15px 0 5px 0;border-bottom: 1px solid #ccc;\" colspan=\"6\">  conflict #"
            + num2Str(conflicts) + " on VDR '" + vdrDb->getStrValue("NAME")
            + "' at " + l2pDate(lStartTime) + "</th>"
            "</tr>";

         mailBody += mailPart;

         mailBody +=
                       "</tbody>";

         timerDb->setValue("TCCMAILCNT", timerDb->getIntValue("TCCMAILCNT") + 1);
         timerDb->update();

         // #TODO - reject autotimer ... ?
         // rejectTimer(timerDb->getRow());
      }

      else if (tunerCount <= 0)  // DEBUG-tell - to be removed?
         tell(1, "TCC: Fatal got 0 used transponders for timer (%ld) between %s (%ld) and %s (%ld)",
              timerDb->getIntValue("ID"),
              l2pTime(lStartTime).c_str(), lStartTime,
              l2pTime(lEndTime).c_str(), lEndTime);
   }

   selectAllTimer->freeResult();

   tell(1, "TCC: Finished timer conflict check with (%d) conflicts", conflicts);

   return conflicts;
}

//***************************************************************************
// Get Used Transponder At
//***************************************************************************

int cSearchTimer::getUsedTransponderAt(time_t lStartTime, time_t lEndTime, std::string& mailPart)
{
   char buf[1024+TB];

   if (checkConnection() != success)
      return fail;

   startValue.setValue(lStartTime);
   endValue.setValue(lEndTime);

   std::map<std::string, cTccTransponder> transponders;
   std::map<std::string, cTccTransponder>::iterator it;

   for (int f = selectConflictingTimers->find(); f; f = selectConflictingTimers->fetch())
   {
      cTccTimerData timer;
      std::string transponder = timerDb->getStrValue("CHANNELID");
      size_t endpos = transponder.find_last_of("-");
      const char* channelName = "unknown";

      mapDb->clear();
      mapDb->setValue("CHANNELID", timerDb->getStrValue("CHANNELID"));

      if (selectChannelFromMap->find())
         channelName = mapDb->getStrValue("CHANNELNAME");

      selectChannelFromMap->freeResult();

      if (endpos == std::string::npos)
         continue;

      transponder = transponder.substr(0, endpos);  // build transponder name
      transponders[transponder].count++;

      timer.id = timerDb->getIntValue("ID");
      timer.file = timerDb->getStrValue("FILE");
      timer.begin = timerDb->getIntValue("STARTTIME");
      timer.end = timerDb->getIntValue("ENDTIME");
      timer.channel = channelName;
      transponders[transponder].timers.push_back(timer);
   }

   selectConflictingTimers->freeResult();

   for (it = transponders.begin(); it != transponders.end(); it++)
   {
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

   return transponders.size();
}

// //***************************************************************************
// // Reject Timer
// //***************************************************************************

// int cSearchTimer::rejectTimer(cDbRow* timerRow)
// {
//    tell(1, "Rejecting timer (%ld)", timerRow->getIntValue("ID"));

//    timerJobsDb->clear();
//    timerJobsDb->setValue("TIMERID", timerRow->getIntValue("ID"));
//    timerJobsDb->setValue("DONEID", timerRow->getIntValue("DONEID"));
//    timerJobsDb->setValue("STATE", "J");
//    timerJobsDb->setValue("ASSUMED", "N");
//    timerJobsDb->insert();

//    tell(1, "Created delete job for timer (%ld)", timerRow->getIntValue("ID"));

//    return success;
// }
