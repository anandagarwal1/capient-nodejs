let express = require('express');
let router = express.Router();
var logger = require('../partners/logger');

const mongoose = require('mongoose');
const Namespace = require('../models/namespace');

router.route('/nsp')

    .post(function (req, res) {
        var doc = req.body;
        var nsp = new Namespace(doc);
        nsp.save(function (err, doc) {
            if (err) {
                logger.error(new Date() + ' --- ' + err.errmsg);
                console.error(err);
                res.status(500).json(err.json);
            } else {
                res.status(200).json(doc);
            }
        });
    })

    .get(function (req, res) {
        Namespace.find(function (err, docs) {
            if (err) {
                logger.error(new Date() + ' --- ' + err.errmsg);
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.status(200).json(docs);
            }
        });
    });

module.exports = router;
