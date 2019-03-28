import { UserManagementServiceAPI } from "./users.api";
import firebase from "react-native-firebase";

export class LocationServiceAPI {
  /**
   * @description watch user location if the user allowed location share
   * @param {string} userId
   */
  watchUserLocation(userId) {
    navigator.geolocation.watchPosition(
      position => {
        // insert user location
        this.updateUserLocation(userId, position.coords);
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true
      }
    );
  }

  /**
   * @description update user location
   * @param {string} userId
   * @param {*} coordinate
   */
  async updateUserLocation(userId, coordinate) {
    const userSvc = new UserManagementServiceAPI();
    const payload = {
      userLocation: { lat: coordinate.latitude, lng: coordinate.longitude }
    };
    const updateOpResult = await userSvc.updateUserDetailsAPI(userId, payload);

    // new node for updating userlocation
    let connectedRef = firebase.database().ref(".info/connected");

    connectedRef.once("value", val => {
      if (val.val()) {
        firebase
          .database()
          .ref("userLocation/" + userId)
          .update({ lat: coordinate.latitude, lng: coordinate.longitude });
      }
    });
  }

  testAndPingService() {
    console.log("[LocationAPI] hello world!");
  }
}
