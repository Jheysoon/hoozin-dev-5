import React from "react";
import Image from "react-native-remote-svg";
import { withNavigation } from "react-navigation";
import { TouchableOpacity, Platform } from "react-native";

import { IconsMap } from "assets/assetMap";
import AddEventSvg from "../../../svgs/AddEvent";
import { AddOrCreateEventStyles } from "./addevent.style";

class EventOverview extends React.Component {
  constructor(props) {
    super(props);

    this.goBackToOverview = this.goBackToOverview.bind(this);
  }

  goBackToOverview() {
    /**
     * @TODO verify why it needs the event to be confirmed
     */
    /* eventSvc
      .updateEventAPI(this.props.user.socialUID, this.state.eventId, {
        status: "confirmed"
      }) */
    this.props.navigation.goBack();
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

export default withNavigation(EventOverview);
