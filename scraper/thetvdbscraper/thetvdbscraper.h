#ifndef __TVSCRAPER_TVDBSCRAPER_H
#define __TVSCRAPER_TVDBSCRAPER_H
#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <set>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "tvdbseries.h"
#include "tvdbmirrors.h"

using namespace std;

// --- cTVDBScraper -------------------------------------------------------------

class cTVDBScraper {
private:
    string apiKey;
    string baseURL;
    string language;
    cTVDBMirrors *mirrors;
    xmlDoc *SetXMLDoc(string xml);
    int ParseXML(string xml);
    int ReadSeries(string seriesName);
public:
    cTVDBScraper(string language);
    virtual ~cTVDBScraper(void);
    bool Connect(void);
    int GetServerTime(void);
    cTVDBSeries *ScrapInitial(string seriesName);
    bool GetUpdatedSeriesandEpisodes(set<int> *updatedSeries, set<int> *updatedEpisodes, int lastScrap);
    cTVDBSeries *GetSeries(int seriesID);
    cTVDBEpisode *GetEpisode(int episodeID); 
};


#endif //__TVSCRAPER_TVDBSCRAPER_H
