const functions = require("firebase-functions");
("use strict");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const twilio = require("twilio");

const { event_created } = require("./src/event_created");
const { invitee_updated } = require("./src/invitee_updated");
const { location_updated } = require("./src/location_updated");
const { status_changed } = require("./src/status_changed");

exports.event_created = event_created;
exports.invitee_updated = invitee_updated;
exports.location_updated = location_updated;
exports.status_changed = status_changed;

//const gmailEmail = functions.config().gmail.email;
//const gmailPassword = functions.config().gmail.password;
var FCM = require("fcm-push");
var serverKey =
  "AAAAV-GekTk:APA91bGgFCMp-a1sScM2Q9cBLbRk0Wvm_CrfvOO7c9erqhJBB5ADi7_YmJUafvHbYaOL9G6LoCRM1f5ouu53-r1RO7lIVGUc9BBHMvxkaYS1-qhmRztkLEj8LDjLzBTqifXk3UqgT4gU";
var fcm = new FCM(serverKey);

// Your company name to include in the emails
const APP_NAME = "Hoozin App";
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "khoa@medmentoring.com",
    pass: "GBVDILEZ"
  }
});

function sendSMS(no, text) {
  var accountSid = "ACd4bf4c954ca25791fb844f9945dba657";
  var authToken = "4b57a3c241afbd16152cba1c2872d5fd";
  var client = new twilio(accountSid, authToken); //send SMS to customer
  client.messages
    .create({
      body: text,
      to: no,
      from: "+15108769215"
    })
    .then(message => console.log(message.sid))
    .catch(error => console.log(error));
}
exports.sendEmail = functions.auth.user().onCreate(event => {
  console.log(event.email);
  const email = event.email; // The email of the user.
  const displayName = event.displayName;
  const em =
    "Welcome to hoozin, the mobile, social event platform! \n If you're receiving this email, it means you have recently created an account and are ready to start taking advantage of hoozin. You can use hoozin to host or attend events and keep track of photo's, messages and location all captured in one place. \n As you get started, please keep in mind that the purpose of the hoozin is to help all event attendees optimize their event experience through the sharing of images, group chat and location tracking. \n We are currently in beta mode, so although we are trying to put our best foot forward, we know we still have plenty of room to improve. Please feel free to provide any feedback from within the app. \n We're excited to have you in the hoozin platform! \n Your hoozin team";

  return sendWelcomeEmail(email, displayName, em, "Welcome to Hoozin App!");
});

exports.chat = functions.database
  .ref("users/{userId}/event/{eventId}/messages/{messageid}")
  .onCreate((snap, context) => {
    const snapshot = snap.val();
    console.log(
      "/users/" + context.params.userId + "event/" + context.params.eventId
    );
    admin
      .database()
      .ref(
        "/users/" + context.params.userId + "/event/" + context.params.eventId
      )
      .once("value")
      .then(newer => {
        newer = newer.val();
        console.log("chat", newer);
        for (var key in newer.invitee) {
          console.log(key, newer.invitee[key]);
          if (
            newer.invitee[key].status === "going" ||
            newer.invitee[key].status === "maybe"
          ) {
            admin
              .database()
              .ref("/users/" + key + "/deviceTokens")
              .once("value")
              .then(deviceTokens => {
                deviceTokens = deviceTokens.val();
                console.log(
                  "New message by ",
                  snapshot.userName,
                  "",
                  snapshot.message
                );
                if (deviceTokens) {
                  let msg = snapshot.message;
                  var message = {
                    registration_ids: deviceTokens, // required fill with device token or topics
                    notification: {
                      title: snapshot.userName + " @ " + newer.eventTitle,
                      body: msg
                    },
                    data: {
                      type: "CHAT",
                      event_id: context.params.eventId,
                      host_id: context.params.userId,
                      message_id: context.params.messageid
                    }
                  };
                  console.log("chat notification", message);
                  fcm
                    .send(message)
                    .then(response => {
                      console.log(
                        "Successfully sent with response: ",
                        response
                      );
                      return true;
                    })
                    .catch(err => {
                      console.log("FCM err, Something has gone wrong!");
                      console.error(err);
                    });
                }
                console.log("chat notification to ", newer.invitee[key].name);
              })
              .catch(err => {
                console.log("err, Something has gone wrong!", err);
                console.error(err);
              });
          }
        }
      })
      .catch(err => {
        console.log("err, Something has gone wrong!", err);
        console.error(err);
      });
  });

exports.image_added = functions.database
  .ref("users/{userId}/event/{eventId}/photos/{photosid}")
  .onCreate((snapshot, context) => {
    snapshot = snapshot.val();
    if (snapshot.pinned) {
      admin
        .database()
        .ref(
          "/users/" + context.params.userId + "/event/" + context.params.eventId
        )
        .once("value")
        .then(newer => {
          newer = newer.val();
          console.log("chat", newer);
          for (var key in newer.invitee) {
            console.log(key, newer.invitee[key]);
            if (
              newer.invitee[key].status === "going" ||
              newer.invitee[key].status === "maybe"
            ) {
              admin
                .database()
                .ref("/users/" + key + "/deviceTokens")
                .once("value")
                .then(deviceTokens => {
                  deviceTokens = deviceTokens.val();
                  console.log("New image added by ");
                  if (deviceTokens) {
                    let msg =
                      "New event picture has been added for event " +
                      newer.eventTitle;
                    var message = {
                      registration_ids: deviceTokens, // required fill with device token or topics
                      notification: {
                        title: msg,
                        body: "Tap to view"
                      },
                      apns: {
                        headers: {
                          "apns-collapse-id": context.params.eventId
                        }
                      },
                      data: {
                        type: "IMAGE",
                        event_id: context.params.eventId,
                        host_id: context.params.userId,
                        photo_id: context.params.photosid
                      }
                    };
                    console.log("photo notification", message);
                    fcm
                      .send(message)
                      .then(response => {
                        console.log(
                          "Successfully sent with response: ",
                          response
                        );
                        return true;
                      })
                      .catch(err => {
                        console.log("FCM err, Something has gone wrong!");
                        console.error(err);
                      });
                  }
                  console.log(
                    "photo notification to ",
                    newer.invitee[key].name
                  );
                })
                .catch(err => {
                  console.log("err, Something has gone wrong!", err);
                  console.error(err);
                });
            }
          }
        });
    }
  });

exports.image_pinned = functions.database
  .ref("users/{userId}/event/{eventId}/photos/{photosid}")
  .onUpdate((snapshot, context) => {
    snapshot = snapshot.after.val();
    if (snapshot.pinned) {
      admin
        .database()
        .ref(
          "/users/" + context.params.userId + "/event/" + context.params.eventId
        )
        .once("value")
        .then(newer => {
          newer = newer.val();
          console.log("chat", newer);
          for (var key in newer.invitee) {
            console.log(key, newer.invitee[key]);
            if (
              newer.invitee[key].status === "going" ||
              newer.invitee[key].status === "maybe"
            ) {
              admin
                .database()
                .ref("/users/" + key + "/deviceTokens")
                .once("value")
                .then(deviceTokens => {
                  deviceTokens = deviceTokens.val();
                  console.log("New image added by ");
                  if (deviceTokens) {
                    let msg =
                      "New event picture has been added for event " +
                      newer.eventTitle;
                    var message = {
                      registration_ids: deviceTokens, // required fill with device token or topics
                      notification: {
                        title: msg,
                        body: "Tap to view"
                      },
                      apns: {
                        headers: {
                          "apns-collapse-id": context.params.eventId
                        }
                      },
                      data: {
                        type: "IMAGE",
                        event_id: context.params.eventId,
                        host_id: context.params.userId,
                        photo_id: context.params.photosid
                      }
                    };
                    console.log("photo notification", message);
                    fcm
                      .send(message)
                      .then(response => {
                        console.log(
                          "Successfully sent with response: ",
                          response
                        );
                        return true;
                      })
                      .catch(err => {
                        console.log("FCM err, Something has gone wrong!");
                        console.error(err);
                      });
                  }
                  console.log(
                    "photo notification to ",
                    newer.invitee[key].name
                  );
                })
                .catch(err => {
                  console.log("err, Something has gone wrong!", err);
                  console.error(err);
                });
            }
          }
        });
    }
  });

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, displayName, text, subject) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@firebase.com>`,
    to: email,
    subject: `test`,
    text: `test message`
  };
  mailOptions.subject = subject;
  mailOptions.text = text;
  return mailTransport
    .sendMail(mailOptions)
    .then(() => {
      console.log("New welcome email sent to:", email);
      return email;
      //console.log('New welcome email sent to:', email);
    })
    .catch(error => {
      console.log("Error sending email", error);
      return email;
    });
}

exports.test_notification = functions.https.onRequest((req, res) => {
  console.log("called", req);
  var arr = [
    "eZduFDitVCg:APA91bE8AN57016DwnI3PBcGv6dxSzKKEIflwvzEdTJXT7s9_VkGKQ_P-TxTJ1xGxLVdegQ9Mt3__9tGIhMQKvOVufCQEw9O-dcs-89zNGOkmU9Qc8C50mhrx9C7oe9fHpcl71sId24I"
  ];

  const options = {
    priority: "high",
    collapseKey: "1",
    contentAvailable: true,
    timeToLive: 60 * 60 * 24
  };

  var registrationToken =
    "eZduFDitVCg:APA91bE8AN57016DwnI3PBcGv6dxSzKKEIflwvzEdTJXT7s9_VkGKQ_P-TxTJ1xGxLVdegQ9Mt3__9tGIhMQKvOVufCQEw9O-dcs-89zNGOkmU9Qc8C50mhrx9C7oe9fHpcl71sId24I";

  var message = {
    notification: {
      title: "a up 1.43% on the day",
      body: "a gained 11.80 points to close at 835.67, up 1.43% on the day."
    },

    apns: {
      payload: {
        aps: {
          badge: 42,
          "thread-id": "asd"
        }
      }
    },
    token: registrationToken
  };

  admin
    .messaging()
    .send(message, options)
    .then(response => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch(error => {
      console.log("Error sending message:", error);
    });
  res.status(200).send("asd");
});
