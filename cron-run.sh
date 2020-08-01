#!/bin/sh
echo $(date) >> /var/www/spotifymap.com/bash_cron_log.txt
/usr/bin/python3 /var/www/spotifymap.com/python/scraper.py >> /var/www/spotifymap.com/bash_cron_log.txt 2>&1
cp -a /var/www/spotifymap.com/python/data/exports/. /var/www/spotifymap.com/src/data/