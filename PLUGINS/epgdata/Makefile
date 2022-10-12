#
# Makefile
#
# See the README file for copyright information and how to reach the author.
#
#

EPGD_SRC ?= ../..

include $(EPGD_SRC)/Make.config

PLUGIN = epgdata

SOFILE = libepgd-epgdata.so
OBJS = epgdata.o

CFLAGS += -I$(EPGD_SRC)

all: $(SOFILE)

$(SOFILE): $(OBJS)
	$(CC) -shared $(OBJS) $(LIBS) -o $@

install: $(SOFILE) install-config
	install -D $(SOFILE) $(_PLGDEST)/

clean:
	@-rm -f $(OBJS) core* *~ *.so

install-config:
	if ! test -d $(CONFDEST); then \
	   mkdir -p $(CONFDEST); \
	   chmod a+rx $(CONFDEST); \
	fi
	if ! test -f $(CONFDEST)/channelmap.conf-epgdata-astra; then \
	   install --mode=644 -D ./configs/channelmap.conf-epgdata-astra $(CONFDEST)/; \
	fi
	for i in $(wildcard ./configs/epgdata*.xml) $(wildcard ./configs/*.xsl); do\
	   if ! test -f "$(CONFDEST)/`basename $$i`"; then\
	      install --mode=644 -D "$$i" $(CONFDEST)/; \
	   fi;\
	done;
	if ! grep -q "^epgdata" $(CONFDEST)/epgd.conf; then \
	   cat ./configs/epgd.conf >> $(CONFDEST)/epgd.conf; \
	fi


#***************************************************************************
# dependencies
#***************************************************************************

epgdata.o : epgdata.c epgdata.h
