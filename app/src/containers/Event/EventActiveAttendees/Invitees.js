import _ from "lodash";
import React from "react";
import { AsyncStorage } from "react-native";
import firebase from "react-native-firebase";

import FilterContainer from "./FilterContainer";
import { filterInviteeByRSVP } from "../../../utils/eventListFilter";

let conRef = null;
let conListener = null;
let ref = null;
let listener = null;

class Invitees extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      active: "all",
      filteredList: [],
      friends: []
    };

    this.filterInvitee = this.filterInvitee.bind(this);
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
        AsyncStorage.getItem("userId", (err, result) => {
          if (result) {
            const getUserFriends = firebase
              .functions()
              .httpsCallable("getUserFriends");
            let uid = JSON.parse(result)["uid"];

            getUserFriends({
              id: uid
            }).then(({ data }) => {
              this.setState({
                friends: data
              });
            });
          }
        });

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

  filterInvitee(status) {
    let filteredList = [];

    if (status != "friends") {
      _.forEach(this.state.list, invitee => {
        if (filterInviteeByRSVP(invitee, status)) {
          filteredList.push(invitee);
        }
      });
    } else {
      filteredList = this.state.friends;
    }

    this.setState({
      active: status,
      filteredList: filteredList
    });
  }

  render() {
    return (
      <FilterContainer
        list={
          this.state.active == "all" ? this.state.list : this.state.filteredList
        }
        active={this.state.active}
        filterInvitee={this.filterInvitee}
        {...this.props}
      />
    );
  }
}

export default Invitees;
