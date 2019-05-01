import React from "react";
import { withNavigation } from "react-navigation";
import { Col, Grid } from "react-native-easy-grid";
import { StyleSheet, Text, View } from "react-native";
import { Left, Body, Icon, ListItem, Thumbnail } from "native-base";

import { IconsMap } from "assets/assetMap";

const FriendItem = ({ data, navigation }) => {
  return (
    <ListItem avatar style={styles.list} onPress={() => {
      navigation.navigate("FriendView", {
        id: data.id
      })
    }}>
      <Left>
        {data.profileImgUrl ? (
          <Thumbnail
            style={[
              styles.baseAvatar,
              {
                alignSelf: "center",
                marginTop: -10,
                marginLeft: 4
              }
            ]}
            source={{ uri: data.profileImgUrl }}
          />
        ) : (
          <Thumbnail
            source={IconsMap.icon_contact_avatar}
            style={[styles.baseAvatar, styles.avatar]}
          />
        )}
      </Left>
      <Body style={{ borderBottomColor: "transparent" }}>
        <Text style={{ marginTop: -10, color: "#000" }}>{data.name}</Text>
        <Grid>
          <Col>
            <View style={styles.wrapFlex}>
              <Icon
                type="MaterialCommunityIcons"
                style={{ fontSize: 15, color: "#7fc4fd" }}
                name="email-variant"
              />
              <Text style={{ fontSize: 10 }}>{data.email}</Text>
            </View>
          </Col>
          <Col>
            <View style={styles.wrapFlex}>
              <Icon
                type="Entypo"
                style={{ fontSize: 15, color: "#7fc4fd", marginLeft: 20 }}
                name="phone"
              />
              <Text style={{ fontSize: 10 }}>{data.phone}</Text>
            </View>
          </Col>
        </Grid>
      </Body>
    </ListItem>
  );
};

const styles = StyleSheet.create({
  baseAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19
  },
  avatar: {
    alignSelf: "center",
    marginTop: -10,
    marginLeft: 4
  },
  list: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 3,
    shadowColor: "#000000",
    shadowColor: "#707070",
    shadowOffset: { width: 6, height: 12 },
    shadowOpacity: 1,
    borderRadius: 5,
    elevation: 2
  },
  wrapFlex: {
    flexDirection: "row",
    flexWrap: "wrap"
  }
});

export default withNavigation(FriendItem);
