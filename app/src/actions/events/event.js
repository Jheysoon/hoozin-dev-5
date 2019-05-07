import firebase from "react-native-firebase";

import { EventServiceAPI } from "../../api";

const eventApi = new EventServiceAPI();

export const getEventInformation = (eventId, userId = null) => {
  return dispatch => {
    eventApi.getEventDetailsAPI(eventId, userId).then(eventDetail => {
      dispatch({
        type: "EVENT_DETAIL",
        payload: {
          detail: eventDetail || {}
        }
      });
    });
  };
};

export const getEvent = eventId => {
  return dispatch => {
    const getEvent = firebase.functions().httpsCallable("getEvent");

    getEvent({
      id: eventId
    }).then(({ data }) => {
      dispatch({
        type: "HZ_EVENT_DETAIL",
        payload: data
      });
    });
  };
};
