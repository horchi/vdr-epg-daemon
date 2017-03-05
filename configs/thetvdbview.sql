CREATE VIEW thetvdbview as
select
 ev.eventid,
 case when ep.compname = 'TATORT' then concat('Tatort',replace(substring(ep.extracol1,11),' und ',' & ')) else ev.title end title,
 ev.scrsp,
 case when ep.compname = 'TATORT' then Null else ep.season end season,
 case when ep.compname = 'TATORT' then Null else ep.part end part,
 case when ep.compname = 'TATORT' then Null else ep.number end number,
 ep.partname shorttext
from
 events ev, episodes ep
where
 ev.episodecompname = ep.compname and
 ev.episodecomppartname = ep.comppartname and
 ev.episodelang = ep.lang and
 ev.scrsp is null and
 updflg in('A','T','C','P')
union
select
 eventid,
 title,
 scrsp,
 case when substring(shorttext,1,1)='S' and substring(shorttext,2,1) REGEXP ('[0-9]') then TRIM(LEADING '0' from replace(SUBSTRING_INDEX(shorttext, 'E', 1),'S','')) end  season,
 case when substring(shorttext,1,1)='S' and substring(shorttext,2,1) REGEXP ('[0-9]') then TRIM(LEADING '0' from SUBSTRING_INDEX(shorttext, 'E', -1)) end  part,
 null number,
 case when substring(shorttext,1,1)='S' and substring(shorttext,2,1) REGEXP ('[0-9]') then Null else shorttext end shorttext
from
 events
where
 episodecompname is Null
 and scrsp is null
 and updflg in('A','T','C','P')
 and category = 'Serie';
