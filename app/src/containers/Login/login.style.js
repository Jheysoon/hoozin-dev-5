import { StyleSheet } from "react-native";
import * as Theme from "../../theme/hoozin-theme";
import * as Mixins from "../../theme/mixins";

export const LoginStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  logo: {
    justifyContent: "center"
  },
  logoText: {
    ...Theme.BRAND_LOGO,
    ...Mixins.centeredText
  },
  inputForm: {
    flex: 2,
    backgroundColor: "rgba(255, 255, 255, 0.68)",
    marginRight: 35,
    marginLeft: 35,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 5,
    flexDirection: "column",
    alignItems: "center"
  },
  textInput: {
    alignSelf: "stretch",
    overflow: "visible",
    ...Theme.BRAND_BODY_TEXT,
    ...Mixins.centeredText,
    ...Mixins.fullWidthCenterAlignedFlexContainer
  },
  rowItem: {
    ...Mixins.fullWidthCenterAlignedFlexContainer
  },
  separator: {
    borderBottomColor: Theme.BRAND_COLOR.PRIMARY_TEXT,
    borderBottomWidth: 1,
    paddingLeft: 90,
    paddingRight: 90
  },
  commonText: {
    ...Theme.BRAND_BODY_TEXT,
    ...Mixins.centeredText
  },
  line: {
    borderBottomColor: Theme.BRAND_COLOR.ACCENT,
    borderBottomWidth: 1
  },
  socialLogin: {
    flexDirection: "row-reverse",
    alignItems: "center"
  },
  googleLogin: {
    marginRight: 5
  },
  loginFailed: {
    borderColor: "red"
  },
  button: {
    ...Theme.BRAND_BODY_TEXT,
    color: Theme.BRAND_COLOR.STYLE1
  },
  loginButton: {
    ...Theme.BRAND_BODY_TEXT,
    color: Theme.BRAND_COLOR.PRIMARY
  },
  loginButtonAndroid: {
    ...Theme.BRAND_BODY_TEXT_ANDROID,
    color: Theme.BRAND_COLOR.PRIMARY
  },
  footer: {
    flex: 1,
    flexDirection: "column-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: -10
  },
  buttonContainer: {
    marginBottom: 15
  },
  overlay: {
    ...Mixins.fullScreenAbsoluteContainer,
    backgroundColor: Theme.BRAND_COLOR.OVERLAY
  },
  spinner: {
    ...Mixins.fullWidthCenterAlignedFlexContainer
  }
});
