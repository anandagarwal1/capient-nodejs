let express = require('express');
let router = express.Router();
var logger = require('../partners/logger');

const mongoose = require('mongoose');
const MediaFile = require('../models/media-file');

router.route('/fms')

    .post(function (req, res) {
        // console.log(req.body);
        var doc = req.body;

        var mediaFile = new MediaFile(doc);
        mediaFile.save(function (err, doc) {
            if (err) {
                logger.error(new Date() + ' --- ' + err.errmsg);
                res.status(500).json(err.json);
            } else {

                res.status(200).json({ id: doc._id });
            }
        });


    })

    .get(function (req, res) {

        MediaFile.find(function (err, docs) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {

                res.status(200).json(docs);
            }
        });

    });

module.exports = router;
