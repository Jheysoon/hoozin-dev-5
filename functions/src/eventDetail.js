const _ = require("lodash");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports.eventDetail = functions.https.onCall((data, context) => {
  const { id } = data;

  let rtn = {
    event: {},
    invitees: [],
    user: {
      name: "",
      profileImgUrl: ""
    },
    friends: []
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
    .then(eventDetail => {
      rtn.event = eventDetail;

      return db.ref(`invitees/${id}`).once("value");
    })
    .then(inviteeSnapshot => {
      if (inviteeSnapshot.val()) {
        let processInvitees = [];

        _.forEach(inviteeSnapshot.val(), (invitee, key) => {
          processInvitees.push(
            _.assign(invitee, {
              inviteeId: key
            })
          );
        });

        rtn.invitees = processInvitees;
      }

      return db.ref(`users/${rtn.event["hostID"]}`).once("value");
    })
    .then(hostDetail => {
      hostDetail = hostDetail.val();
      rtn.user = {
        name: hostDetail.name,
        profileImgUrl: hostDetail.profileImgUrl
      };

      if (hostDetail.friends) {
        let req = [];

        _.forEach(hostDetail.friends, friend => {
          req.push(db.ref(`users/${friend.userId}`).once("value"));
        });

        if (_.size(req) > 0) {
          return Promise.all(req).then(friends => {
            let output = [];

            _.forEach(friends, val => {
              let id = val["key"];
              val = val.val();

              output.push({
                id: id,
                name: val.name,
                email: val.email,
                phone: val.photo,
                eventList: val.eventList,
                profileImgUrl: val.profileImgUrl || "",
                preselect: false
              });
            });

            rtn.friends = output;

            return rtn;
          });
        }

        return rtn;
      } else {
        return rtn;
      }
    });
});
