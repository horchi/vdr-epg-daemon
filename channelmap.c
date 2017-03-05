/*
 * channelmap.c
 *
 * See the README file for copyright information
 *
 */

#include <fstream>
#include <string.h>

#include "lib/common.h"

#include "epgd.h"

//***************************************************************************
// Load Channelmap
//***************************************************************************

int cEpgd::loadChannelmap()
{
   ifstream cmfile;
   string s;
   size_t p;
   int line = 0;
   int count = 0;
   int status = success;
   char* path;

   enum ConfIndex
   {
      ciSource,
      ciExtid,
      ciMerge,
      ciVps,

      ciCount
   };

   asprintf(&path, "%s/channelmap.conf", confDir);
   cmfile.open(path);

   if (cmfile.fail())
   {
      tell(0, "Error reading '%s' %s!", path, strerror(errno));
      free(path);

      return fail;
   }

   tell(0, "Loading '%s'", path);

   connection->startTransaction();

   mapDb->clear();
   cDbStatement updateFlag(mapDb);
   updateFlag.build("update %s set updflg = 'D'", mapDb->TableName());
   updateFlag.prepare();
   updateFlag.execute();

   while (!cmfile.eof())
   {
      char* left = 0;
      char* right = 0;
      char* extid = 0;
      char* source = 0;
      char* pc;
      int index;
      int vps = no;
      int merge = 1;

      getline(cmfile, s);
      line++;

      removeChars(s, " \f\n\r\t\v");

      // remove comments

      p = s.find_first_of("//");

      if (p != string::npos)
         s.erase(p);

      if (s.empty())
         continue;

      // split line at '='

      p = s.find_first_of("=");

      if ((p == string::npos) || !s.substr(p+1).length())
      {
         tell(0, "Error parsing '%s' at line %d!", path, line);
         status = fail;
         break;
      }

      left = strdup(s.substr(0, p).c_str());
      right = strdup(s.substr(p+1).c_str());

      for (index = 0, pc = strtok(left, ":"); pc; pc = strtok(0, ":"), index++)
      {
         switch (index)
         {
            case ciSource: source = strdup(pc);              break;
            case ciExtid:  extid = strdup(pc);               break;
            case ciMerge:  merge = atoi(pc);                 break;
            case ciVps:    vps = strchr("1yY", *pc) != 0;    break;
         }
      }

      free(left);

      if (!right || !source || !extid)
      {
         tell(0, "Error: Syntax error in '%s' at line %d!", path, line);

         free(right);
         free(source);
         free(extid);
         status = fail;
         break;
      }

      // read channels separated by commas

      for (index = 0, pc = strtok(right, ","); pc; pc = strtok(0, ","), index++)
      {
         updateMapRow(extid, source, pc, merge, vps);
         count++;
      }

      free(right);
      free(source);
      free(extid);
   }

   connection->commit();
   cmfile.close();
   free(path);

   tell(0, "%d channel mappings read.", count);

   return status;
}

//***************************************************************************
// Update Map Row
//***************************************************************************

int cEpgd::updateMapRow(char* extid, const char* source, const char* chan,
                        int merge, int vps)
{
   int insert = no;
   int changed = 0;

   // updflg:
   // I - insert
   // U - updated
   // S - stay unchanged
   // D - no more used -> delete

   // force id of vdr source to 0

   if (!isZero(extid) && strcmp(source, "vdr") == 0)
   {
      tell(1, "Force extid of for channel '%s' to 0, due to source 'vdr'", chan);
      free(extid);
      extid = strdup("0");
      merge = 0;
   }
   else if (strcmp(source, "vdr") == 0)
   {
      merge = 0;
   }
   else if (isZero(extid) && strcmp(source, "vdr") != 0)
   {
      tell(1, "Ignoring config with empty extid for channel '%s', '%s'",
           chan, source);
      return fail;
   }

   //

   mapDb->clear();
   mapDb->setValue("EXTERNALID", extid);
   mapDb->setValue("CHANNELID", chan);
   mapDb->setValue("SOURCE", source);

   // defaults

   mapDb->setValue("ORDER", 0);
   mapDb->setValue("VISIBLE", 3);

   // lookup

   insert = !mapDb->find();

   if (insert)
   {
      // select by channelid ...
      //   - to fill order an visible

      if (!selectMapOrdOf->find())
      {
         if (selectMaxMapOrd->find())
            mapDb->setValue("ORDER", mapDb->getIntValue("ORDER") + 1);
      }

      // visible and order was set by selectMapOrdOf

      selectMapOrdOf->freeResult();
      selectMaxMapOrd->freeResult();
   }

   mapDb->setValue("VPS", vps);

   if (!mapDb->hasValue("MERGE", (long)merge))
   {
      changed++;
      mapDb->setValue("MERGE", merge);
   }

   if (changed || insert)
   {
      tell(1, "Channel '%s' %s, source '%s', extid %s, merge %d",
           chan, insert ? "inserted" : "updated",
           source,
           extid,
           merge);

      mapDb->setValue("MERGESP", 0L);   // reset mergesp!
      mapDb->setValue("UPDFLG", insert ? "I" : "U");

      // force initial check

      if (!EpgdConfig.checkInitial)
      {
         tell(1, "At least one channelmap change detected, force initial check!");
         EpgdConfig.checkInitial = yes;
      }
   }
   else
   {
      mapDb->setValue("UPDFLG", "S");
   }

   mapDb->store();
   mapDb->reset();

   return done;
}

//***************************************************************************
// Apply Channelmap Changes to Events
//***************************************************************************

int cEpgd::applyChannelmapChanges()
{
   connection->startTransaction();

   mapDb->clear();

   for (int f = selectAllMap->find(); f; f = selectAllMap->fetch())
   {
      char flg = mapDb->getStrValue("UpdFlg")[0];

      // remove all fileref entrys for deleted 'D', updated 'U' or inserted 'I'
      // channelmap rows

      if (flg == 'U' || flg == 'D' || flg == 'I')
      {
         tell(1, "Removing fileref and event entrys for channel '%s' "
              "(extid %s) of '%s' due to channelmap change (%c)",
              mapDb->getStrValue("CHANNELID"),
              mapDb->getStrValue("EXTERNALID"),
              mapDb->getStrValue("SOURCE"),
              flg);

         if (!isZero(mapDb->getStrValue("EXTERNALID")))
         {
            // delete coresponding fileref entrys

            fileDb->deleteWhere("extid = '%s' and source = '%s'",
                                mapDb->getStrValue("EXTERNALID"),
                                mapDb->getStrValue("SOURCE"));
         }

         // delete events

         eventsDb->deleteWhere("channelid = '%s' and source = '%s'",
                               mapDb->getStrValue("CHANNELID"),
                               mapDb->getStrValue("SOURCE"));
      }
   }

   selectAllMap->freeResult();

   // now delete wasted map entries

   mapDb->deleteWhere("updflg = 'D'");

   connection->commit();

   return done;
}
