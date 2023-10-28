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

   connection->startTransaction();
   tell(eloInfo, "Update episodes.combinedcomp");
   connection->query("update episodes set combinedcomp = concat(compname,comppartname) where combinedcomp is null");
   connection->commit();

   tell(eloInfo, "Starting episode lookup ...");

   // first read all events into list ..

   connection->startTransaction();

   // loop over all episodes ..

   for (int l = selectDistCompname->find(); l && !doShutDown(); l = selectDistCompname->fetch())
   {
      std::string episodeCompName = episodeDb->getStrValue("COMPNAME");
      ec++;

      eventsDb->clear();
      eventsDb->setValue("COMPTITLE", (episodeCompName + "%").c_str());

      // loop over all events matching this episode by COMPTITLE

      // tell(eloInfo, "Searching events for eplist '%s'", (episodeCompName + "%").c_str());

      for (int n = selectByCompTitle->find(); n; n = selectByCompTitle->fetch())
      {
         cSystemNotification::check();

         eventsDb->setValue("EPISODECOMPNAME", episodeCompName.c_str());

         if (!episodeDb->getValue("COMPSHORTNAME")->isNull())
            eventsDb->setValue("EPISODECOMPSHORTNAME", episodeDb->getStrValue("COMPSHORTNAME"));

         episodeDb->clear();
         episodeDb->setValue("COMPNAME", episodeCompName.c_str());
         episodeDb->setValue("COMPPARTNAME", eventsDb->getStrValue("COMPSHORTTEXT"));

         // search episode part 1:1

         bool found = selectByCompNames->find();

         if (!found && eventsDb->getValue("COMPSHORTTEXT")->isEmpty())
         {
            // COMPTITLE seems to be combined

            episodeDb->clear();
            episodeDb->setValue("COMBINEDCOMP", eventsDb->getStrValue("COMPTITLE"));
            int dist = strlen(episodeDb->getStrValue("COMBINEDCOMP")) / 100.0 * 20.0;
            maxLvDistance.setValue(dist);
            tell(eloDetail, "CONSTABEL: Try event lookup by combined name '%s'", episodeDb->getStrValue("COMBINEDCOMP"));

            found = selectByCompNamesCombined->find();

            if (found)
               tell(eloDetail, "Found eplist match for '%s'/'%s' by combined name", episodeDb->getStrValue("COMPNAME"), episodeDb->getStrValue("COMPPARTNAME"));
         }

         if (found)
         {
            pp++;

            // check if changed

            if (!eventsDb->hasValue("EPISODECOMPPARTNAME", episodeDb->getStrValue("COMPPARTNAME"))
                || !eventsDb->hasValue("EPISODELANG", episodeDb->getStrValue("LANG"))
                || episodeDb->getCharValue("STATE") == cEpisodeFile::esChanged)
            {
               // changed -> store reference
               // updateEpisodeAtEvents resets also scrsp, scrseriesepisode and scrseriesid

               eventsDb->setValue("UPDSP", time(0));
               eventsDb->setValue("EPISODECOMPPARTNAME", episodeDb->getStrValue("COMPPARTNAME"));
               eventsDb->setValue("EPISODELANG", episodeDb->getStrValue("LANG"));

               updateEpisodeAtEvents->execute();
               updated++;

               if (episodeDb->getCharValue("STATE") == cEpisodeFile::esChanged)
                  tell(eloDetail, "Series update detected, reset series reference for all event of to '%s/%s'",
                       episodeCompName.c_str(), episodeDb->getStrValue("COMPPARTNAME"));
            }
         }
         else  // if not found try match by LV
         {
            const char* evtCompShortText = eventsDb->getStrValue("COMPSHORTTEXT");
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
                     tell(eloDetail, "Series update detected, reset series reference for all event of to '%s/%s'", episodeCompName.c_str(), bestCompPart);
               }
            }

            free(bestCompPart);     bestCompPart = 0;
            free(bestCompPartLang); bestCompPartLang = 0;

            selectByCompName->freeResult();
         }

         selectByCompNames->freeResult();
      }

      selectByCompTitle->freeResult();
   }

   // episodeDb->getConnection()->query("update %s set %s = '%c'", episodeDb->TableName(),
   //                                   episodeDb->getField("STATE")->getDbName(), cEpisodeFile::esUnchanged);

   selectDistCompname->freeResult();
   connection->commit();

   tell(eloInfo, "Lookup done for %d series, matched %d parts by compare and %d parts by lv in %ld seconds; Updated %d",
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

   tell(eloDetail, "CONSTABEL: Try lookup of '%s'/'%s' in database", lookupData.title.c_str(), lookupData.episodeName.c_str());

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

         tell(eloInfo, "Found referenced eplist data for '%s' / '%s'", lookupData.title.c_str(), lookupData.episodeName.c_str());
         return success;
      }
   }

   // no eplist information avalible try lookup ..

   std::string compTitle = lookupData.title;
   prepareCompressed(compTitle);
   std::string compPartName = lookupData.episodeName;
   prepareCompressed(compPartName);

   episodeDb->clear();
   episodeDb->setValue("COMPNAME", compTitle.c_str());
   episodeDb->setValue("COMPPARTNAME", compPartName.c_str());

   tell(eloDetail, "CONSTABEL: Try lookup by of '%s'/'%s' direct", compTitle.c_str(), compPartName.c_str());

   bool found = selectByCompNames->find();

   if (found)
   {
      tell(eloInfo, "Found eplist data for '%s' / '%s' by lookup", lookupData.title.c_str(), lookupData.episodeName.c_str());
   }
   else
   {
      episodeDb->clear();
      episodeDb->setValue("COMBINEDCOMP", (compTitle + compPartName).c_str());

      int dist = (compTitle + compPartName).length() / 100.0 * 20.0;
      maxLvDistance.setValue(dist);
      tell(eloDetail, "CONSTABEL: Try lookup by combined name '%s' and a max LV distance of (%d)", episodeDb->getStrValue("COMBINEDCOMP"), dist);
      found = selectByCompNamesCombinedLv->find();

      if (found)
         tell(eloInfo, "Found eplist data for '%s' / '%s' by extended lookup", lookupData.title.c_str(), lookupData.episodeName.c_str());
   }

   if (found)
   {
      lookupData.title = episodeDb->getStrValue("EPISODENAME");
      lookupData.episodeName = episodeDb->getStrValue("PARTNAME");
      recording->setValue("EPISODECOMPNAME", episodeDb->getStrValue("COMPNAME"));
      recording->setValue("EPISODECOMPPARTNAME", episodeDb->getStrValue("COMPPARTNAME"));
      recording->setValue("EPISODELANG", episodeDb->getStrValue("LANG"));
      recording->setValue("EPISODECOMPSHORTNAME", episodeDb->getStrValue("COMPSHORTNAME"));
      recording->setValue("CATEGORY", "Serie");
      recordingListDb->update();

      return success;
   }

   return fail;
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

   tell(eloInfo, "Starting '%s' episode download ...", full ? "fullupdate" : "update");

   if (!minutes && !full)
   {
      tell(eloInfo, "Nothing to be done, all episodes are up-to-date");
      return done;
   }

   long int lastFullRun {0};
   getParameter("epgd", "lastEpisodeFullRun", lastFullRun);

   if (full && lastFullRun > time(0) - 6 * tmeSecondsPerHour)
   {
      tell(eloInfo, "Info: Skipping fullupdate of episodes, last run less than 6 hours ago!");
      return done;
   }

   // open tcp connection

   if (cl.open() != 0)
   {
      tell(eloInfo, "Open connection to '%s' failed, aborting transfer!", EpgdConfig.seriesUrl);
      return fail;
   }

   tell(eloInfo, "Connected to eplist server at '%s'", EpgdConfig.seriesUrl);

   // select characterset

   if (!cl.send(withutf8 ? "CHARSET utf-8" : "CHARSET iso-8859-1"))
   {
      tell("Error: Send 'CHARSET ...' failed, aborting transfer!");
      cl.close();
      return fail;
   }

   // check for characterset confirmation

   cList<cLine> csconf;

   if (cl.receive(&csconf) != 225)
   {
      tell("Error: SVDRPCL: did not receive charset confirmation. Closing...");
      cl.abort();
      return fail;
   }

   if (csconf.First() && csconf.First()->Text())
      tell(eloDetail, "Got '%s'", csconf.First()->Text());

   // identify myself

   char command[200] {};

   sprintf(command, "HELLO %s v%s (%s), ID=%s MAIL=%s", TARGET, VERSION, VERSION_DATE,
           EpgdConfig.uuid, notNull(EpgdConfig.seriesMail));
   cl.send(command);
   cl.receive();

   // build GET command

   if (full)
   {
      tell(eloInfo, "Requesting all episodes due to '%s'", minutes != na ? "fullupdate" : "empty table");
      sprintf(command, "GET all");
      episodeDb->truncate();        // truncate table!
   }

   else // if (minutes > 0)
   {
      minutes += 5;      // request 5 minutes more to compensate time diffs to constabel.net
      minutes += 90;     // request 90 minutes more to compensate TZ etc. :o
      tell(eloInfo, "Requesting episode changes of last %d minutes", minutes);
      sprintf(command, "TGET newer than %d minutes", minutes);
   }

   if (!cl.send(command))
   {
      tell("Error: Send '%s' failed, aborting transfer!", command);
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
               tell(eloInfo, "Protocol violation, aborting!");
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

                  tell(eloDetail, "Got line '%s'", l->Text());
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

   tell(eloInfo, "Received %d episode files", files.Count());

   if (files.Count() > 0)
   {
      tell(eloInfo, "Storing episode data");

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

      // if (!doShutDown())
      //    evaluateEpisodes();
   }

   return 0;
}
