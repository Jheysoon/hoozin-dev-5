import { LOGIN, SIGNUP, USER, FEEDBACK, EVENT } from '../constants';

let cloneObject = function(obj) {
	return JSON.parse(JSON.stringify(obj))
}

let newState = { success: null, indicatorShow: false, eventAdded: null, eventId: '', 
	details: {
		startDate: null,
		startTime: null,
		endDate: null,
		endTime: null,
		eventTitle: null,
		eventType: null,
		location: null,
		privateValue: null,
		id:''
	}
}

export default function reducer(state, action) {
	switch(action.type) {
		case EVENT.ADD: 
			newState = cloneObject(state)
			newState.indicatorShow = false;
			newState.eventAdded = true;
			newState.eventId = action.data.key;
			return newState;
		case EVENT.REMOVE:
			newState = cloneObject(state);
			newState.eventAdded = false;
			newState.contactList = [];
			newState.details = {
				startDate: null,
				startTime: null,
				endDate: null,
				endTime: null,
				eventTitle: null,
				eventType: null,
				location: null,
				privateValue: null,
				id:''
			};
			return newState;
		case FEEDBACK.SUCCESS:
			newState = cloneObject(state)
			newState.indicatorShow = false;
			newState.feedbackInsereted = true;
			return newState;
		default:
			return state || newState
	}
};