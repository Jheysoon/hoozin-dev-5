import firebase from "react-native-firebase";

export const getUserFriends = userId => {
  return (dispatch, getStore) => {
    const getUserFriends = firebase.functions().httpsCallable("getUserFriends");

    getUserFriends({
      id: userId
    }).then(friends => {
      dispatch({
        type: "GET_FRIEND_LIST",
        payload: {
          list: friends.data
        }
      });
    });
  };
};
