import React from "react";
import firebase from 'react-native-firebase';
import { connect } from "react-redux";
import { View, Text, NetInfo, Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");
import { NET_STATUS } from "../constants";

class OfflineNotice extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasFirebaseConnection: true
    };

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

    let connectedRef = firebase.database().ref(".info/connected");

    connectedRef.on("value", (val) => {
      this.setState({
        hasFirebaseConnection: val.val()
      })
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

    if (!status.isConnected) {
      return (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>No Internet Connection</Text>
        </View>
      );
    }

    if (status.isConnected && this.state.hasFirebaseConnection == false) {
      return (
        <View style={styles.firebaseError}>
          <Text style={styles.firebaseErrorText}>Cannot Connect To Firebase Server</Text>
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
  firebaseError: {
    backgroundColor: '#f9a825',
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width,
    position: "relative",
    zIndex: 200
  },
  firebaseErrorText: {
    color: "#000"
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
