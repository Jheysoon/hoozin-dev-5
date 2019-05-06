const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { sendEventNotification } = require("./sendEventNotification");

exports.eventInvitee = functions.https.onCall((data, context) => {
  const { invitees, eventId } = data;

  admin
    .database()
    .ref(`events/${eventId}`)
    .once("value")
    .then(event => {
      event = event.val();

      return Promise((resolve, reject) => {
        resolve(event);
      });
    })
    .then(event => {
      admin
        .database()
        .ref(`users/${event.hostID}`)
        .once("value")
        .then(hostUser => {
          hostUser = hostUser.val();

          _.forEach(invitees, user => {
            admin
              .database()
              .ref(`users/${user.userId}/deviceTokens`)
              .once("value")
              .then(deviceTokens => {
                deviceTokens = deviceTokens.val();

                // prettier-ignore
                var msg = "You have been invited by " + hostUser.name + " for an event " + event.eventTitle + ", of type " +
                event.eventType + " which starts on " + event.startDate +  " at " + event.startTime + " and will end on " +
                event.endDate + " at " + event.endTime;

                sendEventNotification(msg, deviceTokens, eventId, event.hostID);
              });
          });
        });
    });
});
