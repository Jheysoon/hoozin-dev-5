import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MapView from 'react-native-maps';
import { connect } from 'react-redux';
import moment from 'moment';
import firebase from "react-native-firebase";
import AppBarComponent from '../../components/AppBar';
import { iconsMap } from 'assets/assetMap';
// Action creators
import { removeEventDataAction } from '../../actions/event';
import { setVisibleIndicatorAction } from '../../actions/auth'

class ConfirmEvent extends Component{
    static navigationOptions = {
        header: null
    };
    constructor(){
        super();
        this.state = {
            searchText: '',
            contactList: [],
            eventData: {},
            eventId: "",
            editMode: false,
            defaultOrEventLocation: { 
                latitude: 37.78825, 
                longitude: -122.4324, 
                latitudeDelta: 0.0922, 
                longitudeDelta: 0.0421
            }
        }
    }
    componentDidMount(){
        const { params } = this.props.navigation.state;

        if(!!params && !! params.eventId) {
            this.getEventInformation(params.eventId);
            this.setState({ eventId: params.eventId, editMode: params.isEditMode });
        }
    }

    // Lifecycle during update
    componentWillReceiveProps(nextProps) {
       this.setState({
           contactList: []
       });
       this.props.navigation.replace('NearbyEvents');
    }

    /**
     * @description Fetches requested / current event information
     * @param {string} eventKey 
     */
    getEventInformation(eventKey) {
        return firebase.database().ref(`users/${this.props.user.socialUID}/event/${eventKey}`)
            .orderByChild("name")
            .once("value")
            .then(snapshot => {
                if(snapshot._value) {
                    let eventData = snapshot._value;
                    let tempInvitees = [];
                    for(let key in eventData.invitee) {
                        eventData.invitee[key].preselect = true;
                        eventData.invitee[key].inviteeId = key;
                        tempInvitees.push(eventData.invitee[key])
                    }
                    eventData.invitee = tempInvitees;
                    eventData['eventId'] = eventKey;
                    const coords = eventData.evtCoords?{latitude: eventData.evtCoords.lat, longitude: eventData.evtCoords.lng, latitudeDelta: 0.0922, longitudeDelta: 0.0421}:this.state.defaultOrEventLocation;
                    this.setState({eventData: eventData, defaultOrEventLocation: coords});
                }
            })
    }

    updateinviteList(){
        let self = this;
        let eventKey = this.state.eventId;
        let ref = firebase.database().ref().child('users');
        ref.child(self.props.user.socialUID).child('event')
        .child(eventKey).child('invitee').once("value")
        .then(function(snapshot) {
            let inviteeList = Object.keys(snapshot._value).map(function (key) {
                let retArrayF = snapshot._value[key]
                retArrayF.keyNode = key
                return retArrayF;
            });
            let newArr = []
            inviteeList.map((dataF, key) => {
                let tempObj = {
                    name: dataF.name,
                    email: dataF.email,
                    friendKey: dataF.keyNode,
                    fb_user_key: dataF.key ? dataF.key : '',
                    phone: dataF.phone ? dataF.phone: '',
                    buttonStatus: true
                }
                newArr.push(tempObj);
            })
            self.setState({ contactList: newArr })
        })
    }
    render(){
        let startDate = new Date(this.props.event.startDate || this.state.eventData.startDate);
        let startMonth = moment(startDate).format('MMM');
        let dateMonth = moment(startDate).format('DD');
        console.log('startMonth', startMonth)
        return(
            <KeyboardAwareScrollView
                style={styles.container}
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flex: 1 }}
                scrollEnabled={true}>
                <AppBarComponent />
                <View style={{ paddingTop: 10, alignSelf: 'center' }} >
                    <Text style={styles.textStyle}>Confirm Your Event</Text>
                </View>
                <View style={{ flexDirection: 'row', borderBottomWidth: 4, borderBottomColor: '#D8D8D8' }}>
                    <View style={{ flex: 2, justifyContent: 'center' }}>
                        <View>
                            {
                                this.props.event.profileImageUrl ?
                                <Image 
                                    source={{ uri: this.props.event.profileImageUrl }}
                                    style={{ alignSelf:'center', width: 100, height: 100, borderRadius: 50}}
                                />
                                :
                                <Image 
                                    source={iconsMap.icon_contact_avatar}
                                    style={{ alignSelf:'center', width: 100, height: 100, borderRadius: 50}}
                                />
                            }
                            
                        </View>
                        <View style={{ paddingTop: 10 }}>
                           <Text style={{ alignSelf: 'center', fontSize: 18 }}>{this.props.user.name}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 4 }}>
                        <View>
                            {/* <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#276DAF' }}>
                                {this.props.event.eventTitle || this.state.eventData.eventTitle}
                            </Text> */}
                        </View>
                        <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                            <View>
                                <Text style={{ color: 'pink', fontWeight: 'bold', fontSize: 20 }}>{startMonth}</Text>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#276DAF' }}>{dateMonth}</Text>
                            </View>
                            <View style={{ justifyContent: 'center', paddingLeft: 5 }}>
                                <Text style={{ fontSize: 16 }}>{this.props.event.startTime || this.state.eventData.startTime} - {this.props.event.endTime || this.state.eventData.endTime}</Text>
                            </View>
                        </View>
                        <View style={{ paddingTop: 8, flexDirection: 'row' }}>
                            <View style={{ flex: 11,  }}>
                                <View>
                                    <Text>{this.props.event.location || this.state.eventData.location}</Text>
                                </View>
                                
                            </View>
                            <View style={{ flex: 9 }}>
                                <MapView
                                    style={{ width: 100, height: 100, borderRadius: 50 }}
                                    region={this.state.defaultOrEventLocation}
                                />
                            </View>
                        </View>
                        <View style={{ paddingLeft: 30, paddingTop: 5, paddingBottom: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#276DAF' }} >
                                    {this.props.event.eventType || this.state.eventData.eventType}
                            </Text>
                        </View>
                    </View>
                </View>
                <ScrollView>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ flex: 18 }}>
                        {
                            console.log('ds',this.state.contactList)
                        }
                        {
                            
                            this.state.eventData.invitee && this.state.eventData.invitee.length > 0 ?
                                this.state.eventData.invitee.map((data, key) => {
                                    return(
                                        <View 
                                            style={{ paddingTop: 3, borderBottomWidth: 0,
                                                 borderBottomColor: '#D8D8D8',
                                                 borderWidth: 0,
                                                 borderRadius: 2,
                                                 borderColor: '#D8D8D8',
                                                 shadowColor: '#000',
                                                 shadowOffset: { width: 0, height: 2 },
                                                 shadowOpacity: 0.3,
                                                 shadowRadius: 2,
                                                 elevation: 1,
                                            }}
                                            key={key} 
                                        >
                                            <View style={{ flexDirection: 'row', 
                                                justifyContent: 'center', backgroundColor: 'white',
                                                borderRadius: 40, marginLeft: 2, 
                                            }}>
                                                <View style={{ flex: 2,  }}> 
                                                    {
                                                        data.thumbnailPath ?
                                                            <Image 
                                                                source={{ uri: data.thumbnailPath }}
                                                                style={{ alignSelf:'center', width: 64, height: 64}}
                                                            />
                                                        :
                                                            <Image 
                                                                source={iconsMap.icon_contact_avatar}
                                                                style={{ alignSelf:'center', width: 64, height: 64}}
                                                            />
                                                    }
                                                    
                                                </View>
                                                <View style={{ flex: 4, justifyContent: 'center' }}> 
                                                    <Text style={{ fontSize: 17 }}>{data.name}</Text>
                                                </View>
                                                {
                                                    data.preselect ?
                                                    <TouchableOpacity 
                                                        style={{ flex: 1, justifyContent: 'center' }}
                                                        onPress={() => this.removeFriend(data)}
                                                    > 
                                                        <Image 
                                                            source={iconsMap.icon_remove}
                                                            style={{ alignSelf: 'center' }}
                                                        />
                                                    </TouchableOpacity>
                                                    :
                                                    <TouchableOpacity 
                                                        style={{ flex: 1, justifyContent: 'center' }}
                                                        onPress={() => this.addFriend(data)}
                                                    > 
                                                        <Image 
                                                            source={iconsMap.icon_add}
                                                            style={{ alignSelf: 'center' }}
                                                        />
                                                    </TouchableOpacity>
                                                }
                                                
                                            </View>
                                        </View>
                                    
                                    )
                                })
                            : null
                        }
                        </View>
                    </View>
                </ScrollView>
                <View style={{ flexDirection: 'row', padding: 15, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => this.onCancelEvent()}>
                            {this.state.editMode ?
                                <Image source={iconsMap.icon_cancel_red} />:
                                <Image source={iconsMap.icon_cancel} />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => this.handleBackNavigation()} >
                                <Image source={iconsMap.icon_back_circle} />
                        </TouchableOpacity>
                    </View>
                    
                    <View>
                        <TouchableOpacity onPress={() => this.state.editMode?this.onConfirmEvent('updated'):this.onConfirmEvent('created')}>
                            <Image source={iconsMap.icon_confirm} />
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </KeyboardAwareScrollView>
        );
    }

    /**
     * @description handles back navigation with eventemitter like listener to force reload the screen
     */
    handleBackNavigation() {
        this.props.navigation.state.params.willReload();
        this.props.navigation.goBack();
    }

    /**
     * Description - cancel the so far created event permannently
     */
    onCancelEvent(){
        Alert.alert(
            'Discard event?',
            'Are you sure to discard the entire event?',
            [
              {text: 'Yeah, discard', onPress: () => { this.props.removeEventDataAction(this.state.eventId) }},
              {text: 'Cancel', onPress: () => {}, style: 'cancel'}
            ],
            { cancelable: false }
          )
    }
    onConfirmEvent(msg){
        if(this.state.eventData.invitee.length == 0) {
            Alert.alert("Event requires at least 1 invitee before it could be created");
            return;
        }
        Alert.alert(
            `Awesome, your event’s been ${msg}!`,
            'Just select your event from your event list if you need to update it.',
            // [{ text: 'Got It!', onPress: () => this.props.navigation.navigate('EventOverview', {attendee: this.state.contactList}) },], { cancelable: false }
            [{ text: 'Got It!', onPress: () => this.addInviteesToUsersFriendList() },], { cancelable: false }
        )
    }

    ////////////////////////
    addInviteesToUsersFriendList() {
        let socialUID = this.props.user.socialUID;
        let eventKey = this.state.eventId;
        let ref = firebase.database().ref().child('users');

        ref.child(`${socialUID}/event/${eventKey}`).update({ status: "confirmed" }).catch(err => console.log(err));
        this.createFriends(this.state.eventData.invitee, socialUID, eventKey, ref)
            .then(() => {
                this.props.navigation.navigate({
                    routeName: 'EventOverview',
                    key: 'EventOverview',
                    params: { eventId: eventKey }
                });
            });
    }

    createFriends(invitee, socialUID, eventKey, ref) {
        return Promise.all(invitee.map(async item => {
            console.log("++ contact list item ++", item);

            return await ref.child(socialUID).child("friends").orderByChild("name").equalTo(item.name).once("value").then(snapshot => {
                if(snapshot._value) {
                    const key = Object.keys(snapshot._value)[0];
                    if(snapshot._value[key]['name'] != item.name) {
                        let eventList = [];
                        eventList.push(this.props.event.eventKey);
                        const payload = { name: item.name, email: item.email || '', phone: item.phone || '', eventList: eventList };
                        return ref.child(`${socialUID}/friends/${item.inviteeId}`).set(payload);
                    }
                }
                else {
                    console.log("++ inside else block; eventId ++", eventKey);
                    let eventList = [];
                    eventList.push(eventKey);
                    const payload = { name: item.name, email: item.email, phone: item.phone || '', eventList: eventList };
                    return ref.child(`${socialUID}/friends/${item.inviteeId}`).set(payload);
                }
            })            
        }));
    }

    //////////
    removeFriend(data){
        let socialUID = this.props.user.socialUID;
        let eventKey = this.state.eventId;
        
        return firebase.database().ref(`users/${socialUID}/event/${eventKey}/invitee/${data.inviteeId}`)
            .remove((dataR) => {
                this.getEventInformation(eventKey);
            });
    }
    addFriend(data){
        console.log('addFriend', data);
        let addedListUser = {
            email: data.email,
            name: data.name,
            key: data.key
        };
        //let self = this;
        let socialUID = this.props.user.socialUID;
        let eventKey = this.state.eventId;
        
        firebase.database().ref(`users/${socialUID}/event/${eventKey}/invitee/${data.inviteeId}`).set(
            {
                email: data.email,
                name: data.name,
                phone: data.phone
            }).then((data) => {
                this.getEventInformation(eventKey);
            })
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    textStyle: {
        fontSize: 16,
        paddingBottom: 10,
        color: '#276DAF'
    },
    tabBarView: {
        height: 45,
        flexDirection: 'row',
        paddingTop: 5,
    },
    avatarView: {
        flex: 1,
        alignItems: 'center',
    },
    dataView: {
        marginLeft: 20,
        marginRight: 20,
        flex: 2,
        flexDirection: 'column',
    },
    sociallinkView: {
        flex: 2,
        marginLeft: 20,
        marginRight: 20,
    },
    socialContent: {
        flex: 1,
    },
    socialInput: {
        flexDirection: 'row',
        paddingBottom: 2,
    },
    socialLine: {
        backgroundColor: 'gray',
        height: 1,
    },
    socialTextInput: {
        fontSize: 18,
        flex: 1,
        marginLeft: 10,
    },
    nameArea: {
        flex: 1,
    },
    passwordArea: {
        marginTop: 10,
        flexDirection: 'row',
        flex: 1,
    },
    phoneArea: {
        flex: 2,
        marginTop: 10,
    },
    line: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    textInput: {
        alignSelf: 'stretch',
        fontSize: 20,
        overflow: 'visible',
        marginTop: 2,
    },
    addressText: {
        fontSize: 20,
        height: '75%',
    },
    iconArea: {
        padding: 5,
    },
    passwordInput: {
        flex: 1,
    },
    bottomView: {
        height : 50,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bottomBtn: {
        marginRight : 20,
    },
    blocker: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#55555555',
    },
    textSearchList: {
        color: '#276DAF',
        fontSize: 15
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.auth.user,
        event: state.event.details,
        indicatorShow: state.auth.indicatorShow,
        contactList: state.contactList
    };  
}
const mapDispatchToProps = (dispatch) => {
    return {
        onShowIndicator: (bShow) => { dispatch(setVisibleIndicatorAction(bShow)) },
        removeEventDataAction: (evtKey) => { dispatch(removeEventDataAction(evtKey)) }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmEvent);