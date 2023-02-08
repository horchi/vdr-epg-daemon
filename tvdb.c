
#include "lib/curl.h"
#include "lib/config.h"
#include "lib/common.h"
#include "lib/json.h"

const char* logPrefix {""};

const char* tvdbV4Url {"https://api4.thetvdb.com/v4/"};
const char* tvdbApiKey {"66b48091-4ebc-4a84-865b-07f73ba1123e"};
// const char* tvdbApiKey {"5476e702-85aa-45fd-a8da-e74df3840baf"};
std::string tvdbToken {""};
const char* language {"de"};

cCurl curlApiV4;

//***************************************************************************
// TVDB GET Helper
//***************************************************************************

int tvdbGet(cCurl* curl, const char* method, json_t*& jResult, std::map<std::string,std::string>* parameters)
{
   std::string url = std::string(tvdbV4Url) + method;
   MemoryStruct data;

   if (curl->get(url.c_str(), &data, parameters) != success)
   {
      tell(0, "Request failed");
      return fail;
   }

   jResult = jsonLoad(data.memory);

   if (!jResult)
      return fail;

   const char* state = getStringFromJson(jResult, "status", "fail");

   if (strcmp(state, "success") != 0)
   {
      tell(eloAlways, "TvDb: Api call '%s' failed with '%s'", "search", data.memory);
      json_decref(jResult);
      jResult = nullptr;
      return fail;
   }

   return success;
}

//***************************************************************************
// TVDB Post
//***************************************************************************

int tvdbPost(const char* method, json_t* jObject, json_t*& jResult)
{
   std::string result;
   jResult = nullptr;
   std::string url = std::string(tvdbV4Url) + method;

   char* jString = json_dumps(jObject, JSON_REAL_PRECISION(4));
   json_decref(jObject);
   int status = curlApiV4.post(url.c_str(), jString, result);
   free(jString);

   if (status != success)
   {
      tell(0, "Request failed");
      return fail;
   }

   tell(0, "<- [%s]", result.c_str());
   jResult = jsonLoad(result.c_str());

   if (!jResult)
   {
      tell(eloAlways, "Got invalid format in [%s]", result.c_str());
      return fail;
   }

   const char* state = getStringFromJson(jResult, "status", "fail");

   if (strcmp(state, "success") != 0)
   {
      tell(eloAlways, "TvDb: Api call '%s' failed with '%s'", method, result.c_str());
      json_decref(jResult);
      jResult = nullptr;
      return fail;
   }

   return status;
}

//***************************************************************************
// TVDB Login
//***************************************************************************

int login()
{
   json_t* j = json_object();
   json_object_set_new(j, "apikey", json_string(tvdbApiKey));

   json_t* jResult {};

   curlApiV4.clearHeader();
   curlApiV4.addHeader("accept: application/json");
   curlApiV4.addHeader("Content-Type: application/json");
   curlApiV4.addHeader("charset: utf-8");

   if (tvdbPost("login", j, jResult) != success)
      return fail;

   json_t* jData = getObjectFromJson(jResult, "data");
   tvdbToken = getStringFromJson(jData, "token", "");
   json_decref(jResult);

   tell(eloAlways, "TvDb: Login succeeded");
   tell(eloDebug2, "TvDb: Got token '%s'", tvdbToken.c_str());
   curlApiV4.addHeader("Authorization: Bearer %s", tvdbToken.c_str());

   return success;
}

int logout()
{
   curlApiV4.clearHeader();
   return success;
}

std::map<std::string,std::string> languages =
{
   { "de", "deu"},
   { "en", "eng"}
};

int readSeriesId(const char* seriesName)
{
   MemoryStruct data;
   std::map<std::string,std::string> parameters;
   json_t* jResult {};

   parameters["query"] = seriesName;
   parameters["type"] = "series";
   parameters["language"] = languages[language];

   // std::string url = std::string(tvdbV4Url) + "search";

   if (tvdbGet(&curlApiV4, "search", jResult, &parameters) != success)
      return 0;

   const char* state = getStringFromJson(jResult, "status", "fail");

   if (strcmp(state, "success") != 0)
   {
      tell(eloAlways, "TvDb: Api call '%s' failed with '%s'", "search", data.memory);
      json_decref(jResult);
      return 0;
   }

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

      printf("check name '%s'\n", name);

      if (strcasestr(name, seriesName))
      {
         seriesID = atoi(getStringFromJson(jSeries, "tvdb_id"));
         printf("Found series '%s', id is %d\n", name, seriesID);
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
               printf("Found series '%s' by alias '%s', id is %d\n", name, alias, seriesID);
               break;
            }
         }
      }
   }

   json_decref(jResult);

   return seriesID;
}

//***************************************************************************
// Main
//***************************************************************************

int main(int argc, char** argv)
{
   if (argc > 1 && strcmp(argv[1], "-c") == 0)
   {
      char partName[200+TB] {};
      char comment[200+TB] {};
      int se {0};
      int ep {0};
      int no {0};

      printf("------------------------------\n");
      printf("constable episode line sscanf test\n");
      printf("------------------------------\n");

      const char* line = {"22\t11\t1\tfooo bar\tcomment ja ja nein oder?"};
      printf("got '%s'\n", line);

      // get lines like:
      //    "01<tab>1<tab>1<tab>Schatten der Vergangenheit<tab>[extcol1<tab>[extcol2<tab>[extcol3]]][<tab>#comment]<tab>"

      if (sscanf(line, "%d\t%d\t%d\t%200[^\t\n]\t%200[^\t\n]", &se, &ep, &no, partName, comment) < 4)
         printf("CONSTABEL: Warning: Got invalid episode line [%s], at least 4 columns expected\n", line);
      else
         printf("%d/%d/%d '%s' - %s\n", se, ep, no, partName, comment);

      return 0;
   }

   if (argc == 3 && strcmp(argv[1], "-s") == 0)
   {
      int hours = atoi(argv[2]);

      // time(0);

      printf("unix timesatmp before %d hours is: %ld\n", hours, time(0) - hours * 60*60);

      return 0;
   }

   if (argc < 2)
   {
      printf("Missing argument\n");
      return 1;
   }

   // create global cCurl instance

   cEpgConfig::logstdout = yes;
   cEpgConfig::loglevel = 2;

   cCurl::create();
   curlApiV4.init();

   // TVDB Stuff

   login();

   readSeriesId(argv[1]);

   logout();

   // exit

   curlApiV4.exit();
   cCurl::destroy();

   return success;
}
