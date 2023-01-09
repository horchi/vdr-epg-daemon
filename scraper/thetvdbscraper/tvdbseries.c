
#include "../../lib/curl.h"

#include "tvdbseries.h"
#include "tvdbv4.h"

using namespace std;

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

cTVDBSeries::cTVDBSeries(int id, string aLang)
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

   return parseSeries(jResult);
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

   return parseEpisodes(jResult);
}

int cTVDBSeries::parseSeries(json_t* jResult)
{
   size_t item {0}; json_t* jItem {};
   json_t* jData = getObjectFromJson(jResult, "data");
   json_t* j {};

   if (!jData)
      return 0;

   // firstAired

   firstAired = getStringFromJson(jData, "firstAired");

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

         if (type == atSeasonPoster)
            artwork.seasonId = getIntFromJson(jItem, "seasonId", 0);

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
