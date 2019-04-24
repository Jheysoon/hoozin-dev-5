import { StyleSheet, Platform } from "react-native";
import * as Theme from "../../theme/hoozin-theme";
import * as Mixins from "../../theme/mixins";

export const AppBarStyles = StyleSheet.create({
  header: {
    width: "100%",
    height: 40,
    backgroundColor: Theme.BRAND_COLOR.PRIMARY
  },
  banner: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%"
  },
  title_ios: {
    //marginTop: 10,
    marginTop: -20,
    alignSelf: "center",
    width: "100%"
  },
  title_android: {
    marginTop: -5,
    alignSelf: "flex-end",
    width: "100%",
    marginRight: -40
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
    width: 36,
    height: 36,
    //marginTop: 10,
    marginTop: Platform.select({
      ios: -10,
      android: 0
    }),
    marginRight: -5
  },
  textStyle: {
    fontSize: 16,
    fontFamily: "Lato",
    paddingBottom: 10,
    color: "#1D6CBC",
    textAlign: "center"
  },
  menus: {
    flex: 1,
    flexDirection: "column"
  },
  sideBackButton: {
    width: 22,
    height: 22,
    marginTop: 20,
    marginLeft: 5
  },
  btnGroups: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#ffffff"
  },
  btnGroupTxt: {
    color: Theme.BRAND_COLOR.SECONDARY_TEXT
  },
  backBtnIos: {
    position: "relative",
    top: -3,
    left: -80
  },
  backBtnAndroid: {
    position: "relative",
    top: 3,
    left: -80
  }
});
