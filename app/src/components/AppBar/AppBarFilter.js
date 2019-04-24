import React from "react";
import { PropTypes } from "prop-types";
import { View, ScrollView } from "react-native";

import FilterItems from "../FilterItems";

type Props = {
  filterEvent: any,
  active: string
};

const filters = [
  {
    type: "all",
    text: "All",
    bg: "hsla(207, 97%, 75%, 1)",
    highlight: "hsla(207, 97%, 75%, .3)"
  },
  {
    type: "active",
    text: "Active",
    bg: "hsla(346, 96%, 60%, 1)",
    highlight: "hsla(346, 96%, 60%, .3)"
  },
  {
    type: "accepted",
    text: "Accepted",
    bg: "hsla(106, 36%, 52%, 1)",
    highlight: "hsla(106, 36%, 52%, .3)"
  },
  {
    type: "invited",
    text: "Invited",
    bg: "hsla(37, 87%, 50%, 1)",
    highlight: "hsla(37, 87%, 50%, .3)"
  },
  {
    type: "public",
    text: "Public",
    bg: "hsla(208, 96%, 57%, 1)",
    highlight: "hsla(208, 96%, 57%, .3)"
  },
  {
    type: "myevents",
    text: "My Events",
    bg: "hsla(266, 74%, 42%, 1)",
    highlight: "hsla(266, 74%, 42%, .3)"
  },
  {
    type: "declined",
    text: "Declined",
    bg: "hsla(208, 96%, 57%, 1)",
    highlight: "hsla(208, 96%, 57%, .3)"
  },
  {
    type: "history",
    text: "History",
    bg: "hsla(0, 0%, 44%, 1)",
    highlight: "hsla(0, 0%, 44%, .3)"
  }
];

const AppBarFilter = ({ filterEvent, active }: Props) => {
  return (
    <View style={{ zIndex: 99, backgroundColor: "rgba(255, 255, 255, .5)" }}>
      <ScrollView horizontal={true}>
        {filters.map((val, key) => (
          <FilterItems
            onPress={filterEvent}
            active={active}
            key={key}
            {...val}
          />
        ))}
      </ScrollView>
    </View>
  );
};

AppBarFilter.propTypes = {
  filterEvent: PropTypes.func,
  active: PropTypes.string
};

export default AppBarFilter;
