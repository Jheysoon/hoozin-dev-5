import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text
} from "react-native";
import { TabNavigator, TabBarTop } from "react-navigation";
import Image from "react-native-remote-svg";
import { connect } from "react-redux";

import EventActiveMap from "./Event/EventActiveMap/EventActiveMap.index";
import EventActiveUser from "./Event/EventActiveUser";
import EventActiveAttendees from "./Event/EventActiveAttendees";
import EventActiveGallery from "./Event/EventGallery/EventGallery";
import EventCamera from "./Event/EventCamera/EventCamera";
import EventActiveChatContainer from "./Event/EventActiveChat";

import { IconsMap } from "assets/assetMap";
import { EventServiceAPI } from "../api";
import TabScreenSvg from "../svgs/TabScreen";

const components = {
  EventActiveMap: {
    screen: EventActiveMap,
    navigationOptions: {
      tabBarIcon: () =>
        Platform.OS === "ios" ? (
          <Image source={IconsMap.icon_active_map} style={styles.c2aBtn} />
        ) : (
          <Image
            source={{ uri: TabScreenSvg.EventActiveMap }}
            style={styles.c2aBtn}
          />
        )
    },
    params: {
      tabval: 1
    }
  },
  EventActiveAttendees: {
    screen: EventActiveAttendees,
    navigationOptions: {
      tabBarIcon: () =>
        Platform.OS === "ios" ? (
          <Image source={IconsMap.icon_active_attendee} style={styles.c2aBtn} />
        ) : (
          <Image
            source={{ uri: TabScreenSvg.EventActiveAttendees }}
            style={styles.c2aBtn}
          />
        )
    }
  },
  EventCamera: {
    // screen: props => <EventCamera {...props} switchToCamera='true' />,
    // ++ ADDED ON 05.11.2018 by SOMNATH to hide the header from camera screen
    screen: EventCamera,
    navigationOptions: ({ navigation, screenProps }) => ({
      tabBarVisible: false,
      tabBarOnPress({ jumpToIndex, scene }) {
        // if the user is attendee, then dont jump to screen
        console.log(
          "++ camera screen props ++",
          screenProps.rootNav.state.params
        );

        jumpToIndex(scene.index);
      },
      tabBarIcon: () =>
        Platform.OS === "ios" ? (
          <Image source={IconsMap.icon_camera} style={styles.c2aBtn} />
        ) : (
          <Image
            source={{
              uri: TabScreenSvg.EventCamera
            }}
            style={styles.c2aBtn}
          />
        )
    })
  },
  EventActiveGallery: {
    screen: EventActiveGallery,
    navigationOptions: {
      tabBarIcon: () =>
        Platform.OS === "ios" ? (
          <Image source={IconsMap.icon_photo} style={styles.c2aBtn} />
        ) : (
          <Image
            source={{
              uri: TabScreenSvg.EventActiveGallery
            }}
            style={styles.c2aBtn}
          />
        )
    }
  },
  EventActiveChat: {
    screen: EventActiveChatContainer,
    navigationOptions: ({ navigation, screenProps }) => ({
      tabBarIcon: () => (
        <TouchableOpacity>
          {Platform.OS === "ios" ? (
            <Image source={IconsMap.icon_chat_fab} style={styles.c2aBtn} />
          ) : (
            <Image
              source={{
                uri: TabScreenSvg.EventActiveChat
              }}
              style={styles.c2aBtn}
            />
          )}
          <Text style={styles.chatNumberCounterSingleDigit}>
            {navigation.state.routeName === "EventActiveChat" &&
            navigation.isFocused()
              ? 0
              : screenProps.msgCount}
          </Text>
        </TouchableOpacity>
      ),
      tabBarOnPress({ jumpToIndex, scene }) {
        const eventSvc = new EventServiceAPI();
        const {
          hostId,
          eventId,
          isHostUser
        } = screenProps.rootNav.state.params;

        console.log(
          "chat screen params",
          hostId,
          eventId,
          screenProps.withUserId,
          isHostUser
        );
        eventSvc.resetChatMsgCounterAPI(
          hostId,
          eventId,
          screenProps.withUserId,
          isHostUser,
          0
        );
        jumpToIndex(scene.index);
      }
    })
  },
  EventActiveUser: {
    screen: EventActiveUser,
    navigationOptions: ({ navigation, screenProps }) => ({
      tabBarLabel: false,
      tabBarIcon: null
    })
  }
};

const tabIconAndroid = {
  marginTop: 5,
  width: 60,
  height: 60
};

const tabIconIos = {
  marginTop: 5
};

const TabScreen = TabNavigator(components, {
  initialRouteName: "EventActiveMap",
  lazy: true,
  swipeEnabled: false,
  tabBarComponent: TabBarTop,
  animationEnabled: false,
  tabBarOptions: {
    activeTintColor: "blue",
    inactiveBackgroundColor: "#000000", // colors.black,
    inactiveTintColor: "#000000", // colors.black,
    iconStyle: Platform.OS === "ios" ? tabIconIos : tabIconAndroid,
    indicatorStyle: {
      opacity: 0
    },
    upperCaseLabel: false,
    scrollEnabled: false,
    showIcon: true,
    showLabel: false,
    style: {
      width: "110%",
      backgroundColor: "transparent",
      position: "absolute",
      left: 13,
      right: 0,
      bottom: 0
    }
  },
  tabStyle: {
    justifyContent: "center",
    alignItems: "center"
  },
  tabBarPosition: "bottom"
});

const styles = StyleSheet.create({
  c2aBtn: {
    width: 60,
    height: 60,
    position: "relative"
  },
  chatNumberCounterSingleDigit: {
    fontFamily: "Lato",
    fontWeight: "800",
    fontSize: 16,
    color: "red",
    position: "absolute",
    zIndex: 99999999,
    left: 26,
    top: 13
  },
  chatNumberCounterDoubleDigit: {
    fontFamily: "Lato",
    fontWeight: "800",
    fontSize: 16,
    color: "red",
    position: "absolute",
    zIndex: 99999999,
    left: 20,
    top: 13
  }
});

/// +++ ADDED ON 06.11.2018 BY SOMNATH
class TabScreenWrapper extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      msgCount: 0
    };
  }

  componentDidMount() {
    this.watchForIncomingChats();
  }

  watchForIncomingChats() {
    const eventSvc = new EventServiceAPI();
    const { hostId, eventId, isHostUser } = this.props.navigation.state.params;

    if (isHostUser && hostId == this.props.user.socialUID) {
      eventSvc
        .watchForEventDataByFieldAPI(hostId, eventId, "newMsgCount")
        .on("value", snapshot => {
          if (!isNaN(snapshot.val())) {
            console.log("@@@ msgcounter snapshot for host", snapshot.val());
            this.setState({ msgCount: snapshot.val() });
          }
        });
    } else {
      eventSvc
        .watchForEventInviteeDataByFieldAPI(
          hostId,
          eventId,
          this.props.user.socialUID,
          "newMsgCount"
        )
        .on("value", snapshot => {
          if (!isNaN(snapshot.val())) {
            console.log("@@@ msgcounter snapshot for invitee", snapshot.val());
            this.setState({ msgCount: snapshot.val() });
          }
        });
    }
  }

  render() {
    return (
      <TabScreen
        screenProps={{
          withEvent: this.props.navigation.getParam("withEvent"),
          rootNav: this.props.navigation,
          msgCount: this.state.msgCount || 0,
          withUserId: this.props.user.socialUID
        }}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user
  };
};

export default connect(
  mapStateToProps,
  null
)(TabScreenWrapper);
