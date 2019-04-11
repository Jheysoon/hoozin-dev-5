import React, { Component } from "react";
import _ from "lodash";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
  Spinner,
  Toast
} from "native-base";
import MapView from "react-native-maps";
import { connect } from "react-redux";
import moment from "moment";
import AppBarComponent from "../../../components/AppBar/appbar.index";
import { IconsMap } from "assets/assetMap";
import { filterInviteeByRSVP } from "../../../utils/eventListFilter";

// stylesheet
import { EventDetailStyles } from "./EventDetail.style";
import { EventServiceAPI, UserManagementServiceAPI } from "../../../api";
import { getEventList } from './../../../actions/events/list';

const inviteeStatusMarker = {
  going: "rgba(110, 178, 90, 0.55)",
  invited: "rgba(239, 154, 18, 0.55)",
  declined: "rgba(255, 0, 59, 0.55)"
};

/* Redux container component to present a detailed view of the created event */
class EventDetailContainer extends Component {
  static navigationOptions = {
    header: null
  };
  constructor() {
    super();
    this.state = {
      filteredInvitedList: [],
      unfilteredInviteeList: [],
      unfilteredEventData: [],
      eventData: {},
      hostUserName: "",
      hostUserProfileImgUrl: "",
      currentUserFriends: [],
      hostId: "",
      isInviteeOnlyViewActive: false,
      prevTextElemRef: null,
      prevBarElemRef: null,
      prevBarElemColor: null,
      animating: true,
      defaultOrEventLocation: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    };

    this.getEventInformation = this.getEventInformation.bind(this);
  }
  componentWillMount() {
    const { params } = this.props.navigation.state;
    
    console.log('event id event detail #################');
    console.log(params.eventId);

    if (!!params && !!params.eventId && !!params.hostId) {
      this.getEventInformation(params.eventId, params.hostId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isConnected && this.state.animating == false) {
      const { params } = this.props.navigation.state;
      if (!!params && !!params.eventId && !!params.hostId) {
        this.setState(
          {
            animating: true
          },
          () => {
            this.getEventInformation(params.eventId, params.hostId);
          }
        );
      }
    }
  }

  /**
   * @description Get details such as host, invitee and friends about requested event
   * @param {string} eventKey
   * @param {string} hostId
   */
  async getEventInformation(eventKey, hostId) {
    const userSvc = new UserManagementServiceAPI();
    const eventSvc = new EventServiceAPI();

    let eventData = _.find(this.props.eventList, { keyNode: eventKey });

    if (eventData == undefined) {
      eventData = await eventSvc.getEventDetailsAPI2(eventKey, hostId);
    }

    let invitees = await eventSvc.getEventInvitees(eventKey);

    eventData["eventId"] = eventKey;
    eventData.invitee = invitees;

    this.setState({
      eventData: eventData
    });

    //const eventData = await eventSvc.getEventDetailsAPI2(eventKey, hostId);
    const hostUserData = await userSvc.getUserDetailsAPI(hostId);
    const currentUserFriends = await userSvc.getUsersFriendListAPI(
      this.props.user.socialUID
    );

    if (hostUserData && currentUserFriends) {
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
        unfilteredEventData: invitees,
        unfilteredInviteeList: invitees,
        filteredInvitedList: invitees,
        currentUserFriends: currentUsrFrnds,
        defaultOrEventLocation: coords,
        hostId: hostId,
        hostUserName: hostUserData.name,
        hostUserProfileImgUrl: hostUserData.profileImgUrl,
        animating: false
      });
    } else {
      this.setState({ animating: false });
      /* Alert.alert(
        "Content unavailable!",
        "It seems we are having trouble getting requested information",
        [
          {
            text: "Retry again",
            onPress: () => {
              this.setState({ animating: true });
              return this.getEventInformation(eventKey, hostId);
            }
          }
        ]
      ); */
    }
  }

  /**
   * @description update invitee response - going / maybe / decline
   * @param {string} response
   */
  updateInviteeResponse(response) {
    if (this.props.isConnected) {
      const eventSvc = new EventServiceAPI();

      eventSvc
        .updateEventInviteeResponse(
          response,
          this.state.eventData.eventId,
          this.props.user.socialUID
        )
        .then(() => {
          Alert.alert(
            "Event Response Changed!",
            "Your response status for this event has been changed",
            [
              {
                text: "OK, got it",
                onPress: () => {}
              }
            ]
          );

          const eventData = this.state.eventData;
          console.log("++ event data ++", this.state.unfilteredEventData);
          eventData.invitee = this.state.unfilteredEventData.map(
            inviteeUser => {
              if (inviteeUser.inviteeId == this.props.user.socialUID) {
                inviteeUser.status = response;
              }
            }
          );
          this.setState({ eventData }, () => {
            this.props.getEventList(this.props.user.socialUID)
          });
        });
    } else {
      Toast.show({
        text: "No Internet Connection",
        buttonText: "OK",
        position: "bottom"
      });
    }
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

  /**
   * @description show the event location in a map
   */
  showEventLocationMap(eventCoords) {
    this.props.navigation.navigate({
      routeName: "EventMap",
      key: "EventMap",
      params: { eventLocation: eventCoords }
    });
  }

  toggleInviteeOnlyView() {
    this.setState({
      isInviteeOnlyViewActive: !this.state.isInviteeOnlyViewActive
    });
  }

  showUserProfile(userId, eventId, hostId) {
    this.props.navigation.navigate({
      routeName: "EventActiveUser",
      key: "EventActiveUser",
      params: { hostId: userId, eventId: eventId, eventHostId: hostId }
    });
  }

  render() {
    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent
            showBackBtnCircle={true}
            reloadHostFunc={this.props.navigation.state.params.reloadEventsFunc}
          />
          {!this.state.isInviteeOnlyViewActive ? (
            <View style={EventDetailStyles.eventDetailCard}>
              <View style={EventDetailStyles.eventDetail}>
                <View style={EventDetailStyles.cardAvatarWrapper}>
                  <View>
                    {this.state.hostUserProfileImgUrl ? (
                      <View style={EventDetailStyles.cardAvatar}>
                        <Image
                          source={{ uri: this.state.hostUserProfileImgUrl }}
                          style={{
                            alignSelf: "center",
                            width: 85,
                            height: 85,
                            borderRadius: 85 / 2
                          }}
                        />
                      </View>
                    ) : (
                      <View style={EventDetailStyles.cardAvatar}>
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
                  <View style={{ paddingTop: 1 }}>
                    <Text style={EventDetailStyles.eventHostName}>
                      {this.state.hostUserName}
                    </Text>
                  </View>
                </View>
                <View style={EventDetailStyles.cardDetail}>
                  {/* <View>
                                        <Text style={EventDetailStyles.eventTitle}>
                                            {this.props.event.eventTitle || this.state.eventData.eventTitle}
                                        </Text>
                                    </View> */}
                  <View style={EventDetailStyles.eventMetaWrapper}>
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
                        {this.props.event.endTime ||
                          this.state.eventData.endTime}
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
                          textAlign: "right",
                          marginTop: 40,
                          position: "absolute",
                          right: -70,
                          top: 40
                        }}
                      >
                        {this.props.event.eventType ||
                          this.state.eventData.eventType}
                      </Text>
                    </View>
                    <View style={{ flex: 1.5, marginLeft: 10 }}>
                      <View
                        style={{
                          shadowColor: "#000000",
                          shadowOpacity: 0.16,
                          shadowOffset: { width: 6, height: 6 },
                          shadowRadius: 20
                        }}
                      >
                        <MapView
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            marginTop: 10
                          }}
                          onPress={() =>
                            this.showEventLocationMap(
                              this.state.eventData.evtCoords
                            )
                          }
                          region={this.state.defaultOrEventLocation}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View>
              {/* <Text style={[EventDetailStyles.eventTitle, { textAlign: 'center' }]}>
                                {this.props.event.eventTitle || this.state.eventData.eventTitle}
                            </Text> */}
            </View>
          )}
          <View style={{ flex: 1, position: "relative" }}>
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
            <TouchableOpacity
              style={{ position: "absolute", right: 4, top: 8, zIndex: 9999 }}
              onPress={() => this.toggleInviteeOnlyView()}
            >
              {Platform.OS === "ios" ? (
                <Image
                  source={IconsMap.icon_chevron_right_light}
                  style={{ width: 48, height: 48 }}
                />
              ) : (
                <Image
                  source={{
                    uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #bce0fd;
                                      opacity: 0.656;
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
                                  <filter id="Search_Field" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
                                    <feOffset dy="6" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="Group_419" data-name="Group 419" transform="translate(-329 -292)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 329, 292)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="30" height="30" rx="15" transform="translate(39 33) rotate(180)"/>
                                  </g>
                                  <g id="Group_328" data-name="Group 328" transform="translate(349.538 303.077)">
                                    <line id="Line_3" data-name="Line 3" class="cls-2" x1="8.077" y2="9.231" transform="translate(8.077 15) rotate(180)"/>
                                    <line id="Line_4" data-name="Line 4" class="cls-2" x1="8.077" y1="7.5" transform="translate(8.077 7.5) rotate(180)"/>
                                  </g>
                                </g>
                              </svg>
                              `
                  }}
                  style={{ width: 48, height: 48 }}
                />
              )}
            </TouchableOpacity>
            <View>
              <ScrollView horizontal={true}>
                <View>
                  <TouchableOpacity
                    style={EventDetailStyles.btnGroups}
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
                      style={EventDetailStyles.btnGroupTxt}
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
                    style={EventDetailStyles.btnGroups}
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
                      style={EventDetailStyles.btnGroupTxt}
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
                    style={EventDetailStyles.btnGroups}
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
                      style={EventDetailStyles.btnGroupTxt}
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
                    style={EventDetailStyles.btnGroups}
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
                      style={EventDetailStyles.btnGroupTxt}
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
                    style={EventDetailStyles.btnGroups}
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
                      style={EventDetailStyles.btnGroupTxt}
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
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 10
                }}
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
                              <View style={{ flex: 1 }}>
                                {data.profileImgUrl ? (
                                  <TouchableOpacity
                                    onPress={() =>
                                      this.showUserProfile(
                                        data.inviteeId,
                                        this.state.eventData.eventId,
                                        this.state.hostId
                                      )
                                    }
                                  >
                                    <Image
                                      source={{ uri: data.profileImgUrl }}
                                      style={{
                                        alignSelf: "center",
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        left: -14,
                                        top: 0
                                      }}
                                    />
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    onPress={() =>
                                      this.showUserProfile(
                                        data.inviteeId,
                                        this.state.eventData.eventId,
                                        this.state.hostId
                                      )
                                    }
                                  >
                                    <Image
                                      source={IconsMap.icon_contact_avatar}
                                      style={{
                                        alignSelf: "center",
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        left: -14,
                                        top: 0
                                      }}
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                              <View
                                style={{ flex: 4, justifyContent: "center" }}
                              >
                                <Text
                                  style={
                                    data.colorChange
                                      ? { fontSize: 17, color: "red" }
                                      : {
                                          fontSize: 17,
                                          position: "relative",
                                          left: -10
                                        }
                                  }
                                >
                                  {data.name}
                                </Text>
                              </View>
                              <View
                                style={{
                                  flex: 1,
                                  justifyContent: "center",
                                  position: "relative",
                                  left: 10
                                }}
                              >
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
                                      backgroundColor:
                                        inviteeStatusMarker.going,
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
                top: 20
              }}
            />
            {Platform.OS === "ios" ? (
              <Footer style={EventDetailStyles.bottomView_ios}>
                <Left>
                  <TouchableOpacity
                    onPress={() => this.updateInviteeResponse("going")}
                    style={EventDetailStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_going}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 93 39.5">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #004d9b;
                                              font-size: 14px;
                                              font-family: Lato-Regular, Lato;
                                            }
                                      
                                            .cls-2 {
                                              fill: none;
                                              stroke: #6eb25a;
                                              stroke-width: 4px;
                                            }
                                      
                                            .cls-3 {
                                              filter: url(#Line_58);
                                            }
                                      
                                            .cls-4 {
                                              filter: url(#Going);
                                            }
                                          </style>
                                          <filter id="Going" x="19.5" y="0" width="55" height="35" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                          <filter id="Line_58" x="0" y="17.5" width="93" height="22" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur-2"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur-2"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                        </defs>
                                        <g id="btn_Going" transform="translate(-51.5 -624)">
                                          <g class="cls-4" transform="matrix(1, 0, 0, 1, 51.5, 624)">
                                            <text id="Going-2" data-name="Going" class="cls-1" transform="translate(28.5 20)"><tspan x="0" y="0">Going</tspan></text>
                                          </g>
                                          <g class="cls-3" transform="matrix(1, 0, 0, 1, 51.5, 624)">
                                            <line id="Line_58-2" data-name="Line 58" class="cls-2" x2="75" transform="translate(9 25.5)"/>
                                          </g>
                                        </g>
                                      </svg>
                                      `
                        }}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    )}
                  </TouchableOpacity>
                </Left>
                <Body>
                  <TouchableOpacity
                    onPress={() => this.updateInviteeResponse("maybe")}
                    style={EventDetailStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_maybe}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 93 39.5">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #004d9b;
                                              font-size: 14px;
                                              font-family: Lato-Regular, Lato;
                                            }
                                      
                                            .cls-2 {
                                              fill: none;
                                              stroke: #ef9a12;
                                              stroke-width: 4px;
                                            }
                                      
                                            .cls-3 {
                                              filter: url(#Line_59);
                                            }
                                      
                                            .cls-4 {
                                              filter: url(#Maybe);
                                            }
                                          </style>
                                          <filter id="Maybe" x="16.5" y="0" width="61" height="35" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                          <filter id="Line_59" x="0" y="17.5" width="93" height="22" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur-2"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur-2"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                        </defs>
                                        <g id="btn_Maybe" transform="translate(-134.5 -624)">
                                          <g class="cls-4" transform="matrix(1, 0, 0, 1, 134.5, 624)">
                                            <text id="Maybe-2" data-name="Maybe" class="cls-1" transform="translate(25.5 20)"><tspan x="0" y="0">Maybe</tspan></text>
                                          </g>
                                          <g class="cls-3" transform="matrix(1, 0, 0, 1, 134.5, 624)">
                                            <line id="Line_59-2" data-name="Line 59" class="cls-2" x2="75" transform="translate(9 25.5)"/>
                                          </g>
                                        </g>
                                      </svg>
                                      `
                        }}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    )}
                  </TouchableOpacity>
                </Body>
                <Right>
                  <TouchableOpacity
                    onPress={() => this.updateInviteeResponse("declined")}
                    style={EventDetailStyles.fabRightWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_decline}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 93 39.5">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #004d9b;
                                              font-size: 14px;
                                              font-family: Lato-Regular, Lato;
                                            }
                                      
                                            .cls-2 {
                                              fill: none;
                                              stroke: #ff003b;
                                              stroke-width: 4px;
                                            }
                                      
                                            .cls-3 {
                                              filter: url(#Line_60);
                                            }
                                      
                                            .cls-4 {
                                              filter: url(#Decline);
                                            }
                                          </style>
                                          <filter id="Decline" x="14.5" y="0" width="65" height="35" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                          <filter id="Line_60" x="0" y="17.5" width="93" height="22" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur-2"/>
                                            <feFlood flood-opacity="0.161"/>
                                            <feComposite operator="in" in2="blur-2"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                        </defs>
                                        <g id="btn_Decline" transform="translate(-217.5 -624)">
                                          <g class="cls-4" transform="matrix(1, 0, 0, 1, 217.5, 624)">
                                            <text id="Decline-2" data-name="Decline" class="cls-1" transform="translate(23.5 20)"><tspan x="0" y="0">Decline</tspan></text>
                                          </g>
                                          <g class="cls-3" transform="matrix(1, 0, 0, 1, 217.5, 624)">
                                            <line id="Line_60-2" data-name="Line 60" class="cls-2" x2="75" transform="translate(9 25.5)"/>
                                          </g>
                                        </g>
                                      </svg>
                                      `
                        }}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    )}
                  </TouchableOpacity>
                </Right>
              </Footer>
            ) : (
              <View style={EventDetailStyles.bottomView_android}>
                <Left>
                  <TouchableOpacity
                    onPress={() => this.updateInviteeResponse("going")}
                    style={EventDetailStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_going}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 93 39.5">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #004d9b;
                                          font-size: 14px;
                                          font-family: Lato-Regular, Lato;
                                        }
                                  
                                        .cls-2 {
                                          fill: none;
                                          stroke: #6eb25a;
                                          stroke-width: 4px;
                                        }
                                  
                                        .cls-3 {
                                          filter: url(#Line_58);
                                        }
                                  
                                        .cls-4 {
                                          filter: url(#Going);
                                        }
                                      </style>
                                      <filter id="Going" x="19.5" y="0" width="55" height="35" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                      <filter id="Line_58" x="0" y="17.5" width="93" height="22" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur-2"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur-2"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="btn_Going" transform="translate(-51.5 -624)">
                                      <g class="cls-4" transform="matrix(1, 0, 0, 1, 51.5, 624)">
                                        <text id="Going-2" data-name="Going" class="cls-1" transform="translate(28.5 20)"><tspan x="0" y="0">Going</tspan></text>
                                      </g>
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 51.5, 624)">
                                        <line id="Line_58-2" data-name="Line 58" class="cls-2" x2="75" transform="translate(9 25.5)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                        }}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    )}
                  </TouchableOpacity>
                </Left>
                <Body>
                  <TouchableOpacity
                    onPress={() => this.updateInviteeResponse("maybe")}
                    style={EventDetailStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_maybe}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 93 39.5">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #004d9b;
                                          font-size: 14px;
                                          font-family: Lato-Regular, Lato;
                                        }
                                  
                                        .cls-2 {
                                          fill: none;
                                          stroke: #ef9a12;
                                          stroke-width: 4px;
                                        }
                                  
                                        .cls-3 {
                                          filter: url(#Line_59);
                                        }
                                  
                                        .cls-4 {
                                          filter: url(#Maybe);
                                        }
                                      </style>
                                      <filter id="Maybe" x="16.5" y="0" width="61" height="35" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                      <filter id="Line_59" x="0" y="17.5" width="93" height="22" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur-2"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur-2"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="btn_Maybe" transform="translate(-134.5 -624)">
                                      <g class="cls-4" transform="matrix(1, 0, 0, 1, 134.5, 624)">
                                        <text id="Maybe-2" data-name="Maybe" class="cls-1" transform="translate(25.5 20)"><tspan x="0" y="0">Maybe</tspan></text>
                                      </g>
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 134.5, 624)">
                                        <line id="Line_59-2" data-name="Line 59" class="cls-2" x2="75" transform="translate(9 25.5)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                        }}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    )}
                  </TouchableOpacity>
                </Body>
                <Right>
                  <TouchableOpacity
                    onPress={() => this.updateInviteeResponse("declined")}
                    style={EventDetailStyles.fabRightWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_decline}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 93 39.5">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #004d9b;
                                          font-size: 14px;
                                          font-family: Lato-Regular, Lato;
                                        }
                                  
                                        .cls-2 {
                                          fill: none;
                                          stroke: #ff003b;
                                          stroke-width: 4px;
                                        }
                                  
                                        .cls-3 {
                                          filter: url(#Line_60);
                                        }
                                  
                                        .cls-4 {
                                          filter: url(#Decline);
                                        }
                                      </style>
                                      <filter id="Decline" x="14.5" y="0" width="65" height="35" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                      <filter id="Line_60" x="0" y="17.5" width="93" height="22" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur-2"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur-2"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="btn_Decline" transform="translate(-217.5 -624)">
                                      <g class="cls-4" transform="matrix(1, 0, 0, 1, 217.5, 624)">
                                        <text id="Decline-2" data-name="Decline" class="cls-1" transform="translate(23.5 20)"><tspan x="0" y="0">Decline</tspan></text>
                                      </g>
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 217.5, 624)">
                                        <line id="Line_60-2" data-name="Line 60" class="cls-2" x2="75" transform="translate(9 25.5)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                        }}
                        style={EventDetailStyles.rsvpStyles}
                      />
                    )}
                  </TouchableOpacity>
                </Right>
              </View>
            )}
          </View>
        </Container>
        {this.state.animating && (
          <View style={EventDetailStyles.overlay}>
            <Spinner
              color={"lightgoldenrodyellow"}
              style={EventDetailStyles.spinner}
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
    eventList: state.eventList.events,
    isConnected: state.connection.isConnected
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicator(bShow));
    },
    getEventList: (user_id) => {
      dispatch(getEventList(user_id))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventDetailContainer);
