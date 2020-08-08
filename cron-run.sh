#!/bin/sh
cd /var/www/spotifymap.com/python 
echo $(date) > bash_cron_log.txt
/usr/bin/python3 scraper.py > bash_cron_log.txt 2>&1
cp -a data/exports/. /var/www/spotifymap.com/src/data/