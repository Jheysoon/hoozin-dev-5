import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
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
  ListItem,
  CheckBox
} from "native-base";
import { connect } from "react-redux";
import DatePicker from "react-native-datepicker";
import { UIActivityIndicator } from "react-native-indicators";
import moment from "moment";

import { upsertEventDataAction } from "../../../actions/event";
import {
  setVisibleIndicatorAction,
  resetProfileUpdateAction
} from "../../../actions/auth";
import { EventServiceAPI } from "../../../api/index";
import { IconsMap } from "assets/assetMap";
import AppBarComponent from "../../../components/AppBar/appbar.index";

// stylesheet
import { AddOrCreateEventStyles } from "./addevent.style";

/* Redux container component to create a new event or edit a particular event */
class CreateOrEditEventContainer extends Component {
  static navigationOptions = {
    header: null
  };

  constructor() {
    super();
    this.state = {
      chosenDate: new Date(),
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      eventTitle: "",
      eventType: "",
      location: "",
      privateValue: true,
      status: "inProgress",
      animating: false,
      eventId: "",
      isEditMode: false,
      isEventFormEmpty: false
    };
  }

  /**
   * @description Purpose - get event information to edit that event
   */
  componentDidMount() {
    const { params } = this.props.navigation.state;
    this.props.resetProfileUpdate();
    this.setState({ animating: false });
    if (!!params && !!params.eventId) {
      this.fetchEventInfo(params.eventId);
      this.setState({ isEditMode: params.isEditMode, eventId: params.eventId });
    } else {
      this.setState({ isEditMode: false, eventId: "" });
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log("@@@ Add event nextprops", nextProps);
    const { eventAdded, eventId, indicatorShow, profileUpdate } = nextProps;
    const { replace, navigate, getParam } = this.props.navigation;

    if (indicatorShow != this.state.animating) {
      this.setState({ animating: indicatorShow });
    }

    // TODO - compact the outer condition or remove it if it not necessary
    if (
      (eventAdded &&
        profileUpdate == false &&
        eventId != this.props.eventId &&
        !this.state.isEditMode) ||
      (eventAdded && this.state.isEditMode)
    ) {
      this.setState({ animating: false });
      if (eventAdded && profileUpdate == false && !this.state.isEditMode) {
        replace("AddInvitee", {
          searchType: "start",
          account: getParam("account"),
          eventKey: eventId
        });
        return;
      } else if (
        eventAdded &&
        profileUpdate == false &&
        eventId != (this.props.eventId || "undefined") &&
        this.props.navigation.state.params.eventId
      ) {
        // changed on 25.09.2018 because of wrong Event edit mode navigation becuase of not cache editmode flag
        replace("AddInvitee", {
          includeInvitees: true,
          eventKey: this.state.eventId,
          editMode: this.state.isEditMode
        });
        return;
      }
    }
  }

  /**
   * @description Fetches event information if event key is supplied
   * @param {string} eventId
   */
  fetchEventInfo(eventId) {
    const eventSvc = new EventServiceAPI();
    eventSvc
      .getEventDetailsAPI(eventId, this.props.user.socialUID)
      .then(eventData => {
        delete eventData.invitee;
        delete eventData.invite_sent;
        delete eventData.status;
        eventData["eventId"] = eventId;
        this.setState(eventData);
        // TODO - This is where result will be cached later
      })
      .catch(err => console.error(err));
  }

  /**
   * Description - validates date/time before proceding to add event
   */

  validateDateTime() {
    const startDateTimeInUTC = moment.utc(
      moment(
        `${this.state.startDate} ${this.state.startTime}`,
        "YYYY-MM-DD hh:mm A"
      )
    );
    const endDateTimeInUTC = moment.utc(
      moment(
        `${this.state.endDate} ${this.state.endTime}`,
        "YYYY-MM-DD hh:mm A"
      )
    );
    const currentDateTimeInUTC = moment.utc();

    const isSameDateTime = startDateTimeInUTC.isSame(endDateTimeInUTC);
    const isValidFutureDateTime =
      endDateTimeInUTC.isAfter(startDateTimeInUTC) &&
      endDateTimeInUTC.isAfter(currentDateTimeInUTC);

    if (isValidFutureDateTime) {
      return true;
    } else if (isSameDateTime) {
      Alert.alert(
        "Oops! wrong date time",
        "An event cannot start and end exactly at the same time!",
        [{ text: "GOT IT", style: "default" }]
      );
      return false;
    } else if (!isValidFutureDateTime) {
      Alert.alert(
        "Oops! wrong date time",
        "Event cannot start or end past from today and it should end after its starting date time",
        [{ text: "GOT IT", style: "default" }]
      );
      return false;
    }
  }

  /**
   * @description validate each textinput field on blur
   * @param {*} e - event
   * @param {*} ref - DOM element reference
   */
  validateTextField(e, ref) {
    if (!e.text) {
      ref.setNativeProps({
        borderBottomColor: "red"
      });
      return;
    }
    ref.setNativeProps({
      borderBottomColor: "#cecece"
    });
    this.state.isEventFormEmpty
      ? this.setState({ isEventFormEmpty: false })
      : "";
  }

  /**
   * @description validate each datetime field on modal dismiss
   * @param {string} val value within state
   * @param {Object|Array} ref single or multiple DOM element reference
   */
  validateDateField(val, ref) {
    if (!val && !Array.isArray(ref)) {
      ref.setNativeProps({
        borderBottomColor: "red"
      });
      return;
    } else if (!val && Array.isArray(ref)) {
      ref.forEach(refItem => {
        refItem.setNativeProps({
          borderBottomColor: "red"
        });
      });
      return;
    } else if (val && !Array.isArray(ref)) {
      ref.setNativeProps({
        borderBottomColor: "#cecece"
      });
      return;
    } else if (val && Array.isArray(ref)) {
      ref.forEach(refItem => {
        refItem.setNativeProps({
          borderBottomColor: "#cecece"
        });
      });
      return;
    }
    this.state.isEventFormEmpty
      ? this.setState({ isEventFormEmpty: false })
      : "";
  }

  /**
   * @description validate all the fields at once
   */
  validateAllFields() {
    if (!this.state.eventTitle) {
      this.refs.eventTitleBorder.setNativeProps({ borderBottomColor: "red" });
    }
    if (!this.state.eventType) {
      this.refs.eventTypeBorder.setNativeProps({ borderBottomColor: "red" });
    }
    if (!this.state.location) {
      this.refs.eventLocationBorder.setNativeProps({
        borderBottomColor: "red"
      });
    }
    if (!this.state.startDate) {
      this.refs.startDateBorder.setNativeProps({ borderBottomColor: "red" });
    }
    if (!this.state.endDate) {
      this.refs.endDateBorder.setNativeProps({ borderBottomColor: "red" });
    }
    if (!this.state.startTime) {
      this.refs.startTimeBorder.setNativeProps({ borderBottomColor: "red" });
    }
    if (!this.state.endTime) {
      this.refs.endTimeBorder.setNativeProps({ borderBottomColor: "red" });
    }
    this.setState({ isEventFormEmpty: true });
  }

  /**
   * @description Create or Update new / existing event
   */
  onEventAddData() {
    let startTime = this.state.startTime;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate || this.state.startDate;
    let endTime = this.state.endTime || this.state.startTime;
    let eventTitle = this.state.eventTitle;
    let eventType = this.state.eventType;
    let location = this.state.location;
    let privateValue = this.state.privateValue;
    let socialUID = this.props.user.socialUID;
    let evtStatus = this.state.isEditMode ? "Editing" : this.state.status;
    let eventId = this.state.eventId ? this.state.eventId : "";

    /* Alert.alert("Error", "No Internet Connection you want to try again ?",
      [{
        text: 'Cancel'
      }, {
        text: 'Try Again'
      }] 
    ); */

    if (
      !!eventTitle &&
      !!eventType &&
      !!location &&
      !!startDate &&
      !!startTime &&
      !!endDate &&
      !!endTime &&
      this.validateDateTime()
    ) {
      this.props.onShowIndicator(true);
      this.setState({ animating: true });
      this.props.upsertEventDataAction(
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
    } else {
      this.state.isEventFormEmpty
        ? Alert.alert("Please fill in the required information first")
        : this.validateAllFields();
    }
  }

  /**
   * @description removes an event or simply navigates to previous activity
   */

  onEventCancel() {
    if (!this.state.isEditMode) {
      this.props.navigation.goBack();
      return;
    }
    Alert.alert(
      "Yikes, you are about to cancel your event!",
      "If you cancel, the invited people will be notified of this cancellation",
      [
        { text: "Go Back!", onPress: () => {}, style: "cancel" },
        {
          text: "Cancel It!",
          onPress: () => {
            this.removeEvent(this.state.eventId);
          }
        }
      ],
      { cancelable: false }
    );
  }

  /**
   * @description Removes the event. Has 2 dependencies - delete eventId from friends and the user who is friend
   * @param {string} evtKey
   */
  removeEvent(evtKey) {
    const eventSvc = new EventServiceAPI();
    eventSvc
      .getEventInviteesDetailsAPI(evtKey, this.props.user.socialUID)
      .then(async snapshot => {
        if (snapshot._value) {
          const removedResultFromFriend = await this.removeEventFromFriends(
            snapshot,
            evtKey
          );
          const removedResultFromUser = await this.removeEventFromUser(
            snapshot,
            evtKey
          );
          if (removedResultFromFriend && removedResultFromUser) {
            //safe to delete the entire event
            eventSvc
              .removeEventFromHostAndInviteeAPI(
                evtKey,
                this.props.user.socialUID
              )
              .then(() => {
                this.props.navigation.navigate({
                  routeName: "NearbyEvents",
                  key: "NearbyEvents"
                });
              });
          }
        }
      });
  }

  /**
   * @description removes current event Id from the friends list
   * @param {*} snapshot
   * @param {string} evtKey
   */
  removeEventFromFriends(snapshot, evtKey) {
    const eventSvc = new EventServiceAPI();
    return Promise.all(
      Object.keys(snapshot._value).map(async inviteeId => {
        return eventSvc
          .getUsersFriendDetailsAPI(this.props.user.socialUID, inviteeId)
          .then(friendSnapshot => {
            if (friendSnapshot._value) {
              let evtList = friendSnapshot._value["eventList"];
              if (evtList.includes(evtKey)) {
                evtList.splice(evtList.indexOf(evtKey), 1);
                if (evtList.length == 0) {
                  evtList = [];
                }

                // safe to update the particular user
                return eventSvc.updateUsersFriendEventListAPI(
                  this.props.user.socialUID,
                  inviteeId,
                  evtList
                );
              }
            }
          });
      })
    );
  }

  /**
   * @description removes current event Id from the user who is friend
   * @param {*} snapshot
   * @param {string} evtKey
   */
  removeEventFromUser(snapshot, evtKey) {
    const eventSvc = new EventServiceAPI();
    return Promise.all(
      Object.keys(snapshot._value).map(async inviteeId => {
        return eventSvc.getUserDetailsAPI(inviteeId).then(userSnapshot => {
          if (userSnapshot._value) {
            let evtList = userSnapshot._value["eventList"];
            if (evtList.includes(evtKey)) {
              evtList.splice(evtList.indexOf(evtKey), 1);
              if (evtList.length == 0) {
                evtList = [];
              }

              // safe to update the particular user
              return eventSvc.updateUserEventListAPI(inviteeId);
            }
          }
        });
      })
    );
  }

  showStartTime(time) {}
  selectStartDate(date) {}
  setDate(newDate) {
    let fullYear =
      newDate.getFullYear() +
      "-" +
      newDate.getMonth() +
      "-" +
      newDate.getDate();
    this.setState({ chosenDate: newDate });
  }
  onMenuPressed() {
    this.props.navigation.navigate({
      routeName: "Menu",
      key: "Menu"
    });
  }

  goBackToOverview() {
    const eventSvc = new EventServiceAPI();

    eventSvc
      .updateEventAPI(this.props.user.socialUID, this.state.eventId, {
        status: "confirmed"
      })
      .then(result => this.props.navigation.goBack());
  }

  render() {
    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent />
          <Content>
            <View style={{ padding: 10, alignSelf: "center" }}>
              <Text style={AddOrCreateEventStyles.textStyle}>
                Start by entering your event details here
              </Text>
            </View>
            <View
              style={{
                flexDirection: "column",
                paddingTop: 15,
                paddingBottom: 15,
                paddingLeft: 30,
                paddingRight: 30
              }}
            >
              <View style={{ padding: 5 }}>
                <TextInput
                  style={AddOrCreateEventStyles.textInput}
                  placeholder="Event Title"
                  autoCapitalize="words"
                  enablesReturnKeyAutomatically={true}
                  value={this.state.eventTitle}
                  onChangeText={text => {
                    this.setState({ eventTitle: text });
                  }}
                  onEndEditing={text =>
                    this.validateTextField(
                      text.nativeEvent,
                      this.refs.eventTitleBorder
                    )
                  }
                  underlineColorAndroid="transparent"
                />
                <View
                  ref="eventTitleBorder"
                  style={{
                    borderBottomColor: "#bcbcbc",
                    borderBottomWidth: 1,
                    paddingTop: 3
                  }}
                />
              </View>
              <View style={{ padding: 5 }}>
                <TextInput
                  style={AddOrCreateEventStyles.textInput}
                  placeholder="Type"
                  autoCapitalize="words"
                  enablesReturnKeyAutomatically={true}
                  value={this.state.eventType}
                  onChangeText={text => {
                    this.setState({ eventType: text });
                  }}
                  onEndEditing={text =>
                    this.validateTextField(
                      text.nativeEvent,
                      this.refs.eventTypeBorder
                    )
                  }
                  underlineColorAndroid="transparent"
                />
                <View
                  ref="eventTypeBorder"
                  style={{
                    borderBottomColor: "#bcbcbc",
                    borderBottomWidth: 1,
                    paddingTop: 3
                  }}
                />
              </View>
              <View style={{ padding: 5 }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    position: "relative"
                  }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_location_pin}
                      style={{
                        width: 20,
                        height: 20,
                        position: "absolute",
                        left: -10,
                        top: 4
                      }}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
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
                                  `
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        position: "absolute",
                        left: 0,
                        top: 4,
                        zIndex: 9999
                      }}
                    />
                  )}
                  <TextInput
                    style={[{ height: 100 }, AddOrCreateEventStyles.textInput]}
                    autoCapitalize="words"
                    enablesReturnKeyAutomatically={true}
                    multiline={false}
                    placeholder="Location"
                    value={this.state.location}
                    onChangeText={text => {
                      this.setState({ location: text });
                    }}
                    onEndEditing={text =>
                      this.validateTextField(
                        text.nativeEvent,
                        this.refs.eventLocationBorder
                      )
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View
                  ref="eventLocationBorder"
                  style={{
                    borderBottomColor: "#bcbcbc",
                    borderBottomWidth: 1,
                    paddingTop: 3
                  }}
                />
              </View>
              <View style={{ padding: 5, flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    flexWrap: "nowrap",
                    position: "relative"
                  }}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_calendar}
                      style={{
                        width: 20,
                        height: 20,
                        position: "absolute",
                        left: -10,
                        top: 2
                      }}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
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
                                    <g id="Calendar" transform="translate(-24 -242)">
                                      <rect id="Rectangle_557" data-name="Rectangle 557" class="cls-1" width="16" height="16" transform="translate(24 242)"/>
                                      <path id="Path_149" data-name="Path 149" class="cls-2" d="M2,5v9H14V5ZM13,2h2a.945.945,0,0,1,1,1V15a.945.945,0,0,1-1,1H1a.945.945,0,0,1-1-1V3A.945.945,0,0,1,1,2H3V1A.945.945,0,0,1,4,0,.945.945,0,0,1,5,1V2h6V1a1,1,0,0,1,2,0ZM12,12H10V10h2ZM9,12H7V10H9Zm3-3H10V7h2ZM9,9H7V7H9ZM6,12H4V10H6Z" transform="translate(24 242)"/>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        position: "absolute",
                        left: 0,
                        top: 2
                      }}
                    />
                  )}
                  <Text
                    style={{
                      fontFamily: "Lato",
                      fontWeight: "400",
                      marginLeft: 8
                    }}
                  >
                    Begin
                  </Text>
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
                    customStyles={{
                      dateInput: { borderWidth: 0, alignItems: "flex-start" }
                    }}
                    onDateChange={date => {
                      this.setState({ startDate: date });
                    }}
                    onCloseModal={() =>
                      setTimeout(
                        () =>
                          this.validateDateField(this.state.startDate, [
                            this.refs.startDateBorder,
                            this.refs.endDateBorder
                          ]),
                        100
                      )
                    }
                  />
                  <View
                    ref="startDateBorder"
                    style={{
                      borderBottomColor: "#bcbcbc",
                      borderBottomWidth: 1,
                      width: 100
                    }}
                  />
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
                    customStyles={{
                      dateInput: { borderWidth: 0, alignItems: "flex-start" }
                    }}
                    onDateChange={time => {
                      this.setState({ startTime: time }, () => {
                        let p = this.state.startDate + " " + time;

                        if (this.state.startDate != "") {
                          this.setState({
                            endTime: moment(p, "YYYY-MM-DD h:mm A")
                              .add(1, "hours")
                              .format("hh:mm A"),
                            endDate: moment(p, "YYYY-MM-DD").format(
                              "YYYY-MM-DD"
                            )
                          });
                        }
                      });
                    }}
                    onCloseModal={() =>
                      setTimeout(
                        () =>
                          this.validateDateField(this.state.startTime, [
                            this.refs.startTimeBorder,
                            this.refs.endTimeBorder
                          ]),
                        100
                      )
                    }
                  />
                  <View
                    ref="startTimeBorder"
                    style={{
                      borderBottomColor: "#bcbcbc",
                      borderBottomWidth: 1,
                      width: 100
                    }}
                  />
                </View>
              </View>

              <View style={{ padding: 5, flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Text
                    style={{
                      marginLeft: 8,
                      marginRight: 14,
                      textAlign: "right"
                    }}
                  >
                    End
                  </Text>
                </View>
                <View style={{ flex: 2, paddingLeft: 5 }}>
                  <DatePicker
                    style={{ width: 200 }}
                    date={this.state.endDate}
                    mode="date"
                    placeholder="Date"
                    format="YYYY-MM-DD"
                    minDate="2016-05-01"
                    maxDate="2050-06-01"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    showIcon={false}
                    customStyles={{
                      dateInput: { borderWidth: 0, alignItems: "flex-start" }
                    }}
                    onDateChange={endDate => {
                      this.setState({ endDate: endDate });
                    }}
                    onCloseModal={() =>
                      setTimeout(
                        () =>
                          this.validateDateField(
                            this.state.endDate,
                            this.refs.endDateBorder
                          ),
                        100
                      )
                    }
                  />
                  <View
                    ref="endDateBorder"
                    style={{
                      borderBottomColor: "#bcbcbc",
                      borderBottomWidth: 1,
                      width: 100
                    }}
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <DatePicker
                    style={{ width: 200 }}
                    date={this.state.endTime}
                    mode="time"
                    placeholder="Time"
                    format="hh:mm A"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    showIcon={false}
                    customStyles={{
                      dateInput: { borderWidth: 0, alignItems: "flex-start" }
                    }}
                    onDateChange={endTime => {
                      this.setState({ endTime: endTime });
                    }}
                    onCloseModal={() =>
                      setTimeout(
                        () =>
                          this.validateDateField(
                            this.state.endTime,
                            this.refs.endTimeBorder
                          ),
                        100
                      )
                    }
                  />
                  <View
                    ref="endTimeBorder"
                    style={{
                      borderBottomColor: "#bcbcbc",
                      borderBottomWidth: 1,
                      width: 100
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", paddingTop: 15 }}>
                <View style={{ flex: 2 }}>
                  <ListItem
                    noIndent
                    style={
                      Platform.OS === "ios"
                        ? AddOrCreateEventStyles.checkbox_ios
                        : AddOrCreateEventStyles.checkbox_android
                    }
                  >
                    <CheckBox
                      checked={this.state.privateValue}
                      onPress={() =>
                        this.setState({
                          privateValue: !this.state.privateValue
                        })
                      }
                    />
                    <Body style={{ marginLeft: 10 }}>
                      <Text
                        style={{
                          fontFamily: "Lato",
                          fontWeight: "400",
                          fontSize: 18,
                          color: "#004D9B"
                        }}
                      >
                        This event is{" "}
                        {this.state.privateValue ? "private" : "public"}
                      </Text>
                    </Body>
                  </ListItem>
                </View>
              </View>
            </View>
          </Content>

          {Platform.OS === "ios" ? (
            <Footer style={AddOrCreateEventStyles.bottomView_ios}>
              <Left>
                {this.state.isEditMode ? (
                  <View>
                    <TouchableOpacity
                      onPress={() => this.onEventCancel()}
                      style={AddOrCreateEventStyles.fabLeftWrapperStyles}
                    >
                      {Platform.OS === "ios" ? (
                        <Image
                          source={IconsMap.icon_close_red}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      ) : (
                        <Image
                          source={{
                            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #ff003b;
                                          stroke: #bcbcbc;
                                        }
                                  
                                        .cls-2 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-3 {
                                          stroke: none;
                                        }
                                  
                                        .cls-4 {
                                          fill: none;
                                        }
                                  
                                        .cls-5 {
                                          filter: url(#Ellipse_111);
                                        }
                                      </style>
                                      <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="btn_Delete" transform="translate(-27 -616)">
                                      <g id="Group_1359" data-name="Group 1359">
                                        <g class="cls-5" transform="matrix(1, 0, 0, 1, 27, 616)">
                                          <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                            <circle class="cls-3" cx="21" cy="21" r="21"/>
                                            <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                          </g>
                                        </g>
                                      </g>
                                      <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(48.6 634.6)">
                                        <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                          }}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => this.goBackToOverview()}
                      style={{ position: "absolute", left: 80, bottom: -32 }}
                    >
                      {Platform.OS === "ios" ? (
                        <Image
                          source={IconsMap.icon_chevron_left}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      ) : (
                        <Image
                          source={{
                            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #2699fb;
                                        }
                                  
                                        .cls-2 {
                                          fill: none;
                                          stroke: #fff;
                                          stroke-width: 4px;
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
                                    <g id="Symbol_95_3" data-name="Symbol 95 – 3" transform="translate(-26 -619)">
                                      <g class="cls-3" transform="matrix(1, 0, 0, 1, 26, 619)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                      </g>
                                      <g id="Group_328" data-name="Group 328" transform="translate(355.5 1254) rotate(180)">
                                        <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                        <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                          }}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.onEventCancel()}
                    style={AddOrCreateEventStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_gray}
                        style={AddOrCreateEventStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #bcbcbc;
                                          stroke: #bcbcbc;
                                        }
                                  
                                        .cls-2 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-3 {
                                          stroke: none;
                                        }
                                  
                                        .cls-4 {
                                          fill: none;
                                        }
                                  
                                        .cls-5 {
                                          filter: url(#Ellipse_111);
                                        }
                                      </style>
                                      <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                                      <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                                        <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                          <circle class="cls-3" cx="21" cy="21" r="21"/>
                                          <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                        </g>
                                      </g>
                                      <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                                        <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                        }}
                        style={AddOrCreateEventStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </Left>
              <Body />
              <Right>
                <TouchableOpacity
                  onPress={() => this.onEventAddData()}
                  style={AddOrCreateEventStyles.fabRightWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_next}
                      style={AddOrCreateEventStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-2 {
                                      fill: none;
                                      stroke: #fff;
                                      stroke-width: 4px;
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
                                <g id="btn_Next" transform="translate(-312 -615)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 312, 615)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(51 45) rotate(180)"/>
                                  </g>
                                  <g id="Group_328" data-name="Group 328" transform="translate(42.5 28)">
                                    <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                    <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                  </g>
                                </g>
                              </svg>
                              `
                      }}
                      style={AddOrCreateEventStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </Footer>
          ) : (
            <View style={AddOrCreateEventStyles.bottomView_android}>
              <Left>
                {this.state.isEditMode ? (
                  <View>
                    <TouchableOpacity
                      onPress={() => this.onEventCancel()}
                      style={AddOrCreateEventStyles.fabLeftWrapperStyles}
                    >
                      {Platform.OS === "ios" ? (
                        <Image
                          source={IconsMap.icon_close_red}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      ) : (
                        <Image
                          source={{
                            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #ff003b;
                                      stroke: #bcbcbc;
                                    }
                              
                                    .cls-2 {
                                      fill: #fff;
                                    }
                              
                                    .cls-3 {
                                      stroke: none;
                                    }
                              
                                    .cls-4 {
                                      fill: none;
                                    }
                              
                                    .cls-5 {
                                      filter: url(#Ellipse_111);
                                    }
                                  </style>
                                  <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                    <feOffset dy="3" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="btn_Delete" transform="translate(-27 -616)">
                                  <g id="Group_1359" data-name="Group 1359">
                                    <g class="cls-5" transform="matrix(1, 0, 0, 1, 27, 616)">
                                      <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                        <circle class="cls-3" cx="21" cy="21" r="21"/>
                                        <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                      </g>
                                    </g>
                                  </g>
                                  <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(48.6 634.6)">
                                    <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                  </g>
                                </g>
                              </svg>
                              `
                          }}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => this.goBackToOverview()}
                      style={{ position: "absolute", left: 80, bottom: -32 }}
                    >
                      {Platform.OS === "ios" ? (
                        <Image
                          source={IconsMap.icon_chevron_left}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      ) : (
                        <Image
                          source={{
                            uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-2 {
                                      fill: none;
                                      stroke: #fff;
                                      stroke-width: 4px;
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
                                <g id="Symbol_95_3" data-name="Symbol 95 – 3" transform="translate(-26 -619)">
                                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 26, 619)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                  </g>
                                  <g id="Group_328" data-name="Group 328" transform="translate(355.5 1254) rotate(180)">
                                    <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                    <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                  </g>
                                </g>
                              </svg>
                              `
                          }}
                          style={AddOrCreateEventStyles.fabStyles}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.onEventCancel()}
                    style={AddOrCreateEventStyles.fabLeftWrapperStyles}
                  >
                    {Platform.OS === "ios" ? (
                      <Image
                        source={IconsMap.icon_close_gray}
                        style={AddOrCreateEventStyles.fabStyles}
                      />
                    ) : (
                      <Image
                        source={{
                          uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #bcbcbc;
                                      stroke: #bcbcbc;
                                    }
                              
                                    .cls-2 {
                                      fill: #fff;
                                    }
                              
                                    .cls-3 {
                                      stroke: none;
                                    }
                              
                                    .cls-4 {
                                      fill: none;
                                    }
                              
                                    .cls-5 {
                                      filter: url(#Ellipse_111);
                                    }
                                  </style>
                                  <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                    <feOffset dy="3" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                                  <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                                    <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                      <circle class="cls-3" cx="21" cy="21" r="21"/>
                                      <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                    </g>
                                  </g>
                                  <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                                    <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                  </g>
                                </g>
                              </svg>
                              `
                        }}
                        style={AddOrCreateEventStyles.fabStyles}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </Left>
              <Body />
              <Right>
                <TouchableOpacity
                  onPress={() => this.onEventAddData()}
                  style={AddOrCreateEventStyles.fabRightWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_next}
                      style={AddOrCreateEventStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2 {
                                  fill: none;
                                  stroke: #fff;
                                  stroke-width: 4px;
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
                            <g id="btn_Next" transform="translate(-312 -615)">
                              <g class="cls-3" transform="matrix(1, 0, 0, 1, 312, 615)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(51 45) rotate(180)"/>
                              </g>
                              <g id="Group_328" data-name="Group 328" transform="translate(42.5 28)">
                                <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                              </g>
                            </g>
                          </svg>
                          `
                      }}
                      style={AddOrCreateEventStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Right>
            </View>
          )}
        </Container>
        {this.state.animating && (
          <View style={AddOrCreateEventStyles.overlay}>
            <UIActivityIndicator
              color={"lightgoldenrodyellow"}
              style={AddOrCreateEventStyles.spinner}
            />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    eventAdded: state.event.eventAdded,
    eventId: state.event.eventId,
    user: state.auth.user,
    indicatorShow: state.auth.indicatorShow,
    profileUpdate: state.auth.profileUpdate
  };
};

const mapDispatchToProps = dispatch => {
  return {
    upsertEventDataAction: (
      startDate,
      startTime,
      endDate,
      endTime,
      eventTitle,
      eventType,
      location,
      privateValue,
      socialUID,
      status,
      eventId
    ) => {
      dispatch(
        upsertEventDataAction(
          startDate,
          startTime,
          endDate,
          endTime,
          eventTitle,
          eventType,
          location,
          privateValue,
          socialUID,
          status,
          eventId
        )
      );
    },
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicatorAction(bShow));
    },
    resetProfileUpdate: () => {
      dispatch(resetProfileUpdateAction());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateOrEditEventContainer);
