var mongoose = require('mongoose');

var PresentationSchema = new mongoose.Schema({

    ownerId: String,
    ownerName: String,
    name: String,
    category: String,
    description: String,
    dateUpdated: Date,
    refDocIds: [{type: mongoose.Schema.Types.ObjectId, ref: "Document"}]
}, {timestamps: true});

Presentation = mongoose.model('Presentation', PresentationSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Presentation;