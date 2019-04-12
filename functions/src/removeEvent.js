const _ = require("lodash");
var FCM = require("fcm-push");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { serverKey } = require("./constants");

const fcm = new FCM(serverKey);

function getEventInvitee(id) {
  return admin
    .database()
    .ref(`/invitees/${id}`)
    .once("value");
}

function removeEventFromUser(snapshot, id) {
  let db = admin.database();

  db.ref(`/events/${id}`)
    .once("value")
    .then(eventVal => {
      eventVal = eventVal.val();

      _.forEach(snapshot, invitee => {
        if (invitee.status == "going") {
          db.ref(`/users/${invitee.userId}`)
            .once("value")
            .then(user => {
              user = user.val();
              if (user) {
                let evtList = user["eventList"];

                evtList = _.remove(evtList, evt => {
                  return evt.eventId == id ? false : true;
                });

                admin
                  .database()
                  .ref(`users/${invitee.userId}`)
                  .update({ eventList: evtList }, () => {
                    if (user.deviceTokens) {
                      let message = {
                        registration_ids: user.deviceTokens,
                        notification: {
                          title: "Event Cancelled",
                          body:
                            "This " +
                            eventVal.eventTitle +
                            " has been cancelled"
                        },
                        data: {
                          type: "EVENT_CANCELLED"
                        }
                      };

                      fcm
                        .send(message)
                        .then(() => {
                          console.log("Event Cancelled");
                        })
                        .catch(err => {
                          console.log("FCM err, Something has gone wrong!");
                          console.error(err);
                        });
                    }
                  });
              }
            });
        }
      });

      // delete event
      db.ref(`invitees/${id}`).remove(() => {
        db.ref(`users/${eventVal.hostID}/event/${id}`).remove(() => {
          db.ref(`events/${id}`).remove();
        });
      });
    });
}

exports.removeEvent = functions.https.onCall((data, context) => {
  const { id } = data;

  getEventInvitee(id).then(invitees => {
    if (_.size(invitees.val()) > 0) {
      removeEventFromUser(invitees.val(), id);
    }
  });
});
