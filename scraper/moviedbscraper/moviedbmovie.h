#ifndef __TVSCRAPER_MOVIEDBMOVIE_H
#define __TVSCRAPER_MOVIEDBMOVIE_H

#include "moviedbactor.h"

using namespace std;

struct searchResult {
    int id;
    int distance;
};

// --- cMovieDbMovie -------------------------------------------------------------

class cMovieDbMovie {
private:
    string json;
    vector<searchResult> resultSet;
    string apiKey;
    string baseUrl;
    string posterBaseUrl;
    string backdropBaseUrl;
    string actorBaseUrl;
    vector<cMovieDBActor*> actors;
    int currentActor;
    int FindBestResult(void);
public:
    explicit cMovieDbMovie(string json);
    virtual ~cMovieDbMovie(void);
    int id;
    string title;
    string originalTitle;
    string tagline;
    string overview;
    string backdropPath;
    int backdropWidth;
    int backdropHeight;
    string posterPath;
    int posterWidth;
    int posterHeight;
    bool adult;
    int collectionID;
    string collectionName;
    string collectionPosterPath;
    string collectionBackdropPath;
    int budget;
    int revenue;
    string genres;
    string homepage;
    string imdbid;
    string releaseDate;
    int runtime;
    float popularity;
    float voteAverage;
    int ParseJSONForMovieId(string movieSearchString);
    void ParseJSON(void);
    void SetApiKey(const std::string& apiKey) { this->apiKey = apiKey; };
    void SetBaseUrl(const std::string& baseUrl) { this->baseUrl = baseUrl; };
    void SetPosterBaseUrl(const std::string& url) { posterBaseUrl = url; };
    void SetBackdropBaseUrl(const std::string& url) { backdropBaseUrl = url; };
    void SetActorBaseUrl(const std::string& url) { actorBaseUrl = url; };
    void ReadActors(void);
    cMovieDBActor *GetActor(void);
    void Dump();
};


#endif //__TVSCRAPER_TVDBSERIES_H
