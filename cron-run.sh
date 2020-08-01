#!/bin/sh
echo $(date) >> /bash_cron_log.txt
/usr/bin/python3 /var/www/spotifymap.com/python/scraper.py >> /bash_cron_log.txt