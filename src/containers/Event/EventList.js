import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    AsyncStorage,
    Platform
} from 'react-native'
import Image from 'react-native-remote-svg';
import { Container, Content, Footer, Left, Body, Right, Spinner, List, ListItem } from 'native-base';
import { connect } from 'react-redux';
import moment from 'moment';
import AppBarComponent from '../../components/AppBar/appbar.index';
import { EventServiceAPI, AuthServiceAPI } from '../../api/index';
import { extractHostAndInvitedEventsInfo, filterEventsByRSVP } from '../../utils/eventListFilter';
import { IconsMap } from 'assets/assetMap';
const eventStatusColor = { goingOrHost: '#6EB25A', invitedOrMaybe: '#EF9A12', declined: '#FF003B' };

class EventList extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props, context) {
        super(props, context)
        this.state = {
            eventList: [],
            unfilteredEventList: [],
            activeFilterType: '',
            forceReloadCache: false,
            eventListArrived: false,
            eventListFetchMode: 'list',
            isSearchViewActive: false,
            searchText: '',
            animating: false,
        }
        this.mount = true
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
        extractHostAndInvitedEventsInfo(this.props.user.socialUID, type)
            .then(hostedAndInvitedEventsList => {
                hostedAndInvitedEventsList = hostedAndInvitedEventsList.filter(event => filterEventsByRSVP(event, type));
                hostedAndInvitedEventsList.length && hostedAndInvitedEventsList.sort((a, b) => a.startDateTimeInUTC - b.startDateTimeInUTC);
                //hostedAndInvitedEventsList.length && hostedAndInvitedEventsList.sort((a, b) => a.startTime - b.startTime);
                console.log("[EventList] all events list", hostedAndInvitedEventsList);
                if (cacheReload) {
                    this.setState({ forceReloadCache: true, eventList: hostedAndInvitedEventsList, unfilteredEventList: hostedAndInvitedEventsList });
                }
                else {
                    this.setState({ eventList: hostedAndInvitedEventsList, unfilteredEventList: hostedAndInvitedEventsList });
                }
            });
    }

    /**
     * @description Show an event information depending upon user role (i.e. Host or Attendee) and event status (e.g. Active)
     * @param {Object<any>} eventData 
     */
    showEventInfo(eventData) {
        const { eventResponse, isHostEvent, keyNode, hostId, isActive, isPastEvent } = eventData;
        console.log("[EventList] whether host event", isHostEvent);
        console.log("[EventList] event id", keyNode);

        if (isHostEvent && !isActive && !isPastEvent) {
            this.props.navigation.navigate({
                routeName: 'EventOverview',
                key: 'EventOverview',
                params: { 
                    eventId: keyNode 
                }
            });
            return;
        }
        else if ((isHostEvent || (!isHostEvent && eventResponse != 'invited')) && isActive && !isPastEvent) {
            this.props.navigation.navigate({
                routeName: 'TabScreen',
                key: 'TabScreen',
                params: { eventId: keyNode, hostId: hostId, isHostUser: isHostEvent, withEvent: eventData }
            });
            return;
        }
        else if (!isHostEvent && (eventResponse == 'invited' || eventResponse == 'maybe' || eventResponse == 'going' || eventResponse == 'declined') && !isPastEvent) {
            this.props.navigation.navigate({
                routeName: 'EventDetail',
                key: 'EventDetail',
                params: { eventId: keyNode, hostId: hostId, reloadEventsFunc: this.reloadEvents.bind(this) }
            });
            return;
        }
        else if (isPastEvent) {
            Alert.alert(
                'Notification!',
                'This event has expired!',
                [
                    { text: 'OK', style: 'default' }
                ]
            );
            return;
        }
    }

    /**
     * @description capture event information back from App bar component (Hacky approach for React)
     */
    captureEventListFromAppBar(data, type) {
        data.length && data.sort((a, b) => moment(b.startDate, 'YYYY-MM-DD') - moment(a.startDate, 'YYYY-MM-DD'));
        data.length && data.sort((a, b) => moment(b.startTime, 'HH:mm A') - moment(a.startTime, 'HH:mm A'));
        console.log("[EventList] from app bar event data", data, type);
        this.setState({ eventList: data, unfilteredEventList: data, activeFilterType: type, animating: false });
    }

    displayEventsFilterView() {
        this.setState({ isSearchViewActive: true });
    }

    loadImagesStart() {
        this.setState({ animating: true });
    }

    loadImagesComplete() {
        this.setState({ animating: false });
    }

    filterEvents(searchText) {
        console.log("[EventList] original events list", this.state.unfilteredEventList);
        const filteredResult = this.state.unfilteredEventList.filter(event => event.eventTitle.includes(searchText));
        this.setState({ eventList: filteredResult });
    }

    clearEventsFilter() {
        this.setState({ isSearchViewActive: false, eventList: this.state.unfilteredEventList });
    }

    onAddEvent() {
        this.props.navigation.navigate({
            routeName: 'AddEvent',
            key: 'AddEvent',
        });
    }

    onMenuPressed() {
        const { navigate } = this.props.navigation;
        navigate({
            routeName: 'Menu',
            key: 'Menu',
        })
    }

    render() {
        return (
            <React.Fragment>
                <Container style={{ backgroundColor: '#ffffff' }}>
                    {this.state.isSearchViewActive ?
                        <React.Fragment>
                            <AppBarComponent fetchEventListFor={this.state.eventListFetchMode} eventListForAttendee={this.captureEventListFromAppBar.bind(this)} />
                            <View style={{ backgroundColor: '#BCE0FD', paddingTop: 10, paddingBottom: 10, marginBottom: 5 }} >
                                <View style={{ flexDirection: 'row', paddingLeft: 15, paddingRight: 15 }} >
                                    <View style={{ flex: 7, position: 'relative' }}>
                                    {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_search_mini} style={{ width: 16, height: 16, position: 'absolute', top: 3, left: 5, zIndex: 9999 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.008 15.007">
                                            <defs>
                                              <style>
                                                .cls-1 {
                                                  fill: #8e8e93;
                                                  stroke: rgba(0,0,0,0);
                                                  fill-rule: evenodd;
                                                }
                                              </style>
                                            </defs>
                                            <path id="Search" class="cls-1" d="M13.743,12.574,9.91,8.74a5.425,5.425,0,0,0,1.05-3.232A5.531,5.531,0,0,0,5.461,0,5.436,5.436,0,0,0,0,5.468a5.532,5.532,0,0,0,5.5,5.508A5.409,5.409,0,0,0,8.742,9.915l0,0,3.83,3.832a.826.826,0,1,0,1.168-1.169ZM5.5,9.878A4.426,4.426,0,0,1,1.1,5.472,4.35,4.35,0,0,1,5.464,1.1,4.426,4.426,0,0,1,9.864,5.5,4.35,4.35,0,0,1,5.5,9.878Z" transform="translate(0.5 0.5)"/>
                                          </svg>
                                          ` }} style={{ width: 16, height: 16, position: 'absolute', top: 3, left: 5, zIndex: 9999 }} />
                                        }
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_close_mini} style={{ width: 16, height: 16, position: 'absolute', right: 5, top: 3, zIndex: 9999 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                            <defs>
                                              <style>
                                                .cls-1 {
                                                  fill: #8e8e93;
                                                  fill-rule: evenodd;
                                                }
                                              </style>
                                            </defs>
                                            <path id="Path_765" data-name="Path 765" class="cls-1" d="M8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM11.277,5.78a.748.748,0,1,0-1.058-1.058L7.995,6.943,5.772,4.722A.748.748,0,0,0,4.713,5.78L6.936,8,4.713,10.22a.748.748,0,1,0,1.059,1.057l2.223-2.22,2.224,2.22a.748.748,0,1,0,1.058-1.057L9.054,8Z"/>
                                          </svg>
                                          ` }} style={{ width: 16, height: 16, position: 'absolute', right: 5, top: 3, zIndex: 9999 }} />
                                        }
                                        <TextInput
                                            style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 5, paddingLeft: 28, paddingRight: 28 }}
                                            placeholder="Search"
                                            value={this.state.searchText}
                                            onChangeText={text => this.filterEvents(text)}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => this.clearEventsFilter()}>
                                        <Text style={{ alignSelf: 'center', fontFamily: 'Lato', fontSize: 17, color: '#004D9B' }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </React.Fragment> :
                        <AppBarComponent isRibbonVisible={true} invalidateCache={this.state.forceReloadCache} fetchEventListFor={this.state.eventListFetchMode} eventListForAttendee={this.captureEventListFromAppBar.bind(this)} />
                    }
                    <Content>
                        {
                            this.state.eventList.length ?
                                this.state.eventList.map((eventData, keyE) => {
                                    // destructure event attributes for ease
                                    const { eventResponse, eventTitle, eventType, startDateTimeInUTC, endDateTimeInUTC, location, invitee, isHostEvent, keyNode, hostId, isActive, isPastEvent } = eventData;
                                    return (
                                        <TouchableOpacity key={keyE} onPress={() => this.showEventInfo(eventData)}>
                                            <View style={styles.eventDetailCard}>
                                                <View style={styles.eventDetail}>
                                                    <View style={styles.cardAvatarWrapper}>
                                                        <View>
                                                            {
                                                                eventData.hostProfileImgUrl ?
                                                                    <View style={styles.cardAvatar}>
                                                                        <Image
                                                                            source={{ uri: eventData.hostProfileImgUrl }}
                                                                            style={{ alignSelf: 'center', width: 85, height: 85, borderRadius: 85 / 2 }}
                                                                            onLoadEnd={() => this.loadImagesComplete()}
                                                                            onLoadStart={() => this.loadImagesStart()}
                                                                        />
                                                                    </View>
                                                                    :
                                                                    <View style={styles.cardAvatar}>
                                                                        <Image
                                                                            source={IconsMap.icon_contact_avatar}
                                                                            style={{ alignSelf: 'center', width: 85, height: 85, borderRadius: 85 / 2 }}
                                                                        />
                                                                    </View>
                                                            }
                                                        </View>
                                                        <View style={{ paddingTop: 1 }}>
                                                            <Text style={styles.eventHostName}>{eventData.hostName}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.cardDetail}>
                                                        <View>
                                                            <Text style={styles.eventTitle}>
                                                                {eventTitle}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.eventMetaWrapper}>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ color: '#FC3764', fontSize: 12, fontFamily: 'Lato', marginTop: -10 }}>
                                                                    {moment.utc(startDateTimeInUTC).local().format('MMM')}
                                                                </Text>
                                                                <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Lato', color: '#1D6CBC' }}>
                                                                    {moment.utc(startDateTimeInUTC).local().format('DD')}
                                                                </Text>
                                                            </View>
                                                            <View style={{ flex: 4 }}>
                                                                <Text style={{ fontSize: 12, fontFamily: 'Lato', color: '#000000' }}>{moment.utc(startDateTimeInUTC).local().format('hh:mm A')} - {moment.utc(endDateTimeInUTC).local().format('hh:mm A')}</Text>
                                                                <Text style={{ fontFamily: 'Lato', fontSize: 12, fontWeight: '700', color: '#000000', marginTop: 10 }}>{location}</Text>
                                                            </View>
                                                            <View style={{ flex: 1.8, marginLeft: 15 }}>
                                                                {eventResponse == 'host' || eventResponse == 'going' ?
                                                                    <Text style={{ fontSize: 13, fontFamily: 'Lato', color: eventStatusColor.goingOrHost, textAlign: 'center' }}>{`${eventResponse.slice(0, 1).toUpperCase()}${eventResponse.slice(1, eventResponse.length)}`}</Text> :
                                                                    eventResponse == 'invited' || eventResponse == 'maybe' ?
                                                                        <Text style={{ fontSize: 13, fontFamily: 'Lato', color: eventStatusColor.invitedOrMaybe, textAlign: 'center' }}>{`${eventResponse.slice(0, 1).toUpperCase()}${eventResponse.slice(1, eventResponse.length)}`}</Text> :
                                                                        <Text style={{ fontSize: 13, fontFamily: 'Lato', color: eventStatusColor.declined, textAlign: 'center' }}>{`${eventResponse.slice(0, 1).toUpperCase()}${eventResponse.slice(1, eventResponse.length)}`}</Text>
                                                                }
                                                                {isActive ? <Text style={{ fontSize: 13, fontFamily: 'Lato', color: 'white', padding: 4, backgroundColor: '#FF003B', textAlign: 'center', position: 'relative', left: -5 }}>Active!</Text> : null}
                                                                <Text style={{ fontSize: 12, fontFamily: 'Lato', color: '#004D9B', textAlign: 'center', position: 'relative', left: 0, top: 40 }}>{eventType}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={styles.invitees}>
                                                    {invitee ?
                                                        <List dataArray={invitee} horizontal={true} style={{ marginTop: 20 }}
                                                            renderRow={(item) =>
                                                                <ListItem style={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0, paddingBottom: 0, marginLeft: 5, borderBottomWidth: 0 }}>
                                                                    {
                                                                        item.profileImgUrl ?
                                                                            <Image source={{ uri: item.profileImgUrl }} style={{ width: 48, height: 48, borderRadius: 24 }} onLoadEnd={() => this.loadImagesComplete()} onLoadStart={() => this.loadImagesStart()} /> :
                                                                            <Image source={IconsMap.icon_contact_avatar} style={{ width: 48, height: 48, borderRadius: 24 }} />
                                                                    }
                                                                </ListItem>
                                                            }>
                                                        </List> : null}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )

                                })
                                : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ textAlign: 'center', textAlignVertical: 'center' }}>No events to show right now</Text></View>
                        }
                    </Content>
                    {Platform.OS === 'ios'?
                    <Footer style={styles.bottomView_ios}>
                        <Left>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate({
                                    routeName: 'NearbyEvents',
                                    key: 'NearbyEvents',
                                })}
                                style={styles.fabLeftWrapperStyles}
                            >
                                {Platform.OS === 'ios'?
                                    <Image source={IconsMap.icon_map} style={styles.fabStyles} />:
                                    <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-2 {
                                          fill: #2699fb;
                                        }
                                  
                                        .cls-3 {
                                          filter: url(#Ellipse_368);
                                        }
                                      </style>
                                      <filter id="Ellipse_368" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="btn_EventMap" transform="translate(-865 -525)">
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 865, 525)">
                                        <circle id="Ellipse_368-2" data-name="Ellipse 368" class="cls-1" cx="21" cy="21" r="21" transform="translate(9 6)"/>
                                      </g>
                                      <path id="Path_760" data-name="Path 760" class="cls-2" d="M6.3,6.3A19.064,19.064,0,0,1,21,0,19.064,19.064,0,0,1,35.7,6.3,19.064,19.064,0,0,1,42,21a19.064,19.064,0,0,1-6.3,14.7A19.064,19.064,0,0,1,21,42,19.064,19.064,0,0,1,6.3,35.7C2.45,31.5,0,26.95,0,21A19.064,19.064,0,0,1,6.3,6.3ZM23.8,37.8q2.1,0,5.25-3.15A15.287,15.287,0,0,0,31.5,27.3a5.8,5.8,0,0,0-1.75-4.2A6.161,6.161,0,0,0,25.2,21H21.7a10.22,10.22,0,0,1-3.15-.7,3.177,3.177,0,0,1-1.05-2.45,1.818,1.818,0,0,1,.7-1.4,2.653,2.653,0,0,1,1.4-.7,2.389,2.389,0,0,1,1.75,1.05c.7.35,1.05.7,1.4.7a2.1,2.1,0,0,0,1.4-.35,2.1,2.1,0,0,0,.35-1.4,5.57,5.57,0,0,0-1.75-3.5A14.477,14.477,0,0,0,24.5,5.6a.753.753,0,0,0-.7-.7A10.82,10.82,0,0,0,21,4.2c-3.85.35-6.65,1.05-9.1,2.8a8.812,8.812,0,0,0-3.15,7,8.962,8.962,0,0,0,2.8,6.65,9.562,9.562,0,0,0,6.65,2.8h0v1.4a4.494,4.494,0,0,0,1.4,3.5,5.1,5.1,0,0,0,3.15,2.1v6.3c0,.35,0,.35.35.7S23.45,37.8,23.8,37.8Z" transform="translate(874 531)"/>
                                    </g>
                                  </svg>
                                  ` }} style={styles.fabStyles} />
                                }
                            </TouchableOpacity>
                        </Left>
                        <Body>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate({
                                    routeName: 'AddEvent',
                                    key: 'AddEvent',
                                })}
                                style={{ position: 'absolute', bottom: -30, left: 30 }}
                            >
                                {Platform.OS === 'ios'?
                                    <Image source={IconsMap.icon_add_circle} style={styles.fabStyles} />:
                                    <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
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
                                  </svg>
                                  ` }} style={styles.fabStyles} />
                                }
                            </TouchableOpacity>
                        </Body>
                        <Right>
                            <TouchableOpacity
                                style={styles.fabRightWrapperStyles}
                                onPress={() => this.displayEventsFilterView()}
                            >
                                {Platform.OS === 'ios'?
                                    <Image source={IconsMap.icon_search} style={styles.fabStyles} />:
                                    <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #2699fb;
                                        }
                                  
                                        .cls-2 {
                                          fill: #fff;
                                          stroke: rgba(0,0,0,0);
                                          fill-rule: evenodd;
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
                                    <g id="btn_Search" transform="translate(-303 -615)">
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 303, 615)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                      </g>
                                      <path id="Search" class="cls-2" d="M23.737,21.719,17.117,15.1A9.372,9.372,0,0,0,18.93,9.513,9.554,9.554,0,0,0,9.432,0,9.389,9.389,0,0,0,0,9.445a9.555,9.555,0,0,0,9.5,9.514,9.341,9.341,0,0,0,5.6-1.834l.007-.005,6.614,6.618a1.428,1.428,0,1,0,2.017-2.019ZM9.493,17.062a7.644,7.644,0,0,1-7.6-7.61A7.513,7.513,0,0,1,9.438,1.9a7.644,7.644,0,0,1,7.6,7.61,7.513,7.513,0,0,1-7.544,7.556Z" transform="translate(321 627)"/>
                                    </g>
                                  </svg>
                                  ` }} style={styles.fabStyles} />
                                }
                            </TouchableOpacity>
                        </Right>
                    </Footer>:
                    <View style={styles.bottomView_android}>
                    <Left>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('NearbyEvents')}
                            style={styles.fabLeftWrapperStyles}
                        >
                            {Platform.OS === 'ios'?
                                <Image source={IconsMap.icon_map} style={styles.fabStyles} />:
                                <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #fff;
                                    }
                              
                                    .cls-2 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-3 {
                                      filter: url(#Ellipse_368);
                                    }
                                  </style>
                                  <filter id="Ellipse_368" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                    <feOffset dy="3" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="btn_EventMap" transform="translate(-865 -525)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 865, 525)">
                                    <circle id="Ellipse_368-2" data-name="Ellipse 368" class="cls-1" cx="21" cy="21" r="21" transform="translate(9 6)"/>
                                  </g>
                                  <path id="Path_760" data-name="Path 760" class="cls-2" d="M6.3,6.3A19.064,19.064,0,0,1,21,0,19.064,19.064,0,0,1,35.7,6.3,19.064,19.064,0,0,1,42,21a19.064,19.064,0,0,1-6.3,14.7A19.064,19.064,0,0,1,21,42,19.064,19.064,0,0,1,6.3,35.7C2.45,31.5,0,26.95,0,21A19.064,19.064,0,0,1,6.3,6.3ZM23.8,37.8q2.1,0,5.25-3.15A15.287,15.287,0,0,0,31.5,27.3a5.8,5.8,0,0,0-1.75-4.2A6.161,6.161,0,0,0,25.2,21H21.7a10.22,10.22,0,0,1-3.15-.7,3.177,3.177,0,0,1-1.05-2.45,1.818,1.818,0,0,1,.7-1.4,2.653,2.653,0,0,1,1.4-.7,2.389,2.389,0,0,1,1.75,1.05c.7.35,1.05.7,1.4.7a2.1,2.1,0,0,0,1.4-.35,2.1,2.1,0,0,0,.35-1.4,5.57,5.57,0,0,0-1.75-3.5A14.477,14.477,0,0,0,24.5,5.6a.753.753,0,0,0-.7-.7A10.82,10.82,0,0,0,21,4.2c-3.85.35-6.65,1.05-9.1,2.8a8.812,8.812,0,0,0-3.15,7,8.962,8.962,0,0,0,2.8,6.65,9.562,9.562,0,0,0,6.65,2.8h0v1.4a4.494,4.494,0,0,0,1.4,3.5,5.1,5.1,0,0,0,3.15,2.1v6.3c0,.35,0,.35.35.7S23.45,37.8,23.8,37.8Z" transform="translate(874 531)"/>
                                </g>
                              </svg>
                              ` }} style={styles.fabStyles} />
                            }
                        </TouchableOpacity>
                    </Left>
                    <Body>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('AddEvent')}
                            style={{ position: 'absolute', bottom: -30, left: 30 }}
                        >
                            {Platform.OS === 'ios'?
                                <Image source={IconsMap.icon_add_circle} style={styles.fabStyles} />:
                                <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
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
                              </svg>
                              ` }} style={styles.fabStyles} />
                            }
                        </TouchableOpacity>
                    </Body>
                    <Right>
                        <TouchableOpacity
                            style={styles.fabRightWrapperStyles}
                            onPress={() => this.displayEventsFilterView()}
                        >
                            {Platform.OS === 'ios'?
                                <Image source={IconsMap.icon_search} style={styles.fabStyles} />:
                                <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-2 {
                                      fill: #fff;
                                      stroke: rgba(0,0,0,0);
                                      fill-rule: evenodd;
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
                                <g id="btn_Search" transform="translate(-303 -615)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 303, 615)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                  </g>
                                  <path id="Search" class="cls-2" d="M23.737,21.719,17.117,15.1A9.372,9.372,0,0,0,18.93,9.513,9.554,9.554,0,0,0,9.432,0,9.389,9.389,0,0,0,0,9.445a9.555,9.555,0,0,0,9.5,9.514,9.341,9.341,0,0,0,5.6-1.834l.007-.005,6.614,6.618a1.428,1.428,0,1,0,2.017-2.019ZM9.493,17.062a7.644,7.644,0,0,1-7.6-7.61A7.513,7.513,0,0,1,9.438,1.9a7.644,7.644,0,0,1,7.6,7.61,7.513,7.513,0,0,1-7.544,7.556Z" transform="translate(321 627)"/>
                                </g>
                              </svg>
                              ` }} style={styles.fabStyles} />
                            }
                        </TouchableOpacity>
                    </Right>
                </View>}
                </Container>
                {this.state.animating &&
                    <View style={styles.overlay}>
                        <Spinner
                            color={'lightgoldenrodyellow'}
                            style={styles.spinner} />
                    </View>
                }
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    eventDetailCard: {
        borderBottomWidth: 2,
        borderBottomColor: '#D8D8D8',
    },
    eventDetail: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: 2,
        paddingRight: 12
    },
    eventInvitee: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: 2,
        paddingRight: 12
    },
    cardAvatarWrapper: {
        flex: 1,
        justifyContent: 'flex-start'
    },
    cardDetail: {
        flex: 3,
        justifyContent: 'flex-start',
        marginLeft: 20
    },
    invitees: {
        marginTop: 20,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    cardAvatar: {
        shadowOffset: { width: 5, height: 5 },
        shadowColor: '#000000',
        shadowOpacity: 0.125,
        shadowRadius: 8
    },
    eventHostName: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Lato',
        color: '#000000'
    },
    eventTitle: {
        fontSize: 16,
        fontFamily: 'Lato',
        fontWeight: 'bold',
        color: '#004D9B',
        marginTop: 5
    },
    eventMetaWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: 20
    },
    bottomView_ios: {
        height: 50,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bottomView_android: {
        width: '100%',
        height: 70,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    fabLeftWrapperStyles: {
        position: 'absolute',
        bottom: -27,
        left: 20
    },
    fabRightWrapperStyles: {
        position: 'absolute',
        bottom: -30,
        right: 20
    },
    fabStyles: {
        width: 60,
        height: 60
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)'
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.auth.user,
        event: state.event.details,
        indicatorShow: state.auth.indicatorShow,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventList);