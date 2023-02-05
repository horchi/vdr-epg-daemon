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
   int ec {}, pp {}, plv {};  // statistics
   int updated {0};
   long lStart = time(0);

   if (!EpgdConfig.seriesEnabled)
      return done;

   tell(1, "Starting episode lookup ...");

   // first read all events into list ..

   connection->startTransaction();

   // loop over all episodes ..

   for (int l = selectDistCompname->find(); l && !doShutDown(); l = selectDistCompname->fetch())
   {
      // const int maxTitleDist = (((double)strlen(episodeCompName)) / 100.0 * 20.0);
      char* episodeCompName = strdup(episodeDb->getStrValue("COMPNAME"));
      ec++;

      eventsDb->clear();
      eventsDb->setValue("COMPTITLE", episodeCompName);

      // loop over all events matching this episode by COMPTITLE

      for (int n = selectByCompTitle->find(); n; n = selectByCompTitle->fetch())
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

            // check if changed

            if (!eventsDb->hasValue("EPISODECOMPPARTNAME", evtCompShortText)
                || !eventsDb->hasValue("EPISODELANG", episodeDb->getStrValue("LANG"))
                || episodeDb->getCharValue("STATE") == cEpisodeFile::esChanged)
            {
               // changed -> store reference
               // updateEpisodeAtEvents resets also scrsp, scrseriesepisode and scrseriesid

               eventsDb->setValue("UPDSP", time(0));
               eventsDb->setValue("EPISODECOMPPARTNAME", evtCompShortText);
               eventsDb->setValue("EPISODELANG", episodeDb->getStrValue("LANG"));

               updateEpisodeAtEvents->execute();
               updated++;

               if (episodeDb->getCharValue("STATE") == cEpisodeFile::esChanged)
                  tell(2, "Series update detected, reset series reference for all event of to '%s/%s'",
                       episodeCompName, evtCompShortText);
            }
         }

         else  // if not found try match by LV
         {
            const int maxDist = (((double)strlen(evtCompShortText)) / 100.0 * 20.0);
            int d {0};
            int dMin {maxDist+1};
            int tmp {0};
            char* bestCompPart {};
            char* bestCompPartLang {};

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
                   || !eventsDb->hasValue("EPISODELANG", bestCompPartLang)
                   || episodeDb->getCharValue("STATE") == cEpisodeFile::esChanged)
               {
                  // store reference

                  eventsDb->setValue("UPDSP", time(0));
                  eventsDb->setValue("EPISODECOMPPARTNAME", bestCompPart);
                  eventsDb->setValue("EPISODELANG", bestCompPartLang);

                  updateEpisodeAtEvents->execute();
                  updated++;

                  if (episodeDb->getCharValue("STATE") == cEpisodeFile::esChanged)
                     tell(2, "Series update detected, reset series reference for all event of to '%s/%s'",
                          episodeCompName, bestCompPart);
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

   // episodeDb->getConnection()->query("update %s set %s = '%c'", episodeDb->TableName(),
   //                                   episodeDb->getField("STATE")->getDbName(), cEpisodeFile::esUnchanged);

   selectDistCompname->freeResult();
   connection->commit();

   tell(1, "Lookup done for %d series, matched %d parts by compare and %d parts by lv in %ld seconds; Updated %d",
        ec, pp, plv, time(0)-lStart, updated);

   return success;
}

//***************************************************************************
// Lookup Series Data
//***************************************************************************

int cEpgd::lookupSeriesDataForRecording(cDbRow* recording, cTVDBManager::SeriesLookupData& lookupData)
{
   lookupData.title = recordingListDb->getStrValue("TITLE");;
   lookupData.episodeName = recordingListDb->getStrValue("SHORTTEXT");

   tell(2, "CONSTABEL: Try lookup of '%s'/'%s' in database", lookupData.title.c_str(), lookupData.episodeName.c_str());

   if (!recordingListDb->getValue("EPISODECOMPNAME")->isEmpty() && !recordingListDb->getValue("EPISODECOMPPARTNAME")->isEmpty())
   {
      episodeDb->clear();
      episodeDb->setValue("COMPNAME", recordingListDb->getStrValue("EPISODECOMPNAME"));
      episodeDb->setValue("COMPPARTNAME", recordingListDb->getStrValue("EPISODECOMPPARTNAME"));

      // search episode part 1:1

      if (selectByCompNames->find())
      {
         lookupData.title = episodeDb->getStrValue("EPISODENAME");
         lookupData.episodeName = episodeDb->getStrValue("PARTNAME");

         tell(1, "Found referenced eplist data for '%s' / '%s'", lookupData.title.c_str(), lookupData.episodeName.c_str());
      }

      return done;
   }

   // no eplist information avalible try lookup ..

   std::string compTitle = lookupData.title;
   prepareCompressed(compTitle);
   std::string compPartName = lookupData.episodeName;
   prepareCompressed(compPartName);

   episodeDb->clear();
   episodeDb->setValue("COMPNAME", compTitle.c_str());
   episodeDb->setValue("COMPPARTNAME", compPartName.c_str());

   tell(3, "CONSTABEL: Try lookup by of '%s'/'%s' direct", compTitle.c_str(), compPartName.c_str());

   if (selectByCompNames->find())
   {
      lookupData.title = episodeDb->getStrValue("EPISODENAME");
      lookupData.episodeName = episodeDb->getStrValue("PARTNAME");

      tell(1, "Found eplist data for '%s' / '%s' by lookup", lookupData.title.c_str(), lookupData.episodeName.c_str());

      recording->setValue("EPISODECOMPNAME", episodeDb->getStrValue("COMPNAME"));
      recording->setValue("EPISODECOMPPARTNAME", episodeDb->getStrValue("COMPPARTNAME"));
      recording->setValue("EPISODELANG", episodeDb->getStrValue("LANG"));
      recording->setValue("EPISODECOMPSHORTNAME", episodeDb->getStrValue("COMPSHORTNAME"));
   }
   else
   {
      episodeDb->clear();
      episodeDb->setValue("COMPNAME", (compTitle + compPartName).c_str());

      int dist = (compTitle + compPartName).length() / 100.0 * 20.0;
      maxLvDistance.setValue(dist);

      tell(3, "CONSTABEL: Try lookup by combined name '%s' and a max LV distance of (%d)", episodeDb->getStrValue("COMPNAME"), dist);

      if (selectByCompNamesCombined->find())
      {
         lookupData.title = episodeDb->getStrValue("EPISODENAME");
         lookupData.episodeName = episodeDb->getStrValue("PARTNAME");

         tell(1, "Found eplist data for '%s' / '%s' by extended lookup", lookupData.title.c_str(), lookupData.episodeName.c_str());

         recording->setValue("EPISODECOMPNAME", episodeDb->getStrValue("COMPNAME"));
         recording->setValue("EPISODECOMPPARTNAME", episodeDb->getStrValue("COMPPARTNAME"));
         recording->setValue("EPISODELANG", episodeDb->getStrValue("LANG"));
         recording->setValue("EPISODECOMPSHORTNAME", episodeDb->getStrValue("COMPSHORTNAME"));
      }
   }

   return done;
}

//***************************************************************************
// Download Episodes and store to table (and filesystem if configured)
//***************************************************************************

int cEpgd::updateEpisodes()
{
   if (!EpgdConfig.seriesEnabled)
      return done;

   cSvdrpClient cl(EpgdConfig.seriesUrl, EpgdConfig.seriesPort);
   std::string fileName;
   std::string linkName;
   int minutes {na};

   if (selectMaxUpdSp->find() && episodeDb->getIntValue("UpdSp") > 0)
      minutes = (time(0) - episodeDb->getIntValue("UpdSp")) / 60;

   selectMaxUpdSp->freeResult();

   int full = fullupdate || minutes == na;

   tell(1, "Starting '%s' episode download ...", full ? "fullupdate" : "update");

   if (!minutes && !full)
   {
      tell(1, "Nothing to be done, all episodes are up-to-date");
      return done;
   }

   long int lastFullRun {0};
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

   if (!cl.send(withutf8 ? "CHARSET utf-8" : "CHARSET iso-8859-1"))
   {
      tell(0, "Error: Send 'CHARSET ...' failed, aborting transfer!");
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

   char command[200] {};

   sprintf(command, "HELLO %s v%s (%s), ID=%s MAIL=%s", TARGET, VERSION, VERSION_DATE,
           EpgdConfig.uuid, notNull(EpgdConfig.seriesMail));
   cl.send(command);
   cl.receive();

   // build GET command

   if (full)
   {
      tell(1, "Requesting all episodes due to '%s'", minutes != na ? "fullupdate" : "empty table");
      sprintf(command, "GET all");
      episodeDb->truncate();        // truncate table!
   }

   else // if (minutes > 0)
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

   cEpisodeFiles files;
   cList<cLine>* result = new cList<cLine>;
   int code {0};
   bool abort {false};
   bool _isLink {false};

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
               abort = true;
            }
            else
            {
               linkName = "";
               fileName = result->Next(result->First())->Text();

               // for files (not links) constable send the additional header line:
               // "not a link"

               _isLink = fileName != "not a link";

               if (!_isLink)
                  fileName = result->First()->Text();
               else
                  linkName = result->First()->Text();
            }

            break;
         }
         case codeFileContent:
         {
            if (_isLink)
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
            abort = true;
            break;
         }
      }

      result->Clear();
   }

   delete result;
   cl.close();

   setParameter("epgd", "lastEpisodeRun", time(0));   // unused !

   if (full)
      setParameter("epgd", "lastEpisodeFullRun", time(0));

   tell(1, "Received %d episode files", files.Count());

   if (files.Count() > 0)
   {
      tell(1, "Storing episode data");

      // insert / update series into database ...

      episodeDb->getConnection()->startTransaction();

      episodeDb->getConnection()->query("update %s set %s = '%c'",
                                        episodeDb->TableName(),
                                        episodeDb->getField("STATE")->getDbName(), cEpisodeFile::esUnchanged);
      episodeDb->getConnection()->queryReset();

      files.storeToTable(episodeDb, eventsDb);

      episodeDb->getConnection()->commit();

      // optional store to filesystem ...

      if (EpgdConfig.storeSeriesToFs)
      {
         char* path {};

         asprintf(&path, "%s/eplist", EpgdConfig.cachePath);
         chkDir(path);
         files.storeToFile(path);
         free(path);
      }

      // start series match

      if (!doShutDown())
         evaluateEpisodes();
   }

   return 0;
}
