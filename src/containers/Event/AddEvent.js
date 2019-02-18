import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Switch, Alert, AsyncStorage } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux';
import DatePicker from 'react-native-datepicker'
import { UIActivityIndicator } from 'react-native-indicators'
import moment from 'moment';

import { insertEventDataAction } from '../../actions/event'
import { setVisibleIndicatorAction } from '../../actions/auth'
import AppBarComponent from '../../components/AppBar';
import { iconsMap } from 'assets/assetMap';
import firebase from 'react-native-firebase';

/**
 * Create a new event or edit a particular event
 */
class CreateOrEditEvent extends Component {
    static navigationOptions = {
        header: null
    };

    constructor() {
        super();
        this.state = {
            chosenDate: new Date(),
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            eventTitle: '',
            eventType: '',
            location: '',
            privateValue: true,
            status: 'inProgress',
            animating: false,
            eventId: '',
            isEditMode: false,
            isFieldEmpty: false
        }
    }

    /**
     * @description Purpose - get event information to edit that event
     */
    componentDidMount() {
        const { params } = this.props.navigation.state;
        if (!!params && !!params.eventId) {
            this.fetchEventInfo(params.eventId);
            this.setState({isEditMode: params.isEditMode, eventId: params.eventId});
        }
    }

    componentWillReceiveProps(nextProps) {
        const { navigate } = this.props.navigation;

        if (!!nextProps.eventId && nextProps.eventId != this.props.eventId && !this.state.isEditMode) {
            // NOTE : important to set state here since componentWillReceiveProps invokes multiple times
            this.setState({ animating: false });
            navigate('AddInvitee', { searchType: 'start', account: this.props.navigation.getParam('account'), eventKey: nextProps.eventId });
            return;           
        }
        else if (!nextProps.eventId && !!this.state.eventId && !!this.state.isEditMode) {
            this.setState({ animating: false });
            navigate('AddInvitee', {showContactsAndFriends: true, eventKey: this.state.eventId, editMode: this.state.isEditMode});
            return;
        }
    }

    /**
     * @description Fetches event information if event key is supplied
     * @param {string} eventKey 
     */
    fetchEventInfo(eventKey) {
        return firebase.database().ref(`users/${this.props.user.socialUID}/event/${eventKey}`)
            .orderByChild("eventTitle")
            .once("value")
            .then(snapshot => {
                if(snapshot._value) {
                    const eventData = snapshot._value;
                    delete eventData.invitee;
                    delete eventData.invite_sent;
                    delete eventData.status;
                    eventData['eventId'] = eventKey;
                    this.setState(eventData);
                    // TODO - This is where result will be cached later
                }
            })
            .catch(err => console.error(err));
    }

    render() {
        return (
            <React.Fragment>
            <KeyboardAwareScrollView
                style={styles.container}
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flex: 1 }}
                scrollEnabled={true}>
                <AppBarComponent />
                <View style={{ padding: 10, alignSelf: 'center' }} >
                    <Text style={styles.textStyle}>Start by entering your event details here</Text>
                </View>
                <View style={{ flexDirection: 'column', padding: 15 }} >
                    <View style={{ padding: 5 }}>
                        <TextInput
                            placeholder="Event Title"
                            autoCapitalize="words"
                            enablesReturnKeyAutomatically={true}
                            value={this.state.eventTitle}
                            onChangeText={(text) => { this.setState({ eventTitle: text }) }}
                            onBlur={(text) => this.validateTextField(text.nativeEvent, this.refs.eventTitleBorder)}
                        />
                        <View ref='eventTitleBorder' style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, paddingTop: 3 }} ></View>
                    </View>
                    <View style={{ padding: 5 }}>
                        <TextInput
                            placeholder="Type"
                            autoCapitalize="words"
                            enablesReturnKeyAutomatically={true}
                            value={this.state.eventType}
                            onChangeText={(text) => { this.setState({ eventType: text }) }}
                            onBlur={(text) => this.validateTextField(text.nativeEvent, this.refs.eventTypeBorder)}
                        />
                        <View ref='eventTypeBorder' style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, paddingTop: 3 }} ></View>}
                    </View>
                    <View style={{ padding: 5 }}>
                        <TextInput
                            style={{ height: 100 }}
                            autoCapitalize="words"
                            enablesReturnKeyAutomatically={true}
                            multiline
                            numberOfLines={5}
                            placeholder="Location"
                            value={this.state.location}
                            onChangeText={(text) => { this.setState({ location: text }) }}
                            onBlur={(text) => this.validateTextField(text.nativeEvent, this.refs.eventLocationBorder)}
                        />
                        <View ref='eventLocationBorder' style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, paddingTop: 3 }} ></View>
                    </View>
                    <View style={{ padding: 5, flexDirection: 'row' }}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text>Begin</Text>
                        </View>
                        <View style={{ flex: 2, paddingLeft: 5 }}>
                            <DatePicker
                                style={{ width: 200 }}
                                date={this.state.startDate}
                                mode="date"
                                placeholder="Date"
                                format="YYYY-MM-DD"
                                minDate="2016-05-01"
                                maxDate="2050-06-01"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                customStyles={{ dateInput: { borderWidth: 0, alignItems: 'flex-start' } }}
                                onDateChange={date => { this.setState({ startDate: date, endDate: date }); this.refs.endDateBorder.setNativeProps({ borderBottomColor: '#cecece' }) }}
                                onCloseModal={() => setTimeout(() => this.validateDateField(this.state.startDate, this.refs.startDateBorder), 100)}
                            />
                            <View ref='startDateBorder' style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, width: 100 }} ></View>
                        </View>
                        <View style={{ flex: 2 }}>
                            <DatePicker
                                style={{ width: 200 }}
                                date={this.state.startTime}
                                mode="time"
                                placeholder="Time"
                                format="hh:mm A"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                customStyles={{ dateInput: { borderWidth: 0, alignItems: 'flex-start' } }}
                                onDateChange={(time) => { this.setState({ startTime: time, endTime: time }); this.refs.endTimeBorder.setNativeProps({ borderBottomColor: '#cecece' }) }}
                                onCloseModal={() => setTimeout(() => this.validateDateField(this.state.startTime, this.refs.startTimeBorder), 100)}
                            />
                            <View ref='startTimeBorder' style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, width: 100 }} ></View>
                        </View>
                    </View>

                    <View style={{ padding: 5, flexDirection: 'row' }}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text>End</Text>
                        </View>
                        <View style={{ flex: 2, paddingLeft: 5 }}>
                            <DatePicker
                                style={{ width: 200 }}
                                date={!this.state.endDate?this.state.startDate:this.state.endDate}
                                mode="date"
                                placeholder="Date"
                                format="YYYY-MM-DD"
                                minDate="2016-05-01"
                                maxDate="2050-06-01"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                customStyles={{ dateInput: { borderWidth: 0, alignItems: 'flex-start' } }}
                                onDateChange={(date) => { this.setState({ endDate: date }) }}
                                onCloseModal={() => setTimeout(() => this.validateDateField(this.state.endDate, this.refs.endDateBorder), 100)}
                            />
                            <View ref='endDateBorder' style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, width: 100 }} ></View>
                        </View>
                        <View style={{ flex: 2 }}>
                            <DatePicker
                                style={{ width: 200 }}
                                date={!this.state.endTime?this.state.startTime:this.state.endTime}
                                mode="time"
                                placeholder="Time"
                                format="hh:mm A"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                customStyles={{ dateInput: { borderWidth: 0, alignItems: 'flex-start' } }}
                                onDateChange={(time) => { this.setState({ endTime: time }) }}
                                onCloseModal={() => setTimeout(() => this.validateDateField(this.state.endTime, this.refs.endTimeBorder), 100)}
                            />
                            <View ref='endTimeBorder' style={{ borderBottomColor: '#cecece', borderBottomWidth: 2, width: 100 }} ></View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', paddingTop: 15 }}>
                        <View style={{ flex: 2 }}>
                            <Switch
                                value={this.state.privateValue}
                                onValueChange={() => this.setState({ privateValue: !this.state.privateValue })}
                            />
                        </View>
                        <View style={{ flex: 6 }}>
                            <Text style={{ fontSize: 16 }}>This event is private</Text>
                        </View>

                    </View>
                </View>
                {this.state.animating?
                    <View style={styles.blocker}>
                        <UIActivityIndicator
                            color={'lightgoldenrodyellow'}
                            style={styles.indicator} />
                    </View>:null
                }
            </KeyboardAwareScrollView>
            <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <View style={{ position: 'relative', flexDirection: 'row', padding: 15, justifyContent: 'space-between' }}>
                {this.state.isEditMode ?
                    <TouchableOpacity onPress={() => this.onEventCancel()}>
                        <Image source={iconsMap.icon_cancel_red} />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => this.onEventCancel()}>
                        <Image source={iconsMap.icon_cancel} />
                    </TouchableOpacity>}
                <TouchableOpacity onPress={() => this.onEventAddData()}>
                    <Image source={iconsMap.icon_next_circle} />
                </TouchableOpacity>
            </View>
        </View>
        </React.Fragment>
        );
    }
    /**
     * Description - validates date/time before proceding to add event
     */

    validateDateTime() {
        const isDateEqual = moment(this.state.startDate, 'DD-MM-YYYY').isSame(moment(this.state.endDate, 'DD-MM-YYYY'));
        //const isTimeEqual = moment(this.state.endTime, 'HH:mm A').utc().isSame(moment(this.state.startTime, 'HH:mm A').utc());
        const isDateFromPast = moment(this.state.startDate).isBefore(moment(new Date()).format("YYYY-MM-DD")) || moment(this.state.endDate).isBefore(moment(new Date()).format("YYYY-MM-DD"));
        const isWrongDate = moment(this.state.startDate, 'DD-MM-YYYY').isAfter(moment(this.state.endDate, 'DD-MM-YYYY'));
        const isWrongTime = moment(this.state.startTime, 'HH:mm A').utc().isAfter(moment(this.state.endTime, 'HH:mm A').utc());

        if(isDateFromPast) {
            Alert.alert("Event date cannot be from past");
            return;
        }
        // else if (isDateEqual && isTimeEqual) {
        //     Alert.alert("Start & End Event Time MUST NOT be the same");
        //     return;
        // }
        else if (isDateEqual && isWrongTime) {
            Alert.alert("Event End time cannot be before Start time");
            return;
        }
        else if (isWrongDate) {
            Alert.alert("An event cannot start from the future!");
            return;
        }
        else {
            return true;
        }
    }

    /**
     * @description validate each textinput field on blur
     * @param {*} e - event
     * @param {*} ref - DOM element reference
     */
    validateTextField(e, ref) {
        if(!e.text) {
            ref.setNativeProps({
                borderBottomColor: 'red'
            });
            return;
        }
        ref.setNativeProps({
            borderBottomColor: '#cecece'
        });
    }

    /**
     * @description validate all the fields at once
     */
    validateAllFields() {
        if(!this.state.eventTitle) {
            this.refs.eventTitleBorder.setNativeProps({ borderBottomColor: 'red' });
        }
        if(!this.state.eventType) {
            this.refs.eventTypeBorder.setNativeProps({ borderBottomColor: 'red' });
        }
        if(!this.state.location) {
            this.refs.eventLocationBorder.setNativeProps({ borderBottomColor: 'red' });
        }
        if(!this.state.startDate) {
            this.refs.startDateBorder.setNativeProps({ borderBottomColor: 'red' });
        }
        if(!this.state.endDate) {
            this.refs.endDateBorder.setNativeProps({ borderBottomColor: 'red' });
        }
        if(!this.state.startTime) {
            this.refs.startTimeBorder.setNativeProps({ borderBottomColor: 'red' });
        }
        if(!this.state.endTime) {
            this.refs.endTimeBorder.setNativeProps({ borderBottomColor: 'red' });
        }
    }

    /**
     * @description validate each datetime field on modal dismiss
     * @param {string} val - value within state
     * @param {*} ref - DOM element reference
     */
    validateDateField(val, ref) {
        if(!val) {
            ref.setNativeProps({
                borderBottomColor: 'red'
            });
            return;
        }
        ref.setNativeProps({
            borderBottomColor: '#cecece'
        });
    }

    onEventAddData() {
        console.log("++ start date ++", this.state.startDate);
        console.log("++ end date ++", this.state.endDate);
        console.log("++ start time ++", this.state.startTime);
        console.log("++ end time ++", this.state.endTime);

        let startTime = this.state.startTime
        let startDate = this.state.startDate
        let endDate = this.state.endDate || this.state.startDate
        let endTime = this.state.endTime || this.state.startTime
        let eventTitle = this.state.eventTitle
        let eventType = this.state.eventType
        let location = this.state.location
        let privateValue = this.state.privateValue
        let socialUID = this.props.user.socialUID
        let evtStatus = this.state.isEditMode?"Editing":this.state.status
        let eventId = this.state.eventId?this.state.eventId:'';

        if (eventTitle !== "" && eventType !== "" && location !== "" && startDate !== "" && startTime !== "" && endDate !== "" && endTime !== "" && this.validateDateTime()) {
            this.props.onShowIndicator(true);
            this.setState({ animating: true });
            this.props.insertEventDataAction(
                startDate,
                startTime,
                endDate,
                endTime,
                eventTitle,
                eventType,
                location,
                privateValue,
                socialUID,
                evtStatus,
                eventId
            );
        }
        else {
            this.validateAllFields();
            Alert.alert("Please fill in the required information first");
        }
    }

    /**
     * @description removes an event or simply navigates to previous activity
     */

    onEventCancel() {
        if(!this.state.isEditMode) {
            this.props.navigation.goBack();
            return;
        }
        Alert.alert(
            'Yikes, you are about to cancel your event!',
            'If you cancel, the invited people will be notified of this cancellation',
            [
              {text: 'Go Back!', onPress: () => {}, style: 'cancel'},
              {text: 'Cancel It!', onPress: () => { this.removeEvent(this.state.eventId)}},
            ],
            { cancelable: false }
          )
    }

    /**
     * @description Removes the event. Has 2 dependencies - delete eventId from friends and the user who is friend
     * @param {string} evtKey
     */
    removeEvent(evtKey) {
        firebase.database().ref(`users/${this.props.user.socialUID}/event/${evtKey}/invitee`)
            .once("value")
            .then(async snapshot => {
                if(snapshot._value) {
                    const removedResultFromFriend = await this.removeEventFromFriends(snapshot, evtKey);
                    const removedResultFromUser = await this.removeEventFromUser(snapshot, evtKey);
                    if(removedResultFromFriend && removedResultFromUser) {
                        //safe to delete the entire event
                        firebase.database().ref(`users/${this.props.user.socialUID}/event/${evtKey}`)
                            .remove()
                            .then(() => {
                                this.props.navigation.navigate({
                                    routeName: 'NearbyEvents',
                                    key: 'NearbyEvents', 
                                });
                            });
                    }
                }
            })
    }

    /**
     * @description removes current event Id from the friends list
     * @param {*} snapshot 
     * @param {string} evtKey 
     */
    removeEventFromFriends(snapshot, evtKey) {
        return Promise.all(Object.keys(snapshot._value).map(async inviteeId => {
            return firebase.database().ref(`users/${this.props.user.socialUID}/friends/${inviteeId}`)
                .once("value")
                .then(friendSnapshot => {
                    if(friendSnapshot._value) {
                        let evtList = friendSnapshot._value['eventList'];
                        if(evtList.includes(evtKey)) {
                            evtList.splice(evtList.indexOf(evtKey), 1);
                            if(evtList.length == 0) {
                                evtList = [];
                            }

                            // safe to update the particular user
                            return firebase.database().ref(`users/${this.props.user.socialUID}/friends/${inviteeId}`)
                                .update({ eventList: evtList });
                        }
                    }
                });
        }));
    }

    /**
     * @description removes current event Id from the user who is friend
     * @param {*} snapshot 
     * @param {string} evtKey 
     */
    removeEventFromUser(snapshot, evtKey) {
        return Promise.all(Object.keys(snapshot._value).map(async inviteeId => {
            return firebase.database().ref(`users/${inviteeId}`)
                .once("value")
                .then(userSnapshot => {
                    if(userSnapshot._value) {
                        let evtList = userSnapshot._value['eventList'];
                        if(evtList.includes(evtKey)) {
                            evtList.splice(evtList.indexOf(evtKey), 1);
                            if(evtList.length == 0) {
                                evtList = [];
                            }

                            // safe to update the particular user
                            return firebase.database().ref(`users/${inviteeId}`)
                                .update({ eventList: evtList });
                        }
                    }
                });
        }));
    }

    showStartTime(time) {

    }
    selectStartDate(date) {
    }
    setDate(newDate) {
        let fullYear = newDate.getFullYear() + '-' + newDate.getMonth() + '-' + newDate.getDate();
        this.setState({ chosenDate: newDate })
    }
    onMenuPressed() {
        this.props.navigation.navigate({
            routeName: 'Menu',
            key: 'Menu',
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textStyle: {
        fontSize: 16,
        paddingBottom: 20,
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
        height: 50,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bottomBtn: {
        marginRight: 20,
    },
    blocker: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#55555555',
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const mapStateToProps = (state, ownProps) => {
    return {
        eventAdded: state.event.eventAdded,
        eventId: state.event.eventId,
        user: state.auth.user,
        indicatorShow: state.auth.indicatorShow,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        insertEventDataAction: (startDate, startTime,
            endDate, endTime, eventTitle, eventType, location, privateValue, socialUID, status, eventId) => {
            dispatch(insertEventDataAction(startDate, startTime,
                endDate, endTime, eventTitle, eventType, location, privateValue, socialUID, status, eventId))
        },
        onShowIndicator: (bShow) => { dispatch(setVisibleIndicatorAction(bShow)) },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrEditEvent);