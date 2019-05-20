import { createStore, applyMiddleware } from "redux";
import logger from "../middleware/logger";
import thunk from "redux-thunk";
import rootReducer from "../reducers";

const createStoreWithMW = applyMiddleware(thunk)(createStore);
const store = createStoreWithMW(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
