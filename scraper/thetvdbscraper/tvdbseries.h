
#pragma once

#include <iostream>
#include <string>
#include <sstream>
#include <vector>

#include "../../lib/json.h"

//***************************************************************************
// cTVDBSeries
//***************************************************************************

class cTVDBSeries
{
   public:

      enum ArtworkType
      {
         atBanner       = 1,
         atPoster       = 2,
         atBackground   = 3,
         atIcon         = 5,
         atSeasonPoster = 7,
         atEpisode      = 12,
         atActor        = 13,
         atCinemagraph  = 20,
         atClearArt     = 22,
         atClearLogo    = 23
      };

      struct Artwork
      {
         std::string url;
         std::string urlThump;
         std::string language;
         uint type {0};
         uint seasonId {0};
         uint width {0};
         uint height {0};
         double rating {0.0};
      };

      struct Actor
      {
         std::string thumbUrl;
         int thumbUrlWidth {300};
         int thumbUrlHeight {450};
         std::string name;
         std::string role;
         int id {0};
         int sortOrder {0};
      };

      struct Episode
      {
         int id {0};
         int seriesID {0};
         int number {0};
         int seasonNumber {0};
         std::string name;
         std::string firstAired;
         std::string guestStars;
         std::string overview;
         float rating {0};
         std::string imageUrl;
         int width {400};
         int height {225};
         int lastUpdated {0};
      };

      cTVDBSeries(int id, std::string aLang);
      virtual ~cTVDBSeries();

      int readSeries();
      int readEpisodes();

      int getPartAndSeason(int episodeId, int &season, int &part);

      const std::vector<Artwork>* getArtwork() const { return &artworks; }
      const std::vector<Actor>* getActors() const { return &actors; }
      const std::vector<Episode>* getEpisodes() const { return &episodes; }

      int seriesID {0};
      int lastUpdated {0};
      float rating {0.0};
      std::string name;
      std::string genre;
      std::string overview;
      std::string firstAired;
      std::string network;
      std::string status;

      static std::map<uint,std::string> artworkTypes;

   private:

      int parseSeries(json_t* jResult);
      int parseEpisodes(json_t* jResult);

      std::vector<Artwork> artworks;
      std::vector<Actor> actors;
      std::vector<Episode> episodes;
      std::string lang;
};
