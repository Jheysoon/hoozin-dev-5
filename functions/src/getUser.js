const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.getUser = functions.https.onCall((data, context) => {
  const { id } = data;

  return admin
    .database()
    .ref(`users/${id}`)
    .once("value")
    .then(user => {
      user = user.val();
      return {
        accountType: user.accountType,
        address: user.address,
        countryCode: user.countryCode,
        email: user.email,
        name: user.name,
        phone: user.phone,
        profileImgUrl: user.profileImgUrl,
        status: user.status
      };
    });
});
