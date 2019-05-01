import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text
} from "react-native";

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
    bg: "hsla(346, 100%, 50%, 1)",
    highlight: "hsla(208, 96%, 57%, .3)"
  },
  {
    type: "friends",
    text: "Friends",
    bg: "hsla(208, 96%, 57%, 1)",
    highlight: "hsla(208, 96%, 57%, .3)"
  }
];

/**
 * @description calculate color value and return a darker shade of the color
 * @param {string} color
 */
const calculateActiveColor = color => {
  const colorComponents = color.split(",");
  colorComponents[2] = `${parseInt(colorComponents[2]) - 20}%`;
  return colorComponents.join(",");
};

const FilterItems = ({ text, type, bg, active, onPress }) => {
  return (
    <View>
      <TouchableOpacity style={styles.btnGroups} onPress={() => onPress(type)}>
        <Text
          style={{
            color: "#004D9B",
            fontWeight: active == type ? "700" : "400"
          }}
        >
          {text}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          height: 3,
          width: "100%",

          backgroundColor: active == type ? calculateActiveColor(bg) : bg
        }}
      />
    </View>
  );
};

const EventOverviewFilter = ({ onPress, active }) => {
  return (
    <View style={{ position: "relative", left: 20 }}>
      <ScrollView horizontal={true}>
        {filters.map((val, key) => (
          <FilterItems onPress={onPress} active={active} key={key} {...val} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  btnGroups: {
    paddingTop: 6,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#ffffff"
  }
});

export default EventOverviewFilter;
