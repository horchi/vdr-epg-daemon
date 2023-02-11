
#pragma once

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <set>
#include <algorithm>

#include "lib/common.h"
#include "lib/db.h"
#include "lib/epgservice.h"

#include "epgdconfig.h"

#include "scraper/tvdbscraper/tvdbscraper.h"
#include "scraper/tvdbscraper/tvdbseries.h"

//***************************************************************************
// cTVDBManager
//***************************************************************************

class cTVDBManager
{
   public:

      struct SeriesLookupData
      {
         tEventId eventId {0};
         std::string title;
         int lastScraped {0};
         int season {0};
         int part {0};
         int number {0};
         std::string episodeName;
      };

      cTVDBManager(bool aWithutf8 = true);
      virtual ~cTVDBManager();

      int initDb(cDbConnection* c);
      int exitDb();

      int connectScraper();
      void ResetBytesDownloaded() { bytesDownloaded = 0; };
      long long GetBytesDownloaded() { return bytesDownloaded; };
      int updateSeries(time_t since);
      bool getSeriesWithEpisodesFromEPG(std::vector<SeriesLookupData>& result);
      void processSeries(SeriesLookupData ser);
      int CleanupSeries();
      bool SearchRecordingDB(const std::string& name, const std::string& episode, int& seriesId, int& episodeId);
      bool searchRecordingOnline(const char* name, const std::string& episode, int& seriesId, int& episodeId);
      bool CheckScrapInfoDB(int scrapSeriesId, int scrapEpisodeId);
      bool CheckScrapInfoOnline(int scrapSeriesId, int scrapEpisodeId);

   private:

      long long bytesDownloaded {0};
      int withutf8 {no};
      std::string language {"en"};
      std::map<std::string,int> alreadyScraped;
      cTVDBScraper* tvdbScraper {};

      cDbConnection* connection {};
      cDbTable* tSeries {};
      cDbTable* tSeriesEpsiode {};
      cDbTable* tSeriesMedia {};
      cDbTable* tSeriesActor {};
      cDbTable* tEvents {};
      cDbTable* tEpisodes {};
      cDbTable* tRecordingList {};

      cDbStatement* selectSeriesByName {};
      cDbStatement* selectEpisodeByName {};
      cDbStatement* updateEvent {};
      cDbStatement* selectEpisodeByNumbers {};

      std::vector<cDbStatement*> statements;

      int getAllIDs(std::set<int>& IDs, cDbTable* table, const char* field);
      cTVDBSeries* scrapSeries(const char* search);
      cTVDBSeries* scrapSeries(int seriesID);
      void saveSeries(cTVDBSeries* series);
      void saveSeriesBasics(cTVDBSeries* series);
      void saveSeriesMedia(cTVDBSeries* series);
      int updateStoreArtwork(const cTVDBSeries::Artwork& artwork, uint lfn, int seriesID);
      void saveSeriesEpisodes(cTVDBSeries* series);
      void saveSeriesEpisode(const  cTVDBSeries::Episode* episode, int seriesID = 0);
      void saveSeriesActors(cTVDBSeries* series);
      bool loadMedia(int seriesId, int seasonNumber, int episodeId, int actorId, int mediaType, uint lfn);
      bool imageUrlChanged(const std::string& url);
      int GetPicture(const char* url, MemoryStruct* data);
      void checkLoadSeasonPoster(int seriesID, int season);
      int LoadEpisode(const std::string& name, int seriesId);
      int lookupEpisodeId(int seriesID, const SeriesLookupData& lookupData);

      void UpdateEvent(tEventId eventID, int seriesID, int episodeID);
      void DeleteSeries(int seriesId);
};
