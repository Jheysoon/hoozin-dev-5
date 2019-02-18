import React, { Component } from 'react'
import { View, ScrollView, Text, TouchableOpacity, AsyncStorage, AppState, Platform } from 'react-native';
import Image from 'react-native-remote-svg';
import { withNavigation } from 'react-navigation';
import { IconsMap, ImageMap } from 'assets/assetMap';
import { Header, Left, Right, Icon, Body, Button } from 'native-base';
import GeoFire from 'geofire';

import { extractHostAndInvitedEventsInfo, filterEventsByRSVP, recalculateFutureEvents } from '../../utils/eventListFilter';

import { UserManagementServiceAPI, EventServiceAPI } from '../../api'
import NotificationService from '../../utils/notification.service';

// styles
import { AppBarStyles } from './appbar.style'

let hostAndInvitedEvents = [];
/**
 * Component to hold the app bar (top navigation plus tab filter bar)
 */
class AppBarComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { appState: AppState.currentState, hasNoEvent: true, eventList: [], eventListFiltered: [], hostAndInvitedEventList: [], isEventListModified: false, prevTextElemRef: null, prevBarElemRef: null, prevBarElemColor: null, userId: null, currentFilterType: 'all', existingInvitedEvents: [] }
    }
    static navigationOptions = {
        header: null
    };

    componentDidMount() {
        if (this.props.isRibbonVisible) {
            const userSvc = new UserManagementServiceAPI();
            const eventSvc = new EventServiceAPI();
            AppState.addEventListener('change', this.handleAppStateChange);

            AsyncStorage.getItem('userId')
                .then(userIdString => {
                    const { uid: userId } = JSON.parse(userIdString);

                    // initiate watcher
                    userSvc.watchForUserDataByFieldAPI(userId, 'eventList')
                        .limitToLast(1)
                        .on('child_added', snapshotAdded => {
                            if (snapshotAdded._value) {
                                const { hostId, eventId } = snapshotAdded._value;
                                const { routeName } = this.props.navigation.state;
                                eventSvc.watchForEventDataByAPI(hostId, eventId)
                                    .on('child_changed', snapshotChange => {
                                        if (snapshotChange._value && (routeName == 'EventList' || routeName == 'NearbyEvents')) {
                                            console.log("++ SUCCESS!! ++");
                                            this.getHostAndInvitedEventsInfo(userId);
                                        }
                                    });
                            }
                            else {
                                console.log("++ child added else ++");
                            }
                        });

                    // initiate onmount handler
                    this.getHostAndInvitedEventsInfo(userId);

                    // get device token
                    this.watchFCMDeviceToken(userId);
                    this.listenForFCMMessages();
                })

        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.invalidateCache != this.props.invalidateCache) {
            this.getHostAndInvitedEventsInfo(this.state.userId);
        }
        if (this.state.eventList.length) {
            this.props.fetchEventListFor == 'list' ? this.props.eventListForAttendee(this.state.eventListFiltered, this.state.currentFilterType) : this.props.eventList(this.state.eventListFiltered, this.state.currentFilterType);
            this.setState({ eventList: [] });
            return;
        }
    }

    handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!')
        }
        this.setState({ appState: nextAppState });
    }

    watchFCMDeviceToken(userId) {
        const notifySvc = new NotificationService();
        notifySvc.retrieveDeviceToken(userId);
        notifySvc.monitorDeviceTokenRefresh(userId);
    }

    listenForFCMMessages() {
        const notifySvc = new NotificationService();

        notifySvc.listenForDataMsgs()
            .then(message => {
                const { event_id, host_id, type } = message;
            })
        notifySvc.listenForNotification();
        notifySvc.listenForNotificationDisplayed();
        notifySvc.listenForNotificationDidOpen()
            .then(notification => {
                if (this.state.userId) {
                    this.props.navigation.navigate({
                        routeName: 'EventList',
                        key: 'EventList',
                    });
                }
            })
        notifySvc.listenForBackgroundNotification()
            .then(notification => {
                if (this.state.userId) {
                    this.props.navigation.navigate({
                        routeName: 'EventList',
                        key: 'EventList',
                    });
                }
            })
    }

    /**
     * @description get all kinds of event information - Host and Invited for an user
     */
    async getHostAndInvitedEventsInfo(userId) {
        const hostAndInvitedEventList = await extractHostAndInvitedEventsInfo(userId);

        if (hostAndInvitedEventList && hostAndInvitedEventList.length) {
            hostAndInvitedEvents = hostAndInvitedEventList;
            const existingInvitedEvents = hostAndInvitedEventList.map(item => item.keyNode);
            //console.log(existingInvitedEvents);

            // IMPORTANT - set the userId in the state. else history wont work.
            this.setState({ hostAndInvitedEventList: hostAndInvitedEventList, existingInvitedEvents: existingInvitedEvents, hasNoEvent: false, userId });
            setTimeout(() => this.handleEventStatusFilter('all', this.refs.textForStatusAll, this.refs.activeBarForStatusAll, 'hsla(207, 97%, 75%, 1)'), 1000);
        }
        else {
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
                routeName: 'Menu', 
                key: 'Menu',
                params: { 
                    isOpened: true 
                }
            })
            return;
        }
        else if (!state && !this.props.withNav) {
            this.props.navigation.navigate({
                routeName: 'Menu', 
                key: 'Menu',
                params: { 
                    isOpened: true 
                }
            })
            return;
        }
        else if (state && this.props.withNav) {
            this.props.withNav.goBack();
            return;
        }
        else if (state && !this.props.withNav) {
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
        if (this.props.currentScreen == 'activeMap' && this.props.skipCacheBurst && this.props.withNav) {
            return this.props.withNav.navigate('EventList');
        }
        else if (this.props.currentScreen != 'activeMap' && this.props.skipCacheBurst) {
            return this.props.navigation.goBack(); 
        }
        else if (this.props.currentScreen == 'activeChat' && this.props.reloadHostFunc) {
            this.props.reloadHostFunc.call(this);
            this.props.navigation.goBack();
            return;
        }
        this.getHostAndInvitedEventsInfo()
            .then(() => {
                this.props.reloadHostFunc ? this.props.reloadHostFunc.call(this) : '';
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
        const colorComponents = color.split(',');
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
            style: { fontWeight: '700' }
        });
        barElemRef.setNativeProps({
            style: { backgroundColor: this.calculateActiveColor(currentColor) }
        });
        if (this.state.prevTextElemRef != this.state.textElemRef && this.state.prevBarElemRef != barElemRef && this.state.prevBarElemColor) {
            this.state.prevTextElemRef.setNativeProps({
                style: { fontWeight: '400' }
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

        const userLocation = await userSvc.getUserDetailsByFieldAPI(this.state.userId, 'userLocation');
        console.log("++ user location data ++", userLocation);
        if (userLocation) {
            eventList
                .filter(item => item.isActive && !item.isHostEvent)
                .forEach(item => {
                    const isAttendeeNearby = this.determineLocationDifference([Number(userLocation.lat), Number(userLocation.lng)], [item.evtCoords.lat, item.evtCoords.lng]);

                    if (isAttendeeNearby) {
                        eventSvc.updateInviteeAPI(item.hostId, this.state.userId, item.keyNode, { withinOneMile: true });
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
        const locationDiffInMile = GeoFire.distance(userLocation, eventLocation) * 0.621;
        console.log("[EventActiveMap] user and event location difference", locationDiffInMile);
        return locationDiffInMile > 0 <= 1;
    }

    /**
     * @description handle event status filter with a cache-first strategy
     * @param {string} type 
     * @param {Object} textElemRef
     */
    async handleEventStatusFilter(type, textElemRef, barElemRef, currentColor) {
        if (type == 'history') {
            const hostAndInvitedEventLists = await extractHostAndInvitedEventsInfo(this.state.userId, 'history');
            const filteredEventLists = hostAndInvitedEventLists.filter(event => filterEventsByRSVP(event, type));
            console.log("[AppBar] Past Events List After Filter by Status", type, filteredEventLists);
            this.highlightTabToFilter(textElemRef, barElemRef, currentColor);
            this.setState({ eventList: [{ touched: true }], eventListFiltered: filteredEventLists, currentFilterType: type, prevTextElemRef: textElemRef, prevBarElemColor: currentColor, prevBarElemRef: barElemRef });
            return;
        }
        if (hostAndInvitedEvents && type != 'history') {
            console.log("[AppBar] Cached Events List", hostAndInvitedEvents);
            const recalculatedEvents = await recalculateFutureEvents(hostAndInvitedEvents, type);
            const filteredEventList = recalculatedEvents.filter(event => filterEventsByRSVP(event, type));
            this.whetherAteendeeNearby(filteredEventList);

            console.log("[AppBar] Events List After Filter by Status", type, filteredEventList);
            this.highlightTabToFilter(textElemRef, barElemRef, currentColor);
            this.setState({ eventList: [{ touched: true }], eventListFiltered: filteredEventList, currentFilterType: type, prevTextElemRef: textElemRef, prevBarElemColor: currentColor, prevBarElemRef: barElemRef });
            return;
        }
    }

    render() {
        return (
            <View style={{ position: 'relative', zIndex: 99 }}>
                <Header style={AppBarStyles.header}>
                    <Left>
                        {this.props.showBackBtn ?
                            <Button transparent style={{ marginTop: -16 }} onPress={() => this.handleBackNavigation()}>
                                <Icon name='arrow-back' style={{ color: '#ffffff' }} />
                            </Button> : null}
                        {this.props.showBackBtnCircle ?
                            <TouchableOpacity style={Platform.OS === 'ios'?AppBarStyles.backBtnIos:AppBarStyles.backBtnAndroid} onPress={() => this.handleBackNavigation()}>
                                {Platform.OS === 'ios'?
                                    <Image source={IconsMap.icon_back_circle} />:
                                    <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 54 54">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #7fc4fd;
                                          opacity: 0.656;
                                        }
                                  
                                        .cls-2 {
                                          fill: none;
                                          stroke: #7fc4fd;
                                          stroke-width: 4px;
                                        }
                                  
                                        .cls-3 {
                                          filter: url(#Search_Field);
                                        }
                                      </style>
                                      <filter id="Search_Field" x="0" y="0" width="54" height="54" filterUnits="userSpaceOnUse">
                                        <feOffset dy="6" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="Group_1225" data-name="Group 1225" transform="translate(-117 -612)">
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 117, 612)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="36" height="36" rx="18" transform="translate(9 3)"/>
                                      </g>
                                      <g id="Group_328" data-name="Group 328" transform="translate(441.5 1244) rotate(180)">
                                        <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                        <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  ` }} />
                                }
                            </TouchableOpacity> : null
                        }
                    </Left>
                    <Body>
                        <Image source={ImageMap.brand_logo}
                            resizeMode='contain'
                            style={Platform.OS === 'ios'?AppBarStyles.title_ios:AppBarStyles.title_android}
                        />
                    </Body>
                    <Right>
                        {this.props.isMenuHidden ?
                            null :
                            <Button transparent onPress={() => this.toggleDrawer(this.props.openState)}>
                                {Platform.OS === 'ios'?
                                    <Image source={IconsMap.icon_menu} style={AppBarStyles.sideMenu} />:
                                    <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #2699fb;
                                          opacity: 0.656;
                                        }
                                  
                                        .cls-2 {
                                          fill: #f8f8fa;
                                          fill-rule: evenodd;
                                        }
                                      </style>
                                    </defs>
                                    <g id="Symbol_99_2" data-name="Symbol 99 – 2" transform="translate(-875 -34)">
                                      <rect id="Search_Field" data-name="Search Field" class="cls-1" width="36" height="36" rx="18" transform="translate(875 34)"/>
                                      <path id="Grabber" class="cls-2" d="M0,1.5H22V0H0ZM0,5H22V3.5H0ZM0,8.5H22V7H0Z" transform="translate(882 48)"/>
                                    </g>
                                  </svg>
                                  ` }} style={AppBarStyles.sideMenu} />
                                }
                            </Button>}
                    </Right>
                </Header>
                {this.props.headerTitle ?
                    <View style={{ paddingTop: 10, backgroundColor: '#ffffff' }} >
                        <Text style={AppBarStyles.textStyle}>{this.props.headerTitle}</Text>
                    </View> : null}
                {this.props.isRibbonVisible ?
                    <View>
                        <ScrollView horizontal={true}>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('all', this.refs.textForStatusAll, this.refs.activeBarForStatusAll, 'hsla(207, 97%, 75%, 1)')}>
                                    <Text ref="textForStatusAll" style={AppBarStyles.btnGroupTxt}>All</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusAll" style={{ height: 3, width: '100%', backgroundColor: 'hsla(207, 97%, 75%, 1)' }}></View>
                            </View>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('active', this.refs.textForStatusActive, this.refs.activeBarForStatusActive, 'hsla(346, 96%, 60%, 1)')}>
                                    <Text ref="textForStatusActive" style={AppBarStyles.btnGroupTxt}>Active</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusActive" style={{ height: 3, width: '100%', backgroundColor: 'hsla(346, 96%, 60%, 1)' }}></View>
                            </View>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('accepted', this.refs.textForStatusAccepted, this.refs.activeBarForStatusAccepted, 'hsla(106, 36%, 52%, 1)')}>
                                    <Text ref="textForStatusAccepted" style={AppBarStyles.btnGroupTxt}>Accepted</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusAccepted" style={{ height: 3, width: '100%', backgroundColor: 'hsla(106, 36%, 52%, 1)' }}></View>
                            </View>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('invited', this.refs.textForStatusInvited, this.refs.activeBarForStatusInvited, 'hsla(37, 87%, 50%, 1)')}>
                                    <Text ref="textForStatusInvited" style={AppBarStyles.btnGroupTxt}>Invited</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusInvited" style={{ height: 3, width: '100%', backgroundColor: 'hsla(37, 87%, 50%, 1)' }}></View>
                            </View>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('public', this.refs.textForStatusPublic, this.refs.activeBarForStatusPublic, 'hsla(208, 96%, 57%, 1)')}>
                                    <Text ref="textForStatusPublic" style={AppBarStyles.btnGroupTxt}>Public</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusPublic" style={{ height: 3, width: '100%', backgroundColor: 'hsla(208, 96%, 57%, 1)' }}></View>
                            </View>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('myevents', this.refs.textForStatusMyevents, this.refs.activeBarForStatusMyevents, 'hsla(266, 74%, 42%, 1)')}>
                                    <Text ref="textForStatusMyevents" style={AppBarStyles.btnGroupTxt}>My Events</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusMyevents" style={{ height: 3, width: '100%', backgroundColor: 'hsla(266, 74%, 42%, 1)' }}></View>
                            </View>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('declined', this.refs.textForStatusDeclined, this.refs.activeBarForStatusDeclined, 'hsla(208, 96%, 57%, 1)')}>
                                    <Text ref="textForStatusDeclined" style={AppBarStyles.btnGroupTxt}>Declined</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusDeclined" style={{ height: 3, width: '100%', backgroundColor: 'hsla(208, 96%, 57%, 1)' }}></View>
                            </View>
                            <View>
                                <TouchableOpacity style={AppBarStyles.btnGroups} onPress={() => this.handleEventStatusFilter('history', this.refs.textForStatusHistory, this.refs.activeBarForStatusHistory, 'hsla(0, 0%, 44%, 1)')}>
                                    <Text ref="textForStatusHistory" style={AppBarStyles.btnGroupTxt}>History</Text>
                                </TouchableOpacity>
                                <View ref="activeBarForStatusHistory" style={{ height: 3, width: '100%', backgroundColor: 'hsla(0, 0%, 44%, 1)' }}></View>
                            </View>
                        </ScrollView>
                    </View> : null}
            </View>
        )
    }
}

export default withNavigation(AppBarComponent);