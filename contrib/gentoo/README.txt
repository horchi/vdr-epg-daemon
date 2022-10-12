Installation des EPG Deamon und des epg2vdr Plugins auf Gen2VDR (ab Version 4)
by 3PO

ebuild herunterladen:


cd /tmp
git clone git://projects.vdr-developer.org/vdr-epg-daemon.git 

Dann der "/etc/portage/make.conf" folgenden Eintrag hinzuf?gen:

EPGD_LOCAL_PATCHES_DIR="/usr/local/portage/patches/epgd" 



Das ebuild entpacken und EPGd installieren:

cd /tmp/vdr-epg-daemon/contrib/gentoo
tar -xvf epgd-ebuild.tgz -C /
echo "=media-tv/epgd-9999 **" >> /etc/portage/package.keywords/media
emerge -av epgd 



Sollen weitere Plugins verwendet werden, dann geht das z.B. so:

mkdir -p /usr/local/portage/patches/epgd
cd /usr/local/portage/patches/epgd
wget http://dreipo.cc/tvm/tvm.diff
emerge -av epgd 




Die MySQL Datenbank wird wie folgt erstellt:

MySQL starten und dem Autostart hinzuf?gen:

stt mysql
rc-update add mysql default 



Falls noch nicht geschehen, das root Passwort f?r MySQL vergeben:

mysqladmin -u root -p password "WUNSCHPASSWORT"  



Man kann es dann, der Einfachheit halber, im root Verzeichnis speichern:

mkdir -p /root/.ssh
echo 'export PASSWORD="WUNSCHPASSWORT"' > /root/.ssh/mysqlpasswd 



Datenbank erstellen lassen: 

epgd-tool -new 



EPGd starten und dem Autostart hinzuf?gen:

rc-update add epgd default 



Damit ist der Serverteil erledigt, jetzt muss noch das epg2vdr Plugin installiert werden:

cd /usr/local/src/VDR/PLUGINS/src
git clone git://projects.vdr-developer.org/vdr-plugin-epg2vdr.git epg2vdr-git
ln -svfn epg2vdr-git epg2vdr
cd epg2vdr
make all
make install
/_config/bin/instvdr.sh 




Jetzt noch mit:

g2v-setup 

epg2vdr aktivieren.


FERTIG! ;)



Updates:

EPGd:

emerge -av epgd
stp epgd && stt epgd 




epg2vdr Plugin:

cd /usr/local/src/VDR/PLUGINS/src/epg2vdr
git pull
make clean all install
/_config/bin/instvdr.sh 
