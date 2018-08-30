const express = require('express');
const router = express.Router();
const Organization = require('../models/organization');
const VChatHistory = require('../models/visitor-chat-history');
var logger = require('../partners/logger');

/*
*  call type       : GET
*  body param type : application/json
*  request param   : organization id.
*  description     : check chat possible or not with organization based on admin is online or offline.
*  return          : organization object with few required details.
*/
router.get('/chat/available/:org', function (req, res) {
    var org = req.params.org;
    if (org) {
        Organization.findOne(
            {id: org},
            '-_id -updatedAt -createdAt -contact -email -address -website -phone -visitorChatHistory -namespaces',
            function (err, obj) {
                if (err) {
                    logger.error(new Date() + ' --- ' + err.errmsg);
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.status(200).json(obj);
                }
            });
    }
});

/*
*  call Type       : GET
*  body param type : application/json
*  description     : get list of all support chat by organization.
*  request param   : organization id.
*  return          : return list of chat for requested organization.
*/
router.get('/get-organization-support-chat/:org', function (req, res) {
    var org = req.params.org;
    Organization.findOne({id: org}).populate({
        path: 'visitorChatHistory',
        populate: {path: 'chatHistory'}
    }).exec(function (err, result) {
        if (err) {
            logger.error(new Date() + ' --- ' + err.errmsg);
            res.status(500).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});
/*
*  call Type       : GET
*  body param type : application/json
*  description     : get organization information from key
*  request param   : unique key to get namespace and organization.
*  return          : organization.
*/
router.get('/get-organization-namespace/:key', function (req, res) {
  var org = req.params.key;
  if (org) {
    Organization.findOne(
      {id: org},
      ' -updatedAt -createdAt -contact -email -address -website -phone -visitorChatHistory -availableAdmin -presentations').populate('namespaces').exec(
      function (err, obj) {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.status(200).json(obj);
        }
      });
  }
});
/*
*  call Type       : POST
*  body param type : application/json
*  description     : set chat completed with visitor.
*  request param   : visitor chat id.
*  return          : return updated visitor chat.
*/
router.post('/chat-completed', function (req, res) {
    var cId = req.body.chatId;
    if (cId) {
        VChatHistory.findOneAndUpdate({'clientId': cId}, {wasServiced: true}, {new: true}, function (err, result) {
            if (err) {
                logger.error(new Date() + ' --- ' + err.errmsg);
                res.status(500).send(err);
            } else {
                res.status(200).json(result);
            }
        });
    }
});


module.exports = router;
