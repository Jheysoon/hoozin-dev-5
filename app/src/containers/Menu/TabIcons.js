import React from 'react';
import { Icon } from "native-base";

const TabIcons = ({route, focused}) => {
  if (route.key == "about") {
    return (
      <Icon
        type="Ionicons"
        name="ios-information-circle-outline"
        style={{
          color: focused ? "#1d6cbc" : "rgba(29, 108, 188, .7)",
          marginLeft: -8
        }}
      />
    );
  }

  if (route.key == "profile") {
    return (
      <Icon
        type="Entypo"
        name="user"
        style={{
          color: focused ? "#1d6cbc" : "rgba(29, 108, 188, .7)",
          marginLeft: -8
        }}
      />
    );
  }

  if (route.key == "friends") {
    return (
      <Icon
        type="Entypo"
        name="users"
        style={{
          color: focused ? "#1d6cbc" : "rgba(29, 108, 188, .7)"
        }}
      />
    );
  }
}

export default TabIcons;