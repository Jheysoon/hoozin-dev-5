import { AuthServiceAPI } from '../api';
import { LOGIN, LOGOUT, SIGNUP, USER, FEEDBACK } from '../constants'

/**
 * @description Action creator to handle custom login using email/password
 * @param {string} email 
 * @param {string} password 
 */
export const loginAction = (email, password) => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        return authSvc.signInWithEmail(email, password)
            .then(data => {
                if ((data == null) || data.errors) {
                    return dispatch({
                        type: LOGIN.ERROR,
                    });
                } else {
                    const credential = { user: { email: email, password: password } }
                    // TODO: save credential to local storage
                    return dispatch({
                        type: LOGIN.SUCCESS,
                        data: credential,
                        dataLogin: data
                    })
                }
            })
            .catch(err => {
                return dispatch({
                    type: LOGIN.ERROR
                });
            })
    };
};

/**
 * @description Action creator to handle forgot password mechanism
 * @param {string} email 
 */
export const forgotPasswordAction = (email) => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        return authSvc.forgotPassword(email)
            .then(data => {                
                return dispatch({
                    type: LOGIN.FORGOTPASS,
                    data: true
                })
            })
            .catch(err => {
                return dispatch({
                    type: LOGIN.FORGOTPASS,
                    data: false,
                });
            })
    };
};

/**
 * @description not sure what this does
 */
export const clearRecoveryStatusAction = () => {
    return (dispatch) => {
        return dispatch({
            type: LOGIN.FORGOTPASS,
            data: null,
        })
    }
}

/**
 * @description action creator to handle logging out an user from the app
 */
export const logOutAction = (userId) => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        return authSvc.logOut(userId)
            .then(() => {
                return dispatch({
                    type: LOGOUT.INIT
                });
            });
    };
}

/**
 * @description Action creator to handle Facebook oAuth
 */
export const facebookLoginAction = () => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        return authSvc.signInWithFacebook()
            .then(data => {
                //console.log(JSON.stringify(data))
                return dispatch({
                    type: LOGIN.SUCCESS,
                    data: data,
                });
            })
            .catch(err => {
                return dispatch({
                    type: LOGIN.ERROR,
                });
            })
    };
};

/**
 * @description Action creator to handle Google oAUth 
 */
export const googleLoginAction = () => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        return authSvc.signInWithGoogle()
            .then(data => {
                return dispatch({
                    type: LOGIN.SUCCESS,
                    data: data,
                });
            })
            .catch(err => {
                return dispatch({
                    type: LOGIN.ERROR,
                });
            })
    };
};

/**
 * @description Action creator to initiate login process (I guess)
 */
export const initLoginAction = () => {
    return (dispatch) => {
        return dispatch({
            type: LOGIN.INIT,
            data: null,
        })
    }
}

/**
 * @description Action creator to show/hide spinner
 * @param {boolean} bShow 
 */
export const setVisibleIndicatorAction = (bShow) => {
    return (dispatch) => {
        return dispatch({
            type: LOGIN.INDICATOR,
            data: bShow,
        })
    }
}

export const resetProfileUpdateAction = () => {
    return (dispatch) => {
        return dispatch({
            type: 'PROFILEUPDATE_RESET',
            data: {}
        })
    }
}

/**
 * @description Action creator to handle fetching user profile post successful authentication
 * @param {string} socialUID 
 */
export const fetchProfileDataAction = (socialUID) => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        authSvc.fetchUserData(socialUID).then(data => {
            dispatch({
                type: USER.DTATFETCH,
                data: data,
            })
        }).catch(err => {
            console.log(err);
            dispatch({
                type: USER.ERROR,
                data: false
            });
        })
    }
}

/**
 * @description Action creator to handle saving / editing user profile post successful authentication
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {string} phone 
 * @param {string} address 
 * @param {string} facebook 
 * @param {string} instagram 
 * @param {string} linkedin 
 * @param {string} twitter 
 * @param {string} snapchat 
 * @param {string} strava 
 * @param {string} mapmyfitness 
 * @param {string} accountType 
 * @param {string} socialUID 
 * @param {boolean} isNewPassword
 * @param {string} profileImgUrl
 */
export const UpdateProfileDataAction = (name, email, password, phone, address, facebook, instagram,
    linkedin, twitter, snapchat, strava, mapmyfitness, accountType, socialUID, isNewPassword, profileImgUrl) => {
    return (dispatch, getStore) => {
        console.log("++ name and New image URL ++", name, profileImgUrl);
        const authSvc = new AuthServiceAPI();
        authSvc.updateUserData(name, email, password, phone, address, facebook, instagram,
            linkedin, twitter, snapchat, strava, mapmyfitness, accountType, socialUID, isNewPassword, profileImgUrl).then(data => {
            dispatch({
                type: USER.UPDATE,
                data: data,
            })
        }).catch(err => {
            console.log(err);
            dispatch({
                type: USER.ERROR,
                data: false
            });
        })
    }
}

/**
 * @description Action creator to handle user feedback
 * @param {string} email 
 * @param {string} feedbackText 
 * @param {string} uid 
 * @param {string} timestamp 
 */
export const insertFeedbackAction = (email, feedbackText, uid, timestamp) => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        authSvc.insertFeedbackData(email, feedbackText, uid, timestamp).then(data => {
            dispatch({
                type: FEEDBACK.SUCCESS,
                data: data,
            })
        }).catch(err => {
            //console.log(err);
            dispatch({
                type: FEEDBACK.ERROR,
                data: false
            });
        })
    }
}

/**
 * @description Action creator to handle user signup procedure
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {string} phone 
 * @param {string} address 
 * @param {string} facebook 
 * @param {string} instagram 
 * @param {string} linkedin 
 * @param {string} twitter 
 * @param {string} snapchat 
 * @param {string} strava 
 * @param {string} mapmyfitness 
 * @param {string} accountType 
 * @param {string} socialUID
 * @param {string} countryCode 
 * @param {string} profileImgUrl
 * @param {string} userLocation
 */
export const createUserAction = (name, email, password, phone, address, facebook, instagram,
    linkedin, twitter, snapchat, strava, mapmyfitness, accountType, socialUID, countryCode, profileImgUrl, userLocation) => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        return authSvc.saveProfile(name, email, password, phone, address, facebook, instagram,
            linkedin, twitter, snapchat, strava, mapmyfitness, accountType, socialUID, countryCode, profileImgUrl, userLocation)
            .then(data => {
                const credential = { user: { email: email, password: password, name: name } }
                // TODO: save credential to local storage
                return dispatch({
                    type: SIGNUP.SUCCESS,
                    data: true,
                    credential: credential,
                    dataLogin: data
                })
            })
            .catch(err => {
                console.log(err.message);
                if (err.message.search(/password/gi) > 0 && err.message.search(/invalid/gi) > 0) {
                    return dispatch({
                        type: SIGNUP.ERROR,
                        data: { exitCode: 1 }
                    });    
                }
                else if (err.message.search(/email/gi) > 0 && err.message.search(/exist/gi) > 0) {
                    return dispatch({
                        type: SIGNUP.ERROR,
                        data: { exitCode: 2 }
                    });    
                }
                return dispatch({
                    type: SIGNUP.ERROR,
                    data: false
                });
            })
    };
}

/**
 * @description Action creator to clear user ceation status (I guess )
 */
export const clearCreateStatusAction = () => {
    return (dispatch) => {
        return dispatch({
            type: SIGNUP.INIT,
            data: null,
        })
    }
}

export const fetchProfileForLogin = (socialUID, asyncData) => {
    return (dispatch, getStore) => {
        const authSvc = new AuthServiceAPI();
        authSvc.fetchUserData(socialUID).then(data => {
            dispatch({
                type: USER.DTATFETCH,
                data: { socialUID, ...data.val(), ...asyncData },
            })
        }).catch(err => {
            console.log(err);
            dispatch({
                type: USER.ERROR,
                data: false
            });
        })
    }
}
