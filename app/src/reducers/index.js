import { combineReducers } from "redux";
import auth from "./auth";
import eventReducer from "./eventReducer";
import connection from './offlineReducer';
import eventList from './events/list';
import invitee from './events/invitee';
import friends from './friends';

const rootReducer = combineReducers({
  auth,
  event: eventReducer,
  connection,
  // @TODO remove `eventReducer` and change `eventList` reducer to `events`
  eventList,
  invitee,
  friends
});

export default rootReducer;
