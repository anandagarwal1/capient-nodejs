// process.env.NODE_ENV = 'prod';
const config = require('config'),
  MsTranslator = require('mstranslator'),
  Nuance = require('nuance'),
  Translate = require('@google-cloud/translate'),
  path = require('path'),
  fs = require('fs'),
  nodemailer = require('nodemailer'),
  xoauth2 = require('xoauth2')
  var logger = require('./partners/logger');

const http = require('http');
const helpers = require('./helpers'),
  eventName = require('./models/enums').EventName,
  onEvent = require('./models/enums').OnEvent,
  ndevHelper = require('./partners/ndev/helper'),
  organization = require('./models/organization'),
  chatHistory = require('./models/chat-history'),
  visitorChat = require('./models/visitor-chat-history');

var msft = new MsTranslator({ api_key: config.msft.speech.translateKey }, true),
  ndev = new Nuance(config.ndev.appID, config.ndev.appKey)

var languages = []
var chats = []

const keyFilename = path.join(__dirname, '..', config.gcloud.keyFilename)
console.log(keyFilename)
var gct = Translate({
  projectId: config.gcloud.projectId,
  keyFilename: keyFilename
})

/**
 * @class
 * @param {SocketIO.Server} io SocketIO.Server reference
 * @param {string} namespace
 */

function NSP(io, namespace) {

  console.log(`Namespace <${namespace}> created`)

  var nsp = io.of('/' + namespace)

  nsp.on(onEvent.CONNECTION, (socket) => {

    console.log(`${socket.client.id} connected to  ${namespace}`)

    socket.on(onEvent.DISCONNECT, function () {
      console.log(`${socket.client.id} disconnected from ${namespace}`);
      setVisitorOffline();
    })

    socket.on(onEvent.LANGUAGE_JOIN, function (id) {
      console.log('joining ', id)
      socket.join(id)
      if (languages.indexOf(id) == -1 && id !== 'en') {
        languages.push(id)
      }
    })

    socket.on(onEvent.LANGUAGE_LEAVE, function (id) {
      console.log('leaving ', id)
      socket.leave(id)
    })

    socket.on(onEvent.SOURCE_TEXT, message => {

      console.log('<socket.on> source-text', message)

      const millis = helpers.milliseconds()
      const customRequestID = `presenter-${message.alias}-${millis}`

      languages.forEach(function (destlang) {

        if (destlang === 'my' || destlang === 'am' || destlang === 'pa') {

          gct.translate(message.srcText, destlang)
            .then(results => {
              let translations = results[0]
              translations = Array.isArray(translations)
                ? translations
                : [translations]

              console.log('Translations:')
              translations.forEach((translation, i) => {
                console.log(`${message.srcText} => (${destlang}) ${translation}`)
                message.destLang = destlang
                message.translation = translation
                nsp.to(destlang).emit(eventName.TRANSLATION, message)
              })
            })
            .catch(err => {
              console.error('ERROR:', err)
            })
        } else {
          var params = {
            text: message.srcText,
            from: message.srcLang,
            to: destlang,
            category: 'generalnn'
          }

          msft.translate(params, function (err, data) {

            message.destLang = destlang
            message.translation = data
            nsp.to(destlang).emit(eventName.TRANSLATION, message)

            if (message.ttsEnabled) {

              ndevTextToSpeechRequest(destlang, 'F', customRequestID, data, false)

            }
          })
        }
      })
    })

    socket.on(onEvent.AUDIENCE_MSG, message => {
      const millis = helpers.milliseconds()
      const customRequestID = `audience-${message.alias}-${millis}`
      console.log('<socket.on> audience-message', message)

      if (message.srcLang === 'my') {

        var options = {
          from: message.srcLang,
          to: message.destLang
        }

        gct.translate(message.srcText, options)
          .then(results => {
            let translations = results[0]
            translations = Array.isArray(translations)
              ? translations
              : [translations]

            console.log('Translations:')
            translations.forEach((translation, i) => {
              console.log(`${message.srcText} => (${message.destLang}) ${translation}`)
              message.translation = translation
              nsp.emit(eventName.FROM_AUDIENCE, message)
              // nsp.emit('from-audience', { alias: message.alias, destLang: 'en', translation: data, srcText: message.message, srcLang: message.srcLang });

            })
          })
          .catch(err => {
            console.error('ERROR:', err)
          })
      } else {

        var params = {
          text: message.srcText,
          from: message.srcLang,
          to: message.destLang,
          category: 'generalnn'
        }
        msft.translate(params, function (err, translation) {
          console.log(`${message.srcText} => (${message.destLang}) ${translation}`)
          message.translation = translation
          nsp.emit(eventName.FROM_AUDIENCE, message)

        })

      }
    })

    socket.on(onEvent.PRESENTER_MSG, message => {
      const millis = helpers.milliseconds()
      const customRequestID = `presenter-${message.alias}-${millis}`

      console.log('<socket.on> presenter-message', message)
      languages.forEach(function (value) {

        message.destLang = value
        if (value === 'my') {

          gct.translate(message.srcText, value)
            .then(results => {
              let translations = results[0]
              translations = Array.isArray(translations)
                ? translations
                : [translations]

              console.log('Translations:')
              translations.forEach((translation, i) => {
                console.log(`${message.srcText} => (${value}) ${translation}`)
                message.translation = translation
                nsp.to(value).emit(eventName.FROM_PRESENTER, message)
              })
            })
            .catch(err => {
              console.error('ERROR:', err)
            })
        } else {
          var params = {
            text: message.srcText,
            from: message.srcLang,
            to: value,
            category: 'generalnn'
          }
          msft.translate(params, function (err, data) {
            message.translation = data
            nsp.to(value).emit(eventName.FROM_PRESENTER, message)
          })
        }

      })
    })

    socket.on(onEvent.MEETING_CHAT, message => {
      console.log('<socket.on> meeting-chat', message)

      if (message.srcLang === 'my' || message.destLang === 'my') {
        var options = {
          from: message.srcLang,
          to: message.destLang
        }

        gct.translate(message.srcText, options)
          .then(results => {
            let translations = results[0]
            translations = Array.isArray(translations)
              ? translations
              : [translations]

            console.log('Translations:')
            translations.forEach((translation, i) => {
              console.log(`${message.srcText} => (${message.destLang}) ${translation}`)
              // meetingTranslationEmit(message, translation);
              message.translation = translation
              nsp.emit(eventName.MEETING_TRANSLATION, message)
            })
          })
          .catch(err => {
            console.error('ERROR:', err)
          })
      } else {

        var params = {
          text: message.srcText,
          from: message.srcLang,
          to: message.destLang,
          category: 'generalnn'
        }
        msft.translate(params, function (err, translation) {
          message.translation = translation
          nsp.emit(eventName.MEETING_TRANSLATION, message)
        })
      }
    })

    //chat-support-availability'
    socket.on(onEvent.SUPPORT_CHAT_AVAILABLE, message => {
      console.log(message)
      // don't emit to chat client
      // instead save to DB and let chat client check if available on chat session chat
      // to allow for admin to finish chats they've started
      // nsp.emit(eventName.CHAT_SUPPORT_AVAILABLE_UPDATE, message);

      var query = { id: message.organization }
      organization.findOneAndUpdate(query, { $set: { isLiveVisitorHelp: message.isLive } }, { new: true }, function (err, doc) {
        if (err) {
          console.log('Something wrong when updating data!')
        }
      })

    })

      socket.on(onEvent.SUPPORT_MESSAGE, message => {
          console.log('SUPPORT_MESSAGE', message, socket.id)
          var language = message.language
          var chatMessage = {
              id: socket.id,
              type: message.type,
              name: message.name,
              lang: language.id,
              langName: language.name,
              text: message.text,
              translation: message.text,
              isVisitor: message.isVisitor,
              timestamp: new Date().toISOString(),
              isVisitorOnline: true,
          }
          nsp.to(socket.id).emit(eventName.SUPPORT_MESSAGE_REPLY, chatMessage);
          var params = {
              text: message.text,
              from: language.id,
              to: message.destLang,
              category: 'generalnn'
          }

          if (language.source === 'm') {
              msft.translate(params, function (err, translation) {
                  chatMessage.translation = translation
                  console.log('chatMessage ', chatMessage);
                  nsp.emit(eventName.CLIENT_SUPPORT_MESSAGE, chatMessage)
              })
          } else if (language.source === 'g') {
              var options = {
                  from: language.id,
                  to: message.destLang
              }

              gct.translate(message.text, options)
                  .then(results => {
                      let translations = results[0]
                      translations = Array.isArray(translations)
                          ? translations
                          : [translations]

                      translations.forEach((translation, i) => {
                          chatMessage.translation = translation
                          console.log('chatMessage ', chatMessage);
                          nsp.emit(eventName.CLIENT_SUPPORT_MESSAGE, chatMessage)
                      })
                  })
                  .catch(err => {
                      console.error('ERROR:', err)
                  });
          }

          var chatData = {
              from: message.name,
              text: message.text,
              language: {
                  id: message.language.id,
                  name: message.language.name,
                  localeName: message.language.localeName
              },
              isVisitor: message.isVisitor ? message.isVisitor : false
          }

          var chat = new chatHistory(chatData)
          chat.save({new: true}, function (chatError, saveChat) {
              if (chatError) {
                  console.log('error chat.save =>', chatError)
              } else {
                  visitorChat.findOne({clientId: socket.id}, function (error, vHistory) {
                      if (error) {
                          console.log('error visitorChat.findOne=>', error)
                      } else {
                          if (vHistory == [] || vHistory == null) {
                              var vHistoryChat = {
                                  clientId: socket.id,
                                  ipAddress: socket.conn.remoteAddress,
                                  location: '',
                                  wasServiced: false,
                                  isVisitorOnline: true
                              }

                              var vChatHistory = new visitorChat(vHistoryChat)
                              vChatHistory.save(function (error, saveVHistory) {
                                  if (error) {
                                      console.log(' vChatHistory.save.error =>', error)
                                  } else {
                                      console.log('remoteIp...', socket.conn.remoteAddress);
                                      http.get(`http://api.ipstack.com/${socket.conn.remoteAddress}?access_key=${config.ipstack.accessKey}`, (resp) => {
                                          let data = '';
                                          resp.on('data', (chunk) => {
                                              data += chunk;
                                          });
                                          resp.on('end', () => {
                                              let response = JSON.parse(data);
                                              let location = {
                                                  country: response.country_name,
                                                  state: response.region_name,
                                                  city: response.city,
                                                  zip: response.zip,
                                                  latitude: response.latitude,
                                                  longitude: response.longitude
                                              }
                                              updateVisitorChatHistory(saveChat, location);
                                          });
                                      }).on("error", (err) => {
                                          console.log("Error: " + err.message);
                                          updateVisitorChatHistory(saveChat,'');
                                      });
                                  }
                              });
                          } else {
                              visitorChat.findOneAndUpdate({'clientId': socket.id}, {$push: {chatHistory: saveChat}}, function (error, saveHistory) {
                                  if (error) {
                                      console.log('error findOneAndUpdate=>', error)
                                  }
                              });
                          }
                      }
                  });
              }
          });
      });

      function updateVisitorChatHistory(saveChat, location) {
          visitorChat.findOneAndUpdate({'clientId': socket.id}, {$push: {chatHistory: saveChat, location: location}}, function (error, saveHistory) {
              if (error) {
                  console.log('visitorChat.findOneAndUpdate ==> ', error)
              } else {
                  organization.findOneAndUpdate({id: 'epic'}, {$push: {visitorChatHistory: saveHistory}}, function (error, save) {
                      if (error) {
                          console.log('organization.findOneAndUpdate..error. =>', error)
                      }
                  });
              }
          });
      }

      socket.on(onEvent.CLIENT_SUPPORT_MESSAGE_REPLY, message => {
          console.log('CLIENT_SUPPORT_MESSAGE_REPLY', message, socket.id)
          var language = message.language
          var chatMessage = {
              id: socket.id,
              type: message.type,
              name: message.name,
              lang: language.id,
              langName: language.name,
              text: message.text,
              translation: '',
              timestamp: new Date().toISOString()
          }

          nsp.emit(eventName.CLIENT_SUPPORT_MESSAGE, {
              id: message.receiverId,
              type: message.type,
              name: message.name,
              lang: language.id,
              langName: language.name,
              text: message.text,
              translation: '',
              timestamp: new Date().toISOString()
          });

          var params = {
              text: message.text,
              from: language.id,
              to: message.destLang,
              category: 'generalnn'
          }

          console.log('params', params);
          if (language.source === 'm' || language.source !== 'g') {
              msft.translate(params, function (err, translation) {
                  chatMessage.translation = translation
                  console.log('translateion', chatMessage)
                  nsp.to(message.receiverId).emit(eventName.SUPPORT_MESSAGE_REPLY, chatMessage)
              });

          } else if (language.source === 'g') {
              var options = {
                  from: language.id,
                  to: message.destLang
              }
              console.log('options', options);
              gct.translate(message.text, options)
                  .then(results => {
                      let translations = results[0]
                      translations = Array.isArray(translations)
                          ? translations
                          : [translations]

                      translations.forEach((translation, i) => {
                          chatMessage.translation = translation
                          console.log('translateion', chatMessage)
                          nsp.to(message.receiverId).emit(eventName.SUPPORT_MESSAGE_REPLY, chatMessage)
                      })
                  })
                  .catch(err => {
                      console.error('ERROR:', err)
                  });
          }
          var chatData = {
              from: message.name,
              text: message.text,
              language: {
                  id: message.language.id,
                  name: message.language.name,
                  localeName: message.language.localeName
              },
              isVisitor: false
          }

          var chat = new chatHistory(chatData)
          chat.save({new: true}, function (chatError, saveChat) {
              if (chatError) {
                  console.log('error chat.save =>', chatError)
              } else {
                  visitorChat.findOneAndUpdate({'clientId': message.receiverId}, {$push: {chatHistory: saveChat}}, function (error, saveHistory) {
                      if (error) {
                          console.log('visitorChat.findOneAndUpdate ==> ', error)
                      } else {
                          console.log('visitorChat updated successfully.... ')
                      }
                  });
              }
          });
      });

    function setVisitorOffline(){
      visitorChat.findOneAndUpdate({ 'clientId': socket.id }, { isVisitorOnline: false }, function (error, saveHistory) {
          if (error) {
              console.log('setVisitorOffline error ==> ', error)
          } else {
            var message ={
                id: socket.id,
                isVisitorOnline: false,
            }
              nsp.emit(eventName.VISITOR_OFFLINE, message)
          }
      })
    }

    socket.on(onEvent.AVAILABLE_ADMIN_LIST, message => {
    //  console.log('message', message);
      let adminList = [];
      let admin = message.name;
   //   console.log('admin', admin)
      let visitor = message.data;
      let current_admin = admin[admin.length-1];
   //   console.log('current', current_admin);
      for (let i = 0 ; i < admin.length; i++) {
        if (admin[i].username === current_admin.username) {
          console.log(i);
        } else {
          adminList.push(admin[i]);
        }
      }
   //   console.log('data', adminList);
      let data = {
        admin: adminList,
        visitor: visitor
      };
      nsp.emit('disable-admin-detail', data );
    //  nsp.emit('active-admin-name', current_admin);
    }, err => {
      logger.error(new Date() + ' --- ' + err.errmsg);
    });

    socket.on(onEvent.ACTIVE_ADMIN_LIST_TOGGLE, message => {
   //   console.log('list active', message);
      nsp.emit('get-active-list', message);
    }, err => {
      logger.error(new Date() + ' --- ' + err.errmsg);
    });
      
    socket.on(onEvent.ENABLE_ALL_ADMIN, message => {
   //   console.log('enable all admin', message);
      nsp.emit('set-disable-list', message);
    }, err => {
      logger.error(new Date() + ' --- ' + err.errmsg);
    })

    socket.on(onEvent.NDEV_STT_FROM_FILE, data => {
      var d2 = Object.assign({}, data)
      d2.audio = {}
      console.log('<socket.on> ndev-request-file', d2)

      // writeToDisk(data.audio.dataURL, data.audio.fileName);
      const filePath = `${config.server.directory.upload}/${data.audio.fileName}`
      const millis = helpers.milliseconds()
      const customRequestID = `nte-rs-${millis}`
      var dataURL = data.audio.dataURL.split(',').pop()
      var fileBuffer = new Buffer(dataURL, 'base64')
      fs.writeFileSync(filePath, fileBuffer)

      ndev.sendDictationRequest({
        'identifier': customRequestID, //The user identifier (please refer to Nuance's documentation for more info).
        'language': 'en-US', //The language code (please refer to Nuance's documentation for more info).
        'path': filePath, //The path to the file you would like to send to Nuance.
        'additionalHeaders': config.ndev.dictationHeaders, //If you'd like to supply more headers or replace the default headers, supply them here.
        'success': function (resp) { //The error callback function - returns the response from Nuance that you can debug.

          var srcText = resp[0]
          console.log(srcText)
          languages.forEach(function (value) {

            if (value === 'my') {

              gct.translate(srcText, value)
                .then(results => {
                  let translations = results[0]
                  translations = Array.isArray(translations)
                    ? translations
                    : [translations]

                  console.log('Translations:')
                  translations.forEach((translation, i) => {
                    console.log(`${message.message} => (${value}) ${translation}`)
                    message.translation = translation
                    nsp.to(value).emit(eventName.TRANSLATION, message)
                  })
                })
                .catch(err => {
                  console.error('ERROR:', err)
                })
            } else {

              console.log(value)
              var params = {
                text: srcText,
                from: 'en-US',
                to: value,
                category: 'generalnn'
              }
              msft.translate(params, function (err, translation) {
                message.translation = translation
                nsp.to(value).emit(eventName.TRANSLATION, message)
              })
            }
          })
          // helpers.removeFromDisk(filePath);

        },
        'error': function (response) { //The error callback function - returns the response from Nuance that you can debug.
          var dt = response.headers.date
          var id = response.headers['x-nuance-sessionid']
          var bd = response.body
          var status = response.statusCode
          console.error(`NDEV ERROR ${status}\n\t${dt}\n\t${id}\n\t\t${bd}`)
          var message = {
            status: status,
            sessionID: id,
            date: dt,
            body: bd
          }
          io.emit('ndev-error', message)
          // helpers.removeFromDisk(filePath);
        }
      })
    })

    socket.on(onEvent.NDEV_MEETING_STT, data => {
      var d2 = Object.assign({}, data)
      d2.audio = {}
      console.log('<socket.on> ndev-meeting-stt', d2)

      // const details = {
      //     topic: 'meeting-chat',
      //     desc: 'language-1',
      //     namespace: this.currentUser.namespace,
      //     alias: this.stsLanguage1.name,
      //     srcLang: this.stsLanguage1.id,
      //     destLang: this.stsLanguage2.id,
      //     asrCode: this.stsLanguage1.asr,
      //     ttsGender: this.languageOneGender
      // };

      // const data = {
      //     info: details,
      //     audio: {},
      //     time: new Date().toISOString()
      // }

      // var emitMessage = {
      //     desc: data.info.desc,
      //     alias: data.info.alias,
      //     destLang: data.info.destLang,
      //     translation: translation,
      //     srcText: xxx,
      //     srcLang: data.info.srcLang,
      //     time: data.time
      // };

      const uploadPath = path.join(__dirname, config.server.directory.upload)
      var filePath = `${uploadPath}/${data.audio.fileName}`,
        fileBuffer
      const millis = helpers.milliseconds()
      const customRequestID = `meeting-${data.info.namespace}-${millis}`

      // var audioFile = data.audio;
      console.log()
      console.log('json obj: ', data.info)
      console.log('requested filename: ', data.audio.fileName)

      var dataURL = data.audio.dataURL.split(',').pop()
      var fileBuffer = new Buffer(dataURL, 'base64')

      console.log()
      console.log('filepath: ', filePath)
      fs.writeFileSync(filePath, fileBuffer)

      ndev.sendDictationRequest({
        'identifier': customRequestID, //The user identifier (please refer to Nuance's documentation for more info).
        'language': data.info.asrCode, //The language code (please refer to Nuance's documentation for more info).
        'path': filePath, //The path to the file you would like to send to Nuance.
        'additionalHeaders': config.ndev.dictationHeaders, //If you'd like to supply more headers or replace the default headers, supply them here.
        'success': function (resp) { //The error callback function - returns the response from Nuance that you can debug.

          var srcText = resp[0]
          var destLang = data.info.destLang
          console.log()
          console.log('ndev dictation response: ', srcText)

          var emitMessage = {
            desc: data.info.desc,
            alias: data.info.alias,
            destLang: data.info.destLang,
            srcText: srcText,
            srcLang: data.info.srcLang,
            timestamp: data.time
          }

          if (destLang === 'my') {

            gct.translate(srcText, destLang)
              .then(results => {
                let translations = results[0]
                translations = Array.isArray(translations)
                  ? translations
                  : [translations]

                console.log('Translations:')
                translations.forEach((translation, i) => {
                  console.log(`${srcText} => (${destLang}) ${translation}`)
                  meetingTranslationEmit(emitMessage, translation)
                })
              })
              .catch(err => {
                console.error('ERROR:', err)
              })
          } else {

            var params = {
              text: srcText,
              from: data.info.srcLang,
              to: destLang,
              category: 'generalnn'
            }
            msft.translate(params, function (err, translation) {
              meetingTranslationEmit(emitMessage, translation)
              ndevTextToSpeechRequest(destLang, data.info.ttsGender, customRequestID, translation, true)
            })
          }

          helpers.removeFromDisk(filePath)

        },
        'error': function (response) { //The error callback function - returns the response from Nuance that you can debug.
          var dt = response.headers.date
          var id = response.headers['x-nuance-sessionid']
          var bd = response.body
          var status = response.statusCode
          console.error(`NDEV ERROR ${status}\n\t${dt}\n\t${id}\n\t\t${bd}`)
          var message = {
            status: status,
            sessionID: id,
            date: dt,
            body: bd
          }
          helpers.removeFromDisk(filePath)
        }
      })
    })

    socket.on(onEvent.ACTIVE_VOICE_MODEL, data => {
      var d2 = Object.assign({}, data)
      d2.audio = {}
      console.log('<socket.on> active-voice-model', d2)

      const uploadPath = path.join(__dirname, config.server.directory.upload)
      var filePath = `${uploadPath}/${data.audio.fileName}`,
        fileBuffer
      const millis = helpers.milliseconds()
      const customRequestID = `meeting-${data.info.namespace}-${millis}`

      // var audioFile = data.audio;
      console.log()
      console.log('json obj: ', data.info)
      console.log('requested filename: ', data.audio.fileName)

      var dataURL = data.audio.dataURL.split(',').pop()
      var fileBuffer = new Buffer(dataURL, 'base64')

      console.log()
      console.log('filepath: ', filePath)
      fs.writeFileSync(filePath, fileBuffer)

      ndev.sendDictationRequest({
        'identifier': customRequestID, //The user identifier (please refer to Nuance's documentation for more info).
        'language': data.info.asrCode, //The language code (please refer to Nuance's documentation for more info).
        'path': filePath, //The path to the file you would like to send to Nuance.
        'additionalHeaders': config.ndev.dictationHeaders, //If you'd like to supply more headers or replace the default headers, supply them here.
        'success': function (resp) { //The error callback function - returns the response from Nuance that you can debug.

          var srcText = resp[0]
          console.log()
          console.log('ndev dictation response: ', srcText)

          var emitMessage = {
            desc: data.info.desc,
            alias: data.info.alias,
            srcText: srcText,
            srcLang: data.info.srcLang,
            timestamp: data.time
          }

          console.log(emitMessage)
          nsp.emit(eventName.NDEV_TRANSCRIPTION, emitMessage)

          // helpers.removeFromDisk(filePath);

        },
        'error': function (response) { //The error callback function - returns the response from Nuance that you can debug.
          var dt = response.headers.date
          var id = response.headers['x-nuance-sessionid']
          var bd = response.body
          var status = response.statusCode
          console.error(`NDEV ERROR ${status}\n\t${dt}\n\t${id}\n\t\t${bd}`)
          var message = {
            status: status,
            sessionID: id,
            date: dt,
            body: bd
          }
          helpers.removeFromDisk(filePath)
        }
      })
    })

  })

  function meetingTranslationEmit(message, translation) {
    console.log()
    console.log(message)
    nsp.emit(eventName.MEETING_TRANSLATION, {
      desc: message.desc,
      alias: message.alias,
      destLang: message.destLang,
      translation: translation,
      srcText: message.srcText,
      srcLang: message.srcLang,
      timestamp: message.timestamp
    })
  }

  function ndevTextToSpeechRequest(destLang, gender, customRequestID, text, isMeeting) {
    const tts = ndevHelper.lookup(destLang, gender)
    if (tts.lang !== 'none') {
      // TTS Request
      const destlang = destLang
      const ttsID = `tts-${tts.lang}-${customRequestID}`
      const voiceFileName = ttsID + '.wav'
      const voicePath = path.join(__dirname, config.server.directory.public)
      const outputPath = `${voicePath}/${voiceFileName}`
      console.log()
      console.log('tts identifier: ', ttsID)
      console.log('tts fullpath: ', outputPath)
      ndev.sendTTSRequest({
        'text': text,
        'output': outputPath,
        'outputFormat': 'wav',
        'language': tts.lang,
        'voice': tts.voice,
        'identifier': ttsID,
        'success': function () {
          if (isMeeting) {
            nsp.emit(eventName.NDEV_TTS_MEETING, { srcAudio: voiceFileName })
          } else {
            nsp.to(destlang).emit(eventName.NDEV_TTS_AUDIENCE, { srcAudio: voiceFileName })
          }
        },
        'error': function (response) {
          console.error('TTS file not saved.', response)
        }
      })
    }
  }
}

module.exports = NSP