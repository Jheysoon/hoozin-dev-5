/* Core React modules */
import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
  Platform
} from "react-native";
import _ from "lodash";

import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import UserAvatar from "react-native-user-avatar";
import MapView, { Marker } from "react-native-maps";
import { CachedImage } from "react-native-cached-image";
import { Container, Body, Icon, Item, Left, Spinner } from "native-base";

/* Custom reusable component / modules */
import AppBarComponent from "../../../components/AppBar/appbar.index";

/* API services */
import { EventServiceAPI, UserManagementServiceAPI } from "../../../api";

import InviteeList from "./../../../components/EventList/InviteeList";
import Ribbon from "./../../../components/EventActiveMap/Ribbon";
import { getEvent, setLoading } from "../../../actions/events/event";
import ActiveMap from "./ActiveMap";

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
      singleUserOnly: false,
      isAttendeeViewActive: false,
      animating: true,
    };

    this.renderAvatar = this.renderAvatar.bind(this);
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
      resetMap: () => {
        // set focus of active map here
      }
    });

    /* this.props.navigation.addListener("didFocus", () => {
      this.repositionMapToEventLocation();
    }); */

    // 29.10.2018 - reapplied this from the code
    if (
      eventId &&
      hostId &&
      typeof isHostUser !== "undefined" &&
      showInviteeLocation &&
      withInviteeId
    ) {
      this.props.getEvent(eventId);
      this.setState({
        singleUserOnly: true
      });
      //await this.getEventAndHostDetails(eventId, hostId, isHostUser, true);
      //await this.watchForIncomingChats(hostId, eventId, isHostUser);
      //await this.showInviteeLocation(withInviteeId);
      //return;
    } else if (
      eventId &&
      hostId &&
      typeof isHostUser !== "undefined" &&
      !showInviteeLocation &&
      !withInviteeId
    ) {
      //await this.getEventAndHostDetails(eventId, hostId, isHostUser, false);
      //await this.watchForIncomingChats(hostId, eventId, isHostUser);
      //return;
      this.props.getEvent(eventId);
      this.setState({
        singleUserOnly: false
      });
    }
  }

  componentWillUnmount() {
    this.props.setLoading();
  }

  componentDidUpdate(prevProps, prevState) {
    let prevPropsParams = prevProps.navigation.state.params;
    let currentPropsParams = this.props.navigation.state.params;

    if (
      prevPropsParams != currentPropsParams &&
      currentPropsParams.showInviteeLocation
    ) {
      //this.showInviteeLocation(currentPropsParams.withInviteeId);
    }
  }

  feedbackToUser() {
    Alert.alert("Oops!!", "You cannot set more than 5 images to an event!", [
      { text: "OK", style: "default" }
    ]);
  }

  showUserProfile(userId, eventId, hostId) {
    this.props.navigation.navigate({
      routeName: "EventActiveUser",
      key: "EventActiveUser",
      params: { hostId: userId, eventId: eventId, eventHostId: hostId }
    });
  }

  renderAvatar() {
    const { host } = this.props.eventDetail;

    if (host) {
      if (host.profileImgUrl != "") {
        return (
          <CachedImage
            source={{
              uri: host.profileImgUrl
            }}
            style={{ width: 70, height: 70, borderRadius: 35 }}
          />
        );
      }

      return <UserAvatar name={host.name} size={70} />;
    }

    return null;
  }

  render() {
    const { host, event } = this.props.eventDetail;
    const { loading } = this.props;
    let showInviteeLocation = false;
    let withInviteeId = null;

    if (this.props.navigation.state.params) {
      showInviteeLocation = this.props.navigation.state.params.showInviteeLocation;
      withInviteeId = this.props.navigation.state.params.withInviteeId;
    }

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
            <Ribbon />
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
                      withUser: host.id
                    })
                  }
                >
                  {loading == false && this.renderAvatar()}
                </TouchableOpacity>
              </Left>
              <Body
                style={{
                  flex: 2,
                  alignItems: "flex-start",
                  alignSelf: "flex-start"
                }}
              >
                {loading == false && (
                  <React.Fragment>
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
                        marginLeft: 5
                      }}
                    >
                      {host.name}
                    </Text>
                  </React.Fragment>
                )}
              </Body>
            </Item>

            {this.props.navigation.state.routeName === "EventActiveMap" ? (
              <Item style={{ borderBottomWidth: 0 }}>
                {loading == false && <InviteeList eventId={event.id} />}
              </Item>
            ) : null}
          </View>
        </View>

        {loading == false && (
          <ActiveMap
            singleUserOnly={this.state.singleUserOnly}
            event={event}
            {...event.evtCoords}
          />
        )}

        {loading && (
          <View style={styles.overlay}>
            <Spinner color={"lightgoldenrodyellow"} style={styles.spinner} />
          </View>
        )}
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

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user,
    event: state.event.details,
    indicatorShow: state.auth.indicatorShow,
    eventList: state.eventList.events,
    eventDetail: state.HoozEvent.event,
    loading: state.HoozEvent.loading
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicator(bShow));
    },
    getEvent: id => {
      dispatch(getEvent(id));
    },
    setLoading: () => {
      dispatch(setLoading());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventActiveMapContainer);
