import { combineReducers } from "redux";
import auth from "./auth";
import eventReducer from "./eventReducer";
import connection from './offlineReducer';

const rootReducer = combineReducers({
  auth,
  event: eventReducer,
  connection
});

export default rootReducer;
