
#include "tvdbv4.h"
#include "thetvdbscraper.h"

using namespace std;

map<std::string,std::string> cTVDBScraper::languages =
{
   { "de", "deu"},
   { "en", "eng"}
};

cTVDBScraper::cTVDBScraper(std::string aLanguage)
{
   language = aLanguage;
}

cTVDBScraper::~cTVDBScraper()
{
}

cTVDBSeries* cTVDBScraper::scrapByName(const char* seriesName)
{
   int seriesID = readSeriesId(seriesName);

   if (!seriesID)
      return nullptr;

   return new cTVDBSeries(seriesID, languages[language]);
}

cTVDBSeries* cTVDBScraper::getSeries(int seriesID)
{
   return new cTVDBSeries(seriesID, languages[language]);
}

int cTVDBScraper::connect()
{
   tvdbV4.login(languages[language].c_str());

   return success;
}

int cTVDBScraper::disconnect()
{
   return success;
}

/*
bool cTVDBScraper::GetUpdatedSeriesandEpisodes(set<int>* updatedSeries, set<int>* updatedEpisodes, int lastScrap)
{
   tell(eloAlways, "GetUpdatedSeriesandEpisodes -> to be implemeted");
   return true;

    stringstream url;
    url << "http://thetvdb.com/api/Updates.php?type=all&time=" << lastScrap;
    string updatedXML;

    if (!curl.GetUrl(url.str().c_str(), &updatedXML))
        return false;

    xmlDoc* doc = SetXMLDoc(updatedXML);

    if (doc == NULL)
       return false;

    // Root Element has to be <Items>

    xmlNode *node = NULL;
    node = xmlDocGetRootElement(doc);

    if (!(node && !xmlStrcmp(node->name, (const xmlChar *)"Items")))
    {
        xmlFreeDoc(doc);
        return false;
    }

    xmlNode *cur_node = node->children;
    for (; cur_node; cur_node = cur_node->next)
    {
       if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Series"))
       {
          xmlChar *node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
          int seriesId = atoi((const char *)node_content);
          xmlFree(node_content);
          updatedSeries->insert(seriesId);
       }
       else if ((cur_node->type == XML_ELEMENT_NODE) && !xmlStrcmp(cur_node->name, (const xmlChar *)"Episode"))
       {
          xmlChar *node_content = xmlNodeListGetString(doc, cur_node->xmlChildrenNode, 1);
          int episodeId = atoi((const char *)node_content);
          xmlFree(node_content);
          updatedEpisodes->insert(episodeId);
       }
    }

    xmlFreeDoc(doc);
    return true;
} */

int cTVDBScraper::readSeriesId(const char* seriesName)
{
   MemoryStruct data;
   std::map<std::string,std::string> parameters;

   parameters["query"] = seriesName;
   parameters["type"] = "series";
   parameters["language"] = languages[language];

   json_t* jResult {};

   if (tvdbV4.get("search", jResult, &parameters) != success)
      return 0;

   json_t* jData = getObjectFromJson(jResult, "data");

   if (!jData)
      return 0;

   int seriesID {0};
   size_t index {0};
   json_t* jSeries {};

   json_array_foreach(jData, index, jSeries)
   {
      // #TODO use LV insted of strstr

      const char* name = getStringFromJson(jSeries, "name", "");

      if (strcasestr(name, seriesName))
      {
         seriesID = atoi(getStringFromJson(jSeries, "tvdb_id"));
         // tell(eloAlways, "Found series '%s', id is %d", name, seriesID);
         break;
      }

      json_t* jAliases = getObjectFromJson(jSeries, "aliases");

      if (jAliases)
      {
         size_t i {0};
         json_t* jAlias {};

         json_array_foreach(jAliases, i, jAlias)
         {
            const char* alias = json_string_value(jAlias);

            if (alias && strcasestr(alias, seriesName))
            {
               seriesID = atoi(getStringFromJson(jSeries, "tvdb_id"));
               // printf("Found series '%s' by alias '%s', id is %d\n", name, alias, seriesID);
               break;
            }
         }
      }
   }

   json_decref(jResult);

   return seriesID;
}
