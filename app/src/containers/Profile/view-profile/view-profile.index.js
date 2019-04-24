import React, { Component } from "react";
import { View, TextInput, TouchableOpacity, Platform } from "react-native";
import Image from "react-native-remote-svg";
import {
  Container,
  Content,
  Textarea,
  Footer,
  Left,
  Right,
  Body,
  Fab,
  Icon,
  Spinner
} from "native-base";
import { connect } from "react-redux";

import {
  setVisibleIndicatorAction,
  fetchProfileDataAction
} from "../../../actions/auth";
import { IconsMap } from "assets/assetMap";
import { strings } from "../../../locales/i18n";
import AppBarComponent from "../../../components/AppBar/appbar.index";
import { UserManagementServiceAPI } from "../../../api";
import { Col, Row, Grid } from "react-native-easy-grid";
// styleshhet
import { ViewUserProfileStyles } from "./view-profile.style";

/* Redux container component for viewing user profile */
class ViewUserProfileContainer extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      facebook: null,
      instagram: null,
      linkedin: null,
      twitter: null,
      snapchat: null,
      strava: null,
      mapmyfitness: null,
      name: null,
      email: null,
      password: null,
      confirmPass: null,
      phone: null,
      address: null,
      animating: true,
      userData: null
    };
    this.mount = true;
  }
  componentWillMount() {
    console.log("++props list ++", this.props);
    if (this.props.user && this.props.user.socialUID) {
      //this.props.fetchProfileData(this.props.user.socialUID);
      const userSvc = new UserManagementServiceAPI();
      userSvc.getUserDetailsAPI(this.props.user.socialUID).then(userData => {
        if (userData) {
          console.log("++ user data ++", userData);
          this.setState({ userData: userData, animating: false });
        }
      });
      console.log("++props list ++", this.props);
    }
  }

  onEditPress() {
    this.props.navigation.navigate({
      routeName: "EditProfile",
      key: "EditProfile"
    });
  }
  onCancel() {
    this.props.navigation.goBack();
  }
  onProfile() {
    this.props.navigation.navigate({
      routeName: "ShowProfile",
      key: "ShowProfile"
    });
  }
  onFriends() {}
  onAbout() {
    this.props.navigation.navigate({
      routeName: "About",
      key: "About"
    });
  }

  loadImagesStart() {
    this.setState({ animating: true });
  }

  loadImagesComplete() {
    this.setState({ animating: false });
  }

  render() {
    //let facebook = this.state.facebook !== null ? this.state.facebook : this.props.user.facebook
    //let instagram = this.state.instagram !== null ? this.state.instagram : this.props.user.instagram
    //let linkedin = this.state.linkedin !== null ? this.state.linkedin : this.props.user.linkedin
    //let twitter = this.state.twitter !== null ? this.state.twitter : this.props.user.twitter
    //let snapchat = this.state.snapchat !== null ? this.state.snapchat : this.props.user.snapchat
    //let strava = this.state.strava !== null ? this.state.strava : this.props.user.strava
    //let mapmyfitness = this.state.mapmyfitness !== null ? this.state.mapmyfitness : this.props.user.mapmyfitness
    //let name = this.state.name !== null ? this.state.name : this.props.name ? this.props.name : this.props.user.name
    //let email = this.state.email !== null ? this.state.email : this.props.email ? this.props.email : this.props.user.email
    let password =
      this.state.password !== null ? this.state.password : this.props.password;
    let confirmPass =
      this.state.confirmPass !== null
        ? this.state.confirmPass
        : this.props.confirmPass;
    //let phone = this.state.phone !== null ? this.state.phone : this.props.user.phone
    //let address = this.state.address !== null ? this.state.address : this.props.user.address
    let animating = this.state.animating;
    let countryCode = "IN";

    return (
      <React.Fragment>
          <Content>
            <View style={ViewUserProfileStyles.avatarView}>
              <TouchableOpacity onPress={() => null}>
                {this.state.userData && this.state.userData.profileImgUrl ? (
                  <Image
                    source={{ uri: this.state.userData.profileImgUrl }}
                    style={{ width: 117, height: 117, borderRadius: 117 / 2 }}
                    onLoadEnd={() => this.loadImagesComplete()}
                    onLoadStart={() => this.loadImagesStart()}
                  />
                ) : (
                  <Image source={IconsMap.icon_user_avatar} />
                )}
              </TouchableOpacity>
            </View>
            <View style={ViewUserProfileStyles.dataView}>
              <View style={ViewUserProfileStyles.nameArea}>
                <TextInput
                  multiline={false}
                  style={[
                    ViewUserProfileStyles.textInput,
                    ViewUserProfileStyles.line
                  ]}
                  autoCapitalize="none"
                  editable={false}
                  selectTextOnFocus={false}
                  autoCorrect={false}
                  value={
                    (this.state.userData && this.state.userData.name) || ""
                  }
                  placeholder={strings("profile_page.name")}
                  placeholderTextColor={"#8E8E93"}
                  underlineColorAndroid="transparent"
                />
                <TextInput
                  multiline={false}
                  style={[
                    ViewUserProfileStyles.textInput,
                    ViewUserProfileStyles.line
                  ]}
                  autoCapitalize="none"
                  editable={false}
                  selectTextOnFocus={false}
                  autoCorrect={false}
                  value={
                    (this.state.userData && this.state.userData.email) || ""
                  }
                  placeholder={strings("login.email")}
                  placeholderTextColor={"#8E8E93"}
                  underlineColorAndroid="transparent"
                />
              </View>
              {/* {
                                this.props.user && this.props.user.accountType == ('google' || 'facebook')?
                                    null
                                    :
                                    <View style={ViewUserProfileStyles.passwordArea}>
                                        <View style={ViewUserProfileStyles.iconArea} >
                                            <Image source={images.img_logo_password}
                                                resizeMode='contain' />
                                        </View>
                                        <View style={ViewUserProfileStyles.passwordInput} >
                                            <TextInput multiline={false}
                                                style={
                                                    [ViewUserProfileStyles.textInput, ViewUserProfileStyles.line]
                                                }
                                                ellipsizeMode='clip'
                                                editable={false}
                                                selectTextOnFocus={false}
                                                secureTextEntry={true}
                                                value={password}
                                                placeholder={strings('login.password')}
                                                placeholderTextColor={'#8E8E93'}
                                            />
                                            <TextInput multiline={false}
                                                style={
                                                    [ViewUserProfileStyles.textInput, ViewUserProfileStyles.line]
                                                }
                                                ellipsizeMode='clip'
                                                editable={false}
                                                selectTextOnFocus={false}
                                                secureTextEntry={true}
                                                value={confirmPass}
                                                placeholder={strings('profile_page.confirm_password')}
                                                placeholderTextColor={'#8E8E93'}
                                            />
                                        </View>
                                    </View>
                            } */}

              <View style={ViewUserProfileStyles.phoneArea}>
                <View style={ViewUserProfileStyles.phoneMaskArea}>
                  <TextInput
                    multiline={false}
                    style={[
                      ViewUserProfileStyles.textInput,
                      ViewUserProfileStyles.line
                    ]}
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    editable={false}
                    selectTextOnFocus={false}
                    autoCorrect={false}
                    value={
                      (this.state.userData && this.state.userData.phone) || ""
                    }
                    placeholder={strings("profile_page.phone")}
                    placeholderTextColor={"#8E8E93"}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <Textarea
                  rowSpan={4}
                  style={[
                    ViewUserProfileStyles.textInput,
                    ViewUserProfileStyles.line
                  ]}
                  autoCapitalize="none"
                  editable={false}
                  selectTextOnFocus={false}
                  autoCorrect={false}
                  value={
                    (this.state.userData && this.state.userData.address) || ""
                  }
                  placeholder={strings("profile_page.address")}
                  placeholderTextColor={"#8E8E93"}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={ViewUserProfileStyles.sociallinkView}>
              <View style={ViewUserProfileStyles.socialContent}>
                <View style={ViewUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_fb_26x26} />
                  ) : (
                    <Image source={IconsMap.icon_fb} />
                  )}

                  <TextInput
                    multiline={false}
                    style={ViewUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    editable={false}
                    selectTextOnFocus={false}
                    autoCorrect={false}
                    value={
                      (this.state.userData && this.state.userData.facebook) ||
                      ""
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={ViewUserProfileStyles.socialLine} />
              </View>

              <View style={ViewUserProfileStyles.socialContent}>
                <View style={ViewUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_instagram} />
                  ) : (
                    <Image source={IconsMap.icon_instagram_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={ViewUserProfileStyles.socialTextInput}
                    editable={false}
                    selectTextOnFocus={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={
                      (this.state.userData && this.state.userData.instagram) ||
                      ""
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={ViewUserProfileStyles.socialLine} />
              </View>

              <View style={ViewUserProfileStyles.socialContent}>
                <View style={ViewUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_linkedin} />
                  ) : (
                    <Image source={IconsMap.icon_linkedin_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={ViewUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    editable={false}
                    selectTextOnFocus={false}
                    autoCorrect={false}
                    value={
                      (this.state.userData && this.state.userData.linkedin) ||
                      ""
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={ViewUserProfileStyles.socialLine} />
              </View>

              <View style={ViewUserProfileStyles.socialContent}>
                <View style={ViewUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_twitter} />
                  ) : (
                    <Image source={IconsMap.icon_twitter_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={ViewUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    editable={false}
                    selectTextOnFocus={false}
                    autoCorrect={false}
                    value={
                      (this.state.userData && this.state.userData.twitter) || ""
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={ViewUserProfileStyles.socialLine} />
              </View>

              <View style={ViewUserProfileStyles.socialContent}>
                <View style={ViewUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_snapchat} />
                  ) : (
                    <Image source={IconsMap.icon_snapchat_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={ViewUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    editable={false}
                    selectTextOnFocus={false}
                    autoCorrect={false}
                    value={
                      (this.state.userData && this.state.userData.snapchat) ||
                      ""
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={ViewUserProfileStyles.socialLine} />
              </View>

              <View style={ViewUserProfileStyles.socialContent}>
                <View style={ViewUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_strava} />
                  ) : (
                    <Image source={IconsMap.icon_strava_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={ViewUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    editable={false}
                    selectTextOnFocus={false}
                    autoCorrect={false}
                    value={
                      (this.state.userData && this.state.userData.strava) || ""
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={ViewUserProfileStyles.socialLine} />
              </View>

              <View style={ViewUserProfileStyles.socialContent}>
                <View style={ViewUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_ua} />
                  ) : (
                    <Image source={IconsMap.icon_ua_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={ViewUserProfileStyles.socialTextInput}
                    editable={false}
                    selectTextOnFocus={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={
                      (this.state.userData &&
                        this.state.userData.mapmyfitness) ||
                      ""
                    }
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={ViewUserProfileStyles.socialLine} />
              </View>
            </View>
          </Content>
          {Platform.OS === "ios" ? (
            <Footer style={ViewUserProfileStyles.bottomView_ios}>
              <Left>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate({
                      routeName: "EventList",
                      key: "EventList"
                    })
                  }
                  style={ViewUserProfileStyles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_list_circle}
                      style={ViewUserProfileStyles.fabStyles}
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
                      style={ViewUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body>
                <TouchableOpacity
                  style={{ position: "absolute", left: 30 }}
                  onPress={() => this.onEditPress()}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_edit}
                      style={ViewUserProfileStyles.fabStyles}
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
                                        }
                                  
                                        .cls-3 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-4 {
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
                                    <g id="Group_1242" data-name="Group 1242" transform="translate(-158 -619)">
                                      <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                                        <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                      </g>
                                      <g id="Compose" transform="translate(-110 398)">
                                        <rect id="Rectangle_324" data-name="Rectangle 324" class="cls-2" width="16" height="16" transform="translate(290 237)"/>
                                        <path id="Path_110" data-name="Path 110" class="cls-3" d="M8.154,3.077,2.462,8.923,0,16l7.077-2.308L12.769,8Zm7.231-.462-2-2a1.865,1.865,0,0,0-2.769,0L8.923,2.308l4.615,4.769,1.846-1.846A1.95,1.95,0,0,0,16,3.846,1.9,1.9,0,0,0,15.385,2.615Z" transform="translate(290 237)"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={ViewUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Body>
              <Right />
            </Footer>
          ) : (
            <View style={ViewUserProfileStyles.bottomView_android}>
              <Left>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("EventList")}
                  style={ViewUserProfileStyles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_list_circle}
                      style={ViewUserProfileStyles.fabStyles}
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
                      style={ViewUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body style={{ position: "relative", top: -25 }}>
                <TouchableOpacity
                  style={{ position: "absolute", left: 30 }}
                  onPress={() => this.onEditPress()}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_edit}
                      style={ViewUserProfileStyles.fabStyles}
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
                                    }
                              
                                    .cls-3 {
                                      fill: #fff;
                                    }
                              
                                    .cls-4 {
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
                                <g id="Group_1242" data-name="Group 1242" transform="translate(-158 -619)">
                                  <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                  </g>
                                  <g id="Compose" transform="translate(-110 398)">
                                    <rect id="Rectangle_324" data-name="Rectangle 324" class="cls-2" width="16" height="16" transform="translate(290 237)"/>
                                    <path id="Path_110" data-name="Path 110" class="cls-3" d="M8.154,3.077,2.462,8.923,0,16l7.077-2.308L12.769,8Zm7.231-.462-2-2a1.865,1.865,0,0,0-2.769,0L8.923,2.308l4.615,4.769,1.846-1.846A1.95,1.95,0,0,0,16,3.846,1.9,1.9,0,0,0,15.385,2.615Z" transform="translate(290 237)"/>
                                  </g>
                                </g>
                              </svg>
                              `
                      }}
                      style={ViewUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Body>
              <Right />
            </View>
          )}
        {animating && (
          <View style={ViewUserProfileStyles.overlay}>
            <Spinner
              color={"lightgoldenrodyellow"}
              style={ViewUserProfileStyles.spinner}
            />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const images = {
  img_about_infocus: require("assets/icon/btn_About_infocus.png"),
  img_btn_about: require("assets/icon/btn_About.png"),
  img_btn_friends_infocus: require("assets/icon/btn_Friends_infocus.png"),
  img_btn_friends: require("assets/icon/btn_Friends.png"),
  img_btn_profile_infocus: require("assets/icon/btn_Profile_infocus.png"),
  img_btn_profile: require("assets/icon/btn_Profile.png")
};

const mapStateToProps = (state, ownProps) => {
  return {
    result: state.auth.profileStatus,
    user: state.auth.user,
    indicatorShow: state.auth.indicatorShow
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicatorAction(bShow));
    },
    fetchProfileData: socialUID => {
      dispatch(fetchProfileDataAction(socialUID));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewUserProfileContainer);
