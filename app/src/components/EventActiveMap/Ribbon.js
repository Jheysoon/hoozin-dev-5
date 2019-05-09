import React from "react";
import { Text } from "react-native";
import { Body, Icon, Item } from "native-base";

const Ribbon = () => {
  return (
    <Item
      style={{
        width: "100%",
        height: 30,
        backgroundColor: "#FC3764",
        marginLeft: 0,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 14,
        paddingRight: 14,
        zIndex: 99999,
        justifyContent: "flex-start",
        flexWrap: "nowrap",
        display: "flex"
      }}
    >
      <Icon
        type="FontAwesome"
        name="exclamation"
        style={{ color: "#ffffff" }}
      />
      <Body>
        <Text
          style={{
            color: "#ffffff",
            textAlign: "center",
            fontFamily: "Lato",
            fontSize: 11
          }}
        >
          This event is Active. Your location is shared with the group
        </Text>
      </Body>
    </Item>
  );
};

export default Ribbon;
