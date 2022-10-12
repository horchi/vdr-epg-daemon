
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
#include <iostream>
#include <jansson.h>

#include "../../lib/curl.h"
#include "../../tools/fuzzy.h"
#include "../../tools/stringhelpers.h"
#include "moviedbmovie.h"

using namespace std;

cMovieDbMovie::cMovieDbMovie(string json) {
    this->json = json;
    title = "";
    originalTitle = "";
    tagline = "";
    overview = "";
    backdropPath = "";
    posterPath = "";
    adult = false;
    collectionID = 0;
    collectionName = "";
    collectionPosterPath = "";
    collectionBackdropPath = "";
    budget = 0;
    revenue = 0;
    genres = "";
    homepage = "";
    imdbid = "";
    releaseDate = "";
    runtime = 0;
    popularity = 0.0;
    voteAverage = 0.0;
    currentActor = 0;
    backdropWidth = 1280;
    backdropHeight = 720;
    posterWidth = 500;
    posterHeight = 750;
}

cMovieDbMovie::~cMovieDbMovie() {
    for(std::vector<cMovieDBActor*>::const_iterator it = actors.begin(); it != actors.end(); it++) {
        delete *it;
    }
    actors.clear();
}

void cMovieDbMovie::ParseJSON(void) {
    cJsonLoader jMovie(json.c_str());
    if (!jMovie.isObject()) {
        return;
    }
    json_t *jTitle = jMovie.objectByName("title");
    if(json_is_string(jTitle)) {
        title = json_string_value(jTitle);;
    }
    json_t *jOriginalTitle = jMovie.objectByName("original_title");
    if(json_is_string(jOriginalTitle)) {
        originalTitle = json_string_value(jOriginalTitle);
    }
    json_t *jOverview = jMovie.objectByName("overview");
    if(json_is_string(jOverview)) {
        overview = json_string_value(jOverview);
    }
    json_t *jBackdrop = jMovie.objectByName("backdrop_path");
    if(json_is_string(jBackdrop)) {
        backdropPath = backdropBaseUrl + json_string_value(jBackdrop);
    }
    json_t *jPoster = jMovie.objectByName("poster_path");
    if(json_is_string(jPoster)) {
        posterPath = posterBaseUrl + json_string_value(jPoster);
    }
    json_t *jAdult = jMovie.objectByName("adult");
    if(json_is_true(jAdult)) {
        adult = true;
    }
    json_t *collection = jMovie.objectByName("belongs_to_collection");
    if(json_is_object(collection)) {
        json_t *colID = json_object_get(collection, "id");
        if (json_is_integer(colID)) {
            collectionID = (int)json_integer_value(colID);
        }
        json_t *colName = json_object_get(collection, "name");
        if(json_is_string(jPoster)) {
            collectionName = json_string_value(colName);
        }
        json_t *colPoster = json_object_get(collection, "poster_path");
        if(json_is_string(colPoster)) {
            collectionPosterPath = posterBaseUrl + json_string_value(colPoster);
        }
        json_t *colBackdrop = json_object_get(collection, "backdrop_path");
        if(json_is_string(colBackdrop)) {
            collectionBackdropPath = backdropBaseUrl + json_string_value(colBackdrop);
        }
    }
    json_t *jBudget = jMovie.objectByName("budget");
    if (json_is_integer(jBudget)) {
        budget = (int)json_integer_value(jBudget);
    }
    json_t *aGenres = jMovie.objectByName("genres");
    if(json_is_array(aGenres)) {
        size_t numGenres = json_array_size(aGenres);
        for (size_t res = 0; res < numGenres; res++) {
            json_t *result = json_array_get(aGenres, res);
            if (json_is_object(result)) {
                json_t *jGenre = json_object_get(result, "name");
                if(json_is_string(jGenre)) {
                    genres += json_string_value(jGenre);
                    if ((res+1) < numGenres)
                        genres += " | ";
                }
            }
        }
    }
    json_t *jHomepage = jMovie.objectByName("homepage");
    if(json_is_string(jHomepage)) {
        homepage = json_string_value(jHomepage);
    }
    json_t *jIMDB = jMovie.objectByName("imdb_id");
    if(json_is_string(jIMDB)) {
        imdbid = json_string_value(jIMDB);
    }
    json_t *jPopularity = jMovie.objectByName("popularity");
    if(json_is_real(jPopularity)) {
        popularity = json_real_value(jPopularity);
    }
    json_t *jReleaseDate = jMovie.objectByName("release_date");
    if(json_is_string(jReleaseDate)) {
        releaseDate = json_string_value(jReleaseDate);
    }
    json_t *jRevenue = jMovie.objectByName("revenue");
    if (json_is_integer(jRevenue)) {
        revenue = (int)json_integer_value(jRevenue);
    }
    json_t *jRuntime = jMovie.objectByName("runtime");
    if (json_is_integer(jRuntime)) {
        runtime = (int)json_integer_value(jRuntime);
    }
    json_t *jVote = jMovie.objectByName("vote_average");
    if(json_is_real(jVote)) {
        voteAverage = json_real_value(jVote);
    }
    json_t *jTagline = jMovie.objectByName("tagline");
    if(json_is_string(jTagline)) {
        tagline = json_string_value(jTagline);
    }
}

int cMovieDbMovie::ParseJSONForMovieId(string movieSearchString) {
    //convert searchstring to lower case
    transform(movieSearchString.begin(), movieSearchString.end(), movieSearchString.begin(), ::tolower);
    cJsonLoader root(json.c_str());
    if (!root.isObject()) {
        return -1;
    }
    json_t *results = root.objectByName("results");
    if(!json_is_array(results)) {
        return -1;
    }
    size_t numResults = json_array_size(results);
    for (size_t res = 0; res < numResults; res++) {
        json_t *result = json_array_get(results, res);
        if (!json_is_object(result)) {
            return -1;
        }
        json_t *title = json_object_get(result, "title");
        if (!json_is_string(title)) {
            return -1;
        }
        string resultTitle = json_string_value(title);
        //convert result to lower case
        transform(resultTitle.begin(), resultTitle.end(), resultTitle.begin(), ::tolower);
        json_t *jId = json_object_get(result, "id");
        if (json_is_integer(jId)) {
            int id = (int)json_integer_value(jId);
            searchResult sRes;
            sRes.id = id;
            sRes.distance = sentence_distance(resultTitle, movieSearchString);
            resultSet.push_back(sRes);
        }
    }
    return FindBestResult();
}

int cMovieDbMovie::FindBestResult(void) {
    int resID = -1;
    int bestMatch = -1;
    int numResults = resultSet.size();
    for (int i=0; i<numResults; i++) {
        if (i == 0) {
            bestMatch = resultSet[i].distance;
            resID = resultSet[i].id;
        } else if (resultSet[i].distance < bestMatch) {
            bestMatch = resultSet[i].distance;
            resID = resultSet[i].id;
        }
    }
    return resID;
}

void cMovieDbMovie::ReadActors(void) {
    stringstream url;
    url << baseUrl << "/movie/" << id << "/casts?api_key=" << apiKey;
    string actorsJSON;
    if (curl.GetUrl(url.str().c_str(), &actorsJSON)) {
        cMovieDbActors act(actorsJSON, actorBaseUrl);
        act.ParseJSON(&actors);
    }
}

cMovieDBActor *cMovieDbMovie::GetActor(void) {
    int numActors = actors.size();
    if ((numActors < 1) || (currentActor >= numActors))
        return NULL;
    cMovieDBActor *act = actors[currentActor];
    currentActor++;
    return act;
}

void cMovieDbMovie::Dump(void) {
    cout << "-------------- MOVIE DUMP ---------------" << endl;
    cout << "Title: " << title << endl;
    cout << "Original Title: " << originalTitle << endl;
    cout << "Tagline: " << tagline << endl;
    cout << "Overview: " << overview << endl;
    cout << "BackdropPath: " << backdropPath << endl;
    cout << "PosterPath: " << posterPath << endl;
    cout << "Adult: " << (adult?"true":"false") << endl;
    if (!collectionID) {
        cout << "Movie belongs not to a collection" << endl;
    } else {
        cout << "CollectionID: " << collectionID << endl;
        cout << "Collection Name: " << collectionName << endl;
        cout << "Collection BackdropPath: " << collectionBackdropPath << endl;
        cout << "Collection PosterPath: " <<  collectionPosterPath << endl;
    }
    cout << "Budget: " << budget << "$" << endl;
    cout << "Revenue: " << revenue << "$" << endl;
    cout << "Genres: " << genres << endl;
    cout << "Homepage: " << homepage << endl;
    cout << "imdbID: " << imdbid << endl;
    cout << "Release Date: " << releaseDate << endl;
    cout << "Runtime: " << runtime << " min" << endl;
    cout << "Popularity: " << popularity << endl;
    cout << "Vote Average: " << voteAverage << endl;
    int numActors = actors.size();
    cout << "--------------------- " << numActors << " actors found -----------------" << endl;
    for (int i=0; i<numActors; i++) {
        actors[i]->Dump();
    }
}
