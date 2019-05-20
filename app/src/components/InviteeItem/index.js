import _ from "lodash";
import React from "react";
import Image from "react-native-remote-svg";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CachedImage } from "react-native-cached-image";
import UserAvatar from "react-native-user-avatar";

import { IconsMap } from "../../../assets/assetMap";
import EventAddInviteeItem from "./EventAddInviteeItem";
import EventOverviewItem from "./EventOverviewItem";
import EventDetailInvitee from "./EventDetailInvitee";

const InviteeItem = ({
  data,
  addToEvent,
  removeToEvent,
  viewType,
  showUserProfile,
  showInviteeLocation
}) => {
  return (
    <View style={{ paddingTop: 3 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          borderRadius: 40,
          marginLeft: 2,
          shadowColor: "#707070",
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.5,
          borderColor: "#707070",
          elevation: 2
        }}
      >
        <View style={{ flex: 1 }}>
          {(viewType == "eventDetail" || viewType == "eventActiveUser") && (
            <EventDetailInvitee showUserProfile={showUserProfile} data={data} />
          )}

          {viewType != "eventDetail" && viewType != "eventActiveUser" && (
            <React.Fragment>
              {data.profileImgUrl ? (
                <View
                  style={{
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    marginLeft: 3
                  }}
                >
                  <UserAvatar
                    size={40}
                    name={data.name}
                    src={data.profileImgUrl}
                    component={CachedImage}
                  />
                </View>
              ) : (
                <UserAvatar size={40} name={data.name} style={styles.avatar} />
              )}
            </React.Fragment>
          )}
        </View>

        <View style={{ flex: 4, justifyContent: "center" }}>
          <Text
            style={
              data.colorChange
                ? { fontSize: 17, color: "red" }
                : {
                    fontSize: 17,
                    position: "relative",
                    top: -3
                  }
            }
          >
            {data.name}
          </Text>
        </View>

        {viewType == "eventActiveUser" && data.status == "going" && (
          <TouchableOpacity
            style={{ marginRight: 4, marginTop: 5 }}
            onPress={() => showInviteeLocation(data.inviteeId || data.userId)}
          >
            <Image
              source={{
                uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <defs>
    <style>
      .cls-1 {
        fill: none;
      }

      .cls-2 {
        fill: #2699fb;
        fill-rule: evenodd;
      }
    </style>
  </defs>
  <g id="Places" transform="translate(-207 -596)">
    <rect id="Rectangle_305" data-name="Rectangle 305" class="cls-1" width="16" height="16" transform="translate(207 596)"/>
    <path id="Path_114" data-name="Path 114" class="cls-2" d="M6.58,9.47A2.786,2.786,0,0,0,9.371,6.679,2.872,2.872,0,0,0,6.58,3.788,2.786,2.786,0,0,0,3.788,6.579,2.942,2.942,0,0,0,6.58,9.47ZM1.894,1.894a6.626,6.626,0,0,1,9.371,9.371L6.58,15.95,1.894,11.265A6.807,6.807,0,0,1,1.894,1.894Z" transform="translate(207.975 596.05)"/>
  </g>
</svg>
`
              }}
              style={{ width: 26, height: 26 }}
            />
          </TouchableOpacity>
        )}

        {viewType == "addInvitee" && (
          <EventAddInviteeItem
            data={data}
            addToEvent={addToEvent}
            removeToEvent={removeToEvent}
          />
        )}

        {(viewType == "eventOverview" ||
          viewType == "eventActiveUser" ||
          viewType == "eventDetail") && <EventOverviewItem data={data} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    width: 40,
    height: 40,
    marginTop: 2,
    borderRadius: 20
    //marginLeft: -8
  }
});

export default InviteeItem;
