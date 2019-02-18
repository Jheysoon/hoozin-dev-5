import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Left, Body, Icon, Item, List, ListItem, Spinner } from 'native-base'
import Image from 'react-native-remote-svg'

import { IconsMap } from 'assets/assetMap'

export default class ActiveMapHeader extends Component {
    render() {
        return (
            <View style={{ zIndex: 99 }}>
                {this.props.showEventAttendees ?
                    <Item style={{ width: '100%', height: 30, backgroundColor: '#FC3764', marginLeft: 0, paddingTop: 4, paddingBottom: 4, paddingLeft: 14, paddingRight: 14, zIndex: 99999, justifyContent: 'flex-start', flexWrap: 'nowrap', display: 'flex' }}>
                        <Icon type="FontAwesome" name="exclamation" style={{ color: '#ffffff' }} />
                        <Body>
                            <Text style={{ color: '#ffffff', textAlign: 'center', fontFamily: 'Lato', fontSize: 11 }}>This event is Active. Your location is shared with the group</Text>
                        </Body>
                    </Item> : null}

                <View style={{ width: '100%', padding: 4, backgroundColor: '#ffffff', zIndex: 99999 }}>
                    <Item style={{ justifyContent: 'flex-start', borderBottomWidth: 0 }}>
                        <Left style={{ flex: 0.5 }}>
                            <TouchableOpacity onPress={
                                () => this.props.navInstance.navigate({
                                    // 'EventActiveUser', 
                                    routeName: 'EventActiveUser',
                                    key: 'EventActiveUser',
                                    params: { 
                                        eventAndHostData: this.props.eventAndHostData, 
                                        mapCallback: this.props.mapCallback.bind(this), 
                                        callbackTo: this.props.callbackTo.bind(this), 
                                        eventPhotos: this.props.eventPhotos, 
                                        isHostUser: this.props.eventAndHostData.isHostUser, 
                                        hostId: this.props.eventAndHostData.hostId, 
                                        eventId: this.props.eventAndHostData.eventId, 
                                        hostUserLocationWatcher: this.props.hostUserLocationWatcher, 
                                        attendeeLocationWatcher: this.props.attendeeLocationWatcher, 
                                        navStackDepth: this.props.navStackDepth + 1, 
                                        activeMapScreenKey: this.props.activeMapScreenKey, 
                                        chatCounter: this.props.chatCounter, 
                                        resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this) 
                                    }})
                                }
                            >
                                {this.props.eventAndHostData && this.props.eventAndHostData.hostProfileImgUrl ?
                                    <Image source={{ uri: this.props.eventAndHostData.hostProfileImgUrl }} style={{ width: 70, height: 70, borderRadius: 35 }} /> :
                                    <Image source={IconsMap.icon_contact_avatar} style={{ width: 70, height: 70, borderRadius: 35 }} />
                                }
                            </TouchableOpacity>
                        </Left>
                        <Body style={{ flex: 2, alignItems: 'flex-start', alignSelf: 'flex-start' }}>
                            {/* <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 16, fontWeight: '700', color: '#004D9B' }}>{this.props.eventAndHostData.eventTitle}</Text>
                            <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 14, fontWeight: '400', color: '#000000' }}>{this.props.eventAndHostData.hostName}</Text> */}
                        </Body>
                    </Item>

                    {this.props.showEventAttendees ?
                        <Item style={{ borderBottomWidth: 0 }}>
                            {this.props.eventAndHostData && this.props.eventAndHostData.invitee ?
                                <List dataArray={this.props.eventAndHostData.invitee} horizontal={true}
                                    renderRow={(item) =>
                                        <ListItem style={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0, paddingBottom: 0, marginLeft: 5, borderBottomWidth: 0 }}>
                                            {item.profileImgUrl ?
                                                <Image source={{ uri: item.profileImgUrl }} style={{ width: 48, height: 48, borderRadius: 24 }} /> :
                                                <Image source={IconsMap.icon_contact_avatar} style={{ width: 48, height: 48, borderRadius: 24 }} />
                                            }
                                        </ListItem>
                                    }>
                                </List> : null}
                        </Item> : null}
                </View>
            </View>
        )
    }
}
