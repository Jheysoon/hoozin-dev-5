import React from "react";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import Image from "react-native-remote-svg";
import { List, ListItem } from "native-base";
import moment from "moment";
import { withNavigation } from "react-navigation";

import { IconsMap } from "../../../assets/assetMap";

import { CachedImage } from "react-native-cached-image";

const eventStatusColor = {
  goingOrHost: "#6EB25A",
  invitedOrMaybe: "#EF9A12",
  declined: "#FF003B"
};

import styles from "./style";

class HoozinList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { eventData, key, loadImagesStart, loadImagesComplete } = this.props;

    // destructure event attributes for ease
    const {
      eventResponse,
      eventTitle,
      eventType,
      startDateTimeInUTC,
      endDateTimeInUTC,
      location,
      invitee,
      isHostEvent,
      keyNode,
      hostId,
      isActive,
      isPastEvent
    } = eventData;

    return (
      <TouchableOpacity
        onPress={() => this.props.showEventInfo(eventData)}
        key={key}
      >
        <View style={styles.eventDetailCard}>
          <View style={styles.eventDetail}>
            <View style={styles.cardAvatarWrapper}>
              <View>
                {eventData.hostProfileImgUrl ? (
                  <View style={styles.cardAvatar}>
                    <CachedImage
                      source={{ uri: eventData.hostProfileImgUrl }}
                      style={{
                        alignSelf: "center",
                        width: 85,
                        height: 85,
                        borderRadius: 85 / 2
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.cardAvatar}>
                    <Image
                      source={IconsMap.icon_contact_avatar}
                      style={{
                        alignSelf: "center",
                        width: 85,
                        height: 85,
                        borderRadius: 85 / 2
                      }}
                    />
                  </View>
                )}
              </View>
              <View style={{ paddingTop: 1 }}>
                <Text style={styles.eventHostName}>{eventData.hostName}</Text>
              </View>
            </View>
            <View style={styles.cardDetail}>
              <View>
                <Text style={styles.eventTitle}>{eventTitle}</Text>
              </View>
              <View style={styles.eventMetaWrapper}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#FC3764",
                      fontSize: 12,
                      fontFamily: "Lato",
                      marginTop: -10
                    }}
                  >
                    {moment
                      .utc(startDateTimeInUTC)
                      .local()
                      .format("MMM")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      fontFamily: "Lato",
                      color: "#1D6CBC"
                    }}
                  >
                    {moment
                      .utc(startDateTimeInUTC)
                      .local()
                      .format("DD")}
                  </Text>
                </View>
                <View style={{ flex: 4 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Lato",
                      color: "#000000"
                    }}
                  >
                    {moment
                      .utc(startDateTimeInUTC)
                      .local()
                      .format("hh:mm A")}{" "}
                    -{" "}
                    {moment
                      .utc(endDateTimeInUTC)
                      .local()
                      .format("hh:mm A")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Lato",
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#000000",
                      marginTop: 10
                    }}
                  >
                    {location}
                  </Text>
                </View>
                <View style={{ flex: 1.8, marginLeft: 15 }}>
                  {eventResponse == "host" || eventResponse == "going" ? (
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Lato",
                        color: eventStatusColor.goingOrHost,
                        textAlign: "center"
                      }}
                    >{`${eventResponse
                      .slice(0, 1)
                      .toUpperCase()}${eventResponse.slice(
                      1,
                      eventResponse.length
                    )}`}</Text>
                  ) : eventResponse == "invited" || eventResponse == "maybe" ? (
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Lato",
                        color: eventStatusColor.invitedOrMaybe,
                        textAlign: "center"
                      }}
                    >{`${eventResponse
                      .slice(0, 1)
                      .toUpperCase()}${eventResponse.slice(
                      1,
                      eventResponse.length
                    )}`}</Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Lato",
                        color: eventStatusColor.declined,
                        textAlign: "center"
                      }}
                    >{`${eventResponse
                      .slice(0, 1)
                      .toUpperCase()}${eventResponse.slice(
                      1,
                      eventResponse.length
                    )}`}</Text>
                  )}
                  {isActive ? (
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Lato",
                        color: "white",
                        padding: 4,
                        backgroundColor: "#FF003B",
                        textAlign: "center",
                        position: "relative",
                        left: -5
                      }}
                    >
                      Active!
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Lato",
                      color: "#004D9B",
                      textAlign: "center",
                      position: "relative",
                      left: 0,
                      top: 40
                    }}
                  >
                    {eventType}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.invitees}>
            {invitee ? (
              <List
                dataArray={invitee}
                horizontal={true}
                style={{ marginTop: 20 }}
                renderRow={(item, key) => (
                  <ListItem
                    key={key}
                    style={{
                      paddingRight: 0,
                      paddingLeft: 0,
                      paddingTop: 0,
                      paddingBottom: 0,
                      marginLeft: 5,
                      borderBottomWidth: 0
                    }}
                  >
                    {item.profileImgUrl ? (
                      <CachedImage
                        source={{ uri: item.profileImgUrl }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24
                        }}
                        permanent={true}
                      />
                    ) : (
                      <Image
                        source={IconsMap.icon_contact_avatar}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24
                        }}
                      />
                    )}
                  </ListItem>
                )}
              />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default withNavigation(HoozinList);
