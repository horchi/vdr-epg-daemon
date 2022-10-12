#!/bin/bash 

mysql -u epg2vdr -pepg -Depg2vdr -e 'ALTER TABLE events ADD imagecount int(4) DEFAULT Null after extepnum;'
mysql -u epg2vdr -pepg -Depg2vdr -e 'ALTER TABLE events CHANGE shorttext shorttext varchar(300) DEFAULT NULL;'
mysql -u epg2vdr -pepg -Depg2vdr -e 'ALTER TABLE events CHANGE compshorttext compshorttext varchar(300) DEFAULT NULL;'
mysql -u epg2vdr -pepg -Depg2vdr -e 'ALTER TABLE events CHANGE topic topic varchar(500) DEFAULT NULL;'
mysql -u epg2vdr -pepg -Depg2vdr -e 'ALTER TABLE events CHANGE guest guest varchar(500) DEFAULT NULL;'
mysql -u epg2vdr -pepg -Depg2vdr -e "update vdrs set dbapi = 4 where uuid = 'epgd';"

