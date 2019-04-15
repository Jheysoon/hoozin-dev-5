const _ = require("lodash");
const admin = require("firebase-admin");

class EventsV1 {
  getEvents(user) {
    return admin
      .database()
      .ref(`users/${user}/events`)
      .once("value");
  }
}
