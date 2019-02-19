import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
  Platform
} from "react-native";
import Image from "react-native-remote-svg";
import { Container, Content, Footer, Left, Body, Right } from "native-base";
import { connect } from "react-redux";
import { logOutAction } from "../actions/auth";
import AppBarComponent from "../components/AppBar/appbar.index";
import { IconsMap } from "assets/assetMap";

class MenuPage extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      isMenuOpened: false,
      tosUrl: "https://hoozin.app/termcondition",
      privacyUrl: "https://hoozin.app/privacypolicy",
      cookiesUrl: "https://hoozin.app/useofcookies"
    };
  }
  static navigationOptions = {
    header: null,
    gesturesEnabled: true
  };

  componentWillMount() {
    const { params } = this.props.navigation.state;
    if (!!params && !!params.isOpened) {
      this.setState({ isMenuOpened: params.isOpened });
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log("++ user next prop ++", nextProps.user);
    console.log("store report", this.props.user);
  }

  render() {
    return (
      <Container style={{ backgroundColor: "#ffffff" }}>
        <AppBarComponent openState={this.state.isMenuOpened} />
        <Content>
          <View style={styles.menus}>
            <TouchableOpacity onPress={() => this.onAboutPressed()}>
              <Image
                source={images.img_about}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.onProfilePressed()}>
              <Image
                source={images.img_profile}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.onFriendsPressed()}>
              <Image
                source={images.img_friends}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.onTermsAndConditionPressed(this.state.tosUrl)}
            >
              <Image
                source={images.img_terms}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.onProvideFeedbackPressed()}>
              <Image
                source={images.img_feedback}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.onPrivacyPressed(this.state.privacyUrl)}
            >
              <Image
                source={images.img_privacy}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.onCookieUsagePressed(this.state.cookiesUrl)}
            >
              <Image
                source={images.img_cookies}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.onLogoutPressed()}>
              <Image
                source={images.img_logout}
                resizeMode="cover"
                style={styles.buttons}
              />
            </TouchableOpacity>
          </View>
        </Content>

        {/* Have to comment this out first, for security  reasons only */}
        {/* {Platform.OS === "ios" ? (
          <Footer style={styles.bottomView_ios}>
            <Left>
              <TouchableOpacity
                // onPress={() => this.props.navigation.navigate({
                //     routeName: 'EventList',
                //     key: 'EventList',
                // })}
                style={styles.fabLeftWrapperStyles}
              >
                {Platform.OS === "ios" ? (
                  <Image
                    source={IconsMap.icon_list_circle}
                    style={styles.fabStyles}
                  />
                ) : (
                  <Image
                    source={{
                      uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                <defs>
                  <style>
                    .cls-1 {
                      fill: #2699fb;
                    }
              
                    .cls-2 {
                      fill: none;
                      stroke: #fff;
                      stroke-width: 3px;
                    }
              
                    .cls-3 {
                      filter: url(#Search_Field);
                    }
                  </style>
                  <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                    <feOffset dy="6" input="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feFlood flood-opacity="0.161"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                  </filter>
                </defs>
                <g id="btn_Event_List" transform="translate(-9 -619)">
                  <g class="cls-3" transform="matrix(1, 0, 0, 1, 9, 619)">
                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                  </g>
                  <g id="Group_483" data-name="Group 483" transform="translate(0.5 3.5)">
                    <g id="Group_479" data-name="Group 479">
                      <line id="Line_37" data-name="Line 37" class="cls-2" x2="18" transform="translate(32.5 632.5)"/>
                      <line id="Line_38" data-name="Line 38" class="cls-2" x2="3" transform="translate(26.5 632.5)"/>
                    </g>
                    <g id="Group_480" data-name="Group 480">
                      <line id="Line_39" data-name="Line 39" class="cls-2" x2="18" transform="translate(32.5 637.5)"/>
                      <line id="Line_40" data-name="Line 40" class="cls-2" x2="3" transform="translate(26.5 637.5)"/>
                    </g>
                    <g id="Group_481" data-name="Group 481">
                      <line id="Line_41" data-name="Line 41" class="cls-2" x2="18" transform="translate(32.5 642.5)"/>
                      <line id="Line_42" data-name="Line 42" class="cls-2" x2="3" transform="translate(26.5 642.5)"/>
                    </g>
                    <g id="Group_482" data-name="Group 482">
                      <line id="Line_43" data-name="Line 43" class="cls-2" x2="18" transform="translate(32.5 647.5)"/>
                      <line id="Line_44" data-name="Line 44" class="cls-2" x2="3" transform="translate(26.5 647.5)"/>
                    </g>
                  </g>
                </g>
              </svg>
              `
                    }}
                    style={styles.fabStyles}
                  />
                )}
              </TouchableOpacity>
            </Left>
            <Body />
            <Right />
          </Footer>
        ) : (
          <View style={styles.bottomView_android}>
            <Left>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("EventList")}
                style={styles.fabLeftWrapperStyles}
              >
                <Image
                  source={{
                    uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
              <defs>
                <style>
                  .cls-1 {
                    fill: #2699fb;
                  }
            
                  .cls-2 {
                    fill: none;
                    stroke: #fff;
                    stroke-width: 3px;
                  }
            
                  .cls-3 {
                    filter: url(#Search_Field);
                  }
                </style>
                <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                  <feOffset dy="6" input="SourceAlpha"/>
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feFlood flood-opacity="0.161"/>
                  <feComposite operator="in" in2="blur"/>
                  <feComposite in="SourceGraphic"/>
                </filter>
              </defs>
              <g id="btn_Event_List" transform="translate(-9 -619)">
                <g class="cls-3" transform="matrix(1, 0, 0, 1, 9, 619)">
                  <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                </g>
                <g id="Group_483" data-name="Group 483" transform="translate(0.5 3.5)">
                  <g id="Group_479" data-name="Group 479">
                    <line id="Line_37" data-name="Line 37" class="cls-2" x2="18" transform="translate(32.5 632.5)"/>
                    <line id="Line_38" data-name="Line 38" class="cls-2" x2="3" transform="translate(26.5 632.5)"/>
                  </g>
                  <g id="Group_480" data-name="Group 480">
                    <line id="Line_39" data-name="Line 39" class="cls-2" x2="18" transform="translate(32.5 637.5)"/>
                    <line id="Line_40" data-name="Line 40" class="cls-2" x2="3" transform="translate(26.5 637.5)"/>
                  </g>
                  <g id="Group_481" data-name="Group 481">
                    <line id="Line_41" data-name="Line 41" class="cls-2" x2="18" transform="translate(32.5 642.5)"/>
                    <line id="Line_42" data-name="Line 42" class="cls-2" x2="3" transform="translate(26.5 642.5)"/>
                  </g>
                  <g id="Group_482" data-name="Group 482">
                    <line id="Line_43" data-name="Line 43" class="cls-2" x2="18" transform="translate(32.5 647.5)"/>
                    <line id="Line_44" data-name="Line 44" class="cls-2" x2="3" transform="translate(26.5 647.5)"/>
                  </g>
                </g>
              </g>
            </svg>
            `
                  }}
                  style={styles.fabStyles}
                />
              </TouchableOpacity>
            </Left>
            <Body />
            <Right />
          </View>
        )} */}
      </Container>
    );
  }

  onMenuPressed() {}
  onBackPressed() {
    this.props.navigation.goBack();
  }

  onAboutPressed() {
    this.props.navigation.navigate({
      routeName: "About",
      key: "About"
    });
  }

  onProfilePressed() {
    this.props.navigation.navigate({
      routeName: "ShowProfile",
      key: "ShowProfile"
    });
  }

  onFriendsPressed() {}

  onTermsAndConditionPressed(url) {
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error("An error occurred", err));
  }

  onPrivacyPressed(url) {
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error("An error occurred", err));
  }

  onCookieUsagePressed(url) {
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error("An error occurred", err));
  }

  onProvideFeedbackPressed() {
    this.props.navigation.navigate({
      routeName: "Feedback",
      key: "Feedback"
    });
  }

  onLogoutPressed() {
    this.props.onLogout(this.props.user.socialUID);
    const { navigate } = this.props.navigation;
    //this.props.navigation.popToTop();
    navigate({
      routeName: "Login",
      key: "Login"
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 50,
    backgroundColor: "rgb(38, 153, 251)"
  },
  banner: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%"
  },
  title: {
    marginTop: 10,
    alignSelf: "center",
    width: "20%"
  },
  menuBack: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row-reverse"
  },
  sideMenu: {
    width: 30,
    height: 24,
    marginTop: 25,
    marginRight: 5
  },
  sideBackButton: {
    width: 22,
    height: 22,
    marginTop: 20,
    marginLeft: 5
  },
  menus: {
    flex: 1,
    flexDirection: "column"
  },
  buttons: {
    width: "98%",
    alignSelf: "center",
    marginLeft: 5,
    marginRight: 5
  },
  bottomView_ios: {
    height: 50,
    backgroundColor: "transparent",
    borderTopWidth: 0
  },
  bottomView_android: {
    width: "100%",
    height: 100,
    position: "relative",
    backgroundColor: "transparent",
    justifyContent: "center",
    flexDirection: "row"
  },
  fabLeftWrapperStyles: {
    position: "absolute",
    bottom: -50,
    left: 20
  },
  fabRightWrapperStyles: {
    position: "absolute",
    bottom: -30,
    right: 20
  },
  fabStyles: {
    width: 60,
    height: 60
  }
});

const images = {
  img_title: require("assets/img/hoozin_title.png"),
  img_sidemenu: require("assets/icon/sidemenu_white.png"),
  img_ios_back: require("assets/icon/btn_ios_back.png"),
  img_about: require("assets/icon/Menu_About.png"),
  img_profile: require("assets/icon/Menu_Profile.png"),
  img_friends: require("assets/icon/Menu_Friends.png"),
  img_terms: require("assets/icon/Menu_TnS.png"),
  img_privacy: require("assets/icon/Menu_PrivacyPolicy.png"),
  img_cookies: require("assets/icon/Menu_User_cookies.png"),
  img_feedback: require("assets/icon/Menu_ProvideFeedback.png"),
  img_logout: require("assets/icon/Menu_Logout.png")
};

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: userId => {
      dispatch(logOutAction(userId));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MenuPage);
