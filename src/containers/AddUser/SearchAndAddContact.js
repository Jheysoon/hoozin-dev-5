import firebase from "react-native-firebase";
import { EventServiceAPI, UserManagementServiceAPI } from '../../api';

/**
     * @description does 2 things -
     * (1) Chceks for user existance first; if not exists, only then create an entry
     * (2) Add the user (new or existing) to the current event as invitee
     * @param {*} contact
     * @param {string} eventId
     * @param {string} currentUserId 
*/
export const SearchAndAddcontact = async (contact, eventId, currentUserId) => {
    let userKey = "";

    if (!contact.email && contact.phone) {
        const phoneSearchResult = await searchUserBaseByPhone(contact.phone, currentUserId, eventId);
        userKey = phoneSearchResult.userId ? phoneSearchResult.userId : ""
        if (!phoneSearchResult.isExistingUser) {
            userKey = await addContactToAppUsersAPI(contact, eventId, currentUserId);
        }
    }
    else if (!contact.phone && contact.email) {
        const emailSearchResult = await searchUserBaseByEmail(contact.email, currentUserId, eventId);
        userKey = emailSearchResult.userId ? emailSearchResult.userId : ""
        if (!emailSearchResult.isExistingUser) {
            userKey = await addContactToAppUsersAPI(contact, eventId, currentUserId);
        }
    }
    else if (contact.phone && contact.email) {
        const phoneAndEmailSearchResult = await searchUserBaseByPhoneAndEmail(contact.phone, contact.email, currentUserId, eventId);
        userKey = phoneAndEmailSearchResult.userId ? phoneAndEmailSearchResult.userId : ""
        if (!phoneAndEmailSearchResult.isExistingUser) {
            userKey = await addContactToAppUsersAPI(contact, eventId, currentUserId);
        }
    }
    // Changed on 29.10.2018 - newMsgCounter node added under invitee
    return addUserAsInviteeToEventAPI({...contact, ...{status: 'invited', profileImgUrl: '', newMsgCount: 0}}, userKey, currentUserId, eventId);
}

/**
 * @description search Hoozin user base by email
 * @param {string} email
 * @param {string} currentUserId
 * @param {string} eventId
 * @returns {Promise<any>} 
 */
const searchUserBaseByEmail = (email, currentUserId, eventId) => {
    const userSvc = new UserManagementServiceAPI();
    return userSvc.searchUserbaseByEmailAPI(email)
        .then(emailSnapshot => {
            console.log("++ inside email snapshot ++");
            if (emailSnapshot._childKeys.length === 0) {
                return { isExistingUser: false }
            }
            else {
                const userId = emailSnapshot._childKeys[0];
                const eventList = emailSnapshot._value[emailSnapshot._childKeys[0]].eventList || [];
                //eventList.includes(eventId)?'':updateEventListToUsersOrFriendsAPI(userId, eventId, currentUserId, eventList);
                return { isExistingUser: true, userId: userId, eventList: eventList }
            }
        });
}

/**
 * @description search Hoozin user base by phone
 * @param {string} phone
 * @param {string} currentUserId
 * @param {string} eventId
 * @returns {Promise<any>} 
 */
const searchUserBaseByPhone = (phone, currentUserId, eventId) => {
    const userSvc = new UserManagementServiceAPI();
    return userSvc.searchUserbaseByPhoneAPI(phone)
        .then(phoneSnapshot => {
            console.log("++ inside phone snapshot ++");
            if (phoneSnapshot._childKeys.length === 0) {
                return { isExistingUser: false }
            }
            else {
                const userId = phoneSnapshot._childKeys[0];
                const eventList = phoneSnapshot._value[phoneSnapshot._childKeys[0]].eventList || [];
                //eventList.includes(eventId)?'':updateEventListToUsersOrFriendsAPI(userId, eventId, currentUserId, eventList);
                return { isExistingUser: true, userId: userId, eventList: eventList }
            }
        });
}

/**
 * @description search Hoozin user base by both phone and email
 * @param {string} phone 
 * @param {string} email 
 */
const searchUserBaseByPhoneAndEmail = (phone, email, currentUserId, eventId) => {
    /* searching in sequence - old */
    // const userIdFromPhoneSearch = await searchUserBaseByPhone(phone, currentUserId, eventId);
    // const userIdFromEmailSearch = await searchUserBaseByEmail(email, currentUserId, eventId);

    // return new Promise(resolve => {
    //     if (!userIdFromPhoneSearch.isExistingUser && !userIdFromEmailSearch.isExistingUser) {
    //         console.timeEnd('sequenceSearch');
    //         resolve({ isExistingUser: false })
    //     }
    //     else if (userIdFromPhoneSearch.isExistingUser && !userIdFromEmailSearch.isExistingUser) {
    //         console.timeEnd('sequenceSearch');
    //         resolve({ isExistingUser: true, userId: userIdFromPhoneSearch.userId })
    //     }
    //     else if (userIdFromEmailSearch.isExistingUser && !userIdFromPhoneSearch.isExistingUser) {
    //         console.timeEnd('sequenceSearch');
    //         resolve({ isExistingUser: true, userId: userIdFromEmailSearch.userId })
    //     }
    //     else if (userIdFromPhoneSearch.isExistingUser && userIdFromEmailSearch.isExistingUser && userIdFromPhoneSearch.userId == userIdFromEmailSearch.userId) {
    //         console.timeEnd('sequenceSearch');
    //         resolve({ isExistingUser: true, userId: userIdFromPhoneSearch.userId })
    //     }
    // });

    /* searching in concurrence - new. 2x performance increase  */
    return new Promise(resolve => {
        Promise.all([searchUserBaseByPhone(phone, currentUserId, eventId), searchUserBaseByEmail(email, currentUserId, eventId)])
        .then(promiseAllResult => {
            if (!promiseAllResult[0].isExistingUser && !promiseAllResult[1].isExistingUser) {
                resolve({ isExistingUser: false });
            }
            else if (promiseAllResult[0].isExistingUser && !promiseAllResult[1].isExistingUser) {
                resolve({ isExistingUser: true, userId: promiseAllResult[0].userId });
            }
            else if (promiseAllResult[1].isExistingUser && !promiseAllResult[0].isExistingUser) {
                resolve({ isExistingUser: true, userId: promiseAllResult[1].userId });
            }
            else if (promiseAllResult[0].isExistingUser && promiseAllResult[1].isExistingUser && promiseAllResult[0].userId == promiseAllResult[1].userId) {
                resolve({ isExistingUser: true, userId: promiseAllResult[0].userId });
            }
        });
    }); 
}

/**
* @description create a new app user from the selected contact ONLY if doesnt existed before
* @param {*} contactData
* @param {string} eventId
@param {string} hostId the current / host user
* @returns {string}
*/
const addContactToAppUsersAPI = (contactData, eventId, hostId) => {
    let newUserPayload = {
        ...contactData,
        accountType: 'custom',
        status: 'temporary',
        profileImgUrl: '',
        eventList: []
    };
    // Previously
    //newUserPayload.eventList.push(eventId);

    // now
    newUserPayload.eventList.push({ eventId, hostId });
    return firebase.database().ref('users').push(newUserPayload).key;
}

/**
* @description Adds a user as invitee to the current event
* @param {*} payload
* @param {string} userKey
* @param {string} currentUserId
* @param {string} eventId
* @returns {Promise<any>}
*/
const addUserAsInviteeToEventAPI = (payload, userKey, currentUserId, eventId) => {
    return firebase.database().ref(`users/${currentUserId}/event/${eventId}/invitee/${userKey}`).set(payload);
}

/**
   * @description update eventlist info to the selected friend
   * @param {string} friendId 
   * @param {string} eventId
   * @param {string} currentUserId
   * @param {*} eventList 
   * @returns {Promise<any>}
   */
const updateEventListToUsersOrFriendsAPI = (friendId, eventId, currentUserId, eventList) => {
    return firebase.database().ref(`users/${currentUserId}/friends/${friendId}`)
        .once("value")
        .then(snapshot => {
            if (snapshot._childKeys.length > 0) {
                //eventList.push(eventId);
                eventList.push({eventId: eventId, hostId: currentUserId});
                return firebase.database().ref(`users/${currentUserId}/friends/${friendId}`).update({ eventList: eventList });
            }
            else {
                //eventList.push(eventId);
                eventList.push({eventId: eventId, hostId: friendId});
                return firebase.database().ref(`users/${friendId}`).update({ eventList: eventList });
            }
        });
}