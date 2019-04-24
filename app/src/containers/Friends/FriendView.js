// @flow
import React from "react";
import Image from "react-native-remote-svg";
import firebase from "react-native-firebase";
import { withNavigation } from "react-navigation";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import {
  Container,
  Content,
  List,
  ListItem,
  Body,
  Left,
  Right,
  Footer,
  Fab,
  Icon
} from "native-base";

import FriendAvatar from "./FriendAvatar";
import { IconsMap } from "assets/assetMap";
import AppBarComponent from "../../components/AppBar/appbar.index";

// @models
import type { User } from "../../models/User";

class FriendView extends React.Component<any, User> {
  static navigationOptions = {
    header: null
  };

  state: User = {
    accountType: "",
    address: "",
    countryCode: "",
    email: "",
    name: "",
    phone: "",
    profileImgUrl: "",
    status: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    snapchat: "",
    strava: ""
  };

  componentWillMount() {
    const { params } = this.props.navigation.state;

    const getUser = firebase.functions().httpsCallable("getUser");

    getUser({
      id: params.id
    }).then(({ data }) => {
      this.setState(data);
    });
  }

  render() {
    const {
      profileImgUrl,
      name,
      email,
      phone,
      facebook,
      instagram,
      linkedin
    } = this.state;

    return (
      <Container>
        <AppBarComponent showBackBtnCircle={false} isMenuHidden={true} />

        <Content>
          <FriendAvatar profileImgUrl={profileImgUrl} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 19, color: "#000" }}>{name}</Text>
            <Text>{email}</Text>
            <Text>{phone}</Text>
          </View>
          <View
            style={{
              width: "100%",
              height: 2,
              backgroundColor: "#BCE0FD",
              marginTop: 10,
              marginBottom: 10
            }}
          />

          <List>
            <ListItem noBorder={true}>
              <Left style={{ width: 10 }}>
                {Platform.OS === "ios" ? (
                  <Image source={IconsMap.icon_fb_26x26} />
                ) : (
                  <Image source={IconsMap.icon_fb} />
                )}
              </Left>
              <Body style={{ marginLeft: -100 }}>
                <Text>{facebook}</Text>
              </Body>
            </ListItem>

            <ListItem noBorder={true}>
              <Left style={{ width: 10 }}>
                {Platform.OS === "ios" ? (
                  <Image source={IconsMap.icon_instagram} />
                ) : (
                  <Image source={IconsMap.icon_instagram_png} />
                )}
              </Left>
              <Body style={{ marginLeft: -100 }}>
                <Text>{instagram}</Text>
              </Body>
            </ListItem>

            <ListItem noBorder={true}>
              <Left style={{ width: 10 }}>
                {Platform.OS === "ios" ? (
                  <Image source={IconsMap.icon_linkedin} />
                ) : (
                  <Image source={IconsMap.icon_linkedin_png} />
                )}
              </Left>
              <Body style={{ marginLeft: -100 }}>
                <Text>{linkedin}</Text>
              </Body>
            </ListItem>
          </List>
        </Content>

        <Fab
          direction="up"
          style={{ backgroundColor: "#2699FB" }}
          position="bottomRight"
          onPress={() => {
            this.props.navigation.goBack();
          }}
        >
          <Icon type="AntDesign" name="back" />
        </Fab>
      </Container>
    );
  }
}

export default withNavigation(FriendView);
