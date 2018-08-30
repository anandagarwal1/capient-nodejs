let express = require('express');
let router = express.Router();
var mongoose = require('mongoose');

const TranscriptionHistory = require('../models/transcription-history');


router.post('/addTranscriptionHistory', function (req, res) {
    console.log(req.body);
    var doc = req.body;

    var transcriptionhistory = new TranscriptionHistory(doc);
    transcriptionhistory.save(function (err, doc) {
        if (err) {
            console.error(err);
            res.status(500).json(err.json);
        } else {

            res.status(200).send('OK');
        }
    });
});

router.get('/getTranscriptionHistory', function (req, res) {
    console.log('getting transcription  history');
    TranscriptionHistory.find(function (err, docs) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {

            res.status(200).json(docs);
        }
    });
});

router.get('/getTranscriptionHistoryById', function (req, res) {
    console.log('getting transcription history by userid');
    let id = req.body.id;
    TranscriptionHistory.findById(id, function (err,docs) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {

            res.status(200).json(docs);
        }  
    });
})

module.export = router;