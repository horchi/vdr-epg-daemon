/*
 * searchtimer.h
 *
 * See the README file for copyright information
 *
 */

#ifndef __SEARCHTIMER_H
#define __SEARCHTIMER_H

#include "common.h"
#include "configuration.h"
#include "db.h"
#include "epgservice.h"
#include "json.h"

class Python;

//***************************************************************************
// Search Timer
//***************************************************************************

class cSearchTimer
{
   public:

      cSearchTimer(cFrame* aParent);
      ~cSearchTimer();

      int init(const char* confDir);
      int initDb();
      int exitDb();
      int checkConnection();
      int dbConnected(int force = no) { return connection && (!force || connection->check() == success); }

      int modified();  // check if a search timer is modified by user
      int updateSearchTimers(int force = yes, const char* reason = "");
      int checkTimers();

      int getSearchMatches(cDbRow* searchTimer, json_t* obj, int start = 0, int max = na);
      int getDoneFor(cDbRow* searchTimer, cDbRow* useevent, json_t* obj);
      int checkTimerConflicts(std::string& mailBody);
      int getUsedTransponderAt(time_t lStartTime, time_t lEndTime, std::string& mailBody);

   private:

      struct cTccTimerData
      {
         long id;
         int begin;
         int end;
         std::string channel;
         std::string file;
      };

      struct cTccTransponder
      {
         int count;
         std::list<cTccTimerData> timers;
      };

      cDbStatement* prepareSearchStatement(cDbRow* searchTimer);
      int matchCriterias(cDbRow* searchTimer, cDbRow* event);
      int isAlreadyDone(int repeatfields, json_t* obj = 0, int silent = no);
      int createTimer(int id);
      int modifyCreateTimer(cDbRow* timerRow, int& newid, int createRetry = no);
      // int rejectTimer(cDbRow* timerRow);
      int modifyTimer(cDbTable* timerDb, TimerAction action);

      // data

      Python* ptyRecName;

      cDbConnection* connection;

      cDbTable* searchtimerDb;
      cDbTable* useeventsDb;
      cDbTable* timersDoneDb;
      cDbTable* timerDb;
      cDbTable* mapDb;
      cDbTable* vdrDb;
      // cDbTable* messageDb;

      cDbStatement* selectChannelFromMap;
      cDbStatement* selectDoneTimer;
      cDbStatement* selectActiveSearchtimers;
      cDbStatement* selectSearchtimerMaxModSp;
      cDbStatement* selectSearchTimerByName;
      cDbStatement* selectSearchTimerById;
      // cDbStatement* selectActiveVdrs;
      cDbStatement* selectAllTimer;
      cDbStatement* selectRPTimerByEvent;
      cDbStatement* selectTimerByEventId;
      cDbStatement* selectConflictingTimers;
      cDbStatement* selectFailedTimerByEvent;
      cDbStatement* selectEvent;

      cDbValue startValue;
      cDbValue endValue;

      time_t lastSearchTimerUpdate;

      static int searchField[];
      static const char* searchFieldName[];
      static int repeadCheckField[];
      static const char* repeadCheckFieldName[];
      cFrame* parent;
};

//***************************************************************************
#endif // __SEARCHTIMER_H
