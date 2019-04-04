import _ from "lodash";
import {
  AuthServiceAPI,
  EventServiceAPI,
  UserManagementServiceAPI
} from "../api";
import moment from "moment";
/**
 * @description get only those events where the current user has been invited
 * @param {Array} eventsMap invited events map with 2 objects - eventId and hostId
 * @param {string} currentUserId - current logged in user id
 * @returns {Array}
 */
export const getInvitedEvents = (eventsMap, currentUserId) => {
  const eventSvc = new EventServiceAPI();
  // resolve invited events list first
  return Promise.all(
    eventsMap.map(async event => {
      return eventSvc
        .getEventDetailsAPI(event.eventId, event.hostId)
        .then(async eventData => {
          if (
            eventData &&
            eventData.status &&
            eventData.status == "confirmed"
          ) {
            const userData = await eventSvc.getUserDetailsAPI2(event.hostId);
            const invitees = await eventSvc.getEventInvitees(event.eventId);
           
            eventData.keyNode = event.eventId;

            _.forEach(invitees, invitee => {
              if (invitee.userId == currentUserId) {
                eventData.eventResponse = invitee["status"];
              }
            });

            eventData["invitee"] = invitees;

            eventData.isHostEvent = false;
            eventData.hostId = event.hostId;
            eventData.hostName = userData.name;
            eventData.hostProfileImgUrl = userData.profileImgUrl || "";
            return eventData;
          }
        });
    })
  );
};

/**
 * @description get only those events where the current user created those events
 * @param {Array} hostedEventsPushKeyList
 * @param {string} currentUserId - current logged in user id
 * @returns {Array}
 */
const getHostedEvents = async (hostedEventsPushKeyList, currentUserId) => {
  // change made on 25.09.2018 => host user picture related bug
  const userSvc = new UserManagementServiceAPI();
  const hostUserData = await userSvc.getUserDetailsByMultipleFieldsAPI(
    currentUserId,
    ["name", "profileImgUrl"]
  );

  if (hostUserData) {
    if (hostedEventsPushKeyList.length == 0) {
      return [];
    }
    // this will get hosted events
    return Object.keys(hostedEventsPushKeyList)
      .map(key => {
        const hostedEventData = hostedEventsPushKeyList[key];
        if (hostedEventData) {
          hostedEventData.keyNode = key;
          hostedEventData.isHostEvent = true;
          hostedEventData.eventResponse = "host";
          hostedEventData.hostId = currentUserId;
          hostedEventData.hostName = hostUserData ? hostUserData.name : "";
          hostedEventData.hostProfileImgUrl = hostUserData
            ? hostUserData.profileImgUrl
            : "";
          hostedEventData.invitee = hostedEventData.invitee
            ? Object.keys(hostedEventData.invitee).map(
                inviteeId => hostedEventData.invitee[inviteeId]
              )
            : null;
          return hostedEventData;
        }
        return [];
      })
      .filter(event => event && event.status == "confirmed");
  }
};

/**
 * @description merge invited events (if any) to hosted events and update state to render the list
 * @param {Array} hostedEventsPushKeyList
 * @param {string} userId
 * @param {string} filterType
 * @param {Array} invitedList
 */
export const mergeToHostedEvents = async (
  hostedEventsPushKeyList,
  userId,
  filterType,
  invitedList = []
) => {
  // change made on 25.09.2018 => host user picture related bug
  const hostedEventsList = await getHostedEvents(
    hostedEventsPushKeyList,
    userId
  );

  //console.log("[EventListFilter] Events as Host", hostedEventsList);
  //console.log("[EventListFilter] Events as Attendee", invitedList);
  invitedList = invitedList.filter(item => item);
  let hostedAndInvitedEventsList = hostedEventsList
    .concat(invitedList)
    .filter(event =>
      filterType == "history"
        ? validateEvent(event, true)
        : validateEvent(event)
    );
  //.filter(event => filterType != 'history'?validateEvent(event):true);

  if (filterType != "history") {
    hostedAndInvitedEventsList = hostedAndInvitedEventsList.map(event => {
      if (
        determineActiveEvent(event.startDateTimeInUTC, event.endDateTimeInUTC)
      ) {
        event["isActive"] = true;
        return event;
      }
      event["isActive"] = false;
      return event;
    });
  } else {
    hostedAndInvitedEventsList = hostedAndInvitedEventsList.map(event => {
      event["isActive"] = false;
      event["isPastEvent"] = true;
      return event;
    });
  }
  //console.log("[EventListFilter] Events that are upcoming, active or past", hostedAndInvitedEventsList);
  return hostedAndInvitedEventsList;
};

/**
 * @description
 * @param {Array<any>} eventList
 * @param {string} filterType
 */
export const recalculateFutureEvents = (eventList, filterType) => {
  return Promise.all(
    eventList
      .filter(event =>
        filterType == "history"
          ? validateEvent(event, true)
          : validateEvent(event)
      )
      .map(async event => {
        if (filterType != "history") {
          if (
            determineActiveEvent(
              event.startDateTimeInUTC,
              event.endDateTimeInUTC
            )
          ) {
            event["isActive"] = true;
            return event;
          }
          event["isActive"] = false;
          return event;
        } else {
          event["isActive"] = false;
          event["isPastEvent"] = true;
          return event;
        }
      })
  );
};

/**
 * @description determine if an event is pasted away or upcoming
 * @param {*} event
 * @param {boolean=} shouldCheckForPast
 * @returns {boolean}
 */
const validateEvent = (event, shouldCheckForPast = false) => {
  const startDateTimeInUTC = moment.utc(event.startDateTimeInUTC);
  const endDateTimeInUTC = moment.utc(event.endDateTimeInUTC);
  const currentDateTimeInUTC = moment.utc();
  if (shouldCheckForPast) {
    return endDateTimeInUTC.isBefore(currentDateTimeInUTC);
  }
  const isFutureEvent =
    startDateTimeInUTC.isSameOrAfter(currentDateTimeInUTC) ||
    determineActiveEvent(startDateTimeInUTC, endDateTimeInUTC);
  //console.log(`[EventListFilter] event title - ${event.eventTitle} whether its a future event - ${isFutureEvent}`);
  return isFutureEvent;
};

/**
 * @description determine whether the event will start within the next 15 minutes
 * @param {string} startDate
 * @param {string} startTime
 */
const determineActiveEvent = (startDateTimeInUTC, endDateTimeInUTC) => {
  const startDateTimeInUtc = moment.utc(startDateTimeInUTC);
  const endDateTimeInUtc = moment.utc(endDateTimeInUTC);
  const currentDateTimeInUtc = moment.utc();
  const { days, hours, minutes } = moment.duration(
    startDateTimeInUtc.diff(currentDateTimeInUtc)
  )._data;

  const isEventActive = currentDateTimeInUtc.isBetween(
    startDateTimeInUtc,
    endDateTimeInUtc
  )
    ? true
    : startDateTimeInUtc.isSameOrAfter(currentDateTimeInUtc) &&
      endDateTimeInUtc.isSameOrAfter(currentDateTimeInUtc) &&
      days == 0 &&
      hours == 0 &&
      minutes <= 15 > 0;
  return isEventActive;
  //return moment(startDateTimeInUtc).isSameOrAfter(currentDateTimeInUtc) && startDiffDays == 0 && startDiffHours == 0 && startDiffMinutes <= 15 > 0;
};

/**
 * @description filter an event by RSVP status of the current invitee who is signed in the app
 * @param {Object} event
 * @param {string} eventRSVPFilterType
 */
export const filterEventsByRSVP = (event, eventRSVPFilterType) => {
  if (eventRSVPFilterType == "all") {
    return (
      event.eventResponse == "going" ||
      event.eventResponse == "host" ||
      event.eventResponse == "maybe" ||
      event.eventResponse == "invited" ||
      false
    );
  } else if (eventRSVPFilterType == "active") {
    return (
      ((event.eventResponse == "going" || event.eventResponse == "host") &&
        event.isActive) ||
      false
    );
  } else if (eventRSVPFilterType == "accepted") {
    return event.eventResponse == "going" || false;
  } else if (eventRSVPFilterType == "invited") {
    return event.eventResponse == "invited" || false;
  } else if (eventRSVPFilterType == "public") {
    return event.privateValue == "false" || false;
  } else if (eventRSVPFilterType == "myevents") {
    return event.isHostEvent || false;
  } else if (eventRSVPFilterType == "declined") {
    return event.eventResponse == "declined" || false;
  } else if (eventRSVPFilterType == "history") {
    return (
      event.eventResponse == "going" || event.eventResponse == "host" || false
    );
    //return ((event.eventResponse == 'going' || event.eventResponse == 'host') && event.isPastEvent) || false;
  }
};

/**
 * @description filter an invitee by RSVP status of an event
 * @param {Object} invitee
 * @param {string} inviteeRSVPFilterType
 */
export const filterInviteeByRSVP = (
  invitee,
  inviteeRSVPFilterType,
  friendsList
) => {
  if (inviteeRSVPFilterType == "all") {
    return (
      invitee.status == "going" ||
      invitee.status == "maybe" ||
      invitee.status == "invited" ||
      invitee.status == "declined" ||
      false
    );
  } else if (inviteeRSVPFilterType == "accepted") {
    return invitee.status == "going" || false;
  } else if (inviteeRSVPFilterType == "maybe") {
    // changed because of active map -> attendees filter issue
    return invitee.status == "maybe" || false;
  } else if (inviteeRSVPFilterType == "declined") {
    return invitee.status == "declined" || false;
  } else if (inviteeRSVPFilterType == "friends") {
    return friendsList;
  }
};

export const extractHostAndInvitedEventsInfo = (
  userId,
  eventRSVPFilterType
) => {
  const authSvc = new AuthServiceAPI();

  return authSvc.fetchUserData(userId).then(userSnapshot => {
    if (userSnapshot._value) {
      let hostedEventsPushKeyList = userSnapshot._value.event || [];
      let invitedEventsMap = userSnapshot._value.eventList || [];

      if (invitedEventsMap) {
        return getInvitedEvents(invitedEventsMap, userId).then(
          invitedEventsList => {
            invitedEventsList = invitedEventsList.filter(item => item);
            return mergeToHostedEvents(
              hostedEventsPushKeyList,
              userId,
              eventRSVPFilterType,
              invitedEventsList
            );
          }
        );
      }

      return mergeToHostedEvents(
        hostedEventsPushKeyList,
        userId,
        eventRSVPFilterType,
        invitedEventsMap
      );
    }
  });
};
