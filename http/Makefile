#
# Makefile
#
# See the README file for copyright information and how to reach the author.
#
#

include ../Make.config

# web interface (www, no build step) -> $(HTTPDEST)/
#   an optional ./custom.css is installed as css/custom.css (own css, loaded after epgd.css)

all:

install:
	mkdir -p $(HTTPDEST)
	cp -r ./www/. $(HTTPDEST)/
	cp -u ../HISTORY.h ../TODO $(HTTPDEST)/
	@if test -f ./custom.css; then cp ./custom.css $(HTTPDEST)/css/custom.css; fi

install-new: install
