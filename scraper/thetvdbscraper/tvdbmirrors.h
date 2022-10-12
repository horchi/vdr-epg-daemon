#ifndef __TVSCRAPER_TVDBMIRRORS_H
#define __TVSCRAPER_TVDBMIRRORS_H

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <libxml/parser.h>
#include <libxml/tree.h>

using namespace std;

// --- cTVDBMirrors -------------------------------------------------------------

class cTVDBMirrors {
private:
    vector<string> xmlmirrors;
    vector<string> bannermirrors;
    vector<string> zipmirrors;
    bool ReadEntry(xmlDoc *doc, xmlNode *node);
    bool CreateMirror(string path, int typemask);
public:
    cTVDBMirrors(void);
    virtual ~cTVDBMirrors(void);
    bool ParseXML(string xml);
    string GetMirrorXML(void);
    string GetMirrorBanner(void);
    string GetMirrorZip(void);
};


#endif //__TVSCRAPER_TVDBMIRRORS_H
