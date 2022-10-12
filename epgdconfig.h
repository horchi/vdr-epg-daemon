/*
 * epgdconfig.h:
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#ifndef __EPGD_CONFIG_H
#define __EPGD_CONFIG_H

#include "lib/config.h"

//***************************************************************************
// Config
//***************************************************************************

struct cEpgdConfig : public cEpgConfig
{
   public:

      cEpgdConfig();

      int checkInitial;
      int updatetime;
      int days;
      int upddays;
      int storeXmlToFs;

      int maximagesperevent;
      int epgImageSize;

      int seriesEnabled;
      char seriesUrl[500+TB];
      char seriesMail[500+TB];
      int seriesPort;
      int storeSeriesToFs;

      char cachePath[256+TB];
      char httpPath[256+TB];
      char pluginPath[256+TB];
      char epgView[100+TB];
      char epgViewWeb[100+TB];
      char theTvDBView[100+TB];
      int updateThreshold;
      int maintanance;
      int httpPort;
      char httpDevice[20+TB];
      int httpUseTls;
      char httpUser[100+TB];
      char httpPass[100+TB];
      char proxy[256+TB];
      char proxyuser[100+TB];
      char proxypwd[100+TB];
      char scrapMovieDbApiKey[100+TB];
      int scrapEpg;
      int scrapRecordings;
};

extern cEpgdConfig EpgdConfig;

//***************************************************************************

#endif // __EPGD_CONFIG_H
