/*
 * tvdbv4.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "tvdbv4.h"

const char* cTVDBv4::tvdbV4Url {"https://api4.thetvdb.com/v4/"};
const char* cTVDBv4::tvdbApiKey {"5476e702-85aa-45fd-a8da-e74df3840baf"};
const char* cTVDBv4::tvdbArtworkUrl {"https://artworks.thetvdb.com"};

//***************************************************************************
// Singelton
//***************************************************************************

cTVDBv4 tvdbV4;

//***************************************************************************
// cTVDBv4
//***************************************************************************

cTVDBv4::cTVDBv4()
{
}

cTVDBv4::~cTVDBv4()
{
   logout();
}

int cTVDBv4::logout()
{
   curl.exit();
   return done;
}

int cTVDBv4::login(const char* aLang)
{
   lang = aLang;

   curl.init();

   tell(eloAlways, "TvDb: Try login to '%s'", tvdbV4Url);

   json_t* j = json_object();
   json_object_set_new(j, "apikey", json_string(tvdbApiKey));

   json_t* jResult {};

   curl.clearHeader();
   curl.addHeader("accept: application/json");
   curl.addHeader("Content-Type: application/json");
   curl.addHeader("charset: utf-8");

   if (post("login", j, jResult) != success)
      return fail;

   json_t* jData = getObjectFromJson(jResult, "data");
   const char* tvdbToken = getStringFromJson(jData, "token", "");

   tell(eloAlways, "TvDb: Login succeeded");
   tell(eloDebug2, "TvDb: Got token '%s'", tvdbToken);
   curl.addHeader("Authorization: Bearer %s", tvdbToken);

   json_decref(jResult);

   return success;
}

//***************************************************************************
// Post
//***************************************************************************

int cTVDBv4::post(const char* method, json_t* jObject, json_t*& jResult)
{
   std::string result;
   jResult = nullptr;
   std::string url = std::string(tvdbV4Url) + method;

   char* jString = json_dumps(jObject, JSON_REAL_PRECISION(4));
   json_decref(jObject);
   int status = curl.post(url.c_str(), jString, result);
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
// Get
//***************************************************************************

int cTVDBv4::get(const char* method, json_t*& jResult, std::map<std::string,std::string>* parameters)
{
   std::string url = std::string(tvdbV4Url) + method;
   MemoryStruct data;

   if (curl.get(url.c_str(), &data, parameters) != success)
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
