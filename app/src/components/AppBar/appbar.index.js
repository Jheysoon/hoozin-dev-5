import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Text,
  TouchableOpacity,
  AsyncStorage,
  AppState,
  Platform
} from "react-native";
import GeoFire from "geofire";
import Image from "react-native-remote-svg";
import { withNavigation } from "react-navigation";
import { Header, Left, Right, Icon, Body, Button } from "native-base";
import BackgroundGeolocation from "react-native-mauron85-background-geolocation";

import AppBar from "../../svgs/AppBar";
import AppBarFilter from "./AppBarFilter";
import { AppBarStyles } from "./appbar.style";
import { changeUserLocation } from "../../actions/user";
import { getEventList } from "../../actions/events/list";
import OfflineNotice from "../../components/OfflineNotice";
import { IconsMap, ImageMap } from "../../../assets/assetMap";
import NotificationService from "../../utils/notification.service";
import { UserManagementServiceAPI, EventServiceAPI } from "../../api";
import { extractHostAndInvitedEventsInfo } from "../../utils/eventListFilter";

/**
 * Component to hold the app bar (top navigation plus tab filter bar)
 */
class AppBarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      hasNoEvent: true,
      eventList: [],
      eventListFiltered: [],
      hostAndInvitedEventList: [],
      isEventListModified: false,
      prevTextElemRef: null,
      prevBarElemRef: null,
      prevBarElemColor: null,
      userId: null,
      currentFilterType: "all",
      existingInvitedEvents: [],
      first: true,
      filter: "all"
    };

    this.handleEventStatusFilter = this.handleEventStatusFilter.bind(this);
  }
  static navigationOptions = {
    header: null
  };

  componentDidMount() {
    AppState.addEventListener("change", nextAppState => {});
    // ------------------------------------Background Tracker------------------------------------
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
      url: "http://192.168.81.15:3000/location",
      notificationsEnabled: false,
      startForeground: false,
      httpHeaders: {
        "X-FOO": "bar"
      },
      // customize post properties
      postTemplate: {
        lat: "@latitude",
        lon: "@longitude",
        foo: "bar" // you can also add your own properties
      }
    });

    BackgroundGeolocation.on("location", location => {
      /* console.log("+------------------------------+");
      console.log("|                              |");
      console.log("|                              |");
      console.log("|      Location Changed        |");
      console.log("|                              |");
      console.log("|                              |");
      console.log("+------------------------------+"); */
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      BackgroundGeolocation.startTask(taskKey => {
        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on("authorization", status => {
      console.log(
        "[INFO] BackgroundGeolocation authorization status: " + status
      );
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(
          () =>
            Alert.alert(
              "App requires location tracking permission",
              "Would you like to open app settings?",
              [
                {
                  text: "Yes",
                  onPress: () => BackgroundGeolocation.showAppSettings()
                },
                {
                  text: "No",
                  onPress: () => console.log("No Pressed"),
                  style: "cancel"
                }
              ]
            ),
          1000
        );
      }
    });

    BackgroundGeolocation.on("background", () => {
      console.log("[INFO] App is in background");

      // add a workaround for now...
      // @TODO research for the plugin to not run first the background
      if (!this.state.first) {
        navigator.geolocation.setRNConfiguration({
          skipPermissionRequests: true
        });

        navigator.geolocation.watchPosition(data => {
          AsyncStorage.getItem("userId").then(userIdString => {
            const { uid: userId } = JSON.parse(userIdString);

            this.props.changeLocation(userId, data.coords);
          });
        });
      } else {
        this.setState({
          first: false
        });
      }
    });

    BackgroundGeolocation.on("foreground", () => {
      console.log("[INFO] App is in foreground");
      /* navigator.geolocation.watchPosition((data) => {
        AsyncStorage.getItem("userId").then(userIdString => {
          const { uid: userId } = JSON.parse(userIdString);

          this.props.changeLocation(userId, data.coords);
        });
      }); */
      //console.log(navigator.geolocation);
    });

    BackgroundGeolocation.checkStatus(status => {
      console.log(
        "[INFO] BackgroundGeolocation service is running",
        status.isRunning
      );
      console.log(
        "[INFO] BackgroundGeolocation services enabled",
        status.locationServicesEnabled
      );
      console.log(
        "[INFO] BackgroundGeolocation auth status: " + status.authorization
      );

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
    // ------------------------------------Background Tracker------------------------------------

    if (this.props.isRibbonVisible) {
      const userSvc = new UserManagementServiceAPI();
      const eventSvc = new EventServiceAPI();
      AppState.addEventListener("change", this.handleAppStateChange);

      AsyncStorage.getItem("userId").then(userIdString => {
        const { uid: userId } = JSON.parse(userIdString);

        // initiate watcher
        userSvc
          .watchForUserDataByFieldAPI(userId, "eventList")
          .limitToLast(1)
          .on("child_added", snapshotAdded => {
            if (snapshotAdded._value) {
              const { hostId, eventId } = snapshotAdded._value;
              const { routeName } = this.props.navigation.state;
              eventSvc
                .watchForEventDataByAPI(hostId, eventId)
                .on("child_changed", snapshotChange => {
                  if (
                    snapshotChange._value &&
                    (routeName == "EventList" || routeName == "NearbyEvents")
                  ) {
                    console.log("++ SUCCESS!! ++");
                    this.props.getEventList(userId);
                  }
                });
            } else {
              console.log("++ child added else ++");
            }
          });

        // initiate onmount handler
        //this.getHostAndInvitedEventsInfo(userId);

        this.props.getEventList(userId);

        // get device token
        this.watchFCMDeviceToken(userId);
        this.listenForFCMMessages();
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.invalidateCache != this.props.invalidateCache) {
      //this.getHostAndInvitedEventsInfo(this.state.userId);
      //this.props.eventList(userId, this.state.eventListFiltered);
    }

    /* if (this.state.eventList.length) {
      this.props.fetchEventListFor == "list"
        ? this.props.eventListForAttendee(
            this.state.eventListFiltered,
            this.state.currentFilterType
          )
        : this.props.eventList(
            this.state.eventListFiltered,
            this.state.currentFilterType
          );
      this.setState({ eventList: [] });
      return;
    } */
  }

  handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
    }
    this.setState({ appState: nextAppState });
  };

  watchFCMDeviceToken(userId) {
    const notifySvc = new NotificationService();
    notifySvc.retrieveDeviceToken(userId);
    notifySvc.monitorDeviceTokenRefresh(userId);
  }

  listenForFCMMessages() {
    const notifySvc = new NotificationService();

    notifySvc.listenForDataMsgs().then(message => {
      const { event_id, host_id, type } = message;
    });
    notifySvc.listenForNotification();
    notifySvc.listenForNotificationDisplayed();
    notifySvc.listenForNotificationDidOpen().then(notification => {
      let { event_id, host_id } = notification._data;
      if (this.state.userId != host_id) {
        this.props.navigation.navigate({
          routeName: "EventDetail",
          key: "EventDetail",
          params: {
            eventId: event_id,
            hostId: host_id
          }
        });
      }
    });

    notifySvc.listenForBackgroundNotification().then(notification => {
      if (this.state.userId) {
        this.props.navigation.navigate({
          routeName: "EventList",
          key: "EventList"
        });
      }
    });
  }

  /**
   * @description get all kinds of event information - Host and Invited for an user
   */
  async getHostAndInvitedEventsInfo(userId) {
    const hostAndInvitedEventList = await extractHostAndInvitedEventsInfo(
      userId
    );

    if (hostAndInvitedEventList && hostAndInvitedEventList.length) {
      hostAndInvitedEvents = hostAndInvitedEventList;
      const existingInvitedEvents = hostAndInvitedEventList.map(
        item => item.keyNode
      );
      //console.log(existingInvitedEvents);

      // IMPORTANT - set the userId in the state. else history wont work.
      this.setState({
        hostAndInvitedEventList: hostAndInvitedEventList,
        existingInvitedEvents: existingInvitedEvents,
        hasNoEvent: false,
        userId
      });
    } else {
      this.setState({ userId });
    }
  }

  /**
   * @description toggle navigation drawer
   * @param {boolean} state
   */
  toggleDrawer(state) {
    if (!state && this.props.withNav) {
      this.props.withNav.navigate({
        routeName: "Menu",
        key: "Menu",
        params: {
          isOpened: true
        }
      });
      return;
    } else if (!state && !this.props.withNav) {
      this.props.navigation.navigate({
        routeName: "Menu",
        key: "Menu",
        params: {
          isOpened: true
        }
      });
      return;
    } else if (state && this.props.withNav) {
      this.props.withNav.goBack();
      return;
    } else if (state && !this.props.withNav) {
      this.props.navigation.goBack();
      return;
    }
  }

  /**
   * @description call the provided function and then navugates back
   */
  handleBackNavigation() {
    /** +++ ADDED ON 05.11.2018 by SOMNATH for the issue of back button not working after implementing
     * the tab bar by Kinjal and her team
     **/
    if (
      this.props.currentScreen == "activeMap" &&
      this.props.skipCacheBurst &&
      this.props.withNav
    ) {
      return this.props.withNav.navigate("EventList");
    } else if (
      this.props.currentScreen != "activeMap" &&
      this.props.skipCacheBurst
    ) {
      return this.props.navigation.goBack();
    } else if (
      this.props.currentScreen == "activeChat" &&
      this.props.reloadHostFunc
    ) {
      this.props.reloadHostFunc.call(this);
      this.props.navigation.goBack();
      return;
    }
    this.getHostAndInvitedEventsInfo().then(() => {
      this.props.reloadHostFunc ? this.props.reloadHostFunc.call(this) : "";
      this.props.navigation.goBack();
      // if (this.props.currentContext == 'gallery') {
      //     this.props.reloadHostFunc.call(this);
      //     return;
      // }
      // else if (this.props.currentContext == 'map') {
      //     this.props.navigation.goBack();
      //     return;
      // }
      // else {
      //     this.props.reloadHostFunc.call(this);
      //     this.props.navigation.goBack();
      //     return;
      // }
    });
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
   * @description determines whether the invitee to an active event is nearby to the event
   * @param {Array<any>} eventList
   */
  async whetherAteendeeNearby(eventList) {
    const userSvc = new UserManagementServiceAPI();
    const eventSvc = new EventServiceAPI();

    const userLocation = await userSvc.getUserDetailsByFieldAPI(
      this.state.userId,
      "userLocation"
    );
    console.log("++ user location data ++", userLocation);
    if (userLocation) {
      eventList
        .filter(item => item.isActive && !item.isHostEvent)
        .forEach(item => {
          const isAttendeeNearby = this.determineLocationDifference(
            [Number(userLocation.lat), Number(userLocation.lng)],
            [item.evtCoords.lat, item.evtCoords.lng]
          );

          if (isAttendeeNearby) {
            eventSvc.updateInviteeAPI(
              item.hostId,
              this.state.userId,
              item.keyNode,
              { withinOneMile: true }
            );
          }
        });
    }
  }

  /**
   * @description determine difference in location between each participant (Host or Attendee) and event location
   * @param {Array<number>} userLocation
   * @param {Array<number>} eventLocation
   */
  determineLocationDifference(userLocation, eventLocation) {
    const locationDiffInMile =
      GeoFire.distance(userLocation, eventLocation) * 0.621;
    console.log(
      "[EventActiveMap] user and event location difference",
      locationDiffInMile
    );
    return locationDiffInMile > 0 <= 1;
  }

  /**
   * @description handle event status filter with a cache-first strategy
   * @param {string} type
   * @param {Object} textElemRef
   */
  async handleEventStatusFilter(type) {
    this.props.getEventList(this.props.user.socialUID, type);

    this.setState({
      filter: type
    });
  }

  render() {
    return (
      <React.Fragment>
        <OfflineNotice />
        <View style={{ position: "relative", zIndex: 99 }}>
          <Header style={[AppBarStyles.header]}>
            <Left>
              {this.props.showBackBtn ? (
                <Button
                  transparent
                  style={{ marginTop: -16 }}
                  onPress={() => this.handleBackNavigation()}
                >
                  <Icon name="arrow-back" style={{ color: "#ffffff" }} />
                </Button>
              ) : null}
              {this.props.showBackBtnCircle ? (
                <TouchableOpacity
                  style={
                    Platform.OS === "ios"
                      ? AppBarStyles.backBtnIos
                      : AppBarStyles.backBtnAndroid
                  }
                  onPress={() => this.handleBackNavigation()}
                >
                  {
                    <Image
                      style={{
                        height: Platform.select({
                          ios: 40,
                          default: null
                        })
                      }}
                      source={{
                        uri: AppBar.Search_Field
                      }}
                    />
                  }
                </TouchableOpacity>
              ) : null}
            </Left>
            <Body>
              <Image
                source={ImageMap.brand_logo}
                resizeMode="contain"
                style={
                  Platform.OS === "ios"
                    ? AppBarStyles.title_ios
                    : AppBarStyles.title_android
                }
              />
            </Body>
            <Right>
              {this.props.isMenuHidden ? null : (
                <Button
                  transparent
                  onPress={() => this.toggleDrawer(this.props.openState)}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_menu}
                      style={AppBarStyles.sideMenu}
                    />
                  ) : (
                    <Image
                      source={{ uri: AppBar.Symbol_99_2 }}
                      style={AppBarStyles.sideMenu}
                    />
                  )}
                </Button>
              )}
            </Right>
          </Header>
        </View>

        {this.props.headerTitle ? (
          <View style={{ paddingTop: 10, backgroundColor: "#ffffff" }}>
            <Text style={AppBarStyles.textStyle}>{this.props.headerTitle}</Text>
          </View>
        ) : null}

        {this.props.isRibbonVisible && (
          <AppBarFilter
            filterEvent={this.handleEventStatusFilter}
            active={this.state.filter}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    events: state.eventList.events
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getEventList: (userId, type = undefined) => {
      dispatch(getEventList(userId, type));
    },
    changeLocation: (userId, location) => {
      dispatch(changeUserLocation(userId, location));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(AppBarComponent));
