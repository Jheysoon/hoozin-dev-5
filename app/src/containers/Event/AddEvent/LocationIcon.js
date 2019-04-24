import React from "react";
import { Platform } from "react-native";
import Image from "react-native-remote-svg";

import AddEventSvg from "../../../svgs/AddEvent";
import { IconsMap } from "../../../../assets/assetMap";

const LocationIcon = () => {
  return (
    <React.Fragment>
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
          source={{ uri: AddEventSvg.Places }}
          style={{
            width: 30,
            height: 30,
            position: "absolute",
            left: -10,
            top: 4,
            zIndex: 9999
          }}
        />
      )}
    </React.Fragment>
  );
};

export default LocationIcon;
