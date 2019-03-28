import firebase from "react-native-firebase";

export const changeUserLocation = (userId, location) => {
  return dispatch => {
    let param = {
      lat: location.latitude,
      lng: location.longitude
    };

    firebase
      .database()
      .ref("userLocation/" + userId)
      .update(param, () => {
        dispatch({
          type: "HOST_LOCATIONS",
          payload: {
            host_location: param
          }
        });
      });
  };
};

export const getUserLocation = userId => {
  return dispatch => {
    firebase
      .database()
      .ref("userLocation/" + userId)
      .once("value", val => {
        let v = val.val();
        dispatch({
          type: "HOST_LOCATIONS",
          payload: {
            host_location: v
          }
        });
      });
  };
};
