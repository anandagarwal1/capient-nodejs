var mongoose = require('mongoose');

var documentSchema = new mongoose.Schema({
    ownerId: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    name: String,
    size: String,
    type: String,
    content: String
}, {timestamps: true});

document = mongoose.model('Document', documentSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = document;




