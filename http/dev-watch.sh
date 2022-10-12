#! /bin/bash

HTTPDEST='/var/epgd/www'

inotifywait -mrq -e modify,moved_to ./src | while read x op f; do\
   if ! [[ "$f" == *"~"* ]]; then
		if [[ "$f" == *".less" ]]; then
			make style
			cp ./www/epgd.css $HTTPDEST/
		elif [[ "$f" == *".js" ]]; then
         echo -------------------------------------------------------------------------------------------------------------------
			make core
			cp ./epgd.full.js $HTTPDEST/epgd.full.js
			cp ./www/epgd.js $HTTPDEST/epgd.js
		fi
      if [[ "$x" == "./src/lang/" ]]; then
			cp ./src/lang/$f $HTTPDEST/lang/
			cp ./src/lang/$f ./www/lang/
      fi
   fi
done
exit
