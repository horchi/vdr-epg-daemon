/*
 * webdo.c
 *
 * See the README file for copyright information and how to reach the author.
 *
 */

#include "lib/imgtools.h"
#include "lib/curl.h"

#include "svdrpclient.h"

#include "httpd.h"

//***************************************************************************
// Collect Scraper Data
//***************************************************************************

int cEpgHttpd::collectScraperData(json_t* oScraperData, int movieId, int seriesId, int episodeId)
{
   if (movieId)
   {
      movieDb->clear();
      movieDb->setValue("MOVIEID", movieId);

      if (selectMovie->find())
      {
         json_t* oMovieData = json_object();

         addFieldToJson(oMovieData, movieDb, "MovieId");
         addFieldToJson(oMovieData, movieDb, "Title");
         addFieldToJson(oMovieData, movieDb, "OriginalTitle");
         addFieldToJson(oMovieData, movieDb, "Tagline");
         addFieldToJson(oMovieData, movieDb, "Overview");
         addFieldToJson(oMovieData, movieDb, "IsAdult");
         addFieldToJson(oMovieData, movieDb, "CollectionId");
         addFieldToJson(oMovieData, movieDb, "CollectionName");
         addFieldToJson(oMovieData, movieDb, "Budget");
         addFieldToJson(oMovieData, movieDb, "Revenue");
         addFieldToJson(oMovieData, movieDb, "Genres");
         addFieldToJson(oMovieData, movieDb, "Homepage");
         addFieldToJson(oMovieData, movieDb, "ReleaaseDate");
         addFieldToJson(oMovieData, movieDb, "Runtime");
         addFieldToJson(oMovieData, movieDb, "Popularity");
         addFieldToJson(oMovieData, movieDb, "VoteAverage");

         // movie actors and actors media

         json_t* oActorsData = json_object();

         movieActorsDb->clear();
         movieActorDb->clear();
         movieMediaDb->clear();
         movieActorsDb->setValue("MovieId", movieId);

         for (int f = selectMovieActors->find(); f; f = selectMovieActors->fetch())
         {
            json_t* oActorData = json_object();

            addFieldToJson(oActorData, movieActorDb, "ActorId");
            addFieldToJson(oActorData, movieActorDb, "ActorName");
            addFieldToJson(oActorData, movieActorsDb, "Role");
            addFieldToJson(oActorData, movieMediaDb, "MediaType");
            // addFieldToJson(oActorData, &imageSize, yes, "media_size");
            // addFieldToJson(oActorData, movieMediaDb, "MediaUrl");

            json_object_set_new(oActorsData, num2Str(movieactorActorId->getIntValue()).c_str(), oActorData);
         }

         selectMovieActors->freeResult();

         // movie media

         json_t* oMovieMedia = json_object();

         movieMediaDb->clear();
         movieMediaDb->setValue("MovieId", movieId);

         for (int f = selectMovieMedia->find(); f; f = selectMovieMedia->fetch())
            json_object_set_new(oMovieMedia, num2Str(moviemediaMediaType->getIntValue()).c_str(), json_integer(1));

         selectMovieMedia->freeResult();
         selectMovie->freeResult();

         // concaternate

         json_object_set_new(oMovieData, "media", oMovieMedia);
         json_object_set_new(oMovieData, "actors", oActorsData);
         json_object_set_new(oScraperData, "movie", oMovieData);
      }
   }

   // series data from scraper

   if (seriesId)
   {
      seriesDb->clear();
      seriesDb->setValue("SeriesId", seriesId);

      if (selectSerie->find())
      {
         json_t* oSeriesData = json_object();

         addFieldToJson(oSeriesData, seriesDb, "SeriesId");
         addFieldToJson(oSeriesData, seriesDb, "SeriesName");
         addFieldToJson(oSeriesData, seriesDb, "SeriesOverview");
         addFieldToJson(oSeriesData, seriesDb, "SeriesFirstAired");
         addFieldToJson(oSeriesData, seriesDb, "SeriesNetwork");
         addFieldToJson(oSeriesData, seriesDb, "SeriesGenre");
         addFieldToJson(oSeriesData, seriesDb, "SeriesRating");
         addFieldToJson(oSeriesData, seriesDb, "SeriesStatus");

         // series episode

         seriesEpisodeDb->clear();
         seriesEpisodeDb->setValue("EpisodeId", episodeId);

         if (selectSeriesEpisode->find())
         {
            json_t* oSeriesEpisodeData = json_object();

            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "EpisodeName");
            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "EpisodeId");
            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "EpisodeNumber" );
            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "SeasonNumber");
            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "EpisodeOverview");
            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "EpisodeFirstAired");
            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "EpisodeGuestStars");
            addFieldToJson(oSeriesEpisodeData, seriesEpisodeDb, "EpisodeRating");

            // series/epidode media

            seriesMediaDb->clear();
            seriesMediaDb->setValue("SeriesId", seriesId);
            seriesMediaDb->setValue("SeasonNumber", seriesepisodeSeasonNumber->getIntValue());
            seriesMediaDb->setValue("EpisodeId", seriesepisodeEpisodeId->getIntValue());

            json_t* oSeriesMedias = json_object();
            json_t* oSeriesActors = json_object();

            for (int f = selectSeriesMedia->find(); f; f = selectSeriesMedia->fetch())
            {
               json_object_set_new(oSeriesMedias, num2Str(seriesmediaMediaType->getIntValue()).c_str(), json_integer(1));

               if (seriesmediaActorId->getIntValue())
               {
                  json_t* oSeriesActorData = json_object();

                  addFieldToJson(oSeriesActorData, seriesActorsDb, "ActorName");
                  addFieldToJson(oSeriesActorData, seriesActorsDb, "ActorRole");
                  addFieldToJson(oSeriesActorData, seriesActorsDb, "SortOrder");

                  json_object_set_new(oSeriesActors, num2Str(seriesmediaActorId->getIntValue()).c_str(), oSeriesActorData);
               }
            }

            selectSeriesMedia->freeResult();
            selectSeriesEpisode->freeResult();

            // concaternate

            json_object_set_new(oSeriesData, "actors", oSeriesActors);
            json_object_set_new(oSeriesData, "media", oSeriesMedias);
            json_object_set_new(oSeriesData, "episode", oSeriesEpisodeData);
         }

         selectSerie->freeResult();

         json_object_set_new(oScraperData, "serie", oSeriesData);
      }
   }

   return done;
}

//***************************************************************************
// Do Update Searchtimer
//***************************************************************************

int cEpgHttpd::doUpdateSearchtimer(MHD_Connection* tcp, json_t* obj)
{
   triggerEpgd();

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Update Recording Table
//***************************************************************************

int cEpgHttpd::doUpdateRecordingTable(MHD_Connection* tcp, json_t* obj)
{
   triggerVdrs("UPDR");                // trigger all vdrs re-read of the recordings directory
   triggerVdrs("UPDREC", "epg2vdr");   // trigger epg2vdr tu update their data

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Wakeup VDR
//***************************************************************************

int cEpgHttpd::doWakeupVdr(MHD_Connection* tcp, json_t* obj)
{
   int status = MHD_HTTP_OK;
   const char* uuid = getStrParameter(tcp, "uuid");

   if (isEmpty(uuid))
      status = MHD_HTTP_INTERNAL_SERVER_ERROR;

   if (wakeupVdr(uuid) != success)
       status = MHD_HTTP_INTERNAL_SERVER_ERROR;

   return buildResponse(obj, status, status == MHD_HTTP_OK ? "done" : "wakeup failed");
}

//***************************************************************************
// Do Rename Recording
//***************************************************************************

int cEpgHttpd::doRenameRecording(MHD_Connection* tcp, json_t* obj)
{
   int status;
   int alive = no;
   const char* ip = 0;
   int port = 0;
   const char* vdrUuid = 0;
   const char* videoBasePath = "";
   char* opt;
   char result[512+TB] = "";

   const char* md5path = getStrParameter(tcp, "md5path");
   time_t starttime = getIntParameter(tcp, "starttime");
   const char* owner = getStrParameter(tcp, "owner", "");
   const char* newName = getStrParameter(tcp, "name");

   if (isEmpty(md5path) || !starttime || isEmpty(newName))
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Missing recording reference in request");

   recordingListDb->clear();
   recordingListDb->setValue("MD5PATH", md5path);
   recordingListDb->setValue("STARTTIME", starttime);
   recordingListDb->setValue("OWNER", owner);

   if (!recordingListDb->find())
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Recording '%s' not found", md5path);

   vdrUuid = recordingListDb->getStrValue("VDRUUID");
   alive = ipOfVdr(recordingListDb->getStrValue("VDRUUID"), ip, port);

   recordingListDb->reset();

   if (!alive || isEmpty(ip) || !port)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Can't rename recording, VDR is not alive");

   vdrDb->clear();
   vdrDb->setValue("UUID", vdrUuid);

   if (vdrDb->find())
      videoBasePath = vdrDb->getStrValue("VIDEODIR");

   vdrDb->reset();

   asprintf(&opt, "%s/%s %s", videoBasePath, recordingListDb->getStrValue("PATH"), newName);
   status = triggerVdr(ip, port, "RENREC", "epg2vdr", opt, result);
   free(opt);

   if (status != success)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "%s", result);

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Delete Recording
//***************************************************************************

int cEpgHttpd::doDeleteRecording(MHD_Connection* tcp, json_t* obj)
{
   int status;
   int alive = no;
   const char* ip = 0;
   int port = 0;
   char* name = 0;
   char result[512+TB] = "";
   const char* vdrUuid = 0;
   const char* videoBasePath = "";

   const char* md5path = getStrParameter(tcp, "md5path");
   time_t starttime = getIntParameter(tcp, "starttime");
   const char* owner = getStrParameter(tcp, "owner", "");

   if (isEmpty(md5path) || !starttime)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Missing recording reference in request");

   recordingListDb->clear();
   recordingListDb->setValue("MD5PATH", md5path);
   recordingListDb->setValue("STARTTIME", starttime);
   recordingListDb->setValue("OWNER", owner);

   if (!recordingListDb->find())
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Recording '%s' not found", md5path);

   vdrUuid = recordingListDb->getStrValue("VDRUUID");
   alive = ipOfVdr(vdrUuid, ip, port);

   recordingListDb->reset();

   if (!alive || isEmpty(ip) || !port)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Can't delete recording, VDR is not alive");

   vdrDb->clear();
   vdrDb->setValue("Uuid", vdrUuid);
   vdrDb->reset();

   if (vdrDb->find())
      videoBasePath = vdrDb->getStrValue("VIDEODIR");

   vdrDb->reset();

   asprintf(&name, "%s/%s", videoBasePath, recordingListDb->getStrValue("PATH"));
   status = triggerVdr(ip, port, "DELREC", "epg2vdr", name, result);
   free(name);

   if (status != success)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "%s", result);

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Replay Recording
//***************************************************************************

int cEpgHttpd::doReplayRecording(MHD_Connection* tcp, json_t* obj)
{
   int status;
   int alive = no;
   const char* ip = 0;
   int port = 0;
   char* opt = 0;
   const char* name = 0;
   char result[512+TB] = "";
   const char* videoBasePath = "";

   const char* md5path = getStrParameter(tcp, "md5path");
   const char* owner = getStrParameter(tcp, "owner", "");
   time_t starttime = getIntParameter(tcp, "starttime");
   const char* vdruuid = getStrParameter(tcp, "vdruuid");
   const char* position = getStrParameter(tcp, "position", "");

   if (isEmpty(md5path) || isEmpty(vdruuid) || !starttime)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Missing recording or vdr reference in request");

   if (strcasecmp(owner, "undefined") == 0)
      owner = "";

   recordingListDb->clear();
   recordingListDb->setValue("MD5PATH", md5path);
   recordingListDb->setValue("STARTTIME", starttime);
   recordingListDb->setValue("OWNER", owner);

   if (!recordingListDb->find())
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Recording '%s/%s/%ld' not found", md5path, owner, starttime);

   alive = ipOfVdr(vdruuid, ip, port);
   name = recordingListDb->getStrValue("PATH");

   recordingListDb->reset();

   vdrDb->clear();
   vdrDb->setValue("Uuid", vdruuid);
   vdrDb->reset();

   if (vdrDb->find())
      videoBasePath = vdrDb->getStrValue("VIDEODIR");

   vdrDb->reset();

   if (!alive || isEmpty(ip) || !port)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Can't replay recording, VDR is not alive");

   asprintf(&opt, "%s/%s %s", videoBasePath, name, position);
   status = triggerVdr(ip, port, "PLAYREC", "epg2vdr", opt, result);
   free(opt);

   if (status != success)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "%s", result);

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Stop Key
//***************************************************************************

int cEpgHttpd::doHitKey(MHD_Connection* tcp, json_t* obj)
{
   int alive;
   const char* ip = 0;
   int port = 0;
   char result[512+TB] = "";

   const char* vdruuid = getStrParameter(tcp, "vdruuid");
   const char* key = getStrParameter(tcp, "key");

   if (isEmpty(vdruuid) || isEmpty(key))
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Missing at least the vdr reference or the key code");

   alive = ipOfVdr(vdruuid, ip, port);

   if (!alive || isEmpty(ip) || !port)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Can't send key code, VDR is not alive");

   if (triggerVdr(ip, port, "HITK", 0, key, result) != success)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "%s", result);

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Log
//***************************************************************************

int cEpgHttpd::doLog(MHD_Connection* tcp, json_t* obj)
{
   int level = getIntParameter(tcp, "loglevel", 1);
   const char* msg = getStrParameter(tcp, "message", "");
   char* buffer = (char*)malloc(strlen(msg)+TB);

   urlUnescape(buffer, msg);

   if (!isEmpty(buffer))
      tell(level, "webif: %s", buffer);

   free(buffer);

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Debug
//***************************************************************************

int cEpgHttpd::doDebug(MHD_Connection* tcp, json_t* obj)
{
   // 'GET' parameters

   EpgdConfig.loglevel = getIntParameter(tcp, "loglevel", EpgdConfig.loglevel);

   tell(0, "Set log level to (%d)", EpgdConfig.loglevel);

   return buildResponse(obj, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Channel Switch
//***************************************************************************

int cEpgHttpd::doChannelSwitch(MHD_Connection* tcp, json_t* obj)
{
   // where channel can <number> | <name> | <id>

   const char* channelPar = getStrParameter(tcp, "channel", "");
   const char* uuidPar = getStrParameter(tcp, "uuid");
   int statusCode = MHD_HTTP_INTERNAL_SERVER_ERROR;
   char* message = 0;

   tell(0, "Switching vdr '%s' to channel '%s'", uuidPar, channelPar);

   vdrDb->clear();
   vdrDb->setValue("Uuid", uuidPar);

   if (vdrDb->find())
   {
      if (strcasecmp(vdrState->getStrValue(), "attached") == 0)
      {
         const char* ip = vdrIp->getStrValue();
         unsigned int port = vdrSvdrp->getIntValue();

         if (!port)
            port = 6419;

         cSvdrpClient cl(ip, port);

         // open tcp connection

         if (cl.open() == success)
         {
            char* command = 0;
            cList<cLine> result;

            asprintf(&command, "CHAN %s", channelPar);

            if (!cl.send(command))
            {
               asprintf(&message, "Error: Send '%s' failed!", command);
            }
            else
            {
               int status = cl.receive(&result);

               if (result.First() && result.First()->Text())
                  asprintf(&message, "Send '%s' succeeded; Got %d '%s'", command, status, result.First()->Text());
               else
                  asprintf(&message, "Send '%s' succeeded but missing response from vdr", command);

               statusCode = MHD_HTTP_OK;
            }

            free(command);
            cl.close(no);
         }
         else
         {
            asprintf(&message, "Error: Can't switch channel, vdr '%s' svdrp connect failed!", uuidPar);
         }
      }
      else
      {
         asprintf(&message, "Info: Can't switch channel, vdr '%s' not running!", uuidPar);
      }
   }
   else
   {
      asprintf(&message, "Info: Can't switch channel, vdr '%s' not known!", uuidPar);
   }

   tell(0, "%s", message);

   vdrDb->reset();

   buildResponse(obj, statusCode, "%s", message);
   free(message);

   return statusCode;
}

//***************************************************************************
// Do Channel Logo
//***************************************************************************

int cEpgHttpd::doChannelLogo(MHD_Connection* tcp, json_t* obj, MemoryStruct* data)
{
   // 'GET' parameters

   long int logoUpper;
   long int logoById;
   char logoSuffix[sizeMaxParameterValue+TB];

   const char* id = getStrParameter(tcp, "id");
   int maxW = getIntParameter(tcp, "maxW", 100);
   int maxH = getIntParameter(tcp, "maxH", 80);

   if (isEmpty(id))
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Missing channel id in request");

   getParameter("epgd", "logoUpperCase", logoUpper);
   getParameter("epgd", "logoById", logoById);
   getParameter("epgd", "logoSuffix", logoSuffix);

   mapDb->clear();
   mapDb->setValue("ChannelId", id);

   if (selectMapById->find())
   {
      if (!isEmpty(mapChannelName->getStrValue()))
      {
         char* path;
         char* cnlName = strdup(mapChannelName->getStrValue());
         char* cnlId = strdup(id);
         Imlib_Image image;
         Imlib_Load_Error err;

         toCase(logoUpper ? cUpper : cLower, cnlName);
         toCase(logoUpper ? cUpper : cLower, cnlId);

         asprintf(&path, "%s/channellogos/%s.%s", EpgdConfig.httpPath,
                  logoById ? cnlId : cnlName, logoSuffix);

         data->modTime = fileModTime(path);

         tell(3, "file: %s; expire: %s", l2pTime(data->modTime).c_str(), l2pTime(data->expireAt).c_str());

         if (!data->expireAt || data->modTime > data->expireAt)
         {
            if (strcasecmp(suffixOf(path), "svg") == 0)
            {
               if (loadFromFile(path, data) == success)
                  sprintf(data->name, "%.*s", (int)sizeof(data->name), path);
            }
            else
            {
               image = imlib_load_image_with_error_return(path, &err);

               if (image)
               {
                  scaleImageToJpegBuffer(image, data, maxW, maxH);
                  sprintf(data->contentType, "image/jpg");

                  imlib_context_set_image(image);
                  imlib_free_image();
               }
               else
                  tell(2, "The image '%s' could not be loaded, error was '%s' (%d)",
                       path, strImlibError(err), err);
            }
         }

         free(cnlId);
         free(path);
         free(cnlName);
      }
   }
   else
      tell(1, "Info: Channelname for '%s' unknown", id);

   selectMapById->freeResult();

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do EPG Image
//***************************************************************************

int cEpgHttpd::doEpgImage(MHD_Connection* tcp, json_t* obj, MemoryStruct* data)
{
   // 'GET' parameters

   int useId = getIntParameter(tcp, "id");
   int maxW = getIntParameter(tcp, "maxW");
   int maxH = getIntParameter(tcp, "maxH");
   int no = getIntParameter(tcp, "no");

   data->clear();

   if (!useId)
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Missing event id in request");

   tell(3, "lookup image for (%d/%d)", useId, no);

   useeventsDb->clear();
   useeventsDb->setValue("USEID", useId);

   if (selectEvent->find())
   {
      tEventId  id = imageid.getBigintValue();

      tell(3, "found event for useid %d -> eventid is %llu", useId, id);

      imageRefDb->clear();
      imageRefDb->setBigintValue("EventId", id);
      imageRefDb->setValue("Lfn", no);

      if (imageRefDb->find())
      {
         const char* imageName = imagerefImgName->getStrValue();

         imageDb->clear();
         imageDb->setValue("ImgName", imageName);

         if (imageDb->find() && !imageImage->isNull())
         {
            data->modTime = imageUpdSp->getIntValue();

            tell(3, "file: %s; expire: %s", l2pTime(data->modTime).c_str(), l2pTime(data->expireAt).c_str());

            if (!data->expireAt || data->modTime > data->expireAt)
            {
               data->size = imageImage->getStrValueSize();

               tell(3, "found image with %ld bytes", data->size);

               // imageImage->getStrValue();

               data->memory = (char*)malloc(data->size);
               memcpy(data->memory, imageImage->getStrValue(), data->size);

               scaleJpegBuffer(data, maxW, maxH);
               sprintf(data->contentType, "image/jpg");
            }
         }

         imageDb->reset();
      }

      imageRefDb->reset();
   }

   selectEvent->freeResult();

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Movie Media (images)
//***************************************************************************

int cEpgHttpd::doMovieMedia(MHD_Connection* tcp, json_t* obj, MemoryStruct* data)
{
   // 'GET' parameters

   int movieId = getIntParameter(tcp, "movie_id", na);
   int actorId = getIntParameter(tcp, "actor_id", na);
   int mediaType = getIntParameter(tcp, "media_type", na);
   int maxW = getIntParameter(tcp, "maxW");
   int maxH = getIntParameter(tcp, "maxH");

   data->clear();

   if (actorId)
      movieId = 0;

   if (movieId == na || actorId == na || mediaType == na)
      return buildResponse(obj, MHD_HTTP_BAD_REQUEST, "Missing madatory request parameter");

   tell(3, "lookup movie media for (%d/%d/%d)", movieId, actorId, mediaType);

   movieMediaDb->clear();
   movieMediaDb->setValue("MovieId", movieId);
   movieMediaDb->setValue("ActorId", actorId);
   movieMediaDb->setValue("MediaType", mediaType);

   if (movieMediaDb->find() && !moviemediaMediaContent->isNull())
   {
      tell(3, "found movie media for %d/%d/%d", movieId, actorId, mediaType);

      // fake modTime until movieMediaDb table dont support updsp !!

      // data->modTime = movieMediaDb->getIntValue("UpdSp");

      data->modTime = data->expireAt ? data->expireAt : time(0);  // fake!!

      tell(3, "Media: modified at: %s; expire at: %s", l2pTime(data->modTime).c_str(), l2pTime(data->expireAt).c_str());

      if (!data->expireAt || data->modTime > data->expireAt)
      {
         data->size = moviemediaMediaContent->getStrValueSize();

         tell(3, "found media with %ld bytes", data->size);

         data->memory = (char*)malloc(data->size);
         memcpy(data->memory, moviemediaMediaContent->getStrValue(), data->size);

         scaleJpegBuffer(data, maxW, maxH);
         sprintf(data->contentType, "image/jpg");
      }
   }

   movieMediaDb->reset();

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Series Media (images)
//***************************************************************************

int cEpgHttpd::doSeriesMedia(MHD_Connection* tcp, json_t* obj, MemoryStruct* data)
{
   // 'GET' parameters

   int seriesId = getIntParameter(tcp, "series_id", na);
   int seasonNumber = getIntParameter(tcp, "season_number", na);
   int episodeId = getIntParameter(tcp, "episode_id", na);
   int actorId = getIntParameter(tcp, "actor_id", 0);
   int mediaType = getIntParameter(tcp, "media_type", na);
   int maxW = getIntParameter(tcp, "maxW");
   int maxH = getIntParameter(tcp, "maxH");

   data->clear();

   if (actorId)
   {
      mediaType = 11;
      seasonNumber = 0;
      episodeId = 0;
   }

   if (seriesId == na || seasonNumber == na || episodeId == na || mediaType == na)
      return buildResponse(obj, MHD_HTTP_BAD_REQUEST, "Missing madatory request parameter");

   tell(3, "lookup series media for (%d/%d/%d/%d/%d)", seriesId, seasonNumber, episodeId, actorId, mediaType);

   seriesMediaDb->clear();
   seriesMediaDb->setValue("SERIESID", seriesId);
   seriesMediaDb->setValue("SEASONNUMBER", seasonNumber);
   seriesMediaDb->setValue("EPISODEID", episodeId);
   seriesMediaDb->setValue("ACTORID", actorId);
   seriesMediaDb->setValue("MEDIATYPE", mediaType);

   if (seriesMediaDb->find() && !seriesmediaMediaContent->isNull())
   {
      data->modTime = seriesMediaDb->getIntValue("UPDSP");

      tell(3, "Found series media for (%d/%d/%d/%d/%d)", seriesId, seasonNumber, episodeId, actorId, mediaType);
      tell(3, "Media: modified at: %s; expire at: %s", l2pTime(data->modTime).c_str(), l2pTime(data->expireAt).c_str());

      if (!data->expireAt || data->modTime > data->expireAt)
      {
         data->size = seriesmediaMediaContent->getStrValueSize();

         tell(3, "found media with %ld bytes", data->size);

         data->memory = (char*)malloc(data->size);
         memcpy(data->memory, seriesmediaMediaContent->getStrValue(), data->size);

         scaleJpegBuffer(data, maxW, maxH);
         sprintf(data->contentType, "image/jpg");
      }
   }

   seriesMediaDb->reset();

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Channels
//***************************************************************************

int cEpgHttpd::doChannels(MHD_Connection* tcp, json_t* obj)
{
   json_t* oChannel = json_array();
   json_t* oChanData = 0;
   json_t* oSources = 0;
   std::string last = "";

   mapDb->clear();

   for (int found = selectAllMap->find(); found; found = selectAllMap->fetch())
   {
      const char* id = mapChannelId->getStrValue();

      if (last != id)
      {
         // push last object - if one

         if (oChanData)
            json_array_append_new(oChannel, oChanData);

         oChanData = json_object();
         oSources = json_object();
         json_object_set_new(oChanData, "sources", oSources);

         addFieldToJson(oChanData, mapDb, "CHANNELID", yes);
         addFieldToJson(oChanData, mapDb, "CHANNELNAME", yes, "name");
         addFieldToJson(oChanData, mapDb, "ORDER");
         addFieldToJson(oChanData, mapDb, "VISIBLE");

         last = id;
      }

      json_t* oSource = json_object();

      addFieldToJson(oSource, mapDb, "ExternalId");
      addFieldToJson(oSource, mapDb, "Merge");

      json_object_set_new(oSources, mapSource->getStrValue(), oSource);
   }

   if (oChanData && last.length())
      json_array_append_new(oChannel, oChanData);

   selectAllMap->freeResult();

   json_object_set_new(obj, "channels", oChannel);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Genres
//***************************************************************************

int cEpgHttpd::doGenres(MHD_Connection* tcp, json_t* obj)
{
   json_t* oGenres = json_array();

   useeventsDb->clear();

   for (int found = selectGenres->find(); found; found = selectGenres->fetch())
      if (!isEmpty(eventsGenre->getStrValue()))
          json_array_append_new(oGenres, json_string(eventsGenre->getStrValue()));

   selectGenres->freeResult();

   json_object_set_new(obj, "genres", oGenres);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Categories
//***************************************************************************

int cEpgHttpd::doCategories(MHD_Connection* tcp, json_t* obj)
{
   json_t* oCategories = json_array();

   useeventsDb->clear();

   for (int found = selectCategories->find(); found; found = selectCategories->fetch())
      if (!isEmpty(eventsCategory->getStrValue()))
         json_array_append_new(oCategories, json_string(eventsCategory->getStrValue()));

   selectCategories->freeResult();

   json_object_set_new(obj, "categories", oCategories);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Vdrs
//***************************************************************************

int cEpgHttpd::doVdrs(MHD_Connection* tcp, json_t* obj)
{
   json_t* oVdrs = json_object();

   vdrDb->clear();

   for (int found = selectVdrs->find(); found; found = selectVdrs->fetch())
   {
      const char* uuid = vdrUuid->getStrValue();
      int share = vdrDb->getIntValue("SHAREINWEB");
      int svdrp = vdrSvdrp->getIntValue();

      if (share && svdrp && !isEmpty(uuid) && strcmp(uuid, "epgd") != 0)
      {
         json_t* o = json_object();
         cDbTableDef* def = vdrDb->getTableDef();

         for (int i = 0; i < def->fieldCount(); i++)
         {
            if (!def->getField(i)->hasType(cDBS::ftMeta) &&
                !def->getField(i)->hasName("UUID") &&
                !vdrDb->getValue(def->getField(i))->isNull())
                addFieldToJson(o, vdrDb->getValue(def->getField(i)));
         }

         json_object_set_new(oVdrs, uuid, o);
      }
   }

   selectVdrs->freeResult();
   json_object_set_new(obj, "vdrs", oVdrs);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Users
//***************************************************************************

int cEpgHttpd::doUsers(MHD_Connection* tcp, json_t* obj)
{
   json_t* oUsers = json_object();

   userDb->clear();

   for (int found = selectUsers->find(); found; found = selectUsers->fetch())
   {
      json_t* o = json_object();

      addFieldToJson(o, userDb, "USER");
      addFieldToJson(o, userDb, "ACTIVE");
      addFieldToJson(o, userDb, "RIGHTS");

      json_object_set_new(oUsers, userDb->getStrValue("USER"), o);
   }

   selectUsers->freeResult();

   json_object_set_new(obj, "users", oUsers);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Proxy (webcontent)
//***************************************************************************

int cEpgHttpd::doProxy(MHD_Connection* tcp, json_t* obj, MemoryStruct* data)
{
   // 'GET' parameters

   const char* typeId = getStrParameter(tcp, "id");
   char* url = 0;
   int size = 0;
   int statusCode = MHD_HTTP_OK;

   data->clear();

   if (strcasecmp(typeId, "vdr") == 0)
   {
      // const char* uuidPar = getStrParameter(tcp, "uuid");

      // todo Jörg: Könntest du hier über SVDRP und LSTE alle Kanäle
      //    holen und einfach als Textliste zurückgeben

      return buildResponse(obj, MHD_HTTP_NOT_IMPLEMENTED, "not implemented yet");
   }

   else if (strcasecmp(typeId, "channelpedia") == 0)
   {
      asprintf(&url, "http://channelpedia.yavdr.com/gen/%s",
               getStrParameter(tcp, "path", ""));
   }

   else if (strcasecmp(typeId, "constabel") == 0)
   {
      asprintf(&url, "%s/eplist.cgi?action=show&file=%s",
               EpgdConfig.seriesUrl,
               getStrParameter(tcp, "title", ""));
   }

   if (!url)
      return buildResponse(obj, MHD_HTTP_BAD_REQUEST, "Missing id in request");

   if (curl.downloadFile(url, size, data) != success)
      statusCode = MHD_HTTP_NOT_FOUND;

   free(url);

   return statusCode;
}

//***************************************************************************
// Do Event
//***************************************************************************

int cEpgHttpd::doEvent(MHD_Connection* tcp, json_t* obj, MemoryStruct* data)
{
   // 'GET' parameters

   int id = getIntParameter(tcp, "id");

   // or .. time and channel

   time_t time = getIntParameter(tcp, "time");
   const char* channelid= getStrParameter(tcp, "channelid");

   // check

   if (!id && !time && !channelid)
      return buildResponse(obj, MHD_HTTP_BAD_REQUEST, "Missing event id or time and channel in request");

   cDbStatement* select = id ? selectEvent : selectEventByTime;

   // ...

   useeventsDb->clear();
   useeventsDb->setValue("USEID", id);
   useeventsDb->setValue("STARTTIME", time);
   useeventsDb->setValue("CHANNELID", channelid);
   endTime.setValue(time);

   if (select->find())
   {
      data->modTime = eventsUpdSp->getIntValue();

      tell(3, "file: %s; expire: %s", l2pTime(data->modTime).c_str(), l2pTime(data->expireAt).c_str());

      if (!data->expireAt || data->modTime > data->expireAt)
      {
         json_t* oEvtData = json_object();
         json_t* oEpiData = json_object();

         addFieldToJson(oEvtData, useeventsDb, "USEID", no, "id");
         addFieldToJson(oEvtData, useeventsDb, "CHANNELID");
         addFieldToJson(oEvtData, useeventsDb, "STARTTIME");
         addFieldToJson(oEvtData, useeventsDb, "DURATION");
         addFieldToJson(oEvtData, useeventsDb, "CATEGORY");
         addFieldToJson(oEvtData, useeventsDb, "GENRE");
         addFieldToJson(oEvtData, useeventsDb, "TITLE");
         addFieldToJson(oEvtData, useeventsDb, "SHORTTEXT");
         addFieldToJson(oEvtData, useeventsDb, "IMAGECOUNT");

         addFieldToJson(oEvtData, useeventsDb, "LONGDESCRIPTION");
         addFieldToJson(oEvtData, useeventsDb, "CNTLONGDESCRIPTION");
         addFieldToJson(oEvtData, useeventsDb, "SHORTDESCRIPTION");
         addFieldToJson(oEvtData, useeventsDb, "PARENTALRATING");
         addFieldToJson(oEvtData, useeventsDb, "ACTOR");
         addFieldToJson(oEvtData, useeventsDb, "AUDIO");
         addFieldToJson(oEvtData, useeventsDb, "COUNTRY");
         addFieldToJson(oEvtData, useeventsDb, "DIRECTOR");
         addFieldToJson(oEvtData, useeventsDb, "FLAGS");
         addFieldToJson(oEvtData, useeventsDb, "MUSIC");
         addFieldToJson(oEvtData, useeventsDb, "PRODUCER");
         addFieldToJson(oEvtData, useeventsDb, "SCREENPLAY");
         addFieldToJson(oEvtData, useeventsDb, "SHORTREVIEW");
         addFieldToJson(oEvtData, useeventsDb, "NUMRATING");
         addFieldToJson(oEvtData, useeventsDb, "TXTRATING");
         addFieldToJson(oEvtData, useeventsDb, "TIPP");
         addFieldToJson(oEvtData, useeventsDb, "TOPIC");
         addFieldToJson(oEvtData, useeventsDb, "YEAR");
         addFieldToJson(oEvtData, useeventsDb, "RATING");
         addFieldToJson(oEvtData, useeventsDb, "MODERATOR");
         addFieldToJson(oEvtData, useeventsDb, "COMMENTATOR");
         addFieldToJson(oEvtData, useeventsDb, "OTHER");
         addFieldToJson(oEvtData, useeventsDb, "GUEST");
         addFieldToJson(oEvtData, useeventsDb, "CAMERA");
         addFieldToJson(oEvtData, &merge);

         // timer for this Event pending?

         timerDb->clear();
         timerDb->setValue("EVENTID", useeventsDb->getIntValue("USEID"));
         timerDb->setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));

         if (selectTimerByEventId->find())
            addFieldToJson(oEvtData, timerDb, "ID", no, "TIMERID");

         selectTimerByEventId->freeResult();

         // epispode data

         addFieldToJson(oEpiData, useeventsDb, "EPISODENAME",      yes, "episodename");
         addFieldToJson(oEpiData, useeventsDb, "EPISODESHORTNAME", yes, "shortname");
         addFieldToJson(oEpiData, useeventsDb, "EPISODEPARTNAME",  yes, "partname");
         addFieldToJson(oEpiData, useeventsDb, "EPISODEEXTRACOL1", yes, "extracol1");
         addFieldToJson(oEpiData, useeventsDb, "EPISODEEXTRACOL2", yes, "extracol2");
         addFieldToJson(oEpiData, useeventsDb, "EPISODEEXTRACOL3", yes, "extracol3");
         addFieldToJson(oEpiData, useeventsDb, "EPISODESEASON",    yes, "season");
         addFieldToJson(oEpiData, useeventsDb, "EPISODEPART",      yes, "part");
         addFieldToJson(oEpiData, useeventsDb, "EPISODEPARTS",     yes, "parts");
         addFieldToJson(oEpiData, useeventsDb, "EPISODENUMBER",    yes, "number");

         // ---------------------
         // collect scraper data

         json_t* oScraperData = json_object();

         collectScraperData(oScraperData,
                            useeventsDb->getIntValue("SCRMOVIEID"),
                            useeventsDb->getIntValue("SCRSERIESID"),
                            useeventsDb->getIntValue("SCRSERIESEPISODE"));

         // -----------------------
         // matching recordings

         json_t* oRecordings = json_array();

         recordingListDb->clear();
         recordingListDb->setValue("TITLE", useeventsDb->getStrValue("TITLE"));
         recordingListDb->setValue("SHORTTEXT", useeventsDb->getStrValue("SHORTTEXT"));

         for (int f = selectRecordingForEventByLv->find(); f; f = selectRecordingForEventByLv->fetch())
         {
            json_t* oRecData = json_object();

            if (recordingListDb->getIntValue("FSK") == 1)             // check FSK
            {
               if (!currentSession || !hasUserMask(currentSession->rights, umFsk))
               {
                  tell(1, "Skipping recording '%s' due FSK flag", recordingListDb->getStrValue("TITLE"));
                  continue;
               }
            }

            addFieldToJson(oRecData, recordingListDb, "NAME");
            addFieldToJson(oRecData, recordingListDb, "TITLE");
            addFieldToJson(oRecData, recordingListDb, "SHORTTEXT");
            addFieldToJson(oRecData, recordingListDb, "STARTTIME");
            addFieldToJson(oRecData, recordingListDb, "OWNER");
            addFieldToJson(oRecData, recordingListDb, "MD5PATH");
            addFieldToJson(oRecData, recordingListDb, "PATH");
            addFieldToJson(oRecData, recordingListDb, "DURATION");
            addFieldToJson(oRecData, recordingListDb, "OWNER");
            addFieldToJson(oRecData, &matchDensityTitle);
            addFieldToJson(oRecData, &matchDensityShorttext);

            json_array_append_new(oRecordings, oRecData);

            tell(2, "Found recording for '%s' wich a match density of (%ld%%/%ld%%)",
                 recordingListDb->getStrValue("TITLE"),
                 matchDensityTitle.getIntValue(), matchDensityShorttext.getIntValue());
         }

         selectRecordingForEventByLv->freeResult();

         // final

         json_object_set_new(oEvtData, "recordings", oRecordings);
         json_object_set_new(oEvtData, "scraper", oScraperData);
         json_object_set_new(oEvtData, "episode", oEpiData);
         json_object_set_new(obj, "event", oEvtData);
      }
   }
   else
   {
      tell(0, "Warning: Event '%d' not found", id);
   }

   select->freeResult();

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Events
//***************************************************************************

int cEpgHttpd::doEvents(MHD_Connection* tcp, json_t* obj)
{
   json_t* oEvent = json_array();
   cDbStatement* select;

   // 'GET' parameters

   time_t begTimePar = getIntParameter(tcp, "time");
   time_t endTimePar = getIntParameter(tcp, "endtime");
   const char* channelidPar = getStrParameter(tcp, "channelid", "%");    // !! set default to "%"
   int getNext = getIntParameter(tcp, "next", 0);

   // check ...

   if (begTimePar < time(0) - 2*tmeSecondsPerDay)
   {
      tell(0, "Error: Requested time '%s' out of range!", l2pTime(begTimePar).c_str());
   }
   else
   {
      // prepare ...

      useeventsDb->clear();

      if (!endTimePar)                            // events running at specific time
      {
         if (getNext > 0)
         {
            select = selectEventsNext;
            useeventsDb->setValue("STARTTIME", begTimePar);

            tell(2, "Select events starting after '%s'", l2pTime(begTimePar).c_str());
         }
         else
         {
            select = selectEventsAt;
            useeventsDb->setValue("STARTTIME", begTimePar);
            endTime.setValue(begTimePar);

            tell(2, "Select events running at '%s'(%ld), channelid '%s'",
                 l2pTime(begTimePar).c_str(), begTimePar, channelidPar);
         }
      }
      else                                        // events starting in specified range
      {
         select = selectEventsStartInRange;
         useeventsDb->setValue("StartTime", begTimePar);
         startTime.setValue(endTimePar);

         tell(2, "Select events starting between '%s'(%ld) and '%s'(%ld), channelid '%s'",
              l2pTime(begTimePar).c_str(), begTimePar, l2pTime(endTimePar).c_str(), endTimePar, channelidPar);
      }

      useeventsDb->setValue("ChannelId", channelidPar);

      // query ...

      for (int found = select->find(); found; found = select->fetch())
      {
         json_t* oEvtData = json_object();

         addFieldToJson(oEvtData, useeventsDb, "USEID", no, "id");
         addFieldToJson(oEvtData, useeventsDb, "CHANNELID");
         addFieldToJson(oEvtData, useeventsDb, "STARTTIME");
         addFieldToJson(oEvtData, useeventsDb, "DURATION");
         addFieldToJson(oEvtData, useeventsDb, "CATEGORY");
         addFieldToJson(oEvtData, useeventsDb, "GENRE");
         addFieldToJson(oEvtData, useeventsDb, "TITLE");
         addFieldToJson(oEvtData, useeventsDb, "SHORTTEXT");
         addFieldToJson(oEvtData, useeventsDb, "SHORTDESCRIPTION");
         addFieldToJson(oEvtData, useeventsDb, "NUMRATING");
         addFieldToJson(oEvtData, useeventsDb, "TIPP");
         addFieldToJson(oEvtData, useeventsDb, "IMAGECOUNT");

         // timer for this Event pending?

         timerDb->clear();
         timerDb->setValue("EVENTID", useeventsDb->getIntValue("USEID"));
         timerDb->setValue("CHANNELID", useeventsDb->getStrValue("CHANNELID"));

         if (selectTimerByEventId->find())
            addFieldToJson(oEvtData, timerDb, "ID", no, "TIMERID");

         selectTimerByEventId->freeResult();

         json_array_append_new(oEvent, oEvtData);
      }

      select->freeResult();
   }

   json_object_set_new(obj, "events", oEvent);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Timer Jobs
//***************************************************************************

int cEpgHttpd::doTimerJobs(MHD_Connection* tcp, json_t* obj)
{
   json_t* oTimer = json_array();

   // prepare ...

   timerDb->clear();

   // query pending timer actions

   for (int found = selectPendingTimerActions->find(); found; found = selectPendingTimerActions->fetch())
   {
      json_t* oData = json_object();

      cDbTableDef* def = timerDb->getTableDef();

      for (int i = 0; i < def->fieldCount(); i++)
         addFieldToJson(oData, timerDb->getValue(def->getField(i)));

      json_array_append_new(oTimer, oData);
   }

   selectPendingTimerActions->freeResult();

   json_object_set_new(obj, "timers", oTimer);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Done Timers
//***************************************************************************

int cEpgHttpd::doDoneTimers(MHD_Connection* tcp, json_t* obj)
{
   json_t* oTimer = json_array();

   // prepare ...

   timersDoneDb->clear();

   // query pending and failed timers ...

   for (int found = selectDoneTimers->find(); found; found = selectDoneTimers->fetch())
   {
      json_t* oData = json_object();

      addFieldToJson(oData, timersDoneDb, "ID");
      addFieldToJson(oData, timersDoneDb, "STATE");
      addFieldToJson(oData, timersDoneDb, "STARTTIME");
      addFieldToJson(oData, timersDoneDb, "DURATION");
      addFieldToJson(oData, timersDoneDb, "TITLE");
      addFieldToJson(oData, timersDoneDb, "SHORTTEXT");
      addFieldToJson(oData, timersDoneDb, "CHANNELID");
      addFieldToJson(oData, timersDoneDb, "AUTOTIMERID");
      addFieldToJson(oData, timersDoneDb, "AUTOTIMERNAME");
      addFieldToJson(oData, timersDoneDb, "EXPRESSION");

      json_array_append_new(oTimer, oData);
   }

   selectDoneTimers->freeResult();

   json_object_set_new(obj, "donetimers", oTimer);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Done Timer
//***************************************************************************

int cEpgHttpd::doDoneTimer(MHD_Connection* tcp, json_t* obj)
{
   int id = getIntParameter(tcp, "id");

   timersDoneDb->clear();
   timersDoneDb->setValue("ID", id);

   // query

   if (timersDoneDb->find())
   {
      json_t* oTimer = json_object();
      cDbTableDef* def = timersDoneDb->getTableDef();

      for (int i = 0; i < def->fieldCount(); i++)
      {
         if (!def->getField(i)->hasType(cDBS::ftMeta))
            addFieldToJson(oTimer, timersDoneDb->getValue(def->getField(i)));
      }

      json_object_set_new(obj, "donetimer", oTimer);
   }
   else
   {
      timersDoneDb->reset();
      return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Done timer '%d' not found", id);
   }

   timersDoneDb->reset();

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Parameters
//***************************************************************************

int cEpgHttpd::doParameters(MHD_Connection* tcp, json_t* obj)
{
   json_t* oParameters = json_array();
   int needLg = needLogin();

   // prepare ...

   parametersDb->clear();

   // work ...

   for (int i = 0; cParameters::parameters[i].name != 0; i++)
   {
      json_t* oData = json_object();
      const char* value;
      Parameter* definition = &cParameters::parameters[i];
      std::string user = std::string("@") + (currentSession ? currentSession->user : std::string(""));
      std::string owner = definition->owner;

      // skip invisible

      if (!definition || !definition->visible)
         continue;

      // if login required (needLogin is set) and no session active (currentSession)
      // only reply the "needLogin" parameter

      if (!currentSession && needLg && strcasecmp(definition->name, "needLogin") != 0)
         continue;

      if (currentSession && definition->owner[0] == '@')
         owner = "@" + currentSession->user;

      json_object_set_new(oData, "owner", json_string(owner.c_str()));
      json_object_set_new(oData, "name", json_string(definition->name));

      parametersDb->setValue("OWNER", owner.c_str());
      parametersDb->setValue("NAME", definition->name);

      if (parametersDb->find())
         value = parametersDb->getStrValue("VALUE");
      else
         value = definition->def;

      parametersDb->reset();

      json_object_set_new(oData, "value", json_string(value));
      json_object_set_new(oData, "type", json_integer(definition->type));
      json_object_set_new(oData, "default", json_string(definition->def));
      json_object_set_new(oData, "valexp", json_string(definition->regexp));
      json_object_set_new(oData, "readonly", json_integer(definition->readonly));

      json_array_append_new(oParameters, oData);
   }

   json_object_set_new(obj, "parameters", oParameters);
   json_object_set_new(obj, "timezone", json_integer(isDST() ? timezone - 3600 : timezone));
   tell(2, "daylight (%d); timezone is (%ld)", isDST(), timezone);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Recording Directories
//***************************************************************************

int cEpgHttpd::doRecDirs(MHD_Connection* tcp, json_t* obj)
{
   json_t* oDirectories = json_array();

   // prepare ...

   recordingDirDb->clear();

   // query ...

   for (int found = selectRecordingDirs->find(); found; found = selectRecordingDirs->fetch())
   {
      json_t* oData = json_object();

      cDbTableDef* def = recordingDirDb->getTableDef();

      for (int i = 0; i < def->fieldCount(); i++)
         if (!def->getField(i)->hasType(cDBS::ftMeta))
            addFieldToJson(oData, recordingDirDb->getValue(def->getField(i)));

      json_array_append_new(oDirectories, oData);
   }

   selectRecordingDirs->freeResult();

   json_object_set_new(obj, "recordingdirs", oDirectories);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Timers
//***************************************************************************

int cEpgHttpd::doTimers(MHD_Connection* tcp, json_t* obj)
{
   json_t* oTimer = json_array();
   long autotimerid = getIntParameter(tcp, "autotimerid", na);

   const char* state = getStrParameter(tcp, "state", "");
   const char* action = getStrParameter(tcp, "action", "");
   const char* nstate = getStrParameter(tcp, "notstate", "");
   const char* naction = getStrParameter(tcp, "notaction", "");

   // prepare ...

   timerDb->clear();

   // timerIncState.setValue(incState);
   // timerExcState.setValue(excState);
   // timerIncAction.setValue(incAction);
   // timerExcAction.setValue(excAction);

   tell(2, "Searching timer with state/action '%s/%s'", state, action);

   // query ...

   for (int found = selectAllTimer->find(); found; found = selectAllTimer->fetch())
   {
      json_t* oData = json_object();

      // webif requested timers for specific autotimer?

      if (autotimerid != na && autotimerid != timerDb->getIntValue("AUTOTIMERID"))
         continue;

      // state / action

      if (!isEmpty(action) && !strchr(action, *timerDb->getStrValue("ACTION")))
         continue;

      if (!isEmpty(state)&& !strchr(state, *timerDb->getStrValue("STATE")))
         continue;

      if (!isEmpty(naction) && strchr(naction, *timerDb->getStrValue("ACTION")))
         continue;

      if (!isEmpty(nstate) && strchr(nstate, *timerDb->getStrValue("STATE")))
         continue;

      cDbTableDef* def = timerDb->getTableDef();

      for (int i = 0; i < def->fieldCount(); i++)
      {
         if (!def->getField(i)->hasType(cDBS::ftMeta))
            addFieldToJson(oData, timerDb->getValue(def->getField(i)));
      }

      addFieldToJson(oData, useeventsDb, "TITLE");
      addFieldToJson(oData, useeventsDb, "SHORTTEXT");
      addFieldToJson(oData, useeventsDb, "SHORTDESCRIPTION");
      addFieldToJson(oData, useeventsDb, "CATEGORY");
      addFieldToJson(oData, useeventsDb, "GENRE");
      addFieldToJson(oData, useeventsDb, "NUMRATING");

      if (!timerDb->getValue("AUTOTIMERID")->isNull())
      {
         // useeventsDb->find();   // get all fields

         searchtimerDb->clear();
         searchtimerDb->setValue("ID", timerDb->getIntValue("AUTOTIMERID"));

         if (searchtimerDb->find())
            search->getDoneFor(searchtimerDb->getRow(), useeventsDb->getRow(), oData);
         else
            tell(0, "Warning: Searchtimer %ld not found", timerDb->getIntValue("AUTOTIMERID"));
      }

      json_array_append_new(oTimer, oData);
   }

   selectAllTimer->freeResult();

   json_object_set_new(obj, "timers", oTimer);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Recordings
//***************************************************************************

int cEpgHttpd::doRecordings(MHD_Connection* tcp, json_t* obj)
{
   json_t* oRecording = json_array();

   // prepare ...

   vdrDb->clear();
   recordingListDb->clear();

   // query ...

   for (int found = selectAllRecordings->find(); found; found = selectAllRecordings->fetch())
   {
      json_t* oData = json_object();

      if (!vdrDb->getIntValue("SHAREINWEB"))
      {
         tell(1, "Skipping recording '%s' due to not shareinweb flag", recordingListDb->getStrValue("TITLE"));
         continue;
      }

      // check FSK

      if (recordingListDb->getIntValue("FSK") == 1)
      {
         if (!currentSession || !hasUserMask(currentSession->rights, umFsk))
         {
            tell(1, "Skipping recording '%s' due FSK flag", recordingListDb->getStrValue("TITLE"));
            continue;
         }
      }

      addFieldToJson(oData, recordingListDb, "NAME");
      addFieldToJson(oData, recordingListDb, "TITLE");
      addFieldToJson(oData, recordingListDb, "SHORTTEXT");
      addFieldToJson(oData, recordingListDb, "STARTTIME");
      addFieldToJson(oData, recordingListDb, "OWNER");
      addFieldToJson(oData, recordingListDb, "MD5PATH");
      addFieldToJson(oData, recordingListDb, "PATH");
      addFieldToJson(oData, recordingListDb, "DURATION");
      addFieldToJson(oData, recordingListDb, "VDRUUID");

      json_array_append_new(oRecording, oData);
   }

   selectAllRecordings->freeResult();

   json_object_set_new(obj, "recordings", oRecording);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Recording
//***************************************************************************

int cEpgHttpd::doRecording(MHD_Connection* tcp, json_t* obj)
{
   json_t* oRecording = json_object();

   int starttime = getIntParameter(tcp, "starttime");
   const char* md5path = getStrParameter(tcp, "md5path");
   const char* path = getStrParameter(tcp, "path");
   const char* owner = getStrParameter(tcp, "owner", "");

   // check

   if (!starttime || (!md5path && !path))
      return buildResponse(obj, MHD_HTTP_BAD_REQUEST, "Missing event start time or md5path/path in request");

   // prepare

   recordingListDb->clear();
   recordingListDb->setValue("STARTTIME", starttime);
   recordingListDb->setValue("OWNER", owner);

   if (!isEmpty(md5path))
   {
      recordingListDb->setValue("MD5PATH", md5path);

      if (!recordingListDb->find())
         return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Recording '%s/%d' not found", md5path, starttime);
   }
   else if (!isEmpty(path))
   {
      recordingListDb->setValue("PATH", path);

      if (!selectRecordingByPath->find())
         return buildResponse(obj, MHD_HTTP_NOT_FOUND, "Recording '%s/%d' not found", md5path, starttime);
   }

   cDbTableDef* def = recordingListDb->getTableDef();

   for (int i = 0; i < def->fieldCount(); i++)
   {
      if (!def->getField(i)->hasType(cDBS::ftMeta))
         addFieldToJson(oRecording, recordingListDb->getValue(def->getField(i)));
   }

   // ---------------------
   // collect scraper data

   json_t* oScraperData = json_object();

   collectScraperData(oScraperData,
                      recordingListDb->getIntValue("SCRMOVIEID"),
                      recordingListDb->getIntValue("SCRSERIESID"),
                      recordingListDb->getIntValue("SCRSERIESEPISODE"));

   // final

   json_object_set_new(oRecording, "scraper", oScraperData);
      json_object_set_new(obj, "recording", oRecording);

   recordingListDb->reset();

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Searchtimers
//***************************************************************************

int cEpgHttpd::doSearchtimers(MHD_Connection* tcp, json_t* obj)
{
   json_t* oTimer = json_array();
   int count = 0;

   const char* type = getStrParameter(tcp, "type", 0);

   // prepare ...

   searchtimerDb->clear();

   // query ...

   for (int found = selectAllSearchTimer->find(); found; found = selectAllSearchTimer->fetch())
   {
      json_t* oData = json_object();
      cDbTableDef* def = searchtimerDb->getTableDef();

      if (type && !searchtimerDb->hasValue("TYPE", type))
         continue;

      for (int i = 0; i < def->fieldCount(); i++)
      {
         if (!def->getField(i)->hasType(cDBS::ftMeta))
            addFieldToJson(oData, searchtimerDb->getValue(def->getField(i)));
      }

      json_array_append_new(oTimer, oData);
      count++;
   }

   selectAllSearchTimer->freeResult();
   json_object_set_new(obj, "searchtimers", oTimer);
   tell(3, "Finished searchtimer request with %d results", count);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Search
//***************************************************************************

int cEpgHttpd::doSearch(json_t* jInData, json_t* response)
{
   int id = getIntFromJson(jInData, "autotimerid", na);
   const char* name = getStringFromJson(jInData, "autotimername", 0);

   int start = getIntFromJson(jInData, "start", 0);
   int max = getIntFromJson(jInData, "max", na);  // na -> alle, 0 - nur zählen, > 0 - limit

   // with id, use searchtimer ...

   if (id > 0 || !isEmpty(name))
   {
      cDbRow* searchTimer = new cDbRow("searchtimers");
      searchTimer->clear();
      searchTimer->setValue("ID", id);
      searchTimer->setValue("NAME", name);
      search->getSearchMatches(searchTimer, response, start, max);
      delete searchTimer;
      return MHD_HTTP_OK;
   }

   // without id, use given criterias ...

   const char* expression = getStringFromJson(jInData, "expression", "");

   if (isEmpty(expression))
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Ignoring search request need at lease a expression or id!");

   cDbRow* searchTimer = new cDbRow("searchtimers");
   cDbTableDef* def = searchTimer->getTableDef();

   searchTimer->clear();

   for (int i = 0; i < def->fieldCount(); i++)
   {
      const char* jName = 0;

      if (def->getField(i)->hasType(cDBS::ftMeta) || def->getField(i)->hasType(cDBS::ftPrimary))
         continue;

      getFieldFromJson(jInData, searchTimer, def->getField(i)->getName(), jName);
   }

   search->getSearchMatches(searchTimer, response, start, max);

   delete searchTimer;

   return MHD_HTTP_OK;
}

//***************************************************************************
// Send Mail
//***************************************************************************

int cEpgHttpd::doSendMail(json_t* jInData, json_t* response)
{
   char* command = 0;
   char mailScript[255+TB];
   int res;

   const char* receiver = getStringFromJson(jInData, "receiver", "");
   const char* body = getStringFromJson(jInData, "body", "test mail");
   const char* subject = getStringFromJson(jInData, "subject", "test");
   const char* mimeType = getStringFromJson(jInData, "mimetype", "text/plain");

   getParameter("epgd", "mailScript", mailScript);

   if (isEmpty(mailScript))
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "Missing mailScript in configuration");

   if (!fileExists(mailScript))
      return buildResponse(response, MHD_HTTP_BAD_REQUEST, "File '%s' not found", mailScript);

   // send HTML mail

   tell(0, "Send mail '%s' with [%s] to '%s'", subject, body, receiver);

   asprintf(&command, "%s '%s' '%s' '%s' %s", mailScript,
            subject, body, mimeType, receiver);

   if ((res = system(command)) != 0)
   {
      if (res == -1)
         return buildResponse(response, MHD_HTTP_BAD_REQUEST,
                              "Error: Command '%s' failed, can't fork process, result was (%s)",
                              command, strerror(errno));
      else
         return buildResponse(response, MHD_HTTP_BAD_REQUEST,
                              "Error: Result of command '%s' was (%d)", command, res);
   }

   free(command);

   return buildResponse(response, MHD_HTTP_OK, "done");
}

//***************************************************************************
// Do Login
//***************************************************************************

int cEpgHttpd::doLogin(json_t* jInData, json_t* response)
{
   json_t* oLogin = json_object();
   int accepted = no;
   const char* key = getStringFromJson(jInData, "key", "");

   if (isEmpty(key))
   {
      // LOGOUT

      std::map<std::string,Session>::iterator it;

      if (currentSession && (it = sessions.find(currentSession->id)) != sessions.end())
      {
         tell(0, "User '%s' for session '%s' logged out",
              currentSession->user.c_str(), currentSession->id.c_str());

         sessions.erase(it);
         currentSession = 0;
      }
   }
   else
   {
      // LOGIN

      userDb->clear();
      userDb->setValue("PASSWD", key);

      accepted = selectUserByMd5->find() && userDb->getIntValue("ACTIVE");

      if (accepted)
      {
         Session session;

         session.start = time(0);
         session.last = time(0);
         session.rights = userDb->getIntValue("RIGHTS");
         session.user = userDb->getStrValue("USER");
         session.id = getUniqueId(); // userDb->getStrValue("PASSWD") + num2Str(session.start);

         sessions[session.id] = session;

         json_object_set_new(oLogin, "user", json_string(userDb->getStrValue("USER")));
         json_object_set_new(oLogin, "rights", json_integer(userDb->getIntValue("RIGHTS")));
         json_object_set_new(oLogin, "session", json_string(session.id.c_str()));

         tell(0, "Login of user '%s' for session '%s' confirmed",
              userDb->getStrValue("USER"), session.id.c_str());
      }
   }

   if (!accepted)
   {
      json_object_set_new(oLogin, "user", json_string(""));
      json_object_set_new(oLogin, "rights", json_integer(0));
      json_object_set_new(oLogin, "session", json_string(""));

      tell(0, "Warning: Login of '%s' denied", userDb->getStrValue("USER"));
   }

   json_object_set_new(response, "login", oLogin);

   return MHD_HTTP_OK;
}

//***************************************************************************
// Do Messages
//***************************************************************************

int cEpgHttpd::doMessages(MHD_Connection* tcp, json_t* obj)
{
   json_t* oMessages = json_array();

   // prepare ...

   messageDb->clear();

   // query messages

   for (int found = selectPendingMessages->find(); found; found = selectPendingMessages->fetch())
   {
      json_t* oData = json_object();
      cDbTableDef* def = messageDb->getTableDef();

      for (int i = 0; i < def->fieldCount(); i++)
         addFieldToJson(oData, messageDb->getValue(def->getField(i)));

      json_array_append_new(oMessages, oData);
   }

   selectPendingMessages->freeResult();

   json_object_set_new(obj, "messages", oMessages);

   return MHD_HTTP_OK;
}
