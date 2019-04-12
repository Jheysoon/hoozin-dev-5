import firebase from "react-native-firebase";

/**
 * API class to manage user related queeies and operations throughout the app
 */
export class UserManagementServiceAPI {
  constructor(options) {
    this.options = options;
  }

  /**
   * @description Search entire user base by phone number
   * @param {string} phone
   */
  searchUserbaseByPhoneAPI(phone) {
    return firebase
      .database()
      .ref("users")
      .orderByChild("phone")
      .equalTo(phone)
      .once("value");
  }

  /**
   * @description Search entire user base by email
   * @param {string} email
   */
  searchUserbaseByEmailAPI(email) {
    return firebase
      .database()
      .ref("users")
      .orderByChild("email")
      .equalTo(email)
      .once("value");
  }

  /**
   * @description Search entire user base by name
   */
  getAllUsersList() {
    return firebase
      .database()
      .ref("users")
      .orderByChild("name")
      .once("value")
      .then(
        userSnapshot =>
          Object.keys(userSnapshot._value)
            .map(userKey => {
              const user = userSnapshot._value[userKey];
              user["key"] = userKey;
              return !!user && !!user.accountType ? user : null;
            })
            .filter(user => user) || null
      );
  }

  /**
   * @description get details of the current user
   * @param {string} userId
   */
  getUserDetailsAPI(userId) {

    return firebase.database().ref(".info/connected").once("value").then(val => {
      if (val.val()) {
        return firebase
          .database()
          .ref(`users/${userId}`)
          .once("value")
          .then(userDetailsSnapshot => userDetailsSnapshot._value || null);
      } else {
        return null;
      }

    })

  }

  /**
   * @description get details of the current user
   * @param {string} userId
   * @param {string} fieldname
   */
  getUserDetailsByFieldAPI(userId, fieldname) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .once("value")
      .then(userDetailsSnapshot => {
        if (userDetailsSnapshot._value) {
          return userDetailsSnapshot._value[fieldname] || [];
        }
      });
  }

  /**
   * @description get multiple field details at once of the current user
   * @param {string} userId
   * @param {Array<string>} fieldnameArr
   */
  getUserDetailsByMultipleFieldsAPI(userId, fieldnameArr) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .once("value")
      .then(userDetailsSnapshot => {
        if (userDetailsSnapshot._value) {
          const result = {};
          fieldnameArr.forEach(fieldName => {
            result[fieldName] = userDetailsSnapshot._value[fieldName] || null;
          });
          return result;
        }
      });
  }

  /**
   * @description get details of the current user's friend list
   * @param {string} userId
   * @param {boolean=} shouldPreselect
   */
  getUsersFriendListAPI(userId, shouldPreselect) {

    return firebase.database().ref(".info/connected").once("value").then(val => {
      if (val.val()) {
        return firebase
          .database()
          .ref(`users/${userId}/friends`)
          .once("value")
          .then(friendSnapshot => {
            if (friendSnapshot._value) {
              return Promise.all(
                friendSnapshot._value.map(async friendKey => {
                  const friendData = await this.getUserDetailsAPI(friendKey.userId);
                  return {
                    id: friendKey.userId,
                    name: friendData.name,
                    email: friendData.email,
                    phone: friendData.phone,
                    //eventList: friendData.eventList,
                    //event: friendData.event,
                    profileImgUrl: friendData.profileImgUrl || "",
                    preselect: shouldPreselect || false
                  };
                })
              );
            }
            return null;
          });
      } else {
        return null;
      }
    })


  }

  /**
   * @description update details of the current user
   * @param {string} userId
   * @param {*} payload
   */
  updateUserDetailsAPI(userId, payload) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .update(payload);
  }

  /**
   * @description upload user profile image to the Firebase Storage
   * @param {string} imgName
   * @param {sring} imgUrl
   */
  uploadUserProfileImage(imgName, imgUrl) {
    return firebase
      .storage()
      .ref(`/userprofile/${imgName}.jpg`)
      .put(imgUrl, { contentType: "image/jpg" });
  }

  /**
   * @description upload user profile image to the Firebase Storage
   * @param {string} imgName
   * @param {sring} imgUrl
   */
  uploadEventImage(imgName, imgUrl) {
    return firebase
      .storage()
      .ref(`/eventphotos/${imgName}.jpg`)
      .put(imgUrl, { contentType: "image/jpg" });
  }

  watchForUserDataByFieldAPI(userId, fieldName) {
    return firebase.database().ref(`users/${userId}/${fieldName}`);
  }
}
