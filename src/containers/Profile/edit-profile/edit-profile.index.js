import React, { Component } from "react";
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  Linking,
  AsyncStorage,
  Platform
} from "react-native";
import Image from "react-native-remote-svg";
import {
  Container,
  Content,
  Textarea,
  Footer,
  Left,
  Right,
  Body,
  Spinner
} from "native-base";
import CheckBox from "react-native-check-box";
import { RNCamera } from "react-native-camera";
import { connect } from "react-redux";
import { Col, Row, Grid } from "react-native-easy-grid";
import { strings } from "../../../locales/i18n";
import {
  clearCreateStatusAction,
  setVisibleIndicatorAction,
  fetchProfileDataAction,
  UpdateProfileDataAction
} from "../../../actions/auth";
import { IconsMap } from "assets/assetMap";
import AppBarComponent from "../../../components/AppBar/appbar.index";
import CameraService from "../../../utils/camera.service";
import { UserManagementServiceAPI } from "../../../api";

//stylesheet
import { EditUserProfileStyles } from "./edit-profile.style";

/* Redux container component for editing user profile */
class EditUserProfileContainer extends Component {
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
      isPasswordNew: true,
      confirmPass: null,
      phone: "",
      address: null,
      animating: false,
      existingPassword: "",
      maskedPhone: "",
      userData: null,
      isCameraActive: false,
      userProfileImg: null,
      profileImage: "",
      agreementAccepted: false,
      tosUrl: "https://hoozin.app/termcondition",
      privacyUrl: "https://hoozin.app/privacypolicy",
      cookiesUrl: "https://hoozin.app/useofcookies"
    };
    this.mount = true;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.mount) return;

    let { indicatorShow } = nextProps;

    if (indicatorShow != this.state.animating) {
      this.setState({
        animating: indicatorShow
      });
    }

    if (nextProps.user && nextProps.user.socialUID && nextProps.profileUpdate) {
      var profileUpdate = nextProps.profileUpdate;

      //this.showIndicator(false)

      if (profileUpdate) {
        const { navigate } = this.props.navigation;
        navigate("ShowProfile");
      } else {
      }

      //this.props.onClearCreate()
    }
  }
  componentWillMount() {
    AsyncStorage.getItem("userId", (err, result) => {
      if (result) {
        const userSvc = new UserManagementServiceAPI();
        const storageResult = JSON.parse(result);
        const existingPswd =
          storageResult.accountType == "custom" ? storageResult.password : "";
        this.setState({ animating: true });

        userSvc.getUserDetailsAPI(this.props.user.socialUID).then(userData => {
          if (userData) {
            console.log("++ user data ++", userData);
            this.setState({
              name: userData ? userData.name : "",
              email: (userData && userData.email) || "",
              phone: (userData && userData.phone) || "",
              address: (userData && userData.address) || "",
              password: this.state.password || this.props.password,
              confirmPass: this.state.confirmPass || this.props.confirmPass,
              facebook: (userData && userData.facebook) || "",
              instagram: (userData && userData.instagram) || "",
              linkedin: (userData && userData.linkedin) || "",
              twitter: (userData && userData.twitter) || "",
              snapchat: (userData && userData.snapchat) || "",
              strava: (userData && userData.strava) || "",
              mapmyfitness: (userData && userData.mapmyfitness) || "",
              existingPassword: existingPswd ? existingPswd : "",
              animating: this.state.animating,
              userProfileImg: (userData && userData.profileImgUrl) || "",
              userData: userData,
              animating: false
            });
          }
        });
      }
    });
  }
  componentWillUnmount() {
    this.mount = false;
  }

  openLinks(url) {
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

  /**
   * @description Mask the phone input
   * @param {string} number
   */
  maskPhoneNumber(number) {
    // use RegExp to just match and group part of the phone number which will be formated next
    const x = number.replace(/\D/g, "").match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    number = !x[2] ? x[1] : "(" + x[1] + ") " + x[2] + (x[3] ? "-" + x[3] : "");
    this.setState({ phone: number });
  }

  onAcceptAgreement() {
    this.setState({ agreementAccepted: !this.state.agreementAccepted });
    console.log("++ agreement ++", this.state.agreementAccepted);
  }

  onAbout() {}

  onProfile() {}

  onFriends() {}

  /**
   * @description switch camera view
   */
  onEditProfileImage() {
    this.setState({ isCameraActive: true });
  }

  /**
   * @description Capture user profile image
   */
  takeUserProfilePicture() {
    const camSvc = new CameraService();
    this.setState({ animating: true });

    camSvc
      .captureUserProfilePicture(this.camera, this.props.user.socialUID)
      .then(uploadResult => {
        console.log("++ New Screenshot URL ++", uploadResult.downloadURL);
        this.setState({
          userProfileImg: uploadResult.downloadURL,
          isCameraActive: false
        });
      });
  }

  loadImagesStart() {
    this.setState({ animating: true });
  }

  loadImagesComplete() {
    this.setState({ animating: false });
  }

  /**
   * @description update local state properties
   * @param {string} state
   * @param {string} text
   */
  updateState(state, text) {
    const obj = {};
    obj[state] = text;
    this.setState(obj);
  }

  onCancel() {
    const { navigate, goBack } = this.props.navigation;
    //navigate('Menu')
    goBack();
  }

  onConfirmEdit() {
    let accountType =
      this.props.user && this.props.user.accountType
        ? this.props.user.accountType
        : "custom";
    let socialUID = this.props.user ? this.props.user.socialUID : null;

    if (
      !this.state.name ||
      !this.state.email ||
      !this.state.phone ||
      (accountType == "custom" &&
        (!this.state.password || !this.state.confirmPass))
    ) {
      Alert.alert(
        "Information missing!",
        "Name, Email / Password and Phone number are primary information and required",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      return;
    } else if (this.state.existingPassword == this.state.password) {
      Alert.alert(
        "Existing password!",
        "You cannot use your old pasword as your new password",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      this.setState({ passwordMatched: false });
      return;
    } else if (this.state.password !== this.state.confirmPass) {
      Alert.alert(
        "Password mismatch!",
        "Please verify your password",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      return;
    } else if (
      this.state.name &&
      this.state.email &&
      this.state.phone &&
      ((accountType == "custom" &&
        this.state.password &&
        this.state.confirmPass) ||
        accountType != "custom") &&
      !this.state.agreementAccepted
    ) {
      Alert.alert(
        "Terms not accepted",
        "You must accept the agreement",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      return;
    } else {
      this.showIndicator(true);
      if (accountType == "custom" && this.state.isPasswordNew) {
        this.props.UpdateProfileData(
          this.state.name,
          this.state.email,
          this.state.password,
          this.state.phone,
          this.state.address,
          this.state.facebook,
          this.state.instagram,
          this.state.linkedin,
          this.state.twitter,
          this.state.snapchat,
          this.state.strava,
          this.state.mapmyfitness,
          accountType,
          socialUID,
          this.state.isPasswordNew,
          this.state.userProfileImg
        );
        return;
      }
      this.props.UpdateProfileData(
        this.state.name,
        this.state.email,
        this.state.password,
        this.state.phone,
        this.state.address,
        this.state.facebook,
        this.state.instagram,
        this.state.linkedin,
        this.state.twitter,
        this.state.snapchat,
        this.state.strava,
        this.state.mapmyfitness,
        accountType,
        socialUID,
        null,
        this.state.userProfileImg
      );
    }
  }

  showIndicator(bShow) {
    this.props.onShowIndicator(bShow);
  }

  render() {
    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent />
          <View style={EditUserProfileStyles.tabBarView}>
            {/* <TouchableOpacity
                            onPress={() => this.onAbout()} >
                            <Image source={images.img_btn_about} />
                        </TouchableOpacity >
                        <TouchableOpacity
                            onPress={() => this.onProfile()} >
                            <Image source={images.img_btn_profile_infocus} />
                        </TouchableOpacity >
                        <TouchableOpacity
                            onPress={() => this.onFriends()} >
                            <Image source={images.img_btn_friends} />
                        </TouchableOpacity > */}

            <Grid>
              <Col
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <TouchableOpacity onPress={() => this.onAbout()}>
                  <Image source={images.img_btn_about} />
                </TouchableOpacity>
              </Col>

              <Col
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <TouchableOpacity onPress={() => this.onProfile()}>
                  <Image source={images.img_btn_profile_infocus} />
                </TouchableOpacity>
              </Col>

              <Col
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <TouchableOpacity onPress={() => this.onFriends()}>
                  <Image source={images.img_btn_friends} />
                </TouchableOpacity>
              </Col>
            </Grid>
          </View>
          <Content>
            <View style={EditUserProfileStyles.avatarView}>
              <TouchableOpacity onPress={() => this.onEditProfileImage()}>
                {this.state.userProfileImg ? (
                  <Image
                    source={{ uri: this.state.userProfileImg }}
                    style={{ width: 117, height: 117, borderRadius: 117 / 2 }}
                    onLoadEnd={() => this.loadImagesComplete()}
                    onLoadStart={() => this.loadImagesStart()}
                  />
                ) : (
                  <Image source={IconsMap.icon_user_avatar} />
                )}
              </TouchableOpacity>
            </View>
            <View style={EditUserProfileStyles.dataView}>
              <View style={EditUserProfileStyles.nameArea}>
                <TextInput
                  multiline={false}
                  style={[
                    EditUserProfileStyles.textInput,
                    EditUserProfileStyles.line
                  ]}
                  autoCapitalize="words"
                  enablesReturnKeyAutomatically={true}
                  autoCorrect={false}
                  onChangeText={text => this.updateState("name", text)}
                  value={this.state.name}
                  placeholder={strings("profile_page.name")}
                  placeholderTextColor={"gray"}
                  underlineColorAndroid="transparent"
                />
                <TextInput
                  multiline={false}
                  style={[
                    EditUserProfileStyles.textInput,
                    EditUserProfileStyles.line
                  ]}
                  autoCapitalize="none"
                  enablesReturnKeyAutomatically={true}
                  autoCorrect={false}
                  onChangeText={text => this.updateState("email", text)}
                  value={this.state.email}
                  placeholder={strings("login.email")}
                  placeholderTextColor={"gray"}
                  underlineColorAndroid="transparent"
                />
              </View>
              {this.props.user &&
              this.props.user.accountType == ("google" || "facebook") ? null : (
                <View style={EditUserProfileStyles.passwordArea}>
                  <View style={EditUserProfileStyles.iconArea}>
                    <Image
                      source={IconsMap.icon_password}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={EditUserProfileStyles.passwordInput}>
                    <TextInput
                      multiline={false}
                      style={[
                        EditUserProfileStyles.textInput,
                        EditUserProfileStyles.line
                      ]}
                      ellipsizeMode="clip"
                      enablesReturnKeyAutomatically={true}
                      secureTextEntry={true}
                      onChangeText={text => this.updateState("password", text)}
                      value={this.state.password}
                      placeholder={strings("login.password")}
                      placeholderTextColor={"gray"}
                      underlineColorAndroid="transparent"
                    />
                    <TextInput
                      multiline={false}
                      style={[
                        EditUserProfileStyles.textInput,
                        EditUserProfileStyles.line
                      ]}
                      ellipsizeMode="clip"
                      enablesReturnKeyAutomatically={true}
                      secureTextEntry={true}
                      onChangeText={text =>
                        this.updateState("confirmPass", text)
                      }
                      value={this.state.confirmPass}
                      placeholder={strings("profile_page.confirm_password")}
                      placeholderTextColor={"gray"}
                      underlineColorAndroid="transparent"
                    />
                  </View>
                </View>
              )}

              <View style={EditUserProfileStyles.phoneArea}>
                <View style={EditUserProfileStyles.phoneMaskArea}>
                  <TextInput
                    multiline={false}
                    style={[
                      EditUserProfileStyles.textInput,
                      EditUserProfileStyles.line
                    ]}
                    autoCapitalize="none"
                    keyboardType="phone-pad"
                    maxLength={14}
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text => this.maskPhoneNumber(text)}
                    value={this.state.phone}
                    placeholder={strings("profile_page.phone")}
                    placeholderTextColor={"gray"}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <Textarea
                  rowSpan={4}
                  style={[
                    EditUserProfileStyles.textInput,
                    EditUserProfileStyles.line
                  ]}
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={text => this.updateState("address", text)}
                  value={this.state.address}
                  placeholder={strings("profile_page.address")}
                  placeholderTextColor={"gray"}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={EditUserProfileStyles.sociallinkView}>
              <View style={EditUserProfileStyles.socialContent}>
                <View style={EditUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_fb_26x26} />
                  ) : (
                    <Image source={IconsMap.icon_fb} />
                  )}

                  <TextInput
                    multiline={false}
                    style={EditUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text => this.updateState("facebook", text)}
                    value={this.state.facebook}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={EditUserProfileStyles.socialLine} />
              </View>

              <View style={EditUserProfileStyles.socialContent}>
                <View style={EditUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_instagram} />
                  ) : (
                    <Image source={IconsMap.icon_instagram_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={EditUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text => this.updateState("instagram", text)}
                    value={this.state.instagram}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={EditUserProfileStyles.socialLine} />
              </View>

              <View style={EditUserProfileStyles.socialContent}>
                <View style={EditUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_linkedin} />
                  ) : (
                    <Image source={IconsMap.icon_linkedin_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={EditUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text => this.updateState("linkedin", text)}
                    value={this.state.linkedin}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={EditUserProfileStyles.socialLine} />
              </View>

              <View style={EditUserProfileStyles.socialContent}>
                <View style={EditUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_twitter} />
                  ) : (
                    <Image source={IconsMap.icon_twitter_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={EditUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text => this.updateState("twitter", text)}
                    value={this.state.twitter}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={EditUserProfileStyles.socialLine} />
              </View>

              <View style={EditUserProfileStyles.socialContent}>
                <View style={EditUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_snapchat} />
                  ) : (
                    <Image source={IconsMap.icon_snapchat_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={EditUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text => this.updateState("snapchat", text)}
                    value={this.state.snapchat}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={EditUserProfileStyles.socialLine} />
              </View>

              <View style={EditUserProfileStyles.socialContent}>
                <View style={EditUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_strava} />
                  ) : (
                    <Image source={IconsMap.icon_strava_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={EditUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text => this.updateState("strava", text)}
                    value={this.state.strava}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={EditUserProfileStyles.socialLine} />
              </View>

              <View style={EditUserProfileStyles.socialContent}>
                <View style={EditUserProfileStyles.socialInput}>
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_ua} />
                  ) : (
                    <Image source={IconsMap.icon_ua_png} />
                  )}

                  <TextInput
                    multiline={false}
                    style={EditUserProfileStyles.socialTextInput}
                    autoCapitalize="none"
                    enablesReturnKeyAutomatically={true}
                    autoCorrect={false}
                    onChangeText={text =>
                      this.updateState("mapmyfitness", text)
                    }
                    value={this.state.mapmyfitness}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={EditUserProfileStyles.socialLine} />
              </View>
              <View style={{ paddingTop: 40, width: "100%" }}>
                <CheckBox
                  style={{ paddingRight: 10, width: "100%" }}
                  onClick={() => this.onAcceptAgreement()}
                  isChecked={this.state.agreementAccepted}
                  rightText="I have read and agreed to the following"
                  rightTextStyle={{ color: "#666666" }}
                />
                <TouchableOpacity
                  onPress={() => this.openLinks(this.state.tosUrl)}
                >
                  <Text style={EditUserProfileStyles.agreementTxt}>
                    {"\u2022"} &nbsp; Terms of Service
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.openLinks(this.state.privacyUrl)}
                >
                  <Text style={EditUserProfileStyles.agreementTxt}>
                    {"\u2022"} &nbsp; Privacy Policy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.openLinks(this.state.cookiesUrl)}
                >
                  <Text style={EditUserProfileStyles.agreementTxt}>
                    {"\u2022"} &nbsp; Use of Cookies
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Content>
          {Platform.OS === "ios" ? (
            <Footer style={EditUserProfileStyles.bottomView_ios}>
              <Left>
                <TouchableOpacity
                  onPress={() => this.onCancel()}
                  style={EditUserProfileStyles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_close_gray}
                      style={EditUserProfileStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                    <defs>
                                      <style>
                                        .cls-1 {
                                          fill: #bcbcbc;
                                          stroke: #bcbcbc;
                                        }
                                  
                                        .cls-2 {
                                          fill: #fff;
                                        }
                                  
                                        .cls-3 {
                                          stroke: none;
                                        }
                                  
                                        .cls-4 {
                                          fill: none;
                                        }
                                  
                                        .cls-5 {
                                          filter: url(#Ellipse_111);
                                        }
                                      </style>
                                      <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                        <feOffset dy="3" input="SourceAlpha"/>
                                        <feGaussianBlur stdDeviation="3" result="blur"/>
                                        <feFlood flood-opacity="0.161"/>
                                        <feComposite operator="in" in2="blur"/>
                                        <feComposite in="SourceGraphic"/>
                                      </filter>
                                    </defs>
                                    <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                                      <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                                        <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                          <circle class="cls-3" cx="21" cy="21" r="21"/>
                                          <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                        </g>
                                      </g>
                                      <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                                        <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                      </g>
                                    </g>
                                  </svg>
                                  `
                      }}
                      style={EditUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body>
                <TouchableOpacity
                  style={{ position: "absolute", left: 30 }}
                  onPress={() => this.onConfirmEdit()}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_success}
                      style={EditUserProfileStyles.fabStyles}
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
                      fill: #fff;
                    }
              
                    .cls-3 {
                      fill: none;
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
                <g id="Group_1162" data-name="Group 1162" transform="translate(-158 -619)">
                  <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                  </g>
                  <g id="Yes" transform="translate(-277 465)">
                    <path id="Checkbox" class="cls-2" d="M8.375,14.75,1,7.375l1.75-1.75,5.625,5.5L18.5,1l1.75,1.75Z" transform="translate(454 171.5)"/>
                    <rect id="Rectangle_556" data-name="Rectangle 556" class="cls-3" width="16" height="16" transform="translate(455 170)"/>
                  </g>
                </g>
              </svg>
              `
                      }}
                      style={EditUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Body>
              <Right />
            </Footer>
          ) : (
            <View style={EditUserProfileStyles.bottomView_android}>
              <Left>
                <TouchableOpacity
                  onPress={() => this.onCancel()}
                  style={EditUserProfileStyles.fabLeftWrapperStyles}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_close_gray}
                      style={EditUserProfileStyles.fabStyles}
                    />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #bcbcbc;
                                      stroke: #bcbcbc;
                                    }
                              
                                    .cls-2 {
                                      fill: #fff;
                                    }
                              
                                    .cls-3 {
                                      stroke: none;
                                    }
                              
                                    .cls-4 {
                                      fill: none;
                                    }
                              
                                    .cls-5 {
                                      filter: url(#Ellipse_111);
                                    }
                                  </style>
                                  <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                                    <feOffset dy="3" input="SourceAlpha"/>
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feFlood flood-opacity="0.161"/>
                                    <feComposite operator="in" in2="blur"/>
                                    <feComposite in="SourceGraphic"/>
                                  </filter>
                                </defs>
                                <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                                  <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                                    <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                                      <circle class="cls-3" cx="21" cy="21" r="21"/>
                                      <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                                    </g>
                                  </g>
                                  <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                                    <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                                  </g>
                                </g>
                              </svg>
                              `
                      }}
                      style={EditUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Left>
              <Body style={{ position: "relative", top: -25 }}>
                <TouchableOpacity
                  style={{ position: "absolute", left: 30 }}
                  onPress={() => this.onConfirmEdit()}
                >
                  {Platform.OS === "ios" ? (
                    <Image
                      source={IconsMap.icon_success}
                      style={EditUserProfileStyles.fabStyles}
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
                  fill: #fff;
                }
          
                .cls-3 {
                  fill: none;
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
            <g id="Group_1162" data-name="Group 1162" transform="translate(-158 -619)">
              <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
              </g>
              <g id="Yes" transform="translate(-277 465)">
                <path id="Checkbox" class="cls-2" d="M8.375,14.75,1,7.375l1.75-1.75,5.625,5.5L18.5,1l1.75,1.75Z" transform="translate(454 171.5)"/>
                <rect id="Rectangle_556" data-name="Rectangle 556" class="cls-3" width="16" height="16" transform="translate(455 170)"/>
              </g>
            </g>
          </svg>
          `
                      }}
                      style={EditUserProfileStyles.fabStyles}
                    />
                  )}
                </TouchableOpacity>
              </Body>
              <Right />
            </View>
          )}
          {this.state.isCameraActive ? (
            <View style={EditUserProfileStyles.camContainer}>
              <RNCamera
                ref={ref => {
                  this.camera = ref;
                }}
                style={EditUserProfileStyles.preview}
                type={RNCamera.Constants.Type.front}
                flashMode={RNCamera.Constants.FlashMode.on}
                permissionDialogTitle={"Permission to use camera"}
                permissionDialogMessage={
                  "We need your permission to use your camera phone"
                }
              />
              <View
                style={{
                  flex: 0,
                  flexDirection: "row",
                  justifyContent: "center",
                  position: "absolute",
                  bottom: 0,
                  left: "18%"
                }}
              >
                <TouchableOpacity
                  onPress={() => this.setState({ isCameraActive: false })}
                  style={{ marginRight: 30 }}
                >
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_chevron_left} />
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
                                              stroke-width: 4px;
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
                                        <g id="Symbol_95_3" data-name="Symbol 95 – 3" transform="translate(-26 -619)">
                                          <g class="cls-3" transform="matrix(1, 0, 0, 1, 26, 619)">
                                            <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                          </g>
                                          <g id="Group_328" data-name="Group 328" transform="translate(355.5 1254) rotate(180)">
                                            <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                            <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                          </g>
                                        </g>
                                      </svg>
                                      `
                      }}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.takeUserProfilePicture.bind(this)}
                >
                  {Platform.OS === "ios" ? (
                    <Image source={IconsMap.icon_camera} />
                  ) : (
                    <Image
                      source={{
                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #2699fb;
                                            }
                                      
                                            .cls-2, .cls-3, .cls-4, .cls-5 {
                                              fill: #fff;
                                            }
                                      
                                            .cls-3 {
                                              stroke: #bcbcbc;
                                            }
                                      
                                            .cls-4 {
                                              stroke: #707070;
                                            }
                                      
                                            .cls-5 {
                                              stroke: #fff;
                                            }
                                      
                                            .cls-6 {
                                              stroke: none;
                                            }
                                      
                                            .cls-7 {
                                              fill: none;
                                            }
                                      
                                            .cls-8 {
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
                                        <g id="btn_Camera" transform="translate(-1331 -432)">
                                          <g class="cls-8" transform="matrix(1, 0, 0, 1, 1331, 432)">
                                            <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                          </g>
                                          <g id="Group_435" data-name="Group 435" transform="translate(1337 285)">
                                            <rect id="Rectangle_57" data-name="Rectangle 57" class="cls-2" width="31" height="21" rx="7" transform="translate(9 162)"/>
                                            <g id="Rectangle_58" data-name="Rectangle 58" class="cls-3" transform="translate(17 165)">
                                              <rect class="cls-6" width="16" height="16" rx="8"/>
                                              <rect class="cls-7" x="0.5" y="0.5" width="15" height="15" rx="7.5"/>
                                            </g>
                                            <path id="Rectangle_59" data-name="Rectangle 59" class="cls-2" d="M5,0H9a5,5,0,0,1,5,5V8a0,0,0,0,1,0,0H0A0,0,0,0,1,0,8V5A5,5,0,0,1,5,0Z" transform="translate(18 156)"/>
                                            <g id="Ellipse_21" data-name="Ellipse 21" class="cls-4" transform="translate(14 165)">
                                              <circle class="cls-6" cx="1" cy="1" r="1"/>
                                              <circle class="cls-7" cx="1" cy="1" r="0.5"/>
                                            </g>
                                            <g id="Ellipse_22" data-name="Ellipse 22" class="cls-5" transform="translate(14 161)">
                                              <circle class="cls-6" cx="1" cy="1" r="1"/>
                                              <circle class="cls-7" cx="1" cy="1" r="0.5"/>
                                            </g>
                                          </g>
                                        </g>
                                      </svg>
                                      `
                      }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Container>
        {this.state.animating && (
          <View style={EditUserProfileStyles.overlay}>
            <Spinner
              color={"lightgoldenrodyellow"}
              style={EditUserProfileStyles.spinner}
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
    profileUpdate: state.auth.profileUpdate,
    user: state.auth.user,
    indicatorShow: state.auth.indicatorShow
  };
};

const mapDispatchToProps = dispatch => {
  return {
    UpdateProfileData: (
      name,
      email,
      password,
      phone,
      address,
      facebook,
      instagram,
      linkedin,
      twitter,
      snapchat,
      strava,
      mapmyfitness,
      accountType,
      socialUID,
      pswdNew,
      profileImgUrl
    ) => {
      dispatch(
        UpdateProfileDataAction(
          name,
          email,
          password,
          phone,
          address,
          facebook,
          instagram,
          linkedin,
          twitter,
          snapchat,
          strava,
          mapmyfitness,
          accountType,
          socialUID,
          pswdNew,
          profileImgUrl
        )
      );
    },
    onClearCreate: () => {
      dispatch(clearCreateStatusAction());
    },
    fetchProfileData: socialUID => {
      dispatch(fetchProfileDataAction(socialUID));
    },
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicatorAction(bShow));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditUserProfileContainer);
