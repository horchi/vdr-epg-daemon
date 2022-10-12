CREATE FUNCTION getlvrmin ( vdr_starttime int(10), ext_starttime int(10), vdr_duration int(5), ext_duration int(5), lv1 int(3), lv2 int(3), lv3 int(3), lv4 int(3) )
RETURNS int
NOT DETERMINISTIC
BEGIN
DECLARE delta_st int;
DECLARE delta_du int;
DECLARE lv_time int default 0;
DECLARE lv_min int;
DECLARE lv_dur int;
DECLARE lv_sum int;

IF vdr_duration = ext_duration then set delta_du = 100;
ELSEIF vdr_duration > ext_duration then set delta_du = round(vdr_duration/ext_duration*100,0);
ELSE set delta_du = round(ext_duration/vdr_duration*100,0);
END IF;

IF delta_du > 184 then set lv_dur = 50;
ELSEIF delta_du > 168 then set lv_dur = 40;
ELSEIF delta_du > 152 then set lv_dur = 30;
ELSEIF delta_du > 136 then set lv_dur = 20;
ELSEIF delta_du > 120 then set lv_dur = 10;
ELSE set lv_dur = 0;
END IF;

IF vdr_starttime = ext_starttime then set delta_st = 100;
ELSEIF vdr_starttime > ext_starttime then set delta_st = vdr_starttime-ext_starttime;
ELSE set delta_st = ext_starttime-vdr_starttime;
END IF;

IF delta_st <= 600 then
 IF delta_st > 540 then set lv_time = 50;
 ELSEIF delta_st > 480 then set lv_time = 40;
 ELSEIF delta_st > 420 then set lv_time = 30;
 ELSEIF delta_st > 360 then set lv_time = 20;
 ELSEIF delta_st > 300 then set lv_time = 10;
 ELSE set lv_time = 0;
 END IF;

 set lv_min = LEAST(lv1,lv2,lv3,lv4);

 set lv_sum = lv_time + lv_dur + lv_min;

ELSEIF lv_dur + lv1 + lv4 <= 60 then set lv_sum = 60;
ELSEIF lv1 <= 30 and vdr_starttime = ext_starttime then set lv_sum = 60;
ELSEIF lv1 <= 30 and vdr_duration/abs(vdr_starttime-ext_starttime) >= 2.5 then set lv_sum = 60;
ELSE set lv_sum = 99;
END IF;

RETURN lv_sum;

END
