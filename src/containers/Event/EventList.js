import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
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
  List,
  Button
} from "native-base";
import { connect } from "react-redux";
import moment from "moment";
import AppBarComponent from "../../components/AppBar/appbar.index";
import { EventServiceAPI, AuthServiceAPI } from "../../api/index";
import {
  extractHostAndInvitedEventsInfo,
  filterEventsByRSVP
} from "../../utils/eventListFilter";
import { IconsMap, ImageMap } from "../../../assets/assetMap";

import styles from "../../components/EventList/style";
import HoozinList from "../../components/EventList/HoozinList";
import EventListSvg from "./../../svgs/EventList";

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
    extractHostAndInvitedEventsInfo(this.props.user.socialUID, type).then(
      hostedAndInvitedEventsList => {
        hostedAndInvitedEventsList = hostedAndInvitedEventsList.filter(event =>
          filterEventsByRSVP(event, type)
        );
        hostedAndInvitedEventsList.length &&
          hostedAndInvitedEventsList.sort(
            (a, b) => a.startDateTimeInUTC - b.startDateTimeInUTC
          );
        //hostedAndInvitedEventsList.length && hostedAndInvitedEventsList.sort((a, b) => a.startTime - b.startTime);
        console.log("[EventList] all events list", hostedAndInvitedEventsList);
        if (cacheReload) {
          this.setState({
            forceReloadCache: true,
            eventList: hostedAndInvitedEventsList,
            unfilteredEventList: hostedAndInvitedEventsList
          });
        } else {
          this.setState({
            eventList: hostedAndInvitedEventsList,
            unfilteredEventList: hostedAndInvitedEventsList
          });
        }
      }
    );
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
        key: "EventOverview",
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
        key: "TabScreen",
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
        key: "EventDetail",
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

  render() {

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
            {this.state.eventList.length ? (
              this.state.eventList.map((eventData, keyE) => {
                return (
                  <HoozinList
                    eventData={eventData}
                    key={keyE}
                    loadImagesStart={() => {
                      this.setState({ animating: true });
                    }}
                    showEventInfo={this.showEventInfo}
                    loadImagesComplete={() => {
                      this.setState({ animating: false });
                    }}
                  />
                );
              })
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text
                  style={{ textAlign: "center", textAlignVertical: "center" }}
                >
                  No events to show right now
                </Text>
                {/* <Image source={ImageMap.disconnect} style={{marginTop: 30}} />
                <View style={{width: '50%', justifyContent: 'center', alignItems: 'center'}}>
                  <Button full rounded>
                    <Text style={{color: '#fff'}}>Try Again</Text>
                  </Button>
                </View> */}
              </View>
            )}
          </Content>
          {Platform.OS === "ios" ? (
            <Footer style={styles.bottomView_ios}>
              <Left>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate({
                      routeName: "NearbyEvents",
                      key: "NearbyEvents"
                    })
                  }
                  style={styles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_map}
                      style={styles.fabStyles}
                    />
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
                      routeName: "AddEvent",
                      key: "AddEvent"
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
            </Footer>
          ) : (
            <View style={styles.bottomView_android}>
              <Left>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("NearbyEvents")}
                  style={styles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_map}
                      style={styles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{ uri: EventListSvg.btn_EventMap }}
                      style={styles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("AddEvent")}
                  style={{ position: "absolute", bottom: -30, left: 30 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_add_circle}
                      style={styles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{ uri: EventListSvg.Search_Field2 }}
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
                      source={{ uri: EventListSvg.Search_Field3 }}
                      style={styles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </View>
          )}
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
    isConnected: state.connection.isConnected
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventList);
