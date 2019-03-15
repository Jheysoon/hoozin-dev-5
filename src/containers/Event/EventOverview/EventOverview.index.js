import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
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
  Fab,
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
import { filterInviteeByRSVP } from "../../../utils/eventListFilter";
import { EventServiceAPI, UserManagementServiceAPI } from "../../../api";

// stylesheet
import { EventOverviewStyles } from "./eventoverview.style";

const inviteeStatusMarker = {
  going: "rgba(110, 178, 90, 0.55)",
  invited: "rgba(239, 154, 18, 0.55)",
  declined: "rgba(255, 0, 59, 0.55)"
};
/* Redux container component to present an overview of the created event */
class EventOverviewContainer extends Component {
  static navigationOptions = {
    header: null
  };
  constructor() {
    super();
    this.state = {
      filteredInvitedList: [],
      unfilteredInviteeList: [],
      eventData: {},
      animating: true,
      eventInviteeFiltered: [],
      currentUserName: "",
      currentUserProfileImgUrl: "",
      prevTextElemRef: null,
      prevBarElemRef: null,
      prevBarElemColor: null,
      defaultOrEventLocation: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    };
  }
  componentWillMount() {
    const { params } = this.props.navigation.state;
    if (!!params && !!params.eventId) {
      this.getEventInformation(params.eventId, this.props.user.socialUID);
      // eventSvc.getUserDetailsAPI2(this.props.user.socialUID)
      //     .then(userData => this.setState({ currentUserName: userData.name }));
    }
  }

  // getEventInformation(eventId) {
  //     const eventSvc = new EventServiceAPI();
  //     eventSvc.getEventDetailsAPI(eventId, this.props.user.socialUID)
  //         .then(eventData => {
  //             if(eventData) {
  //                 let tempInvitees = [];
  //                 for(let key in eventData.invitee) {
  //                     tempInvitees.push(eventData.invitee[key])
  //                 }
  //                 eventData.invitee = tempInvitees;
  //                 eventData['eventId'] = eventId;
  //                 const coords = eventData.evtCoords?{latitude: eventData.evtCoords.lat, longitude: eventData.evtCoords.lng, latitudeDelta: 0.0922, longitudeDelta: 0.0421}:this.state.defaultOrEventLocation;
  //                 this.setState({eventData: eventData, eventInviteeFiltered: eventData.invitee, defaultOrEventLocation: coords});
  //             }
  //         });
  // }

  /**
   * @description Get details such as host, invitee and friends about requested event
   * @param {string} eventKey
   * @param {string} userId
   */
  async getEventInformation(eventKey, userId) {
    const eventSvc = new EventServiceAPI();
    const userSvc = new UserManagementServiceAPI();

    const eventData = await eventSvc.getEventDetailsAPI2(eventKey, userId);
    const currentUserData = await userSvc.getUserDetailsAPI(userId);
    const currentUserFriends = await userSvc.getUsersFriendListAPI(userId);

    if (eventData && currentUserData && currentUserFriends) {
      eventData.invitee = Object.keys(eventData.invitee).map(inviteeUserKey => {
        eventData.invitee[inviteeUserKey]["inviteeId"] = inviteeUserKey;
        return eventData.invitee[inviteeUserKey];
      });

      const currentUsrFrnds = currentUserFriends.filter(friend => {
        if (friend.eventList) {
          return (
            friend.eventList.filter(event => {
              if (event.eventId == eventKey) {
                friend["status"] = "maybe";
                return true;
              }
            }).length > 0
          );
        } else if (friend.event) {
          if (Object.keys(friend.event).includes(eventKey)) {
            friend["status"] = "going";
            return true;
          }
        }
      });

      eventData["eventId"] = eventKey;
      const coords = eventData.evtCoords
        ? {
            latitude: eventData.evtCoords.lat,
            longitude: eventData.evtCoords.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }
        : this.state.defaultOrEventLocation;
      this.filterEventInviteesByRSVP(
        "all",
        this.refs.textForStatusAll,
        this.refs.activeBarForStatusAll,
        "hsla(207, 97%, 75%, 1)"
      );
      this.setState({
        eventData: eventData,
        unfilteredInviteeList: eventData.invitee,
        filteredInvitedList: eventData.invitee,
        currentUserFriends: currentUsrFrnds,
        defaultOrEventLocation: coords,
        currentUserName: currentUserData.name,
        currentUserProfileImgUrl: currentUserData.profileImgUrl || "",
        animating: false
      });
    } else {
      this.setState({ animating: false });
      Alert.alert(
        "Content unavailable!",
        "It seems we are having trouble getting requested information",
        [
          {
            text: "Retry again",
            onPress: () => {
              this.setState({ animating: true });
              return this.getEventInformation(eventKey, userId);
            }
          }
        ]
      );
    }
  }

  loadImagesStart() {
    this.setState({ animating: true });
  }

  loadImagesComplete() {
    this.setState({ animating: false });
  }

  onEditEvent() {
    firebase
      .database()
      .ref(
        `users/${this.props.user.socialUID}/event/${
          this.state.eventData.eventId
        }`
      )
      .update({ status: "Editing" })
      .then(() => {
        this.props.navigation.navigate({
          routeName: "AddEvent",
          key: "AddEvent",
          params: { eventId: this.state.eventData.eventId, isEditMode: true }
        });
      });
  }

  filterInviteeByStatus(responseStatus) {
    const filteredList = this.state.eventData.invitee.filter(invitee => {
      if (responseStatus == "all") {
        return (
          invitee.status == "accepted" ||
          invitee.status == "going" ||
          invitee.status == "invited" ||
          invitee.status == "maybe"
        );
      } else if (responseStatus == "accepted") {
        return invitee.status == "accepted" || invitee.status == "going";
      } else if (responseStatus == "maybe") {
        return invitee.status == "invited" || invitee.status == "maybe";
      } else if (responseStatus == "declined") {
        return invitee.status == "declined";
      } else if (responseStatus == "friends") {
      }
    });
    this.setState({ eventInviteeFiltered: filteredList });
  }

  /**
   * @description calculate color value and return a darker shade of the color
   * @param {string} color
   */
  calculateActiveColor(color) {
    const colorComponents = color.split(",");
    colorComponents[2] = `${parseInt(colorComponents[2]) - 20}%`;
    return colorComponents.join(",");
  }

  /**
   * @description filter event invitees by RSVP status
   * @param {string} responseStatus
   */
  filterEventInviteesByRSVP(
    responseStatus,
    textElemRef,
    barElemRef,
    currentColor
  ) {
    let filteredInvitee = [];
    if (responseStatus != "friends") {
      filteredInvitee = this.state.unfilteredInviteeList.filter(invitee =>
        filterInviteeByRSVP(invitee, responseStatus)
      );
    } else {
      filteredInvitee = this.state.currentUserFriends;
    }
    this.setState({
      filteredInvitedList: filteredInvitee,
      prevTextElemRef: textElemRef,
      prevBarElemColor: currentColor,
      prevBarElemRef: barElemRef
    });
    textElemRef.setNativeProps({
      style: { fontWeight: "700" }
    });
    barElemRef.setNativeProps({
      style: { backgroundColor: this.calculateActiveColor(currentColor) }
    });
    if (
      this.state.prevTextElemRef != this.state.textElemRef &&
      this.state.prevBarElemRef != barElemRef &&
      this.state.prevBarElemColor
    ) {
      this.state.prevTextElemRef.setNativeProps({
        style: { fontWeight: "400" }
      });

      this.state.prevBarElemRef.setNativeProps({
        style: { backgroundColor: this.state.prevBarElemColor }
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent headerTitle="Event Overview" />
          <View style={EventOverviewStyles.eventDetailCard}>
            <View style={EventOverviewStyles.eventDetail}>
              <View style={EventOverviewStyles.cardAvatarWrapper}>
                <View>
                  {this.state.currentUserProfileImgUrl ? (
                    <View style={EventOverviewStyles.cardAvatar}>
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
                    <View style={EventOverviewStyles.cardAvatar}>
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
                  <Text style={EventOverviewStyles.eventHostName}>
                    {this.state.currentUserName || ""}
                  </Text>
                </View>
              </View>
              <View style={EventOverviewStyles.cardDetail}>
                <View>
                  {/* <Text style={EventOverviewStyles.eventTitle}>
                                        {this.props.event.eventTitle || this.state.eventData.eventTitle}
                                    </Text> */}
                </View>
                <View style={EventOverviewStyles.eventMetaWrapper}>
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
              height: 1,
              backgroundColor: "#BCE0FD",
              marginBottom: 10,
              position: "relative",
              left: 10,
              top: 10
            }}
          />
          <View style={{ position: "relative", left: 20 }}>
            <ScrollView horizontal={true}>
              <View>
                <TouchableOpacity
                  style={EventOverviewStyles.btnGroups}
                  onPress={() =>
                    this.filterEventInviteesByRSVP(
                      "all",
                      this.refs.textForStatusAll,
                      this.refs.activeBarForStatusAll,
                      "hsla(207, 97%, 75%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusAll"
                    style={EventOverviewStyles.btnGroupTxt}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusAll"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(207, 97%, 75%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={EventOverviewStyles.btnGroups}
                  onPress={() =>
                    this.filterEventInviteesByRSVP(
                      "accepted",
                      this.refs.textForStatusAccepted,
                      this.refs.activeBarForStatusAccepted,
                      "hsla(106, 36%, 52%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusAccepted"
                    style={EventOverviewStyles.btnGroupTxt}
                  >
                    Accepted
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusAccepted"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(106, 36%, 52%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={EventOverviewStyles.btnGroups}
                  onPress={() =>
                    this.filterEventInviteesByRSVP(
                      "maybe",
                      this.refs.textForStatusInvited,
                      this.refs.activeBarForStatusInvited,
                      "hsla(37, 87%, 50%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusInvited"
                    style={EventOverviewStyles.btnGroupTxt}
                  >
                    Maybe
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusInvited"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(37, 87%, 50%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={EventOverviewStyles.btnGroups}
                  onPress={() =>
                    this.filterEventInviteesByRSVP(
                      "declined",
                      this.refs.textForStatusDeclined,
                      this.refs.activeBarForStatusDeclined,
                      "hsla(346, 100%, 50%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusDeclined"
                    style={EventOverviewStyles.btnGroupTxt}
                  >
                    Declined
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusDeclined"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(346, 100%, 50%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={EventOverviewStyles.btnGroups}
                  onPress={() =>
                    this.filterEventInviteesByRSVP(
                      "friends",
                      this.refs.textForStatusFriends,
                      this.refs.activeBarForStatusFriends,
                      "hsla(208, 96%, 57%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusFriends"
                    style={EventOverviewStyles.btnGroupTxt}
                  >
                    Friends
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusFriends"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(208, 96%, 57%, 1)"
                  }}
                />
              </View>
            </ScrollView>
          </View>
          <Content>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}
            >
              <View style={{ flex: 18 }}>
                {this.state.filteredInvitedList &&
                this.state.filteredInvitedList.length > 0
                  ? this.state.filteredInvitedList.map((data, key) => {
                      return (
                        <View
                          style={{
                            width: "95%",
                            marginLeft: 5,
                            paddingTop: 3,
                            borderBottomWidth: 0,
                            borderBottomColor: "#D8D8D8",
                            borderWidth: 0,
                            borderRadius: 2,
                            borderColor: "#D8D8D8",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            elevation: 1
                          }}
                          key={key}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center",
                              backgroundColor: "white",
                              borderRadius: 40,
                              marginLeft: 2
                            }}
                          >
                            <View style={{ flex: 2 }}>
                              {data.profileImgUrl ? (
                                <Image
                                  source={{ uri: data.profileImgUrl }}
                                  style={{
                                    alignSelf: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    left: -28,
                                    top: 0
                                  }}
                                  onLoadStart={() => this.loadImagesStart()}
                                  onLoadEnd={() => this.loadImagesComplete()}
                                />
                              ) : (
                                <Image
                                  source={IconsMap.icon_contact_avatar}
                                  style={{
                                    alignSelf: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    left: -28,
                                    top: 0
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
                                        left: -50
                                      }
                                }
                              >
                                {data.name}
                              </Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: "center" }}>
                              {data.status == "invited" ||
                              data.status == "maybe" ? (
                                <View
                                  style={{
                                    width: 25,
                                    height: 25,
                                    borderRadius: 12.5,
                                    backgroundColor:
                                      inviteeStatusMarker.invited,
                                    position: "relative",
                                    left: 20
                                  }}
                                />
                              ) : data.status == "going" ||
                                data.status == "accepted" ? (
                                <View
                                  style={{
                                    width: 25,
                                    height: 25,
                                    borderRadius: 12.5,
                                    backgroundColor: inviteeStatusMarker.going,
                                    position: "relative",
                                    left: 20
                                  }}
                                />
                              ) : (
                                <View
                                  style={{
                                    width: 25,
                                    height: 25,
                                    borderRadius: 12.5,
                                    backgroundColor:
                                      inviteeStatusMarker.declined,
                                    position: "relative",
                                    left: 20
                                  }}
                                />
                              )}
                            </View>
                          </View>
                        </View>
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
            <Footer style={EventOverviewStyles.bottomView_ios}>
              <Left>
                <TouchableOpacity
                  onPress={() => this.onEditEvent()}
                  style={EventOverviewStyles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_edit}
                      style={EventOverviewStyles.fabStyles}
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
                                        }
                                  
                                        .cls-3 {
                                          fill: #fff;
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
                                    <g id="Group_1242" data-name="Group 1242" transform="translate(-158 -619)">
                                      <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                      </g>
                                      <g id="Compose" transform="translate(-110 398)">
                                        <rect id="Rectangle_324" data-name="Rectangle 324" class="cls-2" width="16" height="16" transform="translate(290 237)"/>
                                        <path id="Path_110" data-name="Path 110" class="cls-3" d="M8.154,3.077,2.462,8.923,0,16l7.077-2.308L12.769,8Zm7.231-.462-2-2a1.865,1.865,0,0,0-2.769,0L8.923,2.308l4.615,4.769,1.846-1.846A1.95,1.95,0,0,0,16,3.846,1.9,1.9,0,0,0,15.385,2.615Z" transform="translate(290 237)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={EventOverviewStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body />
              <Right>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate({
                      routeName: "NearbyEvents",
                      key: "NearbyEvents"
                    })
                  }
                  style={{ position: "absolute", right: 80, bottom: -30 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_map}
                      style={EventOverviewStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-2 {
                                          fill: #2699fb;
                                        }
                                  
                                        .cls-3 {
                                          filter: url(#Ellipse_368);
                                        }
                                      </style>
                                      <filter id="Ellipse_368" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="btn_EventMap" transform="translate(-865 -525)">
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 865, 525)">
                                        <circle id="Ellipse_368-2" data-name="Ellipse 368" class="cls-1" cx="21" cy="21" r="21" transform="translate(9 6)"/>
                                      </g>
                                      <path id="Path_760" data-name="Path 760" class="cls-2" d="M6.3,6.3A19.064,19.064,0,0,1,21,0,19.064,19.064,0,0,1,35.7,6.3,19.064,19.064,0,0,1,42,21a19.064,19.064,0,0,1-6.3,14.7A19.064,19.064,0,0,1,21,42,19.064,19.064,0,0,1,6.3,35.7C2.45,31.5,0,26.95,0,21A19.064,19.064,0,0,1,6.3,6.3ZM23.8,37.8q2.1,0,5.25-3.15A15.287,15.287,0,0,0,31.5,27.3a5.8,5.8,0,0,0-1.75-4.2A6.161,6.161,0,0,0,25.2,21H21.7a10.22,10.22,0,0,1-3.15-.7,3.177,3.177,0,0,1-1.05-2.45,1.818,1.818,0,0,1,.7-1.4,2.653,2.653,0,0,1,1.4-.7,2.389,2.389,0,0,1,1.75,1.05c.7.35,1.05.7,1.4.7a2.1,2.1,0,0,0,1.4-.35,2.1,2.1,0,0,0,.35-1.4,5.57,5.57,0,0,0-1.75-3.5A14.477,14.477,0,0,0,24.5,5.6a.753.753,0,0,0-.7-.7A10.82,10.82,0,0,0,21,4.2c-3.85.35-6.65,1.05-9.1,2.8a8.812,8.812,0,0,0-3.15,7,8.962,8.962,0,0,0,2.8,6.65,9.562,9.562,0,0,0,6.65,2.8h0v1.4a4.494,4.494,0,0,0,1.4,3.5,5.1,5.1,0,0,0,3.15,2.1v6.3c0,.35,0,.35.35.7S23.45,37.8,23.8,37.8Z" transform="translate(874 531)"/>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={EventOverviewStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("EventList")}
                  style={EventOverviewStyles.fabRightWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_list_circle}
                      style={EventOverviewStyles.fabStyles}
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
                                          stroke-width: 3px;
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
                                    <g id="btn_Event_List" transform="translate(-9 -619)">
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 9, 619)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                      </g>
                                      <g id="Group_483" data-name="Group 483" transform="translate(0.5 3.5)">
                                        <g id="Group_479" data-name="Group 479">
                                          <line id="Line_37" data-name="Line 37" class="cls-2" x2="18" transform="translate(32.5 632.5)"/>
                                          <line id="Line_38" data-name="Line 38" class="cls-2" x2="3" transform="translate(26.5 632.5)"/>
                                        </g>
                                        <g id="Group_480" data-name="Group 480">
                                          <line id="Line_39" data-name="Line 39" class="cls-2" x2="18" transform="translate(32.5 637.5)"/>
                                          <line id="Line_40" data-name="Line 40" class="cls-2" x2="3" transform="translate(26.5 637.5)"/>
                                        </g>
                                        <g id="Group_481" data-name="Group 481">
                                          <line id="Line_41" data-name="Line 41" class="cls-2" x2="18" transform="translate(32.5 642.5)"/>
                                          <line id="Line_42" data-name="Line 42" class="cls-2" x2="3" transform="translate(26.5 642.5)"/>
                                        </g>
                                        <g id="Group_482" data-name="Group 482">
                                          <line id="Line_43" data-name="Line 43" class="cls-2" x2="18" transform="translate(32.5 647.5)"/>
                                          <line id="Line_44" data-name="Line 44" class="cls-2" x2="3" transform="translate(26.5 647.5)"/>
                                        </g>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={EventOverviewStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </Footer>
          ) : (
            <View style={EventOverviewStyles.bottomView_android}>
              <Left>
                <TouchableOpacity
                  onPress={() => this.onEditEvent()}
                  style={EventOverviewStyles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_edit}
                      style={EventOverviewStyles.fabStyles}
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
                                    }
                              
                                    .cls-3 {
                                      fill: #fff;
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
                                <g id="Group_1242" data-name="Group 1242" transform="translate(-158 -619)">
                                  <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                  </g>
                                  <g id="Compose" transform="translate(-110 398)">
                                    <rect id="Rectangle_324" data-name="Rectangle 324" class="cls-2" width="16" height="16" transform="translate(290 237)"/>
                                    <path id="Path_110" data-name="Path 110" class="cls-3" d="M8.154,3.077,2.462,8.923,0,16l7.077-2.308L12.769,8Zm7.231-.462-2-2a1.865,1.865,0,0,0-2.769,0L8.923,2.308l4.615,4.769,1.846-1.846A1.95,1.95,0,0,0,16,3.846,1.9,1.9,0,0,0,15.385,2.615Z" transform="translate(290 237)"/>
                                  </g>
                                </g>
                              </svg>
                              `
                      }}
                      style={EventOverviewStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body />
              <Right>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("NearbyEvents")}
                  style={{ position: "absolute", right: 80, bottom: -30 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_map}
                      style={EventOverviewStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #fff;
                                    }
                              
                                    .cls-2 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-3 {
                                      filter: url(#Ellipse_368);
                                    }
                                  </style>
                                  <filter id="Ellipse_368" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                    <feOffset dy="3" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="btn_EventMap" transform="translate(-865 -525)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 865, 525)">
                                    <circle id="Ellipse_368-2" data-name="Ellipse 368" class="cls-1" cx="21" cy="21" r="21" transform="translate(9 6)"/>
                                  </g>
                                  <path id="Path_760" data-name="Path 760" class="cls-2" d="M6.3,6.3A19.064,19.064,0,0,1,21,0,19.064,19.064,0,0,1,35.7,6.3,19.064,19.064,0,0,1,42,21a19.064,19.064,0,0,1-6.3,14.7A19.064,19.064,0,0,1,21,42,19.064,19.064,0,0,1,6.3,35.7C2.45,31.5,0,26.95,0,21A19.064,19.064,0,0,1,6.3,6.3ZM23.8,37.8q2.1,0,5.25-3.15A15.287,15.287,0,0,0,31.5,27.3a5.8,5.8,0,0,0-1.75-4.2A6.161,6.161,0,0,0,25.2,21H21.7a10.22,10.22,0,0,1-3.15-.7,3.177,3.177,0,0,1-1.05-2.45,1.818,1.818,0,0,1,.7-1.4,2.653,2.653,0,0,1,1.4-.7,2.389,2.389,0,0,1,1.75,1.05c.7.35,1.05.7,1.4.7a2.1,2.1,0,0,0,1.4-.35,2.1,2.1,0,0,0,.35-1.4,5.57,5.57,0,0,0-1.75-3.5A14.477,14.477,0,0,0,24.5,5.6a.753.753,0,0,0-.7-.7A10.82,10.82,0,0,0,21,4.2c-3.85.35-6.65,1.05-9.1,2.8a8.812,8.812,0,0,0-3.15,7,8.962,8.962,0,0,0,2.8,6.65,9.562,9.562,0,0,0,6.65,2.8h0v1.4a4.494,4.494,0,0,0,1.4,3.5,5.1,5.1,0,0,0,3.15,2.1v6.3c0,.35,0,.35.35.7S23.45,37.8,23.8,37.8Z" transform="translate(874 531)"/>
                                </g>
                              </svg>
                              `
                      }}
                      style={EventOverviewStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("EventList")}
                  style={EventOverviewStyles.fabRightWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_list_circle}
                      style={EventOverviewStyles.fabStyles}
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
                                      stroke-width: 3px;
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
                                <g id="btn_Event_List" transform="translate(-9 -619)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 9, 619)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                  </g>
                                  <g id="Group_483" data-name="Group 483" transform="translate(0.5 3.5)">
                                    <g id="Group_479" data-name="Group 479">
                                      <line id="Line_37" data-name="Line 37" class="cls-2" x2="18" transform="translate(32.5 632.5)"/>
                                      <line id="Line_38" data-name="Line 38" class="cls-2" x2="3" transform="translate(26.5 632.5)"/>
                                    </g>
                                    <g id="Group_480" data-name="Group 480">
                                      <line id="Line_39" data-name="Line 39" class="cls-2" x2="18" transform="translate(32.5 637.5)"/>
                                      <line id="Line_40" data-name="Line 40" class="cls-2" x2="3" transform="translate(26.5 637.5)"/>
                                    </g>
                                    <g id="Group_481" data-name="Group 481">
                                      <line id="Line_41" data-name="Line 41" class="cls-2" x2="18" transform="translate(32.5 642.5)"/>
                                      <line id="Line_42" data-name="Line 42" class="cls-2" x2="3" transform="translate(26.5 642.5)"/>
                                    </g>
                                    <g id="Group_482" data-name="Group 482">
                                      <line id="Line_43" data-name="Line 43" class="cls-2" x2="18" transform="translate(32.5 647.5)"/>
                                      <line id="Line_44" data-name="Line 44" class="cls-2" x2="3" transform="translate(26.5 647.5)"/>
                                    </g>
                                  </g>
                                </g>
                              </svg>
                              `
                      }}
                      style={EventOverviewStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </View>
          )}
        </Container>
        {this.state.animating && (
          <View style={EventOverviewStyles.overlay}>
            <Spinner
              color={"lightgoldenrodyellow"}
              style={EventOverviewStyles.spinner}
            />
          </View>
        )}
      </React.Fragment>
    );
  }
}

// removeFriend(data) {

// }
const styles = StyleSheet.create({
  btnGroups: {
    paddingTop: 6,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#ffffff"
  },
  btnGroupTxt: {
    color: "#004D9B"
  }
});

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user,
    event: state.event.details,
    indicatorShow: state.auth.indicatorShow,
    contactList: state.contactList
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicator(bShow));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventOverviewContainer);
