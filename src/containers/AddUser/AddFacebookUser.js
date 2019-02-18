import React, { Component } from 'react'
import { View, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firebase from "react-native-firebase";
import FBSDK from 'react-native-fbsdk';
import { connect } from 'react-redux';
import { IconsMap } from 'assets/assetMap';

class AddFacebookUserContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactList: []
    };
    this.accountType = this.props.user.accountType
  }

  static navigationOptions = ({navigation}) => ({
    header: null
  });

  componentDidMount() {
    // const { GraphRequest, GraphRequestManager } = FBSDK;

    // const infoRequest = new GraphRequest(
    //   '/me',
    //   null,
    //   (err, result) => {
    //     if(err) { throw new Error(err)}
    //     if(result) {
    //       console.log("==fb graph result ==", result);
    //     }
    //   }
    // );
    // new GraphRequestManager().addRequest(infoRequest).start();
  }
  render() {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={{ flex: 1 }}
        scrollEnabled={true}>
        {
          this.props.user.accountType == 'facebook'?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>This feature will arrive soon</Text>
          </View>:
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Please login through Facebook to use this page</Text>
          </View>
        }
        
        <View style={{ position: 'absolute', top: 400, width: '50%' }}>
          <View style={{ position: 'relative', flexDirection: 'row', padding: 15, paddingTop: 100, justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => this.props.screenProps.rootNavigation.goBack()}>
              <Image source={ IconsMap.icon_cancel } />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.screenProps.rootNavigation.navigate(
              {
                routeName: 'AddInvitee',
                key: 'AddInvitee',
              })}
            >
              <Image source={ IconsMap.icon_confirm } />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user,
    event: state.event.details,
    indicatorShow: state.auth.indicatorShow,
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    onShowIndicator: (bShow) => { dispatch(setVisibleIndicator(bShow)) },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddFacebookUserContainer);
