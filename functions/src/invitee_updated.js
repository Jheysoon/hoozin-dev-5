var FCM = require("fcm-push");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { serverKey } = require("./constants");

const fcm = new FCM(serverKey);

var ref = "invitees/{eventId}/{inviteeId}";

exports.invitee_updated = functions.database
  .ref(ref)
  .onUpdate((snapshot, context) => {
    const old = snapshot.before.val();
    const newer = snapshot.after.val();

    admin
      .database()
      .ref("/users/" + context.params.userId + "/deviceTokens")
      .once("value")
      .then(deviceTokens => {
        deviceTokens = deviceTokens.val();
        var rtn = false;

        if (deviceTokens) {
          if (old.status !== newer.status && newer.status !== "invited") {
            rtn = true;

            // prettier-ignore
            var msg = "User " + newer.name + " has responded to your event with status  " + newer.status;

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
                invitee_id: context.params.inviteeId
              }
            };
          }

          if (!old.withinOneMile && newer.withinOneMile) {
            rtn = true;

            // prettier-ignore
            var msg = "User " + newer.name + " is reaching the destination and is within a mile  ";
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
                invitee_id: context.params.inviteeId
              }
            };
          }

          if (rtn) {
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
        }
      })
      .catch(err => {
        console.log("FCM err, Something has gone wrong!", err);
      });

    console.log("invitee updated send push notification to ", newer.name);
  });
