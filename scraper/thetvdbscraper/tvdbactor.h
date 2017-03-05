#ifndef __TVSCRAPER_TVDBACTORS_H
#define __TVSCRAPER_TVDBACTORS_H

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "tvdbmirrors.h"

using namespace std; 

// --- cTVDBActor -------------------------------------------------------------
class cTVDBActor {
public:
    cTVDBActor(void) {
        thumbUrl = "";
        name = "";
        role = "";
        id = 0;
        sortOrder = 0;
        thumbUrlWidth = 300;
        thumbUrlHeight = 450;
    };
    string thumbUrl;
    int thumbUrlWidth;
    int thumbUrlHeight;
    string name;
    string role;
    int id;
    int sortOrder;
    void Dump() {
        cout << "Actor name: " << name << ", ID: " << id << endl;
        cout << "Actor role: " << role << endl;
        cout << "Actor thumb: " << thumbUrl << endl;
        cout << "Actor SortOrder: " << sortOrder << endl;
    }
};

// --- cTVDBActors --------------------------------------------------------

class cTVDBActors {
private:
    cTVDBMirrors *mirrors;
    string language;
    cTVDBActor *ReadEntry(xmlDoc *doc, xmlNode *node);
public:
    cTVDBActors(string language, cTVDBMirrors *mirrors);
    virtual ~cTVDBActors(void);
    void ParseXML(string xml, vector<cTVDBActor*> *actors);
};

#endif //__TVSCRAPER_TVDBACTORS_H
