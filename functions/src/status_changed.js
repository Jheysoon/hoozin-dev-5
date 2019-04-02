var FCM = require("fcm-push");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const _ = require("lodash");
const { sendSMS, sendWelcomeEmail } = require("./utils");

exports.status_changed = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onUpdate((snapshot, context) => {
    const old = snapshot.before.val();
    const newer = snapshot.after.val();

    if (old.status === "inProgress" && newer.status === "confirmed") {
      if (!newer.invite_sent) {
        admin
          .database()
          .ref(`invitees/${context.params.eventId}`)
          .once("value")
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
                    let msg = "You have been invited by " + userRecord.name + " for an event " + newer.eventTitle + ", of type " +
                      newer.eventType + " which starts on " + newer.startDate +  " at" + newer.startTime + " and will end on " +
                      newer.endDate + " at" + newer.endTime;

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
                  } else if (val.phone) {
                    // prettier-ignore
                    let msg = "Hi! " + newer.invitee[key].name + ", you have been invited by " + userRecord.name + " for an event " +
                      newer.eventTitle + ", of type " + newer.eventType + " which starts on " + newer.startDate + " at" +
                      newer.startTime + " and will end on " + newer.endDate +  " at" + newer.endTime;

                    sendSMS(val.phone, msg);
                  } else {
                    // prettier-ignore
                    let txt = "Nice, " +  userRecord.name + " has invited you to " +
                      newer.eventTitle + " on " + newer.startDate + " at " + newer.startTime +
                      " via the hoozin app! You can respond by clicking here. \n If you have not downloaded the hoozin app and logged in, please do so before  clicking the link to respond. You can download the Hoozin app from the app store by clicking {link to app in Apple app store}, or from the Google Play store by clicking {link to app in Google Play}. \n Please keep in mind that this invite is intended for you only and should not be forwarded.";

                    sendWelcomeEmail(val.email, "test", txt, "Invitation");
                  }
                });
            });

            return true;
          })
          .catch(error => {
            console.log("Error fetching user data:", error);
            return null;
          });
      }
    }
  });
