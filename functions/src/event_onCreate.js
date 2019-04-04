const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.event_onCreate = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onCreate((snapshot, context) => {
    admin
      .database()
      .ref(`events/${context.params.eventId}`)
      .set(snapshot.val());
      return true;
  });
