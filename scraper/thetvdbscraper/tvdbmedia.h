#ifndef __TVSCRAPER_TVDBMEDIA_H
#define __TVSCRAPER_TVDBMEDIA_H

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "tvdbmirrors.h"

using namespace std; 

// --- cTVDBMedia -------------------------------------------------------------
class cTVDBMedia {
public:
    cTVDBMedia(void) {
        url = "";
        language = "";
        width = 0;
        height = 0;
        rating = 0.0;
    };
    string url;
    string language;
    int width, height;
    double rating;
};

// --- cTVDBFanart -------------------------------------------------------------
class cTVDBFanart : public cTVDBMedia {
public:
    cTVDBFanart(void) {
        thumbUrl = "";
    };
    string thumbUrl;
    void Dump() {
        cout << "Url: " << url << endl;
        cout << "Url Thumbnail: " << thumbUrl << endl;
        cout << "Language: " << language << endl;
        cout << "Size: " << width << " x " << height << endl;
        cout << "Rating: " << rating << endl;
    };
};

// --- cTVDBPoster -------------------------------------------------------------
class cTVDBPoster : public cTVDBMedia {
public:
    cTVDBPoster(void) {
    };
    void Dump() {
        cout << "Url: " << url << endl;
        cout << "Language: " << language << endl;
        cout << "Size: " << width << " x " << height << endl;
        cout << "Rating: " << rating << endl;
    };
};

// --- cTVDBSeasonPoster -------------------------------------------------------------
class cTVDBSeasonPoster : public cTVDBMedia {
public:
    cTVDBSeasonPoster(void) {
        season = 0;
    };
    int season;
    void Dump() {
        cout << "Url: " << url << endl;
        cout << "Season: " << season << endl;
        cout << "Language: " << language << endl;
        cout << "Size: " << width << " x " << height << endl;
        cout << "Rating: " << rating << endl;
    };
};

// --- cTVDBBanner -------------------------------------------------------------
class cTVDBBanner : public cTVDBMedia {
public:
    cTVDBBanner(void) {
    };
    int season;
    void Dump() {
        cout << "Url: " << url << endl;
        cout << "Language: " << language << endl;
        cout << "Size: " << width << " x " << height << endl;
        cout << "Rating: " << rating << endl;
    };
};

// --- cTVDBSeriesMedia --------------------------------------------------------

class cTVDBSeriesMedia {
private:
    string language;
    string fallbackLanguage;
    cTVDBMirrors *mirrors;
    vector<cTVDBBanner*> *banners;
    vector<cTVDBFanart*> *fanarts;
    vector<cTVDBPoster*> *posters;
    vector<cTVDBSeasonPoster*> *seasonPosters;
    void ReadEntry(xmlDoc *doc, xmlNode *node);
    void ReadFanart(xmlDoc *doc, xmlNode *node);
    void ReadPoster(xmlDoc *doc, xmlNode *node);
    void ReadBanner(xmlDoc *doc, xmlNode *node);
    void ReadSeasonPoster(xmlDoc *doc, xmlNode *node);
public:
    cTVDBSeriesMedia(string language, cTVDBMirrors *mirrors);
    virtual ~cTVDBSeriesMedia(void);
    void ParseXML(string xml, vector<cTVDBBanner*> *banners, vector<cTVDBFanart*> *fanarts, vector<cTVDBPoster*> *posters, vector<cTVDBSeasonPoster*> *seasonPosters);
};

#endif //__TVSCRAPER_TVDBMEDIA_H
