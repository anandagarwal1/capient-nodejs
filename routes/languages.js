let express = require('express');
let router = express.Router();
var logger = require('../partners/logger');

const mongoose = require('mongoose');
const Language = require('../models/language');

router.get('/languages', function (req, res) {
    console.log('getting languages');
    Language.find(function (err, docs) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).json(docs);
        }
    }).sort({ id: 1 });

});

module.exports = router;
