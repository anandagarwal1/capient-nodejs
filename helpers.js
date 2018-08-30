// process.env.NODE_ENV = 'prod';

const fs = require('fs'),
    path = require('path'),
    config = require('config');

exports.displayConfigSummary = function () {
    console.log('\t[environment]');
    console.log(`\t  name: ${config.name}`);
    console.log(`\t  port: ${config.server.port}`);
    console.log(`\t  db: ${config.db.username}`);
    console.log(`\t  gcloud project: ${config.gcloud.projectId}`);
}

exports.milliseconds = function () {
    return new Date().getTime();
};

exports.getMilliseconds = (timestamp, char) => {

    var t = timestamp.split(char, 2);
    var hms = t[0].split(':', 3);
    var hours = +hms[0] * 3600000;
    var minutes = +hms[1] * 60000;
    var seconds = +hms[2] * 1000;
    var milliseconds = +t[1];
    return hours + minutes + seconds + milliseconds;

}

exports.removeFromDisk = function (filePath) {
    fs.unlink(filePath, function (error) {
        if (error) {
            console.error(error);
        } else {
            console.log();
            console.log('file removed: ', filePath);
        }
    });
}

exports.writeToDisk = function (dataURL, fileName) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = 'uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;

    // @todo return the new filename to client
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    console.log('filePath', filePath);
}

exports.getFileInfo = (fp) => {
    let ext = path.extname(fp);
    let basename = path.basename(fp);
    let name = path.basename(fp, path.extname(fp));
    let localpath = path.dirname(fp);
    let fileInfo = {
        name: name,
        ext: ext,
        fullname: basename,
        localpath: localpath
    };
    return fileInfo;
}
