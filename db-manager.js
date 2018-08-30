//process.env.NODE_ENV = 'prod';

const config = require('./config/prod.json'),
    mongoose = require('mongoose');

const Namespace = require('./models/namespace'),
    UserProfile = require('./models/user-profile'),
    User = require('./models/user'),
    server = require('./server');
// const url = 'mongodb://localhost:27017/test';

const url = 'mongodb://capient.documents.azure.com:10255/wwtc_dev?ssl=true';
// const url = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}?ssl=${config.db.ssl}`;
// var url = `mongodb://${config.db.username}:${config.db.pass}@${config.db.host}:${config.db.port}/${config.db.name}?ssl=${config.db.ssl}&replicaSet=${config.db.replicaSet}`;

var mongooseOptions = {
    useMongoClient: true,
    user: config.azuredb.username,
    pass: config.azuredb.pass,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};

mongoose.Promise = global.Promise;
mongoose.connect(url, mongooseOptions).then(
    () => {
        console.log('DB connected');
        console.log('Manage namespaces');
        console.log(UserProfile.db.name);
        Namespace.find(function (err, docs) {
            if (err) {
                console.error(err);
            } else {
                server.joinAll(docs);
            }
        });
    },
    err => {
        console.error(err);
    }
);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected');
});

mongoose.connection.on('error', function (err) {
    console.error('Mongoose error', err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected due to application termination');
        process.exit(0);
    });
});



