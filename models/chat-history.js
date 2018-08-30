var mongoose = require('mongoose');

var chatHistorySchema = new mongoose.Schema({
    from: String,
    text: String,
    language: {
        id: String,
        name: String,
        localeName: String
    },
    isVisitor: Boolean
}, { timestamps: true });

ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = ChatHistory;
