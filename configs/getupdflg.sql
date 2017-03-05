CREATE FUNCTION getupdflg ( master_id INT(11) )
RETURNS CHAR
NOT DETERMINISTIC
BEGIN
DECLARE upd_flg CHAR;
  SET upd_flg = (
   select case
    when ev.source != 'vdr' and ev.starttime <= cm.mergesp and ev.masterid != ev.useid then 'C'
    when ev.source != 'vdr' and ev.starttime <= cm.mergesp and jo.masterid is not Null then 'T'
    when ev.delflg = 'Y' then 'D'
    when ev.source != 'vdr' and ev.starttime <= cm.mergesp and jo.masterid is Null then 'R'
    when ev.source != 'vdr' and ev.starttime > cm.mergesp then 'A'
    when ev.source = 'vdr' and cm.mergesp is Null then 'P'
    when ev.source = 'vdr' and ev.starttime > cm.mergesp then 'I'
    when ev.source = 'vdr' and ev.starttime <= cm.mergesp and ev.masterid = ev.useid then 'A'
    when ev.source = 'vdr' and ev.starttime <= cm.mergesp and ev.masterid != ev.useid then 'L'
  end
from
  events ev
left join
  events jo
on
 ev.masterid = jo.useid and jo.useid != 0 and jo.updflg = 'L'
left join
 (select distinct mergesp,channelid from channelmap where channelmap.source != 'vdr') cm
on
 ev.channelid = cm.channelid
where
 ev.masterid = master_id
 limit 1
);
RETURN upd_flg;
END
