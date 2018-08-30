const express = require('express');
const router = express.Router();
const server = require('../server');
const mongoose = require('mongoose');
let User = require('../models/user');
var logger = require('../partners/logger');


// var CryptoJS = require("crypto-js");

router.route('/authenticate')

  .post(function (req, res) {

    var doc = req.body;
    if (doc.username && doc.password) {
      var username = doc.username.toLowerCase();
      console.log('authenticating ', username);
      User.authenticate(username, doc.password, function (error, user) {
        if (error || !user) {
          var err = new Error('Wrong email or password.');
          err.status = 401;
          var errJson = {
            success: false,
            msg: 'Authentication failed. User not found.'
          };
          logger.error(new Date() + ' --- ' + err.errmsg);
          res.status(401).json(errJson);

        } else {
          // req.session.userId = user._id;
          // console.log(user);
          res.status(200).json(user);
        }
      });
    }

  });

module.exports = router;



//POST route for updating data
// router.post('/', function (req, res, next) {
//   // confirm that user typed same password twice
//   if (req.body.password !== req.body.passwordConf) {
//     var err = new Error('Passwords do not match.');
//     err.status = 400;
//     res.send("passwords dont match");
//     return next(err);
//   }

//   if (req.body.email &&
//     req.body.username &&
//     req.body.password &&
//     req.body.passwordConf) {

//     var userData = {
//       email: req.body.email,
//       username: req.body.username,
//       password: req.body.password,
//       passwordConf: req.body.passwordConf,
//     }

//     User.create(userData, function (error, user) {
//       if (error) {
//         return next(error);
//       } else {
//         req.session.userId = user._id;
//         return res.redirect('/profile');
//       }
//     });

//   } else if (req.body.logemail && req.body.logpassword) {
//     User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
//       if (error || !user) {
//         var err = new Error('Wrong email or password.');
//         err.status = 401;
//         return next(err);
//       } else {
//         req.session.userId = user._id;
//         return res.redirect('/profile');
//       }
//     });
//   } else {
//     var err = new Error('All fields required.');
//     err.status = 400;
//     return next(err);
//   }
// })

// GET route after registering
// router.get('/profile', function (req, res, next) {
//   User.findById(req.session.userId)
//     .exec(function (error, user) {
//       if (error) {
//         return next(error);
//       } else {
//         if (user === null) {
//           var err = new Error('Not authorized! Go back!');
//           err.status = 400;
//           return next(err);
//         } else {
//           return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
//         }
//       }
//     });
// });

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
