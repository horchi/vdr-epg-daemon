/*
 * webstore.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "lib/python.h"   // at first du to symbol conflict with older python headers

#include "httpd.h"

//***************************************************************************
// Store Channels
//***************************************************************************

int cEpgHttpd::storeChannels(json_t* jInData, json_t* response)
{
   json_t* channels = json_object_get(jInData, "channels");

   if (!channels)
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Error: Got unexpected json object");

   connection->startTransaction();

   for (void* iter = json_object_iter(channels); iter; iter = json_object_iter_next(channels, iter))
   {
      int ord = na;
      int visible = na;
      const char* name = 0;
      const char* channelid = json_object_iter_key(iter);

      for (void* iter = json_object_iter(json_object_get(channels, channelid)); iter;
           iter = json_object_iter_next(json_object_get(channels, channelid), iter))
      {
         const char* key = json_object_iter_key(iter);
         json_t* _val = json_object_iter_value(iter);

         if (strcmp(key, "sources") == 0)
            tell(3, "  'store ext sources and id' ... to be implemented ...");  // store ext sources and id -> TO BE IMPLEMENTED
         else if (strcmp(key, "name") == 0)
            name = json_string_value(_val);
         else if (strcmp(key, "visible") == 0)
            visible = json_integer_value(_val);
         else if (strcmp(key, "order") == 0)
            ord = json_integer_value(_val);
         else
            tell(0, "Error: Got unexpected json object '%s'", key);
      }

      if (!isEmpty(channelid) && ord != na && visible != na)
      {
         tell(3, "Store: '%s' name=%s; ord=%d; visible=%d", channelid, name, ord, visible);
         mapDb->clear();
         mapDb->setValue("ChannelId", channelid);
         mapDb->setValue("ChannelName", name);
         mapDb->setValue("Order", ord);
         mapDb->setValue("Visible", visible);

         updateMap->execute();    // error handling needed?
         updateMap->freeResult();
      }
   }

   connection->commit();

   return buildResponse(response, MHD_HTTP_OK, "stored");
}

//***************************************************************************
// Delete Done Timer(s)
//***************************************************************************

int cEpgHttpd::deleteDoneTimers(json_t* jInData, json_t* response)
{
   json_t* idArray = json_object_get(jInData, "delete");

   // ---------------------------
   // delete done timers by id

   if (!idArray || !json_is_array(idArray))
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Error: Got unexpected json object");

   int length = json_array_size(idArray);

   for (int i = 0; i < length; ++i)
   {
      json_t* obj = json_array_get(idArray, i);
      long id = json_integer_value(obj);

      // delete olny if not assumed in meanwhile!

      timersDoneDb->deleteWhere("id = %ld", id);
   }

   return buildResponse(response, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Delete Timer Job(s)
// -> remove pending timer action from table (cleanup)
//***************************************************************************

int cEpgHttpd::deleteTimerJobs(json_t* jInData, json_t* response)
{
   json_t* idArray = json_object_get(jInData, "delete");

   // ---------------------------
   // delete timer jobs

   if (!idArray || !json_is_array(idArray))
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Error: Got unexpected json object");

   int length = json_array_size(idArray);

   for (int i = 0; i < length; ++i)
   {
      json_t* obj = json_array_get(idArray, i);
      long id = json_integer_value(obj);

      // delete olny if not assumed in meanwhile!

      timerDb->deleteWhere("id = %ld and action != 'A'", id);  // taAssumed
   }

   return buildResponse(response, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Store Timer Job
//  -> store timer job for distribution to the VDR(s)
//     even 'delete-jobs' to distribution the delete request to the VDR(s)
//***************************************************************************

int cEpgHttpd::storeTimerJob(json_t* jInData, json_t* response)
{
   int hasEvent = no;
   long doneid = na;

   json_t* idArray = json_object_get(jInData, "delete");

   // ---------------------------
   // delete some timers

   if (idArray && json_is_array(idArray))
   {
      int length = json_array_size(idArray);

      for (int i = 0; i < length; ++i)
      {
         json_t* obj = json_array_get(idArray, i);
         long timerid = json_integer_value(obj);

         // lookup timer to get doneid

         timerDb->clear();
         timerDb->setValue("ID", timerid);

         if (!selectTimerById->find())
         {
            selectTimerById->freeResult();
            tell(0, "Timer (%ld) not found, maybe deleted from other user, skipping", timerid);
            continue;
         }

         selectTimerById->freeResult();

         timerDb->setCharValue("ACTION", taDelete);
         timerDb->setValue("SOURCE", "webif");
         timerDb->update();
      }
   }

   // ----------------------------
   // store changes of ONE timer

   else
   {
      long int eventStartTime = 0;
      cDbRow timerRow("timers");

      timerRow.clear();

      // first get and check event and channel (if set)

      int eventid = getIntFromJson(jInData, "eventid", na);
      int timerid = getIntFromJson(jInData, "id", na);
      time_t day = getIntFromJson(jInData, "day", na);

      if (eventid != na)
      {
         int unknown = yes;
         const char* channelname = "";

         useeventsDb->clear();
         useeventsDb->setValue("USEID", eventid);

         if (!selectEvent->find())
         {
            selectEvent->freeResult();
            return buildResponse(response, MHD_HTTP_NOT_FOUND, "Event '%d' not found, "
                                 "aborting request!", eventid);
         }

         long int endTime = useeventsDb->getIntValue("STARTTIME") + useeventsDb->getIntValue("DURATION");
         eventStartTime = useeventsDb->getIntValue("STARTTIME");

         if (endTime < time(0))
         {
            selectEvent->freeResult();

            return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Event '%d' finished in the past, "
                                 "aborting request!", eventid);
         }

         hasEvent = yes;

         // ---------------
         // lookup channel

         mapDb->clear();
         mapDb->setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));

         if (selectChannelFromMap->find())
         {
            unknown = mapDb->getIntValue("UNKNOWNATVDR");
            channelname = mapDb->getStrValue("CHANNELNAME");

            if (isEmpty(channelname))
               channelname = useeventsDb->getStrValue("CHANNELID");
         }

         selectChannelFromMap->freeResult();

         if (unknown)
         {
            return buildResponse(response, MHD_HTTP_NOT_FOUND, "Channel '%s' not found or unknown for at least one VDR"
                                 ", aborting request!",
                                 useeventsDb->getStrValue("CHANNELID"));
         }

         // in case of a 'new' event based timer add it to timersdone table (if desired)

         long int manualTimer2Done;

         getParameter("epgd", "manualTimer2Done", manualTimer2Done);

         if (timerid == na && manualTimer2Done)
         {
            timersDoneDb->clear();
            timersDoneDb->setCharValue("STATE", tdsTimerRequested);
            timersDoneDb->setValue("SOURCE", "webif");
            timersDoneDb->setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));
            timersDoneDb->setValue("STARTTIME", useeventsDb->getIntValue("STARTTIME"));
            timersDoneDb->setValue("DURATION", useeventsDb->getIntValue("DURATION"));
            timersDoneDb->setValue("TITLE", useeventsDb->getStrValue("TITLE"));
            timersDoneDb->setValue("COMPTITLE", useeventsDb->getStrValue("COMPTITLE"));

            if (!useeventsDb->getValue("SHORTTEXT")->isEmpty())
               timersDoneDb->setValue("SHORTTEXT", useeventsDb->getStrValue("SHORTTEXT"));
            if (!useeventsDb->getValue("COMPSHORTTEXT")->isEmpty())
               timersDoneDb->setValue("COMPSHORTTEXT", useeventsDb->getStrValue("COMPSHORTTEXT"));

            if (!useeventsDb->getValue("LONGDESCRIPTION")->isEmpty())
               timersDoneDb->setValue("LONGDESCRIPTION", useeventsDb->getStrValue("LONGDESCRIPTION"));
            if (!useeventsDb->getValue("COMPLONGDESCRIPTION")->isEmpty())
               timersDoneDb->setValue("COMPLONGDESCRIPTION", useeventsDb->getStrValue("COMPLONGDESCRIPTION"));

            if (!useeventsDb->getValue("EPISODECOMPNAME")->isEmpty())
               timersDoneDb->setValue("EPISODECOMPNAME", useeventsDb->getStrValue("EPISODECOMPNAME"));
            if (!useeventsDb->getValue("EPISODECOMPSHORTNAME")->isEmpty())
               timersDoneDb->setValue("EPISODECOMPSHORTNAME", useeventsDb->getStrValue("EPISODECOMPSHORTNAME"));

            if (!useeventsDb->getValue("EPISODECOMPPARTNAME")->isEmpty())
               timersDoneDb->setValue("EPISODECOMPPARTNAME", useeventsDb->getStrValue("EPISODECOMPPARTNAME"));
            if (!useeventsDb->getValue("EPISODELANG")->isEmpty())
               timersDoneDb->setValue("EPISODELANG", useeventsDb->getStrValue("EPISODELANG"));
            if (!useeventsDb->getValue("EPISODESEASON")->isEmpty())
               timersDoneDb->setValue("EPISODESEASON", useeventsDb->getIntValue("EPISODESEASON"));
            if (!useeventsDb->getValue("EPISODEPART")->isEmpty())
               timersDoneDb->setValue("EPISODEPART", useeventsDb->getIntValue("EPISODEPART"));

            if (!isEmpty(channelname))
               timersDoneDb->setValue("CHANNELNAME", channelname);

            timersDoneDb->insert();
            doneid = timersDoneDb->getLastInsertId();
         }
      }

      // -----------------------------------
      // get optional data

      timerRow.setValue("ID", timerid);

      if (doneid != na)
         timerRow.setValue("DONEID", doneid);

      timerRow.setValue("SOURCE", "webif");
      timerRow.setValue("ACTIVE", yes);
      getFieldFromJson(jInData, &timerRow, "ACTIVE");

      int namingmode = getIntFromJson(jInData, "namingmode", tnmAuto);
      const char* tmplExpression = getStringFromJson(jInData, "template", "");

      if (namingmode != tnmDefault && hasEvent)
      {
         if (ptyRecName->execute(useeventsDb, namingmode, tmplExpression) == success)
         {
            tell(1, "Info: The recording name (mode=%d) calculated by 'recording.py' is '%s'",
                 namingmode, ptyRecName->getResult());

            if (!isEmpty(ptyRecName->getResult()))
               timerRow.setValue("FILE", ptyRecName->getResult());
         }
      }

      timerRow.setValue("TEMPLATE", tmplExpression);
      timerRow.setValue("NAMINGMODE", namingmode);

      if (day != na)
      {
         day = midnightOf(day);
         timerRow.setValue("DAY", day);
      }

      if (eventid != na)
      {
         timerRow.setValue("EVENTID", eventid);
         timerRow.setValue("_STARTTIME", eventStartTime);
      }

      getFieldFromJson(jInData, &timerRow, "VDRUUID");

      if (timerRow.getValue("VDRUUID")->isEmpty())
         timerRow.setValue("VDRUUID", "any");              // the default

      getFieldFromJson(jInData, &timerRow, "STARTTIME");
      getFieldFromJson(jInData, &timerRow, "ENDTIME");
      getFieldFromJson(jInData, &timerRow, "WEEKDAYS");
      getFieldFromJson(jInData, &timerRow, "VPS");
      getFieldFromJson(jInData, &timerRow, "PRIORITY");
      getFieldFromJson(jInData, &timerRow, "LIFETIME");
      getFieldFromJson(jInData, &timerRow, "CHILDLOCK");
      getFieldFromJson(jInData, &timerRow, "CHANNELID");
      getFieldFromJson(jInData, &timerRow, "DIRECTORY");

      modifyCreateTimer(&timerRow);
   }

   triggerVdrs("TIMERJOB", "epg2vdr");

   selectEvent->freeResult();

   return buildResponse(response, MHD_HTTP_OK, "stored");
}

//***************************************************************************
// Modify Timer (copy paste from cMenuDb of epg2vdr)
//
//    - timerRow contains the destination vdrUuid
//***************************************************************************

int cEpgHttpd::modifyCreateTimer(cDbRow* timerRow)
{
   int status = success;
   int timerid = timerRow->getIntValue("ID");
   int knownTimer = timerid != na;
   int move = no;

   connection->startTransaction();

   timerDb->clear();

   // lookup known (existing) timer

   if (knownTimer)
   {
      timerDb->copyValues(timerRow, cDBS::ftPrimary);

      if (!timerDb->find())
      {
         connection->commit();

         tell(0, "Timer (%d) at vdr '%s' not found, aborting modify request!",
              timerid, timerDb->getStrValue("VDRUUID"));

         return fail;
      }

      // found and all values are loaded!

      // move to another vdr?

      if (!timerDb->hasValue("VDRUUID", timerRow->getStrValue("VDRUUID")))
         move = yes;
   }
   else
   {
      timerDb->setValue("VDRUUID", timerRow->getStrValue("VDRUUID"));
   }

   if (move)
   {
      // request 'D'elete of 'old' timer

      timerDb->setCharValue("ACTION", taDelete);
      timerDb->setValue("SOURCE", timerRow->getStrValue("SOURCE"));
      status = timerDb->update();

      // triggerVdrs("TIMERJOB", timerDb->getStrValue("VDRUUID"));

      // create new on other vdr

      timerDb->copyValues(timerRow, cDBS::ftData);          // takeover all data (possibly modified by user)
      timerDb->setValue("ID", 0);
      timerDb->setCharValue("ACTION", taCreate);
      status += timerDb->insert();

      if (status == success)
         tell(1, "Created 'move' request for timer (%d) at vdr '%s'",
              timerid, timerDb->getStrValue("VDRUUID"));
   }
   else
   {
      // create 'C'reate oder 'M'odify request ...

      timerDb->copyValues(timerRow, cDBS::ftData);
      timerDb->setCharValue("ACTION", knownTimer ? taModify : taCreate);

      if (knownTimer)
         status = timerDb->update();
      else
         status = timerDb->insert();

      if (status == success)
         tell(1, "Created '%s' request for timer (%d) at vdr '%s'",
              knownTimer ? "modify" : "create",
              timerid, timerDb->getStrValue("VDRUUID"));
   }

   connection->commit();

   // triggerVdrs("TIMERJOB", timerDb->getStrValue("VDRUUID"));

   return status;
}

//***************************************************************************
// Store Timer
//***************************************************************************

int cEpgHttpd::storeSearchTimer(json_t* jInData, json_t* response)
{
   cDbTableDef* def = searchtimerDb->getTableDef();
   int insert = yes;

   // get data

   json_t* idArray = json_object_get(jInData, "delete");

   // ---------------------------
   // delete some search timers

   if (idArray && json_is_array(idArray))
   {
      int length = json_array_size(idArray);
      int deleted = 0;
      int failed = 0;

      for (int i = 0; i < length; ++i)
      {
         json_t* obj = json_array_get(idArray, i);
         long id = json_integer_value(obj);

         searchtimerDb->clear();
         searchtimerDb->setValue("ID", id);

         if (!searchtimerDb->find())
         {
            failed++;
            // failedMsg +=
            tell(0, "Warning: Can't delete searchtimer %ld, not fount, ignoring", id);
            continue;
         }

         searchtimerDb->setValue("STATE", "D");
         searchtimerDb->update();
         deleted++;
      }

      return buildResponse(response, failed ? MHD_HTTP_CONFLICT : MHD_HTTP_OK,
                           "deleted %d searchtimer, %d failed", deleted, failed);
   }

   // get/check data

   int id = getIntFromJson(jInData, "id", na);
   const char* expression = getStringFromJson(jInData, "expression", "");
   const char* name = getStringFromJson(jInData, "name", expression);
   const char* state = getStringFromJson(jInData, "state", "");

   tell(2, "%s searchtimer%s '%s' with expression '%s'",
        *state == 'D' ? "Delete" : id == na ? "Append" : "Modify",
        id == na ? "" : std::string(" " + num2Str(id)).c_str(), name , expression);

   // web deliver name = "" instead of null if not set

   if (isEmpty(name))
      name = expression;

   if (isEmpty(expression) && *state != 'D')
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Ignoring searchtimer request without an expression!");

   searchtimerDb->clear();

   if (id != na)
   {
      searchtimerDb->setValue("ID", id);

      if (!searchtimerDb->find())
         return buildResponse(response, MHD_HTTP_NOT_FOUND, "Ignoring change request for searchtimer %d, not found!", id);

      insert = no;
   }

   if (*state == 'D')
   {
      searchtimerDb->setValue("STATE", "D");
      searchtimerDb->update();
      return buildResponse(response, MHD_HTTP_OK, "deleted");
   }

   const char* specialfields = "STATE:NAME:HITS:SOURCE:ACTIVE:SEARCHMODE:SEARCHFIELDS:NAMINGMODE:VDRUUID:MODSP:LASTRUN";

   for (int i = 0; i < def->fieldCount(); i++)
   {
      if (def->getField(i)->hasType(cDBS::ftMeta) || def->getField(i)->hasType(cDBS::ftPrimary))
         continue;

      if (strstr(specialfields, def->getField(i)->getName()))
         continue;

      getFieldFromJson(jInData, searchtimerDb->getRow(), def->getField(i)->getName());
   }

   int active = getIntFromJson(jInData, "active", yes);
   int searchmode = getIntFromJson(jInData, "searchmode", smRegexp);
   int searchfields = getIntFromJson(jInData, "searchfields", sfTitle);
   int namingmode = getIntFromJson(jInData, "namingmode", tnmAuto);
   const char* vdruuid = getStringFromJson(jInData, "vdruuid", "any");
   int nameChanged = !insert && searchtimerDb->hasValue("NAME", name);

   searchtimerDb->setValue("NAME", name);
   searchtimerDb->setValue("STATE", "");
   searchtimerDb->setValue("SOURCE", "webif");
   searchtimerDb->setValue("ACTIVE", active);
   searchtimerDb->setValue("SEARCHMODE", searchmode);
   searchtimerDb->setValue("SEARCHFIELDS", searchfields);
   searchtimerDb->setValue("NAMINGMODE", namingmode);
   searchtimerDb->setValue("VDRUUID", vdruuid);
   searchtimerDb->setValue("MODSP", time(0));
   searchtimerDb->setValue("LASTRUN", 0);                   // reset last run to force search

   // store ....

   if (insert)
      searchtimerDb->insert();
   else
      searchtimerDb->update();

   if (id != na && nameChanged)
   {
      // #TODO - update AUTOTIMERNAME in timers an timersdone ...

      timerDb->clear();
      timerDb->setValue("AUTOTIMERID", id);
      timerDb->setValue("AUTOTIMERNAME", name);
      updateTimerAName->execute();

      timersDoneDb->clear();
      timersDoneDb->setValue("AUTOTIMERID", id);
      timersDoneDb->setValue("AUTOTIMERNAME", name);
      updateDoneAName->execute();
   }

   // result

   return buildResponse(response, MHD_HTTP_OK, "stored");
}

//***************************************************************************
// Store Parameters
//***************************************************************************

int cEpgHttpd::storeParameters(json_t* jInData, json_t* response)
{
   int stored = 0;
   int failed = 0;
   int statusCode = MHD_HTTP_OK;
   json_t* oFails = json_array();
   json_t* parameters = json_object_get(jInData, "parameters");

   if (!parameters && !json_is_array(parameters))
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Error: Got unexpected json object");

   int length = json_array_size(parameters);

   for (int i = 0; i < length; ++i)
   {
      json_t* obj = json_array_get(parameters, i);

      const char* owner = getStringFromJson(obj, "owner");
      const char* name = getStringFromJson(obj, "name");
      const char* value = getStringFromJson(obj, "value");

      if (!isEmpty(owner) && !isEmpty(name))
      {
         // Owner "@" used for 'needLogin = no'
         // If owner "@...." check user to avoid edit parameter of others ...

         if (owner[0] == '@' && strlen(owner) > 1)
         {
            if (!currentSession || strcmp(owner+1, currentSession->user.c_str()) != 0)
            {
               tell(0, "Warning: Modification of parameter '%s/%s' for other user '%s' rejected",
                    owner+1, name, currentSession ? currentSession->user.c_str() : "<null>");
               failed++;

               continue;
            }
         }

         if (!value)
         {
            tell(0, "Warning: Ignoring save request for parameter '%s/%s', missing value", owner+1, name);
            json_array_append_new(oFails, json_integer(i));
            failed++;

            continue;
         }

         if (setParameter(owner, name, value) == success)
            stored++;
         else
         {
            json_array_append_new(oFails, json_integer(i));
            failed++;
         }
      }
   }

   // if at least one faild ..

   if (failed)
      statusCode = MHD_HTTP_CONFLICT;

   int status = buildResponse(response, statusCode, "stored %d parameters, "
                              "%d failed - see log for details", stored, failed);

   json_t* oResult = json_object_get(response, "result");

   if (failed && oResult)
      json_object_set_new(oResult, "failed", oFails);

   return status;
}

//***************************************************************************
// Store Users
//***************************************************************************

int cEpgHttpd::storeUsers(json_t* jInData, json_t* response)
{
   json_t* users = json_object_get(jInData, "users");

   if (!users && !json_is_array(users))
      return buildResponse(response, MHD_HTTP_NOT_FOUND, "Error: Got unexpected json object");

   if (needLogin() && !currentSession)
      return buildResponse(response, MHD_HTTP_FORBIDDEN, "Rejecting request, "
                           "insufficient rights for user management!");

   int length = json_array_size(users);

   for (int i = 0; i < length; ++i)
   {
      int insert;
      json_t* obj = json_array_get(users, i);
      const char* user = getStringFromJson(obj, "user");
      const char* state = getStringFromJson(obj, "state");

      // tell(0, "STATE '%s'; USER '%s'", state, user);

      if (!isEmpty(user) && !isEmpty(state))
      {
         const char* passwd = getStringFromJson(obj, "passwd");
         int active = getIntFromJson(obj, "active");
         int rights = getIntFromJson(obj, "rights");

         userDb->clear();
         userDb->setValue("USER", user);

         // search user to collect data .. if exist

         insert = !userDb->find();

         if (!insert && state[0] == 'C')
         {
            tell(0, "Warning: Ignoring 'create' user request, user '%s' already exists",
                 user);
            continue;
         }
         else if (insert && state[0] != 'C')
         {
            tell(0, "Warning: Ignoring '%s' user request, user '%s' not found",
                 state[0] == 'D' ? "delete" : "modify", user);
            continue;
         }

         if (state[0] == 'D')
         {
            userDb->reset();
            userDb->deleteWhere("user = '%s'", user);

            continue;
         }

         // update values

         if (!isEmpty(passwd))
            userDb->setValue("PASSWD", passwd);

         if (active != na)
            userDb->setValue("ACTIVE", active);

         if (rights != na)
         {
            if (!needLogin())
               userDb->setValue("RIGHTS", rights);
            else if (currentSession->rights)
               userDb->setValue("RIGHTS", rights & currentSession->rights);
         }

         userDb->store();
         userDb->reset();

         tell(1, "%s user '%s'", state[0] == 'D' ? "deleted" : insert ? "Inserted" : "Updated", user);
      }
   }

   return buildResponse(response, MHD_HTTP_OK, "stored");
}

//***************************************************************************
// mark Messages
//***************************************************************************

int cEpgHttpd::markMessages(json_t* jInData, json_t* response)
{
   json_t* idArray = json_object_get(jInData, "messages");

   // ---------------------------
   // mark messages

   if (!idArray || !json_is_array(idArray))
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Error: Got unexpected json object");

   int length = json_array_size(idArray);

   for (int i = 0; i < length; ++i)
   {
      json_t* obj = json_array_get(idArray, i);
      long id = getIntFromJson(obj, "id");
      const char* state = getStringFromJson(obj, "state");

      messageDb->setValue("ID", id);

      if (messageDb->find())
      {
         messageDb->setValue("STATE", state);
         messageDb->store();
      }
   }

   return buildResponse(response, MHD_HTTP_OK, "done");
}
