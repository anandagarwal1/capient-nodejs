const express = require('express')
const router = express.Router()
const Organization = require('../models/organization')
var logger = require('../partners/logger')

/*
*  call type       : POST
*  body param type : application/json
*  body param      : organization modal field's.
*  description     : for create a new organization.
*  return          : create new organization and return newly created organization.
*/
router.post('/add-organization', function (req, res) {
  var orgData = req.body
  var org = new Organization(orgData)
  org.save(orgData, function (err, result) {
    if (err) {
      if (11000 === err.code || 11001 === err.code) {
        var errorJson = {
          code: err.code,
          success: false,
          msg: orgData.organization + ' is already exist. Please try with other name',
        }
        logger.error(new Date() + ' --- ' + err.errmsg)
        res.status(500).json(errorJson)
      } else {
        res.status(500).json(err)
      }
    } else {
      res.status(200).json(result)
    }
  })
})

/*
*  call type       : PUT
*  body param type : application/json
*  body param      : organization modal field's with edited data.
*  description     : for edit organization.
*  return          : updated organization.
*/
router.put('/edit-organization', function (req, res) {
  var orgData = req.body
  orgData.editedAt = new Date()
  Organization.findByIdAndUpdate(orgData._id, orgData, {new: true}, function (err, result) {
    if (err) {
      var errorJson = {
        code: err.code,
        success: false,
        msg: 'Something went wrong when editing organization!',
      }
      logger.error(new Date() + ' --- ' + err.errmsg)
      res.status(500).json(errorJson)
    } else {
      res.status(200).json(result)
    }
  })
})

/*
*  call type       : DELETE
*  body param type : application/json
*  body param      : organization mongoose id.
*  description     : for delete organization.
*  return          : success message
*/
router.delete('/delete-organization', function (req, res) {
  var orgData = req.body
  Organization.findByIdAndRemove(orgData._id, function (error, result) {
    if (error) {
      logger.error(new Date() + ' --- ' + error.errmsg)
      var errorJson = {
        code: err.code,
        success: false,
        msg: 'Something went wrong when deleting organization!',
      }
      res.status(500).json(errorJson)
    } else {
      var successJson = {
        success: true,
        msg: 'Organization deleted successfully!'
      }
      res.status(200).json(successJson)
    }
  })
})

/*
*  call Type       : GET
*  body param type : application/json
*  description     : for get all organization.
*  body param      : none.
*  return          : return all organization of our application
*/
router.get('/get-all-organization', function (req, res) {
  Organization.find(function (error, result) {
    if (error) {
      var errorJson = {
        code: err.code,
        success: false,
        msg: 'Something went wrong when get all organization!',
      }
      logger.error(new Date() + ' --- ' + error.errmsg)
      res.status(500).json(errorJson)
    } else {
      res.status(200).json(result)
    }
  })
})

/*
*  call Type       : POST
*  body param type : application/json
*  description     : set list of admin is online or offline.
*  request param   : organization id, user, isLive.
*  return          : return updated organization.
*/
router.post('/admin-live', function (req, res) {
  var query = {id: req.body.organization}
  var user = req.body.user
  if (req.body.isLive) {
    Organization.findOneAndUpdate(query, {
      $push: {availableAdmin: user._id},
      $set: {isLiveVisitorHelp: req.body.isLive}
    }, {new: true}, function (err, result) {
      if (err) {
        var errorJson = {
          code: err.code,
          success: false,
          msg: 'Something went wrong when updating admin is online or offline!',
        }
        res.status(500).json(errorJson)
        logger.error(new Date() + ' --- ' + err.errmsg)
        console.log('Something wrong when updating data!')
      } else {
        res.status(200).json(result)
      }
    })
  } else {
    Organization.findOneAndUpdate(query, {$pull: {availableAdmin: user._id}}, {new: true}, function (err, doc) {
      if (err) {
        var errorJson = {
          code: err.code,
          success: false,
          msg: 'Something went wrong when updating admin is online or offline!',
        }
        logger.error(new Date() + ' --- ' + err.errmsg)
        res.status(500).json(errorJson)
        console.log('Something wrong when updating data!')
      } else {
        var orgObject = doc.toObject();
        Organization.findOneAndUpdate(query, {$set: {isLiveVisitorHelp: orgObject.availableAdmin.length > 0}}, {new: true}, function (err, result) {
          if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg)
            var errorJson = {
              code: err.code,
              success: false,
              msg: 'Something went wrong when updating admin is online or offline!',
            }
            res.status(500).json(errorJson)
          } else {
            res.status(200).json(result)
          }
        })
      }
    })
  }
})

/*
*  call Type       : GET
*  body param type : application/json
*  description     : get list of all online admin by organization.
*  request param   : organization id.
*  return          : return list of chat for requested organization.
*/
router.get('/active-admin/:org', function (req, res) {
  var org = req.params.org
  if (org) {
    Organization.findOne({id: org}).populate({path: 'availableAdmin'}).exec(function (err, result) {
      if (err) {
        logger.error(new Date() + ' --- ' + err.errmsg)
        var errorJson = {
          code: err.code,
          success: false,
          msg: 'Something went wrong when getting list of all active admin!',
        }
        res.status(500).json(errorJson)
      } else {
        res.status(200).json(result)
      }
    })
  }
})

module.exports = router