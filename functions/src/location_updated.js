var FCM = require("fcm-push");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { serverKey } = require("./constants");
const _ = require("lodash");

const fcm = new FCM(serverKey);

const ref = "users/{userId}/event/{eventId}";

exports.location_updated = functions.database
  .ref(ref)
  .onUpdate((snapshot, context) => {
    const old = snapshot.before.val();
    const newer = snapshot.after.val();

    var rtn = false;
    var msg;
    var message;

    if (old.location !== newer.location) {
      rtn = true;
      // prettier-ignore
      msg = "Location for an event " + newer.eventTitle + " has been updated from " + old.location + " to" + newer.location;

      message = {
        registration_ids: "", // required fill with device token or topics
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
    } else if (old.eventTitle !== newer.eventTitle) {
      rtn = true;

      // prettier-ignore
      msg = "Event title has been updated from " + old.eventTitle + " to " + newer.eventTitle;
      message = {
        registration_ids: "", // required fill with device token or topics
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
    } else if (old.eventType !== newer.eventType) {
      rtn = true;

      // prettier-ignore
      msg ="Event type has been updated from " + old.eventType + " to " + newer.eventType;
      message = {
        registration_ids: "", // required fill with device token or topics
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
    } else if (
      old.endTime !== newer.endTime ||
      old.endDate !== newer.endDate ||
      old.endDateTimeInUTC !== newer.endDateTimeInUTC ||
      old.startTime !== newer.startTime ||
      old.startDate !== newer.startDate ||
      old.startDateTimeInUTC !== newer.startDateTimeInUTC
    ) {
      rtn = true;

      msg = "Event time has been updated ";
      message = {
        registration_ids: "", // required fill with device token or topics
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
    }

    if (rtn) {
      getInvitees(context.params.eventId).then(resp => {
        var invitees = resp.val();

        _.forEach(invitees, val => {
          if (val.status == "going" || val.status == "maybe") {
            admin
              .database()
              .ref("/users/" + val.userId + "/deviceTokens")
              .once("value")
              .then(deviceTokens => {
                deviceTokens = deviceTokens.val();

                if (deviceTokens) {
                  message.registration_ids = deviceTokens;

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
                }
              });
          }
        });
      });
    }
  });

function getInvitees(eventId) {
  return admin
    .database()
    .ref("/invitees/" + eventId)
    .once("value");
}
