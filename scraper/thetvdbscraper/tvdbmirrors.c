#include "tvdbmirrors.h"

using namespace std;

cTVDBMirrors::cTVDBMirrors(void) {
}

cTVDBMirrors::~cTVDBMirrors() {
}

string cTVDBMirrors::GetMirrorXML(void) {
    if (xmlmirrors.size() == 0)
        return "";
    int randMirror = rand() % xmlmirrors.size();
    return xmlmirrors[randMirror];
}
string cTVDBMirrors::GetMirrorBanner(void) {
    if (bannermirrors.size() == 0)
        return "";
    int randMirror = rand() % bannermirrors.size();
    return bannermirrors[randMirror] + "/banners/";
}

string cTVDBMirrors::GetMirrorZip(void) {
    if (zipmirrors.size() == 0)
        return "";
    int randMirror = rand() % zipmirrors.size();
    return zipmirrors[randMirror];
}

bool cTVDBMirrors::ParseXML(string xml) {
    xmlDoc *doc = xmlReadMemory(xml.c_str(), xml.size(), "noname.xml", NULL, 0);
    if (doc == NULL)
        return false;
    //Root Element has to be <Mirrors>
    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);
    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Mirrors"))) {
        xmlFreeDoc(doc);
        return false;
    }
    //Loop through <Mirror>
    node = node->children;
    xmlNode *cur_node = NULL;
    bool ok = false;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Mirror")) {
            ok = ReadEntry(doc, cur_node->children);
        }
    }
    xmlFreeDoc(doc);
    return ok;
}

bool cTVDBMirrors::ReadEntry(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    string path = "";
    int typemask = 0;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"mirrorpath")) {
                path = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"typemask")) {
                typemask = atoi((const char *)node_content);
            }
            xmlFree(node_content);
        }
    }
    return CreateMirror(path, typemask);
}

bool cTVDBMirrors::CreateMirror(string path, int typemask) {
    if (path.size() < 1)
        return false;
    if (typemask < 1 || typemask > 7)
        return false;
    if (typemask & 1)
       xmlmirrors.push_back(path); 
    if (typemask & 2)
       bannermirrors.push_back(path); 
    if (typemask & 4)
       zipmirrors.push_back(path);
    return true;
}