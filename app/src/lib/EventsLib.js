import {
  extractHostAndInvitedEventsInfo,
  filterEventsByRSVP
} from "../utils/eventListFilter";

class EventsLib {
  getHostAndInvitedEvents({ socialUID, type }) {
    return new Promise((resolve, reject) => {
      //console.log("goes here ##########################");
      extractHostAndInvitedEventsInfo(socialUID, type).then(
        hostedAndInvitedEventsList => {
          hostedAndInvitedEventsList = hostedAndInvitedEventsList.filter(
            event => filterEventsByRSVP(event, type)
          );
          hostedAndInvitedEventsList.length &&
            hostedAndInvitedEventsList.sort(
              (a, b) => a.startDateTimeInUTC - b.startDateTimeInUTC
            );
          //hostedAndInvitedEventsList.length && hostedAndInvitedEventsList.sort((a, b) => a.startTime - b.startTime);
          console.log(
            "[EventList] all events list",
            hostedAndInvitedEventsList
          );

          resolve({
            eventList: hostedAndInvitedEventsList,
            unfilteredEventList: hostedAndInvitedEventsList
          });
        }
      );
    });
  }
}

export default EventsLib;
