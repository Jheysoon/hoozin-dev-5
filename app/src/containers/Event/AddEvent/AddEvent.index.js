import React, { Component } from "react";
import { Formik } from "formik";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import Image from "react-native-remote-svg";
import { Container, Content, Footer, Left, Body, Right } from "native-base";
import { connect } from "react-redux";
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
import AddEventForm from "./AddEventForm";
import { validate } from "./validate";
import AddEventSvg from "../../../svgs/AddEvent";
import EventCancel from "./EventCancel";
import EventOverview from "./EventOverview";

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
      isEventFormEmpty: false,
      evtCoords: null,
      textInputHeight: 0
    };

    this.assignDateEnd = this.assignDateEnd.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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
    //console.log("@@@ Add event nextprops", nextProps);
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
    let evtCoords = this.state.evtCoords;

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
        eventId,
        evtCoords
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
                // redirect to event list
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

  onSubmit(values, actions) {}

  render() {

    const initialValues = {
      privateValue: this.state.privateValue,
      eventTitle: this.state.eventTitle,
      eventType: this.state.eventType,
      startDate: this.state.startDate,
      startTime: this.state.startTime,
      endDate: this.state.endDate,
      endTime: this.state.endTime,
      location: this.state.location
    };

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

            <Formik
              initialValues={initialValues}
              validate={validate}
              onSubmit={this.onSubmit}
              render={props => (
                <React.Fragment>
                  <AddEventForm form={props} />

                  {Platform.OS === "ios" ? (
                    <Footer style={AddOrCreateEventStyles.bottomView_ios}>
                      <Left>
                        {this.state.isEditMode ? (
                          <View>
                            <EventCancel isEditMode={this.state.isEditMode} />
                            <EventOverview isEditMode={this.state.isEditMode} />
                          </View>
                        ) : (
                          <EventCancel isEditMode={this.state.isEditMode} />
                        )}
                      </Left>
                      <Body />
                      <Right>
                        <TouchableOpacity
                          disabled={props.isSubmitting}
                          onPress={props.handleSubmit}
                          style={AddOrCreateEventStyles.fabRightWrapperStyles}
                        >
                          {Platform.OS === "ios" ? (
                            <Image
                              source={IconsMap.icon_next}
                              style={AddOrCreateEventStyles.fabStyles}
                            />
                          ) : (
                            <Image
                              source={{ uri: AddEventSvg.btn_Next }}
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
                            <EventCancel isEditMode={this.state.isEditMode} />
                            <EventOverview isEditMode={this.state.isEditMode} />
                          </View>
                        ) : (
                          <EventCancel isEditMode={this.state.isEditMode} />
                        )}
                      </Left>
                      <Body />
                      <Right>
                        <TouchableOpacity
                          disabled={props.isSubmitting}
                          onPress={props.handleSubmit}
                          style={AddOrCreateEventStyles.fabRightWrapperStyles}
                        >
                          {Platform.OS === "ios" ? (
                            <Image
                              source={IconsMap.icon_next}
                              style={AddOrCreateEventStyles.fabStyles}
                            />
                          ) : (
                            <Image
                              source={{ uri: AddEventSvg.btn_Next }}
                              style={AddOrCreateEventStyles.fabStyles}
                            />
                          )}
                        </TouchableOpacity>
                      </Right>
                    </View>
                  )}
                </React.Fragment>
              )}
            />
          </Content>
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
      eventId,
      eventCoords
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
          eventId,
          eventCoords
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
