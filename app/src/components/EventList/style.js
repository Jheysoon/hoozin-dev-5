import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  activeText: {
    fontSize: 13,
    fontFamily: "Lato",
    color: "white",
    padding: 4,
    backgroundColor: "#FF003B",
    textAlign: "center",
    position: "relative",
    left: -5
  },
  eventDetailCard: {
    borderBottomWidth: 2,
    borderBottomColor: "#D8D8D8"
  },
  eventDetail: {
    flexDirection: "row",
    flex: 1,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 2,
    paddingRight: 12
  },
  eventInvitee: {
    flexDirection: "row",
    flex: 1,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 2,
    paddingRight: 12
  },
  cardAvatarWrapper: {
    flex: 1,
    justifyContent: "flex-start"
  },
  cardDetail: {
    flex: 3,
    justifyContent: "flex-start",
    marginLeft: 20
  },
  invitees: {
    marginTop: 20,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  cardAvatar: {
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "#000000",
    shadowOpacity: 0.125,
    shadowRadius: 8
  },
  eventHostName: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Lato",
    color: "#000000"
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: "Lato",
    fontWeight: "bold",
    color: "#004D9B",
    marginTop: 5
  },
  eventMetaWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: 20
  },
  bottomView_ios: {
    height: 50,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    justifyContent: "center",
    flexDirection: "row"
  },
  bottomView_android: {
    width: "100%",
    height: 70,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    justifyContent: "center",
    flexDirection: "row"
  },
  fabLeftWrapperStyles: {
    position: "absolute",
    bottom: -27,
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
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)"
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  img_16: {
    width: 16,
    height: 16,
    position: "absolute",
    right: 5,
    top: 3,
    zIndex: 9999
  }
});

export default styles;
