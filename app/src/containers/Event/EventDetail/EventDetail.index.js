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
import { getEventList } from "./../../../actions/events/list";
import InviteeFilter from "./InviteeFilter";
import InviteeItem from "./../../../components/InviteeItem";
import FilterItems from "../../../components/FilterItems";

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
      },
      activeFilter: "all"
    };

    this.getEventInformation = this.getEventInformation.bind(this);
    this.filterEventInviteesByRSVP = this.filterEventInviteesByRSVP.bind(this);
    this.showUserProfile = this.showUserProfile.bind(this);
  }
  componentWillMount() {
    const { params } = this.props.navigation.state;

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
      /* this.filterEventInviteesByRSVP(
        "all",
        this.refs.textForStatusAll,
        this.refs.activeBarForStatusAll,
        "hsla(207, 97%, 75%, 1)"
      ); */
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
            this.props.getEventList(this.props.user.socialUID);
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
  filterEventInviteesByRSVP(responseStatus) {
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
      activeFilter: responseStatus
    });
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

  showUserProfile(userId) {
    const { eventData, hostId } = this.state;

    this.props.navigation.navigate({
      routeName: "EventActiveUser",
      key: "EventActiveUser",
      params: {
        hostId: userId,
        eventId: eventData.eventId,
        eventHostId: hostId
      }
    });
  }

  render() {
    const FooterWrapper = Platform.OS === "ios" ? Footer : View;

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
                  <View>
                    <Text style={EventDetailStyles.eventTitle}>
                      {this.state.eventData.eventTitle}
                    </Text>
                  </View>
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
                        {this.state.eventData.startTime} -{" "}
                        {this.state.eventData.endTime}
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
                        {this.state.eventData.location}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Lato",
                          color: "#004D9B",
                          textAlign: "right",
                          marginTop: 40,
                          position: "absolute",
                          right: -55,
                          top: 30
                        }}
                      >
                        {this.state.eventData.eventType}
                      </Text>
                    </View>
                    <View style={{ flex: 1.5, marginLeft: 10 }}>
                      <View
                        style={{
                          shadowColor: "#000000",
                          shadowOpacity: 0.16,
                          shadowOffset: { width: 6, height: 6 },
                          shadowRadius: 32,
                          width: 64,
                          height: 64,
                          borderRadius: 32,
                          overflow: "hidden"
                          //marginTop: 20
                        }}
                      >
                        <MapView
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 32
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
              <Text
                style={[EventDetailStyles.eventTitle, { textAlign: "center" }]}
              >
                {this.props.event.eventTitle || this.state.eventData.eventTitle}
              </Text>
            </View>
          )}
          <View style={{ flex: 1, position: "relative" }}>
            <View
              style={{
                width: "95%",
                height: 2,
                backgroundColor: "#BCE0FD",
                marginBottom: 15,
                position: "relative",
                left: 10,
                top: 10
              }}
            />
            {/* <TouchableOpacity
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
            </TouchableOpacity> */}

            <InviteeFilter
              filterInvitee={this.filterEventInviteesByRSVP}
              active={this.state.activeFilter}
            />

            <Content>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 10,
                  marginBottom: 30
                }}
              >
                <View style={{ flex: 18 }}>
                  {this.state.filteredInvitedList &&
                  this.state.filteredInvitedList.length > 0
                    ? this.state.filteredInvitedList.map((data, key) => {
                        return (
                          <InviteeItem
                            data={data}
                            key={key}
                            showUserProfile={this.showUserProfile}
                            viewType="eventDetail"
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
                top: 20
              }}
            />

            <View style={{ justifyContent: "center", flexDirection: "row" }}>
              <FooterWrapper
                style={Platform.select({
                  ios: EventDetailStyles.bottomView_ios,
                  android: EventDetailStyles.bottomView_android
                })}
              >
                <Left>
                  <FilterItems
                    text="Going"
                    type="going"
                    bg="hsla(106, 36%, 52%, 1)"
                    highlight="#ffffff"
                    active=""
                    onPress={() => this.updateInviteeResponse("going")}
                  />
                </Left>
                <Body>
                  <FilterItems
                    text="Maybe"
                    type="maybe"
                    bg="hsla(37, 87%, 50%, 1)"
                    highlight="#ffffff"
                    active=""
                    onPress={() => this.updateInviteeResponse("maybe")}
                  />
                </Body>
                <Right>
                  <FilterItems
                    text="Decline"
                    type="decline"
                    bg="hsla(346, 96%, 60%, 1)"
                    highlight="#ffffff"
                    active=""
                    onPress={() => this.updateInviteeResponse("declined")}
                  />
                </Right>
              </FooterWrapper>
            </View>
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
    getEventList: user_id => {
      dispatch(getEventList(user_id));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventDetailContainer);
