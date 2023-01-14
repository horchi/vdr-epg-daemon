
// test page:
//    https://thetvdb.github.io/v4-api/

#include "tvdbv4.h"
#include "thetvdbscraper.h"

std::map<std::string,std::string> cTVDBScraper::languages =
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

int cTVDBScraper::getUpdates(time_t since, std::set<int>& seriesIds)
{
   // https://api4.thetvdb.com/v4/updates?since=1673602620&type=episodes&action=update

   std::map<std::string,std::string> parameters;
   uint page {0};
   bool ready {false};

   parameters["since"] = std::to_string(since);
   parameters["type"] = "episodes";
   parameters["action"] = "update";

   while (!ready)
   {
      parameters["page"] = std::to_string(page++);

      json_t* jResult {};

      if (tvdbV4.get("updates", jResult, &parameters) != success)
         return 0;

      json_t* jData = getObjectFromJson(jResult, "data");
      size_t item {0}; json_t* jItem {};

      if (!jData)
      {
         tell(0, "TvDb: Query updates page %d failed", page);
         continue;
      }

      json_array_foreach(jData, item, jItem)
         seriesIds.insert(getIntFromJson(jItem, "seriesId", 0));

      const char* next = getStringByPath(jResult, "links/next", "");

      if (isEmpty(next) || !strstr(next, "page="))
         ready = true;

      json_decref(jResult);
   }

   return success;
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

int cTVDBScraper::readSeriesId(const char* seriesName)
{
   // https://api4.thetvdb.com/v4/search?language=deu&query=Bones%20-%20Die%20Knochenj%C3%A4gerin&type=series
   // https://api4.thetvdb.com/v4/search?language=deu&query=Diagnose%3A%20Mord&type=series

   std::map<std::string,std::string> parameters;

   parameters["query"] = seriesName;
   parameters["type"] = "series";
   parameters["language"] = languages[language];

   json_t* jResult {};

   if (tvdbV4.get("search", jResult, &parameters) != success)
      return 0;

   json_t* jData = getObjectFromJson(jResult, "data");

   if (!jData)
   {
      tell(0, "Missing 'data' in result of of call for '%s'", seriesName);
      return 0;
   }

   int seriesID {0};
   size_t index {0};
   json_t* jSeries {};

   json_array_foreach(jData, index, jSeries)
   {
      // #TODO use LV insted of strstr

      const char* name = getStringFromJson(jSeries, "name", "");

      if (strcasestr(name, seriesName))
      {
         seriesID = atoi(getStringFromJson(jSeries, "tvdb_id", ""));
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
               seriesID = atoi(getStringFromJson(jSeries, "tvdb_id", ""));
               // printf("Found series '%s' by alias '%s', id is %d\n", name, alias, seriesID);
               break;
            }
         }
      }
   }

   // nichts gefunden, ersten treffer verwenden ...

   if (!seriesID)
   {
      jSeries = json_array_get(jData, 0);
      seriesID = atoi(getStringFromJson(jSeries, "tvdb_id", ""));
      tell(0, "Series '%s' not found by aliases, using first of (%ld) search results -> (%d)", seriesName, json_array_size(jData), seriesID);
   }

   json_decref(jResult);

   return seriesID;
}
