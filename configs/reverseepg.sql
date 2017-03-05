CREATE PROCEDURE reverseepg ()
BEGIN
/*
* channelmap zurücksetzen
*/
update channelmap set mergesp = 0;
/*
* events zurücksetzen Teil 1
*/
update
 events ev,
 (select distinct channelid from channelmap where source <> 'vdr' ) cm
set
 useid = masterid,
 updflg =
   case
    when ev.delflg = 'Y' then 'D'
    else 'I'
   end
where
 ev.source = 'vdr' and
 ev.channelid = cm.channelid;
/*
* events zurücksetzen Teil 2
*/
update
 events ev,
 (select distinct mergesp,merge,channelid,source from channelmap) cm
set
 useid = masterid,
 updflg =
   case
    when ev.delflg = 'Y' then 'D'
    when ev.source = 'vdr' then 'P'
    when ev.source != 'vdr' and merge > 1 then 'S'
    else 'A'
   end
where
 ev.source = cm.source and
 ev.channelid = cm.channelid;
END

