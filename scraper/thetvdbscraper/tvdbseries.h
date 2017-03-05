#ifndef __TVSCRAPER_TVDBSERIES_H
#define __TVSCRAPER_TVDBSERIES_H

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "tvdbmirrors.h"
#include "tvdbactor.h"
#include "tvdbmedia.h"
#include "tvdbepisode.h"

using namespace std;

// --- cTVDBSeries -------------------------------------------------------------

class cTVDBSeries {
private:
    string apiKey;
    cTVDBMirrors *mirrors;
    string language;
    vector<cTVDBEpisode*> episodes;
    vector<cTVDBActor*> actors;
    vector<cTVDBFanart*> fanarts;
    vector<cTVDBPoster*> posters;
    vector<cTVDBSeasonPoster*> seasonPosters;
    vector<cTVDBBanner*> banners;
    int currentEpisode;
    int currentActor;
    int currentFanart;
    int currentPoster;
    int currentSeasonPoster;
    int currentBanner;
    void ParseXML(string xml);
    void ReadSeriesData(xmlDoc *doc, xmlNode *node);
public:
    cTVDBSeries(int ID, string language, string apiKey, cTVDBMirrors *mirrors);
    virtual ~cTVDBSeries(void);
    bool ReadSeries(void);
    void ReadMedia(void);
    void ReadActors(void);
    cTVDBEpisode *GetEpisode(void);
    cTVDBActor *GetActor(void);
    cTVDBFanart *GetFanart(void);
    cTVDBPoster *GetPoster(void);
    cTVDBSeasonPoster *GetSeasonPoster(void);
    cTVDBSeasonPoster *GetSeasonPoster(int season);
    cTVDBBanner *GetBanner(void);
    bool GetPartAndSeason(int episodeId, int &season, int &part);
    int seriesID;
    int lastUpdated;
    string name;
    string banner;
    string fanart;
    string poster;
    string overview;
    string firstAired;
    string network;
    string imbdid;
    string genre;
    float rating;
    string status;
    void Dump(int maxEntries = 0);
};


#endif //__TVSCRAPER_TVDBSERIES_H
