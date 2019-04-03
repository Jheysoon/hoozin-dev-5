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

