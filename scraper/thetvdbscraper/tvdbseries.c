
#include "../../lib/curl.h"
#include "tvdbseries.h"

using namespace std;

cTVDBSeries::cTVDBSeries(int ID, string language, string apiKey, cTVDBMirrors *mirrors) {
    this->language = language;
    this->apiKey = apiKey;
    this->mirrors = mirrors;
    seriesID = ID;
    name = "";
    banner = "";
    fanart = "";
    poster = "";
    overview = "";
    firstAired = "";
    network = "";
    imbdid = "";
    genre = "";
    rating = 0.0;
    status = "";
    currentEpisode = 0;
    currentActor = 0;
    currentFanart = 0;
    currentPoster = 0;
    currentSeasonPoster = 0;
    currentBanner = 0;
}

cTVDBSeries::~cTVDBSeries() {
    for(std::vector<cTVDBEpisode*>::const_iterator it = episodes.begin(); it != episodes.end(); it++) {
        delete *it;
    }
    episodes.clear();
    for(std::vector<cTVDBActor*>::const_iterator it = actors.begin(); it != actors.end(); it++) {
        delete *it;
    }
    actors.clear();
    for(std::vector<cTVDBFanart*>::const_iterator it = fanarts.begin(); it != fanarts.end(); it++) {
        delete *it;
    }
    fanarts.clear();
    for(std::vector<cTVDBPoster*>::const_iterator it = posters.begin(); it != posters.end(); it++) {
        delete *it;
    }
    posters.clear();
    for(std::vector<cTVDBSeasonPoster*>::const_iterator it = seasonPosters.begin(); it != seasonPosters.end(); it++) {
        delete *it;
    }
    seasonPosters.clear();
    for(std::vector<cTVDBBanner*>::const_iterator it = banners.begin(); it != banners.end(); it++) {
        delete *it;
    }
    banners.clear();
}

bool cTVDBSeries::ReadSeries(void) {
    stringstream url;
    url << mirrors->GetMirrorXML() << "/api/" << apiKey << "/series/" << seriesID << "/all/" << language << ".xml";
    string seriesXML;
    if (curl.GetUrl(url.str().c_str(), &seriesXML)) {
        ParseXML(seriesXML);
        return true;
    }
    return false;
}

void cTVDBSeries::ReadMedia(void) {
    stringstream url;
    url << mirrors->GetMirrorXML() << "/api/" << apiKey << "/series/" << seriesID << "/banners.xml";
    string bannersXML;
    if (curl.GetUrl(url.str().c_str(), &bannersXML)) {
        cTVDBSeriesMedia med(language, mirrors);
        med.ParseXML(bannersXML, &banners, &fanarts, &posters, &seasonPosters);
    }
}

void cTVDBSeries::ReadActors(void) {
    stringstream url;
    url << mirrors->GetMirrorXML() << "/api/" << apiKey << "/series/" << seriesID << "/actors.xml";
    string actorsXML;
    if (curl.GetUrl(url.str().c_str(), &actorsXML)) {
        cTVDBActors act(language, mirrors);
        act.ParseXML(actorsXML, &actors);
    }
}

void cTVDBSeries::ParseXML(string xml) {
    xmlDoc *doc = xmlReadMemory(xml.c_str(), xml.size(), "noname.xml", NULL, 0);
    if (doc == NULL)
        return;
    //Root Element has to be <Data>
    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);
    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Data"))) {
        xmlFreeDoc(doc);
        return;
    }
    //Looping through episodes
    node = node->children;
    xmlNode *cur_node = NULL;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Series")) {
            ReadSeriesData(doc, cur_node->children);
        } else if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Episode")) {
            cTVDBEpisode *episode = new cTVDBEpisode();
            episode->ReadEpisodeFromXML(doc, cur_node->children, mirrors);
            episodes.push_back(episode);
        } 
    }
    xmlFreeDoc(doc);
}

void cTVDBSeries::ReadSeriesData(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"FirstAired")) {
                firstAired = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Genre")) {
                genre = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"IMDB_ID")) {
                imbdid = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Network")) {
                network = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Overview")) {
                overview = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Rating")) {
                rating = atof((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"SeriesName")) {
                name = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Status")) {
                status = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"banner")) {
                banner = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"fanart")) {
                fanart = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"poster")) {
                poster = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"lastupdated")) {
                lastUpdated = atoi((const char *)node_content);
            }
            xmlFree(node_content);
        }
    }
}

cTVDBEpisode *cTVDBSeries::GetEpisode(void) {
    int numEpisodes = episodes.size();
    if ((numEpisodes < 1) || (currentEpisode >= numEpisodes))
        return NULL;
    cTVDBEpisode *epi = episodes[currentEpisode];
    currentEpisode++;
    return epi;
}

cTVDBActor *cTVDBSeries::GetActor(void) {
    int numActors = actors.size();
    if ((numActors < 1) || (currentActor >= numActors))
        return NULL;
    cTVDBActor *act = actors[currentActor];
    currentActor++;
    return act;
}

cTVDBFanart *cTVDBSeries::GetFanart(void) {
    int numFanarts = fanarts.size();
    if ((numFanarts < 1) || (currentFanart >= numFanarts))
        return NULL;
    cTVDBFanart *fan = fanarts[currentFanart];
    currentFanart++;
    return fan;
}

cTVDBPoster *cTVDBSeries::GetPoster(void) {
    int numPosters = posters.size();
    if ((numPosters < 1) || (currentPoster >= numPosters))
        return NULL;
    cTVDBPoster *pos = posters[currentPoster];
    currentPoster++;
    return pos;
}

cTVDBSeasonPoster *cTVDBSeries::GetSeasonPoster(void) {
    int numSeasonPosters = seasonPosters.size();
    if ((numSeasonPosters < 1) || (currentSeasonPoster >= numSeasonPosters))
        return NULL;
    cTVDBSeasonPoster *pos = seasonPosters[currentSeasonPoster];
    currentSeasonPoster++;
    return pos;
}

cTVDBSeasonPoster *cTVDBSeries::GetSeasonPoster(int season) {
    int numSeasonPoster = seasonPosters.size();
    for (int i=0; i<numSeasonPoster; i++) {
        if (seasonPosters[i]->season == season)
            return seasonPosters[i];
    }
    return NULL;
}

cTVDBBanner *cTVDBSeries::GetBanner(void) {
    int numBanners = banners.size();
    if ((numBanners < 1) || (currentBanner >= numBanners))
        return NULL;
    cTVDBBanner *ban = banners[currentBanner];
    currentBanner++;
    return ban;
}

bool cTVDBSeries::GetPartAndSeason(int episodeId, int &season, int &part) {
    for (vector<cTVDBEpisode*>::iterator ep = episodes.begin(); ep != episodes.end(); ep++) {
        cTVDBEpisode *episode = *ep;
        if(episode->id == episodeId) {
            season = episode->season;
            part = episode->number;
            return true;
        }
    }
    return false;
}

void cTVDBSeries::Dump(int maxEntries) {
    cout << "--------------------------- Series Info ----------------------------------" << endl;
    cout << "series " << name << ", ID: " << seriesID <<endl;
    cout << "Overview: " << overview << endl;
    cout << "Banner: " << banner << endl;
    cout << "Poster: " << poster << endl;
    cout << "Fanart: " << fanart << endl;
    cout << "imdb: " << imbdid << endl;
    cout << "FirstAired: " << firstAired << endl;
    cout << "Network: " << network << endl;
    cout << "Status: " << status << endl;
    cout << "lastUpdated: " << lastUpdated << endl;
    cout << "Genre: " << genre << endl;
    cout << "Rating: " << rating << endl;

    int size = episodes.size();
    cout << "--------------------------- " << size << " episodes ----------------------------------" << endl;
    for (int i=0; i<size; i++) {
        if (maxEntries && (i == maxEntries)) break;
        episodes[i]->Dump();
    }

    size = actors.size();
    cout << "--------------------------- " << size << " actors ----------------------------------" << endl;
    for (int i=0; i<size; i++) {
        if (maxEntries && (i == maxEntries)) break;
        actors[i]->Dump();
    }

    int numFanart = fanarts.size();
    cout << "--------------------------- " << numFanart << " fanarts ----------------------------------" << endl;
    for (int i=0; i<numFanart; i++) {
        if (maxEntries && (i == maxEntries)) break;
        fanarts[i]->Dump();
    }
    int numPoster = posters.size();
    cout << "--------------------------- " << numPoster << " posters ----------------------------------" << endl;
    for (int i=0; i<numPoster; i++) {
        if (maxEntries && (i == maxEntries)) break;
        posters[i]->Dump();
    }
    int numSeasonPoster = seasonPosters.size();
    cout << "--------------------------- " << numSeasonPoster << " season posters ---------------------------" << endl;
    for (int i=0; i<numSeasonPoster; i++) {
        if (maxEntries && (i == maxEntries)) break;
        seasonPosters[i]->Dump();
    }
    int numBanner = banners.size();
    cout << "--------------------------- " << numBanner << " banners ----------------------------------" << endl;
    for (int i=0; i<numBanner; i++) {
        if (maxEntries && (i == maxEntries)) break;
        banners[i]->Dump();
    }    
}
