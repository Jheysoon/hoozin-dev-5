const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.getUserFriends = functions.https.onCall((data, context) => {
  const { id } = data;
  const db = admin.database();

  return db
    .ref(`users/${id}/friends`)
    .once("value")
    .then(friends => {
      friends = friends.val();
      let req = [];

      _.forEach(friends, val => {
        req.push(db.ref(`users/${val.userId}`).once("value"));
      });

      if (_.size(req) > 0) {
        return Promise.all(req).then(users => {
          let output = [];

          _.forEach(users, val => {
            if (val.exisits()) {
              let id = val["key"];
              val = val.val();

              output.push({
                id: id,
                name: val.name,
                email: val.email,
                phone: val.phone,
                profileImgUrl: val.profileImgUrl || ""
              });
            }
          });

          return output;
        });
      } else {
        return [];
      }
    });
});
