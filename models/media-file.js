var mongoose = require('mongoose');

var MediaFileSchema = new mongoose.Schema({

    userId: String,
    userName: String,
    isPrivate: Boolean,
    name: String,
    size: String,
    type: String,
    data: String
});

MediaFile = mongoose.model('MediaFile', MediaFileSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = MediaFile;