/* Core React modules */
import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Platform
} from "react-native";

/* Third-party non UI modules */
import Image from "react-native-remote-svg";
import MapView, { Marker } from "react-native-maps";
import { connect } from "react-redux";

/* Third-party UI modules */
import { Container, Body, Icon, Item, Left, List, ListItem } from "native-base";

/* Custom reusable component / modules */
import AppBarComponent from "../../../components/AppBar/appbar.index";

/* API services */
import { EventServiceAPI, UserManagementServiceAPI } from "../../../api";

/* Icons map */
import { IconsMap } from "assets/assetMap";
import ActiveMapHeader from "../../../components/ActiveMapHeader/ActiveMapHeader";
import ActiveMapFooter from "../../../components/ActiveMapFooter/ActiveMapFooter";

let hostUserLocationWatcher;
let attendeeLocationWatcher;
const inviteeStatusMarker = {
  going: "rgba(110, 178, 90, 0.55)",
  invited: "rgba(239, 154, 18, 0.55)",
  declined: "rgba(255, 0, 59, 0.55)"
};
const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#ebe3cd"
      }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#523735"
      }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f1e6"
      }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#c9b2a6"
      }
    ]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#dcd2be"
      }
    ]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ae9e90"
      }
    ]
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#93817c"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#a5b076"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#447530"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f1e6"
      }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#fdfcf8"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#f8c967"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#e9bc62"
      }
    ]
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#e98d58"
      }
    ]
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#db8555"
      }
    ]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#806b63"
      }
    ]
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae"
      }
    ]
  },
  {
    featureType: "transit.line",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8f7d77"
      }
    ]
  },
  {
    featureType: "transit.line",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#ebe3cd"
      }
    ]
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#dfd2ae"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#b9d3c2"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#92998d"
      }
    ]
  }
];

/* Redux container component to present a detailed view of the created event */
class EventActiveMapContainer extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null,
    tabBarOnPress: ({ jumpToIndex, scene }) => {
      const { params = {} } = navigation.state;
      params.resetMap();
      jumpToIndex(scene.index);
    }
  });
  constructor() {
    super();
    this.state = {
      eventAndHostData: {},
      hostUserLocation: null,
      inviteeLocation: null,
      filteredInvitedList: [],
      unfilteredInviteeList: [],
      prevTextElemRef: null,
      prevBarElemRef: null,
      prevBarElemColor: null,
      hostId: "",
      singleUserOnly: false,
      isAttendeeViewActive: false,
      isHostUserCameragalleryActive: false,
      defaultOrEventLocation: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      eventPhotos: null,
      eventPhotosStash: null,
      userDraggedRegion: null,
      animating: true,
      isCameraActive: false,
      selectedImgUrl: "",
      eventImagePinCounter: 0,
      selectedImageIndex: 0,
      isGalleryAtEnd: false,
      isGalleryAtStart: true,
      chats: [],
      chatCounter: 0
    };
  }
  async componentDidMount() {
    const {
      eventId,
      hostId,
      isHostUser,
      showInviteeLocation,
      withInviteeId
    } = this.props.screenProps.rootNav.state.params;

    this.props.navigation.setParams({
      resetMap: this.repositionMapToEventLocation.bind(this)
    });

    this.props.navigation.addListener("didFocus", () => {
      this.repositionMapToEventLocation();
    });

    // 29.10.2018 - reapplied this from the code
    if (
      eventId &&
      hostId &&
      typeof isHostUser !== "undefined" &&
      showInviteeLocation &&
      withInviteeId
    ) {
      await this.getEventAndHostDetails(eventId, hostId, isHostUser, true);
      //await this.watchForIncomingChats(hostId, eventId, isHostUser);
      await this.showInviteeLocation(withInviteeId);
      return;
    } else if (
      eventId &&
      hostId &&
      typeof isHostUser !== "undefined" &&
      !showInviteeLocation &&
      !withInviteeId
    ) {
      await this.getEventAndHostDetails(eventId, hostId, isHostUser, false);
      //await this.watchForIncomingChats(hostId, eventId, isHostUser);
      return;
    }
  }

  componentWillUnmount() {
    clearInterval(hostUserLocationWatcher);
    clearInterval(attendeeLocationWatcher);
    hostUserLocationWatcher = null;
    attendeeLocationWatcher = null;
  }

  componentDidUpdate(prevProps, prevState) {
    let prevPropsParams = prevProps.navigation.state.params;
    let currentPropsParams = this.props.navigation.state.params;

    if (
      prevPropsParams != currentPropsParams &&
      currentPropsParams.showInviteeLocation
    ) {
      this.showInviteeLocation(currentPropsParams.withInviteeId);
    }
  }

  /**
   * @description get a particular event information along with host user
   * @param {string} eventId
   * @param {string} hostUserId
   * @param {boolean} scopeToinviteeOnly
   */
  async getEventAndHostDetails(
    eventId,
    hostUserId,
    isHostUser,
    scopeToinviteeOnly
  ) {
    const eventSvc = new EventServiceAPI();
    const userSvc = new UserManagementServiceAPI();

    /**
     * NOTE - Chat counter got reset when we come from Event list. so uncommenting
     */
    //this.resetUnreadMsgCount(hostUserId, eventId, isHostUser);
    Promise.all([
      eventSvc.getEventDetailsAPI2(eventId, hostUserId),
      eventSvc.getUserDetailsAPI2(hostUserId),
      eventSvc.getEventInviteesDetailsAPI2(eventId, hostUserId),
      userSvc.getUsersFriendListAPI(this.props.user.socialUID)
    ]).then(eventAndHostResult => {
      const currentUsrFrnds = eventAndHostResult[3].filter(friend => {
        if (friend.eventList) {
          return (
            friend.eventList.filter(event => {
              if (event.eventId == eventId) {
                friend["status"] = "maybe";
                return true;
              }
            }).length > 0
          );
        } else if (friend.event) {
          if (Object.keys(friend.event).includes(eventId)) {
            friend["status"] = "going";
            return true;
          }
        }
      });

      const eventAndHostData = {
        eventId: eventId,
        hostId: hostUserId,
        hostName: eventAndHostResult[1].name,
        isHostUser: isHostUser || false,
        hostProfileImgUrl: eventAndHostResult[1].profileImgUrl || "",
        eventTitle: eventAndHostResult[0].eventTitle,
        invitee: eventAndHostResult[2]
      };
      const pinCounter =
        eventAndHostResult[0].photos &&
        eventAndHostResult[0].photos.filter(item => item.pinned).length;

      //// CHANGED ON: 23rd October, 2018
      if (!scopeToinviteeOnly) {
        this.setState({
          animating: false,
          eventAndHostData: eventAndHostData,
          eventPhotos: eventAndHostResult[0].photos || [],
          eventImagePinCounter: pinCounter,
          eventPhotosStash: eventAndHostResult[0].photos || [],
          unfilteredInviteeList: eventAndHostData.invitee,
          filteredInvitedList: eventAndHostData.invitee,
          currentUserFriends: currentUsrFrnds,
          defaultOrEventLocation: {
            latitude: eventAndHostResult[0].evtCoords
              ? eventAndHostResult[0].evtCoords.lat
              : this.state.defaultOrEventLocation.latitude,
            longitude: eventAndHostResult[0].evtCoords
              ? eventAndHostResult[0].evtCoords.lng
              : this.state.defaultOrEventLocation.longitude,
            latitudeDelta: this.state.defaultOrEventLocation.latitudeDelta,
            longitudeDelta: this.state.defaultOrEventLocation.longitudeDelta
          },
          userDraggedRegion: {
            latitude: eventAndHostResult[0].evtCoords
              ? eventAndHostResult[0].evtCoords.lat
              : this.state.defaultOrEventLocation.latitude,
            longitude: eventAndHostResult[0].evtCoords
              ? eventAndHostResult[0].evtCoords.lng
              : this.state.defaultOrEventLocation.longitude,
            latitudeDelta: this.state.defaultOrEventLocation.latitudeDelta,
            longitudeDelta: this.state.defaultOrEventLocation.longitudeDelta
          }
        });

        hostUserLocationWatcher = setInterval(
          () => this.watchHostUserLocation(userSvc, hostUserId),
          10000
        );
        attendeeLocationWatcher = setInterval(
          () => this.watchInviteeLocation(userSvc, eventId, hostUserId),
          10000
        );
      } else {
        this.setState({
          animating: false,
          eventAndHostData: eventAndHostData,
          eventPhotos: eventAndHostResult[0].photos || [],
          eventImagePinCounter: pinCounter,
          eventPhotosStash: eventAndHostResult[0].photos || [],
          unfilteredInviteeList: eventAndHostData.invitee,
          filteredInvitedList: eventAndHostData.invitee,
          currentUserFriends: currentUsrFrnds
        });
      }
    });
  }

  /**
   * @description watch host user location
   * @param {Object} userSvc
   * @param {string} hostUserId
   */
  watchHostUserLocation(userSvc, hostUserId) {
    userSvc
      .getUserDetailsByMultipleFieldsAPI(hostUserId, ["userLocation"])
      .then(userData => {
        if (userData) {
          this.setState({ hostUserLocation: userData.userLocation || null });
        }
      });
  }

  /**
   * @description watch invited users' location
   * @param {Object} userSvc
   */
  watchInviteeLocation(userSvc) {
    Promise.all(
      this.state.eventAndHostData.invitee.map(async invitee => {
        return userSvc
          .getUserDetailsByMultipleFieldsAPI(invitee.inviteeId, [
            "userLocation",
            "profileImgUrl"
          ])
          .then(userData => {
            if (userData) {
              return {
                userLocation: userData.userLocation,
                userProfileImg: userData.profileImgUrl || ""
              };
            }
          });
      })
    ).then(inviteeData => {
      inviteeMapData = inviteeData.filter(invitee =>
        invitee.userLocation
          ? invitee.userLocation.lat && invitee.userLocation.lat
          : false
      );
      this.setState({ inviteeLocation: inviteeMapData || null });
    });
  }

  feedbackToUser() {
    Alert.alert("Oops!!", "You cannot set more than 5 images to an event!", [
      { text: "OK", style: "default" }
    ]);
  }

  handleMapDragEvents() {
    this.setState({ userDraggedRegion: null });
  }

  repositionMapToEventLocation() {
    this.setState({
      userDraggedRegion: {
        latitude: this.state.defaultOrEventLocation.latitude,
        longitude: this.state.defaultOrEventLocation.longitude,
        latitudeDelta: this.state.defaultOrEventLocation.latitudeDelta,
        longitudeDelta: this.state.defaultOrEventLocation.longitudeDelta
      }
    });
  }

  toggleActiveAttendeeView() {
    this.setState({ isAttendeeViewActive: !this.state.isAttendeeViewActive });
    setTimeout(
      () =>
        this.filterEventInviteesByRSVP(
          "all",
          this.refs.textForStatusAll,
          this.refs.activeBarForStatusAll,
          "hsla(207, 97%, 75%, 1)"
        ),
      1
    );
  }

  showUserProfile(userId, eventId, hostId) {
    this.props.navigation.navigate({
      routeName: "EventActiveUser",
      key: "EventActiveUser",
      params: { hostId: userId, eventId: eventId, eventHostId: hostId }
    });
  }

  loadImagesStart() {
    this.setState({ animating: true });
  }

  loadImagesComplete() {
    this.setState({ animating: false });
  }

  async showInviteeLocation(inviteeId) {
    console.log("++ Hello universe! ++");
    const userSvc = new UserManagementServiceAPI();

    const userData = await userSvc.getUserDetailsAPI(inviteeId);
    if (userData && userData.userLocation) {
      this.setState({
        inviteeLocation: [
          {
            userLocation: userData.userLocation,
            userProfileImg: userData.profileImgUrl
          }
        ],
        userDraggedRegion: {
          latitude: userData.userLocation.lat,
          longitude: userData.userLocation.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        },
        isAttendeeViewActive: false
      });
    }
  }

  render() {
    return (
      <Container style={{ backgroundColor: "#ffffff" }}>
        <AppBarComponent
          showBackBtnCircle={true}
          skipCacheBurst={true}
          currentScreen="activeMap"
          withNav={this.props.screenProps.rootNav}
        />
        <View style={{ zIndex: 99 }}>
          {this.props.navigation.state.routeName === "EventActiveMap" ? (
            <Item
              style={{
                width: "100%",
                height: 30,
                backgroundColor: "#FC3764",
                marginLeft: 0,
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 14,
                paddingRight: 14,
                zIndex: 99999,
                justifyContent: "flex-start",
                flexWrap: "nowrap",
                display: "flex"
              }}
            >
              <Icon
                type="FontAwesome"
                name="exclamation"
                style={{ color: "#ffffff" }}
              />
              <Body>
                <Text
                  style={{
                    color: "#ffffff",
                    textAlign: "center",
                    fontFamily: "Lato",
                    fontSize: 11
                  }}
                >
                  This event is Active. Your location is shared with the group
                </Text>
              </Body>
            </Item>
          ) : null}

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
                      withUser: this.state.eventAndHostData.hostId
                    })
                  }
                >
                  {this.state.eventAndHostData &&
                  this.state.eventAndHostData.hostProfileImgUrl ? (
                    <Image
                      source={{
                        uri: this.state.eventAndHostData.hostProfileImgUrl
                      }}
                      style={{ width: 70, height: 70, borderRadius: 35 }}
                    />
                  ) : (
                    <Image
                      source={IconsMap.icon_contact_avatar}
                      style={{ width: 70, height: 70, borderRadius: 35 }}
                    />
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
                  {this.state.eventAndHostData.eventTitle}
                </Text>
                <Text
                  style={{
                    textAlign: "left",
                    fontFamily: "Lato",
                    fontSize: 14,
                    fontWeight: "400",
                    color: "#000000"
                  }}
                >
                  {this.state.eventAndHostData.hostName}
                </Text>
              </Body>
            </Item>

            {this.props.navigation.state.routeName === "EventActiveMap" ? (
              <Item style={{ borderBottomWidth: 0 }}>
                {this.state.eventAndHostData &&
                this.state.eventAndHostData.invitee ? (
                  <List
                    dataArray={this.state.eventAndHostData.invitee}
                    horizontal={true}
                    renderRow={item => (
                      <ListItem
                        style={{
                          paddingRight: 0,
                          paddingLeft: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          marginLeft: 5,
                          borderBottomWidth: 0
                        }}
                      >
                        {item.profileImgUrl ? (
                          <Image
                            source={{ uri: item.profileImgUrl }}
                            style={{ width: 48, height: 48, borderRadius: 24 }}
                          />
                        ) : (
                          <Image
                            source={IconsMap.icon_contact_avatar}
                            style={{ width: 48, height: 48, borderRadius: 24 }}
                          />
                        )}
                      </ListItem>
                    )}
                  />
                ) : null}
              </Item>
            ) : null}
          </View>
        </View>
        <MapView
          style={styles.map}
          initialRegion={this.state.defaultOrEventLocation}
          region={this.state.userDraggedRegion}
          onRegionChangeComplete={() => this.handleMapDragEvents()}
          customMapStyle={mapStyle}
          loadingEnabled={true}
        >
          {!this.state.singleUserOnly ? (
            <Marker
              coordinate={{
                latitude: this.state.defaultOrEventLocation.latitude,
                longitude: this.state.defaultOrEventLocation.longitude
              }}
            >
              {Platform.OS === "ios" ? (
                <Image
                  source={IconsMap.icon_event_location}
                  style={{ width: 30, height: 35 }}
                />
              ) : (
                <Image
                  source={IconsMap.icon_location_marker_png}
                  style={{ width: 30, height: 35 }}
                />
              )}
            </Marker>
          ) : null}
          {this.state.inviteeLocation && this.state.inviteeLocation.length
            ? this.state.inviteeLocation.map((invitee, key) => (
                <Marker
                  coordinate={{
                    latitude: invitee.userLocation.lat,
                    longitude: invitee.userLocation.lng
                  }}
                  key={key}
                >
                  {invitee.userProfileImg ? (
                    <Image
                      source={{ uri: invitee.userProfileImg }}
                      style={{ width: 47, height: 47, borderRadius: 47 / 2 }}
                    />
                  ) : (
                    <Image
                      source={IconsMap.icon_contact_avatar}
                      style={{ width: 47, height: 47, borderRadius: 47 / 2 }}
                    />
                  )}
                </Marker>
              ))
            : null}
          {this.state.hostUserLocation && this.state.hostUserLocation.lat ? (
            <Marker
              coordinate={{
                latitude: this.state.hostUserLocation.lat,
                longitude: this.state.hostUserLocation.lng
              }}
            >
              {this.state.eventAndHostData.hostProfileImgUrl ? (
                <Image
                  source={{
                    uri: this.state.eventAndHostData.hostProfileImgUrl
                  }}
                  style={{
                    width: 47,
                    height: 47,
                    borderRadius: 47 / 2,
                    borderWidth: 1,
                    borderColor: "red"
                  }}
                />
              ) : (
                <Image
                  source={IconsMap.icon_contact_avatar}
                  style={{
                    width: 47,
                    height: 47,
                    borderRadius: 47 / 2,
                    borderWidth: 1,
                    borderColor: "red"
                  }}
                />
              )}
            </Marker>
          ) : null}
        </MapView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
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
    indicatorShow: state.auth.indicatorShow
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
)(EventActiveMapContainer);
