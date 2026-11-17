#! /bin/bash

HTTPDEST='/var/epgd/www'

inotifywait -mrq -e modify,moved_to ./src | while read x op f; do\
   if ! [[ "$f" == *"~"* ]]; then
		if [[ "$f" == *".less" ]]; then
			make style
			cp ./www-old/epgd.css $HTTPDEST/old/
		elif [[ "$f" == *".js" ]]; then
         echo -------------------------------------------------------------------------------------------------------------------
			make core
			cp ./epgd.full.js $HTTPDEST/old/epgd.full.js
			cp ./www-old/epgd.js $HTTPDEST/old/epgd.js
		fi
      if [[ "$x" == "./src/lang/" ]]; then
			cp ./src/lang/$f $HTTPDEST/old/lang/
			cp ./src/lang/$f ./www-old/lang/
      fi
   fi
done
exit
