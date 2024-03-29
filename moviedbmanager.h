
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

#include "scraper/moviedbscraper/themoviedbscraper.h"
#include "scraper/moviedbscraper/moviedbmovie.h"
#include "scraper/moviedbscraper/moviedbactor.h"

#include "epgdconfig.h"

struct sMovieResult
{
    tEventId eventId {0};
    std::string title;
    std::string year;
    int lastScraped {0};
};

// --- cMovieDBManager -------------------------------------------------------------

class cMovieDBManager
{
private:

    long long bytesDownloaded {0};
    int withutf8 {no};
    std::string language {"en"};
    map<std::string,int> alreadyScraped;
    cMovieDBScraper* movieDbScraper {};
    cDbConnection* connection {};
    cDbTable* tMovies {};
    cDbTable* tMoviesActor {};
    cDbTable* tMoviesActors {};
    cDbTable* tMovieMedia {};
    cDbTable* tEvents {};
    cDbTable* tRecordingList {};

    enum mediaType
    {
       mtPoster,
       mtFanart,
       mtCollectionPoster,
       mtCollectionFanart,
       mtActorThumb
    };

    int LoadMovieFromDB(const std::string& title);
    void UpdateEvent(tEventId eventID, int movieID);
    void SaveMovie(cMovieDbMovie *movie);
    void SaveMovieBasics(cMovieDbMovie *movie);
    void SaveMovieMedia(cMovieDbMovie *movie);
    void SaveMovieActors(cMovieDbMovie *movie);
    bool LoadMedia(int movieId, int actorId, int mediaType);
    int GetPicture(const char* url, MemoryStruct* data);
    void DeleteMovie(int movieId);
    cMovieDbMovie *SearchRecordingSophisticated(const std::string& name);

public:

    cMovieDBManager();
    virtual ~cMovieDBManager();

    int ConnectDatabase(cDbConnection *conn);
    bool ConnectScraper();
    void ResetBytesDownloaded() { bytesDownloaded = 0; };
    long long GetBytesDownloaded() { return bytesDownloaded; };
    bool GetMoviesFromEPG(vector<sMovieResult> *result);
    void ProcessMovie(sMovieResult mov);
    bool SearchRecordingDB(const std::string& name, int &movieId);
    bool SearchRecordingOnline(const std::string& name, int &movieId);
    bool CheckScrapInfoDB(int scrapMovieId);
    bool CheckScrapInfoOnline(int scrapMovieId);
    int CleanupMovies();
};
