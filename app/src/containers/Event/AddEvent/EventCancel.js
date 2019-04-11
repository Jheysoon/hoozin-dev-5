import React from "react";
import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import firebase from "react-native-firebase";
import { withNavigation } from "react-navigation";
import { TouchableOpacity, Alert, Platform } from "react-native";

import { IconsMap } from "assets/assetMap";
import AddEventSvg from "../../../svgs/AddEvent";
import { EventServiceAPI } from "../../../api/index";
import { AddOrCreateEventStyles } from "./addevent.style";

const eventSrv = new EventServiceAPI();

class EventCancel extends React.Component {
  constructor(props) {
    super(props);

    this.onEventCancel = this.onEventCancel.bind(this);
    this.removeEvent = this.removeEvent.bind(this);
  }

  onEventCancel() {
    const { isEditMode, navigation, id, user } = this.props;

    if (!isEditMode) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "Yikes, you are about to cancel your event!",
      "If you cancel, the invited people will be notified of this cancellation",
      [
        {
          text: "Back To Event Overview",
          onPress: () => {
            eventSrv
              .updateEvent(id, { status: "confirmed" }, user.socialUID)
              .then(() => {
                this.props.navigation.goBack();
              });
          }
        },
        { text: "Go Back!", onPress: () => {}, style: "cancel" },
        {
          text: "Cancel Event!",
          onPress: () => {
            const removeEvent = firebase
              .functions()
              .httpsCallable("removeEvent");

            removeEvent({
              id: id,
              userId: user.socialUID
            }).then(() => {
              this.props.navigation.navigate({
                routeName: "EventList",
                key: "EventList"
              });
            });
          }
        }
      ],
      { cancelable: false }
    );
  }

  /**
   * @TODO change this to cloud functions
   * @description Removes the event. Has 2 dependencies - delete eventId from friends and the user who is friend
   *
   */
  removeEvent() {
    const { id } = this.props;

    const eventSvc = new EventServiceAPI();
    eventSvc
      .getEventInviteesDetailsAPI(id, this.props.user.socialUID)
      .then(async snapshot => {
        if (snapshot._value) {
          const removedResultFromFriend = await this.removeEventFromFriends(
            snapshot,
            id
          );
          const removedResultFromUser = await this.removeEventFromUser(
            snapshot,
            id
          );
          if (removedResultFromFriend && removedResultFromUser) {
            //safe to delete the entire event
            eventSvc
              .removeEventFromHostAndInviteeAPI(id, this.props.user.socialUID)
              .then(() => {
                // redirect to event list
                this.props.navigation.navigate({
                  routeName: "EventList",
                  key: "EventList"
                });
              });
          }
        }
      });
  }

  /**
   * @TODO change this to cloud functions
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
   * @TODO change this to cloud functions
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

  render() {
    return (
      <TouchableOpacity
        onPress={this.onEventCancel}
        style={AddOrCreateEventStyles.fabLeftWrapperStyles}
      >
        {Platform.OS === "ios" ? (
          <Image
            source={IconsMap.icon_close_red}
            style={AddOrCreateEventStyles.fabStyles}
          />
        ) : (
          <Image
            source={{ uri: AddEventSvg.btn_Delete }}
            style={AddOrCreateEventStyles.fabStyles}
          />
        )}
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user
  };
};

export default connect(
  mapStateToProps,
  null
)(withNavigation(EventCancel));
