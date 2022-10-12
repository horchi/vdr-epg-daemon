/*
 * series.h
 *
 * See the README file for copyright information
 *
 */

#ifndef __SERIES_H_
#define __SERIES_H_

#include <string>

#include "lib/db.h"
#include "svdrpclient.h"

#define episodeFileExtension ".episodes"

//***************************************************************************
// 
//***************************************************************************

enum SvdrRetrunCodes
{
   codeCommunicationEnd = 0,
   codeFileContent = 216,
   codeTransferEnd = 217,
   codeFileInfo = 218,
   codeError = 500

   /*
    # 214 Help message
    # 215 LIST or GET data
    # 216 GET data, multiple data sets
    # 217 End of multiple data sets
    # 218 Info line for 215, 216
    # 219 Info data
    # 220 VDR service ready
    # 221 VDR service closing transmission channel
    # 225 Thank you
    # 250 Requested VDR action okay, completed
    # 354 Start sending lists data

    # 451 Requested action aborted: local error in processing
    # 500 Syntax error, command unrecognized
    # 501 Syntax error in parameters or arguments
    # 502 Command not implemented yet
    # 504 Command parameter not implemented
    # 550 Requested action not taken
    # 554 Transaction failed
    # 600 Authorize ok, access granted
    # 601 Authorize fails, access denied
    # 888 Compressed data of x bytes follow

    # 900 Default plugin reply code
    # 901..999 Plugin specific reply codes

    // constable specific

    # 602 Blocked
*/
};

//***************************************************************************
// Episode File
//***************************************************************************

class cEpisodeFile : public cListObject
{
   public:

      cEpisodeFile(std::string aName, std::string aLink, cList<cLine>* aLines = 0) 
      { name = aName; link = aLink; lines = aLines; }

      ~cEpisodeFile() { if (lines) delete lines; }

      int isLink()    { return link.length() > 0; }

      int storeToTable(cDbTable* episodeDb, const cList<cLine>* linkLines = 0);

      int storeToFile(const char* aPath)
      {
         struct stat fs;

         if (stat(aPath, &fs) != 0 || !S_ISDIR(fs.st_mode))
         {
            tell(0, "Initially creating directory '%s'", aPath);

            if (mkdir(aPath, ACCESSPERMS) == -1)
               tell(0, "Can't create directory, error was %s", strerror(errno));
         }

         if (isLink())
         {
            std::string ln = std::string(aPath) + "/" + std::string(link) + episodeFileExtension;
            std::string file = std::string(name) + episodeFileExtension;

            unlink(ln.c_str());

            if (symlink(file.c_str(), ln.c_str()) != 0)
               tell(0, "SERIES: Failed to create symlink '%s', error was '%s'", 
                    ln.c_str(), strerror(errno));
         }
         else
         {
            std::string file = std::string(aPath) + "/" + std::string(name) + episodeFileExtension;
            FILE* fp;

            // open file for writing
            
            if (!(fp = fopen(file.c_str(), "w+")))
            {
               tell(0, "SERIES: Store '%s' failed, '%s'", file.c_str(), strerror(errno));
               return -1;
            }
            
            for (cLine* l = lines->First(); l; l = lines->Next(l))
            {
               fwrite(l->Text(), l->Length(), 1, fp);
               fwrite("\n", 1, 1, fp);
            }
            
            fclose(fp);
         }

         return 0;
      }

      const cList<cLine>* getLines() { return lines; }
      const char* getName()          { return name.c_str(); }
      const char* getLink()          { return link.c_str(); }

   protected:

      std::string name;
      std::string link;
      cList<cLine>* lines;
};

//***************************************************************************
// cEpisodeFiles
//***************************************************************************

class cEpisodeFiles : public cList<cEpisodeFile>
{
   public:

      cEpisodeFile* findByLink(const char* aName)
      {
         for (cEpisodeFile* f = First(); f; f = Next(f)) 
         {
            if (!f->isLink() && strcmp(f->getName(), aName) == 0)
               return f;
         }

         return 0;
      }

      int storeToFile(const char* aPath) 
      { 
         for (cEpisodeFile* f = First(); f; f = Next(f)) 
            f->storeToFile(aPath); 

         return 0; 
      }

      int storeToTable(cDbTable* episodeDb) 
      { 
         for (cEpisodeFile* f = First(); f; f = Next(f)) 
         {
            if (f->isLink())
            {
               if (cEpisodeFile* l = findByLink(f->getName()))
                  f->storeToTable(episodeDb, l->getLines());
               else
                  tell(0, "Warning: Ignoring invalid link '%s' destination '%s' not found", 
                          f->getLink(), f->getName());
            }
            else
            {
               f->storeToTable(episodeDb);
            }
         }

         return 0; 
      }

};
//***************************************************************************

#endif //  __SERIES_H_
