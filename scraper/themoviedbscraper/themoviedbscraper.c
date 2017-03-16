
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <algorithm>
#include <iostream>
#include <jansson.h>

#include "../../lib/curl.h"
#include "../../tools/stringhelpers.h"
#include "../../epgdconfig.h"
#include "themoviedbscraper.h"

using namespace std;

cMovieDBScraper::cMovieDBScraper(string language)
{
   apiKey = EpgdConfig.scrapMovieDbApiKey; // "abb01b5a277b9c2c60ec0302d83c5ee9";
   this->language = language;
   baseURL = "api.themoviedb.org/3";
   posterSize = "w500";
   backdropSize = "w1280";
   actorthumbSize = "h632";
}

cMovieDBScraper::~cMovieDBScraper() {
}

cMovieDbMovie *cMovieDBScraper::Scrap(string movieName, string year) {
    int movieID = SearchMovie(movieName, year);
    if (movieID < 1) {
        return NULL;
    }
    cMovieDbMovie *movie = ReadMovie(movieID);
    if (!movie)
        return NULL;
    return movie;
}

bool cMovieDBScraper::Connect(void) {
    stringstream url;
    url << baseURL << "/configuration?api_key=" << apiKey;
    string configJSON;
    if (curl.GetUrl(url.str().c_str(), &configJSON)) {
        return parseJSON(configJSON);
    }
    return false;
}

bool cMovieDBScraper::parseJSON(string jsonString) {
    cJsonLoader root(jsonString.c_str());
    if (!root.isObject()) {
        return false;
    }
    json_t *images = root.objectByName("images");
    if(!json_is_object(images)) {
        return false;
    }

    json_t *imgUrl;
    imgUrl = json_object_get(images, "base_url");
    if(!json_is_string(imgUrl)) {
        return false;
    }
    imageUrl = json_string_value(imgUrl);
    return true;
}

int cMovieDBScraper::SearchMovie(string movieName, string year) {
    stringstream url;
    string movieJSON;
    int movieID = -1;
    char* escUrl = curl.EscapeUrl(movieName.c_str());

    url << baseURL << "/search/movie?api_key=" << apiKey << "&query=" << escUrl << "&language=" << language.c_str();
    if (year.size() > 0)
        url << "&year=" << year.c_str();
    curl.Free(escUrl);

    if (curl.GetUrl(url.str().c_str(), &movieJSON)) {
        cMovieDbMovie movie(movieJSON);
        movieID = movie.ParseJSONForMovieId(movieName);
    }

    return movieID;
}

cMovieDbMovie *cMovieDBScraper::ReadMovie(int movieID) {
    stringstream url;
    url << baseURL << "/movie/" << movieID << "?api_key=" << apiKey << "&language=" << language.c_str();
    string movieJSON;
    cMovieDbMovie *movie = NULL;
    if (curl.GetUrl(url.str().c_str(), &movieJSON)) {
        movie = new cMovieDbMovie(movieJSON);
        movie->id = movieID;
        movie->SetBaseUrl(baseURL);
        movie->SetApiKey(apiKey);
        movie->SetPosterBaseUrl(imageUrl + posterSize);
        movie->SetBackdropBaseUrl(imageUrl + backdropSize);
        movie->SetActorBaseUrl(imageUrl + actorthumbSize);
        movie->ParseJSON();
    }
    return movie;
}
