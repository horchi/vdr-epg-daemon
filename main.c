/*
 * main.c
 *
 * See the README file for copyright information
 *
 */

#include <stdio.h>
#include <errno.h>
#include <signal.h>

#include "epgd.h"

const char* confDir = (char*)confDirDefault;
const char* logPrefix = LOG_PREFIX;

void showUsage()
{
   printf("Usage: epgd [-n][-c <config-dir>][-l <log-level>][-t]\n");
   printf("    -v              show version and exit\n");
   printf("    -n              don't daemonize\n");
   printf("    -t              log to stdout\n");
   printf("    -c <config-dir> use config in <config-dir>\n");
   printf("    -p <plugin-dir> load plugins from <plugin-dir>\n");
   printf("    -l <log-level>  set log level\n");
//   printf("    -u              create/update database and exit (doesn't daemonize)\n");
   printf("    -i <pidfile>\n");
}

//***************************************************************************
// Validate Alter Database
//***************************************************************************

int validateAlterDatabase()
{
   int status = success;

   // initially create/alter tables and indices

   cDbConnection* connection = new cDbConnection();

   tell(0, "Checking database connection ...");

   if (connection->attachConnection() != success)
   {
      tell(0, "Fatal: Initial database connect failed, aborting");
      return fail;
   }

   std::map<std::string, cDbTableDef*>::iterator t;

   tell(0, "Checking table structure and indices ...");

   for (t = dbDict.getFirstTableIterator(); t != dbDict.getTableEndIterator(); t++)
   {
      cDbTable* table = new cDbTable(connection, t->first.c_str());

      tell(1, "Checking table '%s'", t->first.c_str());

      if (!table->exist())
      {
         if ((status += table->createTable()) != success)
            continue;
      }
      else
      {
         status += table->validateStructure();
      }

      status += table->createIndices();

      delete table;
   }

   connection->detachConnection();
   delete connection;

   return success;
}

//***************************************************************************
// Main
//***************************************************************************

int main(int argc, char** argv)
{
   cEpgd* job;
   int doValidateAlterDatabase = no;
   int nofork = no;
   int pid;
   int logstdout = na;
   int loglevel = na;
   int logfacility = Syslog::toCode("user");

   // Usage ..

   if (argc > 1 && (argv[1][0] == '?' || (strcmp(argv[1], "-h") == 0) || (strcmp(argv[1], "--help") == 0)))
   {
      showUsage();
      return 0;
   }

   // Parse command line

   for (int i = 0; argv[i]; i++)
   {
      if (argv[i][0] != '-' || strlen(argv[i]) != 2)
         continue;

      switch (argv[i][1])
      {
         case 'v': printf("epgd version %s from %s\n", VERSION, VERSION_DATE); return 0;
         case 't': logstdout = yes;                           break;
         case 'n': nofork = yes;                              break;
         case 'c': if (argv[i+1]) confDir = argv[++i];        break;
         case 'M': EpgdConfig.maintanance = yes;              break;
         case 'u': doValidateAlterDatabase = yes;             break;
         case 'i':
         {
            if (argv[i+1])
               cSystemNotification::setPidFile(argv[++i]);
            break;
         }
         case 'p':
         {
            if (argv[i+1])
               sstrcpy(EpgdConfig.pluginPath, argv[++i], sizeof(EpgdConfig.pluginPath));
            break;
         }
         case 'l':
         {
            if (argv[i+1])                 // <loglevel>.<facility>
            {
               const char* l = argv[++i];
               const char* f = strchr(l, '.');

               if (f)
               {
                  *(char*)f = 0;

                  if ((logfacility = Syslog::toCode(++f)) == na)
                  {
                     printf("Unknown facility '%s' configured, aborting\n", f);
                     return 1;
                  }
               }

               loglevel = atoi(l);
            }

            break;
         }
         default:
         {
            showUsage();
            return 0;
         }
      }
   }

   if (logstdout != na)   EpgdConfig.logstdout = logstdout;
   if (loglevel != na)    EpgdConfig.loglevel = loglevel;
   if (loglevel != na)    EpgdConfig.argLoglevel = loglevel;

   EpgdConfig.logFacility = logfacility;
   EpgdConfig.logName = "epgd";

   if (doValidateAlterDatabase)
   {
      EpgdConfig.logstdout = yes;

      if (validateAlterDatabase() != success)
         return 1;

      return 0;
   }

   // start ...

   job = new cEpgd();

   if (job->init() != success)
   {
      delete job;
      return 1;
   }

   // fork daemon

   if (!nofork)
   {
      if ((pid = fork()) < 0)
      {
         printf("Can't fork daemon, %s\n", strerror(errno));
         return 1;
      }

      if (pid != 0)
         return 0;
   }

   // register SIGINT

   ::signal(SIGINT,  cEpgd::downF);
   ::signal(SIGTERM, cEpgd::downF);
   ::signal(SIGHUP,  cEpgd::triggerF);
   ::signal(SIGUSR1, cEpgd::triggerF);
   ::signal(SIGUSR2, cEpgd::triggerF);

   // do work ...

   job->loop();

   // shutdown

   tell(0, "normal exit");

   delete job;

   return 0;
}
