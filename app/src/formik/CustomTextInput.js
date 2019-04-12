import React from "react";
import { TextInput } from "react-native";

const CustomTextInput = props => {
  const { field, form } = props;
  return (
    <TextInput
      onChangeText={text => form.setFieldValue(field.name, text)}
      value={field.value}
      {...props}
    />
  );
};

export default CustomTextInput;
