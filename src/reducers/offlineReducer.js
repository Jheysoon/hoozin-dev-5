import { NET_STATUS } from "../constants";

const initialState = {
  isConnected: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case NET_STATUS.NET_CHANGED:
      return { ...state, isConnected: action.payload.status };

    default:
      return state;
  }
};
