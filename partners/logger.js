var winston = require('winston');



var options = {
  errorFile: {
    level: 'error',
    name: 'file.error',
    filename: __dirname + '/errorFile',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    prettyPrint: true 
  },
};


var logger = winston.createLogger({
  transports: [
    new (winston.transports.Console)(options.console),
    new (winston.transports.File)(options.errorFile),
  //  new (winston.transports.File)(options.file)
  ],
  exitOnError: false,
});

// var logger = winston.createLogger({
//     transports: [
//       new (winston.transports.Console)({ json: false, timestamp: true }),
//       new winston.transports.File({ filename: __dirname + '/debug.log', json: false })
//     ],
//     exceptionHandlers: [
//       new (winston.transports.Console)({ json: false, timestamp: true }),
//       new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
//     ],
//     exitOnError: false
//   });
  
  module.exports = logger;