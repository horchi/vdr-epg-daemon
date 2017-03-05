
#ifndef __TVSCRAPER_MOVIEDBMANAGER_H
#define __TVSCRAPER_MOVIEDBMANAGER_H

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

#include "tools/stringhelpers.h"
#include "scraper/themoviedbscraper/themoviedbscraper.h"
#include "scraper/themoviedbscraper/moviedbmovie.h"
#include "scraper/themoviedbscraper/moviedbactor.h"

#include "epgdconfig.h"

struct sMovieResult {
    tEventId eventId;
    string title;
    string year;
    int lastScraped;
};

// --- cMovieDBManager -------------------------------------------------------------

class cMovieDBManager {
private:
    int bytesDownloaded;
    int withutf8;
    string language;
    map<string, int> alreadyScraped;
    cMovieDBScraper *movieDbScraper;
    cDbConnection *connection;
    cDbTable *tMovies;
    cDbTable *tMoviesActor;
    cDbTable *tMoviesActors;
    cDbTable *tMovieMedia;
    cDbTable *tEvents;
//    cDbTable *tRecordings;
    cDbTable *tRecordingList;
    enum mediaType {
         mtPoster,
         mtFanart,
         mtCollectionPoster,
         mtCollectionFanart,
         mtActorThumb
    };
    int LoadMovieFromDB(string title);
    void UpdateEvent(tEventId eventID, int movieID);
    void SaveMovie(cMovieDbMovie *movie);
    void SaveMovieBasics(cMovieDbMovie *movie);
    void SaveMovieMedia(cMovieDbMovie *movie);
    void SaveMovieActors(cMovieDbMovie *movie);
    bool LoadMedia(int movieId, int actorId, int mediaType);
    int GetPicture(const char* url, MemoryStruct* data);
    void DeleteMovie(int movieId);
    cMovieDbMovie *SearchRecordingSophisticated(string name);
public:
    cMovieDBManager(void);
    virtual ~cMovieDBManager(void);
    int ConnectDatabase(cDbConnection *conn);
    bool ConnectScraper(void);
    void ResetBytesDownloaded(void) { bytesDownloaded = 0; };
    int GetBytesDownloaded(void) { return bytesDownloaded; };
    bool GetMoviesFromEPG(vector<sMovieResult> *result);
    void ProcessMovie(sMovieResult mov);
    bool SearchRecordingDB(string name, int &movieId);
    bool SearchRecordingOnline(string name, int &movieId);
    bool CheckScrapInfoDB(int scrapMovieId);
    bool CheckScrapInfoOnline(int scrapMovieId);
    int CleanupMovies(void);
};


#endif //__TVSCRAPER_MOVIEDBMANAGER_H
