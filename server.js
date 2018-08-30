var express = require('express'),
    path = require('path'),
    http = require('http'),
    bodyParser = require('body-parser'),
    serveStatic = require('serve-static'),
    contentDisposition = require('content-disposition'),
    finalhandler = require('finalhandler'),
    fs = require('fs'),
    config = require('config');


var server = http.createServer(function (request, response) {

    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Hello World!");

});

var port = process.env.PORT || 1337;
server.listen(port);

console.log("Server running at http://localhost:%d", port);