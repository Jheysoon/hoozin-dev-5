import React, { Component } from "react";
import { connect } from 'react-redux';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  AsyncStorage,
  AppState,
  Platform
} from "react-native";
import Image from "react-native-remote-svg";
import { withNavigation } from "react-navigation";
import { IconsMap, ImageMap } from "assets/assetMap";
import { Header, Left, Right, Icon, Body, Button } from "native-base";
import GeoFire from "geofire";
import BackgroundGeolocation from "react-native-mauron85-background-geolocation";
import {
  extractHostAndInvitedEventsInfo,
  filterEventsByRSVP,
  recalculateFutureEvents
} from "../../utils/eventListFilter";

import { UserManagementServiceAPI, EventServiceAPI } from "../../api";
import NotificationService from "../../utils/notification.service";

// styles
import { AppBarStyles } from "./appbar.style";
import AppBar from '../../svgs/AppBar';
import OfflineNotice from '../../components/OfflineNotice';
import { getEventList } from '../../actions/events/list';

let hostAndInvitedEvents = [];
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
      existingInvitedEvents: []
    };
  }
  static navigationOptions = {
    header: null
  };

  componentDidMount() {
    // ------------------------------------Background Tracker------------------------------------
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: "Background tracking",
      notificationText: "enabled",
      debug: true,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
      url: "http://192.168.81.15:3000/location",
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

    BackgroundGeolocation.on("stationary", stationaryLocation => {
      // handle stationary locations here
      Actions.sendLocation(stationaryLocation);
    });

    BackgroundGeolocation.on("error", error => {
      console.log("[ERROR] BackgroundGeolocation error:", error);
    });

    BackgroundGeolocation.on("start", () => {
      console.log("[INFO] BackgroundGeolocation service has been started");
    });

    BackgroundGeolocation.on("stop", () => {
      console.log("[INFO] BackgroundGeolocation service has been stopped");
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
    });

    BackgroundGeolocation.on("foreground", () => {
      console.log("[INFO] App is in foreground");
    });

    BackgroundGeolocation.on("abort_requested", () => {
      console.log("[INFO] Server responded with 285 Updates Not Required");
    });

    BackgroundGeolocation.on("http_authorization", () => {
      console.log("[INFO] App needs to authorize the http requests");
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
                    this.getHostAndInvitedEventsInfo(userId);
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
      setTimeout(
        () =>
          this.handleEventStatusFilter(
            "all",
            this.refs.textForStatusAll,
            this.refs.activeBarForStatusAll,
            "hsla(207, 97%, 75%, 1)"
          ),
        1000
      );
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
   * @description Highlight tabs for filtering while reset the previous active tab
   * @param {Object} textElemRef
   * @param {Object} barElemRef
   * @param {string} currentColor
   */
  highlightTabToFilter(textElemRef, barElemRef, currentColor) {
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
  async handleEventStatusFilter(type, textElemRef, barElemRef, currentColor) {
    if (type == "history") {
      const hostAndInvitedEventLists = await extractHostAndInvitedEventsInfo(
        this.state.userId,
        "history"
      );
      const filteredEventLists = hostAndInvitedEventLists.filter(event =>
        filterEventsByRSVP(event, type)
      );
      /* console.log(
        "[AppBar] Past Events List After Filter by Status",
        type,
        filteredEventLists
      ); */
      this.highlightTabToFilter(textElemRef, barElemRef, currentColor);
      this.setState({
        eventList: [{ touched: true }],
        eventListFiltered: filteredEventLists,
        currentFilterType: type,
        prevTextElemRef: textElemRef,
        prevBarElemColor: currentColor,
        prevBarElemRef: barElemRef
      });
      return;
    }
    if (hostAndInvitedEvents && type != "history") {
      /* console.log("[AppBar] Cached Events List", hostAndInvitedEvents); */
      const recalculatedEvents = await recalculateFutureEvents(
        hostAndInvitedEvents,
        type
      );
      const filteredEventList = recalculatedEvents.filter(event =>
        filterEventsByRSVP(event, type)
      );
      this.whetherAteendeeNearby(filteredEventList);

      /* console.log(
        "[AppBar] Events List After Filter by Status",
        type,
        filteredEventList
      ); */
      this.highlightTabToFilter(textElemRef, barElemRef, currentColor);
      this.setState({
        eventList: [{ touched: true }],
        eventListFiltered: filteredEventList,
        currentFilterType: type,
        prevTextElemRef: textElemRef,
        prevBarElemColor: currentColor,
        prevBarElemRef: barElemRef
      });
      return;
    }
  }

  render() {
    return (
      <React.Fragment>
      <OfflineNotice />
      <View style={{ position: "relative", zIndex: 99 }}>
      
        <Header style={AppBarStyles.header}>
        
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
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_back_circle} />
                  ) : (
                      <Image
                        source={{
                          uri: AppBar.Search_Field
                        }}
                      />
                    )}
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
        {this.props.headerTitle ? (
          <View style={{ paddingTop: 10, backgroundColor: "#ffffff" }}>
            <Text style={AppBarStyles.textStyle}>{this.props.headerTitle}</Text>
          </View>
        ) : null}
        {this.props.isRibbonVisible ? (
          <View>
            <ScrollView horizontal={true}>
              <View>
                <TouchableOpacity
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "all",
                      this.refs.textForStatusAll,
                      this.refs.activeBarForStatusAll,
                      "hsla(207, 97%, 75%, 1)"
                    )
                  }
                >
                  <Text ref="textForStatusAll" style={AppBarStyles.btnGroupTxt}>
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
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "active",
                      this.refs.textForStatusActive,
                      this.refs.activeBarForStatusActive,
                      "hsla(346, 96%, 60%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusActive"
                    style={AppBarStyles.btnGroupTxt}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusActive"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(346, 96%, 60%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "accepted",
                      this.refs.textForStatusAccepted,
                      this.refs.activeBarForStatusAccepted,
                      "hsla(106, 36%, 52%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusAccepted"
                    style={AppBarStyles.btnGroupTxt}
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
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "invited",
                      this.refs.textForStatusInvited,
                      this.refs.activeBarForStatusInvited,
                      "hsla(37, 87%, 50%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusInvited"
                    style={AppBarStyles.btnGroupTxt}
                  >
                    Invited
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
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "public",
                      this.refs.textForStatusPublic,
                      this.refs.activeBarForStatusPublic,
                      "hsla(208, 96%, 57%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusPublic"
                    style={AppBarStyles.btnGroupTxt}
                  >
                    Public
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusPublic"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(208, 96%, 57%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "myevents",
                      this.refs.textForStatusMyevents,
                      this.refs.activeBarForStatusMyevents,
                      "hsla(266, 74%, 42%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusMyevents"
                    style={AppBarStyles.btnGroupTxt}
                  >
                    My Events
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusMyevents"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(266, 74%, 42%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "declined",
                      this.refs.textForStatusDeclined,
                      this.refs.activeBarForStatusDeclined,
                      "hsla(208, 96%, 57%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusDeclined"
                    style={AppBarStyles.btnGroupTxt}
                  >
                    Declined
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusDeclined"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(208, 96%, 57%, 1)"
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={AppBarStyles.btnGroups}
                  onPress={() =>
                    this.handleEventStatusFilter(
                      "history",
                      this.refs.textForStatusHistory,
                      this.refs.activeBarForStatusHistory,
                      "hsla(0, 0%, 44%, 1)"
                    )
                  }
                >
                  <Text
                    ref="textForStatusHistory"
                    style={AppBarStyles.btnGroupTxt}
                  >
                    History
                  </Text>
                </TouchableOpacity>
                <View
                  ref="activeBarForStatusHistory"
                  style={{
                    height: 3,
                    width: "100%",
                    backgroundColor: "hsla(0, 0%, 44%, 1)"
                  }}
                />
              </View>
            </ScrollView>
          </View>
        ) : null}
      </View>
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
    getEventList: userId => {
      dispatch(getEventList(userId));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(AppBarComponent));
