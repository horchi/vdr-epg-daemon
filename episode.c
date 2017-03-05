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
   const char* p;

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

int cEpisodeFile::storeToTable(cDbTable* episodeDb, const cList<cLine>* linkLines)
{
   const int maxSeasons = 100;

   string::size_type pos;
   string compName;
   string lang = "de";
   string ename = name;

   char shortName[100] = "";
   char col1Name[100] = "";
   char col2Name[100] = "";
   char col3Name[100] = "";
   int exColCount = 0;

   const cList<cLine>* theLines = linkLines ? linkLines : lines;

   if (!theLines)
      return done;

   if (isLink())
      ename = link;

   // detect language special

   if ((pos = ename.rfind('.')) != string::npos)
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

   // delete old entry of this episode

   episodeDb->deleteWhere("compname = '%s' and lang = '%s'", compName.c_str(), lang.c_str());

   // parse ...

   unsigned short seasons[maxSeasons+1];
   int seasonNr = na;
   int insideSeasonList = no;
   char* line = 0;

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
               insideSeasonList = no;
            else
               insideSeasonList = yes;

            continue;
         }

         // is season info?

         if (insideSeasonList)
         {
            int s, v, t;

            if (!isdigit(line[2]))
            {
               tell(0, "Warning: (%s) Ignoring unexpected season line [%s]"
                    " missing number at position 3", name.c_str(), line);
               continue;
            }

            if (sscanf(line, "# %d\t%d\t%d", &s, &v, &t) == 3)
            {
               if (seasonNr == na)
                  seasonNr = s;

               if (s != seasonNr)
                  tell(0, "Info: (%s) Season line [%s] not in sequence, "
                       "expected season %d", name.c_str(), line, seasonNr);

               if (seasonNr > maxSeasons)
               {
                  tell(0, "Warning: (%s) Ignoring unexpected season line "
                       "[%s] only %d seasons expected", name.c_str(), line, maxSeasons);
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

      string partNameComp;
      char partName[200] = "";
      char comment[200] = "";
      char ex1[250] = "";
      char ex2[250] = "";
      char ex3[250] = "";
      char ex[250] = "";

      int se;
      int ep;
      int no;

      // get lines like:
      //    "01<tab>1<tab>1<tab>Schatten der Vergangenheit<tab>[extcol1<tab>[extcol2<tab>[extcol3]]][<tab>#comment]<tab>"

      switch (exColCount)
      {
         case 0:
         {
            if (sscanf(line, "%d\t%d\t%d\t%[^\t\n]\t%[^\t\n]",
                       &se, &ep, &no, partName, comment) < 4)
            {
               tell(0, "Warning: (%s) Got invalid episode line [%s], "
                    "at lease 4 columns expected", name.c_str(), line);
               continue;
            }

            break;
         }
         case 1:
         {
            if (sscanf(line, "%d\t%d\t%d\t%[^\t\n]\t%[^\t\n]\t%[^\t\n]",
                       &se, &ep, &no, partName, ex1, comment) < 5)
            {
               tell(0, "Warning: (%s) Got invalid episode line [%s], "
                    "at lease 5 columns expected", name.c_str(), line);
               continue;
            }

            break;
         }
         case 2:
         {
            if (sscanf(line, "%d\t%d\t%d\t%[^\t\n]\t%[^\t\n]\t%[^\t\n]\t%[^\t\n]",
                       &se, &ep, &no, partName, ex1, ex2, comment) < 6)
            {
               tell(0, "Warning: (%s) Got invalid episode line [%s], "
                    "at lease 6 columns expected", name.c_str(), line);
               continue;
            }

            break;
         }
         case 3:
         {
            if (sscanf(line, "%d\t%d\t%d\t%[^\t\n]\t%[^\t\n]\t%[^\t\n]\t%[^\t\n]\t%[^\t\n]",
                       &se, &ep, &no, partName, ex1, ex2, ex3, comment) < 7)
            {
               tell(0, "Warning: (%s) Got invalid episode line [%s], "
                    "at lease 7 columns expected", name.c_str(), line);
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

      episodeDb->setValue("EPISODENAME", ename.c_str());
      episodeDb->setValue("LINK", isLink());
      episodeDb->setValue("PARTNAME", partName);
      episodeDb->setValue("SEASON", se);
      episodeDb->setValue("PART", ep);
      episodeDb->setValue("PARTS", se < maxSeasons ? seasons[se] : 0);
      episodeDb->setValue("NUMBER", no);

      if (!isEmpty(shortName))
      {
         string comp;
         comp = shortName;
         prepareCompressed(comp);

         episodeDb->setValue("SHORTNAME", shortName);
         episodeDb->setValue("COMPSHORTNAME", comp.c_str());
      }

      if (!isEmpty(comment))
         episodeDb->setValue("COMMENT", comment);

      if (!isEmpty(ex1) && !isEmpty(col1Name))
      {
         snprintf(ex, 250, "%s: %s", col1Name, ex1);
         episodeDb->setValue("EXTRACOL1", ex);
      }

      if (!isEmpty(ex2) && !isEmpty(col2Name))
      {
         snprintf(ex, 250, "%s: %s", col2Name, ex2);
         episodeDb->setValue("EXTRACOL2", ex);
      }

      if (!isEmpty(ex3) && !isEmpty(col3Name))
      {
         snprintf(ex, 250, "%s: %s", col3Name, ex3);
         episodeDb->setValue("EXTRACOL3", ex);
      }

      if (episodeDb->store() != success)
         tell(0, "Error: (%s) Can't store part '%s'/%d of "
              "serie '%s' in database", name.c_str(), partName, ep, ename.c_str());
   }

   free(line);

   return 0;
}
