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
import NearByEventsSvg from "../../svgs/NearbyEvents";

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
    this.setState({ userDraggedRegion: null });

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
                    source={{ uri: NearByEventsSvg.Search_Field }}
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
                    source={{ uri: NearByEventsSvg.Group_978 }}
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
                    source={{ uri: NearByEventsSvg.ios_Search_Field }}
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
                    source={{ uri: NearByEventsSvg.ios_Group_978 }}
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
