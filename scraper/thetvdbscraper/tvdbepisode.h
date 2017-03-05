#ifndef __TVSCRAPER_TVDBEPISODE_H
#define __TVSCRAPER_TVDBEPISODE_H

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "tvdbmirrors.h"

using namespace std; 

// --- cTVDBEpisode -------------------------------------------------------------
class cTVDBEpisode {
private:
    string apiKey;
    cTVDBMirrors *mirrors;
    string language;
    void ParseXML(string xml);
public:
    cTVDBEpisode(void);
    cTVDBEpisode(int ID, string language, string apiKey, cTVDBMirrors *mirrors);
    int id;
    int seriesID;
    int number;
    int season;
    int combinedSeason;
    int combinedEpisode;
    string name;
    string firstAired;
    string guestStars;
    string overview;
    float rating;
    string imageUrl;
    int width;
    int height;
    int imgFlag;
    int seasonId;
    int lastUpdated;
    void ReadEpisode(void);
    void ReadEpisodeFromXML(xmlDoc *myDoc, xmlNode *node, cTVDBMirrors *mirrors);
    void Dump();
};
#endif //cTVDBEpisode
