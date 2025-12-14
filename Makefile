#
# Makefile
#
# See the README file for copyright information and how to reach the author.
#

include Make.config

TARGET = epgd
HTTPTARGET = epghttpd
HISTFILE = "HISTORY.h"

BASELIBS += -lrt -lz -larchive -ldl -lcrypto -luuid
BASELIBS += $(shell $(SQLCFG) --libs_r)
BASELIBS += $(shell pkg-config --cflags --libs jansson)

HLIB     = -L./lib -lhorchi
DLIBS    = $(HLIB) $(BASELIBS) -lcurl $(shell pkg-config libxml-2.0 --libs) $(shell pkg-config libxslt --libs) -lexslt
HTTPLIBS = $(HLIB) -lmicrohttpd $(BASELIBS) -lcurl $(shell pkg-config libxml-2.0 --libs) $(shell pkg-config libxslt --libs) -lexslt -ljpeg $(shell pkg-config imlib2 --libs)

VERSION = $(shell grep 'define _VERSION ' $(HISTFILE) | awk '{ print $$3 }' | sed -e 's/[";]//g')
ARCHIVE = $(TARGET)-$(VERSION)

LASTHIST    = $(shell grep '^20[0-3][0-9]' $(HISTFILE) | head -1)
LASTCOMMENT = $(subst |,\n,$(shell sed -n '/$(LASTHIST)/,/^ *$$/p' $(HISTFILE) | tr '\n' '|'))
LASTTAG     = $(shell git describe --tags --abbrev=0)
BRANCH      = $(shell git rev-parse --abbrev-ref HEAD)
GIT_REV     = $(shell git describe --always 2>/dev/null)

HLIBDEP = ./lib/libhorchi.a

export DESTDIR

ifdef GIT_REV
  DEFINES += -DGIT_REV='"$(GIT_REV)"'
endif

ifdef SYSD_NOTIFY
  ifdef SYSDLIB_210
    BASELIBS += $(shell pkg-config --libs libsystemd)
  else
    BASELIBS += $(shell pkg-config --libs libsystemd-daemon)
  endif
endif

# object files

OBJS += main.o update.o plugin.o epgdconfig.o channelmap.o series.o svdrpclient.o episode.o
OBJS += tvdbmanager.o moviedbmanager.o

OBJS += lib/fuzzy.o scraper/tvdbscraper/tvdbscraper.o scraper/tvdbscraper/tvdbv4.o
OBJS += scraper/tvdbscraper/tvdbseries.o
OBJS += scraper/moviedbscraper/themoviedbscraper.o scraper/moviedbscraper/moviedbmovie.o
OBJS += scraper/moviedbscraper/moviedbactor.o

HTTPOBJS += epgdconfig.o webstore.o webdo.o webauth.o webtools.o httpd.o svdrpclient.o

# rules:

all: hlib $(TARGET) $(HTTPTARGET) plugins lv

tvdb: hlib tvdb.c
	$(CC) $(CFLAGS) $(DEFINES) tvdb.c -L./lib -lhorchi $(DLIBS) -o $@

eptest: eptest.c episode.c
	$(CC) $(DEFINES) eptest.c episode.c svdrpclient.c -L./lib -lhorchi $(DLIBS) -o $@

hlib:
	(cd lib && $(MAKE) lib)

$(TARGET) : hlib $(OBJS)
	$(CC) -rdynamic $(OBJS) $(DLIBS) -o $@

$(HTTPTARGET) : hlib $(HTTPOBJS)
	$(CC) -rdynamic $(HTTPOBJS) $(HTTPLIBS) -o $@

lv:
	(cd epglv && $(MAKE))

clean: clean-plugins
	@-rm -f $(OBJS) $(HTTPOBJS) core* *~ */*~ *.so
	@-rm -f scraper/moviedbscraper/*~ scraper/moviedbscraper/*~ scraper/tvdbscraper/*~
	(cd epglv; $(MAKE) clean)
	rm -f $(TARGET) $(ARCHIVE).tgz
	rm -f $(HTTPTARGET) pytst
	rm -f last.json eptst
	(cd lib && $(MAKE) clean)

dist: clean
	@-rm -rf $(TMPDIR)/$(ARCHIVE)
	@mkdir $(TMPDIR)/$(ARCHIVE)
	@cp -a * $(TMPDIR)/$(ARCHIVE)
	@tar czf $(ARCHIVE).tgz -C $(TMPDIR) $(ARCHIVE)
	@-rm -rf $(TMPDIR)/$(ARCHIVE)
	@echo Distribution package created as $(ARCHIVE).tgz

install: install-epgd install-epglv install-epghttpd
	make install-$(INIT_SYSTEM)

install-epgd: hlib $(TARGET) $(HTTPTARGET) install-scripts install-config install-plugins
	install -D $(TARGET) $(_BINDEST)/

install-epghttpd: install-http
	install -D $(HTTPTARGET) $(_BINDEST)/

install-epglv:
	(cd epglv; $(MAKE) install)

install-none:

install-upstart:
	cat contrib/epgd.conf | sed s:"<BINDEST>":"$(BINDEST)":g | sed s:"<PLGDEST>":"$(PLGDEST)":g | install -C -D /dev/stdin $(UPSTARTDEST)/epgd.conf
	chmod a+r $(UPSTARTDEST)/epgd.conf
	cat contrib/epghttpd.conf | sed s:"<BINDEST>":"$(BINDEST)":g | install -C -D /dev/stdin $(UPSTARTDEST)/epghttpd.conf
	chmod a+r $(UPSTARTDEST)/epghttpd.conf

install-systemd:
	cat contrib/epgd.service | sed s:"<BINDEST>":"$(BINDEST)":g | sed s:"<AFTER>":"$(INIT_AFTER)":g | sed s:"<PLGDEST>":"$(PLGDEST)":g | install --mode=644 -C -D /dev/stdin $(SYSTEMDDEST)/epgd.service
	chmod a+r $(SYSTEMDDEST)/epgd.service
	cat contrib/epghttpd.service | sed s:"<BINDEST>":"$(BINDEST)":g | install --mode=644 -C -D /dev/stdin $(SYSTEMDDEST)/epghttpd.service
	chmod a+r $(SYSTEMDDEST)/epghttpd.service
   ifeq ($(DESTDIR),)
		systemctl daemon-reload
   endif

CPPCHECK_SUPPRESS=--suppress=ConfigurationNotChecked --suppress=noOperatorEq --suppress=noCopyConstructor --suppress=useInitializationList --suppress=unmatchedSuppression --suppress=cstyleCast --suppress=missingInclude

cppc:
	cppcheck --enable=all --language=c++ --suppress=unusedStructMember $(CPPCHECK_SUPPRESS) --template="{file}:{line}:1 {severity}:{id}:{message}" --quiet --force --std=c++20 \
	*.[hc] libs/*[hc]

cppcd:
	cppcheck --enable=all --language=c++ $(CPPCHECK_SUPPRESS) --template="{file}:{line}:1 {severity}:{id}:{message}" --quiet --force --std=c++20 \
	*.[hc] libs/*[hc]

#--------------------------------------------------------
# dependencies
#--------------------------------------------------------

HEADER = lib/db.h lib/common.h lib/config.h epgd.h series.h svdrpclient.h lib/curl.h

channelmap.o	 :  channelmap.c  	 $(HEADER)
episode.o		 :  episode.c     	 $(HEADER)

main.o			 :  main.c        	 $(HEADER)
series.o		    :  series.c      	 $(HEADER) series.h
svdrpclient.o   :  svdrpclient.c 	 $(HEADER) svdrpclient.h
update.o        :  update.c      	 $(HEADER)
plugin.o        :  plugin.c      	 $(HEADER)
httpd.o         :  httpd.c       	 $(HEADER) httpd.h
webdo.o         :  webdo.c       	 $(HEADER) httpd.h
webauth.o       :  webauth.c       	 $(HEADER) httpd.h
webtools.o      :  webtools.c    	 $(HEADER) httpd.h

SCRHEADER = lib/curl.h

tvdbmanager.o                                 : $(SCRHEADER) tvdbmanager.h tvdbmanager.c lib/epgservice.h lib/epgservice.c lib/db.h lib/db.c
moviedbmanager.o                              : $(SCRHEADER) moviedbmanager.h moviedbmanager.c lib/epgservice.h lib/epgservice.c lib/db.h lib/db.c
scraper/tvdbscraper/tvdbv4.o                  : $(SCRHEADER) scraper/tvdbscraper/tvdbv4.c scraper/tvdbscraper/tvdbv4.h
scraper/tvdbscraper/tvdbscraper.o             : $(SCRHEADER) scraper/tvdbscraper/tvdbscraper.h scraper/tvdbscraper/tvdbscraper.c scraper/tvdbscraper/tvdbseries.h
scraper/tvdbscraper/tvdbseries.o              : $(SCRHEADER) scraper/tvdbscraper/tvdbseries.h scraper/tvdbscraper/tvdbseries.c
scraper/moviedbscraper/themoviedbscraper.o    : $(SCRHEADER) scraper/moviedbscraper/themoviedbscraper.h scraper/moviedbscraper/themoviedbscraper.c scraper/moviedbscraper/moviedbmovie.h scraper/moviedbscraper/moviedbactor.h
scraper/moviedbscraper/moviedbmovie.o         : $(SCRHEADER) scraper/moviedbscraper/moviedbmovie.h scraper/moviedbscraper/moviedbmovie.c scraper/moviedbscraper/moviedbactor.h lib/fuzzy.h
scraper/moviedbscraper/moviedbactors.o        : $(SCRHEADER) scraper/moviedbscraper/moviedbactor.h scraper/moviedbscraper/moviedbactor.c
lib/fuzzy.o                                   : lib/fuzzy.h lib/fuzzy.c

# ------------------------------------------------------
# Plugins
# ------------------------------------------------------

plugins:
	@find $(PLGSRCDIR) -maxdepth 1 -type d -name "[a-z0-9]*" -exec \
	    $(MAKE) \-\-no-print-directory -C {} \;

clean-plugins:
	@find $(PLGSRCDIR) -maxdepth 1 -type d -name "[a-z0-9]*" -exec \
	    $(MAKE) \-\-no-print-directory -C {} clean \;

install-plugins: plugins
	mkdir -p "$(_PLGDEST)"
	for i in ${PLGSRCDIR}/*/Makefile; do\
       grep -q "PLUGIN.*=" "$$i" || continue;\
	    i=`dirname $$i`;\
	    (cd "$$i" && $(MAKE) install);\
	done;

# ------------------------------------------------------
# Install
# ------------------------------------------------------

install-scripts:
	if ! test -d $(_BINDEST); then \
		mkdir -p $(_BINDEST); \
	   chmod a+rx $(_BINDEST); \
	fi
	install -D ./scripts/epgd-*[!~] $(_BINDEST)/
	install -D ./scripts/epgh-*[!~] $(_BINDEST)/
	install -D ./scripts/epgsearchdone.pl $(_BINDEST)/

install-http:
	(cd "http/" && make fullinstall)

install-config:
	if ! test -d $(CONFDEST); then \
	   mkdir -p $(CONFDEST); \
	   chmod a+rx $(CONFDEST); \
	fi
	install --mode=644 -D ./configs/getupdflg.sql $(CONFDEST)
	install --mode=644 -D ./configs/getcrosslvr.sql $(CONFDEST)
	install --mode=644 -D ./configs/getlvrmin.sql $(CONFDEST)
	install --mode=644 -D ./configs/mergeepg.sql $(CONFDEST)
	install --mode=644 -D ./configs/reverseepg.sql $(CONFDEST)
	install --mode=644 -D ./configs/thetvdbview.sql $(CONFDEST)
	install --mode=644 -D ./configs/epg.dat $(CONFDEST)

	for i in ./configs/eventsview*.sql; do\
      install --mode=644 -D "$$i" $(CONFDEST)/; \
	done;
	if ! test -f $(CONFDEST)/epgd.conf; then \
	   install --mode=644 -D ./configs/epgd.conf $(CONFDEST)/; \
	fi
	if ! test -f $(CONFDEST)/recording.py; then \
	   install --mode=644 -D ./configs/recording.py $(CONFDEST)/; \
	else \
	   install --mode=644 -D ./configs/recording.py $(CONFDEST)/recording.py.dist; \
	fi
	if ! test -f $(CONFDEST)/channelmap.conf; then \
	   install --mode=644 -D ./configs/channelmap.conf $(CONFDEST)/; \
	fi

# ------------------------------------------------------
# Git / Versioning / Tagging
# ------------------------------------------------------

vcheck:
	git fetch
	if test "$(LASTTAG)" = "$(VERSION)"; then \
		echo "Warning: tag/version '$(VERSION)' already exists, update HISTORY first. Aborting!"; \
		exit 1; \
	fi

push: vcheck
	echo "tagging git with $(VERSION)"
	git push
	git tag $(VERSION)
	git push --tags

commit: vcheck
	git commit -m "$(LASTCOMMENT)" -a

git: commit push

showv:
	@echo "Git ($(BRANCH)):\\n  Version: $(LASTTAG) (tag)"
	@echo "Local:"
	@echo "  Version: $(VERSION)"
	@echo "  Change:"
	@echo -n "   $(LASTCOMMENT)"

upd: update

update:
	git pull
	@make clean install
	systemctrl restart epgd
	systemctrl restart epghttpd
