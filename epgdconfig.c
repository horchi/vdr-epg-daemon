/*
 * config.c:
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "lib/epgservice.h"

#include "epgdconfig.h"

cEpgdConfig EpgdConfig;

//***************************************************************************
// cEpgdConfig
//***************************************************************************

cEpgdConfig::cEpgdConfig()
   : cEpgConfig()
{
   checkInitial = yes;
   updatetime = 6;        // hours
   days = 8;
   upddays = 2;
   storeXmlToFs = no;

   maximagesperevent = 1;
   epgImageSize = 2;

   seriesEnabled = yes;
   sstrcpy(seriesUrl, "www.eplists.de", sizeof(seriesUrl));
   *seriesMail = 0;
   seriesPort = 2006;
   storeSeriesToFs = no;

   sstrcpy(cachePath, "/var/cache/epgd", sizeof(cachePath));
   sstrcpy(httpPath, "/var/epgd/www", sizeof(httpPath));
   sstrcpy(pluginPath, PLGDIR, sizeof(pluginPath));
   sstrcpy(epgView, "eventsview.sql", sizeof(epgView));
   sstrcpy(epgViewWeb, "eventsviewplain.sql", sizeof(epgViewWeb));
   sstrcpy(theTvDBView, "thetvdbview.sql", sizeof(theTvDBView));
   sstrcpy(scrapMovieDbApiKey, "abb01b5a277b9c2c60ec0302d83c5ee9", sizeof(scrapMovieDbApiKey));
   updateThreshold = 200;
   maintanance = no;

   httpPort = 9999;
   *httpDevice = 0;
   httpUseTls = no;
   *httpUser = 0;
   *httpPass = 0;

   *proxy = 0;            // the proxy
   *proxyuser = 0;        // proxy user
   *proxypwd = 0;         // proxy password

   scrapEpg = yes;
   scrapRecordings = yes;
}
