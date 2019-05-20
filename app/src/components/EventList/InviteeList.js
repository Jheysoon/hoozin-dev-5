import React from "react";
import Image from "react-native-remote-svg";
import firebase from "react-native-firebase";
import { List, ListItem, Icon } from "native-base";
import { CachedImage } from "react-native-cached-image";
import UserAvatar from "react-native-user-avatar";

import { IconsMap } from "../../../assets/assetMap";

let conRef = null;
let conListener = null;
let ref = null;
let listener = null;

class InviteeList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: []
    };
  }

  componentWillUnmount() {
    if (ref) {
      ref.off("value", listener);
    }

    if (conRef) {
      conRef.off("value", conListener);
    }
  }

  componentDidMount() {
    const { eventId } = this.props;

    conRef = firebase.database().ref(".info/connected");

    conListener = conRef.on("value", snap => {
      if (snap.val()) {
        ref = firebase.database().ref(`invitees/${eventId}`);
        listener = ref.on("value", snapshot => {
          let list = [];

          if (snapshot._value) {
            list = Object.keys(snapshot._value).map(key => {
              snapshot._value[key]["inviteeId"] = key;
              return snapshot._value[key];
            });
          }

          this.setState({
            list: list
          });
        });
      }
    });
  }

  render() {
    return this.state.list.length ? (
      <List
        dataArray={this.state.list}
        horizontal={true}
        renderRow={(item, key) => (
          <ListItem
            key={key}
            style={{
              padding: 0,
              marginLeft: 5,
              borderBottomWidth: 0
            }}
          >
            {item.profileImgUrl ? (
              <UserAvatar
                size={48}
                name={item.name}
                src={item.profileImgUrl}
                component={CachedImage}
                containerStyle={{ opacity: item.status == "going" ? 1 : 0.3 }}
              />
            ) : (
              <UserAvatar
                name={item.name}
                size={48}
                containerStyle={{ opacity: item.status == "going" ? 1 : 0.3 }}
                textColor={item.status == "going" ? "#fff" : "rgba(0,0,0,.5)"}
              />
            )}
          </ListItem>
        )}
        {...this.props}
      />
    ) : null;
  }
}

export default InviteeList;
