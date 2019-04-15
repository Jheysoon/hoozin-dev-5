import _ from "lodash";
import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  AsyncStorage,
  Platform
} from "react-native";
import Image from "react-native-remote-svg";
import {
  Container,
  Content,
  Footer,
  Left,
  Body,
  Right,
  Icon,
  Button,
  Spinner
} from "native-base";
import firebase from "react-native-firebase";
import { connect } from "react-redux";

// Action creators
import { removeEventDataAction } from "../../../actions/event";
import { setVisibleIndicatorAction } from "../../../actions/auth";
import AppBarComponent from "../../../components/AppBar/appbar.index";
import { IconsMap } from "assets/assetMap";
import { UserManagementServiceAPI, EventServiceAPI } from "../../../api";
import AddInviteeSvg from "../../../svgs/AddInvitee";

// stylesheet
import { AddInviteeStyles } from "./addinvitee.style";
const SEARCH_CONTEXT = { USER: "USER", INVITEE__FRIENDS: "INVITEE__FRIENDS" };

/**
 * Redux container to add Device contacts / FB friends or custom contacts into the current event as invitee
 */
class AddInviteeContainer extends Component {
  static navigationOptions = {
    header: null
  };
  constructor() {
    super();
    this.state = {
      searchText: "",
      contactList: [],
      allUserList: [],
      filteredUserList: [],
      unfilteredOnlyFriendsList: [],
      unfilteredInviteeAndFriendsList: [],
      addedListUser: "",
      eventAdded: false,
      emptyListOf: "friends(s)",
      newUserList: [],
      eventId: "",
      editMode: false,
      inviteeAddedCounter: 0,
      animating: true
    };

    this.addUserAsInviteeToEvent = this.addUserAsInviteeToEvent.bind(this);
    this.removeUserAsInviteeFromEvent = this.removeUserAsInviteeFromEvent.bind(
      this
    );
  }

  /**
   * @description It will either display Only friends or both friends and contacts
   */
  componentDidMount() {
    const userSvc = new UserManagementServiceAPI();
    const { params } = this.props.navigation.state;
    this.setState({
      eventId: params.eventKey,
      editMode: params.editMode || this.state.editMode
    });
    this.props.emptyInvitee();

    userSvc.getAllUsersList().then(userData => {
      const userList = userData
        .map(user => {
          return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            profileImgUrl: user.profileImgUrl || "",
            id: user.key,
            status: user.status,
            preselect: user.eventList
              ? user.eventList.filter(
                  event =>
                    event.eventId == this.state.eventId ||
                    this.props.event.eventKey
                ).length > 0
              : false
          };
        })
        .filter(item => item.id != this.props.user.socialUID);
      this.setState({ allUserList: userList, animating: false });
    });

    if (!!params && !!params.includeInvitees) {
      console.log("[AddInvitee] Will fetch invitee(s) and friends");
      this.fetchInviteesOrFriends(params.eventKey);
    } else {
      console.log("[AddInvitee] Will fetch only friends");
      this.fetchUsersAllFriends();
    }
  }

  /**
   * @description Fetches all the friends of the current user
   */

  async fetchUsersAllFriends() {
    let userSvc = new UserManagementServiceAPI();
    const friendsList = await userSvc.getUsersFriendListAPI(
      this.props.user.socialUID
    );
    //console.log("[AddInvitee] User's Friend List", friendsList);
    userSvc = null;
    if (!friendsList) {
      this.setState({ emptyListOf: "friend(s)" });
      return [];
    }
    this.setState({
      contactList: friendsList,
      unfilteredOnlyFriendsList: friendsList,
      inviteeAddedCounter:
        (friendsList &&
          friendsList.filter(friend => friend.preselect).length) ||
        0,
      animating: false
    });
    return friendsList;
  }

  /**
   * @description Display all the friends (if any) and invited users
   */
  async fetchInviteesOrFriends(eventKey) {
    let inviteesOrFriendsList = await this.getInvitedUsersOrFriendsAPI(
      eventKey
    );
    //console.log("[AddInvitee] Invitee and Friends List", inviteesOrFriendsList);
    this.setState({
      contactList: inviteesOrFriendsList,
      unfilteredInviteeAndFriendsList: inviteesOrFriendsList,
      inviteeAddedCounter:
        (inviteesOrFriendsList &&
          inviteesOrFriendsList.filter(friend => friend.preselect).length) ||
        0,
      animating: false
    });
    return inviteesOrFriendsList;
  }

  /**
   * @description Continue to confirm changes and create confirmed Event on the next screen
   */
  proceedToConfirmation() {
    console.log(
      "++ current invitee list check ++",
      this.state.inviteeAddedCounter
    );

    const { params } = this.props.navigation.state;

    if (this.state.inviteeAddedCounter > 0 || params.isPrivate == false) {
      this.props.navigation.navigate({
        routeName: "ConfirmEvent",
        key: "ConfirmEvent",
        params: {
          eventId: this.state.eventId,
          isEditMode: this.state.editMode,
          willReload: this.reload.bind(this, this.state.eventId),
          isPrivate: params.isPrivate
        }
      });
      return;
    } else {
      Alert.alert(
        "Error!",
        "Please select attendee to confirm event",
        [{ text: "OK", onPress: () => {}, style: "cancel" }],
        { cancelable: false }
      );
    }
  }

  async reload(eventId) {
    const userSvc = new UserManagementServiceAPI();

    this.setState({ animating: true });
    const invitedAndFriendsList = await this.fetchInviteesOrFriends(eventId);
    if (!invitedAndFriendsList) {
      this.fetchUsersAllFriends();
    }
    userSvc.getAllUsersList().then(userData => {
      const userList = userData
        .map(user => {
          return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            id: user.key,
            status: user.status,
            preselect: user.eventList
              ? user.eventList.filter(
                  event =>
                    event.eventId == this.state.eventId ||
                    this.props.event.eventKey
                ).length > 0
              : false
          };
        })
        .filter(item => item.id != this.props.user.socialUID);
      this.setState({
        searchText: "\u00A0",
        allUserList: userList,
        animating: false
      });
    });
  }

  /**
   * @description Display add contact screen where a user has the option to choose either from Device, FB or custom
   */
  addContact() {
    this.props.navigation.navigate({
      routeName: "TabNavigation",
      key: "TabNavigation",
      params: {
        isEditMode: this.state.editMode,
        eventId: this.state.eventId,
        willReload: this.reload.bind(this)
      }
    });
  }

  loadImagesStart() {
    this.setState({ animating: true });
  }

  loadImagesComplete() {
    this.setState({ animating: false });
  }

  /**
   * @description prompts the user to have the event deleted
   */
  discardEvent() {
    let eventSrv = new EventServiceAPI();

    let alertOptions = [];

    if (this.state.isEditMode) {
      alertOptions.push({
        text: "Back To Event Overview",
        onPress: () => {
          eventSrv
            .updateEvent(
              this.state.eventId,
              { status: "confirmed" },
              this.props.user.socialUID
            )
            .then(() => {
              this.props.emptyInvitee();
              this.props.navigation.goBack();
            });
        }
      });
    }

    alertOptions.push({ text: "Go Back!", onPress: () => {}, style: "cancel" });
    alertOptions.push({
      text: "Cancel Event!",
      onPress: () => {
        const removeEvent = firebase.functions().httpsCallable("removeEvent");

        this.setState({ animating: true });

        removeEvent({
          id: this.state.eventId
        }).then(() => {
          this.setState({ animating: false });
          this.props.emptyInvitee();
          this.props.navigation.navigate({
            routeName: "EventList",
            key: "EventList"
          });
        });
      }
    });

    Alert.alert(
      "Yikes, you are about to cancel your event!",
      "If you cancel, the invited people will be notified of this cancellation",
      alertOptions,
      { cancelable: false }
    );
  }

  /**
   * @description Wipe the entire event data created so far upon tapping the X button
   * @param {string} evtKey
   */
  removeEventData(evtKey) {
    const eventSvc = new EventServiceAPI();
    this.setState({ animating: true });

    AsyncStorage.getItem("userId", async (err, result) => {
      const { uid } = JSON.parse(result);

      const removeResult = await eventSvc.removeEventFromHostAndInviteeAPI(
        evtKey,
        uid
      );

      if (removeResult) {
        this.props.navigation.replace("NearbyEvents");
        this.setState({ animating: false });
        return;
      }
      this.feedbackToUser("EVENT__DELETE");
    });
  }

  feedbackToUser(type) {
    Alert.alert(
      "Oops! Something went wrong!",
      "We are having trouble in processing your request. Please try again later",
      [{ text: "OK" }]
    );
  }

  /**
   * @description Adds a user as invitee to the current event
   * @param {*} data
   */
  addUserAsInviteeToEvent(data) {
    this.setState({ animating: true });
    const targetUserAsInvitee = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      profileImgUrl: data.profileImgUrl || "",
      status: "invited",
      newMsgCount: 0
    };

    this.props.addInvitee(data.id || data.inviteeId);

    let eventSrv = new EventServiceAPI();

    let eventId = this.state.eventId || this.props.event.eventKey;

    Promise.all([
      eventSrv.addUserToEvent(targetUserAsInvitee, data.id, eventId),
      this.updateInviteeEventListAPI(data.id, eventId)
    ]).then(result => {
      data.preselect = true;
      this.setState({
        contactList: this.state.contactList,
        inviteeAddedCounter: this.state.inviteeAddedCounter + 1,
        animating: false
      });
    });
  }

  /**
   * @description Add the selected user as invitee to the current event
   * @param {*} payload
   * @returns {Promise<any>}
   */
  addUserToEventAPI(payload, key) {
    const socialUID = this.props.user.socialUID;
    const eventKey = this.state.eventId
      ? this.state.eventId
      : this.props.event.eventKey;

    return firebase
      .database()
      .ref(`users/${socialUID}/event/${eventKey}/invitee/${key}`)
      .set(payload);
  }

  updateInviteeEventListAPI(inviteeId, eventId) {
    return firebase
      .database()
      .ref(`users/${inviteeId}`)
      .once("value")
      .then(userSnapshot => {
        if (userSnapshot._value) {
          const eventList = userSnapshot._value["eventList"] || [];
          eventList.push({
            eventId: eventId,
            hostId: this.props.user.socialUID
          });
          // now update the node
          firebase
            .database()
            .ref(`users/${inviteeId}`)
            .update({ eventList: eventList });
        }
      });
  }

  /**
   * @description Removes a previously added invitee from the current event
   * @param {*} data
   */
  removeUserAsInviteeFromEvent(data) {
    this.setState({ animating: true });
    this.props.removeInvitee(data.id || data.inviteeId);
    this.removeUserFromEventAPI(data.id || data.inviteeId).then(result => {
      data.preselect = false;
      this.setState({
        contactList: this.state.contactList,
        inviteeAddedCounter: this.state.inviteeAddedCounter - 1,
        animating: false
      });
    });
  }

  /**
   * @description Add the selected user as invitee to the current event
   * @param {*} invitationId
   */
  async removeUserFromEventAPI(invitationId) {
    const userSvc = new UserManagementServiceAPI();
    const eventSvc = new EventServiceAPI();

    const socialUID = this.props.user.socialUID;
    const eventKey = this.state.eventId
      ? this.state.eventId
      : this.props.event.eventKey;

    const userData = await userSvc.getUserDetailsAPI(invitationId);
    if (userData) {
      const eventList = userData.eventList.filter(
        event => event.eventId != eventKey
      );
      const updateOpResult = await userSvc.updateUserDetailsAPI(invitationId, {
        eventList
      });
      // null means successful operation
      if (!updateOpResult) {
        return eventSvc.removeUserFromEvent(eventKey, invitationId);
        /* return eventSvc.removeEventInviteeAPI(
          socialUID,
          eventKey,
          invitationId
        ); */
      }
    }
  }

  /**
   * @description Get invitees or friends to the current user
   * @param {Array}
   * @returns {Promise<Array>}
   */
  async getInvitedUsersOrFriendsAPI(eventId) {
    let userSvc = new UserManagementServiceAPI();
    let eventSvc = new EventServiceAPI();

    const inviteeList = await eventSvc.getEventInviteesDetailsAPI2(
      eventId,
      this.props.user.socialUID,
      true
    );

    if (inviteeList) {
      const friendsList = await userSvc.getUsersFriendListAPI(
        this.props.user.socialUID
      );

      if (friendsList && friendsList.length) {
        // merge friends back to invitee list
        const inviteeAndFriendsList = inviteeList.concat(friendsList);
        console.log(
          "[AddInvitee] Invitee and Friends List",
          inviteeAndFriendsList
        );

        // remove duplicates, if any
        const flag = [];
        const uniqueInviteeAndFriendList = inviteeAndFriendsList.filter(
          item => {
            if (flag.includes(item.email)) {
              return false;
            }
            flag.push(item.email);
            return true;
          }
        );

        // check current preselected list
        const addedInviteeCounter = uniqueInviteeAndFriendList.filter(
          item => item.preselect
        ).length;
        console.log("[AddInvitee] Preselected List", addedInviteeCounter);
        this.setState({ inviteeAddedCounter: addedInviteeCounter });
        return uniqueInviteeAndFriendList;
      } else {
        this.setState({ inviteeAddedCounter: inviteeList.length });
        return inviteeList;
      }
    }

    // return firebase.database().ref(`users/${this.props.user.socialUID}/event/${eventId}/invitee`)
    //     .orderByChild("name")
    //     .once("value")
    //     .then(snapshot => {
    //         if (snapshot._value) {
    //             console.log("++ [AddInvitee] invitee found ++", snapshot);
    //             return this.fetchUsersAllFriendsAPI(eventId)
    //                 .then(friendsArr => {
    //                     if (friendsArr.length > 0) {
    //                         console.log("++ [AddInvitee] friends found ++");
    //                         const inviteesArr = Object.keys(snapshot._value).map(key => {
    //                             let retArray = snapshot._value[key];
    //                             retArray.key = key;

    //                             return {
    //                                 name: retArray.name,
    //                                 email: retArray.email,
    //                                 phone: retArray.phone,
    //                                 id: retArray.key,
    //                                 preselect: true
    //                             };

    //                         });

    //                         console.log("++ invitee array ++", inviteesArr);
    //                         const joinedArr = inviteesArr.concat(friendsArr);
    //                         console.log("++ joined array ++", joinedArr);

    //                         const flag = [];
    //                         const newArr = joinedArr.filter(item => {
    //                             if (flag.includes(item.email)) {
    //                                 return false;
    //                             }
    //                             flag.push(item.email);
    //                             return true;
    //                         });
    //                         const addedInviteeCounter = newArr.filter(item => item.preselect).length;
    //                         console.log("++ new array ++", newArr);
    //                         this.setState({ inviteeAddedCounter: addedInviteeCounter });
    //                         return newArr;
    //                     }
    //                     else {
    //                         console.log("++ [AddInvitee] no friend(s) found ++");
    //                         const arr = Object.keys(snapshot._value).map(key => {
    //                             let retArray = snapshot._value[key];
    //                             retArray.key = key;

    //                             return {
    //                                 name: retArray.name,
    //                                 email: retArray.email,
    //                                 phone: retArray.phone,
    //                                 id: retArray.key,
    //                                 preselect: true
    //                             };
    //                         });
    //                         this.setState({ inviteeAddedCounter: arr.length });
    //                         return arr;
    //                     }
    //                 });
    //         }
    //         else {
    //             this.setState({ inviteeAddedCounter: 0 });
    //             return this.fetchUsersAllFriendsAPI(eventId);
    //         }
    //     });
  }

  /**
   * @description Cancel user search that displays app users and display back the friends list
   */
  cancelSearch() {
    this.setState({ searchText: "\u00A0" });
    return this.fetchUsersAllFriends().then(result => {
      console.log("all user list", this.state.allUserList);
      result.map(item => {
        this.state.contactList.map(contactItem => {
          item["preselect"] = contactItem.id == item.id ? true : false;
        });
        return item;
      });
      this.setState({ contactList: result });
    });
  }

  /**
   * @description User will be able to search through entire user base and select / deselect user
   * [1] From the user base result, this function filters out unnecessary fields first and then returns
   *     all the users except the current user
   * [2] Then the local state is refreshed and view is re-rendered
   * [3] Upon clearing (Backspacing) the search field, the friendlists are rendered
   * @param {string} text
   * @param {string} context
   */
  searchAndDisplayUsers(text, context) {
    console.log("++ CONTEXT ++", context);
    const userSvc = new UserManagementServiceAPI();
    this.setState({ searchText: text });

    text = text.toLowerCase().trim();
    // if searching for invitee + friends
    if (
      !!text &&
      !!context &&
      context == SEARCH_CONTEXT.INVITEE__FRIENDS &&
      !this.props.navigation.state.params.preserveSearch
    ) {
      const inviteeAndFriendList = this.state.allUserList.filter(contact => {
        return contact.name.indexOf(text) == 0;
      });

      console.log(
        "++matched invitee and friends list ++",
        inviteeAndFriendList
      );
      const stateObj = { contactList: inviteeAndFriendList };
      if (inviteeAndFriendList.length == 0) {
        stateObj.emptyListOf = "user(s)";
      }
      this.setState(stateObj);
      return;
    } else if (
      !!text &&
      !!context &&
      context == SEARCH_CONTEXT.INVITEE__FRIENDS &&
      this.props.navigation.state.params.preserveSearch
    ) {
      const stateObj = { contactList: this.state.allUserList };
      if (this.state.allUserList.length == 0) {
        stateObj.emptyListOf = "user(s)";
      }
      this.setState(stateObj);
      return;
    }
    // if clearing search results
    else if (!text && !context) {
      return this.fetchUsersAllFriends().then(result => {
        this.setState({ contactList: result });
      });
    } else if (!text && !!context) {
      return this.fetchUsersAllFriends().then(result => {
        result.map(item => {
          this.state.contactList.map(contactItem => {
            item["preselect"] = contactItem.id == item.id ? true : false;
          });
          return item;
        });
        this.setState({ contactList: result });
      });
    }

    const filteredUserList = this.state.allUserList.filter(
      user => user.name && user.name.indexOf(text) == 0
    );
    this.setState({ contactList: filteredUserList });
  }

  searchAndDisplayUsers2(text) {
    console.log("++ incoming text ++", text);
    console.log("++ Only friend list ++", this.state.unfilteredOnlyFriendsList);
    console.log(
      "++ Both friend & invitee list ++",
      this.state.unfilteredInviteeAndFriendsList
    );
    console.log("++ all user list ++", this.state.allUserList);

    if (text) {
      const inviteeAndFriendList = this.state.allUserList.filter(
        contact => contact.name.indexOf(text) == 0
      );
      // Change made here on 25.09.2018 for the search text input lowercase view
      this.setState({ contactList: inviteeAndFriendList, searchText: text });
      return;
    }
    this.state.unfilteredOnlyFriendsList.length || !text
      ? this.setState({
          contactList: this.state.unfilteredOnlyFriendsList,
          searchText: "\u00A0"
        })
      : this.state.unfilteredInviteeAndFriendsList.length || !text
      ? this.setState({
          contactList: this.state.unfilteredInviteeAndFriendsList,
          searchText: "\u00A0"
        })
      : null;
    return;
  }

  /**
   * @description Fetches all users from Firebase
   * @param {string} searchText
   */
  filterUserAPI(searchText) {
    console.log("[AddInvitee] incoming search letter", searchText);
    return firebase
      .database()
      .ref("users")
      .orderByChild("name")
      .startAt(searchText)
      .endAt(`${searchText}\uf8ff`)
      .once("value");
  }

  minusIcon(data) {
    if (
      _.has(data, "status") &&
      (data.status == "going" || data.status == "maybe")
    ) {
      return null;
    }

    return (
      <Icon type="FontAwesome" name="minus" style={{ color: "#FC3764" }} />
    );
  }

  render() {
    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent headerTitle="Add Guest to this Event" />
          <View>
            <View
              style={{
                backgroundColor: "#BCE0FD",
                paddingTop: 10,
                paddingBottom: 10,
                marginBottom: 5
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingLeft: 15,
                  paddingRight: 15
                }}
              >
                <View style={{ flex: 7, position: "relative" }}>
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_search_mini}
                      style={{
                        width: 16,
                        height: 16,
                        position: "absolute",
                        top: 6,
                        left: 5,
                        zIndex: 9999
                      }}
                    />
                  ) : (
                    <Image
                      source={{ uri: AddInviteeSvg.icon_search_mini }}
                      style={{
                        width: 20,
                        height: 20,
                        position: "absolute",
                        top: 5,
                        left: 5,
                        zIndex: 9999
                      }}
                    />
                  )}
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 8,
                      top: 5,
                      zIndex: 9999
                    }}
                    onPress={() => this.searchAndDisplayUsers2()}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_mini}
                        style={{ width: 16, height: 16 }}
                      />
                    ) : (
                      <Image
                        source={{ uri: AddInviteeSvg.icon_close_mini }}
                        style={{ width: 16, height: 16, marginTop: 5 }}
                      />
                    )}
                  </TouchableOpacity>
                  <TextInput
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: 12,
                      padding: 5,
                      paddingLeft: 28,
                      paddingRight: 28
                    }}
                    placeholder="Search"
                    value={this.state.searchText}
                    // onChangeText={(text) => this.props.navigation.state.params.includeInvitees || this.state.inviteeAddedCounter > 0 ? this.searchAndDisplayUsers(text, 'INVITEE__FRIENDS') : this.searchAndDisplayUsers(text)}
                    onChangeText={text =>
                      this.searchAndDisplayUsers2(text.toLowerCase().trim())
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => this.searchAndDisplayUsers2()}
                  style={{ paddingLeft: 4 }}
                >
                  <Text
                    style={{
                      alignSelf: "center",
                      fontFamily: "Lato",
                      fontSize: 17,
                      color: "#004D9B"
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                width: "90%",
                height: 1,
                backgroundColor: "#BCE0FD",
                marginBottom: 10,
                position: "relative",
                left: 10
              }}
            />
          </View>
          <Content>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", width: "90%" }}
            >
              <View style={{ flex: 18 }}>
                {this.state.contactList && this.state.contactList.length > 0 ? (
                  this.state.contactList.map((data, key) => {
                    return (
                      <View style={{ paddingTop: 3 }} key={key}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            backgroundColor: "white",
                            borderRadius: 40,
                            marginLeft: 2,
                            shadowColor: "#707070",
                            shadowOffset: { width: 6, height: 6 },
                            shadowOpacity: 0.3
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            {data.profileImgUrl ? (
                              <Image
                                source={{ uri: data.profileImgUrl }}
                                style={{
                                  alignSelf: "center",
                                  width: 40,
                                  height: 40,
                                  borderRadius: 20
                                }}
                              />
                            ) : (
                              <Image
                                source={IconsMap.icon_contact_avatar}
                                style={{
                                  alignSelf: "center",
                                  width: 40,
                                  height: 40,
                                  borderRadius: 20
                                }}
                              />
                            )}
                          </View>
                          <View style={{ flex: 4, justifyContent: "center" }}>
                            <Text
                              style={
                                data.colorChange
                                  ? { fontSize: 17, color: "red" }
                                  : {
                                      fontSize: 17,
                                      position: "relative",
                                      top: -3
                                    }
                              }
                            >
                              {data.name}
                            </Text>
                          </View>
                          {data.preselect ? (
                            <Button
                              transparent
                              icon
                              disabled={
                                _.has(data, "status") &&
                                (data.status == "going" ||
                                  data.status == "maybe")
                                  ? true
                                  : false
                              }
                              style={{ alignSelf: "center" }}
                              onPress={() =>
                                this.removeUserAsInviteeFromEvent(data)
                              }
                            >
                              {this.minusIcon(data)}
                            </Button>
                          ) : (
                            <Button
                              transparent
                              icon
                              style={{ alignSelf: "center" }}
                              onPress={() => this.addUserAsInviteeToEvent(data)}
                            >
                              <Icon
                                type="FontAwesome"
                                name="plus"
                                style={{ color: "#6EB25A" }}
                              />
                            </Button>
                          )}
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "center"
                    }}
                  >
                    <Text>No {this.state.emptyListOf} to show right now</Text>
                  </View>
                )}
              </View>
            </View>
          </Content>
          <View
            style={{
              width: "90%",
              height: 1,
              backgroundColor: "#BCE0FD",
              marginBottom: 10,
              position: "relative",
              left: 10,
              top: -15
            }}
          />
          <View
            style={{
              flexDirection: "column",
              alignSelf: "flex-end",
              position: "absolute",
              right: 10,
              top: "25%"
            }}
          >
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("A")}>
              <Text style={AddInviteeStyles.textSearchList}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("B")}>
              <Text style={AddInviteeStyles.textSearchList}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("C")}>
              <Text style={AddInviteeStyles.textSearchList}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("D")}>
              <Text style={AddInviteeStyles.textSearchList}>D</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("E")}>
              <Text style={AddInviteeStyles.textSearchList}>E</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("F")}>
              <Text style={AddInviteeStyles.textSearchList}>F</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("G")}>
              <Text style={AddInviteeStyles.textSearchList}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("H")}>
              <Text style={AddInviteeStyles.textSearchList}>H</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("I")}>
              <Text style={AddInviteeStyles.textSearchList}>I</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("J")}>
              <Text style={AddInviteeStyles.textSearchList}>J</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("K")}>
              <Text style={AddInviteeStyles.textSearchList}>K</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("L")}>
              <Text style={AddInviteeStyles.textSearchList}>L</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("M")}>
              <Text style={AddInviteeStyles.textSearchList}>M</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("N")}>
              <Text style={AddInviteeStyles.textSearchList}>N</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("O")}>
              <Text style={AddInviteeStyles.textSearchList}>O</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("P")}>
              <Text style={AddInviteeStyles.textSearchList}>P</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("Q")}>
              <Text style={AddInviteeStyles.textSearchList}>Q</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("R")}>
              <Text style={AddInviteeStyles.textSearchList}>R</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("S")}>
              <Text style={AddInviteeStyles.textSearchList}>S</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("T")}>
              <Text style={AddInviteeStyles.textSearchList}>T</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("U")}>
              <Text style={AddInviteeStyles.textSearchList}>U</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("V")}>
              <Text style={AddInviteeStyles.textSearchList}>V</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("W")}>
              <Text style={AddInviteeStyles.textSearchList}>W</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("X")}>
              <Text style={AddInviteeStyles.textSearchList}>X</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("Y")}>
              <Text style={AddInviteeStyles.textSearchList}>Y</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.searchAndDisplayUsers("Z")}>
              <Text style={AddInviteeStyles.textSearchList}>Z</Text>
            </TouchableOpacity>
          </View>
          {Platform.OS === "ios" ? (
            <Footer style={AddInviteeStyles.bottomView_ios}>
              <Left>
                {this.state.editMode ? (
                  <TouchableOpacity
                    onPress={() => this.discardEvent()}
                    style={AddInviteeStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_red}
                        style={AddInviteeStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{ uri: AddInviteeSvg.icon_close_red }}
                        style={AddInviteeStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.discardEvent()}
                    style={AddInviteeStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_gray}
                        style={AddInviteeStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{ uri: AddInviteeSvg.icon_close_gray }}
                        style={AddInviteeStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                )}
                {this.state.editMode ? (
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}
                    style={{ position: "absolute", left: 80, bottom: -32 }}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_chevron_left}
                        style={AddInviteeStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{ uri: AddInviteeSvg.icon_chevron_left }}
                        style={AddInviteeStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                ) : null}
              </Left>
              <Body style={AddInviteeStyles.bottomView_android}>
                <TouchableOpacity
                  onPress={() => this.addContact()}
                  style={{ position: "absolute", bottom: -32, left: 20 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_add_user_event}
                      style={{ width: 82, height: 82 }}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: AddInviteeSvg.icon_add_user_event
                      }}
                      style={{ width: 82, height: 82 }}
                    />
                  )}
                </TouchableOpacity>
              </Body>
              <Right>
                <TouchableOpacity
                  onPress={() => this.proceedToConfirmation()}
                  style={AddInviteeStyles.fabRightWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_next}
                      style={AddInviteeStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{ uri: AddInviteeSvg.icon_next }}
                      style={AddInviteeStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </Footer>
          ) : (
            <View style={AddInviteeStyles.bottomView_android}>
              <Left>
                {this.state.editMode ? (
                  <TouchableOpacity
                    onPress={() => this.discardEvent()}
                    style={AddInviteeStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_red}
                        style={AddInviteeStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{ uri: AddInviteeSvg.icon_close_red }}
                        style={AddInviteeStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.discardEvent()}
                    style={AddInviteeStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_gray}
                        style={AddInviteeStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{ uri: AddInviteeSvg.icon_close_gray }}
                        style={AddInviteeStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                )}
                {this.state.editMode ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.props.navigation.replace("AddEvent", {
                        isEditMode: true,
                        eventId: this.state.eventId
                      });
                    }}
                    style={{ position: "absolute", left: 80, bottom: -32 }}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_chevron_left}
                        style={AddInviteeStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{ uri: AddInviteeSvg.icon_chevron_left }}
                        style={AddInviteeStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                ) : null}
              </Left>
              <Body>
                <TouchableOpacity
                  onPress={() => this.addContact()}
                  style={{ position: "absolute", bottom: -32, left: 20 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_add_user_event}
                      style={{ width: 78, height: 78 }}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: AddInviteeSvg.icon_add_user_event
                      }}
                      style={{ width: 78, height: 78 }}
                    />
                  )}
                </TouchableOpacity>
              </Body>
              <Right>
                <TouchableOpacity
                  onPress={() => this.proceedToConfirmation()}
                  style={AddInviteeStyles.fabRightWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_next}
                      style={AddInviteeStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{ uri: AddInviteeSvg.icon_next }}
                      style={AddInviteeStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </View>
          )}
        </Container>
        {this.state.animating && (
          <View style={AddInviteeStyles.overlay}>
            <Spinner
              color={"lightgoldenrodyellow"}
              style={AddInviteeStyles.spinner}
            />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user,
    event: state.event.details,
    eventAdded: false,
    indicatorShow: state.auth.indicatorShow,
    addedInvitees: state.invitee.addedInvitees
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicatorAction(bShow));
    },
    removeEventDataAction: evtKey => {
      dispatch(removeEventDataAction(evtKey));
    },
    addInvitee: id => {
      dispatch({
        type: "ADD_INVITEES",
        payload: id
      });
    },
    removeInvitee: id => {
      dispatch({
        type: "REMOVE_INVITEES",
        payload: id
      });
    },
    emptyInvitee: () => {
      dispatch({
        type: "EMPTY_INVITEE"
      });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddInviteeContainer);
