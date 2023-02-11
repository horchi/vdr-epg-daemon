
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

// --- cTVDBScraper -------------------------------------------------------------

class cTVDBScraper
{
   public:

      explicit cTVDBScraper(std::string language);
      virtual ~cTVDBScraper();

      int connect();
      int disconnect();
      int GetServerTime();
      cTVDBSeries* scrapByName(const char* seriesName);
      bool GetUpdatedSeriesandEpisodes(std::set<int>* updatedSeries, std::set<int>* updatedEpisodes, int lastScrap);
      cTVDBSeries* getSeries(int seriesID);
      int getUpdates(time_t since, std::set<int>& seriesIds);

   private:

      int readSeriesId(const char* seriesName);

      std::string language;
      static std::map<std::string,std::string> languages;
};
