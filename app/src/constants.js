'use strict'

export const LOGIN = {
	SUCCESS: 'LOGIN_SUCCESS',
	ERROR: 'LOGIN_ERROR',
	CREDENTIAL: 'CREDENTIAL',
	AUTHTOKEN: 'AUTH_TOKEN',
	LOGOUT: 'LOGOUT',
	CLEAR_ERROR: 'CLEAR_LOGIN_ERROR',
	RECOVERY: 'PASSWORD_RECOVERY',
	INIT: 'LOGIN_INIT',
	INDICATOR: 'ACTIVITY_INDICATOR',
	FORGOTPASS: 'FORGOT_PASSWORD',
}

export const SIGNUP = {
	SUCCESS: 'SIGNUP_SUCCESS',
	ERROR: 'SIGNUP_ERROR',
	INIT: 'SIGNUP_INIT',
}

export const USER = {
	DTATFETCH: 'DATA_FETCH',
	UPDATE: 'DATA_UPDATE',
	ERROR: 'ERROR'
}

export const FEEDBACK = {
	SUCCESS: 'FEEDBACK_SUCCESS',
	ERROR: 'FEEDBACK_ERROR'
}

export const EVENT = {
	ADD: 'EVENT_ADD',
	REMOVE: 'EVENT_REMOVE',
	ERROR: 'ADD_ERROR'
}

export const LOGOUT = {
	INIT: 'INIT'
}

export const FIREBASE_CONF = {
	// OLD CREDENTIAL
    // ADD YOUR FIREBASE CREDENTIALS
    // apiKey: "AIzaSyBeNLFGKQbrf0Z0WjU6DlzMm3c1bWdVADo",
    // authDomain: "logintest-6ab78.firebaseapp.com",
    // databaseURL: "https://logintest-6ab78.firebaseio.com",
    // projectId: "logintest-6ab78",
	// storageBucket: "gs://logintest-6ab78.appspot.com/",
	
	apiKey: "AIzaSyBMW97EKZ5wpJ1HIp-6ZKOcBKa09qjnbjU",
    authDomain: "hoozin-65750.firebaseapp.com",
    databaseURL: "https://hoozin-65750.firebaseio.com",
    projectId: "hoozin-65750",
    storageBucket: "hoozin-65750.appspot.com",
};

export const NET_STATUS = {
	NET_CHANGED: 'NET_CHANGED',
};
