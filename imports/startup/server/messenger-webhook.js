import bodyParser from 'body-parser';
import request from 'request';
import fs from 'fs';
import crypto from 'crypto';
import {Picker} from 'meteor/meteorhacks:picker';
import chatbot from '../../api/chatbot/chatbot.js';
import {upsertDocument} from '../../api/documents/methods.js';
import Settings from '../../api/settings/settings.js';
import Documents from '../../api/documents/documents.js';

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = Meteor.settings.MESSENGER_APP_SECRET;

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = Meteor.settings.MESSENGER_VALIDATION_TOKEN;

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = Meteor.settings.MESSENGER_PAGE_ACCESS_TOKEN;

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = Meteor.settings["galaxy.meteor.com"].env.ROOT_URL;

// google credentials from json key file
const GOOGLE_CREDENTIALS = Meteor.settings.GOOGLE_CREDENTIALS;

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL && GOOGLE_CREDENTIALS)) {
  console.error("Missing chatbot config values");
}

let translate = require('@google-cloud/translate')({credentials: GOOGLE_CREDENTIALS});
let language = require('@google-cloud/language')({credentials: GOOGLE_CREDENTIALS});
let vision = require('@google-cloud/vision')({credentials: GOOGLE_CREDENTIALS});
let speech = require('@google-cloud/speech')({credentials: GOOGLE_CREDENTIALS});

Picker.middleware(bodyParser.json({verify: verifyRequestSignature}));

var getRoutes = Picker.filter(function(req, res) {
  return req.method == "GET";
});

var postRoutes = Picker.filter(function(req, res) {
  return req.method == "POST";
});

/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
getRoutes.route('/webhook', function(params, req, res, next) {
  try {
    if (params.query['hub.mode'] === 'subscribe' && params.query['hub.verify_token'] === VALIDATION_TOKEN) {
      console.log("Validating webhook");
      res.end(params.query['hub.challenge']);
    } else {
      throw new Error("Failed validation, make sure the validation tokens match.");
    }
  } catch (err) {
    console.error(err);
    res.statusCode = 403;
    res.end();
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
postRoutes.route('/webhook', function(params, req, res, next) {
  try {
    var data = req.body;
    console.info("Webhook callback, request body: " + JSON.stringify(data));

    // Make sure this is a page subscription
    if (data.object == 'page') {
      // Iterate over each entry
      // There may be multiple if batched
      data.entry.forEach(function(pageEntry) {
        var pageID = pageEntry.id;
        var timeOfEvent = pageEntry.time;

        // Iterate over each messaging event
        pageEntry.messaging.forEach(function(messagingEvent) {
          if (messagingEvent.optin) {
            receivedAuthentication(messagingEvent);
          } else if (messagingEvent.message) {
            receivedMessage(messagingEvent);
          } else if (messagingEvent.delivery) {
            receivedDeliveryConfirmation(messagingEvent);
          } else if (messagingEvent.postback) {
            receivedPostback(messagingEvent);
          } else if (messagingEvent.read) {
            receivedMessageRead(messagingEvent);
          } else if (messagingEvent.account_linking) {
            receivedAccountLink(messagingEvent);
          } else {
            throw new Error("Webhook received unknown messagingEvent: ", messagingEvent);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know you've
      // successfully received the callback. Otherwise, the request will time out.
      res.end();
    } else {
      throw new Error("Webhook callback is not a page.");
    }
  } catch (err) {
    console.error(err);
    res.statusCode = 400;
    res.end();
  }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL.
 *
 */
getRoutes.route('/authorize', function(params, req, res, next) {
  try {
    var accountLinkingToken = params.query['account_linking_token'];
    var redirectURI = params.query['redirect_uri'];

    // Authorization Code should be generated per user by the developer. This will
    // be passed to the Account Linking callback.
    var authCode = "1234567890";

    // Redirect users to this URI on successful login
    var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

    //TODO: this render/redirect is not working as expected
    res.render('authorize', {
      accountLinkingToken: accountLinkingToken,
      redirectURI: redirectURI,
      redirectURISuccess: redirectURISuccess
    });
  } catch (err) {
    console.error(err);
    res.statusCode = 400;
    res.end();
  }
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  try {
    var signature = req.headers["x-hub-signature"];
    if (!signature) {
      throw new Error("Could not find a signature.");
    } else {
      var elements = signature.split('=');
      var method = elements[0];
      var signatureHash = elements[1];
      var expectedHash = crypto.createHmac('sha1', APP_SECRET).update(buf).digest('hex');
      if (signatureHash != expectedHash) {
        throw new Error("Unexpected signature found.");
      }
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d",
  senderID, recipientID, passThroughParam, timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}

/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message'
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've
 * created. If we receive a message with an attachment (image, video, audio),
 * then we'll simply confirm that we've received the attachment.
 *
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'gif':
        sendGifMessage(senderID);
        break;

      case 'audio':
        sendAudioMessage(senderID);
        break;

      case 'video':
        sendVideoMessage(senderID);
        break;

      case 'file':
        sendFileMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      case 'quick reply':
        sendQuickReply(senderID);
        break;

      case 'read receipt':
        sendReadReceipt(senderID);
        break;

      case 'typing on':
        sendTypingOn(senderID);
        break;

      case 'typing off':
        sendTypingOff(senderID);
        break;

      case 'account linking':
        sendAccountLinking(senderID);
        break;

      default:
        processMessageText(senderID, messageText);

    }
  } else if (messageAttachments) {
    console.info("messageAttachments: " + JSON.stringify(messageAttachments));
    for (var i = 0; i < messageAttachments.length; i++) {
      let upsert = {
        title: messageAttachments[i].type + ' attachment from messenger',
        body: messageAttachments[i].payload.url,
        attachment: {
          type: messageAttachments[i].type,
          url: messageAttachments[i].payload.url
        }
      };

      if (messageAttachments[i].type == 'image') {
        console.info("processing image " + messageAttachments[i].payload.url);

        vision.detectText(messageAttachments[i].payload.url).then(function(data) {
          try {
            console.info("processing data " + JSON.stringify(data));
            var text = data[0][0];
            sendTextMessage(senderID, text.substring(0, 640));

            upsert.body = text;
            upsertDocument.call(upsert, function(err, result) {
              if (err) {
                throw new Error(err);
              } else {
                sendTextMessage(senderID, "document added");
              }
            });
          } catch (err) {
            console.error(err);
            sendTextMessage(senderID, "something went wrong with " + err.toString());
          }

        });
      } else if (messageAttachments[i].type == 'audio') {
        console.info("processing audio " + messageAttachments[i].payload.url);
        try {
          const apiKey = '277a9b96ba816b8eaac480b2f1de963f88b7fe54';
          const formData = {
            target_format: 'flac',
            source_file: messageAttachments[i].payload.url
          };

          request.post({
            url: 'https://sandbox.zamzar.com/v1/jobs/',
            formData: formData
          }, function(err, response, body) {
            if (err) {
              console.error('Unable to start conversion job', err);
            } else {
              console.log('SUCCESS! Conversion job started:', JSON.parse(body));
              const jobID = JSON.parse(body).id;

              var start = new Date().getTime();
              for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > 5000) {
                  break;
                }
              }

              request.get('https://api.zamzar.com/v1/jobs/' + jobID, function(err, response, body) {
                if (err) {
                  console.error('Unable to get job', err);
                } else {
                  console.log('SUCCESS! Got job:', JSON.parse(body));
                  const fileID = JSON.parse(body).target_files[0].id;
                  const localFilename = '/tmp/audio.flac';
                  request.get({
                    url: 'https://api.zamzar.com/v1/files/' + fileID + '/content',
                    followRedirect: false
                  }, function(err, response, body) {
                    if (err) {
                      console.error('Unable to download file:', err);
                    } else {
                      // We are being redirected
                      if (response.headers.location) {
                        // Issue a second request to download the file
                        var fileRequest = request(response.headers.location);
                        fileRequest.on('response', function(res) {
                          res.pipe(fs.createWriteStream(localFilename));
                        });
                        fileRequest.on('end', function() {
                          console.log('File download complete');

                          speech.recognize('/tmp/audio.flac', {
                            encoding: 'FLAC',
                            sampleRate: 8000
                          }).then(function(data) {
                            try {
                              console.info("processing data " + JSON.stringify(data));
                              var transcript = data[0];
                              sendTextMessage(senderID, "you said:  " + JSON.stringify(transcript));

                              // upsert.body = JSON.stringify(transcript);
                              // upsertDocument.call(upsert, function(err, result) {
                              //   if (err) {
                              //     throw new Error(err);
                              //   } else {
                              //     sendTextMessage(senderID, "document added");
                              //   }
                              // });
                            } catch (err) {
                              console.error(err);
                              sendTextMessage(senderID, "something went wrong with " + err.toString());
                            }
                          });
                        });
                      }
                    }
                  }).auth(apiKey, '', true).pipe(fs.createWriteStream(localFilename));

                }
              }).auth(apiKey, '', true);
            }
          }).auth(apiKey, '', true);
        } catch (err) {
          console.error(err);
          sendTextMessage(senderID, "something went wrong with " + err.toString());
        }
      } else {
        upsertDocument.call(upsert, function(error, result) {
          if (error) {
            console.error(error);
          } else {
            sendTextMessage(senderID, "saved message with " + messageAttachments[i].type);
          }
        });
      }
      sendTextMessage(senderID, "processing message with " + messageAttachments[i].type);
    }
  }
}

function processMessageText(senderID, messageText) {
  // // Create a document if you plan to run multiple detections.
  var document = language.document(messageText.toLowerCase());
  // Parse the syntax of the document.
  document.annotate().then(function(data) {
    try {
      var annotations = data[0];
      console.info(JSON.stringify(annotations));
      let command = chatbot(annotations);
      if (typeof command === 'string') {
        sendTextMessage(senderID, command);
      } else {
        //if we are creating an invoice for someone
        if (command.action == 'create' && command.what == 'invoice' && command.who != null) {
          //find the info of the person we are creating the invoice for
          let settings = Settings.find({"nickname": command.who}).fetch();
          if (settings.length > 0) {
            //console.info(JSON.stringify(settings[0]));
            let details = settings[0];

            let upsert = {
              title: 'invoice for ' + details.nickname,
              body: 'contains nothing',
              customerID: details._id,
              date: Date.now(),
              items: {
                oil: {
                  quantity: 0
                },
                tire: {
                  quantity: 0
                }
              },
              attachment: {}
            };
            upsertDocument.call(upsert, function(err, result) {
              if (err) {
                throw new Error(err);
              } else {
                let user = Meteor.users.findOne(details._id);
                let doc = Documents.findOne();
                sendReceiptMessage(senderID, details, doc, user);
              }
            });
          } else {
            sendTextMessage(senderID, "i don't know who " + command.who + " is!");
          }
          //sendTextMessage(senderID, JSON.stringify(command));

        } else if (command.action == 'send' && command.what == 'invoice') {
          let doc = Documents.findOne();
          let settings = Settings.find({"_id": doc.customerID}).fetch();
          let details = settings[0];
          sendTextMessage(senderID, "invoice sent to " + details.nickname + " via " + details.delivery);
        } else if (command.what != null) {
          if (command.what == 'tire' || command.what == 'oil') {
            if (command.action == 'add') {
              let size = 1;
              if (command.num) {
                size = command.num;
              }

              let doc = Documents.findOne();
              if (doc) {
                if (doc.items[command.what]) {
                  doc.items[command.what].quantity += size;
                } else {
                  doc.items[command.what] = {
                    quantity: size
                  }
                }

                upsertDocument.call({
                  _id: doc._id,
                  title: doc.title,
                  body: "adding " + command.what,
                  customerID: doc.customerID,
                  items: doc.items
                }, function(err, result) {
                  if (err) {
                    throw new Error(err);
                  } else {
                    let settings = Settings.find({"_id": doc.customerID}).fetch();
                    let details = settings[0];
                    let user = Meteor.users.findOne(doc.customerID);

                    sendReceiptMessage(senderID, details, doc, user);
                  }
                });
              } else {
                sendTextMessage(senderID, "no idea to which invoice this should be added to!");
              }
            } else if (command.action == 'remove') {
              let size = 1;
              if (command.num) {
                size = command.num;
              }

              let doc = Documents.findOne();
              if (doc) {
                if (doc.items[command.what]) {
                  doc.items[command.what].quantity -= size;

                  if (doc.items[command.what].quantity < 0) {
                    doc.items[command.what].quantity = 0;
                  }

                  upsertDocument.call({
                    _id: doc._id,
                    title: doc.title,
                    body: "removing " + command.what,
                    customerID: doc.customerID,
                    items: doc.items
                  }, function(err, result) {
                    if (err) {
                      throw new Error(err);
                    } else {
                      let settings = Settings.find({"_id": doc.customerID}).fetch();
                      let details = settings[0];
                      let user = Meteor.users.findOne(doc.customerID);

                      sendReceiptMessage(senderID, details, doc, user);
                    }
                  });
                }
              } else {
                sendTextMessage(senderID, "no idea to which invoice this should be removed from!");
              }
            } else {
              sendTextMessage(senderID, "how do I " + command.action + "?");
            }
          } else {
            sendTextMessage(senderID, "i don't know what the item " + command.what + " is");
          }

        } else {
          sendTextMessage(senderID, "i don't get you!");
        }
      }

      // Translate a string of text.
      // translate.translate(reply, 'de', function(err, translation) {
      //   if (!err) {
      //     sendTextMessage(senderID, translation);
      //   } else {
      //     console.error(err);
      //     sendTextMessage(senderID, "sorry, I wasn't listeneing... could you please repeat that?! " + err);
      //   }
      // });
    } catch (err) {
      console.error(err);
      sendTextMessage(senderID, "something went wrong with " + err.toString());
    }
  });
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d",
  senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d",
  watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ",
  senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons: [
            {
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Trigger Postback",
              payload: "DEVELOPER_DEFINED_PAYLOAD"
            }, {
              type: "phone_number",
              title: "Call Phone Number",
              payload: "+16505551234"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "rift",
              subtitle: "Next-generation virtual reality",
              item_url: "https://www.oculus.com/en-us/rift/",
              image_url: SERVER_URL + "/assets/rift.png",
              buttons: [
                {
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/rift/",
                  title: "Open Web URL"
                }, {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for first bubble"
                }
              ]
            }, {
              title: "touch",
              subtitle: "Your Hands, Now in VR",
              item_url: "https://www.oculus.com/en-us/touch/",
              image_url: SERVER_URL + "/assets/touch.png",
              buttons: [
                {
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/touch/",
                  title: "Open Web URL"
                }, {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for second bubble"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId, details, invoice, user) {
  console.info('details: ' + JSON.stringify(details));
  console.info('invoice: ' + JSON.stringify(invoice));
  console.info('user: ' + JSON.stringify(user));
  // Generate a random receipt ID as the API requires a unique ID
  let receiptId = details.nickname + '-' + invoice._id;

  let elements = [];
  let subtotal = 0;

  if (invoice.items) {
    if (invoice.items.oil && invoice.items.oil.quantity > 0) {
      elements.push({
        title: "Total Classic Oil",
        //subtitle: "Bridgestones",
        quantity: invoice.items.oil.quantity,
        price: 10.00,
        currency: "CHF",
        image_url: SERVER_URL + "/oil.png"
      })
      subtotal += invoice.items.oil.quantity * 10.0;
    }
    if (invoice.items.tire && invoice.items.tire.quantity > 0) {
      elements.push({
        title: "Winter Tire",
        //subtitle: "Bridgestones",
        quantity: invoice.items.tire.quantity,
        price: 510.00,
        currency: "CHF",
        image_url: SERVER_URL + "/tire.png"
      })
      subtotal += invoice.items.tire.quantity * 510.00;
    }
  }

  elements.push({
    title: "Mechanic Mike",
    //subtitle: "Bridgestones",
    quantity: 1,
    price: 50.00,
    currency: "CHF",
    image_url: SERVER_URL + "/mike.png"
  });
  subtotal += 1 * 50.00;

  if (details.delivery == 'post') {
    elements.push({
      title: "Invoice Delivery",
      //subtitle: "Bridgestones",
      quantity: 1,
      price: 2.50,
      currency: "CHF",
      image_url: SERVER_URL + "/post.png"
    });
    subtotal += 1 * 2.50;
  }

  let messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: user.profile.name.first + ' ' + user.profile.name.last,
          order_number: receiptId,
          currency: "CHF",
          payment_method: "Visa 1234",
          timestamp: Math.ceil(invoice.date / 1000),
          elements: elements,
          address: {
            street_1: details.street,
            //street_2: "",
            city: details.city,
            postal_code: details.postal_code,
            state: details.country,
            country: "."
          },
          summary: {
            subtotal: subtotal,
            //shipping_cost: 20.00,
            //total_tax: 57.67,
            total_cost: subtotal
          },
          // adjustments: [
          //   {
          //     name: "New Customer Discount",
          //     amount: -50
          //   }, {
          //     name: "$100 Off Coupon",
          //     amount: -100
          //   }
          // ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type": "text",
          "title": "Action",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        }, {
          "content_type": "text",
          "title": "Comedy",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        }, {
          "content_type": "text",
          "title": "Drama",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons: [
            {
              type: "account_link",
              url: SERVER_URL + "/authorize"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_ACCESS_TOKEN
    },
    method: 'POST',
    json: messageData

  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
      } else {
        console.log("Successfully called Send API for recipient %s", recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}
