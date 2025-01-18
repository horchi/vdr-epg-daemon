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

#THEME=humanity
THEME=darkness
#THEME=vader
#THEME=start
#THEME=overcast
#THEME=dark-hive
#THEME=hot-sneaks
#THEME=black-tie
#THEME=south-street
#THEME=tronastic

JQUERY_UI = ./3rdParty/jquery-ui-1.11.4.custom.$(THEME)

all: theme core common lang style

# baut aus allen JS-Files innerhalb von src/js/ eine gesamt Javascriptdatei -> www/epgd.js

core:
	@echo "var epgd = {};" >  ./epgd.full.js
	@cat ./src/lang/$(DEFAULT_LANG).js >>  ./epgd.full.js
	@cat ./src/js/*.js >>  ./epgd.full.js
	@java -jar tools/yuicompressor-2.4.8.jar ./epgd.full.js -o ./www/epgd.js -v
	#cat ./epgd.full.js >> ./www/epgd.js

# baut aus allen benötigten 3rdParty-scripten eine gesamt Javascriptdatei -> www/common.js

common:
#	cat ./3rdParty/modernizr.custom.js > ./www/common.js
	cat ./3rdParty/jquery-2.2.3.min.js > ./www/common.js
	cat $(JQUERY_UI)/jquery-ui.min.js >> ./www/common.js
	cat ./3rdParty/jQuery-Timepicker-Addon-master/dist/jquery-ui-timepicker-addon.min.js >> ./www/common.js
#  cat ./3rdParty/jQuery-jQuery-UI-Plugin-For-Simle-Tokenized-Autocomplete-Autocomplete-Multiselect/src/jquery.autocomplete.multiselect.js >> ./www/common.js
	cat ./3rdParty/jquery.ui.touch-punch.min.js >> ./www/common.js
	cat ./3rdParty/jquery-scrollstop-master/jquery.scrollstop.min.js >> ./www/common.js
	cat ./3rdParty/yaMD5/yamd5.min.js >> ./www/common.js
	cp ./3rdParty/fontello/font/* ./www/font/
	cp ./3rdParty/fontello/LICENSE.txt ./www/font/

# kopiert alle Sprachrelevanten Dateien nach www/lang

lang:
	cp -ua ./src/lang/* ./www/lang/

theme:
	rm -f ./www/images/ui-*
	cp $(JQUERY_UI)/images/* ./www/images
	grep 'To view and modify this theme' $(JQUERY_UI)/jquery-ui.css | \
		sed s/".*themeroller.."/""/ | \
		sed -e s/"&"/"\n"/g | \
		sed -E s/"([^=]+)=(.*)"/"@ui-\1: \2;"/g | \
		sed -E s/" ([a-f0-9]{6})"/" #\1"/g | \
		grep -v "ui-ffDefault" \
		> src/css/default.less

# baut das default-theme und hinter dann auch ggf. weitere themes

style:
	rm -f ./3rdParty/jquery-ui-1.11.4.custom
	ln -s `basename $(JQUERY_UI)` ./3rdParty/jquery-ui-1.11.4.custom
	$(LESS_Compiler) -f ./tools/less-rhino-1.7.0.js ./tools/lessc-rhino-1.7.0.js --ru ./src/css/theme/default.less ./www/epgd.css

fullinstall : all install

install: install-env install-core install-lang install-font install-images

install-core:
	$(shell sed "s/%VERSION%/$(VERSION)/g" ./www/index.html > $(HTTPDEST)/index.html)
	cp -u ./www/epgd.js ./www/common.js ./www/favicon.ico $(HTTPDEST)/
	cp ./www/epgd.css $(HTTPDEST)/
	if test -f ./custom.css; then \
	    cat ./custom.css >> $(HTTPDEST)/epgd.css; \
	fi
	cp -u ../HISTORY.h $(HTTPDEST)/
	cp -u ../TODO $(HTTPDEST)/

install-lang:
	cp -ua ./www/lang/* $(HTTPDEST)/lang

install-font:
	cp -ua ./www/font/* $(HTTPDEST)/font

install-images:
	cp -ua ./www/images/* $(HTTPDEST)/images

install-env:
	@if ! test -d $(HTTPDEST); then \
		mkdir -p "$(HTTPDEST)"; \
		chmod a+rx $(HTTPDEST)/; \
	fi
	@if ! test -d $(HTTPDEST)/lang/; then \
		mkdir -p "$(HTTPDEST)/lang/"; \
		chmod a+rx $(HTTPDEST)/lang/; \
	fi
	@if ! test -d $(HTTPDEST)/font/; then \
		mkdir -p "$(HTTPDEST)/font/"; \
		chmod a+rx $(HTTPDEST)/font/; \
	fi
	@if ! test -d $(HTTPDEST)/images/; then \
		mkdir -p "$(HTTPDEST)/images/"; \
		chmod a+rx $(HTTPDEST)/images/; \
	fi


# https://jqueryui.com/download/#!version=1.11.4&components=1111111111111111111110000000000000000&zThemeParams=5d00008000e705000000000000003d8888d844329a8dfe02723de3e5701dc2cb2be0d98fe676bb46e85f3aa40c252a04b46f31562b0c806bd69f170762738b5397e133b132fe145d787e5ad5f6687b3e2fe39ebde1adf367a4dd23c595bf575aa368f41efe7ba104f8b2b474cc8ec6611e769a951b66e3c70e8268333419550d639e6a1e59b8c2f643b13b3d3f9c43eded892b613c0481985f9926a7a12f6acb61b179d33739b709ecc42656db78333df23a79cc2e9e44dd43223360bd7c1a8288e69afddc5ce632275c2382051d3325a2d6d4d3f5ba856eb9da8a390005ffac23fc020dcae25c4f3175797e6a39e2214ec32f0d9b45b2ac326b607031b09e95914759f919acde4bccf23e226717430062e95f35f0c90be401ef3eac71106fa99c6efb73290f982407c8037239f2dda9ca7b94da194e907a3b845f40b980bf01cfa3a2e190436e5fbd4b2c5f126f270843181bedf3d9866fd92d3433b20a0491082a5499b010d26cd907829aee63d41cd99674a5a85adfe4806fefb500becca6477bb5d54b7ccc64da364fb9127508ed2657afa8db823c0e569126011d1b302a5006dc73d4072bfc9c5b303c5921ca3be3a9423d7b8c82fb4361570681cc31865f8cfcef0c4a76e61b4e1f8356e37a560077d709375d023ffa791899bc8837f17cf976063affffe15b6707
