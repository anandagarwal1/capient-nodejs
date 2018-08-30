var mongoose = require('mongoose');
var TranscriptionHistorySchema = new mongoose.Schema({

    username : String,
    user_id : String,
    created_by: String,
    created_dt : String,
	transcription_data : {
        srcText: String,
        timestamp: String,
    }
});

TranscriptionHistory = mongoose.model('TranscriptionHistory', TranscriptionHistorySchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = TranscriptionHistory;