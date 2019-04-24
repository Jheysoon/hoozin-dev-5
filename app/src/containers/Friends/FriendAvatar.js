import React from "react";
import Image from "react-native-remote-svg";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

import { IconsMap } from "assets/assetMap";

const FriendAvatar = props => {
  return (
    <View style={styles.avatarView}>
      <TouchableOpacity>
        {props.profileImgUrl ? (
          <Image
            source={{ uri: props.profileImgUrl }}
            style={{ width: 117, height: 117, borderRadius: 117 / 2 }}
          />
        ) : (
          <Image source={IconsMap.icon_user_avatar} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarView: {
    flex: 1,
    alignItems: "center"
  }
});

export default FriendAvatar;
