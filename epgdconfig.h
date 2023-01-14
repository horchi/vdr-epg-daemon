/*
 * epgdconfig.h:
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#pragma once

#include "lib/config.h"

//***************************************************************************
// Config
//***************************************************************************

struct cEpgdConfig : public cEpgConfig
{
   public:

      cEpgdConfig() : cEpgConfig() {};

      int checkInitial {yes};
      int updatetime {6};
      int days {8};
      int upddays {2};
      int storeXmlToFs {no};

      int maximagesperevent {1};
      int epgImageSize {2};

      int seriesEnabled {yes};
      char seriesUrl[500+TB] {"www.eplists.de"};
      char seriesMail[500+TB] {};
      int seriesPort {2006};
      int storeSeriesToFs {no};

      char cachePath[256+TB] {"/var/cache/epgd"};
      char httpPath[256+TB] {"/var/epgd/www"};
      char pluginPath[256+TB] {PLGDIR};
      char epgView[100+TB] {"eventsview.sql"};
      char epgViewWeb[100+TB] {"eventsviewplain.sql"};
      char theTvDBView[100+TB] {"thetvdbview.sql"};

      int updateThreshold {200};
      int maintanance {no};
      int httpPort {9999};
      char httpDevice[20+TB] {};
      int httpUseTls {no};
      char httpUser[100+TB] {};
      char httpPass[100+TB] {};
      char proxy[256+TB] {};
      char proxyuser[100+TB] {};
      char proxypwd[100+TB] {};
      char scrapMovieDbApiKey[100+TB] {"abb01b5a277b9c2c60ec0302d83c5ee9"};
      int scrapEpg {yes};
      int scrapRecordings {yes};
};

extern cEpgdConfig EpgdConfig;
