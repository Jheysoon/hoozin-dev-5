import React from "react";
import Image from "react-native-remote-svg";
import { withNavigation } from "react-navigation";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";

import { IconsMap } from "assets/assetMap";
import AddEventSvg from "../../../svgs/AddEvent";
import { AddOrCreateEventStyles } from "./addevent.style";

class EventOverview extends React.Component {
  constructor(props) {
    super(props);

    this.goBackToOverview = this.goBackToOverview.bind(this);
  }

  goBackToOverview() {

  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => this.goBackToOverview()}
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
