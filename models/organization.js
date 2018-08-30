var mongoose = require('mongoose');

var OrganizationSchema = new mongoose.Schema({

    id: {type: String, required: true, index: {unique: true}},
    name: {type: String, required: true},
    contact: String,
    email: String,
    address: String,
    website: String,
    phone: String,
    isLiveVisitorHelp: Boolean,
    availableAdmin: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    namespaces: [{type: mongoose.Schema.Types.ObjectId, ref: "Namespace"}],
    visitorChatHistory: [{type: mongoose.Schema.Types.ObjectId, ref: "VisitorChatHistory"}],
    presentations: [{type: mongoose.Schema.Types.ObjectId, ref: "Presentation"}]
}, {timestamps: true});

Organization = mongoose.model('Organization', OrganizationSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Organization;