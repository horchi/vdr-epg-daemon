/*
 * config.c:
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include <syslog.h>

#include "config.h"

//***************************************************************************
// Statics
//***************************************************************************

int cEpgConfig::logstdout {no};
Eloquence cEpgConfig::eloquence {eloInfo};
Eloquence cEpgConfig::argEloquence {eloInfo};
int cEpgConfig::logFacility {LOG_USER};
const char* cEpgConfig::logName {"unknown"};

//***************************************************************************
// Common EPG Service Configuration
//***************************************************************************

cEpgConfig::cEpgConfig()
{
   sstrcpy(netDevice, getFirstInterface(), sizeof(netDevice));
}

//***************************************************************************
// Has DB Login Changed
//***************************************************************************

int cEpgConfig::hasDbLoginChanged(cEpgConfig* old)
{
   if (old->dbPort != dbPort ||
       strcmp(old->dbHost, dbHost) != 0 ||
       strcmp(old->dbName, dbName) != 0 ||
       strcmp(old->dbUser, dbUser) != 0 ||
       strcmp(old->dbPass, dbPass) != 0)
   {
      return yes;
   }

   return no;
}
