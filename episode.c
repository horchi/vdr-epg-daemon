/*
 * update.c
 *
 * See the README file for copyright information
 *
 */

#include <unistd.h>
#include <locale.h>
#include <zlib.h>

#include "epgd.h"

//***************************************************************************
// Get Special
//***************************************************************************

int getSpecial(const char* line, const char* item, char* content, int max, int* count = 0)
{
   const char* p {};

   unsigned int off = strlen(item) + 1;

   if ((p = strstr(line, item)) && strlen(line) > off)
   {
      snprintf(content, max, "%s", p+off);

      if (count)
         (*count)++;

      return success;
   }

   return fail;
}

//***************************************************************************
// Store To Table
//***************************************************************************

int cEpisodeFile::storeToTable(cDbTable* episodeDb, cDbTable* eventsDb, const cList<cLine>* linkLines)
{
   const int maxSeasons {100};

   std::string::size_type pos {0};
   std::string compName;
   std::string lang {"de"};
   std::string ename {name};

   char shortName[100] {};
   char col1Name[100] {};
   char col2Name[100] {};
   char col3Name[100] {};
   int exColCount {0};

   const cList<cLine>* theLines = linkLines ? linkLines : lines;

   if (!theLines)
      return done;

   if (isLink())
      ename = link;

   // detect language special

   if ((pos = ename.rfind('.')) != std::string::npos)
   {
      lang = ename.substr(pos+1);

      if (lang == "de" || lang == "en" || lang == "de-en" || lang == "en-de" || lang == "at")
         ename.erase(pos);
      else
         lang = "de";
   }

   // build compressed name for episode lookup

   compName = ename;
   prepareCompressed(compName);

   if (!compName.length())
      return done;

   // delete all entry of this episode

   // episodeDb->deleteWhere("compname = '%s' and lang = '%s'", compName.c_str(), lang.c_str());

   episodeDb->getConnection()->query("update %s set %s = '%c' where %s = '%s' and %s = '%s'",
                                     episodeDb->TableName(),
                                     episodeDb->getField("STATE")->getDbName(), esDelete,
                                     episodeDb->getField("COMPNAME")->getDbName(), compName.c_str(),
                                     episodeDb->getField("LANG")->getDbName(), lang.c_str());

   episodeDb->getConnection()->queryReset();

   // parse ...

   unsigned short seasons[maxSeasons+1] {};
   int seasonNr {na};
   bool insideSeasonList {false};
   char* line {};

   memset(seasons, 0, sizeof(seasons));

   for (cLine* l = theLines->First(); l; l = theLines->Next(l))
   {
      free(line);
      line = strdup(l->Text());

      if (l->Length() < 4)
         continue;

      if (line[0] == '#')
      {
         getSpecial(line, "# SHORT", shortName, 100);
         getSpecial(line, "# EXTRACOL1", col1Name, 100, &exColCount);
         getSpecial(line, "# EXTRACOL2", col2Name, 100, &exColCount);
         getSpecial(line, "# EXTRACOL3", col3Name, 100, &exColCount);

         // parse season list:
         // # SEASONLIST
         // # 1	1	10
         // # 2	11	20
         // # 3	21	30
         // # /SEASONLIST

         if (strstr(line, "SEASONLIST"))
         {
            if (strstr(line, "/SEASONLIST"))
               insideSeasonList = false;
            else
               insideSeasonList = true;

            continue;
         }

         // is season info?

         if (insideSeasonList)
         {
            int s, v, t;

            if (!isdigit(line[2]))
            {
               tell(0, "CONSTABEL: Warning: (%s) Ignoring unexpected season line [%s], missing number at position 3", name.c_str(), line);
               continue;
            }

            if (sscanf(line, "# %d\t%d\t%d", &s, &v, &t) == 3)
            {
               if (seasonNr == na)
                  seasonNr = s;

               if (s != seasonNr)
                  tell(0, "CONSTABEL: Info: (%s) Season line [%s] not in sequence, expected season %d", name.c_str(), line, seasonNr);

               if (seasonNr > maxSeasons)
               {
                  tell(0, "CONSTABEL: Warning: (%s) Ignoring unexpected season line [%s] only %d seasons expected", name.c_str(), line, maxSeasons);
                  continue;
               }

               // store part count of the season

               seasons[seasonNr] = t-(v-1);
               seasonNr++;
            }
         }

         continue;
      }

      if (!isdigit(line[0]) || !isdigit(line[1]) || line[2] != '\t')
         continue;

      // found episode line ...

      std::string partNameComp;
      char partName[200+TB] {};
      char comment[200+TB] {};
      char ex1[250+TB] {};
      char ex2[250+TB] {};
      char ex3[250+TB] {};
      char ex[250+TB] {};

      int se {0};
      int ep {0};
      int no {0};

      // get lines like:
      //    "01<tab>1<tab>1<tab>Schatten der Vergangenheit<tab>[extcol1<tab>[extcol2<tab>[extcol3]]][<tab>#comment]<tab>"

      switch (exColCount)
      {
         case 0:
         {
            if (sscanf(line, "%d\t%d\t%d\t%200[^\t\n]\t%200[^\t\n]", &se, &ep, &no, partName, comment) < 4)
            {
               tell(0, "CONSTABEL: Warning: (%s) Got invalid episode line [%s], at lease 4 columns expected", name.c_str(), line);
               continue;
            }
            break;
         }
         case 1:
         {
            if (sscanf(line, "%d\t%d\t%d\t%200[^\t\n]\t%250[^\t\n]\t%200[^\t\n]", &se, &ep, &no, partName, ex1, comment) < 5)
            {
               tell(0, "CONSTABEL: Warning: (%s) Got invalid episode line [%s], at lease 5 columns expected", name.c_str(), line);
               continue;
            }
            break;
         }
         case 2:
         {
            if (sscanf(line, "%d\t%d\t%d\t%200[^\t\n]\t%250[^\t\n]\t%250[^\t\n]\t%200[^\t\n]", &se, &ep, &no, partName, ex1, ex2, comment) < 6)
            {
               tell(0, "CONSTABEL: Warning: (%s) Got invalid episode line [%s], at lease 6 columns expected", name.c_str(), line);
               continue;
            }
            break;
         }
         case 3:
         {
            if (sscanf(line, "%d\t%d\t%d\t%200[^\t\n]\t%250[^\t\n]\t%250[^\t\n]\t%250[^\t\n]\t%200[^\t\n]", &se, &ep, &no, partName, ex1, ex2, ex3, comment) < 7)
            {
               tell(0, "CONSTABEL: Warning: (%s) Got invalid episode line [%s], at lease 7 columns expected", name.c_str(), line);
               continue;
            }
            break;
         }
      }

      partNameComp = partName;
      prepareCompressed(partNameComp);

      if (!partNameComp.length() || strcmp(partName, "n.n.") == 0)
         continue;

      episodeDb->clear();

      episodeDb->setValue("COMPNAME", compName.c_str());
      episodeDb->setValue("COMPPARTNAME", partNameComp.c_str());
      episodeDb->setValue("LANG", lang.c_str());

      bool found = episodeDb->find();

      episodeDb->clearChanged();

      episodeDb->setValue("EPISODENAME", ename.c_str());
      episodeDb->setValue("LINK", isLink());
      episodeDb->setValue("PARTNAME", partName);
      episodeDb->setValue("SEASON", se);
      episodeDb->setValue("PART", ep);
      episodeDb->setValue("PARTS", se < maxSeasons ? seasons[se] : 0);
      episodeDb->setValue("NUMBER", no);

      if (!isEmpty(shortName))
      {
         std::string comp;
         comp = shortName;
         prepareCompressed(comp);

         episodeDb->setValue("SHORTNAME", shortName);
         episodeDb->setValue("COMPSHORTNAME", comp.c_str());
      }

      if (!isEmpty(comment))
         episodeDb->setValue("COMMENT", comment);

      if (!isEmpty(ex1) && !isEmpty(col1Name))
      {
         sprintf(ex, "%.20s: %.220s", col1Name, ex1);
         episodeDb->setValue("EXTRACOL1", ex);
      }

      if (!isEmpty(ex2) && !isEmpty(col2Name))
      {
         sprintf(ex, "%.20s: %.220s", col2Name, ex2);
         episodeDb->setValue("EXTRACOL2", ex);
      }

      if (!isEmpty(ex3) && !isEmpty(col3Name))
      {
         sprintf(ex, "%.20s: %.220s", col3Name, ex3);
         episodeDb->setValue("EXTRACOL3", ex);
      }

      if (!found || episodeDb->getChanges())
         episodeDb->setCharValue("STATE", esChanged);
      else
         episodeDb->setCharValue("STATE", esUnchanged);

      episodeDb->store();
   }

   free(line);

   episodeDb->deleteWhere("%s = '%s' and %s = '%s' and %s = '%c'",
                          episodeDb->getField("COMPNAME")->getDbName(), compName.c_str(),
                          episodeDb->getField("LANG")->getDbName(), lang.c_str(),
                          episodeDb->getField("STATE")->getDbName(), esDelete);

   return 0;
}
