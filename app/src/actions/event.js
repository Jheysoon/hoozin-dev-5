import { EventServiceAPI } from "../api";
import { EVENT } from "../constants";
import userDefaults from "../lib/userDefaults";
import { getEventList } from './events/list';

/**
 * @description Action creator to handle new event creation
 * @param {string} startDate
 * @param {string} startTime
 * @param {string} endDate
 * @param {string} endTime
 * @param {string} eventTitle
 * @param {string} eventType
 * @param {string} location
 * @param {string} privateValue
 * @param {string} socialUID
 * @param {string} status
 * @param {string} eventId
 */
export const upsertEventDataAction = (
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
  eventId,
  evtCoords
) => {
  return (dispatch, getStore) => {
    const eventSvc = new EventServiceAPI();
    eventSvc
      .upsertEventData(
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
        eventId,
        evtCoords
      )
      .then(data => {
        let eventDetails = {
          startDate: startDate,
          startTime: startTime,
          endDate: endDate,
          endTime: endTime,
          eventTitle: eventTitle,
          eventType: eventType,
          location: location,
          privateValue: privateValue,
          eventKey: data.key,
          profileImageUrl: data.userData ? data.userData.profileImageUrl : "",
          status: status,
          eventId: eventId
        };
        dispatch({
          type: EVENT.ADD,
          data: data,
          eventDetails: eventDetails
        });
        
        dispatch(getEventList(socialUID));
      })
      .catch(err => {
        console.log(err);
        dispatch({
          type: EVENT.ERROR,
          data: false
        });
      });
  };
};

/**
 * @description action creator to remove an event
 * @param {string} eventKey
 */
export const removeEventDataAction = (eventKey, userId) => {
  return (dispatch, getStore) => {
    const eventSvc = new EventServiceAPI();
    eventSvc
      .removeEventAPI(eventKey, userId)
      .then(result => {
        console.log("== event remove operation ==", result);
        dispatch({
          type: EVENT.REMOVE
        });
      })
      .catch(err => {
        console.log(err);
        dispatch({
          type: EVENT.ERROR,
          data: false
        });
      });
  };
};
