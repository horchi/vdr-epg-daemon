#include "tvdbmedia.h"

using namespace std;

cTVDBSeriesMedia::cTVDBSeriesMedia(string language, cTVDBMirrors *mirrors) {
    this->language = language;
    fallbackLanguage = "en";
    this->mirrors = mirrors;
}

cTVDBSeriesMedia::~cTVDBSeriesMedia() {
}

void cTVDBSeriesMedia::ParseXML(string xml, vector<cTVDBBanner*> *banners, vector<cTVDBFanart*> *fanarts, vector<cTVDBPoster*> *posters, vector<cTVDBSeasonPoster*> *seasonPosters) {
    xmlDoc *doc = xmlReadMemory(xml.c_str(), xml.size(), "noname.xml", NULL, 0);
    this->banners = banners;
    this->fanarts = fanarts;
    this->posters = posters;
    this->seasonPosters = seasonPosters;
    if (doc == NULL)
        return;
    //Root Element has to be <Banners>
    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);
    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Banners"))) {
        xmlFreeDoc(doc);
        return;
    }
    //Looping through banners
    node = node->children;
    xmlNode *cur_node = NULL;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Banner")) {
            ReadEntry(doc, cur_node->children);
        }
    }
    xmlFreeDoc(doc);
}

void cTVDBSeriesMedia::ReadEntry(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerType")) {

                if (!xmlStrcmp(node_content, (const xmlChar *)"poster"))
                    ReadPoster(doc, node);
                else if (!xmlStrcmp(node_content, (const xmlChar *)"fanart"))
                    ReadFanart(doc, node);
                else if (!xmlStrcmp(node_content, (const xmlChar *)"series"))
                    ReadBanner(doc, node);
                else if (!xmlStrcmp(node_content, (const xmlChar *)"season"))
                    ReadSeasonPoster(doc, node);

            }
            xmlFree(node_content);
        }
    }
}

void cTVDBSeriesMedia::ReadFanart(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    cTVDBFanart *fanart = new cTVDBFanart();
    //default size
    fanart->width = 1920;
    fanart->height = 1080;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerPath")) {
                fanart->url = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Language")) {
                fanart->language = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Rating")) {
                fanart->rating = atof((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"ThumbnailPath")) {
                fanart->thumbUrl = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerType2")) {
                string fanartSize = (const char *)node_content;
                size_t posX = fanartSize.find("x");
                fanart->width = atoi(fanartSize.substr(0, posX).c_str());
                fanart->height = atoi(fanartSize.substr(posX+1).c_str());
            }
            xmlFree(node_content);
        }
    }
    if ( (fanart->url.size() == 0) || 
         ((fanart->language.compare(language)) && (fanart->language.compare(fallbackLanguage)))) {
        delete fanart;
        return;
    }
    fanarts->push_back(fanart);
}

void cTVDBSeriesMedia::ReadPoster(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    cTVDBPoster *poster = new cTVDBPoster();
    //default size
    poster->width = 400;
    poster->height = 578;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerPath")) {
                poster->url = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Language")) {
                poster->language = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Rating")) {
                poster->rating = atof((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerType2")) {
                string posterSize = (const char *)node_content;
                size_t posX = posterSize.find("x");
                poster->width = atoi(posterSize.substr(0, posX).c_str());
                poster->height = atoi(posterSize.substr(posX+1).c_str());
            }
            xmlFree(node_content);
        }
    }
    if ( (poster->url.size() == 0) || 
         ((poster->language.compare(language)) && (poster->language.compare(fallbackLanguage)))) {
        delete poster;
        return;
    }
    posters->push_back(poster);
}

void cTVDBSeriesMedia::ReadSeasonPoster(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    cTVDBSeasonPoster *poster = new cTVDBSeasonPoster();
    poster->width = 400;
    poster->height = 578;
    bool add = true;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerPath")) {
                poster->url = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Language")) {
                poster->language = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Rating")) {
                poster->rating = atof((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Season")) {
                poster->season = atoi((const char *)node_content);
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerType2")) {
                string bt2 = (const char *)node_content;
                if (!bt2.compare("seasonwide"))
                    add = false;
            }
            xmlFree(node_content);
        }
    }
    if ( (poster->url.size() == 0) || 
         (poster->season == 0) ||
         (!add) ||
         ((poster->language.compare(language)) && (poster->language.compare(fallbackLanguage)))) {
        delete poster;
        return;
    }
    seasonPosters->push_back(poster);
}

void cTVDBSeriesMedia::ReadBanner(xmlDoc *doc, xmlNode *node) {
    xmlNode *cur_node = NULL;
    xmlChar *node_content;
    cTVDBBanner *banner = new cTVDBBanner();
    banner->width = 758;
    banner->height = 140;
    for (cur_node = node; cur_node; cur_node = cur_node->next) {
        if (cur_node->type == XML_ELEMENT_NODE) {
            node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
            if (!node_content)
                continue;
            if (!xmlStrcmp(cur_node->name, (const xmlChar *)"BannerPath")) {
                banner->url = mirrors->GetMirrorBanner() + (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Language")) {
                banner->language = (const char *)node_content;
            } else if (!xmlStrcmp(cur_node->name, (const xmlChar *)"Rating")) {
                banner->rating = atof((const char *)node_content);
            }
            xmlFree(node_content);
        }
    }
    if ( (banner->url.size() == 0) || 
         ((banner->language.compare(language)) && (banner->language.compare(fallbackLanguage)))) {
        delete banner;
        return;
    }
    banners->push_back(banner);
}
