#
# Makefile
#
# See the README file for copyright information and how to reach the author.
#
#

include ../Make.config
LESS_Compiler=/usr/bin/rhino
DEFAULT_LANG=de
VERSION = $(shell grep 'define _VERSION ' ../HISTORY.h | awk '{ print $$3 }' | sed -e 's/[";]//g')

all: core common lang style

# baut aus allen JS-Files innerhalb von src/js/ eine gesamt Javascriptdatei -> www/epgd.js
core:
	@echo "var epgd = {};" >  ./epgd.full.js
	@cat ./src/lang/$(DEFAULT_LANG).js >>  ./epgd.full.js
	@cat ./src/js/*.js >>  ./epgd.full.js
	@java -jar tools/yuicompressor-2.4.8.jar ./epgd.full.js -o ./www/epgd.js -v

# baut aus allen benötigten 3rdParty-scripten eine gesamt Javascriptdatei -> www/common.js
common:
#	cat ./3rdParty/modernizr.custom.js > ./www/common.js
	cat ./3rdParty/jquery-2.2.3.min.js > ./www/common.js
	cat ./3rdParty/jquery-ui-1.11.4.custom/jquery-ui.min.js >> ./www/common.js
	cat ./3rdParty/jQuery-Timepicker-Addon-master/dist/jquery-ui-timepicker-addon.min.js >> ./www/common.js
#	cat ./3rdParty/jQuery-jQuery-UI-Plugin-For-Simle-Tokenized-Autocomplete-Autocomplete-Multiselect/src/jquery.autocomplete.multiselect.js >> ./www/common.js
	cat ./3rdParty/jquery.ui.touch-punch.min.js >> ./www/common.js
	cat ./3rdParty/jquery-scrollstop-master/jquery.scrollstop.min.js >> ./www/common.js
	cat ./3rdParty/yaMD5/yamd5.min.js >> ./www/common.js

	cp ./3rdParty/fontello/font/* ./www/font/
	cp ./3rdParty/fontello/LICENSE.txt ./www/font/

# kopiert alle Sprachrelevanten Dateien nach www/lang
lang:
	cp -ua ./src/lang/* ./www/lang/

# baut das default-theme und hinter dann auch ggf. weitere themes
style:
	$(LESS_Compiler) -f ./tools/less-rhino-1.7.0.js ./tools/lessc-rhino-1.7.0.js --ru ./src/css/theme/default.less ./www/epgd.css



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
