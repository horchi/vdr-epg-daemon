
#ifndef __TVSCRAPER_TVDBMANAGER_H
#define __TVSCRAPER_TVDBMANAGER_H

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
#include "scraper/thetvdbscraper/tvdbepisode.h"
#include "scraper/thetvdbscraper/tvdbmedia.h"
#include "scraper/thetvdbscraper/tvdbactor.h"

struct sSeriesResult {
    tEventId eventId;
    string title;
    int lastScraped;
    int season;
    int part;
    int number;
    string episodeName;  
};

// --- cTVDBManager -------------------------------------------------------------

class cTVDBManager {
private:
    int bytesDownloaded;
    int withutf8;
    string language;
    int serverTime;
    map<string, int> alreadyScraped;
    cTVDBScraper *tvdbScraper;
    cDbConnection *connection;
    cDbTable *tSeries;
    cDbTable *tSeriesEpsiode;
    cDbTable *tSeriesMedia;
    cDbTable *tSeriesActor;
    cDbTable *tEvents;
    cDbTable *tEpisodes;
    cDbTable *tRecordingList;

    enum mediaType {
         mtBanner1,
         mtBanner2,
         mtBanner3,
         mtPoster1,
         mtPoster2,
         mtPoster3,
         mtSeasonPoster,
         mtFanart1,
         mtFanart2,
         mtFanart3,
         mtEpisodePic,
         mtActorThumb
    };
    int GetLastScrap(void);
    void UpdateScrapTS(void);
    bool GetAllIDs(set<int> *IDs, cDbTable *table, const char* fname);
    cTVDBSeries *ScrapSeries(string search);
    cTVDBSeries *ScrapSeries(int seriesID);
    void SaveSeries(cTVDBSeries *series);
    void SaveSeriesBasics(cTVDBSeries *series);
    void SaveSeriesMedia(cTVDBSeries *series);
    bool SavePosterBannerFanart(int mediaType, cTVDBMedia *media, int seriesID);
    void SaveSeriesEpisodes(cTVDBSeries *series);
    void SaveSeriesEpisode(cTVDBEpisode *episode, int seriesID = 0);
    void SaveSeriesActors(cTVDBSeries *series);
    bool LoadMedia(int seriesId, int seasonNumber, int episodeId, int actorId, int mediaType);
    bool ReloadImage(string url);
    int GetPicture(const char* url, MemoryStruct* data);
    int LoadSeriesFromDB(string name);
    void GetSeasonEpisodeFromEpisodename(int seriesID, int &season, int &part, string episodeName);
    void LoadSeasonPoster(int seriesID, int season);
    int LoadEpisodePicture(int seriesID, int season, int part);
    void UpdateEvent(tEventId eventID, int seriesID, int episodeID);
    void DeleteSeries(int seriesId);
    int LoadEpisode(string name, int seriesId);
public:
    cTVDBManager(void);
    virtual ~cTVDBManager(void);
    int ConnectDatabase(cDbConnection *conn);
    bool ConnectScraper(void);
    void SetServerTime(void);
    void ResetBytesDownloaded(void) { bytesDownloaded = 0; };
    int GetBytesDownloaded(void) { return bytesDownloaded; };
    void UpdateSeries(void);
    bool GetSeriesWithEpisodesFromEPG(vector<sSeriesResult> *result);
    void ProcessSeries(sSeriesResult ser);
    int CleanupSeries(void);
    bool SearchRecordingDB(string name, string episode, int &seriesId, int &episodeId);
    bool SearchRecordingOnline(string name, string episode, int &seriesId, int &episodeId);
    bool CheckScrapInfoDB(int scrapSeriesId, int scrapEpisodeId);
    bool CheckScrapInfoOnline(int scrapSeriesId, int scrapEpisodeId);
};

#endif //__TVSCRAPER_TVDBMANAGER_H
