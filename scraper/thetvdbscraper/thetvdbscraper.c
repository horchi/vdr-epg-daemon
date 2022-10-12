
#include "../../lib/curl.h"
#include "thetvdbscraper.h"

using namespace std;

cTVDBScraper::cTVDBScraper(string language) {
    apiKey = "E9DBB94CA50832ED";
    baseURL = "thetvdb.com";
    this->language = language;
    mirrors = NULL;
    xmlInitParser();
}

cTVDBScraper::~cTVDBScraper() {
    if (mirrors)
        delete mirrors;
}

cTVDBSeries *cTVDBScraper::ScrapInitial(string seriesName) {
    cTVDBSeries *series = NULL;
    int seriesID = ReadSeries(seriesName);
    if (seriesID) {
        series = new cTVDBSeries(seriesID, language, apiKey, mirrors);
    }
    return series;    
}

cTVDBSeries *cTVDBScraper::GetSeries(int seriesID) {
    return new cTVDBSeries(seriesID, language, apiKey, mirrors); 
}

cTVDBEpisode *cTVDBScraper::GetEpisode(int episodeID) {
    return new cTVDBEpisode(episodeID, language, apiKey, mirrors); 
}

bool cTVDBScraper::Connect(void) {
    stringstream url;
    url << baseURL << "/api/" << apiKey << "/mirrors.xml";
    string mirrorsXML;
    bool ok = false;
    if (curl.GetUrl(url.str().c_str(), &mirrorsXML)) {
        mirrors = new cTVDBMirrors();
        ok = mirrors->ParseXML(mirrorsXML);
    }
    return ok;
}

int cTVDBScraper::GetServerTime(void) {
    string url = "http://thetvdb.com/api/Updates.php?type=none";
    string serverTimeXML;
    if (!curl.GetUrl(url.c_str(), &serverTimeXML)) {
        return 0;
    }
    xmlDoc *doc = SetXMLDoc(serverTimeXML);
    if (doc == NULL)
        return 0;
    //Root Element has to be <Items>
    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);
    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Items"))) {
        xmlFreeDoc(doc);
        return 0;
    }
    node = node->children;
    xmlNode *cur_node = NULL;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Time")) {
            node = cur_node;
            break;
        } else {
            node = NULL;
        }
    }
    if (!node) {
        xmlFreeDoc(doc);
        return 0;
    }
    xmlChar *node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
    int serverTime = atoi((const char *)node_content);
    xmlFree(node_content);
    xmlFreeDoc(doc);
    return serverTime;
}

bool cTVDBScraper::GetUpdatedSeriesandEpisodes(set<int> *updatedSeries, set<int> *updatedEpisodes, int lastScrap) {
    stringstream url;
    url << "http://thetvdb.com/api/Updates.php?type=all&time=" << lastScrap;
    string updatedXML;
    if (!curl.GetUrl(url.str().c_str(), &updatedXML)) {
        return false;
    }
    xmlDoc *doc = SetXMLDoc(updatedXML);
    if (doc == NULL)
        return false;
    //Root Element has to be <Items>
    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);
    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Items"))) {
        xmlFreeDoc(doc);
        return false;
    }

    xmlNode *cur_node = node->children;
    for (; cur_node; cur_node = cur_node->next) {
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Series")) {
            xmlChar *node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            int seriesId = atoi((const char *)node_content);
            xmlFree(node_content);
            updatedSeries->insert(seriesId);
        } else if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Episode")) {
            xmlChar *node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            int episodeId = atoi((const char *)node_content);
            xmlFree(node_content);
            updatedEpisodes->insert(episodeId);
        }
    }
    xmlFreeDoc(doc);
    return true;
}


int cTVDBScraper::ReadSeries(string seriesName) {
    int seriesID = 0;
    stringstream url;
    string seriesXML;
    char* escUrl = curl.EscapeUrl(seriesName.c_str());

    url << mirrors->GetMirrorXML() << "/api/GetSeries.php?seriesname=" << escUrl << "&language=" << language.c_str();
    curl.Free(escUrl);

    if (curl.GetUrl(url.str().c_str(), &seriesXML))
        seriesID = ParseXML(seriesXML);

    return seriesID;
}

int cTVDBScraper::ParseXML(string xml) {
    int seriesID = 0;
    xmlDoc *doc = SetXMLDoc(xml);
    if (doc == NULL)
        return seriesID;
    //Root Element has to be <Data>
    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);
    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Data"))) {
        xmlFreeDoc(doc);
        return seriesID;
    }
    //Searching for  <Series>
    node = node->children;
    xmlNode *cur_node = NULL;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Series")) {
            node = cur_node;
            break;
        } else {
            node = NULL;
        }
    }
    if (!node) {
        xmlFreeDoc(doc);
        return seriesID;
    }
    //now read the first series    
    node = node->children;
    xmlChar *node_content;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"seriesid")) {
                seriesID = atoi((const char *)node_content);
                xmlFree(node_content);
                break;
            }
            xmlFree(node_content);
        }
    }
    xmlFreeDoc(doc);
    return seriesID;
}

xmlDoc *cTVDBScraper::SetXMLDoc(string xml) {
    xmlDoc *doc = xmlReadMemory(xml.c_str(), xml.size(), "noname.xml", NULL, 0);
    return doc;
}
