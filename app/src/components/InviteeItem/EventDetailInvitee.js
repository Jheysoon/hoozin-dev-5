import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Image from "react-native-remote-svg";
import { CachedImage } from "react-native-cached-image";
import UserAvatar from "react-native-user-avatar";

import { IconsMap } from "../../../assets/assetMap";

const EventDetailInvitee = ({ data, showUserProfile }) => {
  return (
    <TouchableOpacity
      onPress={() => showUserProfile(data.inviteeId)}
      style={{ flex: 1 }}
    >
      {data.profileImgUrl ? (
        <View
          style={{ borderRadius: 20, width: 40, height: 40, marginLeft: 1 }}
        >
          <CachedImage
            source={{ uri: data.profileImgUrl }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        </View>
      ) : (
        <UserAvatar size={40} name={data.name} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    width: 40,
    height: 40,
    marginTop: 2,
    borderRadius: 20,
    marginLeft: -8
  }
});

export default EventDetailInvitee;
