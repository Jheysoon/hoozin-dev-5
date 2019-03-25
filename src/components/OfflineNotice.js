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
      this.props.connectionChanged({
        status: type != "none"
      });
    });

    NetInfo.addEventListener("connectionChange", ({ type }) => {
      this.changeConnection(type);
    });
  }

  changeConnection(type) {
    let { connectionChanged } = this.props;

    connectionChanged({
      status: type != "none"
    });
  }

  render() {
    const { status } = this.props;

    if (!status.isConnected && status.trying == false) {
      return (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>No Internet Connection</Text>
        </View>
      );
    }

    if (!status.isConnected && status.trying) {
      return (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>Trying To Reconnect</Text>
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
    status: state.connection
  };
};

const mapDispatchToProps = dispatch => {
  return {
    connectionChanged: payload => {
      dispatch({
        type: NET_STATUS.NET_CHANGED,
        payload: payload
      });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OfflineNotice);
