import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import Image from "react-native-remote-svg";
import { withNavigation } from "react-navigation";
import {
  Container,
  Content,
  Footer,
  Left,
  Body,
  Right,
  Spinner,
  Button
} from "native-base";
import { connect } from "react-redux";
import moment from "moment";

import EventsLib from "./../../lib/EventsLib";
import EventListSvg from "./../../svgs/EventList";
import * as Theme from "../../theme/hoozin-theme";
import styles from "../../components/EventList/style";
import { getEventList } from "./../../actions/events/list";
import NoEvents from "./../../components/EventList/NoEvents";
import { IconsMap, ImageMap } from "../../../assets/assetMap";
import HoozinList from "../../components/EventList/HoozinList";
import AppBarComponent from "../../components/AppBar/appbar.index";

class EventList extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      eventList: [],
      unfilteredEventList: [],
      activeFilterType: "",
      forceReloadCache: false,
      eventListArrived: false,
      eventListFetchMode: "list",
      isSearchViewActive: false,
      searchText: "",
      animating: false
    };
    this.mount = true;

    this.showEventInfo = this.showEventInfo.bind(this);
    this.onTryAgain = this.onTryAgain.bind(this);
  }

  componentDidMount() {
    //const eventSvc = new EventServiceAPI();
    // eventSvc.getUserDetailsAPI2(this.props.user.socialUID)
    //     .then(userData => {
    //         this.getHostAndInvitedEvents();
    //         this.setState({ currentUserName: userData.name })
    //     });
    // change made on 25.09.2018 => host user picture related bug
    //this.getHostAndInvitedEvents();
  }

  /**
   * @description reload any functions that needs to be reloaded in order to refresh the app
   */
  reloadEvents() {
    this.getHostAndInvitedEvents(this.state.activeFilterType, true);
    //this.getHostAndInvitedEvents('all', true);
  }

  /**
   * @description fetches all the hosted and invited events
   */
  getHostAndInvitedEvents(type, cacheReload) {
    //console.log("goes here ##########################");

    let eventsLib = new EventsLib();

    let param = {
      socialUID: this.props.user.socialUID,
      type
    };

    eventsLib.getHostAndInvitedEvents(param).then(val => {
      if (cacheReload) {
        this.setState({
          forceReloadCache: true,
          ...val
        });
      } else {
        this.setState(val);
      }
    });
  }

  /**
   * @description capture event information back from App bar component (Hacky approach for React)
   */
  captureEventListFromAppBar(data, type) {
    data.length &&
      data.sort(
        (a, b) =>
          moment(b.startDate, "YYYY-MM-DD") - moment(a.startDate, "YYYY-MM-DD")
      );
    data.length &&
      data.sort(
        (a, b) =>
          moment(b.startTime, "HH:mm A") - moment(a.startTime, "HH:mm A")
      );
    console.log("[EventList] from app bar event data", data, type);

    this.setState({
      eventList: data,
      unfilteredEventList: data,
      activeFilterType: type,
      animating: false
    });
  }

  /**
   * @description Show an event information depending upon user role (i.e. Host or Attendee) and event status (e.g. Active)
   * @param {Object<any>} eventData
   */
  showEventInfo(eventData) {
    const {
      eventResponse,
      isHostEvent,
      keyNode,
      hostId,
      isActive,
      isPastEvent
    } = eventData;
    console.log("[EventList] whether host event", isHostEvent);
    console.log("[EventList] event id", keyNode);

    if (isHostEvent && !isActive && !isPastEvent) {
      this.props.navigation.navigate({
        routeName: "EventOverview",
        key: "EventOverview_" + keyNode,
        params: {
          eventId: keyNode
        }
      });
      return;
    } else if (
      (isHostEvent || (!isHostEvent && eventResponse != "invited")) &&
      isActive &&
      !isPastEvent
    ) {
      this.props.navigation.navigate({
        routeName: "TabScreen",
        params: {
          eventId: keyNode,
          hostId: hostId,
          isHostUser: isHostEvent,
          withEvent: eventData
        }
      });
      return;
    } else if (
      !isHostEvent &&
      (eventResponse == "invited" ||
        eventResponse == "maybe" ||
        eventResponse == "going" ||
        eventResponse == "declined") &&
      !isPastEvent
    ) {
      this.props.navigation.navigate({
        routeName: "EventDetail",
        params: {
          eventId: keyNode,
          hostId: hostId,
          reloadEventsFunc: this.reloadEvents.bind(this)
        }
      });
      return;
    } else if (isPastEvent) {
      Alert.alert("Notification!", "This event has expired!", [
        { text: "OK", style: "default" }
      ]);
      return;
    }
  }

  displayEventsFilterView() {
    this.setState({ isSearchViewActive: true });
  }

  filterEvents(searchText) {
    console.log(
      "[EventList] original events list",
      this.state.unfilteredEventList
    );
    const filteredResult = this.state.unfilteredEventList.filter(event =>
      event.eventTitle.includes(searchText)
    );
    this.setState({ eventList: filteredResult });
  }

  clearEventsFilter() {
    this.setState({
      isSearchViewActive: false,
      eventList: this.state.unfilteredEventList
    });
  }

  onAddEvent() {
    this.props.navigation.navigate({
      routeName: "AddEvent",
      key: "AddEvent"
    });
  }

  onMenuPressed() {
    const { navigate } = this.props.navigation;
    navigate({
      routeName: "Menu",
      key: "Menu"
    });
  }

  onTryAgain() {
    this.props.getEventList(this.props.user.socialUID);
  }

  render() {
    let { eventList } = this.props;

    const ComponentWrap = Platform.OS === "ios" ? Footer : View;

    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          {this.state.isSearchViewActive ? (
            <React.Fragment>
              <AppBarComponent
                fetchEventListFor={this.state.eventListFetchMode}
                eventListForAttendee={this.captureEventListFromAppBar.bind(
                  this
                )}
              />
              <View
                style={{
                  backgroundColor: "#BCE0FD",
                  paddingTop: 10,
                  paddingBottom: 10,
                  marginBottom: 5
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    paddingLeft: 15,
                    paddingRight: 15
                  }}
                >
                  <View style={{ flex: 7, position: "relative" }}>
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_search_mini}
                        style={styles.img_16}
                      />
                    ) : (
                      <Image
                        source={{ uri: EventListSvg.Search }}
                        style={styles.img_16}
                      />
                    )}
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_mini}
                        style={styles.img_16}
                      />
                    ) : (
                      <Image
                        source={{ uri: EventListSvg.Path_765 }}
                        style={styles.img_16}
                      />
                    )}
                    <TextInput
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 12,
                        padding: 5,
                        paddingLeft: 28,
                        paddingRight: 28
                      }}
                      placeholder="Search"
                      onChangeText={text => this.filterEvents(text)}
                    />
                  </View>
                  <TouchableOpacity onPress={() => this.clearEventsFilter()}>
                    <Text
                      style={{
                        alignSelf: "center",
                        fontFamily: "Lato",
                        fontSize: 17,
                        color: "#004D9B"
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </React.Fragment>
          ) : (
            <AppBarComponent
              isRibbonVisible={true}
              invalidateCache={this.state.forceReloadCache}
              fetchEventListFor={this.state.eventListFetchMode}
              eventListForAttendee={this.captureEventListFromAppBar.bind(this)}
            />
          )}
          <Content>
            {eventList.length ? (
              eventList.map((eventData, keyE) => {
                return (
                  <HoozinList
                    eventData={eventData}
                    key={keyE}
                    showEventInfo={this.showEventInfo}
                  />
                );
              })
            ) : (
              <NoEvents />
            )}

            {this.props.isConnected == false && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {this.props.fetching == true && (
                  <ActivityIndicator
                    size="large"
                    color={Theme.BRAND_COLOR.PRIMARY}
                  />
                )}
                <Image source={ImageMap.disconnect} style={{ marginTop: 30 }} />
                <View
                  style={{
                    width: "50%",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Button
                    full
                    rounded
                    style={{ height: 30 }}
                    onPress={this.onTryAgain}
                  >
                    <Text style={{ color: "#fff" }}>Try Again</Text>
                  </Button>
                </View>
              </View>
            )}
          </Content>

          <ComponentWrap
            style={Platform.select({
              ios: styles.bottomView_ios,
              android: styles.bottomView_android
            })}
          >
            <Left>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate({
                    routeName: "NearbyEvents"
                  })
                }
                style={styles.fabLeftWrapperStyles}
              >
                {Platform.OS === "ios" ? (
                  <Image source={IconsMap.icon_map} style={styles.fabStyles} />
                ) : (
                  <Image
                    source={{ uri: EventListSvg.Ellipse_368 }}
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Left>
            <Body>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate({
                    routeName: "AddEvent"
                  })
                }
                style={{ position: "absolute", bottom: -30, left: 30 }}
              >
                {Platform.OS === "ios" ? (
                  <Image
                    source={IconsMap.icon_add_circle}
                    style={styles.fabStyles}
                  />
                ) : (
                  <Image
                    source={{ uri: EventListSvg.Search_Field }}
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Body>
            <Right>
              <TouchableOpacity
                style={styles.fabRightWrapperStyles}
                onPress={() => this.displayEventsFilterView()}
              >
                {Platform.OS === "ios" ? (
                  <Image
                    source={IconsMap.icon_search}
                    style={styles.fabStyles}
                  />
                ) : (
                  <Image
                    source={{ uri: EventListSvg.Search_Field1 }}
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Right>
          </ComponentWrap>
        </Container>
        {this.state.animating && (
          <View style={styles.overlay}>
            <Spinner color={"lightgoldenrodyellow"} style={styles.spinner} />
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
    isConnected: state.connection.isConnected,
    eventList: state.eventList.events,
    fetching: state.connection.fetching
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getEventList: (userId, type = undefined) => {
      dispatch(getEventList(userId, type));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(EventList));
