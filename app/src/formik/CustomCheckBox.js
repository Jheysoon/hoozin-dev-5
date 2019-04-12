import React from "react";
import {
  CheckBox
} from "native-base";

const CustomCheckBox = props => {
  const { field, form } = props;
  return (
    <CheckBox
      checked={field.value}
      onPress={() => {
        form.setFieldValue(field.name, !field.value);
      }}
    />
  );
};

export default CustomCheckBox;
