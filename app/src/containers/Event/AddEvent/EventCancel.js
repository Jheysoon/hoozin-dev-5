import React from "react";
import Image from "react-native-remote-svg";
import { withNavigation } from "react-navigation";
import { TouchableOpacity, Alert, Platform } from "react-native";

import { IconsMap } from "assets/assetMap";
import AddEventSvg from "../../../svgs/AddEvent";
import { AddOrCreateEventStyles } from "./addevent.style";

class EventCancel extends React.Component {
  constructor(props) {
    super(props);

    this.onEventCancel = this.onEventCancel.bind(this);
  }

  onEventCancel() {
    const { isEditMode, navigation } = this.props;

    if (!isEditMode) {
      navigation.goBack();
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
            //this.removeEvent(this.state.eventId);
          }
        }
      ],
      { cancelable: false }
    );
  }

  render() {
    return (
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
            source={{ uri: AddEventSvg.btn_Delete }}
            style={AddOrCreateEventStyles.fabStyles}
          />
        )}
      </TouchableOpacity>
    );
  }
}

export default withNavigation(EventCancel);
