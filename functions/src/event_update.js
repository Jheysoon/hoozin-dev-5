const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

/**
 * @description this should keep the new node of events updated
 *
 */

exports.event_update = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onUpdate((snapshot, context) => {
    const newEvent = snapshot.after.val();

    admin
      .database()
      .ref(`events/${context.params.eventId}`)
      .update(_.omit(newEvent, ["messages", "photos"]));

    return true;
  });
