#
# Makefile
#
# See the README file for copyright information and how to reach the author.
#
#

include ../Make.config

LESS_Compiler = /usr/bin/rhino
DEFAULT_LANG = de
VERSION = $(shell grep 'define _VERSION ' ../HISTORY.h | awk '{ print $$3 }' | sed -e 's/[";]//g')

# to change the theme install rhino and java:
#  apt install default-jre rhino
# download the theme if not already in ./3rdParty
#  https://jqueryui.com/download/
# and copy to ./3rdParty (follow the naming scheme!)
# rebuild UI by (in http folder)
#  make; make install

# select (add) the theme here

THEME=darkness
#THEME=dot-luv
#THEME=humanity
#THEME=vader
#THEME=start
#THEME=overcast
#THEME=dark-hive
#THEME=hot-sneaks
#THEME=black-tie
#THEME=south-street
#THEME=tronastic

JQUERY_UI_VERSION = 1.11.4

# on VERSION change patch also "./src/css/theme/default.less"

JQUERY_UI = ./3rdParty/jquery-ui-$(JQUERY_UI_VERSION).custom.$(THEME)

all: theme core common lang style

# baut aus allen JS-Files innerhalb von src/js/ eine gesamt Javascriptdatei -> www-old/epgd.js

core:
	@echo "var epgd = {};" > ./epgd.full.js
	@cat ./src/lang/$(DEFAULT_LANG).js >> ./epgd.full.js
	@cat ./src/js/*.js >> ./epgd.full.js
	@java -jar tools/yuicompressor-2.4.8.jar ./epgd.full.js -o ./www-old/epgd.js -v

# baut aus allen benötigten 3rdParty-scripten eine gesamt Javascriptdatei -> www-old/common.js

common:
	cat ./3rdParty/jquery-2.2.3.min.js > ./www-old/common.js
	cat $(JQUERY_UI)/jquery-ui.min.js >> ./www-old/common.js
	cat ./3rdParty/jQuery-Timepicker-Addon-master/dist/jquery-ui-timepicker-addon.min.js >> ./www-old/common.js
#  cat ./3rdParty/jQuery-jQuery-UI-Plugin-For-Simle-Tokenized-Autocomplete-Autocomplete-Multiselect/src/jquery.autocomplete.multiselect.js >> ./www-old/common.js
	cat ./3rdParty/jquery.ui.touch-punch.min.js >> ./www-old/common.js
	cat ./3rdParty/jquery-scrollstop-master/jquery.scrollstop.min.js >> ./www-old/common.js
	cat ./3rdParty/yaMD5/yamd5.min.js >> ./www-old/common.js
	cp ./3rdParty/fontello/font/* ./www-old/font/
	cp ./3rdParty/fontello/LICENSE.txt ./www-old/font/

# kopiert alle Sprachrelevanten Dateien nach www-old/lang

lang:
	cp -ua ./src/lang/* ./www-old/lang/

theme:
	rm -f ./www-old/images/ui-*
	cp $(JQUERY_UI)/images/* ./www-old/images
	grep 'To view and modify this theme' $(JQUERY_UI)/jquery-ui.css | \
		sed s/".*themeroller.."/""/ | \
		sed -e s/"&"/"\n"/g | \
		sed -E s/"([^=]+)=(.*)"/"@ui-\1: \2;"/g | \
		sed -E s/" ([a-f0-9]{6})"/" #\1"/g | \
		grep -v "ui-ffDefault" \
		> src/css/default.less

# baut das default-theme und hinter dann auch ggf. weitere themes

style:
	rm -f ./3rdParty/jquery-ui-$(JQUERY_UI_VERSION).custom
	ln -s `basename $(JQUERY_UI)` ./3rdParty/jquery-ui-$(JQUERY_UI_VERSION).custom
	$(LESS_Compiler) -f ./tools/less-rhino-1.7.0.js ./tools/lessc-rhino-1.7.0.js --ru ./src/css/theme/default.less ./www-old/epgd.css

fullinstall : all install

# Installation:
#   neues Web-Interface (www, kein Build-Schritt)      -> $(HTTPDEST)/
#   altes Web-Interface (www-old, jQuery UI)           -> $(HTTPDEST)/old/

OLDDEST = $(HTTPDEST)/old

install: install-new install-old

install-new:
	mkdir -p $(HTTPDEST)
	cp -r ./www/. $(HTTPDEST)/
	cp -u ../HISTORY.h ../TODO $(HTTPDEST)/
	@if test -f ./custom-next.css; then cp ./custom-next.css $(HTTPDEST)/css/custom.css; fi

install-old: install-env install-core install-lang install-font install-images

install-core:
	$(shell sed "s/%VERSION%/$(VERSION)/g" ./www-old/index.html > $(OLDDEST)/index.html)
	cp -u ./www-old/epgd.js ./www-old/common.js ./www-old/favicon.ico $(OLDDEST)/
	cp ./www-old/epgd.css $(OLDDEST)/
	if test -f ./custom.css; then \
	    cat ./custom.css >> $(OLDDEST)/epgd.css; \
	fi

install-lang:
	cp -ua ./www-old/lang/* $(OLDDEST)/lang

install-font:
	cp -ua ./www-old/font/* $(OLDDEST)/font

install-images:
	cp -ua ./www-old/images/* $(OLDDEST)/images

install-env:
	@for d in $(OLDDEST) $(OLDDEST)/lang $(OLDDEST)/font $(OLDDEST)/images; do \
		if ! test -d $$d; then mkdir -p "$$d"; chmod a+rx $$d; fi; \
	done
