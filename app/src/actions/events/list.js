import firebase from "react-native-firebase";
import { AsyncStorage } from "react-native";
import {
  getInvitedEvents,
  mergeToHostedEvents,
  filterEventsByRSVP,
  recalculateFutureEvents
} from "../../utils/eventListFilter";
import { EventServiceAPI } from "../../api/events";

const mergeHosted = (
  hostedEventsPushKeyList,
  userId,
  eventRSVPFilterType,
  invitedEventsList,
  dispatch
) => {
  mergeToHostedEvents(
    hostedEventsPushKeyList,
    userId,
    eventRSVPFilterType,
    invitedEventsList
  ).then(events => {
    if (eventRSVPFilterType == "history") {
      events = events.filter(event =>
        filterEventsByRSVP(event, eventRSVPFilterType)
      );
    } else if (
      events &&
      eventRSVPFilterType != "history" &&
      eventRSVPFilterType != undefined
    ) {
      recalculateFutureEvents(events, eventRSVPFilterType).then(
        recalculatedEvents => {
          const filteredEventList = recalculatedEvents.filter(event =>
            filterEventsByRSVP(event, eventRSVPFilterType)
          );

          const eventApi = new EventServiceAPI();

          eventApi.whetherAteendeeNearby(filteredEventList, userId);

          AsyncStorage.setItem(
            "eventList_" + eventRSVPFilterType,
            JSON.stringify(filteredEventList)
          );
          dispatch({
            type: "FETCH_EVENTS",
            payload: {
              events: filteredEventList,
              fetching: false
            }
          });
        }
      );
    }

    if (eventRSVPFilterType == "history" || eventRSVPFilterType == undefined) {
      AsyncStorage.setItem(
        "eventList_" + eventRSVPFilterType,
        JSON.stringify(events)
      );
      dispatch({
        type: "FETCH_EVENTS",
        payload: {
          events: events
        }
      });
      dispatch({
        type: "SET_FETCHING",
        payload: {
          fetching: false
        }
      });
    }
  });
};

export const getEventList = (userId, eventRSVPFilterType) => {
  return dispatch => {
    let connectedRef = firebase.database().ref(".info/connected");

    dispatch({
      type: "SET_FETCHING",
      payload: {
        fetching: true
      }
    });

    connectedRef.on("value", snap => {
      if (snap.val()) {
        firebase
          .database()
          .ref("users/" + userId)
          .once("value", values => {
            if (values._value) {
              let hostedEventsPushKeyList = values._value.event || [];
              let invitedEventsMap = values._value.eventList || [];

              if (invitedEventsMap) {
                getInvitedEvents(invitedEventsMap, userId).then(
                  invitedEventsList => {
                    invitedEventsList = invitedEventsList.filter(item => item);
                    mergeHosted(
                      hostedEventsPushKeyList,
                      userId,
                      eventRSVPFilterType,
                      invitedEventsList,
                      dispatch
                    );
                  }
                );
              } else {
                mergeHosted(
                  hostedEventsPushKeyList,
                  userId,
                  eventRSVPFilterType,
                  invitedEventsMap,
                  dispatch
                );
              }
            }
          });
      } else {
        AsyncStorage.getItem(
          "eventList_" + eventRSVPFilterType,
          (err, result) => {
            if (err) {
              console.error(err.message);
            }
            if (result) {
              dispatch({
                type: "FETCH_EVENTS",
                payload: {
                  events: JSON.parse(result)
                }
              });
              dispatch({
                type: "SET_FETCHING",
                payload: {
                  fetching: false
                }
              });
            }
          }
        );
      }
    });
  };
};
