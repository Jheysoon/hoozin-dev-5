import React from "react";
import { View } from "react-native";

const inviteeStatusMarker = {
  going: "rgba(110, 178, 90, 0.55)",
  invited: "rgba(239, 154, 18, 0.55)",
  declined: "rgba(255, 0, 59, 0.55)"
};

const EventOverviewItem = ({ data }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {data.status == "invited" || data.status == "maybe" ? (
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: inviteeStatusMarker.invited,
            position: "relative",
            left: 20
          }}
        />
      ) : data.status == "going" || data.status == "accepted" ? (
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: inviteeStatusMarker.going,
            position: "relative",
            left: 20
          }}
        />
      ) : (
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: inviteeStatusMarker.declined,
            position: "relative",
            left: 20
          }}
        />
      )}
    </View>
  );
};

export default EventOverviewItem;
