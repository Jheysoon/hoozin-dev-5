import React from "react";
import { View, ScrollView } from "react-native";

import FilterItems from "./../../../components/FilterItems";

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

const InviteeFilter = ({ filterInvitee, active }) => {
  return (
    <View>
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
  );
};

export default InviteeFilter;
