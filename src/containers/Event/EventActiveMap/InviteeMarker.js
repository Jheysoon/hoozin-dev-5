import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import { Marker } from "react-native-maps";
import imageCacheHoc from "react-native-image-cache-hoc";

import { IconsMap } from "../../../../assets/assetMap";
import { getInviteeLocation } from "../../../actions/events/invitee";

const CacheableImage = imageCacheHoc(Image);

class InviteeMarker extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let invitees = new Array();

    _.forEach(this.props.invitee, invitee => {
      invitees.push(invitee.inviteeId);
    });

    invitees.push(this.props.hostId);

    // watch for invitee and host location
    this.props.getInviteeLocation(invitees);
  }

  render() {
    const { inviteeLocations } = this.props;

    return inviteeLocations && inviteeLocations.length
      ? inviteeLocations.map((invitee, key) => (
          <Marker
            coordinate={{
              latitude: invitee.lat == undefined ? 0 : invitee.lat,
              longitude: invitee.lng == undefined ? 0 : invitee.lng
            }}
            key={key}
          >
            {invitee.userProfileImg ? (
              <CacheableImage
                source={{ uri: invitee.userProfileImg }}
                permanent={true}
                style={{ width: 47, height: 47, borderRadius: 47 / 2 }}
              />
            ) : (
              <Image
                source={IconsMap.icon_contact_avatar}
                style={{ width: 47, height: 47, borderRadius: 47 / 2 }}
              />
            )}
          </Marker>
        ))
      : null;
  }
}

const mapStateToProps = state => {
  return {
    inviteeLocations: state.invitee.locations
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getInviteeLocation: invitees => {
      dispatch(getInviteeLocation(invitees));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InviteeMarker);
