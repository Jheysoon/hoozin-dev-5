import _ from "lodash";

const initialState = {
  locations: [],
  host_location: {
    lat: 0,
    lng: 0,
    profileImgUrl: ""
  },
  addedInvitees: [],
  activeMapCoords: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "INVITEE_LOCATIONS":
      return { ...state, ...action.payload };

    case "HOST_LOCATIONS":
      return { ...state, ...action.payload };

    case "ADD_INVITEES":
      let invitees = state.addedInvitees;
      invitees.push({ userId: action.payload });
      return {
        ...state,
        addedInvitees: invitees
      };
    case "REMOVE_INVITEES":
      return {
        ...state,
        addedInvitees: _.filter(state.addedInvitees, val => {
          return val.userId != action.payload;
        })
      };

    case "EMPTY_INVITEE":
      return { ...state, addedInvitees: [] };

    case "SET_ACTIVE_MAP_COORDS":
      return { ...state, activeMapCoords: action.payload };

    default:
      return { ...state };
  }
};
