import React from "react";
import { connect } from "react-redux";
import Image from "react-native-remote-svg";
import { withNavigation } from "react-navigation";
import { TouchableOpacity, Platform } from "react-native";

import { IconsMap } from "assets/assetMap";
import AddEventSvg from "../../../svgs/AddEvent";
import { EventServiceAPI } from "../../../api/index";
import { AddOrCreateEventStyles } from "./addevent.style";

const eventSrv = new EventServiceAPI();

class EventOverview extends React.Component {
  constructor(props) {
    super(props);

    this.goBackToOverview = this.goBackToOverview.bind(this);
  }

  goBackToOverview() {
    const { id, user } = this.props;

    eventSrv
      .updateEvent(id, { status: "confirmed" }, user.socialUID)
      .then(() => {
        this.props.navigation.goBack();
      });
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.goBackToOverview}
        style={{
          position: "absolute",
          left: 80,
          bottom: -32
        }}
      >
        {Platform.OS === "ios" ? (
          <Image
            source={IconsMap.icon_chevron_left}
            style={AddOrCreateEventStyles.fabStyles}
          />
        ) : (
          <Image
            source={{ uri: AddEventSvg.Search_Field }}
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
)(withNavigation(EventOverview));
