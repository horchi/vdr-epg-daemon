
#include "../../lib/curl.h"

#include "tvdbseries.h"
#include "tvdbv4.h"

std::map<uint,std::string> cTVDBSeries::artworkTypes =
{
   { atBanner,       "Banner"},
   { atPoster,       "Poster"},
   { atBackground,   "Background"},
   { atIcon,         "Icon"},
   { atSeasonPoster, "Season Poster"},
   { atEpisode,      "Episode Screencap" },
   { atActor,        "Actor" },
   { atCinemagraph,  "Cinemagraph"},
   { atClearArt,     "ClearArt"},
   { atClearLogo,    "ClearLogo"},
};

cTVDBSeries::cTVDBSeries(int id, std::string aLang)
{
   lang = aLang;
   seriesID = id;
}

cTVDBSeries::~cTVDBSeries()
{
}

int cTVDBSeries::readSeries()
{
   // https://api4.thetvdb.com/v4/series/75682/extended?meta=translations&short=false

   MemoryStruct data;
   std::map<std::string,std::string> parameters;

   parameters["meta"] = "translations";
   parameters["short"] = "false";

   json_t* jResult {};

   std::string method = "series/" + std::to_string(seriesID) + "/extended";

   if (tvdbV4.get(method.c_str(), jResult, &parameters) != success)
      return fail;

   int status = parseSeries(jResult);
   json_decref(jResult);

   readEpisodes();

   return status;
}

int cTVDBSeries::readEpisodes()
{
   // https://api4.thetvdb.com/v4/series/75682/episodes/default/deu?page=0

   MemoryStruct data;
   std::map<std::string,std::string> parameters;
   json_t* jResult {};

   parameters["page"] = "0";

   std::string method = "series/" + std::to_string(seriesID) + "/episodes/default/" + lang;

   if (tvdbV4.get(method.c_str(), jResult, &parameters) != success)
      return fail;

   int status = parseEpisodes(jResult);

   const char* next = getStringByPath(jResult, "links/next", "");

   if (next && strstr(next, "page="))
   {
      const char* p = strstr(next, "page=");
      p += 5;
      tell(eloAlways, "---- TODO, get next page %d", atoi(p));
   }

   json_decref(jResult);

   return status;
}

int cTVDBSeries::parseSeries(json_t* jResult)
{
   size_t item {0}; json_t* jItem {};
   json_t* jData = getObjectFromJson(jResult, "data");
   json_t* j {};

   if (!jData)
      return 0;

   // firstAired

   firstAired = getStringFromJson(jData, "firstAired", "");

   // genres

   j = getObjectFromJson(jData, "genres");

   json_array_foreach(j, item, jItem)
      genre += std::string(getStringFromJson(jItem, "name", "")) + "/";

   trimAt(genre, -1);

   // network

   network = getStringByPath(jData, "originalNetwork/name", "");

   // overview

   j = getObjectByPath(jData, "translations/overviewTranslations");

   json_array_foreach(j, item, jItem)
   {
      if (getStringFromJson(jItem, "language", "") == lang)
         overview = getStringFromJson(jItem, "overview", "");
   }

   if (overview == "")
      overview = getStringFromJson(jData, "overview", "");

   // rating -> not found
   // imbdid from "IMDB_ID" -> not found

   // name

   j = getObjectFromJson(jData, "aliases");

   json_array_foreach(j, item, jItem)
   {
      if (getStringFromJson(jItem, "language", "") == lang)
         name = getStringFromJson(jItem, "name", "");
   }

   if (name == "")
      name = getStringFromJson(jData, "name", "");

   status = getStringByPath(jData, "status/name", "");

   // lastUpdated - like "2023-01-08 02:21:27",

   lastUpdated = str2LTime(getStringFromJson(jData, "lastUpdated", ""), "%Y-%m-%d %H:%M:%S");

   // seasons

   struct Season
   {
      uint id {0};
      uint number {0};
      uint imageType {0};
      std::string image;
   };

   std::map<uint,Season> seasons;

   j = getObjectFromJson(jData, "seasons");

   json_array_foreach(j, item, jItem)
   {
      if (getIntByPath(jItem, "type/id") != 1)
         continue;

      uint id = getIntFromJson(jItem, "id", 0);
      seasons[id].id = id;
      seasons[id].number = getIntFromJson(jItem, "number", 0);
      seasons[id].imageType = getIntFromJson(jItem, "imageType", 0);
      seasons[id].image = getStringFromJson(jItem, "image", "");
   }

   j = getObjectFromJson(jData, "artworks");

   // artwork

   j = getObjectFromJson(jData, "artworks");

   json_array_foreach(j, item, jItem)
   {
      int type = getIntFromJson(jItem, "type");

      if (artworkTypes.find(type) != artworkTypes.end())
      {
         Artwork artwork {};

         artwork.type = type;
         artwork.url = getStringFromJson(jItem, "image", "");
         artwork.urlThump = getStringFromJson(jItem, "thumbnail", "");
         artwork.language = getStringFromJson(jItem, "language", "");
         artwork.width = getIntFromJson(jItem, "width");
         artwork.height = getIntFromJson(jItem, "height");

         if (!artwork.url.empty() && artwork.url[0] == '/')
            artwork.url = cTVDBv4::tvdbArtworkUrl + artwork.url;

         if (!artwork.urlThump.empty() && artwork.urlThump[0] == '/')
            artwork.urlThump = cTVDBv4::tvdbArtworkUrl + artwork.urlThump;

         if (type == atSeasonPoster)
         {
            uint sessionId = getIntFromJson(jItem, "seasonId", 0);

            if (seasons.find(sessionId) == seasons.end() || artwork.url != seasons[sessionId].image)
               continue;

            artwork.seasonId = seasons[sessionId].number;
         }

         // tell(eloAlways, "Debug: Series (%d) got artwork '%s'", seriesID, artwork.url.c_str());
         artworks.push_back(std::move(artwork));
      }
   }

   // actors

   j = getObjectFromJson(jData, "characters");

   json_array_foreach(j, item, jItem)
   {
      Actor actor {};

      actor.id = getIntFromJson(jItem, "id", 0);
      actor.name = getStringFromJson(jItem, "personName", "");
      actor.role = getStringFromJson(jItem, "name", "");
      actor.thumbUrl = getStringFromJson(jItem, "image", "");
      actor.sortOrder = getIntFromJson(jItem, "sort", 0);

      actors.push_back(std::move(actor));
   }

   return success;
}

int cTVDBSeries::parseEpisodes(json_t* jResult)
{
   size_t item {0}; json_t* jItem {};
   json_t* jData = getObjectFromJson(jResult, "data");
   json_t* j {};

   if (!jData)
      return 0;

   j = getObjectFromJson(jData, "episodes");

   json_array_foreach(j, item, jItem)
   {
      Episode episode {};

      episode.id = getIntFromJson(jItem, "id", 0);
      episode.seriesID = seriesID;
      episode.number = getIntFromJson(jItem, "number", 0);
      episode.seasonNumber = getIntFromJson(jItem, "seasonNumber", 0);
      episode.name = getStringFromJson(jItem, "name", "");
      episode.firstAired = getStringFromJson(jItem, "aired", "");
      episode.overview = getStringFromJson(jItem, "overview", "");
      episode.imageUrl = getStringFromJson(jItem, "image", "");
      // episode.guestStars = "";
      // episode.rating = 0;

      if (!episode.imageUrl.empty() && episode.imageUrl[0] == '/')
         episode.imageUrl = cTVDBv4::tvdbArtworkUrl + episode.imageUrl;

      // lastUpdated - like "2023-01-08 02:21:27",

      episode.lastUpdated = str2LTime(getStringFromJson(jItem, "lastUpdated", ""), "%Y-%m-%d %H:%M:%S");

      episodes.push_back(std::move(episode));
   }

   return success;
}

bool cTVDBSeries::getPartAndSeason(int episodeId, int &season, int &part)
{
   // for (vector<cTVDBEpisode*>::iterator ep = episodes.begin(); ep != episodes.end(); ep++)
   // {
   //    cTVDBEpisode* episode = *ep;

   //    if(episode->id == episodeId)
   //    {
   //       season = episode->season;
   //       part = episode->number;
   //       return true;
   //    }
   // }

   return false;
}
