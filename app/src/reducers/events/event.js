const initialState = {
  event: {
    host: {},
    event: {}
  },
  loading: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "HZ_EVENT_DETAIL":
      return { ...state, event: action.payload, loading: false };
    case "HZ_DETAIL_LOADING":
      return { ...state, loading: true};
    default:
      return state;
  }
};
