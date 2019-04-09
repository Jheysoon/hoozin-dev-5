import React from "react";
import { Text, View } from "react-native";

const NoEvents = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text
        style={{
          textAlign: "center",
          textAlignVertical: "center"
        }}
      >
        No events to show right now
      </Text>
    </View>
  );
};

export default NoEvents;
