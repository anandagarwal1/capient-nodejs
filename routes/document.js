const express = require('express');
const router = express.Router();
const Document = require('../models/document');
var logger = require('../partners/logger');

/*
*  call type       : POST
*  body param type : application/json
*  body param      : obj of document.
*  description     : save a document.
*  return          : newly created document id.
*/
router.route('/upload-document')
    .post(function (req, res) {
        console.log(req.body);
        var doc = req.body;
        var document = new Document(doc);
        document.save(function (err, result) {
            if (err) {
                var errorJson = {
                    code: err.code,
                    success: false,
                    msg: 'Something went wrong while upload a document!',
                };
                logger.error(new Date() + ' --- ' + err.errmsg);
                res.status(500).json(errorJson);
            } else {
                res.status(200).json({id: result._id});
            }
        });
    });

/*
*  call type       : GET
*  body param type : application/json
*  body param      : none.
*  description     : get all document's.
*  return          : newly created document id.
*/
router.route('/upload-document')
    .get(function (req, res) {
        Document.find().populate({path: 'ownerId'}).exec(function (err, result) {
            if (err) {
                logger.error(new Date() + ' --- ' + err.errmsg);
                res.status(500).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    });

/*
*  call type       : GET
*  body param type : application/json
*  request param   : ownerId.
*  description     : get all document's of owner.
*  return          : list of document for particular owner.
*/
router.route('/upload-document/:ownerId')
    .get(function (req, res) {
        var ownerId = req.params.ownerId
        Document.find({ownerId: [ownerId]}).populate({path: 'ownerId'}).exec(function (err, result) {
            if (err) {
                logger.error(new Date() + ' --- ' + err.errmsg);
                res.status(500).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    });

module.exports = router;
