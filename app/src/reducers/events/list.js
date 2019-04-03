const initialState = {
  events: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_EVENTS":
      return { ...state, ...action.payload };
    default:
      return { ...state };
  }
};
