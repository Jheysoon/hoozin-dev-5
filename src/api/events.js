import { AsyncStorage } from "react-native";
import { UserManagementServiceAPI } from "./users.api";
import firebase from "react-native-firebase";
import moment from "moment";
import Geocoder from "react-native-geocoder";

/**
 * Handles all the event related tasks such as new event creation, edit/update event information, add/remove invitee,
 * tracking peer activity etc.
 */
export class EventServiceAPI {
  /**
   * @description the function creates an event
   * @param {string} startDate
   * @param {string} startTime
   * @param {string} endDate
   * @param {string} endTime
   * @param {string} eventTitle
   * @param {string} eventType
   * @param {string} location
   * @param {boolean} privateValue
   * @param {string} socialUID
   * @param {string} status
   * @param {string} eventId
   */
  async upsertEventData(
    startDate,
    startTime,
    endDate,
    endTime,
    eventTitle,
    eventType,
    location,
    privateValue,
    socialUID,
    status,
    eventId
  ) {
    const path = "users/" + socialUID + "/event";
    let evtCoords = {};
    console.log("[Event API] Location Request For", location);

    // Geocode location first
    await Geocoder.geocodeAddress(location)
      .then(res => {
        console.log("[Event API] Geodecoded Location", res);
        evtCoords = res[0].position;
      })
      .catch(err => (evtCoords = {}));

    if (eventId) {
      // just update event data
      return firebase
        .database()
        .ref(`${path}/${eventId}`)
        .update({
          startDate,
          startTime,
          startDateTimeInUTC: moment.utc(
            moment(`${startDate} ${startTime}`, "YYYY-MM-DD hh:mm A")
          ),
          endDate,
          endTime,
          endDateTimeInUTC: moment.utc(
            moment(`${endDate} ${endTime}`, "YYYY-MM-DD hh:mm A")
          ),
          eventCreationTime: moment.utc(),
          eventTitle,
          eventType,
          location,
          evtCoords,
          privateValue,
          status
        })
        .then(result => {
          let retData = {};
          return retData;
        })
        .catch(err => {
          return Promise.reject(new Error(err));
        });
    } else {
      // create new event
      return firebase
        .database()
        .ref()
        .child("users")
        .child(socialUID)
        .once("value")
        .then(function(snapshot) {
          let ref = firebase
            .database()
            .ref(path)
            .push({
              startDate,
              startTime,
              startDateTimeInUTC: moment.utc(
                moment(`${startDate} ${startTime}`, "YYYY-MM-DD hh:mm A")
              ),
              endDate,
              endTime,
              endDateTimeInUTC: moment.utc(
                moment(`${endDate} ${endTime}`, "YYYY-MM-DD hh:mm A")
              ),
              eventTitle,
              eventType,
              location,
              evtCoords,
              privateValue,
              status,
              eventCreationTime: moment.utc()
            });
          if (ref) {
            let retData = { userData: snapshot._value, key: ref.key };

            return retData;
          } else {
            return Promise.reject(new Error(error));
          }
        });
    }
  }

  /**
   * @description remove a particular event from invited user(s) first, if any and then delete the event from host
   * @param {string} eventId
   * @param {string} userId
   */
  async removeEventFromHostAndInviteeAPI(eventId, userId) {
    console.log("++ API : ++", userId);
    const userSvc = new UserManagementServiceAPI();
    const inviteeData = await this.getEventInviteesDetailsAPI2(eventId, userId);

    if (inviteeData) {
      await Promise.all(
        inviteeData.map(async inviteeUser => {
          let userData = await userSvc.getUserDetailsAPI(inviteeUser.inviteeId);
          if (userData) {
            userData.eventList = userData.eventList.filter(item =>
              item.hostId == userId && item.eventId == eventId ? false : true
            );
            await userSvc.updateUserDetailsAPI(inviteeUser.inviteeId, {
              eventList: userData.eventList
            });
          }
        })
      );
    }
    const opresult = await this.removeEventFromHostAPI(eventId, userId);
    return !opresult ? true : false;
  }

  /**
   * @description remove a particular event from host user
   * @param {string} eventId
   * @param {string} userId
   */
  removeEventFromHostAPI(eventId, userId) {
    return firebase
      .database()
      .ref(`users/${userId}/event/${eventId}`)
      .remove();
  }

  /**
   * @description Get details of an existing event
   * @param {string} eventId
   * @param {string} userId
   */
  async getEventDetailsAPI(eventId, userId) {
    let connect = await this.checkForConnection();

    if (connect.val()) {
      return firebase
        .database()
        .ref(`users/${userId}/event/${eventId}`)
        .orderByChild("eventTitle")
        .once("value")
        .then(eventDetailsSnapshot => eventDetailsSnapshot._value || null);
    } else {
      return null;
    }
  }

  /**
   * @description Get details of an existing event
   * @param {string} eventId
   * @param {string} userId
   */
  getEventDetailsAPI2(eventId, userId) {
    return firebase
      .database()
      .ref(`users/${userId}/event/${eventId}`)
      .orderByChild("eventTitle")
      .once("value")
      .then(eventDetailsSnapshot => eventDetailsSnapshot._value || null);
  }

  /**
   * @description get all events for the current user
   * @param {string} userId
   */
  getAllEventsAPI(userId) {
    return firebase
      .database()
      .ref(`users/${userId}/event`)
      .orderByChild("eventTitle")
      .once("value");
  }

  /**
   * @description Get invitee details of an existing event
   * @param {string} eventId
   * @param {string} userId
   */
  getEventInviteesDetailsAPI(eventId, userId) {
    return firebase
      .database()
      .ref(`users/${userId}/event/${eventId}/invitee`)
      .once("value");
  }

  /**
   * @description Get invitee details of an existing event
   * @param {string} eventId
   * @param {string} userId
   * @param {boolean=} shouldPreselect
   */
  getEventInviteesDetailsAPI2(eventId, userId, shouldPreselect) {
    let connectedRef = firebase.database().ref(".info/connected");

    return connectedRef.once("value").then(val => {
      if (val.val()) {
        return firebase
          .database()
          .ref(`users/${userId}/event/${eventId}/invitee`)
          .once("value")
          .then(inviteeSnapshot => {
            if (inviteeSnapshot._value) {
              return Object.keys(inviteeSnapshot._value).map(key => {
                inviteeSnapshot._value[key]["inviteeId"] = key;
                if (shouldPreselect) {
                  inviteeSnapshot._value[key]["preselect"] = true;
                }
                return inviteeSnapshot._value[key];
              });
            } else {
              return null;
            }
          });
      } else {
        return null;
      }
    });
  }

  getEventInviteeDetail(hostUserId, inviteeId, eventId) {
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}/invitee/${inviteeId}`)
      .once("value")
      .then(inviteeSnapshot => inviteeSnapshot._value || null);
  }

  /**
   * @description get details the current user's particular friend
   * @param {string} userId
   * @param {string} friendId
   */
  getUsersFriendDetailsAPI(userId, friendId) {
    return firebase
      .database()
      .ref(`users/${userId}/friends/${friendId}`)
      .once("value");
  }

  /**
   * @description get details of the current user
   * @param {string} userId
   */
  getUserDetailsAPI(userId) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .once("value");
  }

  /**
   * @description get details of the current user
   * @param {string} userId
   */
  getUserDetailsAPI2(userId) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .once("value")
      .then(userDetailsSnapshot => userDetailsSnapshot._value || null);
  }

  /**
   * @description update current user's particular friend's eventList array
   * @param {string} userId
   * @param {string} friendId
   * @param {*} eventList
   */
  updateUsersFriendEventListAPI(userId, friendId, eventList) {
    return firebase
      .database()
      .ref(`users/${userId}/friends/${friendId}`)
      .update({ eventList: eventList });
  }

  /**
   * @description update current user's eventList array
   * @param {string} userId
   * @param {*} eventList
   */
  updateUserEventListAPI(userId, eventList) {
    return firebase
      .database()
      .ref(`users/${userId}`)
      .update({ eventList: eventList });
  }

  /**
   * @description update invite response status to a particular event
   * @param {string} response
   * @param {string} hostUserId
   * @param {string} eventId
   * @param {string} inviteeId
   */
  updateEventInviteeResponse(response, hostUserId, eventId, inviteeId) {
    firebase
      .database()
      .ref(".info/connected")
      .once("value")
      .then(val => {
        if (val.val()) {
          return firebase
            .database()
            .ref(`users/${hostUserId}/event/${eventId}/invitee/${inviteeId}`)
            .update({ status: response });
        }
      });
  }

  /**
   * @description update invite response status to a particular event
   * @param {string} hostUserId
   * @param {string} eventId
   * @param {string} inviteeId
   * @param {Object<any>} payload
   * @param {string} fieldName
   */
  updateEventInviteeDataAPI(hostUserId, eventId, inviteeId, payload) {
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}/invitee/${inviteeId}`)
      .update(payload);
  }

  /**
   * @description create an user for invitation
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @param {string} phone
   */
  createInvitedUser(email, password, name, phone) {
    return firebase
      .auth()
      .createUserAndRetrieveDataWithEmailAndPassword(email, password)
      .then(data => {
        const path = "users/" + data.user.uid;
        firebase
          .database()
          .ref(path)
          .set({
            name: name,
            email: email,
            phone: phone,
            accountType: "custom",
            status: "invited"
          });
        return data;
      })
      .catch(error => {
        console.log(`Create an account failed with error: ${error}`);
        return Promise.reject(new Error(error));
      });
  }

  /**
   * @description Remove invitee user from an event
   * @param {string} userId
   * @param {string} eventId
   * @param {string} inviteeId
   */
  removeEventInviteeAPI(userId, eventId, inviteeId) {
    return firebase
      .database()
      .ref(`users/${userId}/event/${eventId}/invitee/${inviteeId}`)
      .remove();
  }

  /**
   * @description get details of the event
   * @param {string} userId
   * @param {string} eventId
   * @param {string} fieldname
   * @returns {Promise<Array>}
   */
  getEventDetailsByFieldAPI(userId, eventId, fieldname) {
    return firebase
      .database()
      .ref(`users/${userId}/event/${eventId}`)
      .once("value")
      .then(eventDetailsSnapshot => {
        if (eventDetailsSnapshot._value) {
          return eventDetailsSnapshot._value[fieldname] || [];
        }
      });
  }

  /**
   * @description update event details
   * @param {string} hostUserId
   * @param {string} eventId
   * @param {Object} payload
   * @param {string} fieldname
   * @param {boolean} isPinnedMode
   * @param {boolean=} shouldPin
   */
  async updateDataToEventAPI(
    hostUserId,
    eventId,
    payload,
    fieldname,
    isPinnedMode,
    shouldPin
  ) {
    const eventData = await this.getEventDetailsByFieldAPI(
      hostUserId,
      eventId,
      fieldname
    );
    let newData = {};
    if (eventData && !isPinnedMode) {
      eventData.push(payload);
      newData[fieldname] = eventData;
    } else if (eventData && isPinnedMode) {
      const updatedEventData = eventData.map(item => {
        if (item.id == payload.id) {
          item.pinned = shouldPin;
        }
        return item;
      });
      newData[fieldname] = updatedEventData;
    }
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}`)
      .update(newData)
      .then(result => eventData);
  }

  updateEventDataAPI(hostUserId, eventId, payload) {
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}`)
      .update(payload);
  }

  getEventDetailsByMultipleFieldAPI(hostUserId, eventId, fieldNameArr) {
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}`)
      .once("value")
      .then(eventDetailsSnapshot => {
        if (eventDetailsSnapshot._value) {
          const result = {};
          fieldNameArr.forEach(fieldName => {
            if (fieldName == "invitee") {
              result[fieldName] = Object.keys(
                eventDetailsSnapshot._value[fieldName]
              ).map(invitee => {
                eventDetailsSnapshot._value[fieldName][invitee][
                  "inviteeId"
                ] = invitee;
                return eventDetailsSnapshot._value[fieldName][invitee];
              });
            } else {
              result[fieldName] =
                eventDetailsSnapshot._value[fieldName] || null;
            }
          });
          return result;
        }
      });
  }

  async updateHostOrAttendeesChatMsgCounter(
    hostUserId,
    eventId,
    currentUserId,
    isHostUser,
    msgCounter
  ) {
    const {
      invitee: allInvitees,
      newMsgCount
    } = await this.getEventDetailsByMultipleFieldAPI(hostUserId, eventId, [
      "invitee",
      "newMsgCount"
    ]);

    if (!isHostUser) {
      const peerInvitees = allInvitees.filter(
        invitee => invitee.inviteeId != currentUserId
      );
      this.updateEventDataAPI(hostUserId, eventId, {
        newMsgCount: newMsgCount ? newMsgCount + msgCounter : msgCounter
      });
      return Promise.all(
        peerInvitees.map(async ({ inviteeId, newMsgCount }) => {
          await this.updateEventInviteeDataAPI(hostUserId, eventId, inviteeId, {
            newMsgCount: newMsgCount ? newMsgCount + msgCounter : msgCounter
          });
        })
      );
    }

    return Promise.all(
      allInvitees.map(async ({ inviteeId, newMsgCount }) => {
        await this.updateEventInviteeDataAPI(hostUserId, eventId, inviteeId, {
          newMsgCount: newMsgCount ? newMsgCount + msgCounter : msgCounter
        });
      })
    );
  }

  async resetChatMsgCounterAPI(
    hostUserId,
    eventId,
    currentUserId,
    isHostUser,
    msgCounter
  ) {
    const eventData = await this.getEventDetailsByFieldAPI(
      hostUserId,
      eventId,
      "invitee"
    );
    console.log("chat reset event data", eventData);
    const allInvitees = Object.keys(eventData).map(key => {
      eventData[key]["inviteeId"] = key;
      return eventData[key];
    });

    console.log("chat reset invitee data", allInvitees);
    if (!isHostUser) {
      const currentUserAsInvitee = allInvitees.filter(
        invitee => invitee.inviteeId == currentUserId
      )[0];
      return this.updateEventInviteeDataAPI(
        hostUserId,
        eventId,
        currentUserAsInvitee.inviteeId,
        { newMsgCount: msgCounter }
      );
    }
    return this.updateEventDataAPI(hostUserId, eventId, {
      newMsgCount: msgCounter
    });
  }

  async getEventInviteeById(hostUserId, eventId, inviteeId) {
    const eventData = await this.getEventDetailsByFieldAPI(
      hostUserId,
      eventId,
      "invitee"
    );

    return Object.keys(eventData)
      .filter(key => key == inviteeId)
      .map(invitee => eventData[invitee])[0];
  }

  getEventInviteeByFieldAPI(hostUserId, eventId, inviteeId, fieldName) {
    return firebase
      .database()
      .ref(
        `users/${hostUserId}/event/${eventId}/invitee/${inviteeId}/${fieldName}`
      )
      .once("value")
      .then(snapshot => snapshot.val() || null);
  }

  updateEventAPI(userId, eventId, payload) {
    return firebase
      .database()
      .ref(`users/${userId}/event/${eventId}`)
      .update(payload);
  }

  updateInviteeAPI(hostUserId, inviteeId, eventId, payload) {
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}/invitee/${inviteeId}`)
      .update(payload);
  }

  watchForEventDataByFieldAPI(hostUserId, eventId, fieldName) {
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}/${fieldName}`);
  }

  watchForEventInviteeDataAPI(hostUserId, eventId, inviteeId) {
    return firebase
      .database()
      .ref(`users/${hostUserId}/event/${eventId}/invitee/${inviteeId}`);
  }
  watchForEventInviteeDataByFieldAPI(
    hostUserId,
    eventId,
    inviteeId,
    fieldName
  ) {
    return firebase
      .database()
      .ref(
        `users/${hostUserId}/event/${eventId}/invitee/${inviteeId}/${fieldName}`
      );
  }

  watchForEventDataByAPI(hostUserId, eventId) {
    return firebase.database().ref(`users/${hostUserId}/event/${eventId}`);
  }

  async whetherAteendeeNearby(eventList, userId) {
    const userSvc = new UserManagementServiceAPI();

    const userLocation = await userSvc.getUserDetailsByFieldAPI(
      userId,
      "userLocation"
    );
    console.log("++ user location data ++", userLocation);
    if (userLocation) {
      eventList
        .filter(item => item.isActive && !item.isHostEvent)
        .forEach(item => {
          const isAttendeeNearby = this.determineLocationDifference(
            [Number(userLocation.lat), Number(userLocation.lng)],
            [item.evtCoords.lat, item.evtCoords.lng]
          );

          if (isAttendeeNearby) {
            this.updateInviteeAPI(item.hostId, userId, item.keyNode, {
              withinOneMile: true
            });
          }
        });
    }
  }

  /**
   * @description Check for connection to firebase server
   *
   * @returns {Promise}
   */
  checkForConnection() {
    return firebase
      .database()
      .ref(".info/connected")
      .once("value");
  }

  /**
   * @description Add user to event
   *
   * @param userInvitee
   * @param inviteeId
   * @param eventId
   */
  addUserToEvent(userInvitee, inviteeId, eventId) {
    return new Promise(async (resolve, reject) => {
      let connect = await this.checkForConnection();

      if (connect.val()) {
        firebase
          .database()
          .ref(`invitees/${eventId}/${inviteeId}`)
          .set({ userId: inviteeId, ...userInvitee }, () => {
            resolve();
          });
      } else {
        reject();
      }
    });
  }

  /**
   * @description Remove user from event
   *
   * @param {*} eventId
   * @param {*} inviteeId
   */
  async removeUserFromEvent(eventId, inviteeId) {
    let connect = await this.checkForConnection();

    if (connect.val()) {
      firebase
        .database()
        .ref(`invitees/${eventId}/${inviteeId}`)
        .remove();
    }
  }

  async getEventInvitees(eventId) {
    let connect = await this.checkForConnection();

    if (connect.val()) {
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
    } else {
      return [];
    }
  }
}
