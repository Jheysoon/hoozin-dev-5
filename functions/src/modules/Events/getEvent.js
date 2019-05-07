const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.getEvent = functions.https.onCall((data, context) => {
  const { id } = data;

  let rtn = {
    event: {},
    host: {}
  };

  let db = admin.database();

  return db
    .ref(`events/${id}`)
    .once("value")
    .then(val => {
      return new Promise((resolve, reject) => {
        resolve(val.val());
      });
    })
    .then(event => {
      rtn["event"] = _.assign({ id: id }, event);

      return db.ref(`users/${event.hostID}`).once("value");
    })
    .then(user1 => {
      user = user1.val();

      rtn["host"] = {
        email: user.email,
        name: user.name,
        phone: user.phone,
        profileImgUrl: user.profileImgUrl,
        id: user1["key"]
      };

      return rtn;
    });
});
