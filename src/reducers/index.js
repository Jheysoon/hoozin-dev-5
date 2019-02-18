import { combineReducers } from 'redux';
import auth from './auth'
import eventReducer from './eventReducer'

const rootReducer = combineReducers({
    auth,
    event: eventReducer
});
 
export default rootReducer;