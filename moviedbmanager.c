
#include "moviedbmanager.h"
#include "lib/curl.h"

extern const char* confDir;

using namespace std;

cMovieDBManager::cMovieDBManager(void) {
    connection = NULL;
    tMovies = NULL;
    tMoviesActor = NULL;
    tMoviesActors = NULL;
    tMovieMedia = NULL;
    tEvents = NULL;
    tRecordingList = NULL;
    movieDbScraper = NULL;

    withutf8 = no;
    bytesDownloaded = 0;
    exsltRegisterAll();
    setlocale(LC_CTYPE, "");
    char* lang;
    lang = setlocale(LC_CTYPE, 0);
    if (lang) {
        //tell(0, "Set locale to '%s'", lang);
        if ((strcasestr(lang, "UTF-8") != 0) || (strcasestr(lang, "UTF8") != 0)){
            //tell(0, "detected UTF-8");
            withutf8 = yes;
        }
    } else {
        //tell(0, "Reseting locale for LC_CTYPE failed.");
    }
    string loc = lang;
    size_t index = loc.find_first_of("_");
    string langISO = "";
    if (index > 0) {
        langISO = loc.substr(0, index);
    }
    if (langISO.size() == 2) {
        language = langISO.c_str();
    } else {
        language = "en";
    }
}

cMovieDBManager::~cMovieDBManager() {
    if (movieDbScraper)
        delete movieDbScraper;
    if (tMovies)
        delete tMovies;
    if (tMoviesActor)
        delete tMoviesActor;
    if (tMoviesActors)
        delete tMoviesActors;
    if (tMovieMedia)
        delete tMovieMedia;
    if (tEvents)
        delete tEvents;
    if (tRecordingList)
        delete tRecordingList;
}

int cMovieDBManager::ConnectDatabase(cDbConnection *conn) {
   int status;
    connection = conn;
    if (!connection)
        return fail;
    tMovies = new cDbTable(connection, "movie");
    if ((status = tMovies->open()) != success)
        return status;
    tMoviesActor = new cDbTable(connection, "movie_actor");
    if ((status = tMoviesActor->open()) != success)
        return status;
    tMoviesActors = new cDbTable(connection, "movie_actors");
    if ((status = tMoviesActors->open()) != success)
        return status;
    tMovieMedia = new cDbTable(connection, "movie_media");
    if ((status = tMovieMedia->open()) != success)
        return status;
    tEvents = new cDbTable(connection, "events");
    if ((status = tEvents->open()) != success)
        return status;
    tRecordingList = new cDbTable(connection, "recordinglist");
    if ((status = tRecordingList->open()) != success)
        return status;
    return success;
}

bool cMovieDBManager::ConnectScraper(void) {
    movieDbScraper = new cMovieDBScraper(language);
    bool ok = movieDbScraper->Connect();
    return ok;
}

bool cMovieDBManager::GetMoviesFromEPG(vector<sMovieResult> *result) {
    int status = success;
    cDbStatement *selectMovies = new cDbStatement(tEvents);
    selectMovies->build("select ");
    selectMovies->bind("EventId", cDBS::bndOut);
    selectMovies->bind("Title", cDBS::bndOut, ", ");
    selectMovies->bind("Year", cDBS::bndOut, ", ");
    selectMovies->bind("ScrSp", cDBS::bndOut, ", ");
    selectMovies->build(" from %s where ", tEvents->TableName());
    selectMovies->build(" category = 'Spielfilm'");
    selectMovies->build(" and %s is null", tEvents->getField("ScrSp")->getDbName());
    selectMovies->build(" and updflg in('A','T','C','P')");
    status += selectMovies->prepare();
    if (status != success) {
        delete selectMovies;
        return false;
    }
    for (int found = selectMovies->find(); found; found = selectMovies->fetch()) {
       sMovieResult res;
        res.eventId = tEvents->getBigintValue("EventId");
        res.title = tEvents->getStrValue("Title");
        res.year = tEvents->getStrValue("Year") ? tEvents->getStrValue("Year") : "";
        res.lastScraped = tEvents->getIntValue("ScrSp");
        result->push_back(res);
    }
    selectMovies->freeResult();
    delete selectMovies;
    return true;
}

void cMovieDBManager::ProcessMovie(sMovieResult mov) {
    //tell(0, "Checking eventID: %d, Title: %s, year %s", mov.eventId, mov.title.c_str(), mov.year.c_str());

    map<string, int>::iterator hit = alreadyScraped.find(mov.title);
    int movieID = 0;
    if (hit != alreadyScraped.end()) {
        movieID = (int)hit->second;
        if (movieID == 0) {
            //tell(0, "movie %s already scraped and nothing found", mov.title.c_str());
            return;
        } else {
            //tell(0, "found movie %s in cache, id %d", mov.title.c_str(), movieID);
        }
    }
    if (movieID == 0) {
        //check if movie is in database
        movieID = LoadMovieFromDB(mov.title);
        if (movieID != 0) {
            //tell(0, "movie %s already in db, id %d", mov.title.c_str(), movieID);
        } else {
            //scrap movie
            cMovieDbMovie *movie = movieDbScraper->Scrap(mov.title, mov.year);
            if (movie) {
                movieID = movie->id;
                movie->ReadActors();
                //tell(0, "movie %s successfully scraped, id %d", mov.title.c_str(), movieID);
                SaveMovie(movie);
                delete movie;
            } else {
                //tell(0, "movie %s not found at themoviedb.com", mov.title.c_str());
            }
        }
    }
    alreadyScraped.insert(pair<string, int>(mov.title, movieID));
    //updating event with movie data
    UpdateEvent(mov.eventId, movieID);
}

int cMovieDBManager::LoadMovieFromDB(string title) {
    int status = success;
    int movieID = 0;
    tMovies->clear();
    tMovies->setValue("Title", title.c_str());
    cDbStatement *select = new cDbStatement(tMovies);
    select->build("select ");
    select->bind("MovieId", cDBS::bndOut);
    select->build(" from %s where ", tMovies->TableName());
    select->bind("Title", cDBS::bndIn | cDBS::bndSet);
    status += select->prepare();
    if (status != success) {
        delete select;
        return movieID;
    }
    int res = select->find();
    if (res) {
        movieID = tMovies->getIntValue("MovieId");
    }
    select->freeResult();
    delete select;
    return movieID;
}

void cMovieDBManager::UpdateEvent(tEventId eventID, int movieID) {
   stringstream upd;
    upd << "update " << tEvents->TableName();
    upd << " set scrsp = " << time(0);
    upd << ", scrmovieid = " << movieID;
    upd << " where eventid = " << eventID;
    cDbStatement updStmt(connection, upd.str().c_str());
    updStmt.prepare();
    updStmt.execute();
}

void cMovieDBManager::SaveMovie(cMovieDbMovie *movie) {
    SaveMovieBasics(movie);
    SaveMovieMedia(movie);
    SaveMovieActors(movie);
}

void cMovieDBManager::SaveMovieBasics(cMovieDbMovie *movie) {
    tMovies->clear();
    tMovies->setValue("MovieId", movie->id);
    tMovies->setValue("Title", movie->title.c_str());
    tMovies->setValue("OriginalTitle", movie->originalTitle.c_str());
    tMovies->setValue("Tagline", movie->tagline.c_str());
    tMovies->setValue("Overview", movie->overview.c_str());
    tMovies->setValue("IsAdult", movie->adult?1:0);
    tMovies->setValue("CollectionId", movie->collectionID);
    tMovies->setValue("CollectionName", movie->collectionName.c_str());
    tMovies->setValue("Budget", movie->budget);
    tMovies->setValue("Revenue", movie->revenue);
    tMovies->setValue("Genres", movie->genres.c_str());
    tMovies->setValue("Homepage", movie->homepage.c_str());
    tMovies->setValue("ReleaaseDate", movie->releaseDate.c_str());
    tMovies->setValue("Runtime", movie->runtime);
    tMovies->setValue("Popularity", movie->popularity);
    tMovies->setValue("VoteAverage", movie->voteAverage);
    tMovies->store();
}

void cMovieDBManager::SaveMovieMedia(cMovieDbMovie *movie) {
    MemoryStruct data;
    if (movie->posterPath.size() > 10) {
        tMovieMedia->clear();
        tMovieMedia->setValue("MovieId", movie->id);
        tMovieMedia->setValue("ActorId", 0);
        tMovieMedia->setValue("MediaType", mtPoster);
        tMovieMedia->setValue("MediaUrl", movie->posterPath.c_str());
        tMovieMedia->setValue("MediaWidth", movie->posterWidth);
        tMovieMedia->setValue("MediaHeight", movie->posterHeight);
        if (GetPicture(movie->posterPath.c_str(), &data) == success) {
            tMovieMedia->setValue("MediaContent", data.memory, data.size);
            tMovieMedia->store();
        }
    }
    if (movie->backdropPath.size() > 10) {
        tMovieMedia->clear();
        tMovieMedia->setValue("MovieId", movie->id);
        tMovieMedia->setValue("ActorId", 0);
        tMovieMedia->setValue("MediaType", mtFanart);
        tMovieMedia->setValue("MediaUrl", movie->backdropPath.c_str());
        tMovieMedia->setValue("MediaWidth", movie->backdropWidth);
        tMovieMedia->setValue("MediaHeight", movie->backdropHeight);
        if (GetPicture(movie->backdropPath.c_str(), &data) == success) {
            tMovieMedia->setValue("MediaContent", data.memory, data.size);
            tMovieMedia->store();
        }
    }
    if (movie->collectionPosterPath.size() > 10) {
        tMovieMedia->clear();
        tMovieMedia->setValue("MovieId", movie->id);
        tMovieMedia->setValue("ActorId", 0);
        tMovieMedia->setValue("MediaType", mtCollectionPoster);
        tMovieMedia->setValue("MediaUrl", movie->collectionPosterPath.c_str());
        tMovieMedia->setValue("MediaWidth", movie->posterWidth);
        tMovieMedia->setValue("MediaHeight", movie->posterHeight);
        if (GetPicture(movie->collectionPosterPath.c_str(), &data) == success) {
            tMovieMedia->setValue("MediaContent", data.memory, data.size);
            tMovieMedia->store();
        }
    }
    if (movie->collectionBackdropPath.size() > 10) {
        tMovieMedia->clear();
        tMovieMedia->setValue("MovieId", movie->id);
        tMovieMedia->setValue("ActorId", 0);
        tMovieMedia->setValue("MediaType", mtCollectionFanart);
        tMovieMedia->setValue("MediaUrl", movie->collectionBackdropPath.c_str());
        tMovieMedia->setValue("MediaWidth", movie->backdropWidth);
        tMovieMedia->setValue("MediaHeight", movie->backdropHeight);
        if (GetPicture(movie->collectionBackdropPath.c_str(), &data) == success) {
            tMovieMedia->setValue("MediaContent", data.memory, data.size);
            tMovieMedia->store();
        }
    }
}

void cMovieDBManager::SaveMovieActors(cMovieDbMovie *movie) {
    cMovieDBActor *actor = NULL;
    while ((actor = movie->GetActor())) {
        tMoviesActor->clear();
        tMoviesActor->setValue("ActorId", actor->id);
        tMoviesActor->setValue("ActorName", actor->name.c_str());
        tMoviesActor->store();
        tMoviesActors->clear();
        tMoviesActors->setValue("MovieId", movie->id);
        tMoviesActors->setValue("ActorId", actor->id);
        tMoviesActors->setValue("Role", actor->role.c_str());
        tMoviesActors->store();
        bool mediaExists = LoadMedia(0, actor->id, mtActorThumb);
        if (!mediaExists) {
            tMovieMedia->clear();
            tMovieMedia->setValue("MovieId", 0);
            tMovieMedia->setValue("ActorId", actor->id);
            tMovieMedia->setValue("MediaType", mtActorThumb);
            tMovieMedia->setValue("MediaUrl", actor->thumbUrl.c_str());
            tMovieMedia->setValue("MediaWidth", actor->width);
            tMovieMedia->setValue("MediaHeight", actor->height);
            MemoryStruct data;
            if (GetPicture(actor->thumbUrl.c_str(), &data) == success) {
                tMovieMedia->setValue("MediaContent", data.memory, data.size);
                tMovieMedia->store();
            }
        }
    }
}

bool cMovieDBManager::LoadMedia(int movieId, int actorId, int mediaType) {
    tMovieMedia->clear();
    tMovieMedia->setValue("MovieId", movieId);
    tMovieMedia->setValue("ActorId", actorId);
    tMovieMedia->setValue("MediaType", mediaType);
    int found = tMovieMedia->find();
    if (found == yes)
        return true;
    return false;
}

int cMovieDBManager::GetPicture(const char* url, MemoryStruct* data) {
   int maxSize = tMovieMedia->getField("MediaContent")->getSize();
    data->clear();
    int fileSize = 0;
    if (curl.downloadFile(url, fileSize, data) == success) {
        bytesDownloaded += fileSize;
        if (fileSize < maxSize)
            return success;
    }
    return fail;
}

int cMovieDBManager::CleanupMovies(void) {
    int numDelete = 0;
    set<int> activeMovieIds;
    int status = success;
    //fetching movieIds from current events
    cDbStatement *selectMovieIds = new cDbStatement(tEvents);
    selectMovieIds->build("select distinct ");
    selectMovieIds->bind("ScrMovieId", cDBS::bndOut);
    selectMovieIds->build(" from %s where ", tEvents->TableName());
    selectMovieIds->build(" %s is not null ", tEvents->getField("ScrMovieId")->getDbName());
    selectMovieIds->build(" and %s > 0 ", tEvents->getField("ScrMovieId")->getDbName());
    status += selectMovieIds->prepare();
    if (status != success) {
        delete selectMovieIds;
        return numDelete;
    }
    tEvents->clear();

    for (int res = selectMovieIds->find(); res; res = selectMovieIds->fetch()) {
        activeMovieIds.insert(tEvents->getIntValue("ScrMovieId"));
    }

    selectMovieIds->freeResult();
    delete selectMovieIds;

    //fetching movieIds from recordings
    cDbStatement *selectMovieIdsRec = new cDbStatement(tRecordingList);
    selectMovieIdsRec->build("select distinct ");
    selectMovieIdsRec->bind("SCRMOVIEID", cDBS::bndOut);
    selectMovieIdsRec->build(" from %s where ", tRecordingList->TableName());
    selectMovieIdsRec->build(" %s is not null ", tRecordingList->getField("SCRMOVIEID")->getDbName());
    selectMovieIdsRec->build(" and %s > 0 ", tRecordingList->getField("SCRMOVIEID")->getDbName());
    status += selectMovieIdsRec->prepare();
    if (status != success) {
        delete selectMovieIdsRec;
        return numDelete;
    }
    tRecordingList->clear();
    for (int res = selectMovieIdsRec->find(); res; res = selectMovieIdsRec->fetch()) {
        activeMovieIds.insert(tRecordingList->getIntValue("SCRMOVIEID"));
    }
    selectMovieIdsRec->freeResult();
    delete selectMovieIdsRec;

    //fetching all movieIds from movie table
    vector<int> storedMovieIds;
    cDbStatement *selectStoredMovieIds = new cDbStatement(tMovies);
    selectStoredMovieIds->build("select ");
    selectStoredMovieIds->bind("MovieId", cDBS::bndOut);
    selectStoredMovieIds->build(" from %s where ", tMovies->TableName());
    selectStoredMovieIds->build(" %s is not null ", tMovies->getField("MovieId")->getDbName());
    selectStoredMovieIds->build(" and %s > 0 ", tMovies->getField("MovieId")->getDbName());
    status += selectStoredMovieIds->prepare();
    if (status != success) {
        delete selectStoredMovieIds;
        return numDelete;
    }
    tMovies->clear();

    for (int res = selectStoredMovieIds->find(); res; res = selectStoredMovieIds->fetch()) {
        storedMovieIds.push_back(tMovies->getIntValue("MovieId"));
    }
    selectStoredMovieIds->freeResult();
    delete selectStoredMovieIds;

    numDelete = storedMovieIds.size() - activeMovieIds.size();
    if (numDelete < 1)
        return numDelete;
    for (vector<int>::iterator mId = storedMovieIds.begin(); mId != storedMovieIds.end(); mId++) {
        set<int>::iterator hit = activeMovieIds.find(*mId);
        if (hit == activeMovieIds.end()) {
            DeleteMovie(*mId);
        }
    }
    return numDelete;
}

void cMovieDBManager::DeleteMovie(int movieId) {
    if (movieId < 1)
        return;
    stringstream delMovieActors;
    delMovieActors << "delete from " << tMoviesActors->TableName();
    delMovieActors << " where " << tMoviesActors->getField("MovieId")->getDbName();
    delMovieActors << " = " << movieId;

    cDbStatement delActors(connection, delMovieActors.str().c_str());
    delActors.prepare();
    delActors.execute();

    stringstream delMovieMedia;
    delMovieMedia << "delete from " << tMovieMedia->TableName();
    delMovieMedia << " where " << tMovieMedia->getField("MovieId")->getDbName();
    delMovieMedia << " = " << movieId;

    cDbStatement delMedia(connection, delMovieMedia.str().c_str());
    delMedia.prepare();
    delMedia.execute();

    stringstream delMovie;
    delMovie << "delete from " << tMovies->TableName();
    delMovie << " where " << tMovies->getField("MovieId")->getDbName();
    delMovie << " = " << movieId;

    cDbStatement delMov(connection, delMovie.str().c_str());
    delMov.prepare();
    delMov.execute();
}

bool cMovieDBManager::SearchRecordingDB(string name, int &movieId)
{
    int status = success;
    cDbStatement *select = new cDbStatement(tMovies);

    select->build("select ");
    select->bind("MovieId", cDBS::bndOut);
    select->build(" from %s where ", tMovies->TableName());
    select->bind("Title", cDBS::bndIn | cDBS::bndSet);
    status += select->prepare();

    if (status != success)
    {
        delete select;
        return false;
    }

    tMovies->clear();
    tMovies->setValue("Title", name.c_str());
    int found = select->find();

    if (found)
       movieId = tMovies->getIntValue("MovieId");

    select->freeResult();
    delete select;

    return found;
}

bool cMovieDBManager::SearchRecordingOnline(string name, int &movieId)
{
    cMovieDbMovie *movieRec = movieDbScraper->Scrap(name);

    if (!movieRec)
        movieRec = SearchRecordingSophisticated(name);

    if (movieRec)
    {
        movieRec->ReadActors();
        SaveMovie(movieRec);
        movieId = movieRec->id;
        delete movieRec;
        return true;
    }

    return false;
}

cMovieDbMovie *cMovieDBManager::SearchRecordingSophisticated(string name) {
    cMovieDbMovie *movieFound = NULL;
    size_t posHyphen  = name.find_first_of("-");
    size_t posBracket = name.find_first_of("(");
    bool hasHyphen  = (posHyphen  != string::npos)?true:false;
    bool hasBracket = (posBracket != string::npos)?true:false;
    string nameMod;
    //first remove all "-"
    if (hasBracket) {
        nameMod = str_replace("-", " ", name);
        movieFound = movieDbScraper->Scrap(nameMod);
        if (movieFound)
            return movieFound;
    }
    //if both hyphens and brackets found, check what comes first
    if (hasHyphen && hasBracket) {
        //if bracket comes after hyphen, remove bracket first
        if (posBracket > posHyphen) {
            nameMod = str_cut("(", name);
            if (nameMod.size() > 3) {
                movieFound = movieDbScraper->Scrap(nameMod);
                if (movieFound)
                    return movieFound;
            }
            nameMod = str_cut("-", name);
            if (nameMod.size() > 3) {
                movieFound = movieDbScraper->Scrap(nameMod);
            }
        } else {
            nameMod = str_cut("-", name);
            if (nameMod.size() > 3) {
                movieFound = movieDbScraper->Scrap(nameMod);
                if (movieFound)
                    return movieFound;
            }
            nameMod = str_cut("(", name);
            if (nameMod.size() > 3) {
                movieFound = movieDbScraper->Scrap(nameMod);
            }
        }
    } else if (hasHyphen) {
        nameMod = str_cut("-", name);
        if (nameMod.size() > 3) {
            movieFound = movieDbScraper->Scrap(nameMod);
        }
    } else if (hasBracket) {
        nameMod = str_cut("(", name);
        if (nameMod.size() > 3) {
            movieFound = movieDbScraper->Scrap(nameMod);
        }
    }
    return movieFound;
}

bool cMovieDBManager::CheckScrapInfoDB(int scrapMovieId) {
    //check if movie is in db
    tMovies->clear();
    tMovies->setValue("MovieId", scrapMovieId);
    int found = tMovies->find();
    if (!found)
        return false;
    return true;
}

bool cMovieDBManager::CheckScrapInfoOnline(int scrapMovieId) {
    cMovieDbMovie *movieRec = movieDbScraper->ReadMovie(scrapMovieId);
    if (!movieRec)
        return false;
    movieRec->ReadActors();
    SaveMovie(movieRec);
    delete movieRec;
    return true;
}
