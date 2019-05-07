const initialState = {
  event: {
    host: {},
    event: {}
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "HZ_EVENT_DETAIL":
      return { ...state, event: action.payload };
    default:
      return state;
  }
};
