const express = require('express');
const router = express.Router();
const User = require('../models/user');
var logger = require('../partners/logger');

/*
*  call type       : POST
*  body param type : application/json
*  body param      : user object.
*  description     : add new registrars.
*  return          : return newly created registrars.
*/
router.post('/addRegistrars', function (req, res) {
    var userData = req.body;
    User.find({organization: userData.organization, username: userData.username}, function (err, resUser) {
        if (err) {
            var errorJson = {
                code: err.code,
                success: false,
                msg: 'Something went wrong please try again later!',
            };
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(errorJson);
        } else {
            if (resUser == [] || resUser == null || resUser == undefined || resUser == {} || resUser == '[]') {
            } else {
                var user = new User(userData);
                user.save(userData, function (err, resUser) {
                    if (err) {
                        if (11000 === err.code || 11001 === err.code) {
                            var errorJson = {
                                code: err.code,
                                success: false,
                                msg: user.username + ' is already exist. Please try with other name!',
                            };
                            res.status(500).json(errorJson);
                          //  logger.console('2' + err);
                            logger.error(new Date() + ' --- ' + err.errmsg);
                        }
                        else {
                            var errorJson = {
                                code: err.code,
                                success: false,
                                msg: 'Unable to save user!',
                            };
                            logger.error(new Date() + ' --- ' + err.errmsg);
                            res.status(500).json(errorJson);
                        }
                    } else {
                        res.status(200).json(resUser);
                    }
                });
            }
        }
    });
});

/*
*  call type       : PUT
*  body param type : application/json
*  body param      : user object with edited field's.
*  description     : edit registrars.
*  return          : return edited registrars.
*/
router.put('/editRegistrars', function (req, res) {
    var userData = req.body;
    userData.editedAt = new Date();
    User.findByIdAndUpdate(userData._id, userData, {new: true}, function (err, result) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : POST
*  body param type : application/json
*  body param      : user id.
*  description     : reset password.
*  return          : return edited password user object.
*/
router.post('/reset-password', function (req, res) {
    var userData = req.body;
    console.log('reqqq', req.body);
    User.findByIdAndUpdate(userData._id, {'password': userData.password}, {new: true}, function (err, result) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(err);
        } else {
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : DELETE
*  body param type : application/json
*  body param      : user id.
*  description     : delete registrars.
*  return          : return success message.
*/
router.delete('/deleteRegistrars', function (req, res) {
    var userData = req.body;
    User.findByIdAndRemove(userData._id, function (error, result) {
        if (error) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(error);
        } else {
            var successJson = {
                success: true,
                msg: 'User deleted successfully!'
            };
            res.status(200).json(successJson);
        }
    });
});

/*
*  call type       : GET
*  body param type : application/json
*  body param      : organization id.
*  description     : get list of all user for particular organization.
*  return          : return list of all user.
*/
router.get('/get-users-by-organization', function (req, res) {
    var orgName = req.query.organization;
    User.find({organization: orgName}, function (error, result) {
        if (error) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(error);
        } else {
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : GET
*  body param type : application/json
*  body param      : organization id.
*  description     : get list of all teacher for particular organization.
*  return          : return list of all teacher.
*/
router.get('/get-teachers-by-organization', function (req, res) {
    var orgName = req.query.organization;
    User.find({organization: orgName, isPresenter: true}, function (error, result) {
        if (error) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(error);
        } else {
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : GET
*  body param type : application/json
*  body param      : organization id.
*  description     : get list of all student for particular organization.
*  return          : return list of all student.
*/
router.get('/get-students-by-organization', function (req, res) {
    var orgName = req.query.organization;
    User.find({organization: orgName, isPresenter: false, isAdministrator: false}, function (error, result) {
        if (error) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(error);
        } else {
            res.status(200).json(result);
        }
    });
});

/*
*  call type       : GET
*  body param type : application/json
*  body param      : organization id.
*  description     : get list of all admin for particular organization.
*  return          : return list of all admin.
*/
router.get('/get-admins-by-organization', function (req, res) {
    var orgName = req.query.organization;
    User.find({organization: orgName, isAdministrator: true}, function (error, result) {
        if (error) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).json(error);
        } else {
            res.status(200).json(result);
        }
    });
});

module.exports = router;