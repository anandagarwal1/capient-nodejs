const express = require('express');
const router = express.Router();
var logger = require('../partners/logger');

const Presentation = require('../models/presentation');
const Category = require('../models/category');
const Organization = require('../models/organization');

/*
*  call type       : POST
*  body param type : application/json
*  body param      : obj of presentation.
*  request param   : organization Id.
*  description     : save presentation by owner and mapping with organization for further use.
*  return          : newly created presentation.
*/
router.post('/presentation/:org', function (req, res) {
    var doc = req.body;
    var orgId = req.params.org;
    var presentation = new Presentation(doc);
    presentation.save(function (err, result) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(err);
        } else {
            Organization.findOneAndUpdate({id: orgId}, {$push: {presentations: result}}, function (error, res) {
                if (error) {
                    console.log('organization.findOneAndUpdate..error. =>', error)
                }
            });
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : GET
*  body param type : application/json
*  body param      : none.
*  description     : get all presentation with referenced document.
*  return          : list of all presentation.
*/
router.get('/presentations', function (req, res) {
    Presentation.find().populate({path: 'refDocIds'}).exec(function (err, result) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : POST
*  body param type : application/json
*  body param      : presentation object with edited field's.
*  description     : edit particular presentation.
*  return          : edited presentation.
*/
router.post('/edit-presentation', function (req, res) {
    var prData = req.body;
    Presentation.findByIdAndUpdate(prData._id, prData, {new: true}, function (err, result) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : GET
*  body param type : application/json
*  body param      : none.
*  description     : get list of all categories.
*  return          : list of all categories.
*/
router.get('/categories', function (req, res) {
    Category.find(function (err, result) {
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
*  request param   : presentation name and ownerId.
*  description     : search presentation by name for single owner.
*  return          : list presentation by name.
*/
router.get('/search-by-presentation/:name/:ownerId', function (req, res) {
    var prName = req.params.name;
    var ownerId = req.params.ownerId;
    Presentation.find({category: prName, ownerId: ownerId}).populate({path: 'refDocIds'}).exec(function (err, result) {
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
*  request param   : name of category and ownerId.
*  description     : get list of all presentation by owner and category.
*  return          : List of all presentation of particular owner with particular category.
*/
router.get('/search-by-categories/:name/:ownerId', function (req, res) {
    var categoryName = req.params.name;
    var ownerId = req.params.ownerId;
    Presentation.find({
        category: categoryName,
        ownerId: ownerId
    }).populate({path: 'refDocIds'}).exec(function (err, result) {
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
*  description     : get list of all presentation by owner.
*  return          : list of all presentation of particular owner.
*/
router.get('/presentation-by-owner/:ownerId', function (req, res) {
    var ownerId = req.params.ownerId;
    Presentation.find({ownerId: ownerId}).populate({path: 'refDocIds'}).exec(function (err, result) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});

module.exports = router;
