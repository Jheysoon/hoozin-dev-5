import React from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import { UIActivityIndicator } from "react-native-indicators";

import * as Theme from "../theme/hoozin-theme";
import * as Mixins from "../theme/mixins";

const LoadingComponent = props => {
  if (props.loading == false) {
    return null;
  }

  return (
    <View
      style={{
        ...Mixins.fullScreenAbsoluteContainer,
        backgroundColor: Theme.BRAND_COLOR.OVERLAY
      }}
    >
      <UIActivityIndicator
        color={"lightgoldenrodyellow"}
        style={{ ...Mixins.fullWidthCenterAlignedFlexContainer }}
      />
    </View>
  );
};

LoadingComponent.propTypes = {
  loading: PropTypes.bool
};

LoadingComponent.defaultProps = {
  loading: false
};

export default LoadingComponent;
