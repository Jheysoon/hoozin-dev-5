import React from "react";
import { withNavigation } from "react-navigation";
import { StyleSheet, Text, View } from "react-native";
import { Content, Icon, Fab } from "native-base";

const AboutPage = ({ navigation }) => {
  return (
    <React.Fragment>
      <Content>
        <View style={{ padding: 15 }}>
          <Text style={styles.textStyle}>hoozin was designed to…</Text>
          <Text style={styles.textStyle}>
            Please bear with is as we begin the journey of taking hoozin through
            the beta stage. Any and all feedback will be reviewed and taken into
            consideration for product updates.
          </Text>
          <Text style={styles.textStyle}>
            As you get started in using hoozin, please keep in mind that one of
            the requirements is sharing your location with hoozin. Through
            hoozin, your location will be shared with other event members. This
            will allow for a better experience overall. please keep in mind that
            your safety is taken very seriously by us, but please br mindful of
            your own safety.
          </Text>
          <Text style={styles.textStyle}>
            In order to offer a complete event experience, hoozin is reliant on
            the location services functionality of your mobile device. As a
            result, the location presented for each event is only as good as the
            data that is provided to hoozin from a mobile device. Relying on
            location for event members should be tempered by the expectations of
            the mobile devices being used. Depending on actual location should
            be not be considered reliable in the event of an emergency. Please
            remember that the device not only needs to be able to transmit that
            location via an internet connection. (i.e. If a mobile device cannot
            connect to the internet via wifi or cellular the location signal
            cannot be passed to others.
          </Text>
        </View>
      </Content>
      <Fab
        direction="up"
        style={{ backgroundColor: "#2699FB" }}
        position="bottomRight"
        onPress={() => {
          navigation.navigate("EventList");
        }}
      >
        <Icon type="FontAwesome5" name="list" />
      </Fab>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bottomView: {
    height: 50,
    backgroundColor: "transparent",
    borderTopWidth: 0
  },
  bottomBtn: {
    marginRight: 20
  },
  tabBarView: {
    height: 45,
    flexDirection: "row",
    paddingTop: 5
  },
  avatarView: {
    flex: 1,
    alignItems: "center"
  },
  dataView: {
    marginLeft: 20,
    marginRight: 20,
    flex: 2,
    flexDirection: "column"
  },

  line: {
    borderBottomColor: "gray",
    borderBottomWidth: 1
  },
  textStyle: {
    fontFamily: "Lato",
    fontSize: 14,
    paddingBottom: 20,
    color: "#004D9B"
  },
  indicator: {
    justifyContent: "center",
    alignItems: "center"
  },
  fabLeftWrapperStyles: {
    position: "absolute",
    bottom: -30,
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

export default withNavigation(AboutPage);
