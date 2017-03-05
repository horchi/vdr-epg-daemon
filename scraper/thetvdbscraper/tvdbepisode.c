
#include <iostream>
#include <string>
#include <sstream>
#include <vector>

#include <libxml/parser.h>
#include <libxml/tree.h>

#include "../../lib/curl.h"
#include "tvdbepisode.h"

using namespace std;

cTVDBEpisode::cTVDBEpisode(void) {
    id = 0;
    seriesID = 0;
    number = 0;
    season = 0;
    combinedEpisode = 0;
    combinedSeason = 0;
    name = "";
    firstAired = "";
    guestStars = "";
    overview = "";
    rating = 0.0;
    imageUrl = "";
    width = 400;
    height = 225;
    imgFlag = 0;
    seasonId = 0;
    lastUpdated = 0;
}

cTVDBEpisode::cTVDBEpisode(int ID, string language, string apiKey, cTVDBMirrors *mirrors) {
    this->language = language;
    this->apiKey = apiKey;
    this->mirrors = mirrors;
    id = ID;
    seriesID = 0;
    number = 0;
    season = 0;
    combinedEpisode = 0;
    combinedSeason = 0;
    name = "";
    firstAired = "";
    guestStars = "";
    overview = "";
    rating = 0.0;
    imageUrl = "";
    width = 400;
    height = 225;
    imgFlag = 0;
    seasonId = 0;
    lastUpdated = 0;
}

void cTVDBEpisode::ReadEpisode(void) {
    stringstream url;
    url << mirrors->GetMirrorXML() << "/api/" << apiKey << "/episodes/" << id << "/" << language << ".xml";
    string episodeXML;
    if (curl.GetUrl(url.str().c_str(), &episodeXML)) {
        ParseXML(episodeXML);
    }
}

void cTVDBEpisode::ParseXML(string xml) {
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
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Episode")) {
            ReadEpisodeFromXML(doc, cur_node->children, mirrors);
        } 
    }
    xmlFreeDoc(doc);
}

void cTVDBEpisode::ReadEpisodeFromXML(xmlDoc *myDoc, xmlNode *node, cTVDBMirrors *mirrors) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(myDoc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"id")) {
                id = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"EpisodeNumber")) {
                number = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"seriesid")) {
                seriesID = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"SeasonNumber")) {
                season = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Combined_episodenumber")) {
                combinedEpisode = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Combined_season")) {
                combinedSeason = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"EpisodeName")) {
                name = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"FirstAired")) {
                firstAired = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"GuestStars")) {
                guestStars = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Overview")) {
                overview = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Rating")) {
                rating = atof((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"filename")) {
                imageUrl = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"thumb_width")) {
                width = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"thumb_height")) {
                height = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"EpImgFlag")) {
                imgFlag = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"seasonid")) {
                seasonId = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"lastupdated")) {
                lastUpdated = atoi((const char *)node_content);
            }
            xmlFree(node_content);
        }
    }
}

void cTVDBEpisode::Dump() {
    cout << "----------------------------------------" << endl;
    cout << "Season " << season << ", Episode " << number << ", Name: " << name << ", ID: " << id << ", SeasonID " << seasonId << endl;
    cout << "combinedSeason: " << combinedSeason << ", combinedEpisode: " << combinedEpisode << endl;
    cout << "First Aired: " << firstAired << endl;
    cout << "Guest Stars: " << guestStars << endl;
    cout << "Overview: " << overview << endl;
    cout << "Rating: " << rating << endl;
    cout << "imageUrl: " << imageUrl << ", Size: " << width << " x " << height << ", Flag: " << imgFlag << endl;
    cout << "Last Update: " << lastUpdated << endl;
}
