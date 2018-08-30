var mongoose = require('mongoose');

var LanguageSchema = new mongoose.Schema({

    id: String,
    name: String,
    sources: {
        msft: String,
        goog: String,
        deepl: String
    },
    asr: String,
});

Language = mongoose.model('Language', LanguageSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Language;