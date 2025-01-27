import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  AsyncStorage,
  Platform
} from "react-native";
import { Container, Button, Spinner } from "native-base";
import { connect } from "react-redux";
import ImageSvg from "react-native-remote-svg";

import { strings } from "../../locales/i18n";
import {
  loginAction,
  facebookLoginAction,
  googleLoginAction,
  initLoginAction,
  setVisibleIndicatorAction,
  fetchProfileForLogin
} from "../../actions/auth";
import { IconsMap, ImageMap } from "assets/assetMap";
//devtac plugin
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Stylesheet
import { LoginStyles } from "./login.style";
import { LocationServiceAPI } from "../../api/location.api";
import SvgImages from "../../svgs/SvgImages";

/**
 * Redux Container component to host Login functionalities
 */
class LoginContainer extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props, context) {
    super(props, context);
    this.state = { email: null, password: null, animating: false };
    this.mount = true;
    this.accountType = "";
  }

  componentDidMount() {
    const { replace, popToTop } = this.props.navigation;

    AsyncStorage.getItem("userId", (err, result) => {
      if (err) {
        console.error(err.message);
      }
      if (result) {
        let parseResult = JSON.parse(result);
        const { accountType, uid } = parseResult;

        // HOOZ-23 - Maintaining logged in state
        this.props.fetchProfileForLogin(uid, parseResult);

        popToTop();
        replace("EventList", { account: accountType });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    AsyncStorage.getItem("userId", (err, result) => {
      if (result) {
        this.accountType = JSON.parse(result)["accountType"];
      }
    });

    if (!this.mount) return;

    // **** modified because of forever loading issue

    // let { indicatorShow } = nextProps

    // if (indicatorShow != this.state.animating) {
    //     this.setState({
    //         animating: false,
    //     })
    // }

    if (nextProps.result !== null) {
      console.log("++ Post login data ++", nextProps);
      var result = nextProps.result;
      this.props.initLoginStatus();

      //this.showIndicator(false)
      this.setState({ animating: false });
      if (result) {
        const { replace, navigate, popToTop } = this.props.navigation;
        if (nextProps.isNewUser) {
          replace("Profile");
        } else {
          popToTop();
          replace("EventList", { account: this.accountType });
        }
      } else {
        Alert.alert(
          "",
          "User Id does not exist.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      }
    }
  }

  componentWillUnmount() {
    this.mount = false;
  }

  onEmailLoginPressed() {
    let email = this.state.email;
    let password = this.state.password;
    if (email && password) {
      // **** modified because of forever loading issue

      //this.showIndicator(true)
      this.setState({ animating: true });
      this.props.onLogin(this.state.email, this.state.password);
    } else {
      Alert.alert(
        "",
        "Please enter User information!.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  }

  onFacebookPressed() {
    //this.showIndicator(true)
    this.setState({ animating: true });
    this.props.onFacebookLogin();
  }

  onGooglePressed() {
    //this.showIndicator(true)
    this.setState({ animating: true });
    this.props.onGoogleLogin();
  }

  onEmailChanged(text) {
    this.setState({
      email: text
    });
  }

  onPasswordChanged(text) {
    this.setState({
      password: text
    });
  }

  onForgotPassPressed() {
    const { navigate } = this.props.navigation;
    navigate("ForgotPassword");
  }

  onCreateAccountPressed() {
    const { navigate } = this.props.navigation;
    navigate("Profile", { shouldClearAutofill: true });
  }

  showIndicator(bShow) {
    this.props.onShowIndicator(bShow);
  }

  render() {
    let email = this.state.email || this.props.email;
    let password = this.state.password || this.props.password;

    return (
      <Container>
        <ImageBackground
          style={LoginStyles.container}
          source={ImageMap.brand_auth_bg}
        >
          {/*  logo part */}
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: 200
            }}
          >
            <ImageSvg
              style={{ height: 100, width: 180 }}
              source={{
                uri: SvgImages.hoozin_logo_login
              }}
            />
          </View>

          {/* input part */}
          <KeyboardAwareScrollView>
            <View style={LoginStyles.inputForm}>
              <TextInput
                multiline={false}
                style={[LoginStyles.textInput, LoginStyles.line]}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => this.onEmailChanged(text)}
                value={email}
                placeholder={strings("login.email")}
                placeholderTextColor={"#707070"}
                enablesReturnKeyAutomatically={true}
                returnKeyType="next"
                underlineColorAndroid="transparent"
              />
              <TextInput
                multiline={false}
                style={[LoginStyles.textInput, LoginStyles.line]}
                ellipsizeMode="clip"
                secureTextEntry={true}
                onChangeText={text => this.onPasswordChanged(text)}
                value={password}
                placeholder={strings("login.password")}
                placeholderTextColor={"#707070"}
                enablesReturnKeyAutomatically={true}
                returnKeyType="done"
                underlineColorAndroid="transparent"
              />
              <View style={[LoginStyles.rowItem, LoginStyles.separator]}>
                <Button
                  transparent
                  light
                  style={[LoginStyles.rowItem]}
                  onPress={() => this.onEmailLoginPressed()}
                >
                  <Text
                    style={
                      Platform.OS === "ios"
                        ? LoginStyles.loginButton
                        : LoginStyles.loginButtonAndroid
                    }
                  >
                    {" "}
                    {strings("login.loginBtn")}{" "}
                  </Text>
                </Button>
              </View>
              <View style={[LoginStyles.rowItem, { marginTop: 10 }]}>
                <Text style={LoginStyles.commonText}>
                  {" "}
                  {strings("login.continue_with")}{" "}
                </Text>
              </View>
              <View
                style={[
                  LoginStyles.socialLogin,
                  LoginStyles.rowItem,
                  { marginTop: 10 }
                ]}
              >
                <Button
                  transparent
                  light
                  onPress={() => this.onFacebookPressed()}
                >
                  <Image source={IconsMap.icon_fb_40x40} />
                </Button>

                <Button
                  transparent
                  light
                  style={LoginStyles.googleLogin}
                  onPress={() => this.onGooglePressed()}
                >
                  <Image source={IconsMap.icon_google_48x48} />
                </Button>
              </View>
            </View>
          </KeyboardAwareScrollView>
          
          {/* footer part */}
          <View style={LoginStyles.footer}>
            <TouchableOpacity
              style={LoginStyles.buttonContainer}
              onPress={() => this.onForgotPassPressed()}
            >
              <Text style={LoginStyles.button}>
                {" "}
                {strings("login.forgot_password")}{" "}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={LoginStyles.buttonContainer}
              onPress={() => this.onCreateAccountPressed()}
            >
              <Text style={LoginStyles.button}>
                {" "}
                {strings("login.create_account")}{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {this.state.animating && (
          <View style={LoginStyles.overlay}>
            <Spinner
              color={"lightgoldenrodyellow"}
              style={LoginStyles.spinner}
            />
          </View>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    result: state.auth.success,
    isNewUser: state.auth.isNewUser,
    indicatorShow: state.auth.indicatorShow,
    authData: state.auth.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogin: (email, password) => {
      dispatch(loginAction(email, password));
    },
    onFacebookLogin: () => {
      dispatch(facebookLoginAction());
    },
    initLoginStatus: () => {
      dispatch(initLoginAction());
    },
    onGoogleLogin: () => {
      dispatch(googleLoginAction());
    },
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicatorAction(bShow));
    },
    fetchProfileForLogin: uid => {
      dispatch(fetchProfileForLogin(uid));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer);
