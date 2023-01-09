
#pragma once

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <set>

#include "../../lib/curl.h"
#include "../../lib/json.h"

#include "tvdbseries.h"

using namespace std;

// --- cTVDBScraper -------------------------------------------------------------

class cTVDBScraper
{
   public:

      cTVDBScraper(std::string language);
      virtual ~cTVDBScraper();

      int connect();
      int disconnect();
      int GetServerTime();
      cTVDBSeries* scrapByName(const char* seriesName);
      bool GetUpdatedSeriesandEpisodes(set<int>* updatedSeries, set<int>* updatedEpisodes, int lastScrap);
      cTVDBSeries* getSeries(int seriesID);

   private:

      int readSeriesId(const char* seriesName);

      std::string language;
      static std::map<std::string,std::string> languages;
};
