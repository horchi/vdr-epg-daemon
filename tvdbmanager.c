/*
 * tvdbmanager.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "tvdbmanager.h"
#include "epgd.h"
#include "lib/curl.h"

extern const char* confDir;

using namespace std;

cTVDBManager::cTVDBManager(void) {
    bytesDownloaded = 0;
    serverTime = 0;
    tvdbScraper = NULL;
    connection = NULL;
    tSeries = NULL;
    tSeriesEpsiode = NULL;
    tSeriesMedia = NULL;
    tSeriesActor = NULL;
    tEvents = NULL;
    tEpisodes = NULL;
    tRecordingList = NULL;

    withutf8 = no;
    exsltRegisterAll();
    setlocale(LC_CTYPE, "");
    char* lang;
    lang = setlocale(LC_CTYPE, 0);
    if (lang) {
        if ((strcasestr(lang, "UTF-8") != 0) || (strcasestr(lang, "UTF8") != 0)){
            withutf8 = yes;
        }
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
    tell(0, "Using scraping language %s", language.c_str());
}

cTVDBManager::~cTVDBManager() {
    if (tvdbScraper)
        delete tvdbScraper;
    if (tSeries)
       delete tSeries;
    if (tSeriesEpsiode)
       delete tSeriesEpsiode;
    if (tSeriesMedia)
        delete tSeriesMedia;
    if (tSeriesActor)
        delete tSeriesActor;
    if (tEvents)
        delete tEvents;
    if (tEpisodes)
        delete tEpisodes;
    if (tRecordingList)
        delete tRecordingList;
}

int cTVDBManager::ConnectDatabase(cDbConnection *conn) {
    int status;
    connection = conn;
    if (!connection)
       return fail;
    tSeries = new cDbTable(connection, "series");
    if ((status = tSeries->open()) != success)
        return status;
    tSeriesEpsiode = new cDbTable(connection, "series_episode");
    if ((status = tSeriesEpsiode->open()) != success)
        return status;
    tSeriesMedia = new cDbTable(connection, "series_media");
    if ((status = tSeriesMedia->open()) != success)
        return status;
    tSeriesActor = new cDbTable(connection, "series_actor");
    if ((status = tSeriesActor->open()) != success)
        return status;
    tEvents = new cDbTable(connection, "events");
    if ((status = tEvents->open()) != success)
        return status;
    tEpisodes = new cDbTable(connection, "episodes");
    if ((status = tEpisodes->open()) != success)
        return status;
    tRecordingList = new cDbTable(connection, "recordinglist");
    if ((status = tRecordingList->open()) != success)
        return status;
    return success;
}

bool cTVDBManager::ConnectScraper(void) {
    tvdbScraper = new cTVDBScraper(language);
    bool ok = tvdbScraper->Connect();
    return ok;
}

void cTVDBManager::SetServerTime(void) {
    serverTime = tvdbScraper->GetServerTime();
}

void cTVDBManager::UpdateSeries(void) {
    set<int> updatedSeries;
    set<int> updatedEpisodes;
    set<int> storedSeries;
    set<int> storedEpisodes;
    int lastScrap = GetLastScrap();
    if (lastScrap < 1)
        return;
    bool ok = tvdbScraper->GetUpdatedSeriesandEpisodes(&updatedSeries, &updatedEpisodes, lastScrap);
    if (!ok) return;
    ok = GetAllIDs(&storedSeries, tSeries, "SeriesId");
    if (!ok) return;
    ok = GetAllIDs(&storedEpisodes, tSeriesEpsiode, "EpisodeId");
    if (!ok) return;

    set<int> scrapSeriesIDs;
    set<int> scrapEpisodeIDs;
    set_intersection(updatedSeries.begin(), updatedSeries.end(), storedSeries.begin(),
                     storedSeries.end(), std::inserter(scrapSeriesIDs, scrapSeriesIDs.begin()));
    set_intersection(updatedEpisodes.begin(), updatedEpisodes.end(), storedEpisodes.begin(),
                     storedEpisodes.end(), std::inserter(scrapEpisodeIDs, scrapEpisodeIDs.begin()));

    tell(0, "%ld updated Series, %ld updatedEpisodes", updatedSeries.size(), updatedEpisodes.size());
    tell(0, "%ld series to update in db, %ld episodes to update in db", scrapSeriesIDs.size(), scrapEpisodeIDs.size());
    int seriesCur = 1;
    for (set<int>::iterator it = scrapSeriesIDs.begin(); !cEpgd::doShutDown() && it != scrapSeriesIDs.end(); it++) {
        if (seriesCur%10 == 0)
            tell(0, "ReScraped %d series...continuing rescraping", seriesCur);
        cTVDBSeries *series = ScrapSeries(*it);
        if (series) {
            SaveSeries(series);
        }
        delete series;
        seriesCur++;
    }
    if (seriesCur > 1)
        tell(0, "ReScraped %d series", seriesCur-1);

    int episodeCur = 1;
    for (set<int>::iterator it = scrapEpisodeIDs.begin(); !cEpgd::doShutDown() && it != scrapEpisodeIDs.end(); it++) {
        if (episodeCur%10 == 0)
            tell(0, "ReScraped %d Episodes...continuing rescraping", episodeCur);
        cTVDBEpisode *episode = tvdbScraper->GetEpisode(*it);
        episode->ReadEpisode();
        SaveSeriesEpisode(episode);
        delete episode;
        episodeCur++;
    }
    if (episodeCur > 1)
        tell(0, "ReScraped %d Episodes", episodeCur-1);

    UpdateScrapTS();
}

int cTVDBManager::GetLastScrap(void) {
    int status = success;
    int lastScraped = 0;
    cDbStatement *selectTime = new cDbStatement(tSeries);
    selectTime->build("select ");
    selectTime->bind("SeriesLastScraped", cDBS::bndOut);
    selectTime->build(" from %s", tSeries->TableName());
    status += selectTime->prepare();
    if (status != success) {
        delete selectTime;
        return 0;
    }
    for (int res = selectTime->find(); res; res = selectTime->fetch()) {
        lastScraped = tSeries->getIntValue("SeriesLastScraped");
        break;
    }
    selectTime->freeResult();
    delete selectTime;
    return lastScraped;

}

void cTVDBManager::UpdateScrapTS(void) {
    stringstream upd;
    upd << "update " << tSeries->TableName() << " set series_last_scraped=" << serverTime << " where series_id > 0";
    cDbStatement updStmt(connection, upd.str().c_str());
    updStmt.prepare();
    updStmt.execute();
}

bool cTVDBManager::GetAllIDs(set<int> *IDs, cDbTable *table, const char* fname) {
    int status = success;
    cDbStatement *selectIDs = new cDbStatement(table);
    selectIDs->build("select ");
    selectIDs->bind(fname, cDBS::bndOut);
    selectIDs->build(" from %s", table->TableName());
    status += selectIDs->prepare();
    if (status != success) {
        delete selectIDs;
        return false;
    }
    for (int res = selectIDs->find(); res; res = selectIDs->fetch()) {
        IDs->insert(table->getIntValue(fname));
    }
    selectIDs->freeResult();
    delete selectIDs;
    return true;
}

cTVDBSeries *cTVDBManager::ScrapSeries(string search) {
    cTVDBSeries *series = tvdbScraper->ScrapInitial(search);
    if (!series) {
        return NULL;
    }
    series->ReadSeries();
    series->ReadMedia();
    series->ReadActors();
    return series;
}

cTVDBSeries *cTVDBManager::ScrapSeries(int seriesID) {
    cTVDBSeries *series = tvdbScraper->GetSeries(seriesID);
    if (!series->ReadSeries()) {
        delete series;
        return NULL;
    }
    series->ReadMedia();
    series->ReadActors();
    return series;
}

void cTVDBManager::SaveSeries(cTVDBSeries *series) {
    if (!series)
        return;
    SaveSeriesBasics(series);
    SaveSeriesMedia(series);
    SaveSeriesEpisodes(series);
    SaveSeriesActors(series);
}

void cTVDBManager::SaveSeriesBasics(cTVDBSeries *series) {
    tSeries->clear();
    tSeries->setValue("SeriesId", series->seriesID);
    tSeries->setValue("SeriesName", series->name.c_str());
    tSeries->setValue("SeriesLastScraped", serverTime);
    tSeries->setValue("SeriesLastUpdated", series->lastUpdated);
    tSeries->setValue("SeriesOverview", series->overview.c_str());
    tSeries->setValue("SeriesFirstAired", series->firstAired.c_str());
    tSeries->setValue("SeriesIMDBId", series->imbdid.c_str());
    tSeries->setValue("SeriesGenre", series->genre.c_str());
    tSeries->setValue("SeriesRating", series->rating);
    tSeries->setValue("SeriesStatus", series->status.c_str());
    tSeries->setValue("SeriesNetwork", series->network.c_str());
    tSeries->store();
}

void cTVDBManager::SaveSeriesMedia(cTVDBSeries *series) {
    cTVDBFanart *fanart = NULL;
    int num = 0;
    while((fanart = series->GetFanart())) {
        int mediaType = (num==0)?mtFanart1:((num==1)?mtFanart2:mtFanart3);
        bool mediaExists = LoadMedia(series->seriesID, 0, 0, 0, mediaType);
        bool reloadImage = mediaExists ? ReloadImage(fanart->url) : true;
        if (!reloadImage) {
            num++;
            if (num>2) break;
            continue;
        }
        bool ok = SavePosterBannerFanart(mediaType, fanart, series->seriesID);
        if (ok)
            num++;
        if (num>2) break;
    }

    cTVDBPoster *poster = NULL;
    num = 0;
    while((poster = series->GetPoster())) {
        int mediaType = (num==0)?mtPoster1:((num==1)?mtPoster2:mtPoster3);
        bool mediaExists = LoadMedia(series->seriesID, 0, 0, 0, mediaType);
        bool reloadImage = mediaExists ? ReloadImage(poster->url) : true;
        if (!reloadImage) {
            num++;
            if (num>2) break;
            continue;
        }
        bool ok = SavePosterBannerFanart(mediaType, poster, series->seriesID);
        if (ok)
            num++;
        if (num>2) break;
    }

    cTVDBBanner *banner = NULL;
    num = 0;
    while((banner = series->GetBanner())) {
        int mediaType = (num==0)?mtBanner1:((num==1)?mtBanner2:mtBanner3);
        bool mediaExists = LoadMedia(series->seriesID, 0, 0, 0, mediaType);
        bool reloadImage = mediaExists ? ReloadImage(banner->url) : true;
        if (!reloadImage) {
            num++;
            if (num>2) break;
            continue;
        }
        bool ok = SavePosterBannerFanart(mediaType, banner, series->seriesID);
        if (ok)
            num++;
        if (num>2) break;
    }
}

bool cTVDBManager::SavePosterBannerFanart(int mediaType, cTVDBMedia *media, int seriesID) {
    MemoryStruct data;
    tSeriesMedia->clear();
    tSeriesMedia->setValue("SeriesId", seriesID);
    tSeriesMedia->setValue("SeasonNumber", 0);
    tSeriesMedia->setValue("EpisodeId", 0);
    tSeriesMedia->setValue("ActorId", 0);
    tSeriesMedia->setValue("MediaType", mediaType);
    tSeriesMedia->setValue("MediaUrl", media->url.c_str());
    tSeriesMedia->setValue("MediaWidth", media->width);
    tSeriesMedia->setValue("MediaHeight", media->height);
    tSeriesMedia->setValue("MediaRating", media->rating);
    if (GetPicture(media->url.c_str(), &data) == success) {
        tSeriesMedia->setValue("MediaContent", data.memory, data.size);
        tSeriesMedia->store();
        return true;
    }
    return false;
}

void cTVDBManager::SaveSeriesEpisodes(cTVDBSeries *series) {
    cTVDBEpisode *episode = NULL;
    while((episode = series->GetEpisode())) {
        //insert Season Poster
        cTVDBSeasonPoster *seasonPoster = series->GetSeasonPoster(episode->season);
        if (seasonPoster) {
            bool mediaExists = LoadMedia(series->seriesID, episode->season, 0, 0, mtSeasonPoster);
            if (!mediaExists) {
                tSeriesMedia->clear();
                tSeriesMedia->setValue("SeriesId", series->seriesID);
                tSeriesMedia->setValue("SeasonNumber", episode->season);
                tSeriesMedia->setValue("EpisodeId", 0);
                tSeriesMedia->setValue("ActorId", 0);
                tSeriesMedia->setValue("MediaType", mtSeasonPoster);
                tSeriesMedia->setValue("MediaUrl", seasonPoster->url.c_str());
                tSeriesMedia->setValue("MediaWidth", seasonPoster->width);
                tSeriesMedia->setValue("MediaHeight", seasonPoster->height);
                tSeriesMedia->setValue("MediaRating", seasonPoster->rating);
                tSeriesMedia->store();
            }
        }
        //Episode
        SaveSeriesEpisode(episode, series->seriesID);
        //Episode Image
        if (episode->imageUrl.size() > 10) {
            bool mediaExists = LoadMedia(series->seriesID, episode->season, episode->id, 0, mtEpisodePic);
            if (!mediaExists) {
                tSeriesMedia->clear();
                tSeriesMedia->setValue("SeriesId", series->seriesID);
                tSeriesMedia->setValue("SeasonNumber", episode->season);
                tSeriesMedia->setValue("EpisodeId", episode->id);
                tSeriesMedia->setValue("ActorId", 0);
                tSeriesMedia->setValue("MediaType", mtEpisodePic);
                tSeriesMedia->setValue("MediaUrl", episode->imageUrl.c_str());
                tSeriesMedia->setValue("MediaWidth", episode->width);
                tSeriesMedia->setValue("MediaHeight", episode->height);
                tSeriesMedia->setValue("MediaRating", 0.0);
                tSeriesMedia->store();
            }
        }
    }
}

void cTVDBManager::SaveSeriesEpisode(cTVDBEpisode *episode, int seriesID) {
    if (!episode)
        return;
    tSeriesEpsiode->clear();
    tSeriesEpsiode->setValue("EpisodeId", episode->id);
    tSeriesEpsiode->setValue("EpisodeNumber", episode->number);
    tSeriesEpsiode->setValue("EpisodeName", episode->name.c_str());
    tSeriesEpsiode->setValue("EpisodeOverview", episode->overview.c_str());
    tSeriesEpsiode->setValue("EpisodeFirstAired", episode->firstAired.c_str());
    tSeriesEpsiode->setValue("EpisodeGuestStars", episode->guestStars.c_str());
    tSeriesEpsiode->setValue("EpisodeRating", episode->rating);
    tSeriesEpsiode->setValue("EpisodeLastUpdated", episode->lastUpdated);
    tSeriesEpsiode->setValue("SeasonNumber", episode->season);
    tSeriesEpsiode->setValue("SeriesId", seriesID ? seriesID : episode->seriesID);
    tSeriesEpsiode->store();
}

void cTVDBManager::SaveSeriesActors(cTVDBSeries *series) {
    MemoryStruct data;
    cTVDBActor *actor = NULL;
    while((actor = series->GetActor())) {
        tSeriesActor->clear();
        tSeriesActor->setValue("ActorId", actor->id);
        tSeriesActor->setValue("ActorName", actor->name.c_str());
        tSeriesActor->setValue("ActorRole", actor->role.c_str());
        tSeriesActor->setValue("SortOrder", actor->sortOrder);
        tSeriesActor->store();
        bool mediaExists = LoadMedia(series->seriesID, 0, 0, actor->id, mtActorThumb);
        bool reloadImage = mediaExists ? ReloadImage(actor->thumbUrl) : true;
        if (reloadImage && actor->thumbUrl.size() > 10) {
            tSeriesMedia->clear();
            tSeriesMedia->setValue("SeriesId", series->seriesID);
            tSeriesMedia->setValue("SeasonNumber", 0);
            tSeriesMedia->setValue("EpisodeId", 0);
            tSeriesMedia->setValue("ActorId", actor->id);
            tSeriesMedia->setValue("MediaType", mtActorThumb);
            tSeriesMedia->setValue("MediaUrl", actor->thumbUrl.c_str());
            tSeriesMedia->setValue("MediaWidth", actor->thumbUrlWidth);
            tSeriesMedia->setValue("MediaHeight", actor->thumbUrlHeight);
            tSeriesMedia->setValue("MediaRating", 0.0);
            if (GetPicture(actor->thumbUrl.c_str(), &data) == success) {
                tSeriesMedia->setValue("MediaContent", data.memory, data.size);
                tSeriesMedia->store();
            }
        }
    }
}

bool cTVDBManager::LoadMedia(int seriesId, int seasonNumber, int episodeId, int actorId, int mediaType) {
    tSeriesMedia->clear();
    tSeriesMedia->setValue("SeriesId", seriesId);
    tSeriesMedia->setValue("SeasonNumber", seasonNumber);
    tSeriesMedia->setValue("EpisodeId", episodeId);
    tSeriesMedia->setValue("ActorId", actorId);
    tSeriesMedia->setValue("MediaType", mediaType);
    return tSeriesMedia->find();
}

bool cTVDBManager::GetSeriesWithEpisodesFromEPG(vector<sSeriesResult> *result) {
    int status = success;
    cDbValue season;
    cDbValue part;
    cDbValue number;

    season.setField(tEpisodes->getField("Season"));
    part.setField(tEpisodes->getField("Part"));
    number.setField(tEpisodes->getField("Number"));

    cDbStatement *selectSeries = new cDbStatement(tEvents);

    selectSeries->build("select ");
    selectSeries->bind("EventId", cDBS::bndOut);
    selectSeries->bind("Title", cDBS::bndOut, ", ");
    selectSeries->bind("ScrSp", cDBS::bndOut, ", ");
    selectSeries->bind(&season, cDBS::bndOut, ", ");
    selectSeries->bind(&part, cDBS::bndOut, ", ");
    selectSeries->bind(&number, cDBS::bndOut, ", ");
    selectSeries->bind("ShortText", cDBS::bndOut, ", ");
    selectSeries->build(" from thetvdbview");

    status += selectSeries->prepare();

    if (status != success) {
        delete selectSeries;
        return false;
    }

    for (int found = selectSeries->find(); found; found = selectSeries->fetch()) {
       sSeriesResult res;
        res.eventId = tEvents->getBigintValue("EventId");
        res.title = tEvents->getStrValue("Title");
        res.lastScraped = tEvents->getIntValue("ScrSp");
        res.season = season.getIntValue();
        res.part = part.getIntValue();
        res.number = number.getIntValue();
        res.episodeName = tEvents->getStrValue("ShortText");
        result->push_back(res);
   }

   selectSeries->freeResult();
   delete selectSeries;
   return true;
}

int cTVDBManager::GetPicture(const char* url, MemoryStruct* data) {
    //tell(0,"Download image %s", url);
   int maxSize = tSeriesMedia->getField("MediaContent")->getSize();
    data->clear();
    int fileSize = 0;
    if (curl.downloadFile(url, fileSize, data) == success) {
        bytesDownloaded += fileSize;
        if (fileSize < maxSize)
            return success;
    }
    return fail;
}

bool cTVDBManager::ReloadImage(string url) {
    bool reloadImage = false;
    if (url.compare(tSeriesMedia->getStrValue("MediaUrl"))) {
        reloadImage = true;
    }
    return reloadImage;
}

void cTVDBManager::ProcessSeries(sSeriesResult ser) {
    //tell(0, "Checking eventID: %d, Title: %s, S%dE%dN%d", ser.eventId, ser.title.c_str(), ser.season, ser.part, ser.number);
    map<string, int>::iterator hit = alreadyScraped.find(ser.title);
    int seriesID = 0;
    int episodeID = 0;
    if (hit != alreadyScraped.end()) {
        seriesID = (int)hit->second;
        if (seriesID == 0) {
            //tell(0, "series %s already scraped and nothing found", ser.title.c_str());
            UpdateEvent(ser.eventId, seriesID, episodeID);
            return;
        } else {
            //tell(0, "found series %s in cache, id %d", ser.title.c_str(), seriesID);
        }
    }
    if (seriesID == 0) {
        //check if series in database
        seriesID = LoadSeriesFromDB(ser.title);
        if (seriesID != 0) {
            //tell(0, "series %s already in db, id %d", ser.title.c_str(), seriesID);
        } else {
            //scrap series
            cTVDBSeries *series = ScrapSeries(ser.title);
            if (series) {
                SaveSeries(series);
                seriesID = series->seriesID;
                //tell(0, "series %s successfully scraped, id %d", ser.title.c_str(), seriesID);
                delete series;
                series = NULL;
            } else {
                //tell(0, "series %s not found at tvdb.com", ser.title.c_str());
            }
        }
    }
    alreadyScraped.insert(pair<string, int>(ser.title, seriesID));
    if (seriesID != 0) {
        if ((ser.season == 0) && (ser.part == 0) && (ser.episodeName.size() > 0)) {
            //try to get part and season from episode name
            GetSeasonEpisodeFromEpisodename(seriesID, ser.season, ser.part, ser.episodeName);
        }
        //tell(0, "downloading episode info");
        //loading season poster and episode picture
        if (ser.season > 0)
            LoadSeasonPoster(seriesID, ser.season);
        if ((ser.season > 0) && (ser.part > 0))
            episodeID = LoadEpisodePicture(seriesID, ser.season, ser.part);
    }
    //updating event with series data
    UpdateEvent(ser.eventId, seriesID, episodeID);
}

int cTVDBManager::LoadSeriesFromDB(string name) {
    int status = success;
    int seriesID = 0;
    tSeries->clear();
    tSeries->setValue("SeriesName", name.c_str());
    cDbStatement *select = new cDbStatement(tSeries);
    select->build("select ");
    select->bind("SeriesId", cDBS::bndOut);
    select->build(" from %s where ", tSeries->TableName());
    select->bind("SeriesName", cDBS::bndIn | cDBS::bndSet);
    status += select->prepare();
    if (status != success) {
        delete select;
        return seriesID;
    }
    int res = select->find();
    if (res) {
        seriesID = tSeries->getIntValue("SeriesId");
    }
    select->freeResult();
    delete select;
    return seriesID;
}

void cTVDBManager::GetSeasonEpisodeFromEpisodename(int seriesID, int &season, int &part, string episodeName) {
    int status = success;
    tSeriesEpsiode->clear();
    tSeriesEpsiode->setValue("SeriesId", seriesID);
    tSeriesEpsiode->setValue("EpisodeName", episodeName.c_str());
    cDbStatement *select = new cDbStatement(tSeriesEpsiode);
    select->build("select ");
    select->bind("EpisodeNumber", cDBS::bndOut);
    select->bind("SeasonNumber", cDBS::bndOut, ", ");
    select->build(" from %s where ", tSeriesEpsiode->TableName());
    select->bind("SeriesId", cDBS::bndIn | cDBS::bndSet);
    select->bind("EpisodeName", cDBS::bndIn | cDBS::bndSet, " and ");
    status += select->prepare();
    if (status != success) {
        delete select;
        return;
    }
    int res = select->find();
    if (res) {
        season = tSeriesEpsiode->getIntValue("SeasonNumber");
        part = tSeriesEpsiode->getIntValue("EpisodeNumber");
    }
    select->freeResult();
    delete select;
}


void cTVDBManager::LoadSeasonPoster(int seriesID, int season) {
    tSeriesMedia->clear();
    tSeriesMedia->setValue("SeriesId", seriesID);
    tSeriesMedia->setValue("SeasonNumber", season);
    tSeriesMedia->setValue("EpisodeId", 0);
    tSeriesMedia->setValue("ActorId", 0);
    tSeriesMedia->setValue("MediaType", mtSeasonPoster);
    int found = tSeriesMedia->find();
    if (!found)
        return;
    string url = tSeriesMedia->getStrValue("MediaUrl");
    if (url.size() < 10)
        return;
    if (tSeriesMedia->isNull("MediaContent")) {
        MemoryStruct data;
        if (GetPicture(url.c_str(), &data) == success) {
            tSeriesMedia->setValue("MediaContent", data.memory, data.size);
            tSeriesMedia->store();
        }
    }
}

int cTVDBManager::LoadEpisodePicture(int seriesID, int season, int part) {
    int status = success;
    int episodeID = 0;
    tSeriesEpsiode->clear();
    tSeriesEpsiode->setValue("EpisodeNumber", part);
    tSeriesEpsiode->setValue("SeasonNumber", season);
    tSeriesEpsiode->setValue("SeriesId", seriesID);
    cDbStatement *select = new cDbStatement(tSeriesEpsiode);
    select->build("select ");
    select->bind("EpisodeId", cDBS::bndOut);
    select->build(" from %s where ", tSeriesEpsiode->TableName());
    select->bind("EpisodeNumber", cDBS::bndIn | cDBS::bndSet);
    select->bind("SeasonNumber", cDBS::bndIn | cDBS::bndSet, " and ");
    select->bind("SeriesId", cDBS::bndIn | cDBS::bndSet, " and ");
    status += select->prepare();
    if (status != success) {
        delete select;
        return episodeID;
    }
    int res = select->find();
    if (res) {
        episodeID = tSeriesEpsiode->getIntValue("EpisodeId");
    }
    select->freeResult();
    delete select;
    if (!episodeID)
        return episodeID;
    //downloading episode picture
    tSeriesMedia->clear();
    tSeriesMedia->setValue("SeriesId", seriesID);
    tSeriesMedia->setValue("SeasonNumber", season);
    tSeriesMedia->setValue("EpisodeId", episodeID);
    tSeriesMedia->setValue("ActorId", 0);
    tSeriesMedia->setValue("MediaType", mtEpisodePic);
    int found = tSeriesMedia->find();
    if (!found)
        return episodeID;
    string url = tSeriesMedia->getStrValue("MediaUrl");
    if (url.size() < 10)
        return episodeID;
    if (tSeriesMedia->isNull("MediaContent")) {
        MemoryStruct data;
        if (GetPicture(url.c_str(), &data) == success) {
            tSeriesMedia->setValue("MediaContent", data.memory, data.size);
            tSeriesMedia->store();
        }
    }
    return episodeID;
}

void cTVDBManager::UpdateEvent(tEventId eventID, int seriesID, int episodeID) {
    stringstream upd;
    upd << "update " << tEvents->TableName();
    upd << " set scrsp = " << time(0);
    upd << ", scrseriesid = " << seriesID;
    upd << ", scrseriesepisode = " << episodeID;
    upd << " where eventid = " << eventID;
    cDbStatement updStmt(connection, upd.str().c_str());
    updStmt.prepare();
    updStmt.execute();
}

int cTVDBManager::CleanupSeries(void) {
    int numDelete = 0;
    set<int> activeSeriesIds;
    int status = success;
    //fetching seriesIds from current events
    cDbStatement *selectSeriesIds = new cDbStatement(tEvents);
    selectSeriesIds->build("select distinct ");
    selectSeriesIds->bind("ScrSeriesId", cDBS::bndOut);
    selectSeriesIds->build(" from %s where ", tEvents->TableName());
    selectSeriesIds->build(" %s is not null ", tEvents->getField("ScrSeriesId")->getDbName());
    selectSeriesIds->build(" and %s > 0 ", tEvents->getField("ScrSeriesId")->getDbName());
    status += selectSeriesIds->prepare();
    if (status != success) {
        delete selectSeriesIds;
        return numDelete;
    }
    tEvents->clear();

    for (int res = selectSeriesIds->find(); res; res = selectSeriesIds->fetch()) {
        activeSeriesIds.insert(tEvents->getIntValue("ScrSeriesId"));
    }

    selectSeriesIds->freeResult();
    delete selectSeriesIds;

    // fetching seriesIds from recordings

    cDbStatement *selectSeriesIdsRec = new cDbStatement(tRecordingList);
    selectSeriesIdsRec->build("select distinct ");
    selectSeriesIdsRec->bind("SCRSERIESID", cDBS::bndOut);
    selectSeriesIdsRec->build(" from %s where ", tRecordingList->TableName());
    selectSeriesIdsRec->build(" %s is not null ", tRecordingList->getField("SCRSERIESID")->getDbName());
    selectSeriesIdsRec->build(" and %s > 0 ", tRecordingList->getField("SCRSERIESID")->getDbName());
    status += selectSeriesIdsRec->prepare();
    if (status != success) {
        delete selectSeriesIdsRec;
        return numDelete;
    }
    tRecordingList->clear();
    for (int res = selectSeriesIdsRec->find(); res; res = selectSeriesIdsRec->fetch()) {
        activeSeriesIds.insert(tRecordingList->getIntValue("SCRSERIESID"));
    }
    selectSeriesIdsRec->freeResult();
    delete selectSeriesIdsRec;

    //fetching all seriesIds from series table
    vector<int> storedSeriesIds;
    cDbStatement *selectStoredSeriesIds = new cDbStatement(tSeries);
    selectStoredSeriesIds->build("select ");
    selectStoredSeriesIds->bind("SeriesId", cDBS::bndOut);
    selectStoredSeriesIds->build(" from %s where ", tSeries->TableName());
    selectStoredSeriesIds->build(" %s is not null ", tSeries->getField("SeriesId")->getDbName());
    selectStoredSeriesIds->build(" and %s > 0 ", tSeries->getField("SeriesId")->getDbName());
    status += selectStoredSeriesIds->prepare();
    if (status != success) {
        delete selectStoredSeriesIds;
        return numDelete;
    }
    tSeries->clear();

    for (int res = selectStoredSeriesIds->find(); res; res = selectStoredSeriesIds->fetch()) {
        storedSeriesIds.push_back(tSeries->getIntValue("SeriesId"));
    }
    selectStoredSeriesIds->freeResult();
    delete selectStoredSeriesIds;

    numDelete = storedSeriesIds.size() - activeSeriesIds.size();
    if (numDelete < 1)
        return numDelete;
    for (vector<int>::iterator sId = storedSeriesIds.begin(); sId != storedSeriesIds.end(); sId++) {
        set<int>::iterator hit = activeSeriesIds.find(*sId);
        if (hit == activeSeriesIds.end()) {
            DeleteSeries(*sId);
        }
    }
    return numDelete;
}

void cTVDBManager::DeleteSeries(int seriesId) {
    if (seriesId < 1)
        return;
    stringstream delSeriesEpisodes;
    delSeriesEpisodes << "delete from " << tSeriesEpsiode->TableName();
    delSeriesEpisodes << " where " << tSeriesEpsiode->getField("SeriesId")->getDbName();
    delSeriesEpisodes << " = " << seriesId;

    cDbStatement delEpisodes(connection, delSeriesEpisodes.str().c_str());
    delEpisodes.prepare();
    delEpisodes.execute();

    stringstream delSeriesActors;
    delSeriesActors << "delete from " << tSeriesActor->TableName();
    delSeriesActors << " where " << tSeriesActor->getField("ActorId")->getDbName();
    delSeriesActors << " in ( ";
    delSeriesActors << " select series_media.actor_id ";
    delSeriesActors << " from series, series_media ";
    delSeriesActors << " where series.series_id = series_media.series_id ";
    delSeriesActors << " and  series_media.media_type = " << mtActorThumb;
    delSeriesActors << " and series.series_id = " << seriesId << ")";

    cDbStatement delActors(connection, delSeriesActors.str().c_str());
    delActors.prepare();
    delActors.execute();

    stringstream delSeriesMedia;
    delSeriesMedia << "delete from " << tSeriesMedia->TableName();
    delSeriesMedia << " where " << tSeriesMedia->getField("SeriesId")->getDbName();
    delSeriesMedia << " = " << seriesId;

    cDbStatement delMedia(connection, delSeriesMedia.str().c_str());
    delMedia.prepare();
    delMedia.execute();

    stringstream delSeries;
    delSeries << "delete from " << tSeries->TableName();
    delSeries << " where " << tSeries->getField("SeriesId")->getDbName();
    delSeries << " = " << seriesId;

    cDbStatement delSer(connection, delSeries.str().c_str());
    delSer.prepare();
    delSer.execute();
}

bool cTVDBManager::SearchRecordingDB(string name, string episode, int &seriesId, int &episodeId)
{
   int status = success;
   cDbStatement *select = new cDbStatement(tSeries);

   select->build("select ");
   select->bind("SeriesId", cDBS::bndOut);
   select->build(" from %s where ", tSeries->TableName());
   select->bind("SeriesName", cDBS::bndIn | cDBS::bndSet);
   status += select->prepare();

   if (status != success)
   {
      delete select;
      return false;
   }

   tSeries->clear();
   tSeries->setValue("SeriesName", name.c_str());
   int found = select->find();

   if (found)
   {
      seriesId = tSeries->getIntValue("SeriesId");
      episodeId = LoadEpisode(episode, seriesId);
   }

   select->freeResult();
   delete select;

   return found;
}

bool cTVDBManager::SearchRecordingOnline(string name, string episode, int &seriesId, int &episodeId)
{
   cTVDBSeries *recSeries = ScrapSeries(name);

   if (recSeries)
   {
      SaveSeries(recSeries);
      seriesId = recSeries->seriesID;
      delete recSeries;
      episodeId = LoadEpisode(episode, seriesId);
      return true;
   }

   return false;
}

int cTVDBManager::LoadEpisode(string name, int seriesId) {
    int status = success;
    int episodeId = 0;
    cDbStatement *select = new cDbStatement(tSeriesEpsiode);
    select->build("select ");
    select->bind("EpisodeId", cDBS::bndOut);
    select->build(" from %s where ", tSeriesEpsiode->TableName());
    select->bind("EpisodeName", cDBS::bndIn | cDBS::bndSet);
    select->bind("SeriesId", cDBS::bndIn | cDBS::bndSet, " and ");
    status += select->prepare();
    if (status != success) {
        delete select;
        return false;
    }
    tSeriesEpsiode->clear();
    tSeriesEpsiode->setValue("EpisodeName", name.c_str());
    tSeriesEpsiode->setValue("SeriesId", seriesId);
    int found = select->find();
    if (found)
        episodeId = tSeriesEpsiode->getIntValue("EpisodeId");
    select->freeResult();
    delete select;
    return episodeId;
}


bool cTVDBManager::CheckScrapInfoDB(int scrapSeriesId, int scrapEpisodeId) {
    //check if series is in db
    tSeries->clear();
    tSeries->setValue("SeriesId", scrapSeriesId);
    int found = tSeries->find();
    if (!found)
        return false;
    if (scrapEpisodeId > 0) {
        tSeriesEpsiode->clear();
        tSeriesEpsiode->setValue("EpisodeId", scrapEpisodeId);
        found = tSeriesEpsiode->find();
        if (found) {
            int season = tSeriesEpsiode->getIntValue("SeasonNumber");
            int part = tSeriesEpsiode->getIntValue("EpisodeNumber");
            if (season)
                LoadSeasonPoster(scrapSeriesId, season);
            if (season && part)
                LoadEpisodePicture(scrapSeriesId, season, part);
        }
    }
    return true;
}

bool cTVDBManager::CheckScrapInfoOnline(int scrapSeriesId, int scrapEpisodeId) {
    cTVDBSeries *seriesRec = ScrapSeries(scrapSeriesId);
    if (!seriesRec)
        return false;
    SaveSeries(seriesRec);
    if (scrapEpisodeId > 0) {
        int part = 0;
        int season = 0;
        if (seriesRec->GetPartAndSeason(scrapEpisodeId, season, part)) {
            if (season)
                LoadSeasonPoster(scrapSeriesId, season);
            if (season && part)
                LoadEpisodePicture(scrapSeriesId, season, part);
        }
    }
    delete seriesRec;
    return true;
}
