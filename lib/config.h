/*
 * config.h:
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#pragma once

#include "common.h"

//***************************************************************************
// Config
//***************************************************************************

struct cEpgConfig
{
   public:

      cEpgConfig();

      // database connection

      int hasDbLoginChanged(cEpgConfig* old);

      char dbHost[100+TB] {"localhost"};
      int dbPort {3306};
      char dbName[100+TB] {"epg2vdr"};
      char dbUser[100+TB] {"epg2vdr"};
      char dbPass[100+TB] {"epg"};

      char netDevice[20+TB] {};
      char uuid[sizeUuid+TB] {};

      int getepgimages {yes};

      // static stuff

      static Eloquence eloquence;
      static Eloquence argEloquence;
      static int logstdout;
      static int logFacility;
      static const char* logName;
};
