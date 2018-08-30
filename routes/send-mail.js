const express = require('express');
const router = express.Router();
const nodeMailer = require('nodemailer');
const config = require('config');
var logger = require('../partners/logger');

/*
*  call type       : POST
*  body param type : application/json
*  body param      : to,subject,text,html.
*  description     : send email.
*  return          : return success message.
*/
router.post('/send-email', function (req, res) {
    let transporter = nodeMailer.createTransport({
        host: config.sendEmail.host,
        port: config.sendEmail.port,
        secure: true,
        auth: {
            user: config.sendEmail.user,
            pass: config.sendEmail.pass
        }
    });

    let mailOptions = {
        from: config.sendEmail.from, // sender address
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        text: req.body.body, // plain text body
        html: req.body.html // html body
    };

    transporter.sendMail(mailOptions,
        function (err, result) {
            if (err) {
                logger.error(new Date() + ' --- ' + err.errmsg);
                res.status(500).json(err);
            } else {
                var successJson = {
                    success: true,
                    msg: 'Email send successfully!',
                };
                console.log('Message %s sent: %s', result.messageId, result.response);
                res.status(200).json(successJson);
            }
        });
});

module.exports = router;