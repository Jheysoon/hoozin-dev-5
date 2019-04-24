const initialState = {
  list: [],
  loading: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_FRIEND_LIST":
      return { ...state, list: action.payload.list, loading: false };
    default:
      return { ...state };
  }
};
