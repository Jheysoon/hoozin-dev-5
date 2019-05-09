import firebase from "react-native-firebase";

let ref = null;
let listener = null;

export const getInviteeLocation = invitees => async dispatch => {
  let connectedRef = firebase.database().ref(".info/connected");

  connectedRef.on("value", snap => {
    if (snap.val()) {
      ref = firebase.database().ref("userLocation");

      listener = ref.on("value", snapshot => {
        const result = {};
        invitees.forEach(userId => {
          result[userId] = snapshot._value[userId] || null;
        });

        dispatch({
          type: "INVITEE_LOCATIONS",
          payload: {
            locations: result
          }
        });
      });
    }
  });
};

export const detachListeners = () => async dispatch => {
  if (ref) {
    ref.off("value", listener);
  }
};

export const addUserToEvent = (userInvitee, inviteeId, eventId) => {
  return dispatch => {
    let connectedRef = firebase
      .database()
      .ref(".info/connected")
      .once("value");

    return connectedRef.then(snap => {
      if (snap.val()) {
        firebase
          .database()
          .ref(`invitees/${eventId}/${inviteeId}`)
          .set({ userId: inviteeId, ...userInvitee }, () => {
            firebase
              .database()
              .ref(`eventList/${inviteeId}`)
              .once("value")
              .then(userSnapShot => {
                if (userSnapShot._value) {
                  const eventList = userSnapShot._value || [];
                  eventList.push({
                    eventId: eventId,
                    hostId: this.props.user.socialUID
                  });
                  // now update the node
                  firebase
                    .database()
                    .ref(`eventList`)
                    .update({ [inviteeId]: eventList });
                }
              });
          });
      }
    });
  };
};

export const getEventInvitee = eventId => {
  return dispatch => {
    let connectedRef = firebase
      .database()
      .ref(".info/connected")
      .once("value");

    return connectedRef.then(snap => {
      if (snap.val()) {
        return firebase
          .database()
          .ref(`invitees/${eventId}`)
          .once("value")
          .then(inviteeSnapshot => {
            if (inviteeSnapshot._value) {
              return Object.keys(inviteeSnapshot._value).map(key => {
                inviteeSnapshot._value[key]["inviteeId"] = key;
                return inviteeSnapshot._value[key];
              });
            } else {
              return [];
            }
          });
      }
    });
  };
};
