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
   strcpy(seriesUrl, "www.eplists.de");
   strcpy(cachePath, "/var/cache/epgd");
   strcpy(httpPath, "/var/epgd/www");
   strcpy(pluginPath, PLGDIR);
   strcpy(epgView, "eventsview.sql");
   strcpy(epgViewWeb, "eventsviewplain.sql");
   strcpy(theTvDBView, "thetvdbview.sql");
   strcpy(scrapMovieDbApiKey, "abb01b5a277b9c2c60ec0302d83c5ee9");
}
