var FCM = require("fcm-push");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { sendWelcomeEmail } = require("./utils");

//admin.initializeApp(functions.config().firebase);

exports.event_created = functions.database
  .ref("users/{userId}/event/{eventId}")
  .onUpdate((snapshot, context) => {
    const event = snapshot.after.val();
    const bef = snapshot.before.val();

    if (!bef.status && event.status === "confirmed") {
      admin
        .auth()
        .getUser(context.params.userId)
        .then(user => {
          if (user) {
            if (event.status === "confirmed") {
              // prettier-ignore
              var text = "Event " + event.eventTitle + " has been successfully created on " + event.startDate +  " at " + event.startTime;
              var subject = "Your Hoozin Event is confirmed";
              return sendWelcomeEmail(user.email, "", text, subject);
            }
          }
        })
        .catch(error => {
          console.log("Error fetching user data:", error);
        });
    }
    return true;
  });
