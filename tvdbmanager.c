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

   string loc = setlocale(LC_CTYPE, 0);
   size_t index = loc.find_first_of("_");
   string langISO {""};

   if (index > 0)
      langISO = loc.substr(0, index);

   if (langISO.size() == 2)
      language = langISO.c_str();

   tell(0, "Using scraping language %s", language.c_str());
}

cTVDBManager::~cTVDBManager()
{
   delete tvdbScraper;
   delete tSeries;
   delete tSeriesEpsiode;
   delete tSeriesMedia;
   delete tSeriesActor;
   delete tEvents;
   delete tEpisodes;
   delete tRecordingList;
}

int cTVDBManager::ConnectDatabase(cDbConnection* conn)
{
   if (!conn)
      return fail;

   int status {success};
   connection = conn;

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

   return success;
}

int cTVDBManager::connectScraper()
{
   tvdbScraper = new cTVDBScraper(language);

   return tvdbScraper->connect();
}

// void cTVDBManager::SetServerTime()
// {
//    serverTime = tvdbScraper->GetServerTime();
// }

void cTVDBManager::UpdateSeries()
{
/*
   set<int> updatedSeries;
   set<int> updatedEpisodes;
   set<int> storedSeries;
   set<int> storedEpisodes;
   int lastScrap = GetLastScrap();

   if (lastScrap < 1)
      return;

   if (!tvdbScraper->GetUpdatedSeriesandEpisodes(&updatedSeries, &updatedEpisodes, lastScrap))
      return;

   if (!GetAllIDs(&storedSeries, tSeries, "SeriesId"))
      return;

   if (!GetAllIDs(&storedEpisodes, tSeriesEpsiode, "EpisodeId"))
      return;

   set<int> scrapSeriesIDs;
   set<int> scrapEpisodeIDs;

   std::set_intersection(updatedSeries.begin(), updatedSeries.end(),
                         storedSeries.begin(), storedSeries.end(),
                         std::inserter(scrapSeriesIDs, scrapSeriesIDs.begin()));

   std::set_intersection(updatedEpisodes.begin(), updatedEpisodes.end(),
                         storedEpisodes.begin(), storedEpisodes.end(),
                         std::inserter(scrapEpisodeIDs, scrapEpisodeIDs.begin()));

   tell(0, "%d updated Series, %d updatedEpisodes", (int)updatedSeries.size(), (int)updatedEpisodes.size());
   tell(0, "%d series to update in db, %d episodes to update in db", (int)scrapSeriesIDs.size(), (int)scrapEpisodeIDs.size());

   int seriesCur {1};

   for (set<int>::iterator it = scrapSeriesIDs.begin(); !cEpgd::doShutDown() && it != scrapSeriesIDs.end(); it++)
   {
      if (seriesCur % 10 == 0)
         tell(0, "ReScraped %d series...continuing rescraping", seriesCur);

      cTVDBSeries* series = scrapSeries(*it);

      if (series)
         saveSeries(series);

      delete series;
      seriesCur++;
   }

   if (seriesCur > 1)
      tell(0, "ReScraped %d series", seriesCur-1);

   int episodeCur {1};

   // for (set<int>::iterator it = scrapEpisodeIDs.begin(); !cEpgd::doShutDown() && it != scrapEpisodeIDs.end(); it++)
   for (const auto& episode : *thetvbSeries->getEpisodes())
   {
      if (episodeCur % 10 == 0)
         tell(0, "ReScraped %d Episodes...continuing rescraping", episodeCur);

      cTVDBEpisode *episode = tvdbScraper->GetEpisode(*it);
      episode->ReadEpisode();
      saveSeriesEpisode(episode);
      delete episode;
      episodeCur++;
   }

   if (episodeCur > 1)
      tell(0, "ReScraped %d Episodes", episodeCur-1);

   UpdateScrapTimestamp();
*/
}

int cTVDBManager::GetLastScrap()
{
   int status = success;
   int lastScraped = 0;
   cDbStatement *selectTime = new cDbStatement(tSeries);
   selectTime->build("select ");
   selectTime->bind("SeriesLastScraped", cDBS::bndOut);
   selectTime->build(" from %s", tSeries->TableName());
   status += selectTime->prepare();

   if (status != success)
   {
      delete selectTime;
      return 0;
   }

   for (int res = selectTime->find(); res; res = selectTime->fetch())
   {
      lastScraped = tSeries->getIntValue("SeriesLastScraped");
      break;
   }

   selectTime->freeResult();
   delete selectTime;
   return lastScraped;
}

void cTVDBManager::UpdateScrapTimestamp()
{
   stringstream upd;
   upd << "update " << tSeries->TableName() << " set series_last_scraped=" << time(0) << " where series_id > 0";
   cDbStatement updStmt(connection, upd.str().c_str());
   updStmt.prepare();
   updStmt.execute();
}

bool cTVDBManager::GetAllIDs(set<int>* IDs, cDbTable* table, const char* fname)
{
   int status {success};
   cDbStatement* selectIDs = new cDbStatement(table);

   selectIDs->build("select ");
   selectIDs->bind(fname, cDBS::bndOut);
   selectIDs->build(" from %s", table->TableName());
   status += selectIDs->prepare();

   if (status != success)
   {
      delete selectIDs;
      return false;
   }

   for (int res = selectIDs->find(); res; res = selectIDs->fetch())
      IDs->insert(table->getIntValue(fname));

   selectIDs->freeResult();

   delete selectIDs;
   return true;
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

   tell(eloAlways, "Scraping new and changed artwork for series '%d' ..", series->seriesID);

   for (const auto& artwork : *series->getArtwork())
   {
      int lfn = lfns[artwork.type];

      if (lfn > 3)    // max 4 images / media-type
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

   tell(eloAlways, "Updated %d of %d artwork objects for series '%d'", count, total, series->seriesID);
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
   for (const auto& episode : *series->getEpisodes())
   {
      saveSeriesEpisode(&episode, series->seriesID);

      bool exists = loadMedia(series->seriesID, episode.seasonNumber, episode.id, 0, cTVDBSeries::atEpisode, 0);
      bool reloadImage = exists ? imageUrlChanged(episode.imageUrl.c_str()) : true;

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

bool cTVDBManager::GetSeriesWithEpisodesFromEPG(vector<sSeriesResult>* result)
{
   int status {success};
   cDbValue season;
   cDbValue part;
   cDbValue number;

   season.setField(tEpisodes->getField("Season"));
   part.setField(tEpisodes->getField("Part"));
   number.setField(tEpisodes->getField("Number"));

   cDbStatement* selectSeries = new cDbStatement(tEvents);

   selectSeries->build("select ");
   selectSeries->bind("EventId", cDBS::bndOut);
   selectSeries->bind("Title", cDBS::bndOut, ", ");
   selectSeries->bind("ScrSp", cDBS::bndOut, ", ");
   selectSeries->bind(&season, cDBS::bndOut, ", ");
   selectSeries->bind(&part, cDBS::bndOut, ", ");
   selectSeries->bind(&number, cDBS::bndOut, ", ");
   selectSeries->bind("ShortText", cDBS::bndOut, ", ");
   selectSeries->build(" from thetvdbview");

   status += selectSeries->prepare();

   if (status != success)
   {
      delete selectSeries;
      return false;
   }

   for (int found = selectSeries->find(); found; found = selectSeries->fetch())
   {
      sSeriesResult res;
      res.eventId = tEvents->getBigintValue("EventId");
      res.title = tEvents->getStrValue("Title");
      res.lastScraped = tEvents->getIntValue("ScrSp");
      res.season = season.getIntValue();
      res.part = part.getIntValue();
      res.number = number.getIntValue();
      res.episodeName = tEvents->getStrValue("ShortText");
      result->push_back(res);
   }

   selectSeries->freeResult();
   delete selectSeries;

   return true;
}

int cTVDBManager::GetPicture(const char* url, MemoryStruct* data)
{
   // tell(0, "Debug: Download image '%s'", url);

   int maxSize = tSeriesMedia->getField("MediaContent")->getSize();
   int fileSize {0};
   data->clear();

   if (isEmpty(url))
      return fail;

   if (curl.downloadFile(url, fileSize, data) != success)
      return fail;

   bytesDownloaded += fileSize;

   if (fileSize >= maxSize)
   {
      tell(3, "Debug: Skipping download of '%s' due to size > (%d)", url, maxSize);
      return -2;
   }

   return success;
}

bool cTVDBManager::imageUrlChanged(std::string url)
{
   if (url.compare(tSeriesMedia->getStrValue("MediaUrl")) != 0)
      return true;

   return false;
}

//***************************************************************************
// Process Series by name (one series per call)
//***************************************************************************

void cTVDBManager::processSeries(sSeriesResult ser)
{
   // tell(0, "Checking eventID: %d, Title: %s, S%dE%dN%d", ser.eventId, ser.title.c_str(), ser.season, ser.part, ser.number);

   int seriesID {0};
   int episodeID {0};

   const auto hit = alreadyScraped.find(ser.title);

   if (hit != alreadyScraped.end())
   {
      seriesID = (int)hit->second;

      if (!seriesID)
      {
         //tell(0, "series %s already scraped and nothing found in tvdb", ser.title.c_str());
         UpdateEvent(ser.eventId, seriesID, episodeID);
         return;
      }
      else
      {
         //tell(0, "found series %s in cache, id %d", ser.title.c_str(), seriesID);
      }
   }

   if (!seriesID)
   {
      // check if series in database

      seriesID = LoadSeriesFromDd(ser.title);

      if (seriesID)
      {
         tell(0, "TvDb: Series '%s' already in db, id (%d)", ser.title.c_str(), seriesID);
      }
      else
      {
         // scrap series

         cTVDBSeries* series = scrapSeries(ser.title.c_str());

         if (series)
         {
            saveSeries(series);
            seriesID = series->seriesID;
            tell(0, "TvDb: Series '%s' successfully scraped with id (%d)", ser.title.c_str(), seriesID);
            delete series;
            series = nullptr;
         }
         else
         {
            tell(0, "TvDb: Series '%s' not found at tvdb.com", ser.title.c_str());
         }
      }
   }

   alreadyScraped.insert(pair<string,int>(ser.title, seriesID));

   if (seriesID)
   {
      if (!ser.season && !ser.part && ser.episodeName.size() > 0)
      {
         // try to get part and season from episode name
         GetSeasonEpisodeFromEpisodename(seriesID, ser.season, ser.part, ser.episodeName);
      }

      // tell(0, "downloading episode info");
      // loading season poster and episode picture

      if (ser.season)
         loadSeasonPoster(seriesID, ser.season);

      if (ser.season && ser.part)
         episodeID = loadEpisodePicture(seriesID, ser.season, ser.part);
   }

   // updating event with series data

   UpdateEvent(ser.eventId, seriesID, episodeID);
}

int cTVDBManager::LoadSeriesFromDd(std::string name)
{
   int status {success};
   int seriesID {0};

   tSeries->clear();
   tSeries->setValue("SeriesName", name.c_str());
   cDbStatement* select = new cDbStatement(tSeries);
   select->build("select ");
   select->bind("SeriesId", cDBS::bndOut);
   select->build(" from %s where ", tSeries->TableName());
   select->bind("SeriesName", cDBS::bndIn | cDBS::bndSet);

   status += select->prepare();

   if (status != success)
   {
      delete select;
      return 0;
   }

   if (select->find())
      seriesID = tSeries->getIntValue("SeriesId");

   select->freeResult();
   delete select;

   return seriesID;
}

void cTVDBManager::GetSeasonEpisodeFromEpisodename(int seriesID, int& season, int& part, std::string episodeName)
{
   int status {success};
   tSeriesEpsiode->clear();
   tSeriesEpsiode->setValue("SeriesId", seriesID);
   tSeriesEpsiode->setValue("EpisodeName", episodeName.c_str());
   cDbStatement* select = new cDbStatement(tSeriesEpsiode);
   select->build("select ");
   select->bind("EpisodeNumber", cDBS::bndOut);
   select->bind("SeasonNumber", cDBS::bndOut, ", ");
   select->build(" from %s where ", tSeriesEpsiode->TableName());
   select->bind("SeriesId", cDBS::bndIn | cDBS::bndSet);
   select->bind("EpisodeName", cDBS::bndIn | cDBS::bndSet, " and ");

   status += select->prepare();

   if (status != success)
   {
      delete select;
      return;
   }

   if (select->find())
   {
      season = tSeriesEpsiode->getIntValue("SeasonNumber");
      part = tSeriesEpsiode->getIntValue("EpisodeNumber");
   }

   select->freeResult();
   delete select;
}

void cTVDBManager::loadSeasonPoster(int seriesID, int season)
{
   tSeriesMedia->clear();
   tSeriesMedia->setValue("SeriesId", seriesID);
   tSeriesMedia->setValue("SeasonNumber", season);
   tSeriesMedia->setValue("EpisodeId", 0);
   tSeriesMedia->setValue("ActorId", 0);
   tSeriesMedia->setValue("MediaType", cTVDBSeries::atSeasonPoster);
   tSeriesMedia->setValue("LFN", 0);  // #TODO ??

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

int cTVDBManager::loadEpisodePicture(int seriesID, int season, int part)
{
   tSeriesEpsiode->clear();
   tSeriesEpsiode->setValue("EpisodeNumber", part);
   tSeriesEpsiode->setValue("SeasonNumber", season);
   tSeriesEpsiode->setValue("SeriesId", seriesID);

   cDbStatement* select = new cDbStatement(tSeriesEpsiode);

   select->build("select ");
   select->bind("EpisodeId", cDBS::bndOut);
   select->build(" from %s where ", tSeriesEpsiode->TableName());
   select->bind("EpisodeNumber", cDBS::bndIn | cDBS::bndSet);
   select->bind("SeasonNumber", cDBS::bndIn | cDBS::bndSet, " and ");
   select->bind("SeriesId", cDBS::bndIn | cDBS::bndSet, " and ");

   if (select->prepare() != success)
   {
      delete select;
      return 0;
   }

   int episodeID {0};

   if (select->find())
      episodeID = tSeriesEpsiode->getIntValue("EpisodeId");

   select->freeResult();
   delete select;

   return episodeID;
}

void cTVDBManager::UpdateEvent(tEventId eventID, int seriesID, int episodeID)
{
   stringstream upd;
   upd << "update " << tEvents->TableName();
   upd << " set scrsp = " << time(0);
   upd << ", scrseriesid = " << seriesID;
   upd << ", scrseriesepisode = " << episodeID;
   upd << " where eventid = " << eventID;
   cDbStatement updStmt(connection, upd.str().c_str());
   updStmt.prepare();
   updStmt.execute();
}

int cTVDBManager::CleanupSeries()
{
   int numDelete {0};
   set<int> activeSeriesIds;
   //fetching seriesIds from current events
   cDbStatement *selectSeriesIds = new cDbStatement(tEvents);
   selectSeriesIds->build("select distinct ");
   selectSeriesIds->bind("ScrSeriesId", cDBS::bndOut);
   selectSeriesIds->build(" from %s where ", tEvents->TableName());
   selectSeriesIds->build(" %s is not null ", tEvents->getField("ScrSeriesId")->getDbName());
   selectSeriesIds->build(" and %s > 0 ", tEvents->getField("ScrSeriesId")->getDbName());

   if (selectSeriesIds->prepare() != success)
   {
      delete selectSeriesIds;
      return 0;
   }

   tEvents->clear();

   for (int res = selectSeriesIds->find(); res; res = selectSeriesIds->fetch())
      activeSeriesIds.insert(tEvents->getIntValue("ScrSeriesId"));

   selectSeriesIds->freeResult();
   delete selectSeriesIds;

   // fetching seriesIds from recordings

   cDbStatement *selectSeriesIdsRec = new cDbStatement(tRecordingList);
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

   vector<int> storedSeriesIds;
   cDbStatement *selectStoredSeriesIds = new cDbStatement(tSeries);
   selectStoredSeriesIds->build("select ");
   selectStoredSeriesIds->bind("SeriesId", cDBS::bndOut);
   selectStoredSeriesIds->build(" from %s where ", tSeries->TableName());
   selectStoredSeriesIds->build(" %s is not null ", tSeries->getField("SeriesId")->getDbName());
   selectStoredSeriesIds->build(" and %s > 0 ", tSeries->getField("SeriesId")->getDbName());

   if (selectStoredSeriesIds->prepare() != success)
   {
      delete selectStoredSeriesIds;
      return numDelete;
   }

   tSeries->clear();

   for (int res = selectStoredSeriesIds->find(); res; res = selectStoredSeriesIds->fetch())
      storedSeriesIds.push_back(tSeries->getIntValue("SeriesId"));

   selectStoredSeriesIds->freeResult();
   delete selectStoredSeriesIds;

   numDelete = storedSeriesIds.size() - activeSeriesIds.size();

   if (numDelete < 1)
      return numDelete;

   for (vector<int>::iterator sId = storedSeriesIds.begin(); sId != storedSeriesIds.end(); sId++)
   {
      set<int>::iterator hit = activeSeriesIds.find(*sId);

      if (hit == activeSeriesIds.end())
         DeleteSeries(*sId);
   }

   return numDelete;
}

void cTVDBManager::DeleteSeries(int seriesId) {
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

bool cTVDBManager::SearchRecordingDB(std::string name, std::string episode, int &seriesId, int &episodeId)
{
   int status = success;
   cDbStatement *select = new cDbStatement(tSeries);

   select->build("select ");
   select->bind("SeriesId", cDBS::bndOut);
   select->build(" from %s where ", tSeries->TableName());
   select->bind("SeriesName", cDBS::bndIn | cDBS::bndSet);
   status += select->prepare();

   if (status != success)
   {
      delete select;
      return false;
   }

   tSeries->clear();
   tSeries->setValue("SeriesName", name.c_str());
   int found = select->find();

   if (found)
   {
      seriesId = tSeries->getIntValue("SeriesId");
      episodeId = LoadEpisode(episode, seriesId);
   }

   select->freeResult();
   delete select;

   return found;
}

bool cTVDBManager::searchRecordingOnline(const char* name, std::string episode, int& seriesId, int& episodeId)
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

int cTVDBManager::LoadEpisode(std::string name, int seriesId)
{
   int status = success;
   int episodeId = 0;
   cDbStatement *select = new cDbStatement(tSeriesEpsiode);
   select->build("select ");
   select->bind("EpisodeId", cDBS::bndOut);
   select->build(" from %s where ", tSeriesEpsiode->TableName());
   select->bind("EpisodeName", cDBS::bndIn | cDBS::bndSet);
   select->bind("SeriesId", cDBS::bndIn | cDBS::bndSet, " and ");
   status += select->prepare();
   if (status != success) {
      delete select;
      return false;
   }
   tSeriesEpsiode->clear();
   tSeriesEpsiode->setValue("EpisodeName", name.c_str());
   tSeriesEpsiode->setValue("SeriesId", seriesId);
   int found = select->find();
   if (found)
      episodeId = tSeriesEpsiode->getIntValue("EpisodeId");
   select->freeResult();
   delete select;
   return episodeId;
}


bool cTVDBManager::CheckScrapInfoDB(int scrapSeriesId, int scrapEpisodeId)
{
   // check if series is in db

   tSeries->clear();
   tSeries->setValue("SeriesId", scrapSeriesId);
   int found = tSeries->find();

   if (!found)
      return false;

   if (scrapEpisodeId > 0)
   {
      tSeriesEpsiode->clear();
      tSeriesEpsiode->setValue("EpisodeId", scrapEpisodeId);
      found = tSeriesEpsiode->find();

      if (found)
      {
         int season = tSeriesEpsiode->getIntValue("SeasonNumber");
         int part = tSeriesEpsiode->getIntValue("EpisodeNumber");

         if (season)
            loadSeasonPoster(scrapSeriesId, season);

         if (season && part)
            loadEpisodePicture(scrapSeriesId, season, part);
      }
   }

   return true;
}

bool cTVDBManager::CheckScrapInfoOnline(int scrapSeriesId, int scrapEpisodeId)
{
   cTVDBSeries* seriesRec = scrapSeries(scrapSeriesId);

   if (!seriesRec)
      return false;

   saveSeries(seriesRec);

   if (scrapEpisodeId > 0)
   {
      int part {0};
      int season {0};

      if (seriesRec->getPartAndSeason(scrapEpisodeId, season, part))
      {
         if (season)
            loadSeasonPoster(scrapSeriesId, season);

         if (season && part)
            loadEpisodePicture(scrapSeriesId, season, part);
      }
   }

   delete seriesRec;
   return true;
}
