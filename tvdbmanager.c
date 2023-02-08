/*
 * tvdbmanager.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "lib/curl.h"

#include "tvdbmanager.h"
#include "epgd.h"

extern const char* confDir;

cTVDBManager::cTVDBManager(bool aWithutf8)
{
   withutf8 = aWithutf8;

   exsltRegisterAll();
   setlocale(LC_CTYPE, "");

   std::string loc = setlocale(LC_CTYPE, 0);
   size_t index = loc.find_first_of("_");
   std::string langISO {""};

   if (index > 0)
      langISO = loc.substr(0, index);

   if (langISO.size() == 2)
      language = langISO.c_str();

   tell(1, "Set scraping language to '%s'", language.c_str());
}

cTVDBManager::~cTVDBManager()
{
}

int cTVDBManager::initDb(cDbConnection* c)
{
   if (!c)
      return fail;

   int status {success};
   connection = c;

   tSeries = new cDbTable(connection, "series");
   if ((status = tSeries->open()) != success) return status;

   tSeriesEpsiode = new cDbTable(connection, "series_episode");
   if ((status = tSeriesEpsiode->open()) != success) return status;

   tSeriesMedia = new cDbTable(connection, "series_media");
   if ((status = tSeriesMedia->open()) != success) return status;

   tSeriesActor = new cDbTable(connection, "series_actor");
   if ((status = tSeriesActor->open()) != success) return status;

   tEvents = new cDbTable(connection, "events");
   if ((status = tEvents->open()) != success) return status;

   tEpisodes = new cDbTable(connection, "episodes");
   if ((status = tEpisodes->open()) != success) return status;

   tRecordingList = new cDbTable(connection, "recordinglist");
   if ((status = tRecordingList->open()) != success) return status;

   // prepare statements

   // ------------------------
   //

   selectSeriesByName = new cDbStatement(tSeries);
   statements.push_back(selectSeriesByName);

   selectSeriesByName->build("select ");
   selectSeriesByName->bind("SERIESID", cDBS::bndOut);
   selectSeriesByName->build(" from %s where ", tSeries->TableName());
   selectSeriesByName->bind("SERIESNAME", cDBS::bndIn | cDBS::bndSet);

   status += selectSeriesByName->prepare();

   // ------------------------
   //

   selectEpisodeByName = new cDbStatement(tSeriesEpsiode);
   statements.push_back(selectEpisodeByName);

   selectEpisodeByName->build("select ");
   selectEpisodeByName->bind("EPISODENUMBER", cDBS::bndOut);
   selectEpisodeByName->bind("SEASONNUMBER", cDBS::bndOut, ", ");
   selectEpisodeByName->bind("EPISODEID", cDBS::bndOut, ", ");
   selectEpisodeByName->build(" from %s where ", tSeriesEpsiode->TableName());
   selectEpisodeByName->bind("SERIESID", cDBS::bndIn | cDBS::bndSet);
   selectEpisodeByName->bind("EPISODENAME", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectEpisodeByName->prepare();

   // ------------------------

   selectEpisodeByNumbers = new cDbStatement(tSeriesEpsiode);
   statements.push_back(selectEpisodeByNumbers);

   selectEpisodeByNumbers->build("select ");
   selectEpisodeByNumbers->bind("EPISODEID", cDBS::bndOut);
   selectEpisodeByNumbers->build(" from %s where ", tSeriesEpsiode->TableName());
   selectEpisodeByNumbers->bind("EPISODENUMBER", cDBS::bndIn | cDBS::bndSet);
   selectEpisodeByNumbers->bind("SEASONNUMBER", cDBS::bndIn | cDBS::bndSet, " and ");
   selectEpisodeByNumbers->bind("SERIESID", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectEpisodeByNumbers->prepare();

   // ------------------------

   updateEvent = new cDbStatement(tEvents);
   statements.push_back(updateEvent);

   updateEvent->build("update %s set ", tEvents->TableName());
   updateEvent->bind("SCRSP", cDBS::bndIn | cDBS::bndSet);
   updateEvent->bind("SCRSERIESID", cDBS::bndIn | cDBS::bndSet, ", ");
   updateEvent->bind("SCRSERIESEPISODE", cDBS::bndIn | cDBS::bndSet, ", ");
   updateEvent->build(" where ");
   updateEvent->bind("EVENTID", cDBS::bndIn | cDBS::bndSet);

   status += updateEvent->prepare();

   // ------------------------

   if (status != success)
   {
      tell(0, "Error: At least %d statements of cTVDBManager not prepared successfully", status*-1);
      return status;
   }

   return success;
}

int cTVDBManager::exitDb()
{
   for (auto stmt : statements)
      delete stmt;

   statements.clear();

   delete tvdbScraper;    tvdbScraper = nullptr;
   delete tSeries;        tSeries = nullptr;
   delete tSeriesEpsiode; tSeriesEpsiode = nullptr;
   delete tSeriesMedia;   tSeriesMedia = nullptr;
   delete tSeriesActor;   tSeriesActor = nullptr;
   delete tEvents;        tEvents = nullptr;
   delete tEpisodes;      tEpisodes = nullptr;
   delete tRecordingList; tRecordingList = nullptr;

   return done;
}

int cTVDBManager::connectScraper()
{
   tvdbScraper = new cTVDBScraper(language);

   return tvdbScraper->connect();
}

int cTVDBManager::updateSeries(time_t since)
{
   std::set<int> updatedSeriesIds;
   std::set<int> storedSeriesIds;
   std::set<int> scrapSeriesIds;

   if (since < time(0) - 10 * tmeSecondsPerDay)
      since = time(0) - 10 * tmeSecondsPerDay;

   // scrap updates

   tell(1, "Scraping series and episodes updates since '%s'", l2pTime(since).c_str());
   tvdbScraper->getUpdates(since, updatedSeriesIds);

   // query all used series ids from database

   if (getAllIDs(storedSeriesIds, tSeries, "SeriesId") != success)
      return fail;

   // alignment of the series with update and the applied

   std::set_intersection(updatedSeriesIds.begin(), updatedSeriesIds.end(),
                         storedSeriesIds.begin(), storedSeriesIds.end(),
                         std::inserter(scrapSeriesIds, scrapSeriesIds.begin()));

   tell(1, "Found (%zu) updated series by tvdb, %zu series has to updated in database",
        updatedSeriesIds.size(), scrapSeriesIds.size());

   int count {0};

   for (const auto& scrapSeriesId : scrapSeriesIds)
   {
      if (count++ % 10 == 0)
         tell(1, "TvDb: Scraped %d series, continuing rescraping", count);

      cTVDBSeries* series = scrapSeries(scrapSeriesId);

      if (series)
         saveSeries(series);

      delete series;
   }

   return success;
}

int cTVDBManager::getAllIDs(std::set<int>& IDs, cDbTable* table, const char* field)
{
   cDbStatement* selectIDs = new cDbStatement(table);

   selectIDs->build("select ");
   selectIDs->bind(field, cDBS::bndOut);
   selectIDs->build(" from %s", table->TableName());

   if (selectIDs->prepare() != success)
   {
      delete selectIDs;
      return fail;
   }

   for (int res = selectIDs->find(); res; res = selectIDs->fetch())
      IDs.insert(table->getIntValue(field));

   selectIDs->freeResult();

   delete selectIDs;
   return success;
}

cTVDBSeries* cTVDBManager::scrapSeries(const char* search)
{
   cTVDBSeries* series = tvdbScraper->scrapByName(search);

   if (!series)
      return nullptr;

   series->readSeries();

   return series;
}

cTVDBSeries* cTVDBManager::scrapSeries(int seriesID)
{
   cTVDBSeries* series = tvdbScraper->getSeries(seriesID);

   if (!series->readSeries())
   {
      delete series;
      return nullptr;
   }

   return series;
}

void cTVDBManager::saveSeries(cTVDBSeries* series)
{
   if (!series)
      return;

   saveSeriesBasics(series);
   saveSeriesMedia(series);
   saveSeriesEpisodes(series);
   saveSeriesActors(series);
}

void cTVDBManager::saveSeriesBasics(cTVDBSeries* series)
{
   tSeries->clear();
   tSeries->setValue("SeriesId", series->seriesID);
   tSeries->setValue("SeriesName", series->name.c_str());
   tSeries->setValue("SeriesLastScraped", time(0));
   tSeries->setValue("SeriesLastUpdated", series->lastUpdated);
   tSeries->setValue("SeriesOverview", series->overview.c_str());
   tSeries->setValue("SeriesFirstAired", series->firstAired.c_str());
   tSeries->setValue("SeriesGenre", series->genre.c_str());
   tSeries->setValue("SeriesRating", series->rating);
   tSeries->setValue("SeriesStatus", series->status.c_str());
   tSeries->setValue("SeriesNetwork", series->network.c_str());
   tSeries->store();
}

void cTVDBManager::saveSeriesMedia(cTVDBSeries* series)
{
   uint count {0};
   uint total {0};
   std::map<uint,uint> lfns;

   tell(eloDetail, "Scraping new and changed artwork for series '%d' ..", series->seriesID);

   for (const auto& artwork : *series->getArtwork())
   {
      int lfn = lfns[artwork.type];

      if (lfn > 3)    // max 4 images for each media-type
         continue;

      bool exists = loadMedia(series->seriesID, artwork.seasonId, 0, 0, artwork.type, lfn);

      if (!exists || imageUrlChanged(artwork.url))
      {
         if (updateStoreArtwork(artwork, lfn, series->seriesID) == success)
            count++;
      }

      total++;

      if (artwork.type != cTVDBSeries::atSeasonPoster)  // we have one per season
         lfns[artwork.type]++;
   }

   tell(eloDetail, "Updated %d of %d artwork objects for series '%d'", count, total, series->seriesID);
}

int cTVDBManager::updateStoreArtwork(const cTVDBSeries::Artwork& artwork, uint lfn, int seriesID)
{
   if (artwork.url.empty())
      return done;

   tSeriesMedia->clear();
   tSeriesMedia->setValue("SeriesId", seriesID);
   tSeriesMedia->setValue("SeasonNumber", artwork.seasonId);
   tSeriesMedia->setValue("EpisodeId", 0);
   tSeriesMedia->setValue("ActorId", 0);
   tSeriesMedia->setValue("MediaType", artwork.type);
   tSeriesMedia->setValue("LFN", lfn);
   tSeriesMedia->setValue("MediaUrl", artwork.url.c_str());
   tSeriesMedia->setValue("MediaWidth", artwork.width);
   tSeriesMedia->setValue("MediaHeight", artwork.height);
   tSeriesMedia->setValue("MediaRating", artwork.rating);

   MemoryStruct data;
   int status = GetPicture(artwork.url.c_str(), &data);

   if (status == success)
   {
      tSeriesMedia->setValue("MediaContent", data.memory, data.size);
      tSeriesMedia->store();
      return success;
   }

   if (status == -2)   // image to big for table!
   {
      tSeriesMedia->store();
      return success;
   }

   return fail;
}

void cTVDBManager::saveSeriesEpisodes(cTVDBSeries* series)
{
   tell(2, "Storing %zu episodes of series '%d' to database and loading their artwork ..",
        series->getEpisodes()->size(), series->seriesID);

   for (const auto& episode : *series->getEpisodes())
   {
      saveSeriesEpisode(&episode, series->seriesID);

      bool exists = loadMedia(series->seriesID, episode.seasonNumber, episode.id, 0, cTVDBSeries::atEpisode, 0);
      bool reloadImage = exists ? imageUrlChanged(episode.imageUrl) : true;

      if (reloadImage)
      {
         tSeriesMedia->clear();
         tSeriesMedia->setValue("SeriesId", series->seriesID);
         tSeriesMedia->setValue("SeasonNumber", episode.seasonNumber);
         tSeriesMedia->setValue("EpisodeId", episode.id);
         tSeriesMedia->setValue("ActorId", 0);
         tSeriesMedia->setValue("MediaType", cTVDBSeries::atEpisode);
         tSeriesMedia->setValue("LFN", 0);  // #TODO ??
         tSeriesMedia->setValue("MediaUrl", episode.imageUrl.c_str());
         tSeriesMedia->setValue("MediaWidth", episode.width);
         tSeriesMedia->setValue("MediaHeight", episode.height);
         tSeriesMedia->setValue("MediaRating", 0.0);

         MemoryStruct data;
         int status {success};

         if (episode.imageUrl.empty())
            tSeriesMedia->store();
         else if ((status = GetPicture(episode.imageUrl.c_str(), &data)) == success)
         {
            tSeriesMedia->setValue("MediaContent", data.memory, data.size);
            tSeriesMedia->store();
         }
         else
            tell(3, "Downloading image '%s' failed with %d", episode.imageUrl.c_str(), status);
      }
   }
}

void cTVDBManager::saveSeriesEpisode(const cTVDBSeries::Episode* episode, int seriesID)
{
   if (!episode)
      return;

   tSeriesEpsiode->clear();
   tSeriesEpsiode->setValue("EpisodeId", episode->id);
   tSeriesEpsiode->setValue("EpisodeNumber", episode->number);
   tSeriesEpsiode->setValue("EpisodeName", episode->name.c_str());
   tSeriesEpsiode->setValue("EpisodeOverview", episode->overview.c_str());
   tSeriesEpsiode->setValue("EpisodeFirstAired", episode->firstAired.c_str());
   tSeriesEpsiode->setValue("EpisodeGuestStars", episode->guestStars.c_str());
   tSeriesEpsiode->setValue("EpisodeRating", episode->rating);
   tSeriesEpsiode->setValue("EpisodeLastUpdated", episode->lastUpdated);
   tSeriesEpsiode->setValue("SeasonNumber", episode->seasonNumber);
   tSeriesEpsiode->setValue("SeriesId", seriesID ? seriesID : episode->seriesID);
   tSeriesEpsiode->store();
}

void cTVDBManager::saveSeriesActors(cTVDBSeries* series)
{
   for (const auto& actor : *series->getActors())
   {
      tSeriesActor->clear();
      tSeriesActor->setValue("ActorId", actor.id);
      tSeriesActor->setValue("ActorName", actor.name.c_str());
      tSeriesActor->setValue("ActorRole", actor.role.c_str());
      tSeriesActor->setValue("SortOrder", actor.sortOrder);
      tSeriesActor->store();

      bool exists = loadMedia(series->seriesID, 0, 0, actor.id, cTVDBSeries::atActor, 0);
      bool reloadImage = exists ? imageUrlChanged(actor.thumbUrl) : true;

      if (reloadImage)
      {
         tSeriesMedia->clear();
         tSeriesMedia->setValue("SeriesId", series->seriesID);
         tSeriesMedia->setValue("SeasonNumber", 0);
         tSeriesMedia->setValue("EpisodeId", 0);
         tSeriesMedia->setValue("ActorId", actor.id);
         tSeriesMedia->setValue("MediaType", cTVDBSeries::atActor);
         tSeriesMedia->setValue("LFN", 0);
         tSeriesMedia->setValue("MediaUrl", actor.thumbUrl.c_str());
         tSeriesMedia->setValue("MediaWidth", actor.thumbUrlWidth);
         tSeriesMedia->setValue("MediaHeight", actor.thumbUrlHeight);
         tSeriesMedia->setValue("MediaRating", 0.0);

         MemoryStruct data;

         if (GetPicture(actor.thumbUrl.c_str(), &data) == success)
         {
            tSeriesMedia->setValue("MediaContent", data.memory, data.size);
            tSeriesMedia->store();
         }
      }
   }
}

bool cTVDBManager::loadMedia(int seriesId, int seasonNumber, int episodeId, int actorId, int mediaType, uint lfn)
{
   tSeriesMedia->clear();
   tSeriesMedia->setValue("SeriesId", seriesId);
   tSeriesMedia->setValue("SeasonNumber", seasonNumber);
   tSeriesMedia->setValue("EpisodeId", episodeId);
   tSeriesMedia->setValue("ActorId", actorId);
   tSeriesMedia->setValue("MediaType", mediaType);
   tSeriesMedia->setValue("LFN", lfn);

   return tSeriesMedia->find();
}

bool cTVDBManager::getSeriesWithEpisodesFromEPG(std::vector<SeriesLookupData>& result)
{
   cDbValue season;
   cDbValue part;
   cDbValue number;

   season.setField(tEpisodes->getField("Season"));
   part.setField(tEpisodes->getField("Part"));
   number.setField(tEpisodes->getField("Number"));

   cDbStatement* selectSeries = new cDbStatement(tEvents);

   selectSeries->build("select ");
   selectSeries->bind("EVENTID", cDBS::bndOut);
   selectSeries->bind("TITLE", cDBS::bndOut, ", ");
   selectSeries->bind("SCRSP", cDBS::bndOut, ", ");
   selectSeries->bind(&season, cDBS::bndOut, ", ");
   selectSeries->bind(&part, cDBS::bndOut, ", ");
   selectSeries->bind(&number, cDBS::bndOut, ", ");
   selectSeries->bind("SHORTTEXT", cDBS::bndOut, ", ");
   selectSeries->build(" from thetvdbview");

   if (selectSeries->prepare() != success)
   {
      delete selectSeries;
      return false;
   }

   for (int found = selectSeries->find(); found; found = selectSeries->fetch())
   {
      SeriesLookupData lookupData;
      lookupData.eventId = tEvents->getBigintValue("EVENTID");
      lookupData.title = tEvents->getStrValue("TITLE");
      lookupData.lastScraped = tEvents->getIntValue("SCRSP");
      lookupData.season = season.getIntValue();
      lookupData.part = part.getIntValue();
      lookupData.number = number.getIntValue();
      lookupData.episodeName = tEvents->getStrValue("SHORTTEXT");
      result.push_back(lookupData);
   }

   selectSeries->freeResult();
   delete selectSeries;

   return true;
}

int cTVDBManager::GetPicture(const char* url, MemoryStruct* data)
{
   // tell(0, "Debug: Download image '%s'", url);

   int maxSize = tSeriesMedia->getField("MEDIACONTENT")->getSize();
   int imgFileSize {0};
   data->clear();

   if (isEmpty(url))
      return fail;

   if (curl.downloadFile(url, imgFileSize, data) != success)
      return fail;

   bytesDownloaded += imgFileSize;

   if (imgFileSize >= maxSize)
   {
      tell(eloDetail, "Debug: Skipping download of '%s' due to size > (%d)", url, maxSize);
      return -2;
   }

   return success;
}

bool cTVDBManager::imageUrlChanged(const std::string& url)
{
   if (url.compare(tSeriesMedia->getStrValue("MediaUrl")) != 0)
      return true;

   return false;
}

//***************************************************************************
// Process Series by name (one series per call)
//***************************************************************************

void cTVDBManager::processSeries(SeriesLookupData lookupData)
{
   tell(2, "Checking eventID: %lld, Title: %s, season:%d part:%d number:%d",
        lookupData.eventId, lookupData.title.c_str(), lookupData.season, lookupData.part, lookupData.number);

   int seriesID {0};

   const auto hit = alreadyScraped.find(lookupData.title);

   if (hit != alreadyScraped.end())
   {
      seriesID = (int)hit->second;

      if (!seriesID)
      {
         // tell(0, "series %s already scraped and nothing found in tvdb", lookupData.title.c_str());
         UpdateEvent(lookupData.eventId, 0, 0);
         return;
      }
      else
      {
         // tell(0, "found series %s in cache, id %d", lookupData.title.c_str(), seriesID);
      }
   }

   if (!seriesID)
   {
      // check if series in database

      tSeries->clear();
      tSeries->setValue("SeriesName", lookupData.title.c_str());

      if (selectSeriesByName->find())
         seriesID = tSeries->getIntValue("SERIESID");

      selectSeriesByName->freeResult();

      if (seriesID)
      {
         tell(5, "TvDb: Series '%s' already in db, id (%d)", lookupData.title.c_str(), seriesID);
      }
      else
      {
         // scrap series

         cTVDBSeries* series = scrapSeries(lookupData.title.c_str());

         if (series)
         {
            saveSeries(series);
            seriesID = series->seriesID;
            tell(4, "TvDb: Series '%s' successfully scraped with id (%d)", lookupData.title.c_str(), seriesID);
            delete series;
            series = nullptr;
         }
         else
         {
            tell(eloDetail, "TvDb: Series '%s' not found at tvdb.com", lookupData.title.c_str());
         }
      }
   }

   alreadyScraped.insert(pair<std::string,int>(lookupData.title, seriesID));

   int episodeID {0};

   if (seriesID)
   {
      tell(0, "lookup %d/%d/%d '%s'", seriesID, lookupData.season, lookupData.part, lookupData.episodeName.c_str());

      if (!lookupData.season && !lookupData.part && lookupData.episodeName.size())
      {
         // try to get part and season by episode name

         tSeriesEpsiode->clear();
         tSeriesEpsiode->setValue("SERIESID", seriesID);
         tSeriesEpsiode->setValue("EPISODENAME", lookupData.episodeName.c_str());

         if (selectEpisodeByName->find())
         {
            lookupData.season = tSeriesEpsiode->getIntValue("SEASONNUMBER");
            lookupData.part = tSeriesEpsiode->getIntValue("EPISODENUMBER");
         }

         selectEpisodeByName->freeResult();

         // tell(0, "Got %d/%d ", lookupData.season, lookupData.part);
      }

      // loading season poster and episode picture

      if (lookupData.season)
         checkLoadSeasonPoster(seriesID, lookupData.season);

      if (lookupData.season && lookupData.part)
         episodeID = lookupEpisodeId(seriesID, lookupData);

      // tell(0, "episodeID %d ", episodeID);
   }

   // updating event with series data

   UpdateEvent(lookupData.eventId, seriesID, episodeID);
}

void cTVDBManager::checkLoadSeasonPoster(int seriesID, int season)
{
   tSeriesMedia->clear();
   tSeriesMedia->setValue("SeriesId", seriesID);
   tSeriesMedia->setValue("SeasonNumber", season);
   tSeriesMedia->setValue("EpisodeId", 0);
   tSeriesMedia->setValue("ActorId", 0);
   tSeriesMedia->setValue("MediaType", cTVDBSeries::atSeasonPoster);
   tSeriesMedia->setValue("LFN", 0);

   if (!tSeriesMedia->find())
      return;

   std::string url = tSeriesMedia->getStrValue("MediaUrl");

   if (tSeriesMedia->isNull("MediaContent"))
   {
      MemoryStruct data;

      if (GetPicture(url.c_str(), &data) == success)
      {
         tSeriesMedia->setValue("MediaContent", data.memory, data.size);
         tSeriesMedia->store();
      }
   }
}

int cTVDBManager::lookupEpisodeId(int seriesID, const SeriesLookupData& lookupData)
{
   int episodeID {0};

   tSeriesEpsiode->clear();
   tSeriesEpsiode->setValue("EPISODENAME", lookupData.episodeName.c_str());
   tSeriesEpsiode->setValue("SERIESID", seriesID);

   if (selectEpisodeByName->find())
      episodeID = tSeriesEpsiode->getIntValue("EPISODEID");

   selectEpisodeByName->freeResult();

   if (!episodeID)
   {
      tSeriesEpsiode->clear();
      tSeriesEpsiode->setValue("EPISODENUMBER", lookupData.part);
      tSeriesEpsiode->setValue("SEASONNUMBER", lookupData.season);
      tSeriesEpsiode->setValue("SERIESID", seriesID);

      if (selectEpisodeByNumbers->find())
         episodeID = tSeriesEpsiode->getIntValue("EpisodeId");

      selectEpisodeByNumbers->freeResult();
   }

   return episodeID;
}

void cTVDBManager::UpdateEvent(tEventId eventID, int seriesID, int episodeID)
{
   tEvents->clear();
   tEvents->setBigintValue("EVENTID", eventID);
   tEvents->setValue("SCRSP", time(0));
   tEvents->setValue("SCRSERIESID", seriesID);
   tEvents->setValue("SCRSERIESEPISODE", episodeID);

   updateEvent->execute();
}

int cTVDBManager::CleanupSeries()
{
   int numDelete {0};
   std::set<int> activeSeriesIds;

   // fetching seriesIds from current events

   cDbStatement* selectSeriesIds = new cDbStatement(tEvents);
   selectSeriesIds->build("select distinct ");
   selectSeriesIds->bind("SCRSERIESID", cDBS::bndOut);
   selectSeriesIds->build(" from %s where ", tEvents->TableName());
   selectSeriesIds->build(" %s is not null ", tEvents->getField("SCRSERIESID")->getDbName());
   selectSeriesIds->build(" and %s > 0 ", tEvents->getField("SCRSERIESID")->getDbName());

   if (selectSeriesIds->prepare() != success)
   {
      delete selectSeriesIds;
      return 0;
   }

   tEvents->clear();

   for (int res = selectSeriesIds->find(); res; res = selectSeriesIds->fetch())
      activeSeriesIds.insert(tEvents->getIntValue("SCRSERIESID"));

   selectSeriesIds->freeResult();
   delete selectSeriesIds;

   // fetching seriesIds from recordings

   cDbStatement* selectSeriesIdsRec = new cDbStatement(tRecordingList);
   selectSeriesIdsRec->build("select distinct ");
   selectSeriesIdsRec->bind("SCRSERIESID", cDBS::bndOut);
   selectSeriesIdsRec->build(" from %s where ", tRecordingList->TableName());
   selectSeriesIdsRec->build(" %s is not null ", tRecordingList->getField("SCRSERIESID")->getDbName());
   selectSeriesIdsRec->build(" and %s > 0 ", tRecordingList->getField("SCRSERIESID")->getDbName());

   if (selectSeriesIdsRec->prepare() != success)
   {
      delete selectSeriesIdsRec;
      return numDelete;
   }

   tRecordingList->clear();

   for (int res = selectSeriesIdsRec->find(); res; res = selectSeriesIdsRec->fetch())
      activeSeriesIds.insert(tRecordingList->getIntValue("SCRSERIESID"));

   selectSeriesIdsRec->freeResult();
   delete selectSeriesIdsRec;

   // fetching all seriesIds from database

   std::vector<int> storedSeriesIds;
   cDbStatement* selectStoredSeriesIds = new cDbStatement(tSeries);
   selectStoredSeriesIds->build("select ");
   selectStoredSeriesIds->bind("SERIESID", cDBS::bndOut);
   selectStoredSeriesIds->build(" from %s where ", tSeries->TableName());
   selectStoredSeriesIds->build(" %s is not null ", tSeries->getField("SERIESID")->getDbName());
   selectStoredSeriesIds->build(" and %s > 0 ", tSeries->getField("SERIESID")->getDbName());

   if (selectStoredSeriesIds->prepare() != success)
   {
      delete selectStoredSeriesIds;
      return numDelete;
   }

   tSeries->clear();

   for (int res = selectStoredSeriesIds->find(); res; res = selectStoredSeriesIds->fetch())
      storedSeriesIds.push_back(tSeries->getIntValue("SERIESID"));

   selectStoredSeriesIds->freeResult();
   delete selectStoredSeriesIds;

   numDelete = storedSeriesIds.size() - activeSeriesIds.size();

   if (numDelete < 1)
      return numDelete;

   for (const auto& sId : storedSeriesIds)
   {
      if (activeSeriesIds.find(sId) == activeSeriesIds.end())
         DeleteSeries(sId);
   }

   return numDelete;
}

void cTVDBManager::DeleteSeries(int seriesId)
{
   if (seriesId < 1)
      return;

   stringstream delSeriesEpisodes;
   delSeriesEpisodes << "delete from " << tSeriesEpsiode->TableName();
   delSeriesEpisodes << " where " << tSeriesEpsiode->getField("SeriesId")->getDbName();
   delSeriesEpisodes << " = " << seriesId;

   cDbStatement delEpisodes(connection, delSeriesEpisodes.str().c_str());
   delEpisodes.prepare();
   delEpisodes.execute();

   stringstream delSeriesActors;
   delSeriesActors << "delete from " << tSeriesActor->TableName();
   delSeriesActors << " where " << tSeriesActor->getField("ActorId")->getDbName();
   delSeriesActors << " in ( ";
   delSeriesActors << " select series_media.actor_id ";
   delSeriesActors << " from series, series_media ";
   delSeriesActors << " where series.series_id = series_media.series_id ";
   delSeriesActors << " and  series_media.media_type = " << cTVDBSeries::atActor;
   delSeriesActors << " and series.series_id = " << seriesId << ")";

   cDbStatement delActors(connection, delSeriesActors.str().c_str());
   delActors.prepare();
   delActors.execute();

   stringstream delSeriesMedia;
   delSeriesMedia << "delete from " << tSeriesMedia->TableName();
   delSeriesMedia << " where " << tSeriesMedia->getField("SeriesId")->getDbName();
   delSeriesMedia << " = " << seriesId;

   cDbStatement delMedia(connection, delSeriesMedia.str().c_str());
   delMedia.prepare();
   delMedia.execute();

   stringstream delSeries;
   delSeries << "delete from " << tSeries->TableName();
   delSeries << " where " << tSeries->getField("SeriesId")->getDbName();
   delSeries << " = " << seriesId;

   cDbStatement delSer(connection, delSeries.str().c_str());
   delSer.prepare();
   delSer.execute();
}

bool cTVDBManager::SearchRecordingDB(const std::string& name, const std::string& episode, int &seriesId, int &episodeId)
{
   tSeries->clear();
   tSeries->setValue("SERIESNAME", name.c_str());

   if (selectSeriesByName->find())
   {
      seriesId = tSeries->getIntValue("SERIESID");
      episodeId = LoadEpisode(episode, seriesId);
      return true;
   }

   selectSeriesByName->freeResult();

   return false;
}

bool cTVDBManager::searchRecordingOnline(const char* name, const std::string& episode, int& seriesId, int& episodeId)
{
   cTVDBSeries* recSeries = scrapSeries(name);

   if (recSeries)
   {
      saveSeries(recSeries);
      seriesId = recSeries->seriesID;
      delete recSeries;
      episodeId = LoadEpisode(episode, seriesId);
      return true;
   }

   return false;
}

int cTVDBManager::LoadEpisode(const std::string& name, int seriesId)
{
   tSeriesEpsiode->clear();
   tSeriesEpsiode->setValue("EPISODENAME", name.c_str());
   tSeriesEpsiode->setValue("SERIESID", seriesId);

   if (selectEpisodeByName->find())
      return tSeriesEpsiode->getIntValue("EPISODEID");

   selectEpisodeByName->freeResult();

   return 0;
}

bool cTVDBManager::CheckScrapInfoDB(int scrapSeriesId, int scrapEpisodeId)
{
   tSeries->clear();
   tSeries->setValue("SERIESID", scrapSeriesId);

   if (!tSeries->find())
      return false;

   if (scrapEpisodeId)
   {
      tSeriesEpsiode->clear();
      tSeriesEpsiode->setValue("EPISODEID", scrapEpisodeId);

      if (tSeriesEpsiode->find())
      {
         int season = tSeriesEpsiode->getIntValue("SEASONNUMBER");

         if (season)
            checkLoadSeasonPoster(scrapSeriesId, season);
      }
   }

   return true;
}

bool cTVDBManager::CheckScrapInfoOnline(int scrapSeriesId, int scrapEpisodeId)
{
   cTVDBSeries* series = scrapSeries(scrapSeriesId);

   if (!series)
      return false;

   saveSeries(series);

   if (scrapEpisodeId > 0)
   {
      int part {0};
      int season {0};

      if (series->getPartAndSeason(scrapEpisodeId, season, part) == success && season)
         checkLoadSeasonPoster(scrapSeriesId, season);
   }

   delete series;
   return true;
}
