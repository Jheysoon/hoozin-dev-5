import React from "react";
import { Textarea } from "react-native";

const CustomTextarea = props => {
  const { field, form } = props;

  return (
    <Textarea
      autoCorrect={false}
      onChangeText={text => form.setFieldValue(field.name, text)}
      value={field.value}
      underlineColorAndroid="transparent"
      {...props}
    />
  );
};
export default CustomTextarea;
