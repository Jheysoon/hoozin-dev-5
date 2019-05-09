import React from "react";
import _ from "lodash";
import moment from "moment";
import { connect } from "react-redux";
import { Marker } from "react-native-maps";
import Image from "react-native-remote-svg";
import firebase from "react-native-firebase";

import { EventServiceAPI } from "../../../api";
import { IconsMap } from "../../../../assets/assetMap";
import {
  getInviteeLocation,
  detachListeners
} from "../../../actions/events/invitee";
import UserAvatar from "../../../components/UserAvatar";

const eventServiceApi = new EventServiceAPI();

let reference = null;
let listener;

class InviteeMarker extends React.Component {
  constructor(props) {
    super(props);

    this.subInvitee = this.subInvitee.bind(this);
    this.determineTime = this.determineTime.bind(this);
  }

  determineTime(startDateTimeInUTC, endDateTimeInUTC) {
    const startDateTimeInUtc = moment.utc(startDateTimeInUTC);
    const endDateTimeInUtc = moment.utc(endDateTimeInUTC);

    const currentDateTimeInUtc = moment.utc();
    const subtractStart = startDateTimeInUtc.subtract(15, "minutes");
    const subtractEnd = endDateTimeInUtc.subtract(15, "minutes");

    return (
      currentDateTimeInUtc.isSameOrAfter(subtractStart) &&
      currentDateTimeInUtc.isSameOrBefore(subtractEnd)
    );
  }

  subInvitee(inviteeList) {
    let invitees = [];
    let eventDetail = _.find(this.props.eventList, {
      keyNode: this.props.eventId
    });

    if (eventDetail) {
      // filter invitees for the going status only
      _.forEach(inviteeList, val => {
        if (
          val.status == "going" &&
          this.determineTime(
            eventDetail.startDateTimeInUTC,
            eventDetail.endDateTimeInUTC
          )
        ) {
          invitees.push(val.userId);
        }
      });
    }

    if (this.props.hostId) {
      invitees.push(this.props.hostId);
    }

    // watch for invitee and host location
    this.props.getInviteeLocation(invitees);
  }

  async componentDidMount() {
    let connected = await eventServiceApi.checkForConnection();

    if (connected.val()) {

      // @TODO: if the event is public the invitees is not required
      reference = firebase.database().ref(`invitees/${this.props.eventId}`);
      listener = reference.on("value", inviteeSnapshot => {
        if (inviteeSnapshot.val()) {
          let invitee = Object.keys(inviteeSnapshot._value).map(key => {
            inviteeSnapshot._value[key]["inviteeId"] = key;
            return inviteeSnapshot._value[key];
          });

          this.subInvitee(invitee);
        }
      });
    }
  }

  componentWillUnmount() {
    if (reference) {
      reference.off("value", listener);
    }

    this.props.detachListeners();
  }

  render() {
    const { inviteeLocations } = this.props;

    let invitees = [];

    _.forEach(inviteeLocations, val => {
      invitees.push(val);
    });

    //https://ui-avatars.com/api/?background=8e44ad&color=fff&name=jayson&bold=true&rounded=true&uppercase=false

    return invitees && invitees.length
      ? invitees.map((invitee, key) => (
          <Marker
            coordinate={{
              latitude: invitee.lat == undefined ? 0 : invitee.lat,
              longitude: invitee.lng == undefined ? 0 : invitee.lng
            }}
            key={key}
          >
            {invitee.profileImgUrl ? (
              <Image
                source={{ uri: invitee.profileImgUrl }}
                style={{ width: 47, height: 47, borderRadius: 47 / 2 }}
              />
            ) : (
              <Image
                source={IconsMap.icon_contact_avatar}
                style={{ width: 44, height: 44, borderRadius: 44 / 2 }}
              />
            )}
          </Marker>
        ))
      : null;
  }
}

const mapStateToProps = state => {
  return {
    inviteeLocations: state.invitee.locations,
    eventList: state.eventList.events
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getInviteeLocation: invitees => {
      dispatch(getInviteeLocation(invitees));
    },
    detachListeners: () => {
      dispatch(detachListeners());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteeMarker);
