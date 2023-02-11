
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

   uint page {0};
   bool ready {false};
   std::string method = "series/" + std::to_string(seriesID) + "/episodes/default/" + lang;

   while (!ready)
   {
      std::map<std::string,std::string> parameters;

      parameters["page"] = std::to_string(page++);

      json_t* jResult {};

      if (tvdbV4.get(method.c_str(), jResult, &parameters) != success)
         return fail;

      parseEpisodes(jResult);

      const char* next = getStringByPath(jResult, "links/next", "");

      if (isEmpty(next) || !strstr(next, "page="))
         ready = true;

      json_decref(jResult);
   }

   return success;
}

int cTVDBSeries::readEpisodesExtended(Episode& episode)
{
   // https://api4.thetvdb.com/v4/episodes/4202143/extended?meta=translations

   std::string method = "episodes/" + std::to_string(episode.id) + "/extended";
   std::map<std::string,std::string> parameters;
   parameters["meta"] = "translations";

   json_t* jResult {};

   if (tvdbV4.get(method.c_str(), jResult, &parameters) != success)
      return fail;

   parseEpisodesExtended(jResult, episode);
   json_decref(jResult);

   return success;
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

   if (!jData)
      return 0;

   json_t* j = getObjectFromJson(jData, "episodes");

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

      // readEpisodesExtended(episode);  // takes to long :(

      // lastUpdated - like "2023-01-08 02:21:27",

      episode.lastUpdated = str2LTime(getStringFromJson(jItem, "lastUpdated", ""), "%Y-%m-%d %H:%M:%S");
      episodes.push_back(std::move(episode));
   }

   return success;
}

int cTVDBSeries::parseEpisodesExtended(json_t* jResult, Episode& episode)
{
   size_t item {0}; json_t* jItem {};
   json_t* jData = getObjectFromJson(jResult, "data");

   if (!jData)
      return 0;

   uint n {};
   json_t* j = getObjectFromJson(jData, "characters");

   json_array_foreach(j, item, jItem)
   {
      int type = getIntFromJson(jItem, "type");
      const char* url = getStringFromJson(jItem, "url", "");
      const char* name = getStringFromJson(jItem, "name");
      const char* personName = getStringFromJson(jItem, "personName", "");
      const char* peopleType = getStringFromJson(jItem, "peopleType", "");

      tell(0, "Additional character (%d/%d): %s/%s as '%s'(%d) [%s]", episode.seriesID, episode.id, name, personName, peopleType, type, url);
      n++;
   }

   tell(0, "Got %d Additional characters for series/episode %d/%d", n,  episode.seriesID, episode.id);
   return success;
}

int cTVDBSeries::getPartAndSeason(int episodeId, int& season, int& part)
{
   for (const auto& episode : episodes)
   {
      if (episode.id == episodeId)
      {
         season = episode.seasonNumber;
         part = episode.number;
         return success;
      }
   }

   return fail;
}
