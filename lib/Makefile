#
# Makefile
#
# See the README file for copyright information and how to reach the author.
#

include ../Make.config

LIBTARGET = libhorchi
HLIB      = -L. -lhorchi

DEMO = demo
TEST = tst

LIBOBJS = common.o configuration.o parameters.o thread.o config.o db.o epgservice.o dbdict.o json.o

ifdef USEWOL
   LIBOBJS += wol.o
endif

ifdef USEJPEG
   LIBOBJS += imgtools.o
endif

ifdef USECURL
   LIBOBJS += curl.o
endif

BASELIBS = -lrt -lz -luuid
BASELIBS += $(shell mysql_config --libs_r)

ifdef USECURL
   BASELIBS += -lcurl
endif

ifdef USEEPGS
	LIBOBJS += searchtimer.o
endif

ifdef USEPYTHON
	BASELIBS += $(shell python-config --libs)
   LIBOBJS += python.o
endif

ifdef USELIBXML
   BASELIBS += $(shell xml2-config --libs) $(shell xslt-config --libs)
endif

ifdef SYSD_NOTIFY
   ifdef SYSDLIB_210
       BASELIBS += $(shell pkg-config --libs libsystemd)
       CFLAGS += $(shell pkg-config --cflags libsystemd)
   else
       BASELIBS += $(shell pkg-config --libs libsystemd-daemon)
       CFLAGS += $(shell pkg-config --cflags libsystemd-daemon)
   endif
endif

ifdef DEBUG
  CFLAGS += -ggdb -O0
endif

CFLAGS += $(shell mysql_config --include)
DEFINES += $(USES)

ifdef USEPYTHON
	CFLAGS += $(shell python-config --includes)
endif

all: lib $(TEST) $(DEMO)
lib: $(LIBTARGET).a

$(LIBTARGET).a : $(LIBOBJS)
	@echo Building Lib ...
	$(doLib) $@ $(LIBOBJS)

tst: test.o lib
	$(doLink) test.o $(HLIB) -larchive -lcrypto $(BASELIBS) -o $@

demo: demo.o lib
	$(doLink) demo.o $(HLIB) -larchive -lcrypto $(BASELIBS) -o $@

pytst: pytst.o lib
	$(CC) pytst.o $(HLIB) -larchive -lcrypto $(BASELIBS) -o $@

clean:
	rm -f *.o *~ core $(TEST) $(DEMO) $(LIBTARGET).a

cppchk:
	cppcheck --template="{file}:{line}:{severity}:{message}" --quiet --force *.c *.h

%.o: %.c
	@echo Compile "$(*F)" ...
	$(doCompile) $(*F).c -o $@

#--------------------------------------------------------
# dependencies
#--------------------------------------------------------

HEADER = db.h common.h config.h dbdict.h

common.o          :  common.c           $(HEADER) common.h
configuration.o   :  configuration.c    $(HEADER) configuration.h
parameters.o      :  parameters.c       $(HEADER) parameters.h
thread.o     		:  thread.c      		 $(HEADER) thread.h
curl.o       		:  curl.c        		 $(HEADER) curl.h
imgtools.o   		:  imgtools.c    		 $(HEADER) imgtools.h
config.o     		:  config.c      		 $(HEADER) config.h
db.o         		:  db.c          		 $(HEADER) db.h
epgservice.o 		:  epgservice.c  		 $(HEADER) epgservice.h
dbdict.o     		:  dbdict.c      		 $(HEADER) dbdict.h
json.o       		:  json.c        		 $(HEADER) json.h
python.o          :  python.c           $(HEADER) python.h
searchtimer.o     :  searchtimer.c      $(HEADER) searchtimer.h
wol.o             :  wol.c              $(HEADER) wol.h

demo.o       		:  demo.c        		 $(HEADER)
test.o       		:  test.c        		 $(HEADER)
pytst.o       		:  pytst.c            $(HEADER)
