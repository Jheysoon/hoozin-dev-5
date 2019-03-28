import firebase from "react-native-firebase";

export const getInviteeLocation = invitees => {
  return dispatch => {
    let connectedRef = firebase.database().ref(".info/connected");

    connectedRef.on("value", snap => {
      if (snap.val()) {
        firebase
          .database()
          .ref("userLocation")
          .on("value", snapshot => {
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
};
