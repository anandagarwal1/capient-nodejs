#!/bin/sh

pm2 start nodejs/server.js 
pm2 startup systemd #startup for managed process on reboot

sudo env PATH=$PATH:/home/nte/.nvm/versions/node/v9.2.0/bin /home/nte/.nvm/versions/node/v9.2.0/lib/node_modules/pm2/bin/pm2 startup systemd -u nte --hp /home/nte