import _ from "lodash";
import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
import MapView from "react-native-maps";
import { connect } from "react-redux";
import moment from "moment";
import firebase from "react-native-firebase";
import AppBarComponent from "../../../components/AppBar/appbar.index";
import { IconsMap } from "assets/assetMap";
// Action creators
import { removeEventDataAction } from "../../../actions/event";
import { setVisibleIndicatorAction } from "../../../actions/auth";

// stylesheet
import { EventConfirmStyles } from "./eventconfirm.style";
import { EventServiceAPI, UserManagementServiceAPI } from "../../../api";
import { getEventInformation } from "../../../actions/events/event";
import InviteeItem from "./../../../components/InviteeItem";

/* Redux container component to confirm the ongoing event */
class ConfirmEventContainer extends Component {
  static navigationOptions = {
    header: null
  };
  constructor() {
    super();
    this.state = {
      searchText: "",
      contactList: [],
      eventData: {},
      eventId: "",
      editMode: false,
      currentUserName: "",
      currentUserProfileImgUrl: "",
      animating: true,
      defaultOrEventLocation: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    };
  }
  componentDidMount() {
    const { params } = this.props.navigation.state;

    if (!!params && !!params.eventId) {
      const eventSvc = new EventServiceAPI();
      this.getEventInformation(params.eventId);

      eventSvc.getUserDetailsAPI2(this.props.user.socialUID).then(userData =>
        this.setState({
          currentUserName: userData.name,
          currentUserProfileImgUrl: userData.profileImgUrl
        })
      );
      this.setState({ eventId: params.eventId, editMode: params.isEditMode });
    }
  }

  // Lifecycle during update
  componentWillReceiveProps(nextProps) {
    this.setState({
      contactList: []
    });
    this.props.navigation.replace("NearbyEvents");
  }

  loadImagesStart() {
    this.setState({ animating: true });
  }

  loadImagesComplete() {
    this.setState({ animating: false });
  }

  /**
   * @description Fetches requested / current event information
   * @param {string} eventId
   */
  getEventInformation(eventId) {
    const eventSvc = new EventServiceAPI();

    Promise.all([
      eventSvc.getEventDetailsAPI(eventId, this.props.user.socialUID),
      eventSvc.getEventInvitees(eventId)
    ]).then(([eventData, invitees]) => {
      if (eventData) {
        let tempInvitees = [];

        for (let key in invitees) {
          invitees[key].preselect = true;
          invitees[key].inviteeId = invitees[key].userId;
          tempInvitees.push(invitees[key]);
        }

        eventData["invitee"] = tempInvitees;
        eventData["eventId"] = eventId;

        const coords = eventData.evtCoords
          ? {
              latitude: eventData.evtCoords.lat,
              longitude: eventData.evtCoords.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }
          : this.state.defaultOrEventLocation;
        //console.log("ECHO", eventData);
        this.setState({
          eventData: eventData,
          defaultOrEventLocation: coords,
          animating: false
        });
      }
    });
  }

  updateinviteList() {
    /**
     * @TODO Update to to new invitee node
     */
    let self = this;
    let eventKey = this.state.eventId;
    let ref = firebase
      .database()
      .ref()
      .child("users");
    ref
      .child(self.props.user.socialUID)
      .child("event")
      .child(eventKey)
      .child("invitee")
      .once("value")
      .then(function(snapshot) {
        let inviteeList = Object.keys(snapshot._value).map(function(key) {
          let retArrayF = snapshot._value[key];
          retArrayF.keyNode = key;
          return retArrayF;
        });
        let newArr = [];
        inviteeList.map((dataF, key) => {
          let tempObj = {
            name: dataF.name,
            email: dataF.email,
            friendKey: dataF.keyNode,
            fb_user_key: dataF.key ? dataF.key : "",
            phone: dataF.phone ? dataF.phone : "",
            buttonStatus: true
          };
          newArr.push(tempObj);
        });
        self.setState({ contactList: newArr });
      });
  }

  /**
   * @description handles back navigation with eventemitter like listener to force reload the screen
   */
  handleBackNavigation() {
    this.props.navigation.state.params.willReload();
    this.props.navigation.goBack();
  }

  /**
   * Description - cancel the so far created event permannently
   */
  onCancelEvent() {
    const eventSvc = new EventServiceAPI();
    Alert.alert(
      "Yikes, you are about to cancel your event!",
      "If you cancel, the invited people will be notified of this cancellation",
      [
        {
          text: "Cancel It!",
          onPress: () => this.removeEventData(this.state.eventId)
        },
        { text: "Go Back!", onPress: () => {}, style: "cancel" }
      ],
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
  onConfirmEvent(msg) {
    const { params } = this.props.navigation.state;

    if (this.state.eventData.invitee.length == 0 && params.isPrivate == true) {
      Alert.alert(
        "Event requires at least 1 invitee before it could be created"
      );
      return;
    }

    Alert.alert(
      `Awesome, your event’s been ${msg}!`,
      "Just select your event from your event list if you need to update it.",
      [{ text: "Got It!", onPress: () => this.markEventAsConfirmed() }],
      { cancelable: false }
    );
  }

  /**
   * @description mark the current event as confirmed and sync mutual friends list
   */
  markEventAsConfirmed() {
    const socialUID = this.props.user.socialUID;
    const eventKey = this.state.eventId;
    this.setState({ animating: true });

    firebase
      .database()
      .ref(`users/${socialUID}/event/${eventKey}`)
      .update({ status: "confirmed" })
      .then(() => {
        this.createAndSyncFriends(this.state.eventData.invitee, socialUID).then(
          async result => {
            this.setState({ animating: false });

            if (result) {
              if (
                _.size(this.props.addedInvitees) > 0 &&
                this.state.isEditMode
              ) {
                let eventInvitee = firebase
                  .functions()
                  .httpsCallable("eventInvitee");

                await eventInvitee({
                  invitees: this.props.addedInvitees,
                  eventId: eventKey
                });
              }

              this.props.emptyInvitee();

              this.props.navigation.navigate({
                routeName: "EventOverview",
                key: "EventOverview",
                params: { eventId: eventKey }
              });
            } else {
              this.feedbackToUser("SYNC_FRIENDS");
            }
          }
        );
      })
      .catch(err => console.log(err));
  }

  /**
   * @description create and sync friend lists across host and attendees / invitees
   * @param {Array} invitees
   * @param {string} socialUID
   */
  createAndSyncFriends(invitees, socialUID) {
    const userSvc = new UserManagementServiceAPI();

    return Promise.all([
      userSvc.getAllUsersList(),
      userSvc.getUserDetailsByFieldAPI(socialUID, "friends")
    ]).then(result => {
      let currentUserFriendList = result[1];
      let currentUserUpdateResponseCounter = 0;
      let invitedUserUpdateResponseCounter = 0;
      const invitedUserFriendList = result[0]
        .filter(user => {
          return invitees.filter(invitee => {
            return invitee.inviteeId == user.key;
          }).length;
        })
        .map(user => ({ friends: user.friends || [], inviteeId: user.key }));

      invitedUserFriendList.map(invitee => {
        // update friendlist in current user
        const result = currentUserFriendList.find(
          item => item.userId == invitee.inviteeId
        );
        if (!result) {
          currentUserFriendList.push({ userId: invitee.inviteeId });
        }

        // update friendlist in the current invitee in the iteration
        const result2 = invitee.friends.find(item => item.userId == socialUID);
        if (!result2) {
          invitee.friends.push({ userId: socialUID });
        }
        // sync current user
        const currentUserUpdate = userSvc.updateUserDetailsAPI(socialUID, {
          friends: currentUserFriendList
        });

        // sync current invitee in the iteration
        const currentInviteeUpdate = userSvc.updateUserDetailsAPI(
          invitee.inviteeId,
          { friends: invitee.friends }
        );

        // register the update operation
        if (!currentUserUpdate && !currentInviteeUpdate) {
          currentUserUpdateResponseCounter++;
          invitedUserUpdateResponseCounter++;
        }
      });
      return currentUserUpdateResponseCounter <= invitedUserFriendList.length ||
        invitedUserUpdateResponseCounter <= invitedUserFriendList.length
        ? true
        : false;
    });
  }

  //////////
  removeFriend(data) {
    let eventKey = this.state.eventId;
    const userSvc = new UserManagementServiceAPI();
    this.setState({ animating: true });

    firebase
      .database()
      .ref(`users/${data.inviteeId}/eventList`)
      .once("value")
      .then(eventData => {
        if (eventData._value) {
          const updatedEventList = eventData._value.filter(
            event => event.eventId != eventKey
          );
          userSvc
            .updateUserDetailsAPI(data.inviteeId, {
              eventList: updatedEventList
            })
            .then(() => {
              firebase
                .database()
                .ref(`invitees/${eventKey}/${data.inviteeId}`)
                .remove(() => {
                  this.getEventInformation(eventKey);
                });
            });
        }
      });
  }

  addFriend(data) {
    let eventKey = this.state.eventId;

    const insertInvitee = firebase.functions().httpsCallable("insertInvitee");

    insertInvitee({
      eventId: eventKey,
      userId: data.inviteeId
    }).then(() => {
      this.getEventInformation(eventKey);
    });
  }

  render() {
    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent />
          <View style={{ paddingTop: 10, alignSelf: "center" }}>
            <Text style={EventConfirmStyles.textStyle}>Confirm Your Event</Text>
          </View>
          <View style={EventConfirmStyles.eventDetailCard}>
            <View style={EventConfirmStyles.eventDetail}>
              <View style={EventConfirmStyles.cardAvatarWrapper}>
                <View>
                  {this.state.currentUserProfileImgUrl ? (
                    <View style={EventConfirmStyles.cardAvatar}>
                      <Image
                        source={{ uri: this.state.currentUserProfileImgUrl }}
                        style={{
                          alignSelf: "center",
                          width: 85,
                          height: 85,
                          borderRadius: 85 / 2
                        }}
                        onLoadEnd={() => this.loadImagesComplete()}
                        onLoadStart={() => this.loadImagesStart()}
                      />
                    </View>
                  ) : (
                    <View style={EventConfirmStyles.cardAvatar}>
                      <Image
                        source={IconsMap.icon_contact_avatar}
                        style={{
                          alignSelf: "center",
                          width: 85,
                          height: 85,
                          borderRadius: 85 / 2
                        }}
                      />
                    </View>
                  )}
                </View>
                <View style={{ paddingTop: 5 }}>
                  <Text style={EventConfirmStyles.eventHostName}>
                    {this.state.currentUserName}
                  </Text>
                </View>
              </View>
              <View style={EventConfirmStyles.cardDetail}>
                <View>
                  <Text style={EventConfirmStyles.eventTitle}>
                    {this.props.event.eventTitle ||
                      this.state.eventData.eventTitle}
                  </Text>
                </View>
                <View style={EventConfirmStyles.eventMetaWrapper}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#FC3764",
                        fontSize: 12,
                        fontFamily: "Lato",
                        marginTop: -10
                      }}
                    >
                      {moment(this.state.eventData.startDate).format("MMM")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        fontFamily: "Lato",
                        color: "#1D6CBC"
                      }}
                    >
                      {moment(this.state.eventData.startDate).format("DD")}
                    </Text>
                  </View>
                  <View style={{ flex: 4 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Lato",
                        color: "#000000"
                      }}
                    >
                      {this.props.event.startTime ||
                        this.state.eventData.startTime}{" "}
                      -{" "}
                      {this.props.event.endTime || this.state.eventData.endTime}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Lato",
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#000000",
                        marginTop: 10
                      }}
                    >
                      {this.props.event.location ||
                        this.state.eventData.location}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Lato",
                        color: "#004D9B",
                        textAlign: "left",
                        marginTop: 30
                      }}
                    >
                      {this.props.event.eventType ||
                        this.state.eventData.eventType}
                    </Text>
                  </View>
                  <View style={{ flex: 1.5, marginLeft: 10, marginTop: 0 }}>
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        overflow: "hidden",
                        backgroundColor: "transparent",
                        shadowColor: "#000000",
                        shadowOpacity: 0.16,
                        shadowOffset: { width: 6, height: 6 },
                        shadowRadius: 20
                      }}
                    >
                      <MapView
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 32
                        }}
                        region={this.state.defaultOrEventLocation}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              width: "95%",
              height: 1.5,
              backgroundColor: "#2699FB",
              marginBottom: 10,
              position: "relative",
              left: 10,
              top: 10
            }}
          />
          <Content>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 18, paddingTop: 5, marginBottom: 10 }}>
                {this.state.eventData.invitee &&
                this.state.eventData.invitee.length > 0
                  ? this.state.eventData.invitee.map((data, key) => {
                      return (
                        <InviteeItem
                          data={data}
                          key={key}
                          addToEvent={this.addFriend}
                          removeToEvent={this.removeFriend}
                        />
                      );
                    })
                  : null}
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
              top: -20
            }}
          />
          {Platform.OS === "ios" ? (
            <Footer style={EventConfirmStyles.bottomView_ios}>
              <Left>
                {this.state.editMode ? (
                  <TouchableOpacity
                    onPress={() => this.onCancelEvent()}
                    style={EventConfirmStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_red}
                        style={EventConfirmStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #ff003b;
                                              stroke: #bcbcbc;
                                            }
                                      
                                            .cls-2 {
                                              fill: #fff;
                                            }
                                      
                                            .cls-3 {
                                              stroke: none;
                                            }
                                      
                                            .cls-4 {
                                              fill: none;
                                            }
                                      
                                            .cls-5 {
                                              filter: url(#Ellipse_111);
                                            }
                                          </style>
                                          <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                        </defs>
                                        <g id="btn_Delete" transform="translate(-27 -616)">
                                          <g id="Group_1359" data-name="Group 1359">
                                            <g class="cls-5" transform="matrix(1, 0, 0, 1, 27, 616)">
                                              <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                                <circle class="cls-3" cx="21" cy="21" r="21"/>
                                                <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                              </g>
                                            </g>
                                          </g>
                                          <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(48.6 634.6)">
                                            <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                          </g>
                                        </g>
                                      </svg>
                                      `
                        }}
                        style={EventConfirmStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.onCancelEvent()}
                    style={EventConfirmStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_gray}
                        style={EventConfirmStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #bcbcbc;
                                              stroke: #bcbcbc;
                                            }
                                      
                                            .cls-2 {
                                              fill: #fff;
                                            }
                                      
                                            .cls-3 {
                                              stroke: none;
                                            }
                                      
                                            .cls-4 {
                                              fill: none;
                                            }
                                      
                                            .cls-5 {
                                              filter: url(#Ellipse_111);
                                            }
                                          </style>
                                          <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                        </defs>
                                        <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                                          <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                                            <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                              <circle class="cls-3" cx="21" cy="21" r="21"/>
                                              <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                            </g>
                                          </g>
                                          <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                                            <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                          </g>
                                        </g>
                                      </svg>
                                      `
                        }}
                        style={EventConfirmStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => this.handleBackNavigation()}
                  style={{ position: "absolute", left: 80, bottom: -33 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_chevron_left}
                      style={EventConfirmStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #2699fb;
                                        }
                                  
                                        .cls-2 {
                                          fill: none;
                                          stroke: #fff;
                                          stroke-width: 4px;
                                        }
                                  
                                        .cls-3 {
                                          filter: url(#Search_Field);
                                        }
                                      </style>
                                      <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="6" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="Symbol_95_3" data-name="Symbol 95 – 3" transform="translate(-26 -619)">
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 26, 619)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                      </g>
                                      <g id="Group_328" data-name="Group 328" transform="translate(355.5 1254) rotate(180)">
                                        <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                        <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={EventConfirmStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body />
              <Right>
                <TouchableOpacity
                  style={EventConfirmStyles.fabRightWrapperStyles}
                  onPress={() =>
                    this.state.editMode
                      ? this.onConfirmEvent("updated")
                      : this.onConfirmEvent("created")
                  }
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_success}
                      style={EventConfirmStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #2699fb;
                                        }
                                  
                                        .cls-2 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-3 {
                                          fill: none;
                                        }
                                  
                                        .cls-4 {
                                          filter: url(#Search_Field);
                                        }
                                      </style>
                                      <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="6" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="Group_1162" data-name="Group 1162" transform="translate(-158 -619)">
                                      <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                      </g>
                                      <g id="Yes" transform="translate(-277 465)">
                                        <path id="Checkbox" class="cls-2" d="M8.375,14.75,1,7.375l1.75-1.75,5.625,5.5L18.5,1l1.75,1.75Z" transform="translate(454 171.5)"/>
                                        <rect id="Rectangle_556" data-name="Rectangle 556" class="cls-3" width="16" height="16" transform="translate(455 170)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={EventConfirmStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </Footer>
          ) : (
            <View style={EventConfirmStyles.bottomView_android}>
              <Left>
                {this.state.editMode ? (
                  <TouchableOpacity
                    onPress={() => this.onCancelEvent()}
                    style={EventConfirmStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_red}
                        style={EventConfirmStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #ff003b;
                                          stroke: #bcbcbc;
                                        }
                                  
                                        .cls-2 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-3 {
                                          stroke: none;
                                        }
                                  
                                        .cls-4 {
                                          fill: none;
                                        }
                                  
                                        .cls-5 {
                                          filter: url(#Ellipse_111);
                                        }
                                      </style>
                                      <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="btn_Delete" transform="translate(-27 -616)">
                                      <g id="Group_1359" data-name="Group 1359">
                                        <g class="cls-5" transform="matrix(1, 0, 0, 1, 27, 616)">
                                          <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                            <circle class="cls-3" cx="21" cy="21" r="21"/>
                                            <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                          </g>
                                        </g>
                                      </g>
                                      <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(48.6 634.6)">
                                        <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                        }}
                        style={EventConfirmStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.onCancelEvent()}
                    style={EventConfirmStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_gray}
                        style={EventConfirmStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #bcbcbc;
                                          stroke: #bcbcbc;
                                        }
                                  
                                        .cls-2 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-3 {
                                          stroke: none;
                                        }
                                  
                                        .cls-4 {
                                          fill: none;
                                        }
                                  
                                        .cls-5 {
                                          filter: url(#Ellipse_111);
                                        }
                                      </style>
                                      <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                                      <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                                        <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                          <circle class="cls-3" cx="21" cy="21" r="21"/>
                                          <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                        </g>
                                      </g>
                                      <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                                        <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                        }}
                        style={EventConfirmStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => this.handleBackNavigation()}
                  style={{ position: "absolute", left: 80, bottom: -33 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_chevron_left}
                      style={EventConfirmStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-2 {
                                      fill: none;
                                      stroke: #fff;
                                      stroke-width: 4px;
                                    }
                              
                                    .cls-3 {
                                      filter: url(#Search_Field);
                                    }
                                  </style>
                                  <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                    <feOffset dy="6" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="Symbol_95_3" data-name="Symbol 95 – 3" transform="translate(-26 -619)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 26, 619)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                  </g>
                                  <g id="Group_328" data-name="Group 328" transform="translate(355.5 1254) rotate(180)">
                                    <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                    <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                  </g>
                                </g>
                              </svg>
                              `
                      }}
                      style={EventConfirmStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body />
              <Right>
                <TouchableOpacity
                  style={EventConfirmStyles.fabRightWrapperStyles}
                  onPress={() =>
                    this.state.editMode
                      ? this.onConfirmEvent("updated")
                      : this.onConfirmEvent("created")
                  }
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_success}
                      style={EventConfirmStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-2 {
                                      fill: #fff;
                                    }
                              
                                    .cls-3 {
                                      fill: none;
                                    }
                              
                                    .cls-4 {
                                      filter: url(#Search_Field);
                                    }
                                  </style>
                                  <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                    <feOffset dy="6" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="Group_1162" data-name="Group 1162" transform="translate(-158 -619)">
                                  <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                  </g>
                                  <g id="Yes" transform="translate(-277 465)">
                                    <path id="Checkbox" class="cls-2" d="M8.375,14.75,1,7.375l1.75-1.75,5.625,5.5L18.5,1l1.75,1.75Z" transform="translate(454 171.5)"/>
                                    <rect id="Rectangle_556" data-name="Rectangle 556" class="cls-3" width="16" height="16" transform="translate(455 170)"/>
                                  </g>
                                </g>
                              </svg>
                              `
                      }}
                      style={EventConfirmStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </View>
          )}
        </Container>
        {this.state.animating && (
          <View style={EventConfirmStyles.overlay}>
            <Spinner
              color={"lightgoldenrodyellow"}
              style={EventConfirmStyles.spinner}
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
    indicatorShow: state.auth.indicatorShow,
    contactList: state.contactList,
    detail: state.eventList.detail,
    addedInvitees: state.invitee.addedInvitees
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicatorAction(bShow));
    },
    removeEventDataAction: evtKey => {
      dispatch(removeEventDataAction(evtKey, this.state.auth.user.socialUID));
    },
    getEventInformation: (eventId, userId) => {
      dispatch(getEventInformation(eventId, userId));
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
)(ConfirmEventContainer);
