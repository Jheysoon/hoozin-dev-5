import _ from "react";
import React from "react";
import { PropTypes } from "prop-types";
import { Icon, Button } from "native-base";
import Image from "react-native-remote-svg";
import { View, Text, StyleSheet } from "react-native";
import { CachedImage } from "react-native-cached-image";

import { IconsMap } from "assets/assetMap";

const AddInviteeList = ({ list, addToEvent, removeToEvent }) => {
  return (
    <View style={{ flex: 18 }}>
      {list.map((data, key) => (
        <View style={{ paddingTop: 3 }} key={key}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "white",
              borderRadius: 40,
              marginLeft: 2,
              shadowColor: "#707070",
              shadowOffset: { width: 6, height: 6 },
              shadowOpacity: 0.3
            }}
          >
            <View style={{ flex: 1 }}>
              {data.profileImgUrl ? (
                <CachedImage
                  source={{ uri: data.profileImgUrl }}
                  style={styles.avatar}
                />
              ) : (
                <Image
                  source={IconsMap.icon_contact_avatar}
                  style={styles.avatar}
                />
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

            {data.preselect ? (
              <Button
                transparent
                icon
                disabled={
                  _.has(data, "status") &&
                  (data.status == "going" || data.status == "maybe")
                    ? true
                    : false
                }
                style={{ alignSelf: "center" }}
                onPress={() => removeToEvent(data)}
              >
                {minusIcon(data)}
              </Button>
            ) : (
              <Button
                transparent
                icon
                style={{ alignSelf: "center" }}
                onPress={() => addToEvent(data)}
              >
                <Icon
                  type="FontAwesome"
                  name="plus"
                  style={{ color: "#6EB25A" }}
                />
              </Button>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const minusIcon = data => {
  if (
    _.has(data, "status") &&
    (data.status == "going" || data.status == "maybe")
  ) {
    return null;
  }

  return <Icon type="FontAwesome" name="minus" style={{ color: "#FC3764" }} />;
};

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20
  }
});

AddInviteeList.propTypes = {
  list: PropTypes.array,
  addToEvent: PropTypes.func,
  removeToEvent: PropTypes.func
};

export default AddInviteeList;
