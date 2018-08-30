#!/bin/sh
forever stop /home/nte/nodejs/server.js
cd /home/nte/nodejs
git fetch --all && git reset --hard origin/tulsatech-2
npm install
gcloud auth activate-service-account --key-file=/home/nte/.config/gcloud/sa_key.json
NODE_ENV=prod forever start -a -l /home/nte/logs/forever.log -o /home/nte/logs/out.log -e /home/nte/logs/err.log server.js
