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
	-I/usr/local/include/mysql \
	-L/usr/lib/mysql \
	-L/usr/local/lib/mysql \
	-I/usr/include/mysql \
	$(shell mysql_config --libs) \
	-DMYSQL_DYNAMIC_PLUGIN \
	-DDEBUG_MYSQL=0

CC := gcc

MYSQL_PLGDIR := $(shell mysql_config --plugindir)
TARGET  = mysqlepglv.so
OBJS    = src/epglvbase.o src/epglv.o

all: $(TARGET)

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
