
#pragma once

#include "moviedbmovie.h"
#include "moviedbactor.h"

using namespace std;

// --- cMovieDBScraper -------------------------------------------------------------

class cMovieDBScraper
{
private:
    string apiKey;
    string language;
    string baseURL;
    string imageUrl;
    string posterSize;
    string backdropSize;
    string actorthumbSize;
    bool parseJSON(string jsonString);
    int SearchMovie(string movieName, string year);
public:
    explicit cMovieDBScraper(string language);
    virtual ~cMovieDBScraper(void);
    bool Connect(void);
    cMovieDbMovie *Scrap(string movieName, string year="");
    cMovieDbMovie *ReadMovie(int movieID);
};
