import { LOGIN, LOGOUT, SIGNUP, USER, FEEDBACK } from '../constants';

let cloneObject = function(obj) {
	return JSON.parse(JSON.stringify(obj))
}

let newState = { user: { 
	email: null, 
	password: null, 
	name: '', 
	phone: null,
	accountType: null, 
	socialUID: null,
	address: null,
	facebook: null,
	instagram: null,
	linkedin: null,
	mapmyfitness: null,
	snapchat: null,
	strava: null,
	twitter: null,
	profileImageUrl: null,
}, success: null, indicatorShow: false, profileStatus: null, exitStatus: null, recovery: null, isNewUser: null, profileUpdate: null, feedbackInsereted: null}

export default function reducer(state, action) {
	switch(action.type) {
		// case REGISTER.CLEAR_ERROR:
		// 	newState = cloneObject(state)
		// 	newState.register_error = false
		// 	return newState
		case LOGIN.SUCCESS:
			newState = cloneObject(state)	
			console.log("++ Inside LOGIN_SUUCESS reducer #1 ++");
			console.log("++ ACtion data ++", action.data);
			console.log("++ ACtion data ++", action.dataLogin);

			console.log("action data user email ", action.data.user.email);
			if(action.data.user.email) {
				console.log("++ BEFORE ASSIGNING ++");
				console.log("NEW STATE USER", newState.user);
				newState.user.email = action.data.user.email
				console.log("+ AFTER ASSIGNING ++");
			}
			console.log("++ ONE ++");
			if(action.data.user.password) {
				newState.user.password = action.data.user.password
			}

			console.log("++ TWO ++");
			if(action.data.accountType){
				newState.user.accountType = action.data.accountType;
			}

			console.log("++ THREE ++");
			// was a post login bug here. We should only check the existance of the additionalUserInfo, not the truthyness of isNewUser
			if(action.data.additionalUserInfo){
				newState.isNewUser = action.data.additionalUserInfo.isNewUser;
			}

			console.log("++ FOUR ++");
			if(action.data.user._user) {
				newState.user.name = action.data.user._user.displayName
				newState.user.socialUID = action.data.user._user.uid;
				newState.user.profileImageUrl = action.data.user._user.photoURL || ''
			}

			console.log("++ FIVE ++");
			if(action.dataLogin){
				newState.user.socialUID = action.dataLogin.user._user.uid;
			}
			
			console.log("++ Inside LOGIN_SUUCESS reducer #2 ++");
			newState.success = true;
			return newState
		case LOGIN.ERROR:
			newState = cloneObject(state)
			newState.success = false;
			return newState
		case LOGIN.INIT: // set upload action result
			newState = cloneObject(state)
			newState.success = null;
			return newState
		case LOGIN.INDICATOR:
			newState = cloneObject(state)
			newState.indicatorShow = action.data
			return newState
		case LOGIN.FORGOTPASS:
			newState = cloneObject(state)
			newState.recovery = action.data
			return newState
		case LOGOUT.INIT:
			newState = cloneObject(state)
			newState.user.email = null,
			newState.user.password = null,
			newState.user.name = null,
			newState.user.phone = null,
			newState.user.accountType = null,
			newState.user.socialUID = null,
			newState.user.address = null,
			newState.user.facebook = null,
			newState.user.linkedin = null,
			newState.user.instagram = null,
			newState.user.mapmyfitness = null,
			newState.user.snapchat = null,
			newState.user.strava = null,
			newState.user.twitter = null,
			newState.user.profileImageUrl = null
			newState.profileUpdate = null // change made on 25.09.2018 => navigation misbehaviour related bug
			return newState
		case SIGNUP.SUCCESS:
			newState = cloneObject(state)
			if (action.data) {
				newState.user.email = action.credential.user.email
				newState.user.password = action.credential.user.password
			}
			if(action.dataLogin){
				newState.user.socialUID = action.dataLogin.user._user.uid;
			}
			newState.profileStatus = true;
			return newState
		case SIGNUP.ERROR:
			newState = cloneObject(state)
			newState.profileStatus = false;
			newState.exitStatus = action.data.exitCode;
			return newState
		case SIGNUP.INIT: // set upload action result
			newState = cloneObject(state)
			newState.profileStatus = null;
			return newState
		case USER.DTATFETCH :
			newState = cloneObject(state)
			if(action.data.name){
				newState.user.name = action.data.name
			}
			if(action.data.email){
				newState.user.email = action.data.email
			}
			if(action.data.countryCode){
				newState.user.countryCode = action.data.countryCode
			}
			if(action.data.phone){
				newState.user.phone = action.data.phone
			}
			if(action.data.address){
				newState.user.address = action.data.address
			}
			if(action.data.accountType){
				newState.user.accountType = action.data.accountType
			}
			if(action.data.socialUID){
				newState.user.socialUID = action.data.socialUID
			}
			if(action.data.facebook){
				newState.user.facebook = action.data.facebook
			}
			if(action.data.instagram){
				newState.user.instagram = action.data.instagram
			}
			if(action.data.linkedin){
				newState.user.linkedin = action.data.linkedin
			}
			if(action.data.mapmyfitness){
				newState.user.mapmyfitness = action.data.mapmyfitness
			}
			if(action.data.twitter){
				newState.user.twitter = action.data.twitter
			}
			if(action.data.snapchat){
				newState.user.snapchat = action.data.snapchat
			}
			if(action.data.strava){
				newState.user.strava = action.data.strava
			}
			if(action.data.profileImageUrl){
				newState.user.profileImageUrl = action.data.profileImageUrl;
			}
			newState.profileUpdate = false;
			return newState;
		case USER.UPDATE: 
			newState = cloneObject(state)
			newState.indicatorShow = false;
			newState.profileUpdate = true;
			return newState;
		case FEEDBACK.SUCCESS:
			newState = cloneObject(state)
			newState.indicatorShow = false;
			newState.feedbackInsereted = true;
			return newState;
		case 'PROFILEUPDATE_RESET':
			newState = cloneObject(state)
			newState.profileUpdate = false;
			newState.indicatorShow = false;
			return newState;
		default:
			return state || newState
	}
};