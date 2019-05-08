import React from "react";
import { withNavigation } from "react-navigation";
import { Col, Grid } from "react-native-easy-grid";
import { StyleSheet, Text, View, Platform } from "react-native";
import { Left, Body, Icon, ListItem, Thumbnail } from "native-base";
import UserAvatar from "react-native-user-avatar";

import { IconsMap } from "assets/assetMap";

const FriendItem = ({ data, navigation }) => {
  return (
    <ListItem
      avatar
      style={Platform.select({
        ios: styles.listIos,
        android: styles.listAndroid
      })}
      onPress={() => {
        navigation.navigate("FriendView", {
          id: data.id
        });
      }}
    >
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
          <UserAvatar
            size={38}
            name={data.name}
            containerStyle={[styles.baseAvatar, styles.avatar]}
            component={Thumbnail}
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
    marginTop: -30,
    marginLeft: 4
  },
  listIos: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 3,
    borderRadius: 5,
    borderWidth: 0.5,
    paddingTop: 5,
    borderColor: "rgba(0,0,0,.3)"
  },
  listAndroid: {
    marginLeft: 4,
    marginRight: 4,
    marginTop: 3,
    borderRadius: 5,
    elevation: 2
  },
  wrapFlex: {
    flexDirection: "row",
    flexWrap: "wrap"
  }
});

export default withNavigation(FriendItem);
