import React, { Component } from 'react'
import { TouchableOpacity, StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Content, Footer, Left, Body, Right, Item } from 'native-base';
import { connect } from 'react-redux';
import { filterInviteeByRSVP } from '../../utils/eventListFilter';

import AppBarComponent from '../../components/AppBar/appbar.index';
import { EventServiceAPI, UserManagementServiceAPI } from '../../api';
import { IconsMap } from 'assets/assetMap';

const inviteeStatusMarker = { going: 'rgba(110, 178, 90, 0.55)', invited: 'rgba(239, 154, 18, 0.55)', declined: 'rgba(255, 0, 59, 0.55)' };

/* Redux container component to present a detailed view of the created event */
class EventActiveAttendeesContainer extends Component {
    static navigationOptions = {
        header: null
    };
    constructor() {
        super()
        this.state = {
            eventData: {},
            filteredInvitedList: [],
            unfilteredInviteeList: [],
            hostUserFriends: [],
            prevTextElemRef: null,
            prevBarElemRef: null,
            prevBarElemColor: null,
            hostId: '',
            hostUserName: '',
            hostProfileImgUrl: '',
            animating: true,
            currentNavStackDepth: 0,
            chats: [],
            chatCounter: 0
        }
    }
    componentDidMount() {
        const { params } = this.props.screenProps.rootNav.state;
        if (!!params && !!params.hostId && !!params.eventId) {
            this.getEventInformation(params.eventId, params.hostId, 0, params.isHostUser);
        }
    }

    async getEventInformation(eventKey, hostId, navStackDepth, isHostUser) {
        const eventSvc = new EventServiceAPI();
        const userSvc = new UserManagementServiceAPI();

        const eventData = await eventSvc.getEventDetailsAPI2(eventKey, hostId);
        const hostUserData = await userSvc.getUserDetailsAPI(hostId);
        const currentUserFriends = await userSvc.getUsersFriendListAPI(this.props.user.socialUID);
        //console.log("friends for invitee", currentUserFriends);
        //this.resetUnreadMsgCount();

        if (eventData && hostUserData && currentUserFriends) {
            eventData.invitee = Object.keys(eventData.invitee).map(inviteeUserKey => {
                eventData.invitee[inviteeUserKey]['inviteeId'] = inviteeUserKey;
                return eventData.invitee[inviteeUserKey]
            });

            const invitees = eventData.invitee.map(invitee => ({ inviteeId: invitee.inviteeId, status: invitee.status }));
            const currentUsrFrnds = currentUserFriends.filter(friend => {
                // if (friend.eventList) {
                //     return friend.eventList.filter(event => {
                //         if (event.eventId == eventKey) {
                //             friend['status'] = 'maybe';
                //             return true;
                //         }
                //     }).length > 0
                // }
                // else if (friend.event) {
                //     if (Object.keys(friend.event).includes(eventKey)) {
                //         friend['status'] = 'going';
                //         return true;
                //     }
                // }
                return invitees.filter(invitee => {
                    if (invitee.inviteeId == friend.id) {
                        friend['status'] = invitee.status;
                        return true;
                    }
                }).length > 0

            });
            eventData['eventId'] = eventKey;
            this.filterEventInviteesByRSVP('all', this.refs.textForStatusAll, this.refs.activeBarForStatusAll, 'hsla(207, 97%, 75%, 1)');
            this.setState({ eventData: eventData, unfilteredInviteeList: eventData.invitee, filteredInvitedList: eventData.invitee, currentUserFriends: currentUsrFrnds, hostId: hostId, hostUserName: hostUserData.name, hostProfileImgUrl: hostUserData.profileImgUrl || '', animating: false, currentNavStackDepth: navStackDepth + 1 });

            //this.getUnreadChatMsgCount(hostId, eventKey, isHostUser);
            //this.watchForIncomingChats(hostId, eventKey, isHostUser);

        }
        else {
            this.setState({ animating: false });
            Alert.alert(
                'Content unavailable!',
                'It seems we are having trouble getting requested information',
                [
                    {
                        text: 'Retry again',
                        onPress: () => {
                            this.setState({ animating: true });
                            return this.getEventInformation(eventKey, hostId);
                        }
                    }
                ]
            );
        }
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
    * @description filter event invitees by RSVP status
    * @param {string} responseStatus 
    */
    filterEventInviteesByRSVP(responseStatus, textElemRef, barElemRef, currentColor) {
        let filteredInvitee = [];
        if (responseStatus != 'friends') {
            filteredInvitee = this.state.unfilteredInviteeList.filter(invitee => filterInviteeByRSVP(invitee, responseStatus));
        }
        else {
            filteredInvitee = this.state.currentUserFriends;
        }
        this.setState({ filteredInvitedList: filteredInvitee, prevTextElemRef: textElemRef, prevBarElemColor: currentColor, prevBarElemRef: barElemRef });
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

    showUserProfile(userId, eventId, hostId) {
        // this.props.navigation.navigate({
        //     routeName: 'EventActiveUser',
        //     key: 'EventActiveUser',
        //     params: { 
        //         hostId: userId, 
        //         eventId: eventId, 
        //         eventHostId: hostId, 
        //         // eventAndHostData: this.props.navigation.state.params.eventAndHostData, 
        //         // mapCallback: this.props.navigation.state.params.mapCallbackFn.bind(this), 
        //         // callbackTo: this.props.navigation.state.params.callbackFn.bind(this), 
        //         // eventPhotos: this.props.navigation.state.params.eventPhotos 
        //     }});

        this.props.navigation.navigate('EventActiveUser', { withUser: userId });
    }

    showInviteeLocation(inviteeId) {
        // if (this.props.navigation.state.params) {
        //     const { callbackFn, eventAndHostData, navStackDepth, inviteeLocationcallback, activeMapScreenKey } = this.props.navigation.state.params;

        //     console.log("++ invitee location callback ++", inviteeLocationcallback);
        //     inviteeLocationcallback?inviteeLocationcallback(inviteeId):callbackFn(inviteeId);

        //     if (this.state.currentNavStackDepth == 2) {
        //         this.props.navigation.goBack();
        //     }
        //     else if (this.state.currentNavStackDepth > 2) {
        //         this.props.navigation.goBack(activeMapScreenKey);
        //     }
        // }
        if (this.props.screenProps.rootNav.state.params) {
            const { callbackFn, inviteeLocationcallback, activeMapScreenKey, navStackDepth } = this.props.screenProps.rootNav.state.params;
            const { hostId, eventId, isHostUser } = this.props.screenProps.rootNav.state.params;

            //// CHANGED ON: 29th October, 2018
            // console.log("++ invitee location callback ++", inviteeLocationcallback);
            // inviteeLocationcallback?inviteeLocationcallback(inviteeId):callbackFn(inviteeId);

            // if (this.state.currentNavStackDepth == 2) {
            //     this.props.navigation.goBack();
            // }
            // else if (this.state.currentNavStackDepth > 2) {
            //     this.props.navigation.navigate('EventActiveMap', { eventId, hostId, isHostUser, navStackDepth: this.state.currentNavStackDepth, resetMsgCounterCallbackTo: this.resetUnreadMsgCount.bind(this), key: 'map' });
            // }

            this.props.navigation.navigate('EventActiveMap', { eventId, hostId, isHostUser, navStackDepth: this.state.currentNavStackDepth, showInviteeLocation: true, withInviteeId: inviteeId, key: 'map' });
        }
    }

    render() {
        return (
            <Container style={{ backgroundColor: '#ffffff' }}>
                <AppBarComponent showBackBtnCircle={true} skipCacheBurst={true} withNav={this.props.screenProps.rootNav} />
                <View style={{ zIndex: 99 }}>
                    <View style={{ width: '100%', padding: 4, backgroundColor: '#ffffff', zIndex: 99999 }}>
                    <Item style={{ justifyContent: 'flex-start', borderBottomWidth: 0 }}>
                            <Left style={{ flex: 0.5 }}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('EventActiveUser', { withEvent: this.state.eventData })}
                                >
                                    {this.state.eventData && this.state.hostProfileImgUrl ?
                                        <Image source={{ uri: this.state.hostProfileImgUrl }} style={{ width: 70, height: 70, borderRadius: 35 }} /> :
                                        <Image source={IconsMap.icon_contact_avatar} style={{ width: 70, height: 70, borderRadius: 35 }} />
                                    }
                                </TouchableOpacity>
                            </Left>
                            <Body style={{ flex: 2, alignItems: 'flex-start', alignSelf: 'flex-start' }}>
                                <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 16, fontWeight: '700', color: '#004D9B' }}>{this.state.eventData.eventTitle}</Text>
                                <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 14, fontWeight: '400', color: '#000000' }}>{this.state.hostUserName}</Text>
                            </Body>
                        </Item>
                    </View>
                </View>
                <View style={{ position: 'relative', zIndex: 9999 }}>
                {Platform.OS === 'ios'?
                        <Image source={IconsMap.icon_active_attendee_no_circle} style={{ position: 'absolute', right: 10, top: -13, zIndex: 999999 }} />:
                        <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37.568 21">
                        <defs>
                          <style>
                            .cls-1 {
                              fill: #bce0fd;
                            }
                      
                            .cls-2 {
                              fill: #7fc4fd;
                            }
                      
                            .cls-3 {
                              fill: #2699fb;
                            }
                          </style>
                        </defs>
                        <g id="Group_1301" data-name="Group 1301" transform="translate(-330 -115)">
                          <g id="Group_1027" data-name="Group 1027" transform="translate(346 115)">
                            <path id="Rectangle_31" data-name="Rectangle 31" class="cls-1" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                            <circle id="Ellipse_14" data-name="Ellipse 14" class="cls-1" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                          </g>
                          <g id="Group_1029" data-name="Group 1029" transform="translate(338 115)">
                            <path id="Rectangle_31-2" data-name="Rectangle 31" class="cls-2" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                            <circle id="Ellipse_14-2" data-name="Ellipse 14" class="cls-2" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                          </g>
                          <g id="Group_1030" data-name="Group 1030" transform="translate(330 115)">
                            <path id="Rectangle_31-3" data-name="Rectangle 31" class="cls-3" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                            <circle id="Ellipse_14-3" data-name="Ellipse 14" class="cls-3" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                          </g>
                        </g>
                      </svg>
                      ` }} style={{ position: 'absolute', top: -45, right: 5, width: 70, zIndex: 999999 }} />
                    }
                </View>
                <View style={{ width: '90%', height: 1, backgroundColor: '#BCE0FD', zIndex: 9999, position: 'relative', left: 14 }}></View>
                <View style={{ position: 'relative', left: 16 }}>
                    <ScrollView horizontal={true}>
                        <View>
                            <TouchableOpacity style={styles.btnGroups} onPress={() => this.filterEventInviteesByRSVP('all', this.refs.textForStatusAll, this.refs.activeBarForStatusAll, 'hsla(207, 97%, 75%, 1)')}>
                                <Text ref="textForStatusAll" style={styles.btnGroupTxt}>All</Text>
                            </TouchableOpacity>
                            <View ref="activeBarForStatusAll" style={{ height: 3, width: '100%', backgroundColor: 'hsla(207, 97%, 75%, 1)' }}></View>
                        </View>
                        <View>
                            <TouchableOpacity style={styles.btnGroups} onPress={() => this.filterEventInviteesByRSVP('accepted', this.refs.textForStatusAccepted, this.refs.activeBarForStatusAccepted, 'hsla(106, 36%, 52%, 1)')}>
                                <Text ref="textForStatusAccepted" style={styles.btnGroupTxt}>Accepted</Text>
                            </TouchableOpacity>
                            <View ref="activeBarForStatusAccepted" style={{ height: 3, width: '100%', backgroundColor: 'hsla(106, 36%, 52%, 1)' }}></View>
                        </View>
                        <View>
                            <TouchableOpacity style={styles.btnGroups} onPress={() => this.filterEventInviteesByRSVP('maybe', this.refs.textForStatusInvited, this.refs.activeBarForStatusInvited, 'hsla(37, 87%, 50%, 1)')}>
                                <Text ref="textForStatusInvited" style={styles.btnGroupTxt}>Maybe</Text>
                            </TouchableOpacity>
                            <View ref="activeBarForStatusInvited" style={{ height: 3, width: '100%', backgroundColor: 'hsla(37, 87%, 50%, 1)' }}></View>
                        </View>
                        <View>
                            <TouchableOpacity style={styles.btnGroups} onPress={() => this.filterEventInviteesByRSVP('declined', this.refs.textForStatusDeclined, this.refs.activeBarForStatusDeclined, 'hsla(346, 100%, 50%, 1)')}>
                                <Text ref="textForStatusDeclined" style={styles.btnGroupTxt}>Declined</Text>
                            </TouchableOpacity>
                            <View ref="activeBarForStatusDeclined" style={{ height: 3, width: '100%', backgroundColor: 'hsla(346, 100%, 50%, 1)' }}></View>
                        </View>
                        <View>
                            <TouchableOpacity style={styles.btnGroups} onPress={() => this.filterEventInviteesByRSVP('friends', this.refs.textForStatusFriends, this.refs.activeBarForStatusFriends, 'hsla(208, 96%, 57%, 1)')}>
                                <Text ref="textForStatusFriends" style={styles.btnGroupTxt}>Friends</Text>
                            </TouchableOpacity>
                            <View ref="activeBarForStatusFriends" style={{ height: 3, width: '100%', backgroundColor: 'hsla(208, 96%, 57%, 1)' }}></View>
                        </View>
                    </ScrollView>
                </View>
                <Content>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                        <View style={{ flex: 18 }}>
                            {
                                this.state.filteredInvitedList && this.state.filteredInvitedList.length > 0 ?
                                    this.state.filteredInvitedList.map((data, key) => {
                                        return (
                                            <View style={{
                                                width: '95%',
                                                marginLeft: 5,
                                                paddingTop: 3,
                                                borderBottomWidth: 0,
                                                borderBottomColor: '#D8D8D8',
                                                borderWidth: 0,
                                                borderRadius: 2,
                                                borderColor: '#D8D8D8',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 2,
                                                elevation: 1,
                                            }} key={key}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center', backgroundColor: 'white',
                                                    borderRadius: 40, marginLeft: 2,
                                                }}>
                                                    <View style={{ flex: 1 }}>
                                                        {
                                                            data.profileImgUrl ?
                                                                <TouchableOpacity onPress={() => this.showUserProfile(data.inviteeId || data.userId, this.state.eventData.eventId, this.state.hostId)}>
                                                                    <Image
                                                                        source={{ uri: data.profileImgUrl }}
                                                                        style={{ alignSelf: 'center', width: 40, height: 40, borderRadius: 20 }}
                                                                    />
                                                                </TouchableOpacity>
                                                                :
                                                                <TouchableOpacity onPress={() => this.showUserProfile(data.inviteeId || data.userId, this.state.eventData.eventId, this.state.hostId)}>
                                                                    <Image
                                                                        source={IconsMap.icon_contact_avatar}
                                                                        style={{ alignSelf: 'center', width: 40, height: 40, borderRadius: 20, left: -4, top: 0 }}
                                                                    />
                                                                </TouchableOpacity>
                                                        }
                                                    </View>
                                                    <View style={{ flex: 4, justifyContent: 'center' }}>
                                                        <Text style={data.colorChange ? { fontSize: 17, color: 'red' } : { fontSize: 17, position: 'relative', left: 0 }}>{data.name}</Text>
                                                    </View>
                                                    <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'center', position: 'relative', left: -3, top: 8 }}>
                                                        <TouchableOpacity style={{ marginRight: 4 }} onPress={() => this.showInviteeLocation(data.inviteeId || data.userId)}>
                                                        {Platform.OS === 'ios'?
                                                                <Image source={IconsMap.icon_location_pin} style={{ width: 26, height: 26 }} />:
                                                                <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                                                <defs>
                                                                  <style>
                                                                    .cls-1 {
                                                                      fill: none;
                                                                    }
                                                              
                                                                    .cls-2 {
                                                                      fill: #2699fb;
                                                                      fill-rule: evenodd;
                                                                    }
                                                                  </style>
                                                                </defs>
                                                                <g id="Places" transform="translate(-207 -596)">
                                                                  <rect id="Rectangle_305" data-name="Rectangle 305" class="cls-1" width="16" height="16" transform="translate(207 596)"/>
                                                                  <path id="Path_114" data-name="Path 114" class="cls-2" d="M6.58,9.47A2.786,2.786,0,0,0,9.371,6.679,2.872,2.872,0,0,0,6.58,3.788,2.786,2.786,0,0,0,3.788,6.579,2.942,2.942,0,0,0,6.58,9.47ZM1.894,1.894a6.626,6.626,0,0,1,9.371,9.371L6.58,15.95,1.894,11.265A6.807,6.807,0,0,1,1.894,1.894Z" transform="translate(207.975 596.05)"/>
                                                                </g>
                                                              </svg>
                                                              ` }} style={{ width: 26, height: 26 }} />
                                                            }
                                                        </TouchableOpacity>
                                                        {data.status == 'invited' || data.status == 'maybe' ?
                                                            <View style={{ width: 25, height: 25, borderRadius: 12.5, backgroundColor: inviteeStatusMarker.invited, position: 'relative', left: 20 }}></View> :
                                                            data.status == 'going' || data.status == 'accepted' ?
                                                                <View style={{ width: 25, height: 25, borderRadius: 12.5, backgroundColor: inviteeStatusMarker.going, position: 'relative', left: 20 }}></View> :
                                                                <View style={{ width: 25, height: 25, borderRadius: 12.5, backgroundColor: inviteeStatusMarker.declined, position: 'relative', left: 20 }}></View>
                                                        }
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    }) : null
                            }
                        </View>
                    </View>
                </Content>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    fabContainer: {
        height: 50,
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    fabLeftWrapperStyles: {
        position: 'absolute',
        bottom: -30,
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
    btnGroups: {
        paddingTop: 6,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#ffffff'
    },
    btnGroupTxt: {
        color: '#004D9B'
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
        onShowIndicator: (bShow) => { dispatch(setVisibleIndicator(bShow)) }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EventActiveAttendeesContainer);