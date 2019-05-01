import React from "react";
import { PropTypes } from "prop-types";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import * as Theme from "./../theme/hoozin-theme";
import { centeredText } from "./../theme/mixins";

const FilterItems = ({ text, type, bg, highlight, active, onPress }) => {
  return (
    <View style={{ marginTop: 2 }}>
      <TouchableOpacity
        style={[
          style.btnGroups,
          {
            borderColor: bg,
            backgroundColor: active == type ? highlight : "#ffffff"
          }
        ]}
        onPress={() => {
          onPress(type);
        }}
      >
        <Text style={style.btnGroupTxt}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  btnGroups: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderRadius: 20,
    minWidth: 50
  },
  btnGroupTxt: {
    color: Theme.BRAND_COLOR.SECONDARY_TEXT,
    ...centeredText
  }
});

FilterItems.propTypes = {
  text: PropTypes.string,
  type: PropTypes.string,
  bg: PropTypes.string,
  highlight: PropTypes.string,
  active: PropTypes.string,
  onPress: PropTypes.func
};

export default FilterItems;
