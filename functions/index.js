const functions = require("firebase-functions");
("use strict");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const twilio = require("twilio");
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

exports.location_updated = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onUpdate((snapshot, context) => {
    const old = snapshot.before.val();
    const newer = snapshot.after.val();

    if (old.location !== newer.location) {
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
                "Send invite to ",
                newer.invitee[key].name,
                "",
                deviceTokens
              );
              if (deviceTokens) {
                let msg =
                  "Location for an event " +
                  newer.eventTitle +
                  " has been updated from " +
                  old.location +
                  " to" +
                  newer.location;
                var message = {
                  registration_ids: deviceTokens, // required fill with device token or topics
                  notification: {
                    title: "Event Location Updated",
                    body: msg
                  },
                  data: {
                    type: "EVENT_LOCATION_CHANGE",
                    event_id: context.params.eventId,
                    host_id: context.params.userId
                  }
                };
                console.log("invitation notification", message);
                fcm
                  .send(message)
                  .then(response => {
                    console.log("Successfully sent with response: ", response);
                    return true;
                  })
                  .catch(err => {
                    console.log("FCM err, Something has gone wrong!");
                    console.error(err);
                  });
              }
            });
          console.log(
            "location updated send push notification to ",
            newer.invitee[key].name
          );
        }
      }
    } else if (old.eventTitle !== newer.eventTitle) {
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
                "Send invite to ",
                newer.invitee[key].name,
                "",
                deviceTokens
              );
              if (deviceTokens) {
                let msg =
                  "Event title has been updated from " +
                  old.eventTitle +
                  " to " +
                  newer.eventTitle;
                var message = {
                  registration_ids: deviceTokens, // required fill with device token or topics
                  notification: {
                    title: "Event Title updated",
                    body: msg
                  },
                  data: {
                    type: "EVENT_CHANGE",
                    event_id: context.params.eventId,
                    host_id: context.params.userId
                  }
                };
                console.log("invitation notification", message);
                fcm
                  .send(message)
                  .then(response => {
                    console.log("Successfully sent with response: ", response);
                    return true;
                  })
                  .catch(err => {
                    console.log("FCM err, Something has gone wrong!");
                    console.error(err);
                  });
              }

              console.log(
                "title updated send push notification to ",
                newer.invitee[key].name
              );
            })
            .catch(err => {
              console.log("err, Something has gone wrong!");
              console.error(err);
            });
        }
      }
    } else if (old.eventType !== newer.eventType) {
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
                "Send invite to ",
                newer.invitee[key].name,
                "",
                deviceTokens
              );
              if (deviceTokens) {
                let msg =
                  "Event type has been updated from " +
                  old.eventType +
                  " to " +
                  newer.eventType;
                var message = {
                  registration_ids: deviceTokens, // required fill with device token or topics
                  notification: {
                    title: "Event type updated",
                    body: msg
                  },
                  data: {
                    type: "EVENT_CHANGE",
                    event_id: context.params.eventId,
                    host_id: context.params.userId
                  }
                };
                console.log("invitation notification", message);
                fcm
                  .send(message)
                  .then(response => {
                    console.log("Successfully sent with response: ", response);
                    return true;
                  })
                  .catch(err => {
                    console.log("FCM err, Something has gone wrong!");
                    console.error(err);
                  });
              }

              console.log(
                "title updated send push notification to ",
                newer.invitee[key].name
              );
            })
            .catch(err => {
              console.log("err, Something has gone wrong!");
              console.error(err);
            });
        }
      }
    } else if (
      old.endTime !== newer.endTime ||
      old.endDate !== newer.endDate ||
      old.endDateTimeInUTC !== newer.endDateTimeInUTC ||
      old.startTime !== newer.startTime ||
      old.startDate !== newer.startDate ||
      old.startDateTimeInUTC !== newer.startDateTimeInUTC
    ) {
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
                "Send invite to ",
                newer.invitee[key].name,
                "",
                deviceTokens
              );
              if (deviceTokens) {
                let msg = "Event time has been updated ";
                var message = {
                  registration_ids: deviceTokens, // required fill with device token or topics
                  notification: {
                    title: "Event Title updated",
                    body: msg
                  },
                  data: {
                    type: "EVENT_CHANGE",
                    event_id: context.params.eventId,
                    host_id: context.params.userId
                  }
                };
                console.log("invitation notification", message);
                fcm
                  .send(message)
                  .then(response => {
                    console.log("Successfully sent with response: ", response);
                    return true;
                  })
                  .catch(err => {
                    console.log("FCM err, Something has gone wrong!");
                    console.error(err);
                  });
              }

              console.log(
                "title updated send push notification to ",
                newer.invitee[key].name
              );
            })
            .catch(err => {
              console.log("err, Something has gone wrong!");
              console.error(err);
            });
        }
      }
    }
  });

exports.invitee_updated = functions.database
  .ref("users/{userId}/event/{eventId}/invitee/{inviteeid}")
  .onUpdate((snapshot, context) => {
    console.log("invitee updated");
    const old = snapshot.before.val();
    const newer = snapshot.after.val();
    if (old.status !== newer.status && newer.status !== "invited") {
      console.log("invitee changed");
      admin
        .database()
        .ref("/users/" + context.params.userId + "/deviceTokens")
        .once("value")
        .then(deviceTokens => {
          deviceTokens = deviceTokens.val();
          console.log(
            "Send revert to ",
            context.params.userId,
            "",
            deviceTokens
          );
          if (deviceTokens) {
            let msg =
              "User " +
              newer.name +
              " has responded to your event with status  " +
              newer.status;
            var message = {
              registration_ids: deviceTokens, // required fill with device token or topics
              notification: {
                title: "Event Invitation Response",
                body: msg
              },

              data: {
                type: "HOST_INVITEE_RESPONSE",
                event_id: context.params.eventId,
                host_id: context.params.userId,
                invitee_id: context.params.inviteeid
              }
            };
            console.log("invitation notification", message);
            fcm
              .send(message)
              .then(response => {
                console.log("Successfully sent with response: ", response);
                return true;
              })
              .catch(err => {
                console.log("FCM err, Something has gone wrong!");
                console.error(err);
              });
          }
        })
        .catch(err => {
          console.log("FCM err, Something has gone wrong!", err);
        });
      console.log("invitee updated send push notification to ", newer.name);
    }

    if (!old.withinOneMile && newer.withinOneMile) {
      admin
        .database()
        .ref("/users/" + context.params.userId + "/deviceTokens")
        .once("value")
        .then(deviceTokens => {
          deviceTokens = deviceTokens.val();
          console.log(
            "within one mile, revert to ",
            context.params.userId,
            "",
            deviceTokens
          );
          if (deviceTokens) {
            let msg =
              "User " +
              newer.name +
              " is reaching the destination and is within a mile  ";
            var message = {
              registration_ids: deviceTokens, // required fill with device token or topics
              notification: {
                title: newer.name + " is within a mile from event location",
                body: msg
              },
              data: {
                type: "HOST_ONE_MILE",
                event_id: context.params.eventId,
                host_id: context.params.userId,
                invitee_id: context.params.inviteeid
              }
            };
            console.log("invitation notification", message);
            fcm
              .send(message)
              .then(response => {
                console.log("Successfully sent with response: ", response);
                return true;
              })
              .catch(err => {
                console.log("FCM err, Something has gone wrong!");
                console.error(err);
              });
          }
        })
        .catch(err => {
          console.log("FCM err, Something has gone wrong!", err);
        });
    }
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

exports.status_changed = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onUpdate((snapshot, context) => {
    const old = snapshot.before.val();
    const newer = snapshot.after.val();
    console.log(snapshot.after.val());
    console.log(snapshot.before.val());
    if (old.status === "inProgress" && newer.status === "confirmed") {
      if (!newer.invite_sent) {
        admin
          .database()
          .ref("/users/" + context.params.userId)
          .once("value")
          .then(userRecord => {
            userRecord = userRecord.val();

            console.log("here");
            console.log(newer.invitee);
            for (var key in newer.invitee) {
              console.log(key, newer.invitee[key]);
              admin
                .database()
                .ref(
                  "/users/" +
                    context.params.userId +
                    "/event/" +
                    context.params.eventId
                )
                .update({ invite_sent: true });

              admin
                .database()
                .ref("/users/" + key + "/deviceTokens")
                .once("value")
                .then(deviceTokens => {
                  deviceTokens = deviceTokens.val();
                  console.log(
                    "Send invite to ",
                    newer.invitee[key].name,
                    "",
                    deviceTokens
                  );
                  if (deviceTokens) {
                    let msg =
                      "You have been invited by " +
                      userRecord.name +
                      " for an event " +
                      newer.eventTitle +
                      ", of type " +
                      newer.eventType +
                      " which starts on " +
                      newer.startDate +
                      " at" +
                      newer.startTime +
                      " and will end on " +
                      newer.endDate +
                      " at" +
                      newer.endTime;
                    var message = {
                      registration_ids: deviceTokens, // required fill with device token or topics
                      notification: {
                        title: "Event Invitation",
                        body: msg
                      },
                      data: {
                        type: "EVENT_INVITED",
                        event_id: context.params.eventId,
                        host_id: context.params.userId
                      }
                    };
                    console.log("invitation notification", message);
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
                  } else if (newer.invitee[key].phone) {
                    let msg =
                      "Hi! " +
                      newer.invitee[key].name +
                      ", you have been invited by " +
                      userRecord.name +
                      " for an event " +
                      newer.eventTitle +
                      ", of type " +
                      newer.eventType +
                      " which starts on " +
                      newer.startDate +
                      " at" +
                      newer.startTime +
                      " and will end on " +
                      newer.endDate +
                      " at" +
                      newer.endTime;
                    sendSMS(newer.invitee[key].phone, msg);
                  } else {
                    let txt =
                      "Nice, " +
                      userRecord.name +
                      " has invited you to " +
                      newer.eventTitle +
                      " on " +
                      newer.startDate +
                      " at " +
                      newer.startTime +
                      " via the hoozin app! You can respond by clicking here. \n If you have not downloaded the hoozin app and logged in, please do so before  clicking the link to respond. You can download the Hoozin app from the app store by clicking {link to app in Apple app store}, or from the Google Play store by clicking {link to app in Google Play}. \n Please keep in mind that this invite is intended for you only and should not be forwarded.";
                    sendWelcomeEmail(
                      newer.invitee[key].email,
                      "test",
                      txt,
                      "Invitation"
                    );
                  }
                });

              sendWelcomeEmail(
                "omkar2008@gmail.com",
                "test",
                key + "" + JSON.stringify(newer.invitee[key].name),
                "Invitation"
              );
            }
            return true;
          })
          .catch(error => {
            console.log("Error fetching user data:", error);
            return null;
          });
      }
    }
  });

exports.event_created = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onUpdate((snapshot, context) => {
    const event = snapshot.after.val();
    const bef = snapshot.before.val();
    if (!bef.status && event.status === "confirmed") {
      console.log("New email", event);
      admin
        .auth()
        .getUser(context.params.userId)
        .then(userRecord => {
          if (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully fetched user data:", userRecord);
            if (event.status === "confirmed") {
              return sendWelcomeEmail(
                userRecord.email,
                "",
                "Event " +
                  event.eventTitle +
                  " has been successfully created on " +
                  event.startDate +
                  " at " +
                  event.startTime,
                "Your Hoozin Event is confirmed"
              );
            } else {
              return null;
            }
          }
        })
        .catch(error => {
          console.log("Error fetching user data:", error);
          return false;
        });
    }
    return true;
  });
/*
exports.added_invitee = functions.database.ref('users/{userId}/event/{eventId}/invitee').on("child_added",(event,context)  => {
        event=event.val();
        console.log(event);
    });

exports.invitee_added = functions.database.ref('users/{userId}/event/{eventId}/invitee/{user}').onCreate((event,context)  => {
        event=event.val();
        console.log('New email', event);
        console.log('user id', JSON.stringify(context.params.userId));
        console.log('event id', JSON.stringify(context.params.eventId));
        if(!event.invite_sent) {
            admin.database().ref('/users/' + context.params.userId).once('value').then((userRecord) => {
                userRecord=userRecord.val();
            admin.database().ref('/users/' + context.params.userId + '/event/' + context.params.eventId).once('value').then((snapshot) => {
                snapshot=snapshot.val();
            if (snapshot.status === "confirmed") {
                console.log("Send invite to " + event.name);
                let msg = "Hello! " + event.name + ", you have been invited by " + userRecord.name + " for an event " + snapshot.eventTitle + ", of type " + snapshot.eventType + " which starts on " + snapshot.startDate + " at" + snapshot.startTime + " and will end on " + snapshot.endDate + " at" + snapshot.endTime;
                console.log(msg);
                admin.database().ref('/users/' + context.params.userId + '/event/' + context.params.eventId).update({invite_sent: true});
                if (event.phone) {
                    return sendSMS(event.phone, msg);
                }
                else {
                    return sendWelcomeEmail(event.email, "", msg);
                }
            }
            else {
                return null;
            }
        });
        })
        .catch((error) => {
                console.log("Error fetching user data:", error);
        });
        }
        return true;
});

*/

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
