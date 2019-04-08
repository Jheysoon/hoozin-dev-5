const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

const msgCounter = 1;

exports.chatUpdateMsgCounter = functions.https.onCall((data, context) => {
  const { eventId, userId } = data;

  var invitees = [];
  var db = admin.database();

  db.ref(`invitees/${eventId}`)
    .once("value")
    .then(response => {
      invitees = response.val();

      return db.ref(`events/${eventId}`).once("value");
    })
    .then(event => {
      event = event.val();
      const { hostID, newMsgCount } = event;

      if (hostID != userId) {
        db.ref(`events/${eventId}`).update(
          {
            newMsgCount: newMsgCount ? newMsgCount + msgCounter : msgCounter
          },
          () => {

            const peerInvitees = _.filter(invitee => invitee.userId != userId);

            /**
             * @TODO backward compatibility, this should remove once the events have
             * fully transfered to the new node
             */
            db.ref(`users/${hostID}/${eventId}`).update({
              newMsgCount: newMsgCount ? newMsgCount + msgCounter : msgCounter
            });
            // end @TODO

            _.forEach(peerInvitees, ({ userId, newMsgCount }) => {
              db.ref(`invitees/${eventId}/${userId}`).update({
                newMsgCount: newMsgCount ? newMsgCount + msgCounter : msgCounter
              });
            });
          }
        );
      } else {
        _.forEach(invitees, ({ userId, newMsgCount }) => {
          db.ref(`invitees/${eventId}/${userId}`).update({
            newMsgCount: newMsgCount ? newMsgCount + msgCounter : msgCounter
          });
        });
      }

      return true;
    });
});
