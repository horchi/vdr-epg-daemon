/*
 * epgdata.c
 *
 * See the README file for copyright information
 *
 */

#include <dirent.h>
#include <unistd.h>

#include "epgdata.h"

//***************************************************************************
// Epgdata
//***************************************************************************

Epgdata::Epgdata()
   : Plugin()
{
   pxsltStylesheet = 0;
   stmtByFileRef = 0;
   stmtCleanDouble = 0;
   stmtMarkOldEvents = 0;
   selectByDate = 0;
   selectId = 0;

   pin = 0;
   timeout = 3 * tmeSecondsPerMinute;
   baseurl = strdup("http://www.epgdata.com");
}

Epgdata::~Epgdata()
{
   if (pxsltStylesheet)
      xsltFreeStylesheet(pxsltStylesheet);

   delete stmtByFileRef;
   delete selectByDate;
   delete stmtCleanDouble;
   delete stmtMarkOldEvents;

   free(baseurl);
   free(pin);
}

int Epgdata::init(cEpgd* aObject, int aUtf8)
{
   Plugin::init(aObject, aUtf8);

   pxsltStylesheet = loadXSLT(getSource(), confDir, utf8);

   return done;
}

int Epgdata::initDb()
{
   int status = success;

   // --------
   // by fileref (for pictures)
   // select name from fileref
   //     where source = ? and fileref = ?

   stmtByFileRef = new cDbStatement(obj->fileDb);

   stmtByFileRef->build("select ");
   stmtByFileRef->bind("NAME", cDBS::bndOut);
   stmtByFileRef->build(" from %s where ", obj->fileDb->TableName());
   stmtByFileRef->bind("SOURCE", cDBS::bndIn | cDBS::bndSet);
   stmtByFileRef->bind("FILEREF", cDBS::bndIn | cDBS::bndSet, " and ");

   status += stmtByFileRef->prepare();

   // ---------------
   // (for cleanup double)
   // select name from fileref
   //     where source = ? order by name desc

   stmtCleanDouble = new cDbStatement(obj->fileDb);

   stmtCleanDouble->build("select ");
   stmtCleanDouble->bind("NAME", cDBS::bndOut);
   stmtCleanDouble->build(" from %s where ", obj->fileDb->TableName());
   stmtCleanDouble->bind("SOURCE", cDBS::bndIn | cDBS::bndSet);
   stmtCleanDouble->build(" order by name desc");

   status += stmtCleanDouble->prepare();

   // ---------
   // select channelid, merge, mergesp from channelmap
   //     where source = ? and extid = ?

   selectId = new cDbStatement(obj->mapDb);

   selectId->build("select ");
   selectId->bind("CHANNELID", cDBS::bndOut);
   selectId->bind("MERGESP", cDBS::bndOut, ", ");
   selectId->bind("MERGE", cDBS::bndOut, ", ");
   selectId->build(" from %s where ", obj->mapDb->TableName());
   selectId->bind("SOURCE", cDBS::bndIn | cDBS::bndSet);
   selectId->bind("EXTERNALID", cDBS::bndIn | cDBS::bndSet, " and ");

   status += selectId->prepare();

   // ---------
   // select name, tag from filerf
   //  where source = 'epgdata'
   //    and name like ?

   valueName.setField(obj->fileDb->getField("NAME"));
   valueNameLike.setField(obj->fileDb->getField("NAME"));

   selectByDate = new cDbStatement(obj->fileDb);

   selectByDate->build("select ");
   selectByDate->bind(&valueName, cDBS::bndOut);
   selectByDate->bind("FILEREF", cDBS::bndOut, ", ");
   selectByDate->build(" from %s where source = '%s' and ",
                       obj->fileDb->TableName(), getSource());
   selectByDate->bindCmp(0, &valueNameLike, "like");

   status += selectByDate->prepare();

//    // --------
//    // update events set delflg = ?, updflg = ?, fileref = ?, updsp = ?
//    //    where fileref = ?
//    //      and source = ?;
//    //      and updflg in (....)

//    valueFileRef.setField(obj->eventsDb->getField("FileRef"));
//    stmtSetDelByFileref = new cDbStatement(obj->eventsDb);

//    stmtSetDelByFileref->build("update %s set ", obj->eventsDb->TableName());
//    stmtSetDelByFileref->bind("DelFlg", cDbService::bndIn |cDbService:: bndSet);
//    stmtSetDelByFileref->bind("UpdFlg", cDbService::bndIn |cDbService:: bndSet, ", ");
//    stmtSetDelByFileref->bind("FileRef", cDbService::bndIn | cDbService::bndSet, ", ");
//    stmtSetDelByFileref->bind("UpdSp", cDbService::bndIn | cDbService::bndSet, ", ");
//    stmtSetDelByFileref->build( " where ");
//    stmtSetDelByFileref->bind(&valueFileRef, cDbService::bndIn |cDbService:: bndSet);
//    stmtSetDelByFileref->bind("Source", cDbService::bndIn | cDbService::bndSet, " and ");
//    stmtSetDelByFileref->build(" and updflg in (%s)", Us::getDeletable());

//    status += stmtSetDelByFileref->prepare();

   // ----------
   // update events
   //   set updflg = case when updflg in (...) then 'D' else updflg end,
   //       delflg = 'Y',
   //       updsp = unix_timestamp()
   //   where source = '...'
   //     and (source, fileref) not in (select source,fileref from fileref)

   stmtMarkOldEvents = new cDbStatement(obj->eventsDb);

   stmtMarkOldEvents->build("update %s set ", obj->eventsDb->TableName());
   stmtMarkOldEvents->build("updflg = case when updflg in (%s) then 'D' else updflg end, ", cEventState::getDeletable());
   stmtMarkOldEvents->build("delflg = 'Y', updsp = unix_timestamp()");
   stmtMarkOldEvents->build(" where source = '%s'", getSource());
   stmtMarkOldEvents->build(" and  (source, fileref) not in (select source,fileref from fileref)");

   status += stmtMarkOldEvents->prepare();

   // ----------
   // if no epgdata entry in fileref read files from FS to table

   int count = 0;
   obj->fileDb->countWhere("source = 'epgdata'", count);

   if (!count)
   {
      char* path = 0;
      DIR* dir;
      dirent* dp;

      asprintf(&path, "%s/%s", EpgdConfig.cachePath, getSource());
      chkDir(path);

      if (!(dir = opendir(path)))
      {
         tell(0, "Error: Opening cache path '%s' failed, %s", path, strerror(errno));
         free(path);
         return fail;
      }

      while ((dp = readdir(dir)))
      {
         char* fileRef = 0;
         char* file = 0;
         char* tag = 0;
         struct stat sb;

         if (!strstr(dp->d_name, "_de_qy.zip"))
            continue;

         asprintf(&file, "%s/%s", path, dp->d_name);
         stat(file, &sb);
         free(file);

         asprintf(&tag, "%" PRId64, sb.st_size);
         asprintf(&fileRef, "%s-%s", dp->d_name, tag);

         // store file and let tag NULL to indicate that processing is needed

         obj->fileDb->clear();
         obj->fileDb->setValue("NAME", dp->d_name);
         obj->fileDb->setValue("SOURCE", getSource());
         obj->fileDb->setValue("EXTERNALID", "0");
         obj->fileDb->setValue("FILEREF", fileRef);
         obj->fileDb->store();

         tell(1, "Added '%s' to table fileref", dp->d_name);
         free(fileRef);
         free(tag);
      }

      free(path);
      closedir(dir);
   }

   return success;
}

int Epgdata::exitDb()
{
   delete stmtByFileRef;       stmtByFileRef = 0;
   delete stmtCleanDouble;     stmtCleanDouble = 0;
   delete selectByDate;        selectByDate = 0;
   delete selectId;            selectId = 0;
   delete stmtMarkOldEvents;   stmtMarkOldEvents = 0;

   return success;
}

//***************************************************************************
// At Config Item
//***************************************************************************

int Epgdata::atConfigItem(const char* Name, const char* Value)
{
   if      (!strcasecmp(Name, "Url"))      { free(baseurl); baseurl = strdup(Value); }
   else if (!strcasecmp(Name, "Pin"))      { free(pin); pin = strdup(Value); }
   else if (!strcasecmp(Name, "Timeout"))  { timeout = atoi(Value); }

   else return fail;

   return success;
}

//***************************************************************************
// Ready
//***************************************************************************

int Epgdata::ready()
{
   static int count = na;

   if (isEmpty(pin))
      return no;

   if (count == na)
   {
      char* where;

      asprintf(&where, "source = '%s'", getSource());

      if (obj->mapDb->countWhere(where, count) != success)
         count = na;

      free(where);
   }

   return count > 0;
}

//***************************************************************************
// Process Day
//***************************************************************************

int Epgdata::processDay(int day, int fullupdate, Statistic* statistic)
{
   char* directory = 0;
   char* fspath = 0;
   char* path = 0;           // name of the zip file including the path
   int haveOneForThisDay = no;
   MemoryStruct data;
   int fileSize = 0;
   char* fileRef = 0;
   char* url = 0;
   char* logurl = 0;
   int load = yes;
   char* like = 0;
   int bSize = 0;
   char entryName[200+TB];
   MemoryStruct uzdata;
   // char* oldFileRef = 0;

   int status;

   // path to zip files, url, ..

   asprintf(&directory, "%s/%s", EpgdConfig.cachePath, getSource());
   chkDir(directory);
   asprintf(&url, "%s/index.php?action=sendPackage&iOEM=VDR&pin=%s&dayOffset=%d&dataType=xml", baseurl, pin, day);
   asprintf(&logurl, "%s/index.php?action=sendPackage&iOEM=VDR&pin=%s&dayOffset=%d&dataType=xml", baseurl, "insert-your-pin-here", day);

   // first get the http header

   data.clear();
   data.headerOnly = yes;

   status = obj->downloadFile(url, fileSize, &data);

   if (status != success || isEmpty(data.name))
   {
      tell(1, "Download header for day (%d) at '%s' failed, aborting, got name '%s', status was %d",
           day, logurl, data.name, status);
      status = fail;
      goto Exit;
   }

   tell(2, "Got info for day (%d), file '%s' with tag '%s'", day, data.name, data.tag);

   asprintf(&fileRef, "%s-%s", data.name, data.tag);
   asprintf(&path, "%s/%s", directory, data.name);

   // lookup file

   obj->fileDb->clear();
   obj->fileDb->setValue("NAME", data.name);
   obj->fileDb->setValue("SOURCE", getSource());

   // 1:1 match ?

   obj->fileDb->find();

   asprintf(&like, "%.8s_%%", data.name);
   valueNameLike.setValue(like);
   free(like);

   // check for update

   if (selectByDate->find())
   {
      haveOneForThisDay = yes;
      // oldFileRef = strdup(obj->fileDb->getStrValue("FileRef"));
   }

   if (haveOneForThisDay && day >= EpgdConfig.upddays)
   {
      // don't check for update of existing files more than 'upddays' in the future

      tell(2, "Skipping update check of file '%s' for day %d", data.name, day);

      statistic->nonUpdates++;
      status = success;
      load = no;
   }
   else if (haveOneForThisDay && obj->fileDb->hasValue("FileRef", fileRef))
   {
      tell(3, "Skipping download of day (%d) due to non-update", day);
      statistic->nonUpdates++;
      status = success;
      load = no;
   }

   if (!load && !obj->fileDb->getRow()->getValue("Tag")->isNull())
      goto Exit;

   // not exist, update or not processed -> work

   // first check if we have it already on fs

   asprintf(&fspath, "%s/%s", directory, valueName.getStrValue());

   if (!load && fileExists(fspath))
   {
      tell(1, "File '%s' exist, loading from filesystem", fspath);

      obj->loadFromFs(&data, valueName.getStrValue(), getSource());

      free(fileRef);
      free(path);
      path = strdup(fspath);
      asprintf(&fileRef, "%s-%s", valueName.getStrValue(), data.tag);

      obj->fileDb->clear();
      obj->fileDb->setValue("NAME", valueName.getStrValue());
      obj->fileDb->setValue("SOURCE", getSource());
   }

   free(fspath);

   if (load)
   {
      tell(0, "Download file: '%s' to '%s", logurl, data.name);

      data.clear();

      if (obj->downloadFile(url, fileSize, &data, timeout) != success)
      {
         tell(0, "Download of day (%d) from '%s' failed", day, logurl);
         status = fail;
         goto Exit;
      }

      statistic->bytes += data.size;
      statistic->files++;

      // store zip to FS

      obj->storeToFs(&data, data.name, getSource());
   }

   if (data.isEmpty())
      goto Exit;

   // unzip ...

   uzdata.clear();

   if (unzip(path, /*filter*/ ".xml", uzdata.memory, bSize, entryName) == success)
   {
      tell(0, "Processing file '%s' for day %d (%d/%d)",
           fileRef, day, haveOneForThisDay, load);

      uzdata.size = bSize;

      // store ?

      if (EpgdConfig.storeXmlToFs)
         obj->storeToFs(&uzdata, entryName, getSource());

      // process file ..

      obj->connection->startTransaction();

      if ((status = processFile(uzdata.memory, uzdata.size, fileRef)) != success)
         statistic->rejected++;

      if (!obj->dbConnected())
      {
         status = fail;
         goto Exit;
      }

// we can use this code instead of "stmtMarkOldEvents" !!
// but we have to complete it like tvm plugin!
//       if (haveOneForThisDay && load && strcmp(oldFileRef, fileRef) != 0)
//       {
//          // mark 'old' entrys in events table as deleted
//          // and 'fake' fileref to new to avoid deletion at cleanup

//          tell(0, "Removing events of fileref '%s' for day %d", oldFileRef, day);

//          obj->eventsDb->clear();
//          obj->eventsDb->setValue("DelFlg", "Y");
//          obj->eventsDb->setValue("UpdFlg", "D");
//          obj->eventsDb->setValue("FileRef", fileRef);     // fake to new fileref
//          obj->eventsDb->setValue("UpdSp", time(0));
//          obj->eventsDb->setValue("Source", getSource());
//          valueFileRef.setValue(oldFileRef);                             // old fileref
//          stmtSetDelByFileref->execute();
//       }

      // Confirm processing of file

      obj->fileDb->setValue("EXTERNALID", "0");
      obj->fileDb->setValue("TAG", data.tag);
      obj->fileDb->setValue("FILEREF", fileRef);
      obj->fileDb->store();

      obj->connection->commit();
   }

  Exit:

   // free(oldFileRef);
   obj->fileDb->reset();
   selectByDate->freeResult();

   uzdata.clear();
   free(url);
   free(logurl);
   free(fileRef);
   free(directory);
   free(path);

   return status;
}

//***************************************************************************
// Process File
//***************************************************************************

int Epgdata::processFile(const char* data, int size, const char* fileRef)
{
   xmlDocPtr transformedDoc;
   xmlNodePtr xmlRoot;
   int count = 0;

   if ((transformedDoc = obj->transformXml(data, size, pxsltStylesheet, fileRef)) == 0)
   {
      tell(0, "XSLT transformation for '%s' failed, ignoring", fileRef);
      return fail;
   }

   if (!(xmlRoot = xmlDocGetRootElement(transformedDoc)))
   {
      tell(0, "Invalid xml document returned from xslt for '%s', ignoring", fileRef);
      return fail;
   }

   // DEBUG: xmlSaveFile("/tmp/test.xml", transformedDoc);

   for (xmlNodePtr node = xmlRoot->xmlChildrenNode; node && obj->dbConnected(); node = node->next)
   {
      char* prop = 0;
      tEventId eventid;
      char* extid = 0;

      // skip all unexpected elements

      if (node->type != XML_ELEMENT_NODE || strcmp((char*)node->name, "event") != 0)
         continue;

      // get/check eventid

      if (!(prop = (char*)xmlGetProp(node, (xmlChar*)"id")) || !*prop || !(eventid = atoll(prop)))
      {
         xmlFree(prop);
         tell(0, "Missing event id, ignoring!");
         continue;
      }

      xmlFree(prop);

      // get/check provider id

      if (!(prop = (char*)xmlGetProp(node, (xmlChar*)"provid")) || !*prop || !atoi(prop))
      {
         xmlFree(prop);
         tell(0, "Missing provider id, ignoring!");
         continue;
      }

      extid = strdup(prop);
      xmlFree(prop);

      obj->mapDb->clear();
      obj->mapDb->setValue("EXTERNALID", extid);
      obj->mapDb->setValue("SOURCE", getSource());
      free(extid);

      for (int f = selectId->find(); f; f = selectId->fetch())
      {
         int insert;
         const char* channelId = obj->mapDb->getStrValue("CHANNELID");

         // create event ..

         obj->eventsDb->clear();
         obj->eventsDb->setBigintValue("EVENTID", eventid);
         obj->eventsDb->setValue("CHANNELID", channelId);

         insert = !obj->eventsDb->find();

         obj->eventsDb->setValue("SOURCE", getSource());
         obj->eventsDb->setValue("FILEREF", fileRef);

         // auto parse and set other fields

         obj->parseEvent(obj->eventsDb->getRow(), node);

         // ...

         time_t mergesp = obj->mapDb->getIntValue("MERGESP");
         long starttime = obj->eventsDb->getIntValue("STARTTIME");
         int merge = obj->mapDb->getIntValue("MERGE");

         // store ..

         if (insert)
         {
            // handle insert

            obj->eventsDb->setValue("VERSION", 0xFF);
            obj->eventsDb->setValue("TABLEID", 0L);
            obj->eventsDb->setValue("USEID", 0L);

            if (starttime <= mergesp)
               obj->eventsDb->setCharValue("UPDFLG", cEventState::usInactive);
            else
               obj->eventsDb->setCharValue("UPDFLG", merge > 1 ? cEventState::usMergeSpare : cEventState::usActive);

            obj->eventsDb->insert();
         }
         else
         {
            if (obj->eventsDb->hasValue("DELFLG", "Y"))
               obj->eventsDb->setValue("DELFLG", "N");

            if (obj->eventsDb->hasValue("UPDFLG", "D"))
            {
               if (starttime <= mergesp)
                  obj->eventsDb->setCharValue("UPDFLG", cEventState::usInactive);
               else
                  obj->eventsDb->setCharValue("UPDFLG", merge > 1 ? cEventState::usMergeSpare : cEventState::usActive);
            }

            obj->eventsDb->update();
         }

         obj->eventsDb->reset();
         count++;
      }
   }

   selectId->freeResult();

   xmlFreeDoc(transformedDoc);

   tell(2, "XML File '%s' processed, updated %d events", fileRef, count);

   return success;
}

//***************************************************************************
// Create FS Name Of Picture
//     - caller has to free the result!
//***************************************************************************

char* Epgdata::fsNameOfPicture(const char* imagename)
{
   char* buffer = 0;

   if (const char* p = strstr(imagename, "://"))
      buffer = strdup(p+strlen("://"));
   else
      buffer = strdup(imagename);

   replaceChars(buffer, "<>:\"/\\:|?*", '_');
   return buffer;
}

//***************************************************************************
// Get Picture
//***************************************************************************

int Epgdata::getPicture(const char* imagename, const char* fileRef, MemoryStruct* data)
{
   int fileSize = 0;
   int status;

   data->clear();

   if (!imagename)
   {
      tell(2, "Error: No image url given, skipping image");
      return 0;
   }

   tell(0, "Downloading image '%s'", imagename);
   status = obj->downloadFile(imagename, fileSize, data);

   if (status != success)
   {
      tell(0, "Error: downloading image from url '%s' failed", imagename);
      return 0;
   }

   return fileSize;
}

int Epgdata::cleanupAfter()
{
   const char* ext = ".zip";
   struct dirent* dirent;
   DIR* dir;
   char* pdir;
   int count = 0;
   char* last = 0;

   // cleanup *.zip in FS cache ...

   // remove old versions for each day

   obj->fileDb->clear();
   obj->fileDb->setValue("SOURCE", getSource());

   for (int f = stmtCleanDouble->find(); f; f = stmtCleanDouble->fetch())
   {
      const char* name = obj->fileDb->getStrValue("NAME");

      if (last && strncmp(name, last, 8) == 0)
      {
         char* where;
         tell(1, "Remove old epgdata file '%s' from table", name);
         asprintf(&where, "name = '%s'", name);
         obj->fileDb->deleteWhere("%s", where);
         free(where);
      }

      free(last);
      last = strdup(name);
   }

   free(last);
   stmtCleanDouble->freeResult();

   // mark wasted events (delflg, ...)

   stmtMarkOldEvents->execute();

   // cleanup filesystem, remove files which not referenced in table

   asprintf(&pdir, "%s/%s", EpgdConfig.cachePath, getSource());

   if (!(dir = opendir(pdir)))
   {
      tell(1, "Can't open directory '%s', '%s'", pdir, strerror(errno));
      free(pdir);

      return done;
   }

   tell(1, "Starting cleanup of epgdata zip's in '%s'", pdir);

   free(pdir);

   while ((dirent = readdir(dir)))
   {
      // check extension

      if (strncmp(dirent->d_name + strlen(dirent->d_name) - strlen(ext), ext, strlen(ext)) != 0)
         continue;

      // lookup file

      obj->fileDb->clear();
      obj->fileDb->setValue("NAME", dirent->d_name);
      obj->fileDb->setValue("SOURCE", getSource());

      if (!obj->fileDb->find())
      {
         asprintf(&pdir, "%s/%s/%s", EpgdConfig.cachePath, getSource(), dirent->d_name);

         if (!removeFile(pdir))
            count++;

         free(pdir);
      }

      obj->fileDb->reset();
   }

   closedir(dir);

   tell(1, "Cleanup finished, removed (%d) epgdata files", count);

   return success;
}

//***************************************************************************

extern "C" void* EPGPluginCreator() { return new Epgdata(); }
