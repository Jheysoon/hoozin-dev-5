const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.insertInvitee = functions.https.onCall((data, context) => {
  const { eventId, userId } = data;

  admin
    .database()
    .ref(`/users/${userId}`)
    .once("value")
    .then(user => {
      user = user.val();

      admin
        .database()
        .ref(`/invitees/${eventId}/${userId}`)
        .set({
          email: user.email,
          name: user.name,
          newMsgCount: 0,
          phone: user.phone,
          profileImgUrl: user.profileImgUrl,
          status: "invited",
          userId: userId
        });
    });
});
