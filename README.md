# epgd

This daemon is used to download EPG data from the internet and manage it in a MariaDB database.

| | |
|---|---|
| C++/SQL | Jörg Wendel (vdr at jwendel dot de) |
| SQL/Procedures | Christian Kaiser |
| Documentation | Ingo Prochaska |

- Homepage: http://projects.vdr-developer.org/projects/vdr-epg-daemon
- Source code: http://projects.vdr-developer.org/git/vdr-epg-daemon.git

This software is released under the GPL, version 2 (see [COPYING](COPYING)).
Additionally, compiling, linking, and/or using the OpenSSL toolkit in
conjunction with this software is allowed.

## Contents

- [Description](#description)
- [EPG Merge](#epg-merge)
- [Get the source from git](#get-the-source-from-git)
- [Requirements](#requirements)
- [MariaDB Setup](#mariadb-setup)
- [epgd Installation](#epgd-installation)
- [epgd Update](#epgd-update)
- [Starting epgd and init scripts](#starting-epgd-and-init-scripts)
- [epgd Configuration](#epgd-configuration)
- [Streaming in the browser (recordings and live TV)](#streaming-in-the-browser-recordings-and-live-tv)
- [Hints / Pitfalls](#hints--pitfalls)
- [MariaDB Hints](#mariadb-hints)
- [Considerations](#considerations)
- [HOWTOs](#howtos)

## Description

epgd is part of the double team epgd+epg2vdr to effectively retrieve, store and import EPG data to VDR.
It is designed to handle large amounts of data and pictures in a distributed environment with one
EPG server and many possible VDR clients - therefore it relies on MariaDB.

Though it is possible to use epgd alone with MariaDB it only makes sense to use it as backend to the
VDR plugin epg2vdr. That being said you need to install, setup and configure MariaDB, epgd and epg2vdr
in order to get a working environment.

## EPG Merge

The DVB and external events will be merged for the next 72 hours. DVB EPG is the main event provider which will
be enhanced by the external EPG and series data from constabel.net.
If events can be merged, just start time, duration and VPS flag of the DVB event will be used
from the external provider. The epgd can mix events with up to 20 minutes difference of the start time
depending on title and duration. If DVB and external EPG can't be merged (due to late program changes or similar),
the DVB event will be placed in your EPG to avoid wrong events.

Due to the EPG merge the x-components delivered by DVB are also available. Notice that they can only be handled for
DVB and merged events, not for events which are only provided by the external source.

The merge behavior is configured in the `channelmap.conf` by the `<merge>` value of each line. It defines the
role of the provider on this channel (it is no alias of a provider, each provider can get any role on each channel):

| merge | role |
|:-----:|------|
| 0 | no merge with the DVB events for this channel |
| 1 | leading provider (default), its events are merged with the DVB events |
| 2 | fall-back, hold in background and used if the merge 1 provider delivers poor data (no matching event, no picture, ...) |
| 3 | like 2, additionally the pictures of this provider replace the pictures of the matching event of the leading provider (same channel, start time ±60 seconds, similar duration) - e.g. to combine the texts of one provider with the better pictures of another one |

Example - texts from tvm, pictures from a second provider `xyz`:

```
tvm:1     = S19.2E-1-1019-10301   // merge 1 (default)
xyz:373:3 = S19.2E-1-1019-10301   // fall-back + picture donor
```

> **Notice:** changing the merge value of a line removes and reloads the events of this provider for the channel.

## Get the source from git

Get the source - probably done, when you are reading this locally:

```sh
git clone git://projects.vdr-developer.org/vdr-epg-daemon.git
```

Update the source:

```sh
cd /to/your/source/epgd
git pull
```

Throw away local changes and update to the latest source:

```sh
cd /to/your/source/epgd
git checkout -f master
git reset --hard
git pull
```

## Requirements

- libarchive-dev
- libcurl 7.10+
- libxslt 1.1.24+
- libxml2
- libmariadb >= 10.x
- libz
- libssl-dev
- uuid uuid-dev
- libjansson4 libjansson-dev
- libmicrohttpd libmicrohttpd-dev (epghttpd)
- libimlib2 libimlib2-dev (epghttpd)
- libjpeg libjpeg-dev (epghttpd)
- python libpython libpython-dev python-dev
- mailutils (deinstall heirloom-mailx) **!!**
- libsystemd-daemon-dev (if you like to use the systemd status interface)
  - Debian previous to 'sid' maybe libsystemd-dev?
- ffmpeg (incl. ffprobe, with libx264) (epghttpd, optional, only at runtime)
  - needed to play recordings and live TV in the browser, see [Streaming in the browser](#streaming-in-the-browser-recordings-and-live-tv)
- VAAPI driver, e.g. i965-va-driver or intel-media-va-driver (epghttpd, optional, only at runtime)
  - encoding of the browser streams by the GPU instead of the CPU

### Example for Ubuntu (21.10)

- libarchive12, libarchive-dev
- libz, libz-dev
- libssl-dev
- libcurl4-nss-dev (or libcurl3-nss-dev)
- libxslt1.1 libxslt1-dev libxml2 libxml2-dev
- libmariadb-dev mariadb-common
- libjpeg62-dev libjpeg62
- uuid uuid-dev
- libjansson4 libjansson-dev
- libmicrohttpd libmicrohttpd-dev (epghttpd)
- libimlib2 libimlib2-dev (epghttpd)
- libjpeg libjpeg-dev (epghttpd)
- python libpython libpython-dev python-dev
- mailutils (deinstall heirloom-mailx) **!!**
- libsystemd-daemon-dev (if you like to use the systemd status interface)
- ffmpeg (epghttpd, optional, recordings and live TV in the browser)
- i965-va-driver / intel-media-va-driver (epghttpd, optional, GPU encoding of the browser streams)

## MariaDB Setup

You need a running MariaDB database.
Consult the manual of your Linux flavour how to install and configure MariaDB.
Remember to put your DB files in a large enough filesystem: with many channels,
many prefetched days and many pictures you will easily need 3 or more GB of disk space.
When MariaDB is up and running you need to prepare the database and
access rights for use with epgd.

Login as root:

```sh
mysql -u root -p
```

```sql
CREATE DATABASE epg2vdr charset utf8;
CREATE USER 'epg2vdr'@'%' IDENTIFIED BY 'epg';
GRANT ALL PRIVILEGES ON epg2vdr.* TO 'epg2vdr'@'%';
GRANT ALL PRIVILEGES ON epg2vdr.* TO 'epg2vdr'@'localhost' IDENTIFIED BY 'epg';
FLUSH PRIVILEGES;
```

- Make sure the database character set (`character_set_database`) is set to latin1,
  otherwise the index size will be exceeded. You can adjust the client and session
  character sets as you like.

- Adjust the bind address in your `my.cnf` (mostly found below `/etc/mysql/`):

  ```ini
  bind-address = 127.0.0.1
  ```

  Set it to the address where the MariaDB server should listen on - or comment it out if it should listen on all interfaces.

- Switch off binary logging: comment out the line starting with `log_bin` in your `my.cnf`.

### Login as epg2vdr

```sh
mysql -u epg2vdr -pepg -Depg2vdr
# or remote
mysql -u epg2vdr -pepg -Depg2vdr -h <host>
```

If you have problems with setting up and granting access rights to your epg2vdr
read [MariaDB Hints](#mariadb-hints) near the end of this file.

Show all users:

```sql
use mysql
SELECT * FROM user;
```

### Possible create index problems

If you get this error on epgd start while epgd is creating indexes and tables:

```
Index column size too large. The maximum column size is 767 bytes
```

Make sure the server character set is set to latin1 (`character-set-server = latin1`).
Remove all other collations from your MariaDB config.
We use UTF-8 only on client side!

## epgd Installation

epgd is source distributed only. So you have to build your binary and make some
adjustments to your system. We try to help with some stuff in the `contrib` directory,
it's not a bad idea to learn something about your Linux's init system and init scripts.

- Unpack
- Modify `Make.config` (`BINDEST`, `PLGDEST` and `INIT_SYSTEM`) to meet your local system's requirements
- Call `make`
- Call `make plugins`
- Call `make install`
- Call `make install-plugins`
- Create directory `/etc/epgd`
- `cp configs/* /etc/epgd`
- Merge(\*) the config parts of the epgd plugins (`./PLUGINS/*/configs`) to `/etc/epgd`
  - merge `/etc/epgd/channelmap.conf` and `/etc/epgd/epgd.conf`
  - copy `./PLUGINS/*/configs/*.xsl` to `/etc/epgd`
- Modify the config (`/etc/epgd/channelmap.conf` and `/etc/epgd/epgd.conf`) to your needs
- Create the database (see [MariaDB Setup](#mariadb-setup))
- Install epglv - the lib is installed by `make install`, the functions are installed
  as described in [epglv/README](epglv/README)
- Start epgd (see [Starting epgd](#starting-epgd-and-init-scripts))

(\*) If you don't know how to merge you can start off with

```sh
cat ./PLUGINS/*/configs/channelmap.conf >> /etc/epgd/channelmap.conf
cat ./PLUGINS/*/configs/epgd.conf >> /etc/epgd/epgd.conf
```

This is only true if you use all plugins. If you use only one of them replace `*` with the plugin you use.

Look carefully through your generated files!

## epgd Update

If a table alter is required, the epgd alters and creates the tables automatically after start (if the new, modified
`epg.dat` is installed in the config directory). Therefore always start the epgd before starting the epghttpd and the
VDR after an update. Please be patient, the alter can take some time depending on the size of the table!

## Starting epgd and init scripts

There are many ways to start epgd. For a first try or debugging sessions you may want to start it simply by typing
at the root command prompt (paths have to be adjusted according to your changes to `BINDEST` and `PLGDEST` in `Make.config`):

```sh
export LANG="de_DE.UTF-8"
ulimit -c unlimited   # so you can torture the developers with back traces
/usr/local/bin/epgd -n -p /usr/local/lib/epgd/plugins
```

epgd is configured in `/etc/epgd/epgd.conf`. But you can overwrite the following options on the command line:

| Option | Description |
|---|---|
| `-n` | don't daemonize |
| `-t` | log to stdout |
| `-c <config-dir>` | use config in `<config-dir>` |
| `-p <plugin-dir>` | load plugins from `<plugin-dir>` |
| `-l <log-level>` | set log level |

For production use you should start epgd after network and MariaDB services via your init system. Some start scripts
have been put to `./contrib`, hopefully serving your needs (or at least giving you an idea of how to proceed).

## epgd Configuration

| Parameter | Default | Description |
|---|---|---|
| `DbHost` | localhost | IP/name of the MariaDB server host |
| `DbPort` | 3306 | port of the MariaDB server |
| `DbName` | epg2vdr | name of the database |
| `DbUser` | epg2vdr | database user |
| `DbPass` | epg | database password |
| `DaysInAdvance` | 8 | download (insert) EPG information for the next # days |
| `DaysToUpdate` | 2 | update # already inserted days |
| `UpdateTime` | 2 | perform automatic update every # hours |
| `XmlStoreToFs` | 0 | store XML files to the filesystem, for debugging |
| `GetEpgImages` | 0 | download images with the EPG information |
| `NetDevice` | first device | network device of epgd (used e.g. for WOL) |
| `HttpDevice` | all devices | epghttpd listens on this device |
| `MaxImagesPerEvent` | | how many pictures per event should be downloaded |
| `EpgImageSize` | | 0 = 174x130, 1 = 329x245, 2 = 525x400 |
| `CachePath` | /var/cache/epgd | path to the cache of the XML files if `XmlStoreToFs` or `SeriesStoreToFs` is enabled |
| `SeriesEnabled` | 1 | get series from eplists.constabel.net |
| `SeriesPort` | 2006 | |
| `SeriesStoreToFs` | 0 | |
| `SeriesUrl` | eplists.constabel.net | |
| `ScrapEpg` | 1 | scrap EPG content 0/1 |
| `ScrapRecordings` | 1 | scrap recordings 0/1 |
| `EpgView` | eventsview.sql | use this if you want to design your own view for detailed EPG views and the live plugin - `eventsview.sql` can be overwritten on updates, so use a different name |
| `EpgViewWeb` | eventsviewplain.sql | use this if you want to design your own view for detailed EPG views in the WebIF - `eventsviewplain.sql` can be overwritten on updates, so use a different name |
| `CheckInitial` | 1 | enable or disable the initial update of your external EPG provider after starting epgd |
| `UpdateThreshold` | 500 | call merging of DVB and external EPG after `<x>` DVB changes and update clients |
| `UseProxy` | 0 | enable HTTP proxy |
| `HttpProxy` | | name of the proxy |
| `UserName` | | username of your proxy |
| `Password` | | password of your proxy |

If you are using some kind of pattern driven logfile parsing software like logchecker you may want to use
`./contrib/epgd.ignore`.

## Streaming in the browser (recordings and live TV)

The web interface (epghttpd) plays recordings and live TV in the browser, also on iPhone / iPad.
ffmpeg on the epgd host converts the video to HLS (segments below `/var/tmp/epghttpd-hls`),
the browsers play it with hls.js or natively (Safari / iOS).

- **Recordings:** button *Im Browser abspielen* in the event details of a recording.
  The video directory of the VDR must be accessible on the epgd host (local or NFS).

- **Live TV:** button *Live* at running events (event details, tiles of the program page, info panel
  of the timeline), 30 minutes timeshift. Needs the plugin streamdev-server on a VDR with its
  HTTP server enabled (default port 3000) and the epgd host allowed in `streamdevhosts.conf`.
  The VTP protocol (port 2004) of the streamdev clients can't be used by ffmpeg.
  Enable the HTTP server in the plugin setup (OSD, effective at once) or in the `setup.conf` while
  VDR is stopped (VDR writes the `setup.conf` back on exit):

  ```
  streamdev-server.StartHTTPServer = 1
  ```

  Each live stream needs a tuner of the VDR like a streamdev client. A stream ends at once when the
  player is closed and 30 seconds after the last request of the browser (connection lost).

- Both need the user right *Aufnahmen* (recordings).

**Video:** progressive H.264 with IDR frames (e.g. 720p) is copied; 1080i (deinterlaced), MPEG-2 (SD) and
H.264 without IDR frames (e.g. Das Erste HD, phoenix HD - the browsers can't decode their segments)
are encoded, audio always to AAC. UHD (H.265) isn't supported.
Encoding by the GPU via VAAPI needs a few percent of a CPU core for a 1080i stream, libx264 one or
two cores.

### Parameters (web interface, *Einstellungen → System*)

- **`liveStreamUrl`** (default empty = live TV off)\
  URL of the HTTP server of streamdev-server, the channel id is appended (or replaces the
  placeholder `{channelid}`), e.g. `http://vdr:3000/TS/`\
  Preset: as long as the parameter was never stored, epghttpd checks the attached VDRs at start
  (and then every 5 minutes) for port 3000 and stores the URL of the first one answering.
  A value stored by the user (also an empty one) is never changed.

- **`streamEncoder`** (default `auto`)
  - `auto` - VAAPI if a short test encode at the first use works, else libx264
  - `vaapi` - GPU (first render node `/dev/dri/renderD*`)
  - `x264` - CPU

  The web interface offers only the encoders working on the epgd host.

- **`streamX264Preset`** (default `veryfast`)\
  `ultrafast`, `superfast`, `veryfast`, `faster`, `fast` or `medium` (libx264 only),
  a faster preset needs less CPU at a higher bitrate

- **`streamMaxHeight`** (default 0 = keep)\
  scale the encoded video down to this height (1080, 720, 576, 540, 480 or 360),
  a channel higher than this is encoded even if it could be copied

## Hints / Pitfalls

- The recordings are hosted on a central storage (NAS, ...) and epg2vdr toggles some recordings in the table
  round robin without any changes on them. This can occur if:
  - the VDRs use different options for the filesystem (`--vfat` and/or `--dirnames`)
  - the VDRs use different character encoding and language settings

## MariaDB Hints

- If you cannot figure out why you get *Access denied*, remove all entries from the user table
  that have Host values with wildcards contained (entries that match `%` or `_` characters).
  A very common error is to insert a new entry with `Host='%'` and `User='some_user'`,
  thinking that this allows you to specify localhost to connect from the same machine.
  The reason that this does not work is that the default privileges include an
  entry with `Host='localhost'` and `User=''`. Because that entry has a Host value `localhost`
  that is more specific than `%`, it is used in preference to the new entry when connecting
  from localhost! The correct procedure is to insert a second entry with `Host='localhost'`
  and `User='some_user'`, or to delete the entry with `Host='localhost'` and `User=''`.
  After deleting the entry, remember to issue a `FLUSH PRIVILEGES` statement to reload the grant tables.

- **Attention** if you have binary logging (`log_bin`) enabled!
  Disable it OR add `log-bin-trust-function-creators` to your configuration and restart the database.

### Slow database

On problems with slow database performance try these settings (adjust to the available resources):

```ini
innodb_buffer_pool_size = 10G
key_buffer_size         = 10M
max_allowed_packet      = 1G
thread_stack            = 192K
thread_cache_size       = 8
query_cache_limit       = 1M
query_cache_size        = 8M
```

## Considerations

By design epgd can handle multiple clients. If you are looking for a solution for your VDR network plan your
implementation carefully. Which clients should be able to connect? Which EPG solution is in use on each client?
Has any of the clients patches or plugins running manipulating the EPG? And now the most important hint:
read the epg2vdr README before you continue.

epgd can generate large amounts of data, db data as well as logging data - so don't be surprised.
Manipulating data (read, write, move around) does not only need appropriate disk space,
but also appropriate I/O performance.

If you run into problems and want to start from a clean base, stop epgd and drop all data
(take a look at the scripts in `./scripts`) and restart epgd.

## HOWTOs

Select start times from table timers:

```sql
SELECT from_unixtime(day), starttime,
       from_unixtime(_starttime) AS 'event starttime',
       from_unixtime(day + ((starttime % 100) * 60) + ((starttime div 100) * 60 * 60)) AS 'timer starttime'
  FROM timers;
```
