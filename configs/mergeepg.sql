CREATE PROCEDURE mergeepg ()
BEGIN
/*
* declare variables
*/
DECLARE startrun INT;
DECLARE lastrun INT;
/*
* configure merge
*/
set @epi ='a';
set @img ='b';
set @sht ='';
/*
* fix useid = 0
*/
update events set useid = masterid where useid = 0;
/*
* cleanup deleted Links
*/
update
 events e
set
 e.useid = e.masterid,
 e.updsp = unix_timestamp()
where
 e.source = 'vdr' and
 e.updflg in ('D','R') and
 e.useid != e.masterid and
 e.starttime + e.duration >= unix_timestamp();
/*
* cleanup broken Links
*/
update
 events t
 inner join
(
  select
   v.masterid,
   e.starttime,
   e.comptitle,
   e.compshorttext,
   e.updflg
  from
   events v
   left join
   events e
   on e.masterid = v.useid and v.masterid != e.masterid and e.updflg in ('T','C') and ifnull(e.delflg,'N') = 'N'
  where
   v.updflg in('L') and
   v.starttime + v.duration >= unix_timestamp()
) s
on t.masterid=s.masterid
set
 t.useid = t.masterid,
 t.updflg = case when t.delflg = 'Y' then 'D' else 'A' end,
 t.updsp = unix_timestamp()
where
 s.updflg is Null or
 abs(s.starttime - t.starttime) > 21600  or
 (abs(s.starttime - t.starttime) > 3600 and
  getlvrmin(0,0,0,0,
   getcrosslvr(s.comptitle,t.comptitle),
   getcrosslvr(s.comptitle,t.compshorttext),
   getcrosslvr(s.compshorttext,t.comptitle),
   getcrosslvr(s.compshorttext,t.compshorttext)) >= 60);
/*
* cleanup broken Targets
*/
update
 events t
 inner join
(
  select
   e.masterid,
   v.updflg
  from
   events e
   left join
   events v
   on e.masterid = v.useid and v.masterid != e.masterid and v.updflg = 'L'
  where
   e.updflg in('C','T') and
   e.starttime + e.duration >= unix_timestamp()
) s
on t.masterid=s.masterid
set
 t.useid = t.masterid,
 t.updflg = case when t.delflg = 'Y' then 'D' else 'R' end,
 t.updsp = unix_timestamp()
where
 s.updflg is Null;
/*
* reset tables
*/
truncate snapshot;
truncate analyse;
/*
* prepare snapshot
*/
insert into snapshot
select
 distinct ev.channelid, ev.source, masterid, ev.eventid, useid, starttime, duration, title, comptitle, shorttext, compshorttext, ev.updsp,
  case when episodecompname is Null then Null else 'X' end episodecompname,
  case when ev.source = 'vdr' then Null else cm.merge end merge,
  case when ev.imagecount >0 then 'X' else Null end images
from
 events ev
 inner join channelmap cm on ( ev.channelid = cm.channelid )
where
 ( ev.source = cm.source or ev.source = 'vdr' )
 AND
 ev.updflg in ('I','A','R','S')
 AND
 ev.starttime between unix_timestamp() - ev.duration and unix_timestamp() + 259200
 AND
 cm.merge in(1,2);
/*
* do the magic
*/
set @pk1 ='';
set @rn1 =10000;
set @lvmin ='';
insert ignore into analyse
SELECT  channelid, vdr_masterid, vdr_eventid, vdr_starttime, vdr_duration, vdr_title, vdr_shorttext, ext_masterid, ext_eventid, ext_starttime, ext_duration, ext_title, ext_shorttext, ext_episodecompname, ext_merge, ext_images, lvmin,
          epi+img+sht + ranklv as rank
FROM
(
  SELECT  channelid, vdr_masterid, vdr_eventid, vdr_starttime, vdr_duration, vdr_title, vdr_shorttext, ext_masterid, ext_eventid, ext_starttime, ext_duration, ext_title, ext_shorttext, ext_episodecompname, ext_merge, ext_images, lvmin,
            case when ext_episodecompname is not Null then 0 else (case @epi when 'a' then 1000 when 'b' then 100 when 'c' then 10 else 0 end) end epi,
            case when ext_images is not Null then 0 else (case @img when 'a' then 1000 when 'b' then 100 when 'c' then 10 else 0 end) end img,
            case when ext_shorttext is not Null then 0 else (case @sht when 'a' then 1000 when 'b' then 100 when 'c' then 10 else 0 end) end sht,
          @rn1 := if(@pk1=concat(channelid,vdr_eventid,ext_source), if(@lv=lvmin, @rn1, @rn1+10000),10000+ext_merge) as ranklv,
          @pk1 := concat(channelid,vdr_eventid,ext_source),
          @lv := lvmin
  FROM
  (
    select
     vdr.channelid,
     vdr.masterid vdr_masterid, vdr.eventid vdr_eventid, vdr.starttime vdr_starttime, vdr.duration vdr_duration, vdr.title vdr_title, vdr.shorttext vdr_shorttext,
     ext.masterid ext_masterid, ext.eventid ext_eventid, ext.starttime ext_starttime, ext.duration ext_duration, ext.title ext_title, ext.shorttext ext_shorttext,
     ext.source ext_source,ext.episode ext_episodecompname, ext.merge ext_merge, ext.images ext_images,
     getlvrmin(vdr.starttime,ext.starttime,vdr.duration,ext.duration,
       getcrosslvr(vdr.comptitle,ext.comptitle),
       getcrosslvr(vdr.comptitle,ext.compshorttext),
       getcrosslvr(vdr.compshorttext,ext.comptitle),
       getcrosslvr(vdr.compshorttext,ext.compshorttext)
     ) lvmin
    from
     snapshot vdr
     inner join
     snapshot ext
     on vdr.channelid = ext.channelid and
     vdr.starttime - ext.starttime between -1200 and +1200 and
     (vdr.duration+1) / (ext.duration+1) * 100 between 50 and 200
    where
     vdr.source = 'vdr'
     AND
     vdr.source <> ext.source
    ORDER BY channelid,vdr_eventid,ext_merge desc,lvmin
  ) A
  where lvmin <= 60
) B
order by channelid,vdr_eventid,rank;
/*
* update mergesp
*/
update
 channelmap cm,
 (select channelid,max(vdr_starttime) merge_sp from analyse group by channelid) an
set
 cm.mergesp = an.merge_sp
where
 an.channelid = cm.channelid and
 an.merge_sp > cm.mergesp;
/*
* update useid on vdr events
*/
update
 events ev,
 analyse an
set
 ev.useid = an.ext_masterid
where
 ev.masterid = vdr_masterid and
 ev.channelid = an.channelid;
/*
* update useid on ext events
*/
update
 events ext,
 events vdr
set
 ext.useid = case when ext.updflg in('I','R') then vdr.masterid else ext.useid end,
 ext.updflg = case when ext.updflg in('I','R') then 'C' else 'T' end,
 ext.updsp = case when ext.updflg in('I','R') then unix_timestamp() else ext.updsp end
where
 ext.masterid = vdr.useid and
 ext.channelid = vdr.channelid and
 ext.updflg in('I','A','R','S') and
 ext.source <> vdr.source and
 vdr.source = 'vdr';
/*
* update all other relevant updflg and updsp
*/
update
 events ev,
 (select distinct channelid,mergesp from channelmap where source != 'vdr') cm
set
 ev.updflg = case when ev.source = 'vdr' and ev.masterid != ev.useid then 'L'
                  when ev.source = 'vdr' and ev.masterid = ev.useid then 'A'
                  when ev.source != 'vdr' and ev.updflg = 'S' then 'I'
                  when ev.source != 'vdr' then 'R'
             end,
 ev.updsp = case when source = 'vdr' and ev.masterid = ev.useid and ev.updflg = 'A' then ev.updsp
                 else unix_timestamp()
            end
where
 ev.channelid = cm.channelid and
 ev.starttime < cm.mergesp + ev.duration/10 and
 ( ev.source = 'vdr' and ev.updflg in ('I','A') or
  ev.source != 'vdr' and ev.updflg in ('A','S') );
/*
* reinitialize prior removed dvb events
*/
update
 events ev,
 (select distinct channelid,mergesp from channelmap where source != 'vdr') cm
set
 ev.updflg = 'A',
 ev.useid = ev.masterid,
 ev.updsp = unix_timestamp()
where
 ev.channelid = cm.channelid and
 ev.starttime < cm.mergesp + ev.duration/10 and
 ev.source = 'vdr' and
 ev.updflg in ('R');
/*
* get startrun / lastrun
*/
SET startrun = (select unix_timestamp());
SET lastrun = (select value from parameters where owner = 'epgd' and name = 'mergeStart');
/*
* truncate useevents if needed
*/
IF lastrun = 0 then truncate table useevents;
END IF;
/*
* update useevents
*/
insert into
 useevents( cnt_source, cnt_channelid, cnt_eventid, cnt_masterid, cnt_useid, sub_source, sub_eventid, all_updsp, cnt_updflg, cnt_delflg, cnt_fileref, cnt_tableid, cnt_version, sub_title, sub_shorttext, sub_comptitle, sub_compshorttext, sub_genre, sub_country, sub_year, cnt_starttime, cnt_duration, cnt_parentalrating, cnt_vps, cnt_contents, sub_category, sub_shortdescription, sub_shortreview, sub_tipp, sub_rating, sub_numrating, sub_txtrating, sub_topic, sub_longdescription, sub_complongdescription, cnt_longdescription, sub_moderator, sub_guest, sub_actor, sub_producer, sub_other, sub_director, sub_commentator, sub_screenplay, sub_camera, sub_music, sub_audio, sub_flags, sub_imagecount, sub_scrseriesid, sub_scrseriesepisode, sub_scrmovieid, sub_scrsp, sub_episodecompname, sub_episodecompshortname, sub_episodecomppartname, epi_episodename, epi_shortname, epi_partname, epi_lang, epi_extracol1, epi_extracol2, epi_extracol3, epi_season, epi_part, epi_parts, epi_number )
select
 cnt.source,
 cnt.channelid,
 cnt.eventid,
 cnt.masterid,
 cnt.useid,
 sub.source,
 sub.eventid,
 GREATEST(cnt.updsp,sub.updsp,IFNULL(epi.updsp,0)),
 cnt.updflg,
 cnt.delflg,
 cnt.fileref,
 cnt.tableid,
 cnt.version,
 sub.title,
 sub.shorttext,
 sub.comptitle,
 sub.compshorttext,
 sub.genre,
 sub.country,
 sub.year,
 cnt.starttime,
 cnt.duration,
 cnt.parentalrating,
 cnt.vps,
 cnt.contents,
 sub.category,
 sub.shortdescription,
 sub.shortreview,
 sub.tipp,
 sub.rating,
 sub.numrating,
 sub.txtrating,
 sub.topic,
 sub.longdescription,
 sub.complongdescription,
 cnt.longdescription,
 sub.moderator,
 sub.guest,
 sub.actor,
 sub.producer,
 sub.other,
 sub.director,
 sub.commentator,
 sub.screenplay,
 sub.camera,
 sub.music,
 sub.audio,
 sub.flags,
 sub.imagecount,
 sub.scrseriesid,
 sub.scrseriesepisode,
 sub.scrmovieid,
 sub.scrsp,
 sub.episodecompname,
 sub.episodecompshortname,
 sub.episodecomppartname,
 epi.episodename,
 epi.shortname,
 epi.partname,
 epi.lang,
 epi.extracol1,
 epi.extracol2,
 epi.extracol3,
 epi.season,
 epi.part,
 epi.parts,
 epi.number
from
 events cnt
 inner join events sub on (case when cnt.useid = 0 then cnt.masterid else cnt.useid end = sub.masterid)
 left outer join episodes epi on (sub.episodecompname = epi.compname and sub.episodecomppartname = epi.comppartname and sub.episodelang = epi.lang)
where
 cnt.updflg in('A','L','P','C','R','D','X') and
 GREATEST(cnt.updsp,sub.updsp,IFNULL(epi.updsp,0)) >= lastrun - 5
ON DUPLICATE KEY UPDATE
 cnt_masterid = cnt.masterid,
 cnt_useid = cnt.useid,
 sub_source = sub.source,
 sub_eventid = sub.eventid,
 all_updsp = GREATEST(cnt.updsp,sub.updsp,IFNULL(epi.updsp,0)),
 cnt_updflg = cnt.updflg,
 cnt_delflg = cnt.delflg,
 cnt_fileref = cnt.fileref,
 cnt_tableid = cnt.tableid,
 cnt_version = cnt.version,
 sub_title = sub.title,
 sub_shorttext = sub.shorttext,
 sub_comptitle = sub.comptitle,
 sub_compshorttext = sub.compshorttext,
 sub_genre = sub.genre,
 sub_country = sub.country,
 sub_year = sub.year,
 cnt_starttime = cnt.starttime,
 cnt_duration = cnt.duration,
 cnt_parentalrating = cnt.parentalrating,
 cnt_vps = cnt.vps,
 cnt_contents = cnt.contents,
 sub_category = sub.category,
 sub_shortdescription = sub.shortdescription,
 sub_shortreview = sub.shortreview,
 sub_tipp = sub.tipp,
 sub_rating = sub.rating,
 sub_numrating = sub.numrating,
 sub_txtrating = sub.txtrating,
 sub_topic = sub.topic,
 sub_longdescription = sub.longdescription,
 sub_complongdescription = sub.complongdescription,
 cnt_longdescription = cnt.longdescription,
 sub_moderator = sub.moderator,
 sub_guest = sub.guest,
 sub_actor = sub.actor,
 sub_producer = sub.producer,
 sub_other = sub.other,
 sub_director = sub.director,
 sub_commentator = sub.commentator,
 sub_screenplay = sub.screenplay,
 sub_camera = sub.camera,
 sub_music = sub.music,
 sub_audio = sub.audio,
 sub_flags = sub.flags,
 sub_imagecount = sub.imagecount,
 sub_scrseriesid = sub.scrseriesid,
 sub_scrseriesepisode = sub.scrseriesepisode,
 sub_scrmovieid = sub.scrmovieid,
 sub_scrsp = sub.scrsp,
 sub_episodecompname = sub.episodecompname,
 sub_episodecompshortname = sub.episodecompshortname,
 sub_episodecomppartname = sub.episodecomppartname,
 epi_episodename = epi.episodename,
 epi_shortname = epi.shortname,
 epi_partname = epi.partname,
 epi_lang = epi.lang,
 epi_extracol1 = epi.extracol1,
 epi_extracol2 = epi.extracol2,
 epi_extracol3 = epi.extracol3,
 epi_season = epi.season,
 epi_part = epi.part,
 epi_parts = epi.parts,
 epi_number = epi.number;
/*
* remove hidden events
*/
delete from useevents where (cnt_source,cnt_channelid,cnt_eventid) in( select source,channelid,eventid from events where updflg in ('T','S','I') );
/*
* update lastrun
*/
update parameters set updsp = unix_timestamp(), value = startrun where owner = 'epgd' and name = 'mergeStart';
END
