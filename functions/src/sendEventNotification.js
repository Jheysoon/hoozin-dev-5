var FCM = require("fcm-push");
const { serverKey } = require("./constants");
const fcm = new FCM(serverKey);

exports.sendEventNotification = function(body, deviceTokens, eventId, userId) {
  var message = {
    registration_ids: deviceTokens, // required fill with device token or topics
    notification: {
      title: "Event Invitation",
      body: body
    },
    data: {
      type: "EVENT_INVITED",
      event_id: eventId,
      host_id: userId
    }
  };

  fcm
    .send(message)
    .then(response => {
      console.log("Successfully sent with response: ", response);
      return true;
    })
    .catch(err => {
      console.log("FCM err, Something has gone wrong!");
      console.error(err);
      return false;
    });
};
