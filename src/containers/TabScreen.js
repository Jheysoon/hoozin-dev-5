import React, { Component } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { TabNavigator, TabBarTop } from 'react-navigation';
import Image from 'react-native-remote-svg'
import { connect } from 'react-redux';

import EventActiveMap from './Event/EventActiveMap/EventActiveMap.index';
import EventActiveUser from './Event/EventActiveUser';
import EventActiveAttendees from './Event/EventActiveAttendees';
import EventActiveGallery from './Event/EventGallery/EventGallery';
import EventCamera from './Event/EventCamera/EventCamera';
import EventActiveChatContainer from './Event/EventActiveChat';

import { IconsMap } from 'assets/assetMap'
import { EventServiceAPI } from '../api'

/**
 * @description prompt the user by displaying proper message
 */
const feedbackToUser = () => {
  Alert.alert(
      'Ooops!',
      'Only a Host user can capture event picture!',
      [
          { text: 'OK', style: 'cancel' }
      ]
  );
}

const components = {
  EventActiveMap: {
    screen: EventActiveMap,
    navigationOptions: {
      tabBarIcon: () => (
        Platform.OS === 'ios' ?
          <Image source={IconsMap.icon_active_map} style={styles.c2aBtn} /> :
          <Image source={{
            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2 {
                                  fill: none;
                                }
                          
                                .cls-3 {
                                  fill: #fff;
                                  fill-rule: evenodd;
                                }
                          
                                .cls-4 {
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
                            <g id="btn_EventActive_Map" transform="translate(-121 -554)">
                              <g class="cls-4" transform="matrix(1, 0, 0, 1, 121, 554)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                              </g>
                              <g id="Places" transform="translate(-2227 -11810)">
                                <rect id="Rectangle_305" data-name="Rectangle 305" class="cls-2" width="24.784" height="24.784" transform="translate(2366 12376)"/>
                                <path id="Path_114" data-name="Path 114" class="cls-3" d="M10.21,14.743a4.33,4.33,0,0,0,4.337-4.337A4.463,4.463,0,0,0,10.21,5.914a4.33,4.33,0,0,0-4.337,4.337A4.572,4.572,0,0,0,10.21,14.743ZM2.929,2.971A10.3,10.3,0,1,1,17.49,17.531l-7.28,7.28-7.28-7.28A10.577,10.577,0,0,1,2.929,2.971Z" transform="translate(2367.524 12376.05)"/>
                              </g>
                            </g>
                          </svg>
                          ` }} style={styles.c2aBtn} />
      )
    },
    params: {
      tabval: 1
    }
  },
  EventActiveAttendees: {
    screen: EventActiveAttendees,
    navigationOptions: {
      tabBarIcon: () => (
        Platform.OS === 'ios' ?
          <Image source={IconsMap.icon_active_attendee} style={styles.c2aBtn} /> :
          <Image source={{
            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2 {
                                  fill: #7fc4fd;
                                }
                          
                                .cls-3 {
                                  fill: #bce0fd;
                                }
                          
                                .cls-4 {
                                  fill: #fff;
                                }
                          
                                .cls-5 {
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
                            <g id="btn_EventActive_Attendees" transform="translate(-33 -557)">
                              <g class="cls-5" transform="matrix(1, 0, 0, 1, 33, 557)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                              </g>
                              <g id="Group_1303" data-name="Group 1303" transform="translate(0)">
                                <g id="Group_1027" data-name="Group 1027" transform="translate(59 571)">
                                  <path id="Rectangle_31" data-name="Rectangle 31" class="cls-2" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                                  <circle id="Ellipse_14" data-name="Ellipse 14" class="cls-2" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                                </g>
                                <g id="Group_1029" data-name="Group 1029" transform="translate(52 571)">
                                  <path id="Rectangle_31-2" data-name="Rectangle 31" class="cls-3" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                                  <circle id="Ellipse_14-2" data-name="Ellipse 14" class="cls-3" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                                </g>
                                <g id="Group_1030" data-name="Group 1030" transform="translate(45 571)">
                                  <path id="Rectangle_31-3" data-name="Rectangle 31" class="cls-4" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                                  <circle id="Ellipse_14-3" data-name="Ellipse 14" class="cls-4" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                                </g>
                              </g>
                            </g>
                          </svg>
                          ` }} style={styles.c2aBtn} />
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
        console.log("++ camera screen props ++", screenProps.rootNav.state.params);
        if (!screenProps.rootNav.state.params.isHostUser) {
          return feedbackToUser();
        }
        jumpToIndex(scene.index);
      },
      tabBarIcon: () => (
        Platform.OS === 'ios' ?
          <Image source={IconsMap.icon_camera} style={styles.c2aBtn} /> :
          <Image source={{
            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2, .cls-3, .cls-4, .cls-5 {
                                  fill: #fff;
                                }
                          
                                .cls-3 {
                                  stroke: #bcbcbc;
                                }
                          
                                .cls-4 {
                                  stroke: #707070;
                                }
                          
                                .cls-5 {
                                  stroke: #fff;
                                }
                          
                                .cls-6 {
                                  stroke: none;
                                }
                          
                                .cls-7 {
                                  fill: none;
                                }
                          
                                .cls-8 {
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
                            <g id="btn_Camera" transform="translate(-1331 -432)">
                              <g class="cls-8" transform="matrix(1, 0, 0, 1, 1331, 432)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                              </g>
                              <g id="Group_435" data-name="Group 435" transform="translate(1337 285)">
                                <rect id="Rectangle_57" data-name="Rectangle 57" class="cls-2" width="31" height="21" rx="7" transform="translate(9 162)"/>
                                <g id="Rectangle_58" data-name="Rectangle 58" class="cls-3" transform="translate(17 165)">
                                  <rect class="cls-6" width="16" height="16" rx="8"/>
                                  <rect class="cls-7" x="0.5" y="0.5" width="15" height="15" rx="7.5"/>
                                </g>
                                <path id="Rectangle_59" data-name="Rectangle 59" class="cls-2" d="M5,0H9a5,5,0,0,1,5,5V8a0,0,0,0,1,0,0H0A0,0,0,0,1,0,8V5A5,5,0,0,1,5,0Z" transform="translate(18 156)"/>
                                <g id="Ellipse_21" data-name="Ellipse 21" class="cls-4" transform="translate(14 165)">
                                  <circle class="cls-6" cx="1" cy="1" r="1"/>
                                  <circle class="cls-7" cx="1" cy="1" r="0.5"/>
                                </g>
                                <g id="Ellipse_22" data-name="Ellipse 22" class="cls-5" transform="translate(14 161)">
                                  <circle class="cls-6" cx="1" cy="1" r="1"/>
                                  <circle class="cls-7" cx="1" cy="1" r="0.5"/>
                                </g>
                              </g>
                            </g>
                          </svg>
                          ` }} style={styles.c2aBtn} />
      )
    })
  },
  EventActiveGallery: {
    screen: EventActiveGallery,
    navigationOptions: {
      tabBarIcon: () => (
        Platform.OS === 'ios' ?
          <Image source={IconsMap.icon_photo} style={styles.c2aBtn} /> :
          <Image source={{
            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2 {
                                  fill: #fff;
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
                            <g id="btn_EventActive_Photo" transform="translate(-93 -564)">
                              <g class="cls-3" transform="matrix(1, 0, 0, 1, 93, 564)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                              </g>
                              <path id="Path_148" data-name="Path 148" class="cls-2" d="M23.765,0a1.621,1.621,0,0,1,1.061.424A1.512,1.512,0,0,1,25.462,1.7V17.611a1.621,1.621,0,0,1-.424,1.061,2.275,2.275,0,0,1-1.273.424H1.7a2.275,2.275,0,0,1-1.273-.424A2.275,2.275,0,0,1,0,17.4V1.7A1.621,1.621,0,0,1,.424.637,1.512,1.512,0,0,1,1.7,0ZM7.214,3.819a2.409,2.409,0,0,0-1.7-.637,2.409,2.409,0,0,0-1.7.637,2.409,2.409,0,0,0-.637,1.7,2.409,2.409,0,0,0,.637,1.7,2.409,2.409,0,0,0,1.7.637,2.409,2.409,0,0,0,1.7-.637,2.409,2.409,0,0,0,.637-1.7A2.409,2.409,0,0,0,7.214,3.819ZM22.28,15.914,15.914,6.366l-5.729,7.427L6.366,11.034l-3.183,4.88Z" transform="translate(110 578)"/>
                            </g>
                          </svg>
                          ` }} style={styles.c2aBtn} />
      )
    }
  },
  EventActiveChat: {
    screen: EventActiveChatContainer,
    navigationOptions: ({ navigation, screenProps }) => ({
      tabBarIcon: () => (
        <TouchableOpacity>
        {Platform.OS === 'ios' ?
        <Image source={IconsMap.icon_chat_fab} style={styles.c2aBtn} /> :
        <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60"><defs><style>.a{fill:#2699fb;}.b{fill:#fff;}.c{filter:url(#a);}</style><filter id="a" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse"><feOffset dy="6" input="SourceAlpha"/><feGaussianBlur stdDeviation="3" result="b"/><feFlood flood-opacity="0.161"/><feComposite operator="in" in2="b"/><feComposite in="SourceGraphic"/></filter></defs><g transform="translate(-288 -619)"><g class="c" transform="matrix(1, 0, 0, 1, 288, 619)"><rect class="a" width="42" height="42" rx="21" transform="translate(9 3)"/></g><g transform="translate(-1499.09 217)"><rect class="b" width="27.628" height="21.781" rx="10.891" transform="translate(1803.928 415)"/><path class="b" d="M1740.351,700.226c-2.8,2.119-4.708,6.067-4.17,6.749.7,1.037,9.281-2.658,9.281-2.658Z" transform="translate(67 -269.395)"/></g></g></svg>` }} style={styles.c2aBtn} />
        }
        <Text style={styles.chatNumberCounterSingleDigit}>{navigation.state.routeName === 'EventActiveChat' && navigation.isFocused()?0:screenProps.msgCount}</Text>
        </TouchableOpacity>
      ),
      tabBarOnPress({ jumpToIndex, scene }) {
        const eventSvc = new EventServiceAPI();
        const { hostId, eventId, isHostUser } = screenProps.rootNav.state.params;

        console.log("chat screen params", hostId, eventId, screenProps.withUserId, isHostUser);
        eventSvc.resetChatMsgCounterAPI(hostId, eventId, screenProps.withUserId, isHostUser, 0);
        jumpToIndex(scene.index);
      }
    })
  },
  EventActiveUser: {
    screen: EventActiveUser,
    navigationOptions: ({ navigation, screenProps }) => ({
      tabBarLabel: false,
      tabBarIcon: null,
    })
  }

};

const tabIconAndroid = {
  marginTop: 5,
  width: 60,
  height: 60
};

const tabIconIos =  {
  marginTop: 5
}

const TabScreen = TabNavigator(components, {
  initialRouteName: 'EventActiveMap',
  lazy: false,
  swipeEnabled: false,
  tabBarComponent: TabBarTop,
  animationEnabled: false,
  tabBarOptions: {
    activeTintColor: 'blue',
    inactiveBackgroundColor: '#000000', // colors.black,
    inactiveTintColor: '#000000', // colors.black,
    iconStyle: Platform.OS === 'ios'?tabIconIos:tabIconAndroid,
    indicatorStyle: {
      opacity: 0,
    },
    upperCaseLabel: false,
    scrollEnabled: false,
    showIcon: true,
    showLabel: false,
    style: {
      width: '110%',
      backgroundColor: 'transparent',
      position: 'absolute',
        left: 13,
        right: 0,
        bottom: 0,
    },
  },
  tabStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarPosition: 'bottom',
});


const styles = StyleSheet.create({
  c2aBtn: {
    width: 60,
    height: 60,
    position: 'relative'
  },
  chatNumberCounterSingleDigit: {
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: 16,
    color: 'red',
    position: 'absolute',
    zIndex: 99999999,
    left: 26,
    top: 13
},
chatNumberCounterDoubleDigit: {
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: 16,
    color: 'red',
    position: 'absolute',
    zIndex: 99999999,
    left: 20,
    top: 13
}
});

/// +++ ADDED ON 06.11.2018 BY SOMNATH
class TabScreenWrapper extends Component {
  static navigationOptions = {
    header: null
  }
  
  constructor(props) {
    super(props);
    this.state = {
      msgCount: 0
    }
  }

  componentDidMount() {
    this.watchForIncomingChats();
  }

  watchForIncomingChats() {
    const eventSvc = new EventServiceAPI();
    const { hostId, eventId, isHostUser } = this.props.navigation.state.params;

    if (isHostUser && hostId == this.props.user.socialUID) {
        eventSvc.watchForEventDataByFieldAPI(hostId, eventId, 'newMsgCount')
            .on('value', snapshot => {
                if (!isNaN(snapshot.val())) {
                    console.log("@@@ msgcounter snapshot for host", snapshot.val());
                    this.setState({ msgCount: snapshot.val() });
                }
            });
    }
    else {
        eventSvc.watchForEventInviteeDataByFieldAPI(hostId, eventId, this.props.user.socialUID, 'newMsgCount')
            .on('value', snapshot => {
                if (!isNaN(snapshot.val())) {
                    console.log("@@@ msgcounter snapshot for invitee", snapshot.val());
                    this.setState({ msgCount: snapshot.val() });
                }
            });
    }
}

  render() {
    return (
      <TabScreen screenProps={{ 
        withEvent: this.props.navigation.getParam('withEvent'), 
        rootNav: this.props.navigation,
        msgCount: this.state.msgCount || 0,
        withUserId: this.props.user.socialUID
      }} />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user
  }
}

export default connect(mapStateToProps, null)(TabScreenWrapper)