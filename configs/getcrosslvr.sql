CREATE FUNCTION getcrosslvr ( comp1 varchar(300), comp2 varchar(300) )
RETURNS int
NOT DETERMINISTIC
BEGIN
DECLARE ratio DECIMAL(7,2);
DECLARE shorter varchar(300);
DECLARE longer varchar(300);
DECLARE complenght int;
DECLARE crosslv int;
DECLARE crosslvt int;
IF char_length(comp1) = 0 then
     set ratio = 999;
     set shorter = comp1; set longer = comp2; set complenght = char_length(comp2);
ELSEIF char_length(comp2) = 0 then
     set ratio = 999;
     set shorter = comp2; set longer = comp1; set complenght = char_length(comp1);
ELSEIF char_length(comp1) >= char_length(comp2) then
     set ratio = round(char_length(comp1) / char_length(comp2),2);
     set shorter = comp2; set longer = comp1; set complenght = char_length(comp1);
else set ratio = round(char_length(comp2) / char_length(comp1),2);
     set shorter = comp1; set longer = comp2; set complenght = char_length(comp2);
END IF;
IF comp1 is null or comp2 is null then set crosslv = 99;
ELSEIF comp1 = comp2 then set crosslv = 0;
ELSEIF comp1 is Null or comp2 is Null or char_length(comp1) = 0 or char_length(comp2) = 0 then set crosslv = 99;
ELSEIF complenght >= 10 and ratio >= 3.2 then set crosslv = 99;
ELSEIF ratio < 1.5 then set crosslv = epglvr(shorter,longer);
ELSE set crosslvt = epglvr(shorter,substr(longer,1,complenght/2));
 IF crosslvt < 60 then set crosslv = crosslvt;
 ELSE set crosslv = epglvr(substr(longer from complenght/2+1),shorter);
 END IF;
END IF;
RETURN crosslv;
END
