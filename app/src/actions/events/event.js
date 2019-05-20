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

export const setLoading = () => {
  return dispatch => {
    dispatch({
      type: "HZ_DETAIL_LOADING"
    });
  };
};

export const getEvent = eventId => async dispatch => {
  dispatch({
    type: "HZ_DETAIL_LOADING"
  });

  const getEvent = firebase.functions().httpsCallable("getEvent");

  getEvent({
    id: eventId
  }).then(({ data }) => {
    dispatch({
      type: "SET_ACTIVE_MAP_COORDS",
      payload: {
        longitude: data.event.evtCoords.lng,
        latitude: data.event.evtCoords.lat,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    });
    dispatch({
      type: "HZ_EVENT_DETAIL",
      payload: data
    });
  });
};
