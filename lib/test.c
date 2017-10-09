/*
 * test.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include <stdint.h>   // uint_64_t
#include <sys/time.h>
#include <time.h>

#include <stdio.h>
#include <string>

#include "config.h"
#include "common.h"
#include "db.h"
#include "epgservice.h"
#include "dbdict.h"
#include "wol.h"
#include "curl.h"

cDbConnection* connection = 0;
const char* logPrefix = "";

//***************************************************************************
// Init Connection
//***************************************************************************

void initConnection()
{
   cDbConnection::init();

   // cDbConnection::setHost("192.168.200.101");
   cDbConnection::setHost("localhost");
   cDbConnection::setPort(3306);

   cDbConnection::setName("epg2vdr");
   cDbConnection::setUser("epg2vdr");
   cDbConnection::setPass("epg");

   cDbConnection::setConfPath("/etc/epgd/");
   cDbConnection::setEncoding("utf8");

   connection = new cDbConnection();
}

void exitConnection()
{
   cDbConnection::exit();

   if (connection)
      delete connection;
}

//***************************************************************************
//
//***************************************************************************

void chkCompress()
{
   std::string s = "_+*!#?=&%$< Hallo TEIL Hallo Folge ";

   printf("'%s'\n", s.c_str());
   prepareCompressed(s);
   printf("'%s'\n", s.c_str());

   s = "Place Vendôme - Heiße Diamanten";
   printf("'%s'\n", s.c_str());
   prepareCompressed(s);
   printf("'%s'\n", s.c_str());

   s = "Halöö älter";
   printf("'%s'\n", s.c_str());
   prepareCompressed(s);
   printf("'%s'\n", s.c_str());
}

//***************************************************************************
//
//***************************************************************************

void chkStatement1()
{
   cDbTable* epgDb = new cDbTable(connection, "events");

   if (epgDb->open() != success)
   {
      tell(0, "Could not access database '%s:%d' (%s)",
           cDbConnection::getHost(), cDbConnection::getPort(), epgDb->TableName());

      return ;
   }

   tell(0, "---------------------------------------------------");

   // prepare statement to mark wasted DVB events

   cDbValue* endTime = new cDbValue("starttime+duration", cDBS::ffInt, 10);
   cDbStatement* updateDelFlg = new cDbStatement(epgDb);

   // update events set delflg = ?, updsp = ?
   //   where channelid = ? and source = ?
   //      and starttime+duration > ?
   //      and starttime < ?
   //      and (tableid > ? or (tableid = ? and version <> ?))

   updateDelFlg->build("update %s set ", epgDb->TableName());
   updateDelFlg->bind(epgDb->getField("DelFlg"), cDBS::bndIn | cDBS::bndSet);
   updateDelFlg->bind(epgDb->getField("UpdSp"), cDBS::bndIn | cDBS::bndSet, ", ");
   updateDelFlg->build(" where ");
   updateDelFlg->bind(epgDb->getField("ChannelId"), cDBS::bndIn | cDBS::bndSet);
   updateDelFlg->bind(epgDb->getField("Source"), cDBS::bndIn | cDBS::bndSet, " and ");

   updateDelFlg->bindCmp(0, endTime, ">", " and ");

   updateDelFlg->bindCmp(0, epgDb->getField("StartTime"), 0, "<" ,  " and ");
   updateDelFlg->bindCmp(0, epgDb->getField("TableId"),   0, ">" ,  " and (");
   updateDelFlg->bindCmp(0, epgDb->getField("TableId"),   0, "=" ,  " or (");
   updateDelFlg->bindCmp(0, epgDb->getField("Version"),   0, "<>" , " and ");
   updateDelFlg->build("));");

   updateDelFlg->prepare();

   tell(0, "---------------------------------------------------");
}

// //***************************************************************************
// //
// //***************************************************************************

// void chkStatement2()
// {
//    cDbTable* imageRefDb = new cTableImageRefs(connection);
//    cDbTable* imageDb = new cTableImages(connection);

//    if (imageRefDb->open() != success)
//       return ;

//    if (imageDb->open() != success)
//       return ;

//    tell(0, "---------------------------------------------------");

//    cDbStatement* selectAllImages = new cDbStatement(imageRefDb);

//    cDbValue imageData;
//    imageData.setField(imageDb->getField(cTableImages::fiImage));

//    // select r.imagename, r.eventid, r.lfn, i.image from imagerefs r, images i
//    //    where r.imagename = i.imagename and i.image is not null;

//    selectAllImages->build("select ");
//    selectAllImages->setBindPrefix("r.");
//    selectAllImages->bind(cTableImageRefs::fiImgName, cDBS::bndOut);
//    selectAllImages->bind(cTableImageRefs::fiEventId, cDBS::bndOut, ", ");
//    selectAllImages->bind(cTableImageRefs::fiLfn, cDBS::bndOut, ", ");
//    selectAllImages->setBindPrefix("i.");
//    selectAllImages->bind(&imageData, cDBS::bndOut, ",");
//    selectAllImages->clrBindPrefix();
//    selectAllImages->build(" from %s r, %s i where ", imageRefDb->TableName(), imageDb->TableName());
//    selectAllImages->build("r.%s = i.%s and i.%s is not null;",
//             imageRefDb->getField(cTableImageRefs::fiImgName)->name,
//             imageDb->getField(cTableImages::fiImgName)->name,
//             imageDb->getField(cTableImages::fiImage)->name);

//    selectAllImages->prepare();


//    tell(0, "---------------------------------------------------");

//    //delete s;
//    delete imageRefDb;
//    delete imageDb;
// }

// //***************************************************************************
// //
// //***************************************************************************

// void chkStatement3()
// {
//    int count = 0;
//    int lcount = 0;

//    cDbTable* epgDb = new cTableEvents(connection);
//    cDbTable* mapDb = new cTableChannelMap(connection);

//    if (epgDb->open() != success)
//       return ;

//    if (mapDb->open() != success)
//       return ;

//    tell(0, "---------------------------------------------------");

//    cDbStatement* s = new cDbStatement(epgDb);

//    s->build("select ");
//    s->setBindPrefix("e.");
//    s->bind(cTableEvents::fiEventId, cDBS::bndOut);
//    s->bind(cTableEvents::fiChannelId, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiSource, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiDelFlg, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiFileRef, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiTableId, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiVersion, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiTitle, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiShortText, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiStartTime, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiDuration, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiParentalRating, cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiVps,  cDBS::bndOut, ", ");
//    s->bind(cTableEvents::fiDescription, cDBS::bndOut, ", ");
//    s->clrBindPrefix();
//    s->build(" from eventsview e, %s m where ", mapDb->TableName());
//    s->build("e.%s = m.%s and e.%s = m.%s and ",
//                           epgDb->getField(cTableEvents::fiChannelId)->name,
//                           mapDb->getField(cTableChannelMap::fiChannelName)->name,
//                           epgDb->getField(cTableEvents::fiSource)->name,
//                           mapDb->getField(cTableChannelMap::fiSource)->name);
//    s->bindCmp("e", cTableEvents::fiUpdSp, 0, ">");
//    s->build(" order by m.%s;", mapDb->getField(cTableChannelMap::fiChannelName)->name);

//    s->prepare();

//    epgDb->clear();
//    epgDb->setValue(cTableEvents::fiUpdSp, (double)0);
//    epgDb->setValue(cTableEvents::fiSource, "vdr");                             // used by selectUpdEventsByChannel
//    epgDb->setValue(cTableEvents::fiChannelId, "xxxxxxxxxxxxx");    // used by selectUpdEventsByChannel

//    int channels = 0;
//    char chan[100]; *chan = 0;

//    tell(0, "---------------------------------------------------");

//    for (int found = s->find(); found; found = s->fetch())
//    {
//       if (!*chan || strcmp(chan, epgDb->getStrValue(cTableEvents::fiChannelId)) != 0)
//       {
//          if (*chan)
//             tell(0, "processed %-20s with %d events", chan, count - lcount);

//          lcount = count;
//          channels++;
//          strcpy(chan, epgDb->getStrValue(cTableEvents::fiChannelId));

//          tell(0, "processing %-20s now", chan);
//       }

//       tell(0, "-> '%s' - (%ld)", epgDb->getStrValue(cTableEvents::fiChannelId),
//            epgDb->getIntValue(cTableEvents::fiEventId));


//       count++;
//    }

//    s->freeResult();

//    tell(0, "---------------------------------------------------");
//    tell(0, "updated %d channels and %d events", channels, count);
//    tell(0, "---------------------------------------------------");

//    delete s;
//    delete epgDb;
//    delete mapDb;
// }

// //***************************************************************************
// //
// //***************************************************************************

// void chkStatement4()
// {
//    cDbTable* eventDb = new cTableEvents(connection);
//    if (eventDb->open() != success) return;

//    cDbTable* imageRefDb = new cTableImageRefs(connection);
//    if (imageRefDb->open() != success) return;

//    cDbTable* imageDb = new cTableImages(connection);
//    if (imageDb->open() != success) return;

//    // select e.masterid, r.imagename, r.eventid, r.lfn, i.image
//    //      from imagerefs r, images i, events e
//    //      where r.imagename = i.imagename
//    //         and e.eventid = r.eventid,
//    //         and i.image is not null
//    //         and (i.updsp > ? or r.updsp > ?);

//    cDBS::FieldDef masterFld = { "masterid", cDBS::ffUInt,  0, 999, cDBS::ftData };
//    cDbValue masterId;
//    cDbValue imageData;
//    cDbValue imageUpdSp;

//    masterId.setField(&masterFld);
//    imageData.setField(imageDb->getField(cTableImages::fiImage));
//    imageUpdSp.setField(imageDb->getField(cTableImages::fiUpdSp));

//    cDbStatement* selectAllImages = new cDbStatement(imageRefDb);

//    selectAllImages->build("select ");
//    selectAllImages->setBindPrefix("e.");
//    selectAllImages->bind(&masterId, cDBS::bndOut);
//    selectAllImages->setBindPrefix("r.");
//    selectAllImages->bind(cTableImageRefs::fiImgName, cDBS::bndOut, ", ");
//    selectAllImages->bind(cTableImageRefs::fiEventId, cDBS::bndOut, ", ");
//    selectAllImages->bind(cTableImageRefs::fiLfn, cDBS::bndOut, ", ");
//    selectAllImages->setBindPrefix("i.");
//    selectAllImages->bind(&imageData, cDBS::bndOut, ", ");
//    selectAllImages->clrBindPrefix();
//    selectAllImages->build(" from %s r, %s i, %s e where ",
//                           imageRefDb->TableName(), imageDb->TableName(), eventDb->TableName());
//    selectAllImages->build("e.%s = r.%s and i.%s = r.%s and i.%s is not null and (",
//                           eventDb->getField(cTableEvents::fiEventId)->name,
//                           imageRefDb->getField(cTableImageRefs::fiEventId)->name,
//                           imageDb->getField(cTableImageRefs::fiImgName)->name,
//                           imageRefDb->getField(cTableImageRefs::fiImgName)->name,
//                           imageDb->getField(cTableImages::fiImage)->name);
//    selectAllImages->bindCmp("i", &imageUpdSp, ">");
//    selectAllImages->build(" or ");
//    selectAllImages->bindCmp("r", cTableImageRefs::fiUpdSp, 0, ">");
//    selectAllImages->build(");");

//    selectAllImages->prepare();

//    imageRefDb->clear();
//    imageRefDb->setValue(cTableImageRefs::fiUpdSp, 1377733333L);
//    imageUpdSp.setValue(1377733333L);

//    int count = 0;
//    for (int res = selectAllImages->find(); res; res = selectAllImages->fetch())
//    {
//       count ++;
//    }
//    tell(0,"%d", count);
// }

//***************************************************************************
// Content Of
//***************************************************************************

int contentOf(char* buf, const char* tag, const char* xml)
{
   std::string sTag = "<" + std::string(tag) + ">";
   std::string eTag = "</" + std::string(tag) + ">";

   const char* s;
   const char* e;

   *buf = 0;

   if ((s = strstr(xml, sTag.c_str())) && (e = strstr(xml, eTag.c_str())))
   {
      s += strlen(sTag.c_str());

      sprintf(buf, "%.*s", (int)(e-s), s);

      return success;
   }

   return fail;
}

//***************************************************************************
// Get Timer Id Of
//***************************************************************************

long getTimerIdOf(const char* aux)
{
   char epgaux[1000+TB];
   char tid[100+TB];

   if (isEmpty(aux))
      return na;

   if (contentOf(epgaux, "epgd", aux) != success)
      return na;

   if (contentOf(tid, "timerid", epgaux) != success)
      return na;

   return atol(tid);
}

//***************************************************************************
// Remove Tag
//***************************************************************************

void removeTag(char* xml, const char* tag)
{
   std::string sTag = "<" + std::string(tag) + ">";
   std::string eTag = "</" + std::string(tag) + ">";

   const char* s;
   const char* e;

   if ((s = strstr(xml, sTag.c_str())) && (e = strstr(xml, eTag.c_str())))
   {
      char tmp[1000+TB];

      e += strlen(eTag.c_str());

      // sicher ist sicher ;)

      if (e <= s)
         return;

      sprintf(tmp, "%.*s%s", int(s-xml), xml, e);

      strcpy(xml, tmp);
   }
}

//***************************************************************************
// Insert Tag
//***************************************************************************

int insertTag(char* xml, const char* parent, const char* tag, int value)
{
   char tmp[1000+TB];
   std::string sTag = "<" + std::string(parent) + ">";
   const char* s;

   if ((s = strstr(xml, sTag.c_str())))
   {
      s += strlen(sTag.c_str());
      sprintf(tmp, "%.*s<%s>%d</%s>%s", int(s-xml), xml, tag, value, tag, s);
   }
   else
   {
      sprintf(tmp, "%s<%s><%s>%d</%s></%s>", xml, parent, tag, value, tag, parent);
   }

   strcpy(xml, tmp);

   return success;
}

//***************************************************************************
//
//***************************************************************************

void statementrecording()
{
   int insert;

   tell(0, "---------------------------------");

   cDbTable* recordingListDb = new cDbTable(connection, "recordinglist");
   if (recordingListDb->open() != success) return ;

   recordingListDb->clear();

#ifdef USEMD5
   md5Buf md5path;
   createMd5("rec->FileName() dummy", md5path);
   recordingListDb->setValue("MD5PATH", md5path);
#else
   recordingListDb->setValue("MD5PATH", "dummy");
#endif

   recordingListDb->setValue("OWNER", "me");
   recordingListDb->setValue("STARTTIME", 12121212);

   insert = !recordingListDb->find();
   recordingListDb->clearChanged();

   tell(0, "#1 %d changes", recordingListDb->getChanges());

   // recordingListDb->setValue("STATE", "E");
   recordingListDb->getValue("STATE")->setNull();
   recordingListDb->setValue("PATH", "rec->FileName()");
   recordingListDb->setValue("TITLE", "title");
   recordingListDb->setValue("SHORTTEXT", "subTitle");
   // recordingListDb->setValue("DESCRIPTION", "description");

   recordingListDb->setValue("DURATION", 120*60);
   recordingListDb->setValue("EVENTID", 1212);
   recordingListDb->setValue("CHANNELID", "xxxxxx");

   tell(0, "#2 %d changes", recordingListDb->getChanges());
   recordingListDb->setValue("FSK", yes);
   tell(0, "#3 %d changes", recordingListDb->getChanges());

   // don't toggle uuid if already set!

   if (recordingListDb->getValue("VDRUUID")->isNull())
      recordingListDb->setValue("VDRUUID", "11111");

   if (insert || recordingListDb->getChanges())
   {
      tell(0, "storing '%s' due to %d changes ", insert ? "insert" : "update", recordingListDb->getChanges());
      recordingListDb->store();
   }

   recordingListDb->reset();

   tell(0, "---------------------------------");

   delete recordingListDb;
}

//***************************************************************************
//
//***************************************************************************

void statementTimer()
{
   cDbValue timerState;
   cDbFieldDef timerStateDef("STATE", "state", cDBS::ffAscii, 100, cDBS::ftData);

   cEpgConfig::loglevel = 0;

   cDbTable* timerDb = new cDbTable(connection, "timers");
   if (timerDb->open() != success) return ;

   cDbTable* useeventsDb = new cDbTable(connection, "useevents");
   if (useeventsDb->open() != success) return ;

   // select t.*,
   //       e.eventid, e.channelid, e.title, e.shorttext, e.shortdescription, e.category, e.genre, e.tipp
   //    from timers t left outer join events e
   //       on (t.eventid = e.masterid and e.updflg in (...))
   //    where
   //      t.state in (?)

   timerState.setField(&timerStateDef);

   cDbStatement* selectAllTimer = new cDbStatement(timerDb);

   selectAllTimer->build("select ");
   selectAllTimer->setBindPrefix("t.");
   selectAllTimer->bindAllOut();
   selectAllTimer->setBindPrefix("e.");
   selectAllTimer->bind(useeventsDb, "USEID", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "CHANNELID", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "TITLE", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "SHORTTEXT", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "SHORTDESCRIPTION", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "CATEGORY", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "GENRE", cDBS::bndOut, ", ");
   selectAllTimer->bind(useeventsDb, "TIPP", cDBS::bndOut, ", ");
   selectAllTimer->clrBindPrefix();
   selectAllTimer->build(" from %s t left outer join %s e",
                         timerDb->TableName(), "eventsviewplain");
   selectAllTimer->build(" on (t.eventid = e.cnt_useid) and e.updflg in (%s)", cEventState::getVisible());

   selectAllTimer->setBindPrefix("t.");
   selectAllTimer->build(" where ");
   selectAllTimer->bindInChar(0, "STATE", &timerState);

   cEpgConfig::loglevel = 2;
   selectAllTimer->prepare();

   // ---------------------------------

   timerDb->clear();
   timerState.setValue("A,D,P");

   tell(0, "---------------------------------");

   for (int found = selectAllTimer->find(); found; found = selectAllTimer->fetch())
   {
      tell(0, "%ld) %s - %s",
           timerDb->getIntValue("ID"),
           timerDb->getStrValue("STATE"),
           timerDb->getStrValue("FILE"));
   }

   tell(0, "---------------------------------");

   delete selectAllTimer;
   delete timerDb;
}

void statementVdrs()
{
   cDbTable* vdrDb = new cDbTable(connection, "vdrs");
   if (vdrDb->open() != success) return ;

   vdrDb->clear();
   vdrDb->setValue("UUID", "10");
   vdrDb->find();
   vdrDb->setValue("VIDEOTOTAL", 1782579);
   vdrDb->store();

   delete vdrDb;
}

cDbFieldDef matchDensityTitleDef("MATCHDENSITYTITLE", "matchdensitytitle", cDBS::ffInt, 0, cDBS::ftData);
cDbFieldDef matchDensityShorttextDef("MATCHDENSITYSHORTTEXT", "matchdensityshorttext", cDBS::ffInt, 0, cDBS::ftData);

void chkStatement5()
{
   int count = 0;
   cDbValue matchDensityTitle;
   cDbValue matchDensityShorttext;

   cDbTable* recordingListDb = new cDbTable(connection, "recordinglist");
   if (recordingListDb->open() != success) return ;

   matchDensityTitle.setField(&matchDensityTitleDef);
   matchDensityShorttext.setField(&matchDensityShorttextDef);

   recordingListDb->clear();

   cDbStatement* selectRecordingForEventByLv = new cDbStatement(recordingListDb);

   selectRecordingForEventByLv->build("select ");
   selectRecordingForEventByLv->bind(recordingListDb->getField("TITLE"), cDBS::bndOut);
   selectRecordingForEventByLv->bind(recordingListDb->getField("SHORTTEXT"), cDBS::bndOut, ", ");

   selectRecordingForEventByLv->bindTextFree(", 100 - ifNull(epglvr(title, ?), 100)", &matchDensityTitle, cDBS::bndOut);
   selectRecordingForEventByLv->appendBinding(recordingListDb->getValue("TITLE"), cDBS::bndIn);
   selectRecordingForEventByLv->bindTextFree(", 100 - ifNull(epglvr(shorttext, ?), 100)", &matchDensityShorttext, cDBS::bndOut);
   selectRecordingForEventByLv->appendBinding(recordingListDb->getValue("SHORTTEXT"), cDBS::bndIn);

   selectRecordingForEventByLv->build(" from %s where", recordingListDb->TableName());
   selectRecordingForEventByLv->build(" (%s <> 'D' or %s is null)",
                                      recordingListDb->getField("STATE")->getDbName(),
                                      recordingListDb->getField("STATE")->getDbName());
   selectRecordingForEventByLv->bindTextFree("and epglvr(title, ?) < 47", recordingListDb->getValue("TITLE"), cDBS::bndIn);

   if (selectRecordingForEventByLv->prepare() != success)
   {
      tell(0, "prepare failed");
      return;
   }

   tell(0, "---------------------------------------------------");
   const char* title = "Star Wars: Die Rache der Sith";
   tell(0, "matches for '%s'", title);
   tell(0, "---------------------------------------------------");

   recordingListDb->clear();
   recordingListDb->setValue("TITLE", title);
   recordingListDb->setValue("SHORTTEXT", "Science-Fiction (USA 1979)");

   for (int f = selectRecordingForEventByLv->find(); f; f = selectRecordingForEventByLv->fetch())
   {
      count++;
      tell(2, "%03d) match density (%ld / %ld) for recording '%s' '%s'", count,
           matchDensityTitle.getIntValue(), matchDensityShorttext.getIntValue(),
           recordingListDb->getStrValue("TITLE"), recordingListDb->getStrValue("SHORTTEXT"));
   }

   tell(0, "---------------------------------------------------");
   tell(2, "%d recordings", count);

   selectRecordingForEventByLv->freeResult();
}

//***************************************************************************
// Main
//***************************************************************************

int main(int argc, char** argv)
{
   cEpgConfig::logstdout = yes;
   cEpgConfig::loglevel = 2;

   if (argc > 1)
   {
      int size = 0;
      char* url = 0;
      MemoryStruct data;

      data.clear();

      if (strncmp(argv[1], "http", 4) == 0)
         asprintf(&url, "%s", argv[1]);
      else
         asprintf(&url, "%s/eplist.cgi?action=show&file=%s",
                  "www.eplists.de", argv[1]);

      tell(0, "try to download [%s]", url);

      if (curl.downloadFile(url, size, &data) == success)
      {
         tell(0, "succeeded!");
         tell(0, "Got: !");
         tell(0, "%s", data.memory);
      }
      else
         tell(0, "FAILED!");


      free(url);

      return 0;
  }

   setlocale(LC_CTYPE, "");
   char* lang = setlocale(LC_CTYPE, 0);

   if (lang)
   {
      tell(0, "Set locale to '%s'", lang);

      if ((strcasestr(lang, "UTF-8") != 0) || (strcasestr(lang, "UTF8") != 0))
         tell(0, "detected UTF-8");
      else
         tell(0, "no UTF-8");
   }
   else
   {
      tell(0, "Reseting locale for LC_CTYPE failed.");
   }

   // read dictionary

//   if (dbDict.in("demo.dat") != success)
   if (dbDict.in("../configs/epg.dat") != success)
   {
      tell(0, "Invalid dictionary configuration, aborting!");
      return 1;
   }

//   dbDict.show();

   initConnection();

   chkStatement5();

   // structure();

//    chkCompress();

//    tell(0, "duration was: '%s'", ms2Dur(2340).c_str());

//   statementVdrs();

   // statementTimer();
   // statementrecording();
   // chkStatement2();
   // chkStatement3();
   // chkStatement4();   exitConnection();

   return 0;
}
