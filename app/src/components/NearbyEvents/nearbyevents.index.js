import React, { Component } from "react";
import {
  StyleSheet,
  AppState,
  TouchableOpacity,
  AsyncStorage,
  Alert,
  View,
  Platform
} from "react-native";
import Image from "react-native-remote-svg";
import MapView, { Marker } from "react-native-maps";
import AppBarComponent from "../AppBar/appbar.index";
import { Footer, Left, Right, Body, Icon, Fab, Spinner } from "native-base";
import OpenAppSettings from "react-native-app-settings";
import { IconsMap } from "assets/assetMap";
import { connect } from "react-redux";
import { getEventList } from "../../actions/events/list";
import { mapStyle } from "./config";
import { changeUserLocation, getUserLocation } from "../../actions/user";

/**
 * Presentational component to display nearby events
 */
const toastStyle = {
  container: {
    backgroundColor: "#2487DB",
    paddingTop: 25,
    paddingRight: 15,
    paddingBottom: 15,
    paddingLeft: 15
  },
  text: {
    color: "#ffffff",
    fontWeight: "bold"
  }
};

const markerMap = {
  going: IconsMap.icon_marker_accepted,
  maybe: IconsMap.icon_marker_invited,
  active: IconsMap.icon_marker_active
};

class NearbyEventsComponent extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      defaultMapRegion: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      userDraggedRegion: null,
      isMapDraggedCounter: 0,
      GPSLocationPointer: { color: "#cccccc" },
      userGPSLocation: null,
      isLocationDisabled: false,
      isLocationUnavailable: false,
      appState: AppState.currentState,
      eventList: [],
      eventListArrived: false,
      eventListFetchMode: "map",
      animating: false
    };
    this.mount = true;
  }

  componentWillMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
    this.getUserLocation();
  }

  componentDidMount() {
    this.getUserLocation();
  }

  handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
      //this.getUserLocation();
    }
    this.setState({ appState: nextAppState });
  };

  getUserLocation() {
    navigator.geolocation.setRNConfiguration({ skipPermissionRequests: false });
    navigator.geolocation.getCurrentPosition(
      position => {
        AsyncStorage.setItem(
          "userLocation",
          JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        );

        AsyncStorage.getItem("userId", (err, result) => {
          if (err) {
            console.error(err.message);
          }

          if (result) {
            const { uid } = JSON.parse(result);
            this.props.changeUserLocation(uid, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          }
        });

        this.setState({
          userGPSLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          },
          userDraggedRegion: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          },
          GPSLocationPointer: { color: "#2699FB" }
        });
      },
      error => {
        console.log(error);
        AsyncStorage.getItem("userId", (err, result) => {
          if (err) {
            console.error(err.message);
          }

          if (result) {
            const { uid } = JSON.parse(result);
            this.props.getUserLocation(uid);
          }
        });
        if (error.code == 1) {
          this.setState({
            isLocationDisabled: true,
            userGPSLocation: this.state.defaultMapRegion,
            userDraggedRegion: this.state.defaultMapRegion
          });
          Alert.alert(
            "GPS Disabled!",
            "The app needs GPS in order to give the best experience. Please turn it back on",
            [
              {
                text: "No, I dont want to",
                onPress: () => {},
                style: "cancel"
              },
              { text: "Enable", onPress: () => this.handleNoLocation() }
            ],
            { cancelable: false }
          );
        } else if (error.code == 2) {
          this.setState({
            isLocationUnavailable: true,
            userGPSLocation: this.state.defaultMapRegion,
            userDraggedRegion: this.state.defaultMapRegion
          });
          Alert.alert(
            "Location unavailable!",
            "We could not detect your location. Map location has been switched to San Francisco, CA (Default). Do you want to retry again?",
            [{ text: "Yes, please", onPress: () => this.getUserLocation() }],
            { cancelable: false }
          );
        } else {
          this.setState({
            isLocationUnavailable: true,
            userGPSLocation: this.state.defaultMapRegion,
            userDraggedRegion: this.state.defaultMapRegion
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
      }
    );
  }

  onAddEvent() {
    this.props.navigation.navigate({
      routeName: "AddEvent",
      key: "AddEvent",
      params: {
        account: this.props.navigation.getParam("account")
      }
    });
  }

  onMenuPressed() {
    const { navigate } = this.props.navigation;
    navigate("Menu");
  }

  showSystemSettings() {
    OpenAppSettings.open();
  }

  handleNoLocation() {
    OpenAppSettings.open();
  }

  /**
   * @description capture all events information from Appbar child component
   * @param {*} data
   */
  captureEventList(data) {
    //console.log("[NearByEvents] Events List Captured From AppBar", data);
    this.setState({
      eventListArrived: true,
      eventList: data,
      animating: false,
      GPSLocationPointer: { color: "#2699FB" }
    });
    return;
  }

  navigateToEvent(eventData) {
    const { isHostEvent, isActive, keyNode, hostId } = eventData;

    if (isHostEvent && !isActive) {
      this.props.navigation.navigate({
        routeName: "EventOverview",
        key: "EventOverview",
        params: {
          eventId: keyNode
        }
      });
    } else if (isActive) {
      this.props.navigation.navigate({
        routeName: "TabScreen",
        key: "TabScreen",
        params: {
          eventId: keyNode,
          hostId: hostId,
          isHostUser: isHostEvent,
          withEvent: eventData
        }
      });
    } else if (!isHostEvent && !isActive) {
      this.props.navigation.navigate({
        routeName: "EventDetail",
        key: "EventDetail",
        params: { eventId: keyNode, hostId: hostId }
      });
    }
  }

  handleMapDragEvents() {
    if (this.state.isMapDraggedCounter > 0) {
      this.state.GPSLocationPointer.color != "#CCCCCC"
        ? this.setState({
            GPSLocationPointer: { color: "#CCCCCC" },
            userDraggedRegion: null
          })
        : "";
    }
    this.setState({ isMapDraggedCounter: this.state.isMapDraggedCounter + 1 });
  }

  render() {
    let { events } = this.props;

    return (
      <React.Fragment>
        <AppBarComponent
          isRibbonVisible={true}
          fetchEventListFor={this.state.eventListFetchMode}
          eventList={this.captureEventList.bind(this)}
        />
        {this.state.userGPSLocation ? (
          <MapView
            style={styles.map}
            initialRegion={this.state.userGPSLocation}
            region={this.state.userDraggedRegion}
            onRegionChangeComplete={() => this.handleMapDragEvents()}
            customMapStyle={mapStyle}
            showsCompass={true}
            showsUserLocation={true}
            loadingEnabled={true}
            loadingBackgroundColor="#F0F2EF"
          >
            {events.length > 0 &&
              events.map((event, key) => (
                <Marker
                  coordinate={{
                    latitude: event.evtCoords
                      ? event.evtCoords.lat
                      : this.state.defaultMapRegion.latitude,
                    longitude: event.evtCoords
                      ? event.evtCoords.lng
                      : this.state.defaultMapRegion.longitude
                  }}
                  title={event.eventTitle}
                  description={event.hostName}
                  key={key}
                  onPress={() => this.navigateToEvent(event)}
                >
                  {(event.eventResponse == "going" ||
                    event.eventResponse == "host") &&
                  !event.isActive ? (
                    <Image source={markerMap.going} />
                  ) : (event.eventResponse == "going" ||
                      event.eventResponse == "host") &&
                    event.isActive ? (
                    <Image source={markerMap.active} />
                  ) : (
                    <Image source={markerMap.maybe} />
                  )}
                </Marker>
              ))}
          </MapView>
        ) : null}
        <Fab
          style={{
            position: "absolute",
            top: -450,
            right: 5,
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#ffffff"
          }}
          onPress={() => this.getUserLocation()}
        >
          <Icon
            type="MaterialIcons"
            name="room"
            style={this.state.GPSLocationPointer}
          />
        </Fab>
        {Platform.OS === "ios" ? (
          <Footer style={styles.fabContainer_ios}>
            <Left>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate({
                    routeName: "EventList",
                    key: "EventList"
                  })
                }
              >
                {Platform.OS === "ios" ? (
                  <Image
                    source={IconsMap.icon_list_circle}
                    style={styles.fabStyles}
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
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Left>
            <Body>
              <TouchableOpacity
                style={styles.fabWrapperStyles}
                onPress={() => this.onAddEvent()}
              >
                {Platform.OS === "ios" ? (
                  <Image
                    source={IconsMap.icon_add_circle}
                    style={styles.fabStyles}
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
                      font-size: 40px;
                      font-family: ArialRoundedMTBold, Arial Rounded MT Bold;
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
                <g id="Group_978" data-name="Group 978" transform="translate(-165 -615)">
                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 165, 615)">
                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                  </g>
                  <text id="_" data-name="+" class="cls-2" transform="translate(184 654)"><tspan x="0" y="0">+</tspan></text>
                </g>
              </svg>`
                    }}
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Body>
            <Right />
          </Footer>
        ) : (
          <View style={styles.fabContainer_android}>
            <Left>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate({
                    routeName: "EventList",
                    key: "EventList"
                  })
                }
              >
                {Platform.OS === "ios" ? (
                  <Image
                    source={IconsMap.icon_list_circle}
                    style={styles.fabStyles}
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
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Left>
            <Body style={{ position: "relative", top: -30 }}>
              <TouchableOpacity
                style={styles.fabWrapperStyles}
                onPress={() => this.onAddEvent()}
              >
                {Platform.OS === "ios" ? (
                  <Image
                    source={IconsMap.icon_add_circle}
                    style={styles.fabStyles}
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
                    font-size: 40px;
                    font-family: ArialRoundedMTBold, Arial Rounded MT Bold;
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
              <g id="Group_978" data-name="Group 978" transform="translate(-165 -615)">
                <g class="cls-3" transform="matrix(1, 0, 0, 1, 165, 615)">
                  <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                </g>
                <text id="_" data-name="+" class="cls-2" transform="translate(184 654)"><tspan x="0" y="0">+</tspan></text>
              </g>
            </svg>`
                    }}
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Body>
            <Right />
          </View>
        )}
        {this.state.animating && (
          <View style={styles.overlay}>
            <Spinner color={"lightgoldenrodyellow"} style={styles.spinner} />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    events: state.eventList.events
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getEventList: userId => {
      dispatch(getEventList(userId));
    },
    changeUserLocation: (userId, location) => {
      dispatch(changeUserLocation(userId, location));
    },
    getUserLocation: userId => {
      dispatch(getUserLocation(userId));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NearbyEventsComponent);

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  },
  fabContainer_ios: {
    height: 50,
    paddingLeft: 20,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    position: "absolute",
    bottom: 0
  },
  fabContainer_android: {
    width: "100%",
    height: 70,
    paddingLeft: 20,
    backgroundColor: "transparent",
    borderTopColor: "transparent",
    borderTopWidth: 0,
    position: "absolute",
    bottom: -10,
    justifyContent: "center",
    flexDirection: "row",
    borderTopWidth: 0
  },
  fabWrapperStyles: {
    position: "absolute",
    left: 20
  },
  fabStyles: {
    width: 60,
    height: 60
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)"
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
