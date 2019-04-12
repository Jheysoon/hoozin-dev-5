var FCM = require("fcm-push");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const _ = require("lodash");
const { sendSMS, sendWelcomeEmail } = require("./utils");
const { serverKey } = require("./constants");
const { sendEventNotification } = require("./sendEventNotification");

const fcm = new FCM(serverKey);

exports.status_changed = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onUpdate((snapshot, context) => {
    const old = snapshot.before.val();
    const newer = snapshot.after.val();

    if (old.status === "inProgress" && newer.status === "confirmed") {
      if (!newer.invite_sent) {
        let eventD;

        admin
          .database()
          .ref(`users/${context.params.userId}`)
          .once("value")
          .then(eventDetail => {
            eventD = eventDetail.val();

            return admin
              .database()
              .ref(`invitees/${context.params.eventId}`)
              .once("value");
          })
          .then(user => {
            user = user.val();

            // prettier-ignore
            var userRef = "/users/" + context.params.userId + "/event/" + context.params.eventId

            admin
              .database()
              .ref(userRef)
              .update({ invite_sent: true });

            _.forEach(user, val => {
              admin
                .database()
                .ref("/users/" + val.userId + "/deviceTokens")
                .once("value")
                .then(deviceTokens => {
                  deviceTokens = deviceTokens.val();

                  if (deviceTokens) {
                    // prettier-ignore
                    var msg = "You have been invited by " + eventD.name + " for an event " + newer.eventTitle + ", of type " +
                      newer.eventType + " which starts on " + newer.startDate +  " at" + newer.startTime + " and will end on " +
                      newer.endDate + " at" + newer.endTime;

                    const { eventId, userId } = context.params;

                    sendEventNotification(msg, deviceTokens, eventId, userId);
                  } else if (val.phone) {
                    /**
                     * @TODO change the 2nd val.name
                     */
                    // prettier-ignore
                    let msg = "Hi! " + val.name + ", you have been invited by " + eventD.name + " for an event " +
                      newer.eventTitle + ", of type " + newer.eventType + " which starts on " + newer.startDate + " at" +
                      newer.startTime + " and will end on " + newer.endDate +  " at" + newer.endTime;

                    sendSMS(val.phone, msg);
                  } else {
                    // prettier-ignore
                    let txt = "Nice, " +  eventD.name + " has invited you to " +
                      newer.eventTitle + " on " + newer.startDate + " at " + newer.startTime +
                      " via the hoozin app! You can respond by clicking here. \n If you have not downloaded the hoozin app and logged in, please do so before  clicking the link to respond. You can download the Hoozin app from the app store by clicking {link to app in Apple app store}, or from the Google Play store by clicking {link to app in Google Play}. \n Please keep in mind that this invite is intended for you only and should not be forwarded.";

                    sendWelcomeEmail(val.email, "test", txt, "Invitation");
                  }
                });
            });
          })
          .catch(error => {
            console.log("Error fetching user data:", error);
            return null;
          });
      }
    }
  });
