#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include "tvdbactor.h"

using namespace std;

cTVDBActors::cTVDBActors(string language, cTVDBMirrors *mirrors) {
    this->language = language;
    this->mirrors = mirrors;
}

cTVDBActors::~cTVDBActors() {
}

void cTVDBActors::ParseXML(string xml, vector<cTVDBActor*> *actors) {
    xmlDoc *doc = xmlReadMemory(xml.c_str(), xml.size(), "noname.xml", NULL, 0);
    if (doc == NULL)
        return;
    //Root Element has to be <Actors>
    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);
    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Actors"))) {
        xmlFreeDoc(doc);
        return;
    }
    //Looping through actors
    node = node->children;
    xmlNode *cur_node = NULL;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Actor")) {
            cTVDBActor *actor = ReadEntry(doc, cur_node->children);
            actors->push_back(actor);
        }
    }
    xmlFreeDoc(doc);
}

cTVDBActor *cTVDBActors::ReadEntry(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    cTVDBActor *actor = new cTVDBActor();
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Image")) {
                actor->thumbUrl = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Name")) {
                actor->name = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Role")) {
                actor->role = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"id")) {
                actor->id = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"SortOrder")) {
                actor->sortOrder = atoi((const char *)node_content);
            }
            xmlFree(node_content);
        }
    }
    return actor;
}