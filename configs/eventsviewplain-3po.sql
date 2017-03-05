CREATE VIEW eventsviewplain
as
select
 cnt_useid,
 cnt_eventid,
 cnt_channelid,
 sub_eventid as imageid,
 cnt_source,
 all_updsp,
 cnt_updflg as updflg,
 cnt_delflg,
 cnt_fileref,
 cnt_tableid,
 cnt_version,
 sub_title,
 sub_comptitle,
 case
  when ifnull(sub_compshorttext,'') = '' or sub_comptitle=sub_compshorttext or ( substring(sub_compshorttext,1,1)='S' and  substring(sub_compshorttext,2,1) REGEXP ('[0-9]') ) then ''
 else sub_compshorttext
 end  sub_compshorttext,
 sub_complongdescription,
 case
  when ifnull(sub_shorttext,'') = '' or sub_comptitle=sub_compshorttext or ( substring(sub_shorttext,1,1)='S' and  substring(sub_shorttext,2,1) REGEXP ('[0-9]') ) then ''
 else sub_shorttext
 end sub_shorttext,
 cnt_starttime,
 cnt_duration,
 cnt_parentalrating,
 cnt_vps,
 cnt_contents,
 sub_imagecount,
 sub_genre,
 sub_category,
 sub_country,
 sub_year,
 sub_shortdescription,
 concat(
  case 
   when cnt_source = 'epgdata' then
      case when sub_rating like '%Allgemein *****%' then concat('|','Bewertung: Sehr empfehlenswert')
         when sub_rating like '%Allgemein ****%' then concat('|','Bewertung: Empfehlenswert')
         when sub_rating like '%Allgemein ***%' then concat('|','Bewertung: Eher durchschnittlich')
         when sub_rating like '%Allgemein **%' then concat('|','Bewertung: Eher nicht empfehlenswert')
         when sub_rating like '%Allgemein *%' then concat('|','Bewertung: Eher uninteressant')
        else ''
      end
   else
      case when sub_numrating = 5 then 'Bewertung: Einer der besten Filme aller Zeiten'
         when sub_numrating = 4 then 'Bewertung: Sehr empfehlenswert'
         when sub_numrating = 3 then 'Bewertung: Empfehlenswert'
         when sub_numrating = 2 then 'Bewertung: Eher durchschnittlich'
         when sub_numrating = 1 then 'Bewertung: Eher uninteressant'
        else ''
      end
   end,
   case when ((cnt_source = 'epgdata' and sub_rating is null) or sub_numrating is Null) or sub_shortreview is null then '' else ', ' end,
   case when sub_shortreview is Null then '' else sub_shortreview end
) as sub_shortreview,
 sub_tipp,
 sub_rating,
 sub_numrating,
 sub_txtrating,
 sub_topic,
 sub_longdescription,
 case when cnt_source != sub_source and sub_category not in('Serie','Spielfilm') then cnt_longdescription end cnt_longdescription,
 sub_moderator,
 sub_guest,
 sub_actor,
 sub_producer,
 sub_other,
 sub_director,
 sub_commentator,
 sub_screenplay,
 sub_camera,
 sub_music,
 sub_audio,
 sub_flags,
 sub_episodecompname,
 sub_episodecompshortname,
 sub_episodecomppartname,
 sub_scrseriesid,
 sub_scrseriesepisode,
 sub_scrmovieid,
 epi_episodename,
 epi_shortname,
 epi_partname,
 epi_lang,
 epi_extracol1,
 epi_extracol2,
 epi_extracol3,
 epi_season,
 epi_part,
 epi_parts,
 epi_number,
 case when cnt_source <> sub_source then concat(upper(replace(cnt_source,'vdr','dvb')),'/',upper(sub_source)) else upper(replace(cnt_source,'vdr','dvb')) end merge
from
 useevents
where
 cnt_updflg in('A','L','P');
