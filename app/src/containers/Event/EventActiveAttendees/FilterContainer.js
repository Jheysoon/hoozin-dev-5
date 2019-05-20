import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform
} from "react-native";
import {
  Container,
  Content,
  Footer,
  Left,
  Body,
  Right,
  Item
} from "native-base";
import { withNavigation } from "react-navigation";

import FilterItems from "../../../components/FilterItems";
import InviteeItem from "../../../components/InviteeItem";

const filters = [
  {
    type: "all",
    text: "All",
    bg: "hsla(207, 97%, 75%, 1)",
    highlight: "hsla(207, 97%, 75%, .3)"
  },
  {
    type: "accepted",
    text: "Accepted",
    bg: "hsla(106, 36%, 52%, 1)",
    highlight: "hsla(106, 36%, 52%, .3)"
  },
  {
    type: "maybe",
    text: "Maybe",
    bg: "hsla(37, 87%, 50%, 1)",
    highlight: "hsla(37, 87%, 50%, .3)"
  },
  {
    type: "declined",
    text: "Declined",
    bg: "hsla(346, 96%, 60%, 1)",
    highlight: "hsla(346, 96%, 60%, .3)"
  },
  {
    type: "friends",
    text: "Friends",
    bg: "hsla(208, 96%, 57%, 1)",
    highlight: "hsla(208, 96%, 57%, .3)"
  }
];

const FilterContainer = ({
  list,
  filterInvitee,
  active,
  showInviteeLocation,
  navigation,
  eventId,
  hostId,
  showUserProfile
}) => {
  const showInvitee = id => {
    navigation.navigate("EventActiveMap", {
      eventId,
      showInviteeLocation: true,
      withInviteeId: id,
      isHostUser: id == hostId
    });
  };

  return (
    <React.Fragment>
      <View style={{ position: "relative", left: 4 }}>
        <ScrollView horizontal={true}>
          {filters.map((val, key) => (
            <FilterItems
              onPress={filterInvitee}
              active={active}
              key={key}
              {...val}
            />
          ))}
        </ScrollView>
      </View>
      <Content>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
          <View style={{ flex: 18, marginBottom: 10 }}>
            {list.map((val, key) => (
              <InviteeItem
                data={val}
                key={key}
                showUserProfile={showUserProfile}
                showInviteeLocation={showInviteeLocation}
                viewType="eventActiveUser"
              />
            ))}
          </View>
        </View>
      </Content>
    </React.Fragment>
  );
};

export default FilterContainer;
