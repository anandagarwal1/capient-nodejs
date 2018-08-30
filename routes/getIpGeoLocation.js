const express = require('express');
const config = require('config');
const router = express.Router();
const http = require('http');
const forwarded = require('forwarded-for');

/*
*  call type       : GET
*  body param type : application/json
*  body param      : none.
*  description     : get user information using ip address.
*  return          : user information list.
*/
router.get("/ip-geo-location", function (client_req, client_res) {
    var remoteIp = '139.130.4.5'; // test ip

    if (process.env.NODE_ENV === 'prod') {
        var remoteIp = getClientIP(client_req);
        remoteIp = remoteIp.substring(remoteIp.lastIndexOf(':'), remoteIp.length);
    }

    const proxy = http.get(`http://api.ipstack.com/${remoteIp}?access_key=${config.ipstack.accessKey}`, function (res) {
        res.pipe(client_res, {
            end: true
        });
    });

    client_req.pipe(proxy, {
        end: true
    });
});

function getClientIP(req) {
    var address = forwarded(req, req.headers);
    return address;
}

module.exports = router;