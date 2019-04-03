const initialState = {
  locations: [],
  host_location: {
    lat: 0,
    lng: 0,
    profileImgUrl: ''
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "INVITEE_LOCATIONS":
      return { ...state, ...action.payload };

    case "HOST_LOCATIONS":
      return { ...state, ...action.payload };

    default:
      return { ...state };
  }
};
