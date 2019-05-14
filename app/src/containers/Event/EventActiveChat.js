import _ from "lodash";
import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
  Text,
  Alert,
  ScrollView,
  Keyboard,
  Platform
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Spinner, Icon } from "native-base";
import Image from "react-native-remote-svg";
import {
  Container,
  Content,
  Item,
  Left,
  Body,
  List,
  ListItem
} from "native-base";
import { connect } from "react-redux";
import moment from "moment";

import AppBarComponent from "../../components/AppBar/appbar.index";
import { EventServiceAPI, UserManagementServiceAPI } from "../../api";
import { IconsMap } from "assets/assetMap";

import EventActiveChatSvg from "./../../svgs/EventActiveChat";

class EventActiveChatContainer extends Component {
  static navigationOptions = {
    header: null
  };
  constructor() {
    super();
    this.state = {
      messageText: "",
      chats: [],
      chatCounter: 0,
      animating: false,
      currentNavStackDepth: 0,
      activeEventData: null,
      keyboardOpen: false,
      iconHeight: 10
    };
  }

  async componentDidMount() {
    //console.log('tabval CHAT-->', this.props.screenProps.withEvent);
    const eventSvc = new EventServiceAPI();
    const {
      hostId,
      eventId,
      isHostUser
    } = this.props.screenProps.rootNav.state.params;
    const activeEventData = this.props.screenProps.withEvent;
    this.setState({ activeEventData });
    // const { navStackDepth } = this.props.navigation.state.params;
    // console.log("++ nav stack depth on chat screen ++", navStackDepth);

    // 29.10.2018 Changelog - added the 'await' keyword to avoid race condition
    this.getAllChatMsgs(hostId, eventId, eventSvc);

    this.props.navigation.addListener("willBlur", () => {
      this.resetUnreadMsgCount();
    });

    eventSvc
      .watchForEventDataByFieldAPI(hostId, eventId, "messages")
      .limitToLast(1)
      .on("child_added", snapshot => {
        const result = this.state.chats.filter(
          item => item.chatId == snapshot._value.chatId
        );
        const newChatArr =
          result.length == 0
            ? [...this.state.chats, snapshot._value]
            : this.state.chats;
        this.setState({ chats: newChatArr });
        console.log("++ Latest chat store ++", this.state.chats);
      });

    //this.watchForIncomingChats(hostId, eventId, isHostUser);
  }

  async getAllChatMsgs(hostId, eventId, eventInstance) {
    const allChatMsgs = await eventInstance.getEventDetailsByFieldAPI(
      hostId,
      eventId,
      "messages"
    );

    if (allChatMsgs && allChatMsgs.length) {
      this.setState({ chats: allChatMsgs });
    }
    // this.setState({ currentNavStackDepth: navStackDepth + 1 });
  }

  resetUnreadMsgCount() {
    const eventSvc = new EventServiceAPI();
    const {
      hostId,
      eventId,
      isHostUser
    } = this.props.screenProps.rootNav.state.params;

    return eventSvc.resetChatMsgCounterAPI(
      hostId,
      eventId,
      this.props.user.socialUID,
      isHostUser,
      0
    );
  }

  watchForIncomingChats(hostId, eventId, isHostUser) {
    const eventSvc = new EventServiceAPI();
    if (isHostUser && hostId == this.props.user.socialUID) {
      eventSvc
        .watchForEventDataByAPI(hostId, eventId)
        .on("child_changed", snapshot => {
          if (!isNaN(snapshot.val())) {
            console.log("@@@ msgcounter snapshot for host", snapshot.val());
            // this.setState({ chatCounter: snapshot.val() });
          }
        });
    } else {
      eventSvc
        .watchForEventInviteeDataAPI(hostId, eventId, this.props.user.socialUID)
        .on("child_changed", snapshot => {
          if (!isNaN(snapshot.val())) {
            console.log("@@@ msgcounter snapshot for invitee", snapshot.val());
            // this.setState({ chatCounter: snapshot.val() });
          }
        });
    }
  }

  async sendComposedMessage() {
    const trimmedMsg = this.state.messageText.trim().replace(/\s+/g, " ");
    if (this.state.messageText && trimmedMsg) {
      Keyboard.dismiss();
      this.setState({ animating: true });
      const eventSvc = new EventServiceAPI();
      const userSvc = new UserManagementServiceAPI();
      const {
        hostId,
        eventId,
        isHostUser
      } = this.props.screenProps.rootNav.state.params;

      const userData = await userSvc.getUserDetailsByMultipleFieldsAPI(
        this.props.user.socialUID,
        ["name", "profileImgUrl"]
      );

      if (userData) {
        // construct the chat payload
        const chatPayload = {
          chatId: moment.now(),
          userId: this.props.user.socialUID,
          userName: userData.name,
          profileImgUrl: isHostUser
            ? this.state.activeEventData.hostProfileImgUrl
            : userData.profileImgUrl,
          message: trimmedMsg,
          createdAt: moment.utc()
        };

        // return eventSvc.updateDataToEventAPI(hostId, eventId, chatPayload, 'messages', false)
        //     .then(result => {
        //         return eventSvc.updateChatMsgCounter(hostId, eventId, { status: 1 })
        //             .then(result1 => this.setState({ animating: false, messageText: '\u0020' }));
        //     });

        return Promise.all([
          eventSvc.updateDataToEventAPI(
            hostId,
            eventId,
            chatPayload,
            "messages",
            false
          ),
          eventSvc.updateHostOrAttendeesChatMsgCounter(
            eventId,
            this.props.user.socialUID
          )
        ]).then(() =>
          this.setState({ animating: false, messageText: "\u0020" })
        );
      } else {
        Alert.alert("Possible network issue. Please try again later");
      }
    } else {
      this.setState({ messageText: "" });
      Alert.alert("Please add chat message to be sent");
    }
  }

  repositionChatArea(shouldScrollToTop) {
    if (shouldScrollToTop) {
      this.refs.chatMsgHolder.setNativeProps({
        style: { height: "25%" }
      });
      this.chatMsgArea.scrollToEnd({ animated: true });
      return;
    }
    this.refs.chatMsgHolder.setNativeProps({
      style: { height: "50%" }
    });
  }

  render() {
    return (
      <React.Fragment>
        <Container style={{ backgroundColor: "#ffffff" }}>
          <AppBarComponent
            showBackBtnCircle={true}
            reloadHostFunc={this.resetUnreadMsgCount.bind(this)}
            currentScreen="activeChat"
            withNav={this.props.screenProps.rootNav}
          />
          <View style={{ zIndex: 99 }}>
            <View
              style={{
                width: "100%",
                padding: 4,
                backgroundColor: "#ffffff",
                zIndex: 99999
              }}
            >
              {this.state.activeEventData ? (
                <Item
                  style={{ justifyContent: "flex-start", borderBottomWidth: 0 }}
                >
                  <Left style={{ flex: 0.5 }}>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate("EventActiveUser", {
                          withUser: this.state.activeEventData.hostId
                        })
                      }
                    >
                      {this.state.activeEventData &&
                      this.state.activeEventData.hostProfileImgUrl ? (
                        <Image
                          source={{
                            uri: this.state.activeEventData.hostProfileImgUrl
                          }}
                          style={{ width: 70, height: 70, borderRadius: 35 }}
                        />
                      ) : (
                        <Image
                          source={IconsMap.icon_contact_avatar}
                          style={{ width: 70, height: 70, borderRadius: 35 }}
                        />
                      )}
                    </TouchableOpacity>
                  </Left>
                  <Body
                    style={{
                      flex: 2,
                      alignItems: "flex-start",
                      alignSelf: "flex-start"
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "left",
                        fontFamily: "Lato",
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#004D9B"
                      }}
                    >
                      {this.state.activeEventData.eventTitle}
                    </Text>
                    <Text
                      style={{
                        textAlign: "left",
                        fontFamily: "Lato",
                        fontSize: 14,
                        fontWeight: "400",
                        color: "#000000",
                        marginLeft: 2
                      }}
                    >
                      {this.state.activeEventData.hostName}
                    </Text>
                  </Body>
                </Item>
              ) : null}
            </View>
          </View>
          <View style={{ position: "relative", zIndex: 99 }}>
            {Platform.OS === "ios" ? (
              <Image
                source={IconsMap.icon_chat_icon}
                style={{
                  position: "absolute",
                  right: 10,
                  top: -13,
                  zIndex: 999
                }}
              />
            ) : (
              <Image
                source={{ uri: EventActiveChatSvg.Group_1337 }}
                style={{
                  position: "absolute",
                  zIndex: 999,
                  top: -50,
                  right: 5,
                  width: 40
                }}
              />
            )}
          </View>
          <View
            style={{
              width: "90%",
              height: 1,
              backgroundColor: "#BCE0FD",
              zIndex: 9999,
              position: "relative",
              left: 14,
              top: 10,
              marginBottom: 20
            }}
          />
          <View style={{ height: "50%" }} ref="chatMsgHolder">
            <KeyboardAwareScrollView
              ref={ref => (this.chatMsgArea = ref)}
              onContentSizeChange={(contentWidth, contentHeight) =>
                this.chatMsgArea.scrollToEnd({ animated: true })
              }
            >
              {this.state.chats &&
                this.state.chats.map((item, key) => (
                  <View
                    key={key}
                    style={{
                      width: "90%",
                      paddingTop: 5,
                      paddingBottom: 5,
                      paddingLeft: 5,
                      paddingRight: 6,
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignSelf: "center",
                      marginBottom: 10,
                      elevation: 2,
                      backgroundColor: "white",
                      borderRadius: 40,
                      shadowColor: "#777777",
                      shadowOffset: { width: 2, height: 2 },
                      shadowOpacity: 0.3
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      {item.profileImgUrl ? (
                        <Image
                          source={{ uri: item.profileImgUrl }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 44 / 2
                          }}
                        />
                      ) : (
                        <Image
                          source={IconsMap.icon_contact_avatar}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 44 / 2
                          }}
                        />
                      )}
                    </View>
                    <View style={{ flex: 4, position: "relative" }}>
                      <Text
                        style={{
                          fontWeight: "700",
                          fontFamily: "Lato",
                          fontSize: 12
                        }}
                      >
                        {item.userName || ""}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "400",
                          marginTop: 6,
                          fontFamily: "Lato",
                          fontSize: 12
                        }}
                      >
                        {item.message || ""}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "300",
                          fontFamily: "Lato",
                          fontSize: 10,
                          position: "absolute",
                          top: 6,
                          right: 8
                        }}
                      >
                        {item.createdAt
                          ? moment(item.createdAt)
                              .local()
                              .format("MMMM D, YYYY h:mm a")
                          : ""}
                      </Text>
                    </View>
                  </View>
                ))}
            </KeyboardAwareScrollView>
          </View>
          <View style={{ height: "10%", marginTop: 20 }}>
            <ScrollView
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
            >
              <View style={{ width: "90%", position: "relative", left: 14 }}>
                <TextInput
                  multiline={true}
                  enablesReturnKeyAutomatically={true}
                  returnKeyType="send"
                  value={this.state.messageText}
                  onChangeText={text => this.setState({ messageText: text })}
                  onFocus={() => this.repositionChatArea(true)}
                  onBlur={() => this.repositionChatArea(false)}
                  onSubmitEditing={() => this.sendComposedMessage()}
                  onContentSizeChange={event => {
                    let height = event.nativeEvent.contentSize.height;

                    if (height > 40) {
                      let h = event.nativeEvent.contentSize.height / 2;
                      this.setState({
                        iconHeight: h - 10
                      });
                    } else {
                      this.setState({
                        iconHeight: 10
                      })
                    }
                  }}
                  underlineColorAndroid="transparent"
                  style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginBottom: 20,
                    borderColor: "skyblue",
                    borderWidth: 1,
                    width: "100%",
                    borderRadius: 20,
                    position: "relative"
                  }}
                  placeholder="Message..."
                  placeholderTextColor="#2699FB"
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: 5,
                    top: this.state.iconHeight
                  }}
                  onPress={() => this.sendComposedMessage()}
                >
                  <Icon
                    type="FontAwesome5"
                    style={{
                      color:
                        _.size(this.state.messageText) > 0
                          ? "rgb(38, 153, 251)"
                          : "rgb(188, 224, 253)"
                    }}
                    name="arrow-circle-up"
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Container>
        {this.state.animating && (
          <View style={styles.overlay}>
            <Spinner color={"lightgoldenrodyellow"} style={styles.spinner} />
          </View>
        )}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
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
  sendBtnAndroid: {
    width: 40,
    height: 40
  }
});

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user,
    event: state.event.details,
    indicatorShow: state.auth.indicatorShow
  };
};
const mapDispatchToProps = dispatch => {
  return {
    onShowIndicator: bShow => {
      dispatch(setVisibleIndicator(bShow));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventActiveChatContainer);
