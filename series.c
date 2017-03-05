/*
 * update.c
 *
 * See the README file for copyright information
 *
 */

#include "epgd.h"

//***************************************************************************
// Evaluate
//***************************************************************************

int cEpgd::evaluateEpisodes()
{
   int ec = 0, pp = 0, plv = 0;  // statistics
   long lStart = time(0);
   int updated = 0;

   if (!EpgdConfig.seriesEnabled)
      return done;

   tell(1, "Starting episode lookup ...");

   // first read all events into list ..

   connection->startTransaction();

   // loop over all episodes ..

   for (int f = selectDistCompname->find(); f && !doShutDown(); f = selectDistCompname->fetch())
   {
      // const int maxTitleDist = (((double)strlen(episodeCompName)) / 100.0 * 20.0);
      char* episodeCompName = strdup(episodeDb->getStrValue("COMPNAME"));
      ec++;

      eventsDb->clear();
      eventsDb->setValue("COMPTITLE", episodeCompName);

      // loop over all events matching this episode by COMPTITLE

      for (int f = selectByCompTitle->find(); f; f = selectByCompTitle->fetch())
      {
         cSystemNotification::check();

         if (strlen(eventsDb->getStrValue("COMPSHORTTEXT")) == 0)
            continue;

         const char* evtCompShortText = eventsDb->getStrValue("COMPSHORTTEXT");

         eventsDb->setValue("EPISODECOMPNAME", episodeCompName);

         if (!episodeDb->getValue("COMPSHORTNAME")->isNull())
            eventsDb->setValue("EPISODECOMPSHORTNAME", episodeDb->getStrValue("COMPSHORTNAME"));

         episodeDb->clear();
         episodeDb->setValue("COMPNAME", episodeCompName);
         episodeDb->setValue("COMPPARTNAME", evtCompShortText);

         // search episode part 1:1

         if (selectByCompNames->find())
         {
            pp++;

            if (!eventsDb->hasValue("EPISODECOMPPARTNAME", evtCompShortText)
                || !eventsDb->hasValue("EPISODELANG", episodeDb->getStrValue("LANG")))
            {
               // store reference

               eventsDb->setValue("UPDSP", time(0));
               eventsDb->setValue("EPISODECOMPPARTNAME", evtCompShortText);
               eventsDb->setValue("EPISODELANG", episodeDb->getStrValue("LANG"));

               updateEpisodeAtEvents->execute();
               updated++;
            }
         }

         else  // if not found try via lv
         {
            const int maxDist = (((double)strlen(evtCompShortText)) / 100.0 * 20.0);
            int d;
            int dMin = maxDist+1;
            int tmp;
            char* bestCompPart = 0;
            char* bestCompPartLang = 0;

            for (int f = selectByCompName->find(); f; f = selectByCompName->fetch())
            {
               int lenA = strlen(evtCompShortText);
               int lenB = strlen(episodeDb->getStrValue("COMPPARTNAME"));

               if (::abs(lenA - lenB) >= dMin)
                  continue;

               if ((d = lvDistance(evtCompShortText, episodeDb->getStrValue("COMPPARTNAME"), 20, tmp)) < dMin)
               {
                  free(bestCompPart);
                  free(bestCompPartLang);
                  bestCompPart = strdup(episodeDb->getStrValue("COMPPARTNAME"));
                  bestCompPartLang = strdup(episodeDb->getStrValue("LANG"));
                  dMin = d;
               }
            }

            if (bestCompPart)
            {
               plv++;

               if (!eventsDb->hasValue("EPISODECOMPPARTNAME", bestCompPart)
                   || !eventsDb->hasValue("EPISODELANG", bestCompPartLang))
               {
                  // store reference

                  eventsDb->setValue("UPDSP", time(0));
                  eventsDb->setValue("EPISODECOMPPARTNAME", bestCompPart);
                  eventsDb->setValue("EPISODELANG", bestCompPartLang);

                  updateEpisodeAtEvents->execute();
                  updated++;
               }
            }

            free(bestCompPart);     bestCompPart = 0;
            free(bestCompPartLang); bestCompPartLang = 0;

            selectByCompName->freeResult();
         }

         selectByCompNames->freeResult();
      }

      selectByCompTitle->freeResult();

      free(episodeCompName);
   }

   selectDistCompname->freeResult();
   connection->commit();

   tell(1, "Lookup done for "
        "%d series, matched %d parts by compare and %d parts by lv in %ld seconds; Updated %d",
        ec, pp, plv, time(0)-lStart, updated);

   return success;
}

//***************************************************************************
// Download Episodes and store to table (and filesystem if configured)
//***************************************************************************

int cEpgd::downloadEpisodes()
{
   long int lastFullRun = 0;
   int full = fullupdate;

   if (!EpgdConfig.seriesEnabled)
      return done;

   cSvdrpClient cl(EpgdConfig.seriesUrl, EpgdConfig.seriesPort);
   string fileName;
   string linkName;
   int isLink = 0;
   cEpisodeFiles files;
   int code;
   int abort = 0;
   char command[200];
   int minutes = na;

   if (selectMaxUpdSp->find() && episodeDb->getIntValue("UpdSp") > 0)
      minutes = (time(0) - episodeDb->getIntValue("UpdSp")) / 60;

   selectMaxUpdSp->freeResult();

   full = full || minutes == na;

   tell(1, "Starting '%s' episode download ...", full ? "fullupdate" : "update");

   if (!minutes && !full)
   {
      tell(1, "Nothing to be done, all episodes are up-to-date");
      return done;
   }

   getParameter("epgd", "lastEpisodeFullRun", lastFullRun);

   if (full && lastFullRun > time(0) - 6 * tmeSecondsPerHour)
   {
      tell(1, "Info: Skipping fullupdate of episodes, last run less than 6 hours ago!");
      return done;
   }

   // open tcp connection

   if (cl.open() != 0)
   {
      tell(1, "Open connection to '%s' failed, aborting transfer!", EpgdConfig.seriesUrl);
      return fail;
   }

   // select characterset

   if (!cl.send(withutf8 ? "CHARSET utf-8": "CHARSET iso-8859-1"))
   {
      tell(0, "Error: Send '%s' failed, aborting transfer!", command);
      cl.close();

      return fail;
   }

   // check for characterset confirmation

   cList<cLine> csconf;

   if (cl.receive(&csconf) != 225)
   {
      tell(0, "Error: SVDRPCL: did not receive charset confirmation. Closing...");
      cl.abort();

      return fail;
   }

   if (csconf.First() && csconf.First()->Text())
      tell(1, "Got '%s'", csconf.First()->Text());

   // identify myself

   sprintf(command, "HELLO %s v%s (%s), ID=%s MAIL=%s", TARGET, VERSION, VERSION_DATE,
           EpgdConfig.uuid, notNull(EpgdConfig.seriesMail));
   cl.send(command);
   cl.receive();

   // build GET command for the files

   *command = 0;

   if (full)
   {
      tell(1, "Requesting all episodes due to '%s'", minutes != na ? "fullupdate" : "empty table");
      sprintf(command, "GET all");

      // truncate table!

      episodeDb->truncate();
   }

   else if (minutes > 0)
   {
      minutes += 5;      // request 5 minutes more to compensate time diffs to constabel.net
      minutes += 90;     // request 90 minutes more to compensate TZ etc. :o
      tell(1, "Requesting episode changes of last %d minutes", minutes);
      sprintf(command, "TGET newer than %d minutes", minutes);
   }

   if (!cl.send(command))
   {
      tell(0, "Error: Send '%s' failed, aborting transfer!", command);
      cl.close();

      return fail;
   }

   cList<cLine>* result = new cList<cLine>;

   while (!abort && (code = cl.receive(result)) != codeCommunicationEnd)
   {
      cSystemNotification::check();

      switch (code)
      {
         case codeFileInfo:
         {
            if (result->Count() < 2)
            {
               tell(1, "Protocol violation, aborting!");

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

                  tell(3, "Got line '%s'", l->Text());
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

   cl.close();

   setParameter("epgd", "lastEpisodeRun", time(0));

   if (full)
      setParameter("epgd", "lastEpisodeFullRun", time(0));

   tell(1, "Received %d episode files", files.Count());

   // insert / update series into database ...

   episodeDb->getConnection()->startTransaction();
   files.storeToTable(episodeDb);
   episodeDb->getConnection()->commit();

   // optional store to filesystem ...

   if (EpgdConfig.storeSeriesToFs)
   {
      char* path = 0;

      asprintf(&path, "%s/eplist", EpgdConfig.cachePath);

      chkDir(path);
      files.storeToFile(path);

      free(path);
   }

   delete result;

   return 0;
}
