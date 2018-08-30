var mongoose = require('mongoose');

var visitorChatSchema = new mongoose.Schema({
    clientId: String,
    ipAddress: String,
    location: {
        country: String,
        state: String,
        city: String,
        zip: String,
        latitude: String,
        longitude: String
    },
    wasServiced: Boolean,
    isVisitorOnline: Boolean,
    chatHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatHistory" }]
}, { timestamps: true });

VisitorChatHistory = mongoose.model('VisitorChatHistory', visitorChatSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = VisitorChatHistory;
