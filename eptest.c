
#include <stdio.h>
#include <errno.h>
#include <signal.h>

#include "lib/config.h"
#include "lib/common.h"
#include "series.h"

cDbTable* episodeDb = 0;
cDbConnection* connection = 0;
const char* logPrefix = "";

//***************************************************************************
// Init / Exit
//***************************************************************************

void initConnection()
{
   cDbConnection::init();

   cDbConnection::setEncoding("utf8");
   cDbConnection::setHost("localhost");

   cDbConnection::setPort(3306);
   cDbConnection::setName("epg2vdr");
   cDbConnection::setUser("epg2vdr");
   cDbConnection::setPass("epg");
   cDbConnection::setConfPath("/etc/epgd/");

   connection = new cDbConnection();
}

void exitConnection()
{
   cDbConnection::exit();

   if (connection)
      delete connection;
}

int init()
{
   episodeDb = new cDbTable(connection, "episodes");
   if (episodeDb->open() != success) return fail;

   return success;
}

int exit()
{
   delete episodeDb;
   return done;
}

//***************************************************************************
// Main
//***************************************************************************

int main(int argc, char** argv)
{
   const int max = 1000;

   FILE* fp;
   char line[max];
   char* filename = argv[1];

   cEpgConfig::logstdout = yes;
   cEpgConfig::loglevel = 0;

   // at first allpy locale !!

   setlocale(LC_CTYPE, "");

   // read dictionary

   if (dbDict.in("/etc/epgd/epg.dat") != success)
   {
      fprintf(stderr, "Error: Invalid dictionary configuration, aborting!");
      return 1;
   }

   initConnection();

   if (init() != success)
   {
      tell(0, "init of database failed");
      return 1;
   }

   if ((fp = fopen(filename, "r")) == 0)
   {
      fprintf(stderr, "Error: Can't open '%s', %s\n", filename, strerror(errno));
      exit (0);
   }

   cList<cLine>* result = new cList<cLine>;

   while (fgets(line, max, fp))
   {
      // fputs(line, stdout);
      line[strlen(line)-1] = 0;
      result->Add(new cLine(line));
   }

   fclose(fp);

   char* f = filename;

   if (strrchr(filename, '/'))
      f = strrchr(filename, '/') + 1;

   if (char* p = strstr(f, ".episodes"))
      *p = 0;

   cEpisodeFile file(f, "", result) ;

   // insert / update series into database ...

   episodeDb->getConnection()->startTransaction();
   file.storeToTable(episodeDb);
   episodeDb->getConnection()->commit();
   delete result;

   return 0;
}
