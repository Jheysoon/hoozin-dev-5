import React from "react";
import Image from "react-native-remote-svg";

const defaultColors = [
  '2ecc71', // emerald
  '3498db', // peter river
  '8e44ad', // wisteria
  'e67e22', // carrot
  'e74c3c', // alizarin
  '1abc9c', // turquoise
  '2c3e50', // midnight blue
];

const UserAvatar = (props) => {
  const sumChars = str => {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }

    return sum;
  };

  if (props.src) {
    return (<Image source={{ uri: props.src }} {...props} />)
  }

  let i = sumChars(props.name) % defaultColors.length;
  let background = defaultColors[i];

  return (
    <Image source={{uri: 'https://ui-avatars.com/api/?background=8e44ad&color=fff&name=jayson+m' }} />
  );
};

export default UserAvatar;
