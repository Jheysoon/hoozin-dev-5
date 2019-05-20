import _ from "lodash";
import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  ScrollView,
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
  Item
} from "native-base";
import { withNavigation } from "react-navigation";
import { connect } from "react-redux";
import UserAvatar from "react-native-user-avatar";

import { activeMapCoords } from "../../actions/events/invitee";
import { filterInviteeByRSVP } from "../../utils/eventListFilter";
import AppBarComponent from "../../components/AppBar/appbar.index";
import { EventServiceAPI, UserManagementServiceAPI } from "../../api";
import { IconsMap } from "assets/assetMap";
import Invitees from "./EventActiveAttendees/Invitees";

const inviteeStatusMarker = {
  going: "rgba(110, 178, 90, 0.55)",
  invited: "rgba(239, 154, 18, 0.55)",
  declined: "rgba(255, 0, 59, 0.55)"
};

// @TODO: Rewrite this to stateless component

/* Redux container component to present a detailed view of the created event */
class EventActiveAttendeesContainer extends Component {
  static navigationOptions = {
    header: null
  };
  constructor() {
    super();
    this.state = {
      eventData: {},
      filteredInvitedList: [],
      unfilteredInviteeList: [],
      hostUserFriends: [],
      prevTextElemRef: null,
      prevBarElemRef: null,
      prevBarElemColor: null,
      hostId: "",
      hostUserName: "",
      hostProfileImgUrl: "",
      animating: true,
      currentNavStackDepth: 0,
      chats: [],
      chatCounter: 0
    };

    this.showUserProfile = this.showUserProfile.bind(this);
    this.showInviteeLocation = this.showInviteeLocation.bind(this);
  }
  componentDidMount() {
    const { params } = this.props.screenProps.rootNav.state;
  }

  showUserProfile(userId) {
    // this.props.navigation.navigate({
    //     routeName: 'EventActiveUser',
    //     key: 'EventActiveUser',
    //     params: {
    //         hostId: userId,
    //         eventId: eventId,
    //         eventHostId: hostId,
    //         // eventAndHostData: this.props.navigation.state.params.eventAndHostData,
    //         // mapCallback: this.props.navigation.state.params.mapCallbackFn.bind(this),
    //         // callbackTo: this.props.navigation.state.params.callbackFn.bind(this),
    //         // eventPhotos: this.props.navigation.state.params.eventPhotos
    //     }});

    this.props.navigation.navigate("EventActiveUser", { withUser: userId });
  }

  showInviteeLocation(inviteeId) {
    // if (this.props.navigation.state.params) {
    //     const { callbackFn, eventAndHostData, navStackDepth, inviteeLocationcallback, activeMapScreenKey } = this.props.navigation.state.params;

    //     console.log("++ invitee location callback ++", inviteeLocationcallback);
    //     inviteeLocationcallback?inviteeLocationcallback(inviteeId):callbackFn(inviteeId);

    //     if (this.state.currentNavStackDepth == 2) {
    //         this.props.navigation.goBack();
    //     }
    //     else if (this.state.currentNavStackDepth > 2) {
    //         this.props.navigation.goBack(activeMapScreenKey);
    //     }
    // }

    const { inviteeLocations, activeMapCoords } = this.props;

    _.forEach(inviteeLocations, val => {
      if (val.inviteeId == inviteeId) {
        activeMapCoords({
          latitude: val.lat,
          longitude: val.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        });
      }
    });

    if (this.props.screenProps.rootNav.state.params) {
      const {
        callbackFn,
        inviteeLocationcallback,
        activeMapScreenKey,
        navStackDepth
      } = this.props.screenProps.rootNav.state.params;
      const {
        hostId,
        eventId,
        isHostUser
      } = this.props.screenProps.rootNav.state.params;

      //// CHANGED ON: 29th October, 2018
      // console.log("++ invitee location callback ++", inviteeLocationcallback);
      // inviteeLocationcallback?inviteeLocationcallback(inviteeId):callbackFn(inviteeId);

      // if (this.state.currentNavStackDepth == 2) {
      //     this.props.navigation.goBack();
      // }
      // else if (this.state.currentNavStackDepth > 2) {
      //     this.props.navigation.navigate('EventActiveMap', { eventId, hostId, isHostUser, navStackDepth: this.state.currentNavStackDepth, resetMsgCounterCallbackTo: this.resetUnreadMsgCount.bind(this), key: 'map' });
      // }

      this.props.navigation.navigate("EventActiveMap", {
        eventId,
        hostId,
        isHostUser,
        navStackDepth: this.state.currentNavStackDepth,
        showInviteeLocation: true,
        withInviteeId: inviteeId,
        key: "map"
      });
    }
  }

  render() {
    const { host, event } = this.props.eventDetail;

    return (
      <Container style={{ backgroundColor: "#ffffff" }}>
        <AppBarComponent
          showBackBtnCircle={true}
          skipCacheBurst={true}
          withNav={this.props.screenProps.rootNav}
        />
        <View style={{ zIndex: 99 }}>
          <View
            style={{
              width: "100%",
              padding: 4,
              backgroundColor: "#ffffff",
              zIndex: 99999
            }}
          >
            <Item
              style={{ justifyContent: "flex-start", borderBottomWidth: 0 }}
            >
              <Left style={{ flex: 0.5 }}>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate("EventActiveUser", {
                      withEvent: this.state.eventData
                    })
                  }
                >
                  {host.profileImgUrl ? (
                    <Image
                      source={{ uri: host.profileImgUrl }}
                      style={{ width: 70, height: 70, borderRadius: 35 }}
                    />
                  ) : (
                    <UserAvatar name={host.name} size={70} />
                  )}
                </TouchableOpacity>
              </Left>
              <Body
                style={{
                  flex: 2,
                  alignItems: "flex-start",
                  alignSelf: "flex-start"
                }}
              >
                <Text
                  style={{
                    textAlign: "left",
                    fontFamily: "Lato",
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#004D9B"
                  }}
                >
                  {event.eventTitle}
                </Text>
                <Text
                  style={{
                    textAlign: "left",
                    fontFamily: "Lato",
                    fontSize: 14,
                    fontWeight: "400",
                    color: "#000000",
                    marginLeft: 2
                  }}
                >
                  {host.name}
                </Text>
              </Body>
            </Item>
          </View>
        </View>
        <View style={{ position: "relative", zIndex: 9999 }}>
          {Platform.OS === "ios" ? (
            <Image
              source={IconsMap.icon_active_attendee_no_circle}
              style={{
                position: "absolute",
                right: 10,
                top: -13,
                zIndex: 999999
              }}
            />
          ) : (
            <Image
              source={{
                uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37.568 21">
                        <defs>
                          <style>
                            .cls-1 {
                              fill: #bce0fd;
                            }
                      
                            .cls-2 {
                              fill: #7fc4fd;
                            }
                      
                            .cls-3 {
                              fill: #2699fb;
                            }
                          </style>
                        </defs>
                        <g id="Group_1301" data-name="Group 1301" transform="translate(-330 -115)">
                          <g id="Group_1027" data-name="Group 1027" transform="translate(346 115)">
                            <path id="Rectangle_31" data-name="Rectangle 31" class="cls-1" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                            <circle id="Ellipse_14" data-name="Ellipse 14" class="cls-1" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                          </g>
                          <g id="Group_1029" data-name="Group 1029" transform="translate(338 115)">
                            <path id="Rectangle_31-2" data-name="Rectangle 31" class="cls-2" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                            <circle id="Ellipse_14-2" data-name="Ellipse 14" class="cls-2" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                          </g>
                          <g id="Group_1030" data-name="Group 1030" transform="translate(330 115)">
                            <path id="Rectangle_31-3" data-name="Rectangle 31" class="cls-3" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                            <circle id="Ellipse_14-3" data-name="Ellipse 14" class="cls-3" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                          </g>
                        </g>
                      </svg>
                      `
              }}
              style={{
                position: "absolute",
                top: -45,
                right: 5,
                width: 70,
                zIndex: 999999
              }}
            />
          )}
        </View>
        <View
          style={{
            width: "90%",
            height: 1,
            backgroundColor: "#BCE0FD",
            zIndex: 9999,
            position: "relative",
            left: 14
          }}
        />

        {event && (
          <Invitees
            navigation={this.props.screenProps.rootNav}
            showUserProfile={this.showUserProfile}
            hostId={host.id}
            showInviteeLocation={this.showInviteeLocation}
            eventId={event.id}
          />
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  },
  fabContainer: {
    height: 50,
    position: "absolute",
    bottom: 0,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    justifyContent: "center",
    flexDirection: "row"
  },
  fabLeftWrapperStyles: {
    position: "absolute",
    bottom: -30,
    left: 20
  },
  fabRightWrapperStyles: {
    position: "absolute",
    bottom: -30,
    right: 20
  },
  fabStyles: {
    width: 60,
    height: 60
  },
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
    eventDetail: state.HoozEvent.event,
    inviteeLocations: state.invitee.locations
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicator(bShow));
    },
    activeMapCoords: coords => {
      dispatch(activeMapCoords(coords));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(EventActiveAttendeesContainer));
