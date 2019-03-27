import { AsyncStorage } from "react-native";
import firebase from "react-native-firebase";
import { AccessToken, LoginManager } from "react-native-fbsdk";
import GoogleSignIn from "react-native-google-sign-in";
import { LocationServiceAPI } from "./location.api";
import { GoogleSignin, statusCodes } from "react-native-google-signin";

let watcher;
let locationSvc;

/**
 * This file handles all the authentication related API calls on behalf of the application
 */
export class AuthServiceAPI {
  constructor(options) {
    this.options = options;
  }

  /**
   * @description the function handles signing in authentication - w/ email/password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<any>}
   */
  signInWithEmail(email, password) {
    return firebase
      .auth()
      .signInAndRetrieveDataWithEmailAndPassword(email, password)
      .then(currentUser => {
        // get user name from database first with the returned user id
        return this.fetchUserData(currentUser.user.uid).then(userSnapshot => {
          if (userSnapshot._value) {
            firebase
              .database()
              .ref("userLocation/" + currentUser.user._user.uid)
              .update({
                profileImgUrl: currentUser.user._user.photoURL || ""
              });
            // update storage with new user info
            return AsyncStorage.setItem(
              "userId",
              JSON.stringify({
                uid: currentUser.user.uid,
                email: email,
                password: password,
                accountType: "custom",
                socialUID: currentUser.user._user.uid,
                name: currentUser.user._user.displayName,
                profileImageUrl: currentUser.user._user.photoURL || ""
              })
            ).then(result => {
              // check whether its existing user
              return firebase
                .database()
                .ref(`users/${currentUser.user.uid}`)
                .once("value")
                .then(userSnapshot => {
                  if (userSnapshot._value) {
                    this.watchUserLocationChange(currentUser.user.uid);
                  }
                  return currentUser;
                });
            });
          }
        });
      })
      .catch(error => {
        return null;
      });
  }

  /**
   * @description the function handles Facebook oAuth
   * @returns {Promise<any>}
   */
  signInWithFacebook() {
    return LoginManager.logInWithReadPermissions([
      "public_profile",
      "email"
      //"user_hometown",
      //"user_location",
      //"user_friends"  // Facebook added this permission as of v4
    ])
      .then(result => {
        if (result.isCancelled) {
          return Promise.reject(new Error("The user cancelled the request"));
        }
        console.log(
          `Login success with permissions: ${result.grantedPermissions.toString()}`
        );
        // get the access token
        return AccessToken.getCurrentAccessToken();
      })
      .then(data => {
        const credential = firebase.auth.FacebookAuthProvider.credential(
          data.accessToken
        );

        return firebase.auth().signInAndRetrieveDataWithCredential(credential);
      })
      .then(currentUser => {
        currentUser.accountType = "facebook";

        firebase
          .database()
          .ref("userLocation/" + currentUser.user.uid)
          .update({
            profileImgUrl: currentUser.user._user.photoURL || ""
          });

        // Securely store UUID
        return AsyncStorage.setItem(
          "userId",
          JSON.stringify({ uid: currentUser.user.uid, accountType: "facebook" })
        ).then(() => {
          // check whether its existing user
          return firebase
            .database()
            .ref(`users/${currentUser.user.uid}`)
            .once("value")
            .then(userSnapshot => {
              if (userSnapshot._value) {
                this.watchUserLocationChange(currentUser.user.uid);
              }
              return currentUser;
            });
        });
      })
      .catch(error => {
        console.log(`Facebook login fail with error: ${error}`);
        return Promise.reject(new Error(error));
      });
  }

  /**
   * @description the function handles Google oAuth
   * @returns {Promise<any>}
   */
  async signInWithGoogle() {
    //Deprecated this entire script

    await GoogleSignin.configure({
      webClientId:
        "377447420217-tqv5jhoi9smfrun2hi5vb0lfvb5k0cnp.apps.googleusercontent.com",
      scopes: ["openid", "email", "profile"]
    });

    return await GoogleSignin.signIn()
      .then(data => {
        const credential = firebase.auth.GoogleAuthProvider.credential(
          data.idToken,
          data.accessToken
        );

        return firebase.auth().signInAndRetrieveDataWithCredential(credential);
      })
      .then(currentUser => {
        currentUser.accountType = "google";

        firebase
          .database()
          .ref("userLocation/" + currentUser.user.uid)
          .update({
            profileImgUrl: currentUser.user._user.photoURL || ""
          });

        return AsyncStorage.setItem(
          "userId",
          JSON.stringify({
            uid: currentUser.user.uid,
            accountType: "google",
            socialUID: currentUser.user.uid,
            profileImageUrl: currentUser.user._user.photoURL || ""
          })
        ).then(() => {
          return firebase
            .database()
            .ref(`users/${currentUser.user.uid}`)
            .once("value")
            .then(userSnapshot => {
              if (userSnapshot._value) {
                this.watchUserLocationChange(currentUser.user.uid);
              }
              return currentUser;
            });
        });
      })
      .catch(error => {
        console.log(`Google login fail with error: ${error}`);
        return Promise.reject(new Error(error));
      });
  }

  /**
   * @description handles password reset mechanism by Firebase
   * @param {string} email
   * @returns {Promise<any>}
   */
  forgotPassword(email) {
    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(data => {
        return data;
      })
      .catch(error => {
        return null;
      });
  }

  /**
   * @description logs out a signed in user
   * @returns {Promise<void>}
   */
  logOut(userId) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .update({ userLocation: [] })
      .then(() => {
        clearInterval(watcher);
        locationSvc = null;
        return firebase.auth().signOut();
      });
  }

  /**
   * @description Remove an user from the app permanently, requires the user to be signed in recently (IMPORTANT)
   */
  removeUser() {
    return firebase.auth().currentUser.delete();
  }

  /**
   * @description the function creates a user and saves a profile of the same user to maintain data
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} phone
   * @param {string} address
   * @param {string} facebook
   * @param {string} instagram
   * @param {string} linkedin
   * @param {string} twitter
   * @param {string} snapchat
   * @param {string} strava
   * @param {string} mapmyfitness
   * @param {string} accountType
   * @param {string} socialUID
   * @param {string} countryCode
   * @param {string} profileImgUrl
   * @param {string} userLocation
   * @returns {Promise<any>}
   */
  saveProfile(
    name,
    email,
    password,
    phone,
    address,
    facebook,
    instagram,
    linkedin,
    twitter,
    snapchat,
    strava,
    mapmyfitness,
    accountType,
    socialUID,
    countryCode,
    profileImgUrl,
    userLocation
  ) {
    // Milestone #1 or Milestone #2 - issue related to null node in Firebase due to accountType == 'custom' now instead of null
    // Issue - after Google login facebook login was not working or the vice versa because of the previous faulty condition
    if (accountType == "google" || accountType == "facebook") {
      const path = "users/" + socialUID;
      return firebase
        .database()
        .ref(path)
        .set({
          name: name.toLowerCase(),
          email: email,
          phone: phone,
          address: address,
          accountType: accountType,
          status: "confirmed",
          facebook: facebook,
          instagram: instagram,
          linkedin: linkedin,
          twitter: twitter,
          snapchat: snapchat,
          strava: strava,
          mapmyfitness: mapmyfitness,
          countryCode: countryCode,
          profileImgUrl: profileImgUrl
        })
        .then(result => {
          // set initial userLocation of user
          firebase
            .database() 
            .ref("userLocation/" + socialUID)
            .update({
              lat: 0,
              lng: 0,
              profileImgUrl: profileImgUrl
            });

          this.watchUserLocationChange(socialUID);
          return result;
        })
        .catch(error => {
          console.log(`Create an account failed with error: ${error}`);
          return Promise.reject(new Error(error));
        });
    } else {
      return firebase
        .auth()
        .createUserAndRetrieveDataWithEmailAndPassword(email, password)
        .then(data => {
          const path = "users/" + data.user.uid;
          console.log("data", data);
          firebase
            .database()
            .ref(path)
            .set({
              name: name.toLowerCase(),
              email: email,
              phone: phone,
              address: address,
              accountType: "custom",
              status: "confirmed",
              facebook: facebook,
              instagram: instagram,
              linkedin: linkedin,
              twitter: twitter,
              snapchat: snapchat,
              strava: strava,
              mapmyfitness: mapmyfitness,
              countryCode: countryCode,
              profileImgUrl: profileImgUrl
            });

          //set initial user location
          firebase
            .database()
            .ref("userLocation/" + data.user.uid)
            .update({
              lat: 0,
              lng: 0,
              profileImgUrl: profileImgUrl
            });
          // cache it immediately
          AsyncStorage.setItem(
            "userId",
            JSON.stringify({
              uid: data.user.uid,
              email: email,
              password: password,
              accountType: "custom"
            })
          ).then(result => {
            this.watchUserLocationChange(data.user.uid);
            console.log("++storage report ++", result);
          });
          return data;
        })
        .catch(error => {
          console.log(error);
          return Promise.reject(new Error(error));
        });
    }
  }

  /**
   * @description the function fetches information of a particular user
   * @param {string} userId
   * @returns {Promise<any>}
   */
  fetchUserData(userId) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .once("value");
  }

  /**
   * @description the function edit/update the user profile data
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} phone
   * @param {string} address
   * @param {string} facebook
   * @param {string} instagram
   * @param {string} linkedin
   * @param {string} twitter
   * @param {string} snapchat
   * @param {string} strava
   * @param {string} mapmyfitness
   * @param {string} accountType
   * @param {string} socialUID
   * @param {boolean} isNewPassword
   * @param {string} profileImgUrl
   * @returns {Promise<any>}
   */
  updateUserData(
    name,
    email,
    password,
    phone,
    address,
    facebook,
    instagram,
    linkedin,
    twitter,
    snapchat,
    strava,
    mapmyfitness,
    accountType,
    socialUID,
    isNewPassword,
    profileImgUrl
  ) {
    let ref = firebase
      .database()
      .ref()
      .child("users");

    // first check to see if the password is new
    if (isNewPassword) {
      firebase
        .auth()
        .currentUser.updatePassword(password)
        .then(result => console.log(result))
        .catch(err => console.error(err));
    }
    return ref
      .child(socialUID)
      .once("value")
      .then(function(snapshot) {
        return ref.child(socialUID).update({
          email: email,
          name: name.toLowerCase(),
          phone: phone,
          accountType: accountType,
          status: "confirmed",
          address: address,
          facebook: facebook,
          instagram: instagram,
          linkedin: linkedin,
          mapmyfitness: mapmyfitness,
          snapchat: snapchat,
          strava: strava,
          twitter: twitter,
          profileImgUrl: profileImgUrl
        });
      });
  }

  /**
   * @description the function records user's feedback
   * @param {string} email
   * @param {string} feedbackText
   * @param {string} uid
   * @param {number} timestamp
   * @returns {Promise<any>}
   */
  insertFeedbackData(email, feedbackText, uid, timestamp) {
    const path = `users/${uid}/feedback`;
    return firebase
      .database()
      .ref(path)
      .push({
        email: email,
        feedbackText: feedbackText,
        timestamp: timestamp
      });
  }

  /**
   * @description upload user profile picture
   * @param {string} uname
   * @param {string} uid
   * @param {string} imgdata
   */
  uploadUserProfileImg(uname, uid, imgdata) {
    console.log("+user name+", uname);
    let ref = firebase
      .storage()
      .ref()
      .child(`${uname}-${uid}-avatar.jpg`);
    ref.putString(imgdata, "data_url").then(result => {
      console.log("++upload result++", result.downloadURL);
    });
  }

  editUserProfileImg(uid, imgdata) {}

  updateUserCurrentLocation(coords, userId) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .update({ userLocation: coords });
  }

  watchUserLocationChange(uid) {
    locationSvc = new LocationServiceAPI();
    watcher = setInterval(() => locationSvc.watchUserLocation(uid), 10000);
  }
}
