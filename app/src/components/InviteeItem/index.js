import _ from "lodash";
import React from "react";
import Image from "react-native-remote-svg";
import { View, Text, StyleSheet } from "react-native";
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
  showUserProfile
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
          {viewType == "eventDetail" && (
            <EventDetailInvitee showUserProfile={showUserProfile} data={data} />
          )}

          {viewType != "eventDetail" && (
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

        {viewType == "addInvitee" && (
          <EventAddInviteeItem
            data={data}
            addToEvent={addToEvent}
            removeToEvent={removeToEvent}
          />
        )}

        {viewType == "eventOverview" ||
          (viewType == "eventDetail" && <EventOverviewItem data={data} />)}
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
