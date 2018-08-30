process.env.NODE_ENV = 'prod';

const express = require('express'),
    path = require('path'),
    http = require('http'),
    bodyParser = require('body-parser'),
    serveStatic = require('serve-static'),
    contentDisposition = require('content-disposition'),
    finalhandler = require('finalhandler'),
    fs = require('fs'),
    config = require('./config/prod.json');

const helpers = require('./helpers'),
    db = require('./db-manager'),
    nsp = require('./nsp-manager');

helpers.displayConfigSummary();

var app = express();
app.use(bodyParser.json({ limit: config.server.bodyParser.limit }));
app.use(bodyParser.urlencoded({ limit: config.server.bodyParser.limit, extended: config.server.bodyParser.isExtended }));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    // res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
    next();
});

var lang = require('./routes/languages'),
    files = require('./routes/files'),
    presentations = require('./routes/presentations'),

    auth = require('./routes/auth'),
    geoIPLocation = require('./routes/getIpGeoLocation'),
    registrars = require('./routes/registrars'),
    organization = require('./routes/organizations'),
    chat = require('./routes/chat-session'),
    nsproute = require('./routes/namespaces'),
    document = require('./routes/document'),
    sendMail = require('./routes/send-mail'),
    maps = require('./routes/maps');

app.use(config.server.api, auth);
app.use(config.server.api, lang);
app.use(config.server.api, files);
app.use(config.server.api, presentations);

app.use(config.server.api, registrars);
app.use(config.server.api, organization);
app.use(config.server.api, geoIPLocation);
app.use(config.server.api, chat);
app.use(config.server.api, nsproute);
app.use(config.server.api, document);
app.use(config.server.api, sendMail);
app.use(config.server.api, maps);


app.use((err, req, res, next) => {
    // log the error...
    res.sendStatus(err.httpStatusCode).json(err)
})

app.get('/', (req,res) => {
    res.send("Invalid page");
})


// Set header to force download
function setHeaders(res, path) {
    res.setHeader('Content-Disposition', contentDisposition(path))
}

// Serve up public folders
var serve = serveStatic(path.join(__dirname, config.server.directory.public), {
    'index': false,
    'maxAge': '1d',
    'setHeaders': setHeaders
})

var server = http.createServer(function onRequest(req, res) {
    app(req, res, function (err) {
        serve(req, res, finalhandler(req, res))
    })
});

var io = require('socket.io')(server);
io.set('transports', ['websocket']);

exports.joinAll = (docs) => {
    docs.forEach(element => {
        createNamespace(element.id);
    });
};

exports.socketEmit = (eventName, eventData, room) => {
    // io.emit(eventName, eventData);
    io.in(room).emit(eventName, eventData);
};

var port = process.env.PORT || 1337;

server.listen(port, function listening() {
    console.log('\t  listening...');
   //  addOrganizationByNameTestFunction('epic', 'Epic Customer Chat')
});

function createNamespace(name) {
    new nsp(io, name);
}

function addOrganizationByNameTestFunction(id, name) {
    var o = {
        id: id,
        name: name,
        contact: '',
        email: '',
        address: '',
        website: '',
        phone: '',
        isLiveVisitorHelp: false,
        namespaces: [],
        visitorChatHistory: []
    };

    const org = require('./models/organization');
    const mongNS = require('./models/namespace');
    var newOrg = new org(o);

    mongNS.find(function (err, docs) {
        if (err) {
            console.error(err);
        } else {
            // console.log(docs);
            docs.map(doc => {

                if (doc.id.indexOf(id) > -1) {
                    console.log(doc);
                    newOrg.namespaces.push(doc);
                }
            })
            newOrg.save();
        }
    }).sort({ id: 1 });
}