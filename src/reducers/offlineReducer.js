import { NET_STATUS } from "../constants";

const initialState = {
  isConnected: true,
  reTry: 0,
  trying: false,
  fetching: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case NET_STATUS.NET_CHANGED:
      return { ...state, isConnected: action.payload.status };
      
    case "SET_FETCHING": 
      return {...state, ...action.payload};

    default:
      return state;
  }
};
