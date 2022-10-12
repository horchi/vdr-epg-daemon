

#include <stdio.h>
#include <unistd.h>

#include "epg2vdr.h"
#include "update.h"

int loglevel = 4;
cDbConnection* connection = 0;

int fileExists(const char* path)
{
   return access(path, F_OK) == 0; 
}

cEvent::cEvent(tEventID EventID)
{
  schedule = NULL;
  eventID = EventID;
  tableID = 0xFF;
  version = 0xFF;
  title = NULL;
  shortText = NULL;
  description = NULL;
  components = NULL;
  memset(contents, 0, sizeof(contents));
  parentalRating = 0;
  startTime = 0;
  duration = 0;
  vps = 0;
}

cEvent::~cEvent()
{
}

int cEvent::Compare(const cListObject &ListObject) const
{
   return 0;
}

void cEvent::SetTitle(const char* t) 
{
   title = strcpyrealloc(title, t);
}

void cEvent::SetShortText(const char *ShortText)
{
   shortText = strcpyrealloc(shortText, ShortText);
}

void cEvent::SetDescription(const char *Description)
{
   description = strcpyrealloc(description, Description);
}

void cEvent::SetStartTime(time_t StartTime)
{
}

void cEvent::SetDuration(int Duration)
{
}

// --- tChannelID ------------------------------------------------------------

const tChannelID tChannelID::InvalidID;

tChannelID tChannelID::FromString(const char *s)
{
//   char *sourcebuf = NULL;
//   int nid;
//   int tid;
//   int sid;
//   int rid = 0;
//   int fields = sscanf(s, "%a[^-]-%d-%d-%d-%d", &sourcebuf, &nid, &tid, &sid, &rid);
//   if (fields == 4 || fields == 5) {
//      int source = cSource::FromString(sourcebuf);
//      free(sourcebuf);
//      if (source >= 0)
//         return tChannelID(source, nid, tid, sid, rid);
//      }
  return tChannelID::InvalidID;
}

// cString tChannelID::ToString(void) const
// {
//   char buffer[256];
//   snprintf(buffer, sizeof(buffer), rid ? "%s-%d-%d-%d-%d" : "%s-%d-%d-%d", *cSource::ToString(source), nid, tid, sid, rid);
//   return buffer;
// }

tChannelID &tChannelID::ClrPolarization(void)
{
  while (tid > 100000)
        tid -= 100000;
  return *this;
}


//***************************************************************************
// Parse XML Event
//***************************************************************************

int parseEvent(cDbRow* event, xmlNode* node)
{
   const char* name;
   char* content;

   for (xmlNodePtr n = node->xmlChildrenNode; n; n = n->next)
   {
      if (n->type != XML_ELEMENT_NODE)
         continue;
      
      name = (const char*)n->name;
      content = (char*)xmlNodeGetContent(n);
      
      printf("\t%s = '%s'\n", name, content);

      if (cDbService::FieldDef* f = cEventFields::toField(name))
      {
         if (f->format == cDbService::ffAscii)
            event->setValue(f->index, content);
         else
            event->setValue(f->index, atoi(content));
      }
      else
         printf("Ignoring unexpected element <%s>\n", name);

      xmlFree(content);
   }

   return success;
}

//***************************************************************************
// 
//***************************************************************************

MemoryStruct data;

//***************************************************************************
// Download Episodes and store to filesystem
//***************************************************************************

int downloadEpisodes(Table* episodeDb)
{
   // #CKO

   // cSvdrpClient cl("eplists.constabel.net", 2006 /*port*/);
   cSvdrpClient cl("bauerl", 2006 /*port*/);

   string fileName;
   string linkName;
   int isLink = 0;
   cEpisodeFiles files;
   int code;
   int abort = 0;
   char command[50];
   int withutf8 = yes;

   if (cl.open() != 0)
   {
      printf("Open connection to '%s' failed, aborting transfer!\n", "eplists.constabel.net");
      return fail;
   }

   printf("Starting episode download ...\n");

   // select characterset

   printf("request charset ...\n");

   if (!cl.send(withutf8 ? "CHARSET utf-8\n": "CHARSET iso-8859-1\n"))
   {
      tell(0, "Send '%s' failed, aborting transfer!", command);
      cl.close();
      
      return fail;
   }

   // check for characterset confirmation
   
   cList<cLine> csconf;
   
   if (cl.receive(&csconf) != 225) 
   {
      tell(0, "SVDRPCL: did not receive charset confirmation. Closing...");
      cl.abort();
      
      return fail;
   }
   
   if (csconf.First() && csconf.First()->Text())
      tell(0, "Got '%s'", csconf.First()->Text());

   // identify myself


   sprintf(command, "HELLO %s v%s (%s)\n", "epgd", VERSION, VERSION_DATE);
   printf("send %s", command);
   cl.send(command);
   cl.receive();

   // GET 

   // sprintf(command, "GET all\n");              // #CKO
   sprintf(command, "TGET newer than 4 days\n");  // #CKO

   printf("send %s", command);

   if (!cl.send(command))
   {
      printf("Send '%s' failed, aborting transfer!\n", command);
      cl.close();

      return fail;
   }

   cList<cLine>* result = new cList<cLine>;
      
   while (!abort && (code = cl.receive(result)) != codeCommunicationEnd)
   {
      switch (code)
      {
         case codeFileInfo:
         {
            if (result->Count() < 2)
            {
               if (loglevel > 1)
                  printf("Protocol violation, aborting!\n");

               abort = 1;
            }
            else
            {
               linkName = "";
               fileName = result->Next(result->First())->Text();
               isLink = fileName != "not a link";
                  
               if (!isLink)
                  fileName = result->First()->Text();
               else
                  linkName = result->First()->Text();
            }
               
            break;
         }
         case codeFileContent:
         {
            if (isLink)
            {
               files.Add(new cEpisodeFile(fileName, linkName));
            }
            else
            {
               for (cLine* l = result->First(); l; l = result->Next(l))
               {
                  if (strcmp(l->Text(), "End of data") == 0)
                  {
                     result->Del(l);
                     break;
                  }
               }

               if (result->Count())
               {
                  // create episode file and adopt the result
                  
                  files.Add(new cEpisodeFile(fileName, "", result));
                  
                  // create new result object since cEpisodeFile adopted the current
                  
                  result = new cList<cLine>;
               }
            }
               
            break;
         }
            
         case codeTransferEnd:
         {
            abort = 1;
            break;
         }
      }
         
      result->Clear();
   }

   printf("Received %d episode files\n", files.Count());
   files.storeToFile("./epl/");
   files.storeToTable(episodeDb);

   delete result;
   cl.close();

   return 0;
}

//***************************************************************************
// Update Map Table
//***************************************************************************

int updateChannelMap(cChannelMap* chanmap, const char* dbpath)
{
   Table* mapDb;
   int count = 0;

   mapDb = new Table(connection, "channelmap", cChannelMapFields::fields);

   if (mapDb->open() != success)
   {
      tell(0, "Could not access sqlite database %s for table %s", dbpath,
              mapDb->TableName());

      return fail;
   }

   mapDb->truncate();

   tell(0, "Update map");

   for (cChanMap::iterator iter = chanmap->chanmap.begin(); iter != chanmap->chanmap.end(); iter++)
   {
      const char* extid = iter->first;
      
      tell(0, "Update map for extid %s", extid);

      for (int index = 0; index < chanmap->GetChanCount(extid); index++)
      {
         mapDb->clear();
         mapDb->setValue(cChannelMapFields::fiExtId, extid);
         mapDb->setValue(cChannelMapFields::fiChannelId, chanmap->GetChanStr(extid, index));
         mapDb->setValue(cChannelMapFields::fiSource, chanmap->isNull(extid) ? "epgdata" : "vdr");
         mapDb->store();
         tell(0, "insert '%s' to extid %s in map", chanmap->GetChanStr(extid, index), extid);
         count++;
      }
   }

   tell(0, "Update channel map done with %d entries", count);

   delete mapDb;

   return success;
}

//***************************************************************************
// Main
//***************************************************************************

int main(int argc, char** argv)
{
   int res;

   if (argc < 1)
   {
      printf("Usage: %s \n", argv[0]);
      return 1;
   }

   Table::setConfPath("./configs/epg2vdr");
   cDbConnection::setHost("bauerl");                // #CKO
   cDbConnection::setEncoding("utf8");

   connection = new cDbConnection();

    // ------------------------------------------------
    // Image Table Test


   Table* imageDb = new Table(connection, "images", cImageFields::fields, cImageFields::views);

   if (imageDb->open() != success)
   {
       printf("Opening database 'images' failed\n");
       delete imageDb;
       return 1;
   }

//    imageDb->clear();
//    imageDb->setValue(cImageFields::fiEventId, 1212);
//    imageDb->setValue(cImageFields::fiLfn, 0);
//    imageDb->setValue(cImageFields::fiName, "1212.jpg");
//    imageDb->store();
   
   imageDb->clear();
   imageDb->setValue(cImageFields::fiLfn, 1);  // limit to config

   for (int res = imageDb->find(cImageFields::viAllLessLfn); res; res = imageDb->fetch(cImageFields::viAllLessLfn))
   {
      int eventid = imageDb->getIntValue(cImageFields::fiEventId);
      const char* image = imageDb->getStrValue(cImageFields::fiName);
      int lfn = imageDb->getIntValue(cImageFields::fiLfn);

      char* destfile;
      asprintf(&destfile, "./%s", image);

      // get image if missing
      
      if (!fileExists(destfile) && !imageDb->isNull(cImageFields::fiImage))
      {
         printf("Store image '%s' with %ld bytes\n", 
              destfile, imageDb->getStrValueSize(cImageFields::fiImage));
         
         if (FILE* fh1 = fopen(destfile, "w"))
         {
            fwrite(imageDb->getStrValue(cImageFields::fiImage), 1, 
                   imageDb->getStrValueSize(cImageFields::fiImage), fh1);
            fclose(fh1);
         }
         else
         {
            printf("can't write image to '%s', error was '%m'\n", destfile);
         }
      }

      free(destfile);
   }

   imageDb->resetFetch(cImageFields::viAllLessLfn);
   imageDb->clear();
   imageDb->setValue(cImageFields::fiLfn, 1);  // limit to config

//    delete imageDb;
//    return 0;

   for (int res = imageDb->find(cImageFields::viAllLessLfn); res; res = imageDb->fetch(cImageFields::viAllLessLfn))
   {
      int eventid = imageDb->getIntValue(cImageFields::fiEventId);
      const char* image = imageDb->getStrValue(cImageFields::fiName);
      int lfn = imageDb->getIntValue(cImageFields::fiLfn);

      // if (lfn != 0) tell(0, "Got lfn %d from table, max is %d", lfn, EPG2VDRConfig.maximagesperevent);

      char* destfile;
      asprintf(&destfile, "./%s", image);

      printf("Check for '%s'\n", destfile);

      // import the images from the FS into the table 

      if (fileExists(destfile))
      {
         printf("Found '%s' import to database\n", destfile);

         if (FILE* fh1 = fopen(destfile, "r"))
         {
            int size = 200000;
            char* buf = (char*)calloc(size, sizeof(char));

            size = fread(buf, 1, size, fh1);

            if (size > 0 || size < 200000)
            {
               printf("Copy image '%s' with %d bytes to table\n", destfile, size);
               imageDb->setValue(cImageFields::fiImage, buf, size);
               imageDb->store();
            }

            free(buf);
            fclose(fh1);
         }
         else
         {
            tell(1, "Can't open image '%s', error was '%m'", destfile);
         }
      }

      free(destfile);
   }

   imageDb->resetFetch(cImageFields::viAllLessLfn);
   delete imageDb;

   return 0;

    // ------------------------------------------------
    // Constabel Test

    Table* episodesDb = new Table(connection, "episodes", cEpisodeFields::fields, cEpisodeFields::views);

    if (episodesDb->open() != success)
    {
       printf("Opening database 'episodes' failed\n");
       delete episodesDb;
       return 1;
    }

    // test insert ...

    episodesDb->clear();
    episodesDb->setValue(cEpisodeFields::fiCompName, "TESTSERIE1");
    episodesDb->setValue(cEpisodeFields::fiCompPartName, "TESTSERIE");
    episodesDb->setValue(cEpisodeFields::fiEpisodeName, "PART1");
    episodesDb->setValue(cEpisodeFields::fiPartName, "part1");
    episodesDb->setValue(cEpisodeFields::fiLang, "de");

    episodesDb->store();

    episodesDb->clear();
    episodesDb->setValue(cEpisodeFields::fiCompName, "TESTSERIE1");
    episodesDb->setValue(cEpisodeFields::fiCompPartName, "TESTSERIE");
    episodesDb->setValue(cEpisodeFields::fiLang, "de");

    if (episodesDb->find())
    {
       printf("Got: %s\n", episodesDb->getStrValue(cEpisodeFields::fiEpisodeName));
       printf("Got: %s\n", episodesDb->getStrValue(cEpisodeFields::fiPartName));
    }

    downloadEpisodes(episodesDb);
    // evaluateEpisodes(episodesDb, evtDb);

    delete episodesDb;

    // ------------------------------------------------
    // Test Episodes Table ...
    
    printf("\n----------------------------------\n");
    
    Table* epiDb = new Table(connection, "episodes", cEpisodeFields::fields, cEpisodeFields::views);
    
    if (epiDb->open() != success)
    {
      printf("Opening database 'episodes' failed\n");
      delete epiDb;
      return 1;
    }

    int days = na;
    
    epiDb->clear();
    epiDb->setValue(cEpisodeFields::fiCompName, "TESTSERIE");
    epiDb->setValue(cEpisodeFields::fiCompPartName, "TESTSERIE");
    epiDb->setValue(cEpisodeFields::fiEpisodeName, "test serie");
    epiDb->setValue(cEpisodeFields::fiPartName, "part1");
    epiDb->setValue(cEpisodeFields::fiLang, "de");
    epiDb->store();

    epiDb->clear();

    if (epiDb->find(cEpisodeFields::viMaxUpdSp))
    {
       printf("found - max updsp is (%ld)\n", epiDb->getIntValue(cEpisodeFields::fiMaxUpdSp));
       
       if (epiDb->getIntValue(cEpisodeFields::fiMaxUpdSp))
          days = (time(0) - epiDb->getIntValue(cEpisodeFields::fiMaxUpdSp)) / 60 / 60 / 24;
    }
    
    epiDb->resetFetch(cEpisodeFields::viMaxUpdSp);
    
    printf("episodes have to get %d days\n", days);
    
    delete epiDb;

    // ------------------------------------------------
    // Test EPG Table ...
    
    printf("\n----------------------------------\n");
    
    Table* db = new Table(connection, "events", cEventFields::fields, cEventFields::views);
    
    if (db->open() != success)
    {
       printf("Opening database 'events' failed\n");
       delete db;
       return 1;
    }
    
   db->setValue(cEventFields::fiEventId, 4711);
   db->setValue(cEventFields::fiSource, "epgdata");
   db->setValue(cEventFields::fiTitle, "Test Title");
   db->setValue(cEventFields::fiCompTitle, "TESTTITLE");
   db->setValue(cEventFields::fiChannelId, "11");
   db->setValue(cEventFields::fiCategory, "cat 11");
   db->store();

   db->clear();
   db->setValue(cEventFields::fiEventId, 4712);
   db->setValue(cEventFields::fiSource, "epgdata");
   db->setValue(cEventFields::fiShortText, "blablabla");
   db->setValue(cEventFields::fiTitle, "Test Title 12");
   db->setValue(cEventFields::fiCompTitle, "TESTTITLE");
   db->setValue(cEventFields::fiChannelId, "11");
   db->setValue(cEventFields::fiFileRef, "test-1234");
   db->setValue(cEventFields::fiCategory, "cat 12");
   db->setValue(cEventFields::fiLongDescription, 
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
   db->store();

   db->clear();
   db->setValue(cEventFields::fiEventId, 4713);
   db->setValue(cEventFields::fiSource, "epgdata");
   db->setValue(cEventFields::fiTitle, "Test Title what the fuck ...");
   db->setValue(cEventFields::fiChannelId, "11");
   db->setValue(cEventFields::fiFileRef, "test-11111");
   db->setValue(cEventFields::fiCategory, "cat 13");
   db->setValue(cEventFields::fiCompTitle, "TESTTITLEWHATTHEFUCK");
   db->store();

   // fetch via view

   printf("lookup events for channel 11 via lview\n");

   db->clear();
   db->setValue(cEventFields::fiChannelId, "11");
   db->setValue(cEventFields::fiSource, "epgdata");

   for (res = db->find(cEventFields::viByChannel); res; res = db->fetch(cEventFields::viByChannel))
   {
      if (!db->find())
         printf("FATAL!\n");

      int id = db->getIntValue(cEventFields::fiEventId);

      printf("    -> found event '%s'(%d) [%s] '%s'\n", 
             db->getStrValue(cEventFields::fiTitle),
             id, 
             db->getStrValue(cEventFields::fiCompTitle),
             db->getStrValue(cEventFields::fiCategory));
      
      if (!db->find(cEventFields::viVdr))         // perform select to load view fields
      {
         printf("Fatal can't lookup event %d\n", id);
         continue;
      }
      
      db->resetFetch(cEventFields::viVdr);
   }

   db->resetFetch(cEventFields::viByChannel);

   int count;
   db->countWhere("source = 'epgdata'", count);
   printf("source 'epgdata' -> %d\n", count);

   db->countWhere("source = 'vdr'", count);
   printf("source 'vdr' -> %d\n", count);

   db->countWhere("", count);
   printf("all events  -> %d\n", count);

   delete db;

   return 0;

   printf("\n");
   
   // ---------------------------------
   
   printf("lookup events by comptitle 'TESTTITLE' lview\n");
   
   db->setValue(cEventFields::fiCompTitle, "TESTTITLE");
   
   for (int res = db->find(cEventFields::viByCompTitle); res;
        res = db->fetch(cEventFields::viByCompTitle))
   {
      if (!db->find())
         printf("FATAL!\n");
      
      printf("    -> found (%ld) '%s' by comptitle [%s]\n", 
             db->getIntValue(cEventFields::fiEventId),
             db->getStrValue(cEventFields::fiTitle),
             db->getStrValue(cEventFields::fiCompTitle));
   }
   
   db->resetFetch(cEventFields::viByCompTitle);

   printf("\n");

   printf("lookup event by db-view\n");

   db->clear();
   db->setValue(cEventFields::fiEventId, 4712);
   db->setValue(cEventFields::fiChannelId, "11");

   if (db->find(cEventFields::viVdr))
   {
      if (!db->find())
         printf("FATAL!\n");

      int id = db->getIntValue(cEventFields::fiEventId);
      printf("    -> found event '%s'(%d) [%s] '%s'\n", 
             db->getStrValue(cEventFields::fiTitle),
             id, 
             db->getStrValue(cEventFields::fiCompTitle),
             db->getStrValue(cEventFields::fiShortText)
         );
      printf("    -> [%s]\n", 
             db->getStrValue(cEventFields::fiDescription));
   }

   db->resetFetch(cEventFields::viVdr);

   delete db;

   return 0;

   printf("----------------------------------\n");

   // delete db; 

   // ------------------------------------------------
   // Test Image Table ...

   printf("\n----------------------------------\n");

   Table* imgDb = new Table(connection, "images", cImageFields::fields, cImageFields::views);

   if (imgDb->open() != success)
   {
      printf("Opening database 'images' failed\n");
      delete imgDb;
      return 1;
   }

   imgDb->setValue(cImageFields::fiEventId, 4711);
   imgDb->setValue(cImageFields::fiLfn, 0);
   imgDb->setValue(cImageFields::fiName, "ok 1");

   imgDb->store();

   imgDb->setValue(cImageFields::fiEventId, 4711);
   imgDb->setValue(cImageFields::fiLfn, 1);
   imgDb->setValue(cImageFields::fiName, "fail");

   imgDb->store();

   imgDb->setValue(cImageFields::fiEventId, 4713);
   imgDb->setValue(cImageFields::fiLfn, 0);
   imgDb->setValue(cImageFields::fiName, "ok 2");

   imgDb->store();

   // fetch via view

   imgDb->clear();
   imgDb->setValue(cImageFields::fiLfn, 1);

   for (res = imgDb->find(cImageFields::viAllLessLfn); res; res = imgDb->fetch(cImageFields::viAllLessLfn))
   {
      int id = imgDb->getIntValue(cImageFields::fiEventId);
      printf("    -> found image (%d) via view, name is '%s', lfn is (%ld)\n", 
             id, imgDb->getStrValue(cImageFields::fiName),
             imgDb->getIntValue(cImageFields::fiLfn)); 
   }

   imgDb->resetFetch(cImageFields::viAllLessLfn);

   printf("----------------------------------\n");
   delete imgDb;

   // ------------------------------------------------

   return 0;

   // ------------------------------------------------
   // Test File Table ...

   Table* fileDb = new Table(connection, "fileref", cFileRef::fields);

   fileDb->open();
   
   fileDb->setValue(cEventFields::fiName, "test");

   if (fileDb->find())
      printf("found with tag %s\n", fileDb->getStrValue(cFileRef::fiTag));
   else
      printf("NOT found\n");

   fileDb->setValue(cFileRef::fiTag, "1234");
   fileDb->setValue(cFileRef::fiFileRef, "test-1234");
   fileDb->store();

   delete fileDb;

   // ------------------------------------------------

   return 0;

   // ------------------------------------------------
   // Test XML parsing

   xmlDocPtr xml = 0;

   xml = xmlParseFile("test.xml");
   
   if (!xml)
   {
      printf("Failed to parse test.xml\n");
      return 1;
   }
   
   xmlNodePtr xmlRoot = xmlDocGetRootElement(xml);
   
   for (xmlNodePtr node = xmlRoot->xmlChildrenNode; node; node = node->next)
   {
      cDbRow* evt = 0;
      char* prop = 0;
      tEventID id;

      // skip all unexpected elements
      
      if (node->type != XML_ELEMENT_NODE || strcmp((char*)node->name, "event") != 0)
         continue;
      
      // get/check id
      
      if (!(prop = (char*)xmlGetProp(node, (xmlChar*)"id")) || !*prop || !(id = atoi(prop)))
      {
         xmlFree(prop);
         printf("Missing event id, ignoring!\n");
         continue;
      }

      xmlFree(prop);
      
      // create event

      evt = new cDbRow(cEventFields::fields);
      
      evt->setValue(cEventFields::fiEventId, id);
      evt->setValue(cEventFields::fiSource, "epgdata");
      
      printf("event %ld\n", evt->getIntValue(cEventFields::fiEventId));
      
      if (parseEvent(evt, node) != success)
         delete evt;
   }
   
   xmlFreeDoc(xml);
   
   return 0;
}
