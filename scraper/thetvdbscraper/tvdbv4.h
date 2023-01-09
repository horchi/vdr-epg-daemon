/*
 * tvdbv4.h
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include <string>
#include <vector>
#include <map>

#include "../../lib/curl.h"
#include "../../lib/json.h"

class cTVDBv4
{
   public:

      cTVDBv4();
      virtual ~cTVDBv4();

      int login(const char* aLang);
      int logout();

      const char* getLang() { return lang; }
      int post(const char* method, json_t* jObject, json_t*& jResult);
      int get(const char* method, json_t*& jResult, std::map<std::string,std::string>* parameters = 0);

      static const char* tvdbApiKey;
      static const char* tvdbV4Url;

   private:

      const char* lang;
      cCurl curl;
};

extern cTVDBv4 tvdbV4;
