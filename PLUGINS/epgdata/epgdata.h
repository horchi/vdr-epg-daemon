/*
 * epgdata.h
 *
 * See the README file for copyright information
 *
 */

#include "epgd.h"

//***************************************************************************
// Epgdata
//***************************************************************************

class Epgdata : public Plugin
{
   public:

      Epgdata();
      virtual ~Epgdata();

      int init(cEpgd* aObject, int aUtf8);
      int initDb();
      int exitDb();
      int atConfigItem(const char* Name, const char* Value);

      const char* getSource() { return "epgdata"; }

      char* fsNameOfPicture(const char* imagename);  // caller has to free the result!
      int getPicture(const char* imagename, const char* fileRef, MemoryStruct* data);
      int processDay(int day, int fullupdate, Statistic* statistic);
      int cleanupAfter();
      int ready();

   protected:

      int processFile(const char* data, int size, const char* fileRef);

      cDbValue valueNameLike;
      cDbValue valueName;
      cDbValue valueFileRef;
      cDbStatement* stmtByFileRef;
      cDbStatement* stmtCleanDouble;
      cDbStatement* selectId;
      cDbStatement* selectByDate;
      cDbStatement* stmtMarkOldEvents;
      xsltStylesheetPtr pxsltStylesheet;

      // config

      char* baseurl;
      int timeout;
      char* pin;
};
