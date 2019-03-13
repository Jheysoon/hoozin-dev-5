import React from "react";
import { connect } from "react-redux";
import { View, Text, NetInfo, Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");
import { NET_STATUS } from "../constants";

class OfflineNotice extends React.Component {
  constructor(props) {
    super(props);

    this.changeConnection = this.changeConnection.bind(this);
  }

  componentDidMount() {
    NetInfo.getConnectionInfo().then(({ type }) => {
      this.changeConnection(type);
    });

    NetInfo.addEventListener("connectionChange", ({ type }) => {
      this.changeConnection(type);
    });
  }

  changeConnection(type) {
    let { connectionChanged } = this.props;

    connectionChanged(type != "none");
  }

  render() {
    const { status } = this.props;

    if (!status) {
      return (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>No Internet Connection</Text>
        </View>
      );
    }

    return null;
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: "#b52424",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width,
    position: "relative",
    zIndex: 200
  },
  offlineText: {
    color: "#fff"
  }
});

const mapStateToProps = state => {
  return {
    status: state.connection.isConnected
  };
};

const mapDispatchToProps = dispatch => {
  return {
    connectionChanged: status => {
      dispatch({
        type: NET_STATUS.NET_CHANGED,
        payload: {
          status: status
        }
      });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OfflineNotice);
