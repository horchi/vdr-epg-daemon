#
# Makefile
#
# See the README file for copyright information and how to reach the author.
#

include ../Make.config

ARCH := $(shell getconf LONG_BIT)

ifneq (,$(findstring "arm", $(shell uname -m)))
	CPP_FLAGS_32 := -m32
	CPP_FLAGS_64 := -m64
endif

CPP_FLAGS := $(CPP_FLAGS_$(ARCH)) -Wall \
	-fPIC \
	$(shell $(SQLCFG) --libs) \
	$(shell $(SQLCFG) --include) \
	-DMYSQL_DYNAMIC_PLUGIN \
	-DDEBUG_MYSQL=0

CC := gcc

# plugin dir of the server (mariadb_config/mysql_config --plugindir reports the one of the client lib!)
#  - can be set by MYSQL_PLGDIR in Make.config or on the command line
#  - otherwise ask the local server binary, fallback to the client config

ifndef MYSQL_PLGDIR
  SQLSERVER := $(firstword $(wildcard /usr/sbin/mariadbd /usr/sbin/mysqld /usr/libexec/mariadbd /usr/libexec/mysqld) $(shell which mariadbd mysqld 2>/dev/null))
  ifneq ($(SQLSERVER),)
    MYSQL_PLGDIR := $(patsubst %/,%,$(shell $(SQLSERVER) --verbose --help 2>/dev/null | awk '/^plugin[-_]dir /{print $$2; exit}'))
  endif
  ifeq ($(MYSQL_PLGDIR),)
    MYSQL_PLGDIR := $(shell $(SQLCFG) --plugindir)
  endif
endif

TARGET  = mysqlepglv.so
OBJS    = src/epglvbase.o src/epglv.o

all: $(TARGET)

show-plugindir:
	@echo $(MYSQL_PLGDIR)

$(TARGET): $(OBJS)
	$(CC) $(CPP_FLAGS) -pipe -O3 -shared -o $(TARGET) $(OBJS)

install: $(TARGET)
	strip $(TARGET)
	if ! test -f $(DESTDIR)/$(MYSQL_PLGDIR)/$(TARGET); then \
	   install -D --mode=644 -t $(DESTDIR)/$(MYSQL_PLGDIR) $(TARGET); \
	fi

forceinstall: $(TARGET)
	strip $(TARGET)
	install -D --mode=644 -t $(DESTDIR)/$(MYSQL_PLGDIR) $(TARGET); \
	$(_BINDEST)/epgd-import-epglv

clean:
	-rm -f $(TARGET) src/*.o src/*~ *~

%.o: %.c
src/%.o: src/%.c
	$(CC) -c $(CPP_FLAGS) -pipe -O3 -shared $< -o $@

#--------------------------------------------------------
# dependencies
#--------------------------------------------------------

src/epglvbase.o  : src/epglvbase.c  src/epglv.h
src/epglv.o      : src/epglv.c      src/epglv.h
