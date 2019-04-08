const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
var FCM = require("fcm-push");
const { serverKey } = require("./constants");
const fcm = new FCM(serverKey);

exports.chat = functions.database
  .ref("users/{userId}/event/{eventId}/messages/{messageid}")
  .onCreate((snap, context) => {
    const snapshot = snap.val();
    console.log(
      "/users/" + context.params.userId + "event/" + context.params.eventId
    );

    var db = admin.database();

    Promise.all([
      db.ref(`/events/${context.params.eventId}`).once("value"),
      db.ref(`/invitees/${context.params.eventId}`).once("value")
    ]).then(([event, invitees]) => {
      invitees = invitees.val();
      event = event.val();

      _.forEach(invitees, val => {
        if (val.status == "going" || val.status == "maybe") {
          db.ref(`users/${val.userId}/deviceTokens`)
            .once("value")
            .then(deviceTokens => {
              deviceTokens = deviceTokens.val();

              if (deviceTokens) {
                let msg = snapshot.message;
                var message = {
                  registration_ids: deviceTokens, // required fill with device token or topics
                  notification: {
                    title: snapshot.userName + " @ " + event.eventTitle,
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
                    console.log("Successfully sent with response: ", response);
                    return true;
                  })
                  .catch(err => {
                    console.log("FCM err, Something has gone wrong!");
                    console.error(err);
                  });
              }
            });
        }
      });
    });
  });
