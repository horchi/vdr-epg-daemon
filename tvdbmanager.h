
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

#include "scraper/thetvdbscraper/thetvdbscraper.h"
#include "scraper/thetvdbscraper/tvdbseries.h"

struct sSeriesResult
{
   tEventId eventId {0};
   std::string title;
   int lastScraped {0};
   int season {0};
   int part {0};
   int number {0};
   std::string episodeName;
};

// --- cTVDBManager -------------------------------------------------------------

class cTVDBManager
{
   public:

      cTVDBManager();
      virtual ~cTVDBManager();
      int ConnectDatabase(cDbConnection *conn);
      int connectScraper();
      void SetServerTime();
      void ResetBytesDownloaded() { bytesDownloaded = 0; };
      int GetBytesDownloaded() { return bytesDownloaded; };
      void UpdateSeries();
      bool GetSeriesWithEpisodesFromEPG(vector<sSeriesResult> *result);
      void processSeries(sSeriesResult ser);
      int CleanupSeries();
      bool SearchRecordingDB(string name, string episode, int &seriesId, int &episodeId);
      bool searchRecordingOnline(const char* name, string episode, int &seriesId, int &episodeId);
      bool CheckScrapInfoDB(int scrapSeriesId, int scrapEpisodeId);
      bool CheckScrapInfoOnline(int scrapSeriesId, int scrapEpisodeId);

   private:

      int bytesDownloaded {0};
      int withutf8 {no};
      string language;
      // int serverTime {0};
      map<string,int> alreadyScraped;
      cTVDBScraper* tvdbScraper {};
      cDbConnection* connection {};
      cDbTable* tSeries {};
      cDbTable* tSeriesEpsiode {};
      cDbTable* tSeriesMedia {};
      cDbTable* tSeriesActor {};
      cDbTable* tEvents {};
      cDbTable* tEpisodes {};
      cDbTable* tRecordingList {};

      int GetLastScrap();
      void UpdateScrapTimestamp();
      bool GetAllIDs(set<int>* IDs, cDbTable* table, const char* fname);
      cTVDBSeries* scrapSeries(const char* search);
      cTVDBSeries* scrapSeries(int seriesID);
      void saveSeries(cTVDBSeries* series);
      void SaveSeriesBasics(cTVDBSeries* series);
      void saveSeriesMedia(cTVDBSeries* series);
      int updateStoreArtwork(const cTVDBSeries::Artwork& artwork, uint lfn, int seriesID);
      void saveSeriesEpisodes(cTVDBSeries* series);
      void saveSeriesEpisode(const  cTVDBSeries::Episode* episode, int seriesID = 0);
      void saveSeriesActors(cTVDBSeries* series);
      bool loadMedia(int seriesId, int seasonNumber, int episodeId, int actorId, int mediaType, uint lfn);
      bool imageUrlChanged(std::string url);
      int GetPicture(const char* url, MemoryStruct* data);
      int LoadSeriesFromDd(string name);
      void GetSeasonEpisodeFromEpisodename(int seriesID, int &season, int &part, string episodeName);
      void LoadSeasonPoster(int seriesID, int season);
      int LoadEpisodePicture(int seriesID, int season, int part);
      void UpdateEvent(tEventId eventID, int seriesID, int episodeID);
      void DeleteSeries(int seriesId);
      int LoadEpisode(string name, int seriesId);
};
