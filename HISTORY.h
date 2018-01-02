/*
 * -----------------------------------
 * EPG Daemon - epgd Revision History
 * -----------------------------------
 */

#define _VERSION     "1.1.126"
#define VERSION_DATE "02.01.2017"
#define DB_API       5

#ifdef GIT_REV
#  define VERSION _VERSION "-GIT" GIT_REV
#else
#  define VERSION _VERSION
#endif

/*
 * ------------------------------------
 *

2017-01-02: version 1.1.126 (ckone)
   - change: improved handling of reinstated events in merge procedure

2017-12-22: version 1.1.125 (horchi)
   - change: new field in 'recordinglist' to store the original description

2017-12-21: version 1.1.124 (horchi)
   - change: gcc 7 porting

2017-12-02: version 1.1.123 (horchi)
   - added: Trigger osd2web plugins of running VDRs on new recording

2017-10-09: version 1.1.122 (horchi)
   - change: Fixed curl SSL mode

2017-08-01: version 1.1.121 (rechner)
   - fixed: error, if no vdr available

2017-07-25: version 1.1.120 (rechner)
   - added: show constable in eventdetail, if episodename is available
   - added: show constable extracol 1-3 in eventdetail
   - fixed: if recording view was reloaded the functionallity in bar was lost

2017-06-28: version 1.1.119 (rechner)
   - added: Link to osd2web, if available

2017-06-25: version 1.1.119 (rechner)
   - fixed: check, if channel list is loaded in magazine View

2017-06-24: version 1.1.118 (rechner)
   - fixed: Fixed error while click on channel in pageNow View

2017-06-09: version 1.1.117 (horchi)
   - change: Fixed install of eventviews*

2017-06-08: version 1.1.116 (horchi)
   - change: Modified user views for better skin support

2017-05-16: version 1.1.115 (horchi)
   - change: Changed apple-mobile-web-app-status-bar-style to black
   - bugfix: Fixed typo in eventsviews

2017-03-23: version 1.1.114 (horchi)
   - change: Minor view change for peding features

2017-03-20: version 1.1.113 (horchi)
   - added:  Add validity check of the API key for https://www.themoviedb.org (by 3po)
   - change: Removed compiler warnings when using clang
   - added:  Added clang++ to Make.config (as optional compiler)

2017-03-18: version 1.1.112 (horchi)
   - bugfix: fixed imagecount value in events table

2017-03-18: version 1.1.111 (horchi)
   - change: modified repeaing timer check statement to handle '' values like null values again
   - added:  new view eventsview-perlbo.sql
   - change: fixed some typos

2017-03-16: version 1.1.110 (horchi)
   - added: Congig option for MovieDb api-key

2017-03-16: version 1.1.109 (horchi)
   - change: Fixed git merge problems

2017-03-16: version 1.1.108 (horchi)
   - change: Improved error message on failed downloads
   - added:  sleep 1 second every 50 scraper downloads due to server limit

2017-03-12: version 1.1.108 (rechner)
   - bugfix: namingmode searchtimer shows always 10 instead of template

2017-03-09: version 1.1.106 (rechner)
   - bugfix: default namingmode on searchtimer was shown if VDR was stored

2017-03-09: version 1.1.106 (horchi)
   - bugfix: Fixed missing INIT_AFTER in Make.config

2017-03-06: version 1.1.105 (horchi)
   - added: Added column for future features to vdrs table

2017-03-06: version 1.1.104 (horchi)
   - change: Fixed order of push/tag in Makefile

2017-03-03: version 1.1.103 (horchi)
   - bugfix: Fixed os release detection for SuSe (fixed by 3po)

2017-03-01: version 1.1.102 (horchi)
   - Added: last merge to vdrs table (only for statistics/support reason)

2017-02-27: version 1.1.101 (horchi)
   - Added: Added support for systemd support in build environment

2017-02-26: version 1.1.100 (horchi)
   - bugfix: Fixed mail spam on invalid manuel timer

2017-02-24: version 1.1.99 (ckone)
   - change: Improved merge match duration due to some verry short events

2017-02-24: version 1.1.98 (horchi)
   - bugfix: Fixed problem with empty shorttext in timersdone

2017-02-22: version 1.1.97 (horchi)
   - changed: Modified Makefile to support more simultaneously make jobs

2017-02-22: version 1.1.96 (horchi)
   - added: 'After' template for systemd init

2017-02-16: version 1.1.95 (horchi)
   - added: Optional mail notification on create of 'auto-timer'

2017-02-15: version 1.1.94 (horchi)
   - bugfix: Fixed missing ! in some mails

2017-02-14: version 1.1.93 (horchi)
   - bugfix: Fixed timer delete on missing event

2017-02-13: version 1.1.92 (horchi)
   - bugfix: Fixed problem with autotimer update on simultaneous timer adjust

2017-02-08: version 1.1.91 (horchi)
   - changed: minor log level change

2017-02-07: version 1.1.90 (rechner)
   - fixed: sorting records for title
   - fixed: multiple highlights on sorting-context-menu
   - changed: newpath on moving improved

2017-02-07: version 1.1.89 (horchi)
   - changed: Timer 'start time change' messages only on changes greater 2 minutes

2017-01-25: version 1.1.88 (horchi)
   - bugfix: fixed auto adjust of timer start time
   - bugfix: fixed handling of timer mails

2017-01-24: version 1.1.87 (rechner)
   - bugfix: fixed refresh of searchtimer-table after saving from dialog

2017-01-20: version 1.1.86 (horchi)
   - bugfix: fixed compile with python 3

2017-01-19: version 1.1.85 (rechner)
   - added: defaultvalues for namingmode template
   - added: placeholder for quicklinks in defaults
   - fixed: click onsubmenu line

2017-01-19: version 1.1.84 (horchi)
   - bugfix: fixed minor problem with naming mode for sinlge timer create via web

2017-01-19: version 1.1.83 (horchi)
   - changed: changed length of template input box

2017-01-19: version 1.1.82 (horchi)
   - added: support of namingmode 'template' by epgd/epghttpd

2017-01-19: version 1.1.81 (horchi)
   - changed: Update of web help text for timer

2017-01-18: version 1.1.80 (rechner)
   - added: namingmode 6 = template in searchdialog added (missing in backend)

2017-01-18: version 1.1.79 (horchi)
   - bugfix: Fixed double escape of recording name

2017-01-14: version 1.1.78 (horchi)
   - changed: Compatibility to libmicrohttpd version <= 0x00095102

2017-01-13: version 1.1.77 (horchi)
   - changed: Compatibility to libmicrohttpd version <= 0x00090000

2017-01-13: version 1.1.76 (horchi)
   - added: Experimental TLS support

2017-01-12: version 1.1.75 (horchi)
   - bugfix: fixed config parser

2017-01-12: version 1.1.74 (horchi)
   - bugfix: fixed handling of null values in WEBIF communication

2017-01-03: version 1.1.73 (rechner)
   - bugfix: disabled state on user-rights again

2017-01-02: version 1.1.72 (rechner)
   - bugfix: disabled state on user-rights

2017-01-02: version 1.1.71 (rechner)
   - changed: layout from edit User
   - bugfix: load users without cache

2016-12-14: version 1.1.70 (horchi)
   - bugfix: fixed sql syntax error in epgd-dropall (Thx to Michael Schaffner)

2016-12-13: version 1.1.69 (horchi)
   - bugfix: send TCC mails only once

2016-12-12: version 1.1.68 (horchi)
   - bugfix: fixed sql syntax error in epgd-dropall (Thx to Michael Schaffner)

2016-12-12: version 1.1.67 (horchi)
   - bugfix: fixed crash on epghttpd shutdown

2016-12-05: version 1.1.66 (horchi)
   - bugfix: mask ' signs at mal body

2016-12-04: version 1.1.65 (rechner)
   - bugfix: canceling von delete Timer no longer ignored

2016-12-03: version 1.1.63 (rechner)
   - added: recordigs could be selected and delete

2016-12-02: version 1.1.62 (rechner)
   - fixed: icons in WebIf

2016-12-02: version 1.1.61 (horchi)
   - change: moved TCC mails to message interface

2016-12-02: version 1.1.60 (horchi)
   - bugfix: fixed message config

2016-12-01: version 1.1.59 (rechner)
   - added: messages view in WebIf

2016-12-01: version 1.1.58 (horchi)
   - added: optional notification mails
   - change: internal API redesign

2016-12-01: version 1.1.57 (horchi)
   - change: added pause on state change to prevent seldom 'deadlocks' on epg2vdr side

2016-11-30: version 1.1.56 (horchi)
   - change: merging of lib

2016-11-30: version 1.1.55 (horchi)
   - added: Delete / Modify of timers on event changes

2016-11-28: version 1.1.54 (rechner)
   - fixed: drag and drop for mobile in recording
   - fixed: positioning of elements while drag and drop in recording

2016-11-25: version 1.1.53 (horchi)
   - change: Install systemd script only on change

2016-11-24: version 1.1.52 (rechner)
   - added: search in recordings
   - change: drag and drop in recordings
   - fixed: moving recording

2016-11-24: version 1.1.51 (horchi)
   - added: constabel test to lib/test tool

2016-11-24: version 1.1.50 (horchi)
   - bugfix: fixed sql syntax error

2016-11-24: version 1.1.49 (horchi)
   - added: recording by name service for webif requests

2016-11-24: version 1.1.48 (horchi)
   - fixed:  Fix rename of recordings for webif service

2016-11-21: version 1.1.47 (horchi)
   - change: Added curl option for "CURLOPT_UNRESTRICTED_AUTH"
   - fixed:  URL in conflict mails
   - change: Added more systemd watchdog notification

2016-11-19: version 1.1.46 (rechner)
   - fixed:  Fix app for ipad and old browser (let was not supported)

2016-11-19: version 1.1.45 (horchi)
   - change: adjusted time format of timer conflict mails

2016-11-18: version 1.1.44 (rechner)
   - fixed:  Fix app for ipad and old browser (let was not supported)
   - change: optimze html-code for conflict mails

2016-11-18: version 1.1.43 (horchi)
   - change: new format of conflict mails

2016-11-12: version 1.1.42 (rechner)
   - fixed: SQL for mysql 5.7 changed (ckone)
   - fixed: simple Aprostoph replace with special Aprostoph, because sending of Timerkonflikt-Mails failed
   - fixed: search for recordigs

2016-11-03: version 1.1.41 (horchi)
   - added: started implementaion of message service for web

2016-11-03: version 1.1.40 (horchi)
   - added: support of redirect on file download

2016-11-02: version 1.1.39 (horchi)
   - bugfix: fixed parameter name (lastEpisodeFullRun)

2016-11-01: version 1.1.38 (rechner)
  - changed: https://ssl.constabel-it.de/eplists.constabel.net to https://www.eplists.de

2016-11-01: version 1.1.37 (rechner)
  - fixed:  drag and drop not initialised

2016-11-01: version 1.1.36 (rechner)
   - added search for recordigs
   - rechanged: match-density withot gradiant
   - fixed: bug while changed between different resolutions

2016-11-01: version 1.1.35 (horchi)
   - bugfix: fixed epglv makefile

2016-10-31: version 1.1.34 (rechner)
   - changed: uses gradient for match-density and show % as title

2016-10-31: version 1.1.32 (horchi)
   - bugfix: Fixed timzone display for WEBIF

2016-10-30: version 1.1.31 (horchi)
   - change: skipping epgsearch timer at timer check

2016-10-29: version 1.1.30 (horchi)
   - change: added recording owner to event at web sercive protocol

2016-10-27: version 1.1.29 (horchi)
   - added: notify vdr on timer modification

2016-10-26: version 1.1.28 (horchi)
   - added: renaming recording on events data change (for pending timers)

2016-10-26: version 1.1.27 (horchi)
   - changed: renamed vdruuid to owner for web protocol

2016-10-25: version 1.1.26 (rechner)
   - added: show matching recording data of event detail

2016-10-25: version 1.1.25 (horchi)
   - bugfix: fixed minor error message

2016-10-20: version 1.1.24 (horchi)
   - bugfix: fixed (removed) string escape for sql bindings

2016-10-20: version 1.1.23 (horchi)
   - bugfix: minor fix of log message

2016-10-20: version 1.1.22 (horchi)
   - added: started implementaion of timer check on changed events (only log messages)
            -> to be continues ;)

2016-10-20: version 1.1.21 (horchi)
   - bugfix: minor fix

2016-10-20: version 1.1.20 (horchi)
   - bugfix: fixed error handling of mysql udf epglv

2016-10-19: version 1.1.19 (horchi)
   - added:  match density to recording data of event detail service

2016-10-18: version 1.1.18 (horchi)
   - added:  recording data to event detail service
   - change: improved epgd-dropall script

2016-10-16: version 1.1.17 (horchi)
   - change: improved db reconnect handling of searchtimer code

2016-10-11: version 1.1.16 (rechner)
   - fix: detailview on devices > 900
   - added: parameter for defaultsort in recordings

2016-09-08: version 1.1.15 (rechner)
   - fix: detailview on devices > 768 and < 1139

2016-08-30: version 1.1.14 (horchi)
   - bugfix: fixed minor webif bug according safari browser (rechner)

2016-08-29: version 1.1.13 (horchi)
   - change: Update of epgd-tool by 3po

2016-08-26: version 1.1.12 (horchi)
   - added: support of long eventids for tvsp (merged dev into master)

2016-07-25: version 1.1.11 (rechner)
   - bugfix: if wrong channelsort from backend, channel will also shown right

2016-07-21: version 1.1.10 (rechner)
   - fixed: scrping must also using int64

2016-07-20: version 1.1.9 (rechner)
   - fixed: imageid must also using int64

2016-07-19: version 1.1.8 (rechner)
   - rechange: increased event id to unsigned int64 even for searchtimer
   - change: increased event id to unsigned int64 even for lib/pytst

2016-07-16: version 1.1.7 (rechner)
   - change: increased event id to unsigned int64 even for searchtimer

2016-07-15: version 1.1.6 (horchi)
   - change: increased event id to unsigned int64 even for epghttps plugin

2016-07-15: version 1.1.5 (horchi)
   - bugfix: fixed 'optimized Makefiles' (by Alexander Grothe)
   - change: minor code review

2016-07-13: version 1.1.4 (horchi)
   - change: increased event id to unsigned int64 for epgdata plugin

2016-07-13: version 1.1.3 (horchi)
   - change: started increase of event id to unsigned int64

2016-07-08: version 1.1.2 (horchi)
   - change: optimized Makefiles (by Alexander Grothe)

2016-07-06: version 1.1.1 (horchi)
   - change: Update of epgd-tool by 3po

2016-07-04: version 1.1.0 (horchi)
   - change: Merged http branch into master

2016-06-25: version 1.0.106 (rechner)
   - fixed: avoid errormessage, if no channel has no data

2016-06-19: version 1.0.104 (rechner)
   - added: tv-switch channel icon to channels
   - fixed: edit searchtimer from timerlist

2016-06-12: version 1.0.103 (rechner)
   - changed: logs an erroe, if defaultVDR is invalid or no vdr found

2016-06-12: version 1.0.102 (rechner)
   - fixed: failed open detailview
   - added Make.config to ignore list

2016-06-03: version 1.0.101 (horchi)
   - change: Changed Makefile for epglv

2016-06-02: version 1.0.100 (rechner)
   - fix: storing of namingmode

2016-06-01: version 1.0.99 (horchi)
   - change: system notification thread more silent

2016-06-01: version 1.0.98 (horchi)
   - change: updated README
   - change: improved init system integration
             - register before tables are initialized
             - implemented notrification timeout for alter tables (alter can take a long time)

2016-06-01: version 1.0.97 (horchi)
   - added: eventsview-uti.sql

2016-06-01: version 1.0.96 (horchi)
   - added: install of init scripts with 'make install' (for upstart and systemd)
            the init system can set in Make.config

2016-05-31: version 1.0.95 (horchi)
   - change: update of views

2016-05-31: version 1.0.94 (horchi)
   - change: increased file topic to 1000 and the max image size to 512k

2016-05-31: version 1.0.93 (horchi)
   - change: log level für 'Check rights of' set to 2
   - change: adjusted path in systemd start files

2016-05-31: version 1.0.92 (horchi)
   - bugfix: set visible flag on initial create of channelmap

2016-05-26: version 1.0.91 (rechner)
   - fix: deleting of multiple timers

2016-05-26: version 1.0.90 (rechner)
   - fix: deleting of timers

2016-05-25: version 1.0.89 (rechner)
   - change: deleting and selecting from table rows are now only on visible rows
   - added: shows count of deleting entries in confirm dialog
   - fixed: 'visible' flag for channels only for flagvalue 1
   - fixed: wrong timerdialog on record in eventdetail

2016-05-25: version 1.0.88 (horchi)
   - bugfix: Fixed scrap for recordings - don't lookup events data for 'old' recordings
   - change: Chenged order of recording scrap - fist honor the user scrap info

2016-05-25: version 1.0.87 (horchi)
   - bugfix: Fixed initial 'visible' flag for new sources of existing channel

2016-05-24: version 1.0.86 (rechner)
   - added:  detail dialog for donetimer
   - bugfix: some fixes

2016-05-24: version 1.0.85 (horchi)
   - change: minor change in thread context

2016-05-24: version 1.0.84 (horchi)
   - added: data/donetimer for webif request

2016-05-23: version 1.0.83 (rechner)
   - bugfix: could not open eventdetail after view settings

2016-05-23: version 1.0.82 (horchi)
   - change: modified repeaing timer check statement to handle '' values like null values

2016-05-23: version 1.0.81 (horchi)
   - change: let unset EPISODE* fields of timersdone 'null'

2016-05-23: version 1.0.80 (horchi)
   - change: adjusted log levels

2016-05-21: version 1.0.79 (rechner)
   - bugfix:  css for thumb, if image is 4:30
   - changed: tip to Goldtip in searchdialog
   - added:   =! for quicktime, which should not be hihlighted in magazine view

2016-05-21: version 1.0.78 (rechner)
   - bugfix:  now could not open after first call
   - removed: parameter ratings
   - bugfix:  timerdone duration was wrong calculated

2016-05-20: version 1.0.77 (horchi)
   - change: update of epgdate xslt

2016-05-20: version 1.0.76 (horchi)
   - change: improved views for new rating info (ckone)

2016-05-20: version 1.0.75 (horchi)
   - change: fixed autotimer default name

2016-05-20: version 1.0.74 (horchi)
   - change: speed up web done-timers requests

2016-05-20: version 1.0.73 (horchi)
   - change: speed up web recording requests

2016-05-20: version 1.0.72 (horchi)
   - added:  new column for textual rating and commentator
   - change: removed unused info column
   - change: updated merge procedure, views and xslt for new columns (ckone)

2016-05-19: version 1.0.71 (rechner)
   - bugfix: some fixes
   - added:  commentator and txtrating to eventdetail
   - added:  magazine - quicktimes colored

2016-05-18: version 1.0.70 (rechner)
   - added: tipp to data/events and shows in now and magazine

2016-05-18: version 1.0.69 (horchi)
   - change: improved stop of system notification thread

2016-05-18: version 1.0.68 (horchi)
   - added: new timer trigger field _starttime for internal usage

2016-05-18: version 1.0.67 (horchi)
   - added: auto wakeup VDR for not assumed timers within two days

2016-05-18: version 1.0.66 (horchi)
   - change: updated sql scripts
   - change: updated merge procedure (ckone)
   - change: table row fromat (at table create) now DYNAMIC

2016-05-17: version 1.0.65 (rechner)
   - added: tipp to data/event and shows in eventdetail

2016-05-15: version 1.0.64 (rechner)
   - removed: tipp from data/event, data/evetns, data/search
   - added:   parameter ratings

2016-05-15: version 1.0.63 (rechner)
   - added:   numrating on data/event, data/evetns, data/search
   - removed: tipp/tagestipp/toptipp from webview, uses numrating instead

2016-05-15: version 1.0.62 (rechner)
   - added: WOL on VDR menu item
   - changed: topmenu has now submenus instead of tabs

2016-05-15: version 1.0.61 (horchi)
   - added: index for timers table

2016-05-13: version 1.0.60 (horchi)
   - added: wakeup vdr (WOL) for webif requests

2016-05-11: version 1.0.59 (horchi)
   - bugfix: Fixed event insert state handling for epgdata plugin
   - change: Ported 'groub by' clause to mysql 5.7
   - change: minor changes

2016-05-10: version 1.0.58 (horchi)
   - added: optional config option 'seriesMail' for constabel login

2016-05-10: version 1.0.57 (horchi)
   - change: ported some SQL statements für mysql 5.7

2016-05-09: version 1.0.56 (horchi)
   - fixed: added sql string-escape for python return

2016-05-06: version 1.0.55 (rechner)
   - fixed: magazine view for iphone

2016-05-04: version 1.0.54 (horchi)
   - change: update of eventsview-ck.sql
   - change: increased field fileref to ASCII 100

2016-05-03: version 1.0.53 (rechner)
   - bugfix: error on sort or delete record

2016-05-03: version 1.0.52 (rechner)
   - bugfix: doubled login call removed
   - added: show count of recordings in List

2016-05-03: version 1.0.51 (horchi)
   - bugfix: fixed replay recording via webif

2016-05-03: version 1.0.50 (horchi)
   - added: curl option for 'gzip'

2016-05-02: version 1.0.49 (horchi)
   - change: removed 'groub by' clause of TCC due to compatibility to new mysql versions

2016-04-29: version 1.0.48 (rechner)
   - fixed: pages_now qucksesarch position

 2016-04-28: version 1.0.47 (rechner)
   - fixed: calendar skiped a day

2016-04-27: version 1.0.46 (rechner)
   - added: global error handling with log

2016-04-27: version 1.0.45 (horchi)
   - change: new files for fedora (thx to marco)

2016-04-26: version 1.0.44 (rechner)
   - fixed: calendar starts had ignored start of week
   - added: EpgViewWeb in epgd.config configurable

2016-04-25: version 1.0.43 (rechner)
   - changed: calendar starts now with minEventDay

2016-04-24: version 1.0.42 (rechner)
   - added: now it is possible to override css via custom.css
   - changed: added owner to data/replayrecording

2016-04-24: version 1.0.41 (rechner)
   - fixed: play record on VDR

2016-04-24: version 1.0.40 (horchi)
   - change: modified log messages for systemd integration (thx to seahawk1986)

2016-04-23: version 1.0.39 (rechner)
   - added: quicklinks added to now-View
   - changed: eventdetail: if we have scrapper series info, constabel will be shown

2016-04-23: version 1.0.38 (rechner)
   - fixed: timerdialog window centered in magazine view
   - fixed: encode & in title for canstable links
   - fixed: typo in bugfix: removed timer with state '-' from web request

2016-04-22: version 1.0.37 (horchi)
   - bugfix: removed timer with state '-' from web request

2016-04-22: version 1.0.36 (horchi)
   - bugfix: fixed build of pytst

2016-04-21: version 1.0.35 (rechner)
   - fixed: error on save timer if list container not initialist
   - added: if error in loader-func, loader also closed

2016-04-20: version 1.0.34 (rechner)
   - fixed: some typos (thanks to Lars)

2016-04-20: version 1.0.33 (rechner)
   - fixed: magazine: use difference of startimes for heigt calc instead of duration

2016-04-20: version 1.0.32 (horchi)
   - bugfix: fixed done check with null values

2016-04-20: version 1.0.31 (horchi)
   - change: episodename search now case insensitiv
   - bugfix: fixed range search

2016-04-20: version 1.0.30 (horchi)
   - bugfix: fixed field format of AUTOTIMERNAME

2016-04-20: version 1.0.29 (horchi)
   - bugfix: fixed redundant recordings

2016-04-19: version 1.0.28 (rechner)
   - added: Version as parameter on epgd.js, epgd.css and common.js to prevent cached
   - added: show thump on check count hits for save searchtimer
   - added: help extended

2016-04-19: version 1.0.27 (horchi)
   - change: fix of makefile to new systemd version (thx to seahawk1986)

2016-04-19: version 1.0.26 (horchi)
   - bugfix: fixed field name

2016-04-19: version 1.0.25 (horchi)
   - change: ported makefile to new systemd version (thx to seahawk1986)

2016-04-18: version 1.0.24 (rechner)
   - fixed: data/search delete timer name on test and search
   - changed: if page changed, while recordings loading, page will not changed back to recordings
   - changed: searchdialog - delete and copy button added

2016-04-18: version 1.0.23 (horchi)
   - added: update of autotimer name (in timers and timersdone) on change
   - added: timer-name suport for data/search

2016-04-18: version 1.0.22 (horchi)
   - added: type parameter to data/searchtimers query
   - added: curl wrapper enhancement for request headers (thx to chriszero)
   - added: autotimername to table timersdone

2016-04-18: version 1.0.21 (horchi)
   - bugfix: fixed fedora files

2016-04-17: version 1.0.20 (rechner)
   - added: if button drown is pressed in searchtimerlist, the searchresult will be shown like timer from searchtimer

2016-04-17: version 1.0.19 (horchi)
   - change: new files for fedora (thx to marco)

2016-04-16: version 1.0.18 (rechner)
   - added: fixed start/max critiria for data/search
   - fixed: searchdialog not closed on save
   - added: maxListEntries as Parameter for data/search

2016-04-16: version 1.0.17 (horchi)
   - added: fixed start/max critiria for data/search

2016-04-15: version 1.0.16 (rechner)
   - added: todos now shown in help/about
   - added: copy button in Searchtimerdialog
   - added: ask on searchtimerdialog, if result > 50
   - added: quicktime < current time in calendar -1, we changed also the day
   - changed: timerdialogs: name moved to top
   - fixed: on change from timerdialog to searchtimerdialog, search-in-title is checked
   - fixed: repeat on eventdetail crashed

2016-04-15: version 1.0.15 (horchi)
   - added: start to data/search for paging

2016-04-15: version 1.0.14 (horchi)
   - added: autotimername to table timers
   - added: limit for data/search

2016-04-14: version 1.0.13 (rechner)
   - fixed: searchtimerresultlist could only be execute once
   - fixed: year in searchdialog gets also 2000-
   - added: clear button on timepicker (search)
   - changed: name from searchtimer is always visible
   - added: searchtimerlist: name or expression will shown and has now icons

2016-04-14: version 1.0.12 (horchi)
   - change: increased parameter size to 500 character

2016-04-14: version 1.0.11 (horchi)
   - added: added missing js file

2016-04-14: version 1.0.10 (horchi)
   - added: allow name of searchtimer for 'quickTimes'

2016-04-13: version 1.0.9 (rechner)
   - added: app now launchable as WepApp in fullscreen
   - changed: jquery update (2.2.3)
   - changed: search is now inherited from searchtimer
   - added: nexdays in searchdialog

2016-04-13: version 1.0.8 (horchi)
   - change: even more log messages

2016-04-13: version 1.0.7 (horchi)
   - change: minor log message changes

2016-04-05: version 1.0.6 (rechner)
   - added: filter for starttime in timer
   - changed: sort of timersdone is now desc for starttime

2016-04-04: version 1.0.5 (rechner)
   - fixed: hit table was over dialog(zIndex)

2016-03-28: version 1.0.4 (rechner)
   - fixed: search: show loading, on new search

2016-03-28: version 1.0.3 (rechner)
   - added: multiple filter in tables
   - fixed: sorting of tables

2016-03-27: version 1.0.2 (rechner)
   - fixed: daylight flag in localtime
   - changed: editchannels input field now filterlines instead of selecting
   - changed: in now view all Items have same height, mouseover on desc will expand it

2016-03-26: version 1.0.1 (rechner)
   - fixed: eventdetail headline was on wrong position in FF ESR
   - added: History with versions info in web-help
   - extend: help

2016-03-26: version 1.0.0 (rechner)
   - added: first Betarelease

2016-03-26: version 0.7.12 (horchi)
   - bugfix: fixed char compare of db API

2016-03-25: version 0.7.11 (rechner)
   - fixed: default-values for timer state and action changed to upercase
   - added: magazine view scrolled on mouseover on border area
   - changed: javascript is now minified

2016-03-25: version 0.7.10 (rechner)
   - fixed: default-values for timer state and action changed to upercase
   - added: magazine view scrolled on mouseover on border area

2016-03-24: version 0.7.9 (rechner)
   - fixed: some fixes in webIf
   - changed: fixed timer query für web requests, no default-values
   - changed: click on now or magazine set time to now
   - fixed: magzine view for iphone/ipad

2016-03-24: version 0.7.8 (horchi)
   - added: day range for autotimer

2016-03-24: version 0.7.7 (horchi)
   - bugfix: fixed handling of auto timer with vdr=auto

2016-03-24: version 0.7.6 (horchi)
   - change: fixed timer query für web requests

2016-03-23: version 0.7.5 (rechner)
   - changed: channel in timerdialog is now autocomple and contains all channels
   - added: timertype in timerdialogs
   - changed: mazineview layout changed, title on top, minheight of 20 px

2016-03-23: version 0.7.4 (horchi)
   - bugfix: fixed delete of timer attributes

2016-03-23: version 0.7.3 (horchi)
   - added: added field name to table serachtimers

2016-03-23: version 0.7.2 (horchi)
   - bugfix: fixed channel include/exclude of searchtimers

2016-03-23: version 0.7.1 (horchi)
   - change: fixed compile (missing header) on some environments
   - change: Update of TODO list
   - added:  timer-type field to timer tables (for planned features)

2016-03-22: version 0.7.0 (horchi/rechner)
   - added: advanced searchtimer: episodename, season, seasonpart, year, category, genre, tipp, noepgmatch,chexclude

2016-03-22: version 0.6.59 (horchi)
   - changed: search timer statement ordered by starttime and the configured channel order

2016-03-22: version 0.6.58 (horchi)
   - changed: removed reason from timers table

2016-03-21: version 0.6.57 (rechner)
   - changed: show timer actionflag

2016-03-21: version 0.6.56 (horchi)
   - added: auto alter for default value

2016-03-21: version 0.6.55 (rechner)
   - changed: max-width for channellogos in magazine view
   - fixed: filter in tables will be called, if table was updated
   - added: logoShowName

2016-03-21: version 0.6.54 (horchi)
   - changed: added default value für timer state

2016-03-19: version 0.6.53 (rechner)
   - changed: channellogos now img-tags

2016-03-18: version 0.6.52 (rechner)
   - bugfix: fixed content type of SVG image
   - added: support of sfg files in css
   - added: Filter in donetimers for title
   - changed: action-state in timer view

2016-03-18: version 0.6.51 (horchi)
   - added: added make update to Makefile

2016-03-18: version 0.6.5 (horchi)
   - bugfix: fixed content type of SVG image

2016-03-17: version 0.6.49 (horchi)
   - change: changed content type of SVG image

2016-03-17: version 0.6.48 (horchi)
   - bugfix: fixed path of SVG files

2016-03-16: version 0.6.47 (horchi)
   - added: extended filter of timer query (data/timers) (action, notaction and notstate)

2016-03-16: version 0.6.46 (horchi)
   - added: implemented max fail retries for autotimers with reuse of timer-row

2016-03-15: version 0.6.45 (horchi)
   - fixed: mising event id on manual timers

2016-03-15: version 0.6.44 (horchi)
   - fixed: init timezone lib
   - fixed: fixed error message at failed image load
   - fixed: fixed webif timer with 'vdr = auto'
   - added: support of SVG logos

2016-03-14: version 0.6.43 (rechner)
   - fixed: calculating from timezone to all times

2016-03-14: version 0.6.42 (horchi)
   - bugfix: fixed 'escape user defined sql strings'

2016-03-14: version 0.6.41 (horchi)
   - added: httpDevice to epgd.conf, epghttpd listen on this device instead of all devices

2016-03-14: version 0.6.40 (horchi)
   - change: merge of lib code with plugin

2016-03-14: version 0.6.39 (horchi)
   - change: Escape user defined sql strings for queries

2016-03-13: version 0.6.38 (rechner)
   - fixed: currentTime in webif is now system time from epg daemon server

2016-03-12: version 0.6.37 (rechner)
   - added: parameter for schedules menu in webif
   - added: records: headline for commonFolder
   - changed: doTimerJobs -> response-object name is now timers
   - changed: view of timersdone eual to timers
   - fixed: sort of hits is now numeric

2016-03-12: version 0.6.36 (horchi)
   - change: update of epgsearchdone.pl
   - added: README-import-epgsearch
   - added: epgsearchdone.pl to make install

2016-03-11: version 0.6.35 (horchi)
   - added: added perl script to import epgsearchdone.data

2016-03-03: version 0.6.34 (horchi)
   - added: check expression for quickTime updated (webif)

2016-03-02: version 0.6.33 (horchi)
   - added: max-age of post requests now set to 0

2016-03-02: version 0.6.32 (horchi)
   - added: @Now and @Next option to user times

2016-02-29: version 0.6.31 (horchi)
   - bugfix: fixed compile error

2016-02-29: version 0.6.30 (horchi)
   - added: config parameter for schedules menu

2016-02-25: version 0.6.29 (horchi)
   - changed: scraping now follow the category of the recoring strict

2016-02-24: version 0.6.28 (horchi)
   - changed: moved the python interface an the searchtimer api to lib/

2016-02-19: version 0.6.27 (rechner)
   - changed: records: sort also in subfolders
   - added: records: ESC canceled drag and drop and close menu

2016-02-16: version 0.6.25 (rechner)
   - change: query only pending an recording timer für timers?autotimer=x request

2016-02-15: version 0.6.24 (rechner)
   - added: show reason in timerlist

2016-02-15: version 0.6.23 (horchi)
   - bugfix: Fixed statement for already recorded check

2016-02-15: version 0.6.22 (horchi)
   - change: update searchtimer only on change

2016-02-13: version 0.6.21 (horchi)
   - change: prohibit searchtimer to create timer for already scheduled event

2016-02-11: version 0.6.20 (rechner)
   - change: help extend

2016-02-11: version 0.6.19 (horchi)
   - bugfix: Fixed searchtimer state

2016-02-11: version 0.6.18 (horchi)
   - bugfix: Removed DOS CRLF of source files

2016-02-10: version 0.6.16 (rechner)
   - change: data/save-timer and data/save-searchtimer: change start to starttime and stop to endtime
   - change: expanded suchtimer dialog

2016-02-10: version 0.6.15 (horchi)
   - bugfix: Fixed variable overflow

2016-02-10: version 0.6.14 (horchi)
   - added: Detail EPG fields to searchtimers (not used so far)

2016-02-09: version 0.6.13 (rechner)
   - bugfix: delete searchtimer form dialog failed
   - change: timerdialog: repeatFields "Episode" and "Episodenpart" deleted and season and seasonpart added
   - added: records: show recordingday

2016-02-09: version 0.6.12 (horchi)
   - bugfix: Fixed error on timer create (uninitialized variable)

2016-02-09: version 0.6.11 (horchi)
   - bugfix: Fixed problem with done states an searchtimers

2016-02-09: version 0.6.10 (horchi)
   - change: Improved log message at timer create
   - bugfix: Fixed problem with TCC mail count

2016-02-08: version 0.6.9 (horchi)
   - change: Fixed some compiler warnings
   - change: improved check for 'repeating' events aut timer creation

2016-02-07: version 0.6.8 (horchi)
   - change: Send TCC mail only one per timer
   - change: Try to fix compile problems by g++ 6

2016-02-05: version 0.6.7 (horchi)
   - bugfix: call systemd watchdog trigger at even more situations :( ....

2016-02-05: version 0.6.6 (horchi)
   - bugfix: fixed sql syntax error

2016-02-05: version 0.6.5 (horchi)
   - added: implemented store-donetimers for webif request

2016-02-05: version 0.6.4 (horchi)
   - added: support for timer creation at 'any' vdr
   - change: update of TODOs
   - added: log duration of http requests

2016-02-04: version 0.6.3 (horchi)
   - change: finelized new timerjobs design

2016-02-01: version 0.6.2 (horchi)
   - change: redesign of timerjobs, remove table timerdistribution

2016-02-01: version 0.6.1 (rechner)
   bugfix: remove deleted item from view in recordings
   change: if time could not be set in timpicker, because there are no events, automaticly a day will be added

2016-02-01: version 0.6.0 (horchi)
   - change: check constabel maximum only for full-update

2016-02-01: version 0.5.34 (horchi)
   - bugfix: Fixed parameter store

2016-02-01: version 0.5.33 (horchi)
   - bugfix: Now a maximum one constabel retries per 6 hours

2016-01-29: version 0.5.32 (horchi)
   - bugfix: Fixed delete of recording by webif

2016-01-29: version 0.5.31 (horchi)
   - change: TODO list update

2016-01-29: version 0.5.30 (horchi)
   - change: fixed field size

2016-01-28: version 0.5.29 (rechner)
   - change: all items in now-view have now the same height
   - change: recordings: new algo for print title,name and shorttext
   - bugfix: regex for quicktimes

2016-01-26: version 0.5.28 (rechner)
   - bugfix: magazine view fix, if less channels as visibile screen are available
   - bugfix: saving quicktimes
   - changed: show videofolder and available above records

2016-01-27: version 0.5.27 (horchi)
   - change: minor changes

2016-01-26: version 0.5.26 (rechner)
   - change: picktimers changed to quicktimers; no syntax label=time[~label=time...]
2016-01-26: version 0.5.25 (rechner)
   - bugfix: magazine: maxcols are depending now from screen or mac channels
   - bugfix: access deniend replaced with common error, if choose menu-item failed
   - change: get parameters in dialog options are not cached anymore
   - bugfix: no error popup at logoff
   - added: show videofolder and available in records

2016-01-20: version 0.5.24 (horchi)
   - bugfix:  fixed c&p bug in systemd notifications

2016-01-18: version 0.5.23 (horchi)
   - added:  support script epgd-showtimerat
   - added:  notification events during epg merge procedure
   - change: increased source field of table timerdistribution (to fit uuid)

2016-01-18: version 0.5.22 (horchi)
   - bugfix: implemented solution for 0.5.21

2016-01-18: version 0.5.21 (horchi)
   - bugfix: refix of 0.5.20 ;) -> workaround is to store the channellist at least once via webif

2016-01-17: version 0.5.20 (horchi)
   - bugfix: Fixed double channel listing in WEBIF/'Programme' tab

2016-01-15: version 0.5.19 (rechner)
   - change: handling of 409 -> ids for failed parameter

2016-01-15: version 0.5.18 (horchi)
   - bugfix: don't try to send mail without at leadt one receiver

2016-01-15: version 0.5.17 (horchi)
   - added: return ids of failed parameters for data/store-parameters
   - change: return all parameters, even the not yet configured for data/parameters
   - added: added watchdog notification during episode lookup and download

2016-01-15: version 0.5.16 (horchi)
   - bugfix: fixed crash at store of parameter with missing value

2016-01-14: version 0.5.15 (rechner)
   - change: add type to parameter and use it in webif
   - bugfix: parameter were cached after saving

2016-01-14: version 0.5.14 (horchi)
   - added: parameter type

2016-01-14: version 0.5.13 (horchi)
   - change: removed obsolete fields from table parameters

2016-01-13: version 0.5.12 (rechner)
   - change: show error message on state 409
   - change: save and delete timers: selected rows red, if this row failed
   - bugfix: repeat-tab on eventsdetail was empty on call same eventdetail again

2016-01-13: version 0.5.11 (horchi)
   - bugfix: fixed typo in regexp for parameter validation

2016-01-13: version 0.5.10 (horchi)
   - bugfix: fixed loglevel handling for argument (-l)
   - bugfix: fixed autoupdate on channelmap.conf changes
   - change: minor code review and adjustment of some loglevels

2016-01-13: version 0.5.9 (horchi)
   - bugfix: fixed regular expressions for parameter validation
   - bugfix: fixed return value on failed store of searchtimers
   - added:  system notification events during download

2016-01-12: version 0.5.8 (rechner)
   - change: extend search for repeats of eventdetail with shorttext
   - bugfix: dateformat uses tr (de.js)

2016-01-12: version 0.5.7 (horchi)
   -bugfix: fixed define for systemd watchdog

2016-01-12: version 0.5.6 (horchi)
   - added: sending TCC mails for all registarted web users

2016-01-12: version 0.5.5 (horchi)
   - added: new search criteria for webif
   - change: update of timer job interface for webif

2016-01-12: version 0.5.4 (horchi)
   - added: added missing parameter check by regular expression
   - added: added watchdog notifications during scraping

2016-01-11: version 0.5.3 (rechner)
   - change: frontend-parameter cleaned in parameters.c
   - bugfix: needLogin always changed to false on save-parameters

2016-01-11: version 0.5.2 (horchi)
   - change: Adapted systemd and pidfile options for epghttpd

2016-01-11: version 0.5.1 (horchi)
   - bugfix: fixed default for systemd in Make.config

2016-01-11: version 0.5.0 (horchi)
   - change: extended systemd interface (sd_watchdog_enabled)
   - added:  systemd notifications during epg update process
   - added:  support of pidfile (argument -i <pidfile>)

2016-01-08: version 0.4.2 (horchi)
   - change: extended systemd interface

2016-01-08: version 0.4.1 (horchi)
   - change: changed config parameter handling

2016-01-07: version 0.4.0 (horchi)
   - change: Cleanup history for timer jobs now configurable
   - added: Status interface for systemd -> activate/deactivate in Make.config

2016-01-06: version 0.3.2 (horchi)
   - change: Changed 'delete timer job' interface

2016-01-05: version 0.3.1b (horchi)
   - bugfix: Improved version check of revision control

2016-01-05: version 0.3.1a (horchi)
   - bugfix: Added version check to revision control

2016-01-05: version 0.3.1 (horchi)
   - added: Version control and git tagging helper functions to Makefile
   - added: Start versioning of http branch

2014-04-01: version 0.3.0a (horchi)
   - added: started new development branch - dont' use - pre alpha!
   - added: auto alter to DB API

2014-04-15: version 0.2.0 (louis)
   - added: scraper support

2014-03-23: version 0.1.16 (horchi)
   - bugfix: fixed type for userexit checksum

2014-03-21: version 0.1.15 (horchi)
   - added: added optional user defined procedure "userexit" called after data import

2014-03-19: version 0.1.14 (horchi)
   - bugfix: fixed image cleanup

2014-03-19: version 0.1.13 (horchi)
   - change: update images even if already imported
   - added:  uuid to eplists service login

2014-03-17: version 0.1.12 (horchi)
   - bugfix: major fix of 0.1.11!

2014-03-17: version 0.1.11
   - change: increased episodes.partname, episodes.comppartname to 300
   - change: added fields producer, other and camera
   - change: removed fields origtitle and team

2014-01-03: version 0.1.10
   - change: adapted epgdata plugin to modified header

2014-01-02: version 0.1.9
   - change: changed some fields to type Text due to row limit
   - change: increased shortreview to varchar 500

2013-12-31: version 0.1.8
   - change: increased field guest to 1000

2013-12-06: version 0.1.7
   - bugfix: fixed mem bug on initial start (at view create)

2013-12-05: version 0.1.6
   - bugfix: fixed mem bug on initial start (at procedure create)

2013-12-04: version 0.1.5
   - bugfix: fixed minor mem leak
   - change: changed coloum type of 'longdescription' from varchr to text

2013-12-04: version 0.1.4
   - bugfix: fixed insert handling with multimerge

2013-11-29: version 0.1.3
   - change: included procedures and views for multimerge
   - change: added 90 minutes more for series fetch at eplists.constabel.net

2013-11-20: version 0.1.2
   - change: changed merge flag in channelmap.conf yYnN not supportew anymore (preparation for feature ;))
   - change: updated bin-logging hint in README
   - change: increased shorttext and compshorttext to 300 chars, topic and guest to 500 chars
             therefore you have to alter your tables
   - change: download timeout now configurable
   - change: removed PIN from log message
   - added:  XML_PARSE_HUGE for libxml2 versions >= 20900

2013-10-28: version 0.1.1
   - change: fixed typos in README, added hint for epglv to README
   - bugfix: fixed typo of channelmap parsing
   - bugfix: Fixes at sql merge procedures by ckone
   - change: Rerouted error messages wich prohibit start of epgd to stderr
   - change: Improved epgd-tool (thanks to 3po)

2013-10-23: version 0.1.0
   - change: first release with epg merge
   - added:  new options EpgView, CheckInitial and UpdateThreshold
   - change  new layout channelmap table
   - added:  <merge>-parameter to channelmap.conf (see channelmap.conf for instructions)
   - added:  handling of the DVBs x-components (for example the audio and video track descriptions)

- Added possibilty to trigger EPG updates from your external EPG provider
    - execute "killall -HUP epgd" on command line


2013-09-27: version 0.0.8b
   - change: first alpha version with epg merge
   - added:  integrated sql procedures for epg merge (developed by ckone)
   - added:  automatic create of procedures and functions at initial start
   - added:  automatic create of analyze tables at initial start
   - change: improved reuse of stored epgdata files after dropall
   - change: improved cleanup of updated epgdata files
   - added:  new alternative view provided by 3PO
   - change: improved drop script

2013-09-23: version 0.0.8a
   - change: started devel branch for epg merge

2013-09-16: version 0.0.7
   - change: don't toggle updflg on series"
   - change: improved speed on image load"
   - bugfix: fixed bug on init with missing database (grabber plugin API changed!!)

2013-09-05: version 0.0.6
   - added:  init scripts and ebuild for gentoo - thanks to 3po
   - added:  show version (epgd -v)
   - added:  install of scripts with "make install"
   - added:  install of configuration (only if not already installed)
   - change: renamed to epgd-ls-channelids.pl to epgd-ls-channelids
   - change: updated init scripts
   - change: updated epgd-tool (request root password only if needed)
   - bugfix: fixed start with unknown parameter
   - added:  split busy state to "busy (events)" and "busy (images)"

2013-09-03: version 0.0.5
   - change: updated log message
   - change: updated db_helper and renamed to epgd-tool
   - change: improved drop-all script (now interactive) and renamed to epgd-dropall
   - change: added usage to getchannelid.pl and renamed to epgd-ls-channelids.pl
   - change: Make.config now fit PREFIX und DESTDIR rules - thanks to gda
   - added:  plausibility for channelmap.conf (ignoring ambiguous channel config)

2013-09-01: version 0.0.4
   - bugfix: fixed core on missing mysqld at start

2013-09-01: version 0.0.3
   - change: removed mysql dependency from upstart skript
   - change: improved error handling on download
   - change: 'make' and 'make install' now build/install plugins

2013-08-30: version 0.0.2
   - change: updated README
   - added:  DBAPI check on startup
   - added:  Store last update to vdrs table
   - added:  DEBUG switch to Make.config
   - bugfix: minor bug in dh_helper.sh
   - bugfix: fixed and renamend scripts/getchannelid.pl (config helper)

2013-08-28: version 0.0.1
   - first official release

2013-07-04: version 0.0.1-rc5
   - added: epgdata support

2013-07-01: version 0.0.1-rc4
   - added: 'at' now supported as lang eplist file suffix
   - added: extra coulumn 1-3 for optional eplist special fields

2013-03-11: version 0.0.1-rc3
   - minor bugfixes

2012-12-30: version 0.0.1-rc2
   - minor bugfixes

2012-12-19: version 0.0.1-rc1
   - initiale version
 * ------------------------------------
 */
