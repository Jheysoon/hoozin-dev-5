/**
 * @description Simple Container component to manage the Tabbar navigation
 */

// Libraries
import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Image from 'react-native-remote-svg';
import { Spinner } from 'native-base';
import { TabBarTop, TabNavigator } from 'react-navigation';
import { connect } from 'react-redux';

// Presentational Components
import AddNewUser from './AddUser/AddNewUser';
import AddDeviceUser from './AddUser/AddDeviceUser';
import AddFacebookUser from './AddUser/AddFacebookUser';
import AppBarComponent from '../components/AppBar/appbar.index';
import { setVisibleIndicatorAction } from '../actions/auth'
import { IconsMap } from 'assets/assetMap';

// tab bar configuration options
const tabNavConfig = {
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'New') {
        return (<View>
          <TouchableOpacity>
          {Platform.OS === 'ios'?
              <Image source={ IconsMap.icon_user } style={{width: 32, height: 32}} />:
              <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
              <defs>
                <style>
                  .cls-1 {
                    fill: #2699fb;
                  }
                </style>
              </defs>
              <g id="Group_371" data-name="Group 371" transform="translate(-80 -1803)">
                <g id="Group_333" data-name="Group 333" transform="translate(80 1803)">
                  <path id="Rectangle_31" data-name="Rectangle 31" class="cls-1" d="M10.119,0h5.762A10.119,10.119,0,0,1,26,10.119v0a2.53,2.53,0,0,1-2.53,2.53H2.53A2.53,2.53,0,0,1,0,10.119v0A10.119,10.119,0,0,1,10.119,0Z" transform="translate(0 13.351)"/>
                  <ellipse id="Ellipse_14" data-name="Ellipse 14" class="cls-1" cx="6.842" cy="7.027" rx="6.842" ry="7.027" transform="translate(6.158)"/>
                </g>
              </g>
            </svg>
            ` }} style={{width: 32, height: 32}} />
            }
          </TouchableOpacity>
        </View>)
      } else if (routeName === 'Device') {
        return (<View>
          <TouchableOpacity>
          {Platform.OS === 'ios'?
              <Image source={ IconsMap.icon_device } style={{width: 32, height: 32}} />:
              <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 28.649">
              <defs>
                <style>
                  .cls-1 {
                    fill: #fff;
                    stroke: #7fc4fd;
                    stroke-width: 0.5px;
                  }
            
                  .cls-2 {
                    fill: #7fc4fd;
                  }
            
                  .cls-3 {
                    fill: #1d6cbc;
                  }
            
                  .cls-4 {
                    stroke: none;
                  }
            
                  .cls-5 {
                    fill: none;
                  }
                </style>
              </defs>
              <g id="Group_1111" data-name="Group 1111" transform="translate(-53 -89.351)">
                <g id="Group_1110" data-name="Group 1110">
                  <g id="Rectangle_31" data-name="Rectangle 31" class="cls-1" transform="translate(53 89.351)">
                    <rect class="cls-4" width="19" height="28.649" rx="2"/>
                    <rect class="cls-5" x="0.25" y="0.25" width="18.5" height="28.149" rx="1.75"/>
                  </g>
                  <rect id="Rectangle_39" data-name="Rectangle 39" class="cls-2" width="17" height="24" rx="2" transform="translate(54 90.351)"/>
                </g>
                <circle id="Ellipse_14" data-name="Ellipse 14" class="cls-3" cx="1" cy="1" r="1" transform="translate(62 115)"/>
              </g>
            </svg>
            ` }} style={{width: 32, height: 32}} />
            }
          </TouchableOpacity>
        </View>)
      }
      else if (routeName === 'Facebook') {
        return (<View>
          <TouchableOpacity>
          {Platform.OS === 'ios'?
              <Image source={ IconsMap.icon_fb } style={{width: 32, height: 32}} />:
              <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
              <image id="facebookLogo" width="26" height="26" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAk1BMVEU7WZj///9DYJxAXptJZZ83VZb3+PspTJGYpccxUZNIYp2/yd3d4uxjeavY3ek9XJtQbKUmSY/r7vXK0uOgrsyqttGLm7/S2ed6jbceRI0yUpfb4Od0h7BmfKxbdKjz9fe5w9KElrXH0Nl9kLSvutO6xNlfeaauuszO1t2Oobvo6/Nacqhxhq5lfahwhrWJmsCZqcDpXmosAAAEu0lEQVR4nO3dW3+aMBjH8aAEiKeheMSprYfOanV7/69u2Nb1Yg4eiYE82f93sd2ske8nQEShE95n819vse9K8el1foWJ9z+D9VuaSuFOMg1PT6sv4eFVOuV7L5XP86tw/j2te3OMlJ72H0JXgRfi/CIMXl0FZsTNKhOupXOH4FfpUyZ8c3cKs3PqMhBzl4FChGvxy21h+ixODh+FWfJF+HVvg+F80ah7EwzXhJB9EPIPQv5ByD8I+Qch/yDkH4T8g5B/EFqQvFbuxy0WShX2+2GYfvqUUmmY1b+U/a2IZEuFMoPI+Dwe7ZJJr/NerzeZJEl7tx0No5/TczduiTT7R4VD2SiU/ZnsDpOBl1sQDA6TXauQaJ9QqfhnEuTrvopV0XiWCaVqTHdkXjaRzIRSHscJncdOKFUcTe7yebz2UiWm9MOP4xyG/rbg5Mlc2O/27p5ATkI5m5bxeWyOQzmLSgKZzKFMh+V8XOZQimHJGWQzh9Gq9BSyEMpNiVXiTwyEstvRADKYQ9loawA5CMNIB8hAqOLSp9GPrBfOtPZRBnMYdvWA9s9hePf1ILM5DM+6U2i7UN33kcWt7Baqhc67GQ5zGI40lwrbhbLV0wVaLgyn2jup5cehGukDrZ5D2dJdDC/ZLFQLncsmFsLxHZf2weBw+X7t73yLhXJL5vXaw80ibjW//V3x69QmpF/6TqKlCEOl5K2KX6g2oTrSTjSr0TFUOo/11CeknWgGY1F4pOVXn5C03geR9sOR9QnHlDelO6H93Fl9ZxrKJ/mdheYuKuoUUt6ztR/wAG996yFhOVyNQ/3XqUsom7ti4WGpv5PaLew1H/B8a23CFkGYPGAKaxQS3rTtHnAYWi0MRs4Lh84LIwgpQWgqCCGkB6GpIISQHoSmghBCehCaCkII6UFoKgiZCNW/C78VfyIcRLOcEd6rWdjo5rQovi8xGB3zRsjG6NYrVMtOXoR7TQa5A2S1CbuxSaH2Lc6FJTPXhVvnhVHfdeHZ+eOwS1guWAuDuN67vswLD03CZrAWJpTNYC3c1fyuzbxw6Lxw7Lxw6rowWFBuKOIsPBxdF05814VtyoLPWrglbQZn4ZB05yJn4dh1YUBaDjkLB7Tb3BkLe0vX99KEcv3LWrhruC6kLYechbTlkLEwIF0dchYOaMshY+Hh7LpwQlsOGQsT0tUhZ2Gb+FCUSeHx5hP01wjfkB5yfrwTETfD6Pf4N56f//McvU+6UyFvBBuEN5+g//wN64TH8YOonzOCFcKcHLnbJCcIIaQHoakghJAehKaCEEJ6EJoKQgjpQWgqCCGkB6GpIISQHoSmghBCehCaCkII6UFoKgghpAehqSCEkB6EpoIQQnoQmgpCCOlBaCoIIaQHoakghJAehKaCEEJ6EJoKQgjpQWgqCCGkB6GpIISQ3v8g9B8wyv1VJ2yJlwf8v8n3V5lQLsVrqj9MiReuSphuxN5tYbgW3qmO3bQqoYxXwntyWZj+8IS32tSwn1YkTN9WmdCbn6onViNMl3vvIvT21RMrEabLtfch9OYbVfHBWIFQpt/33lXorZ6W/bRKpGmhVP34x8evExPX8fbPL36jsppx2wuKimTZ4f2X53XwCfsNE8N+WABDbt8AAAAASUVORK5CYII="/>
            </svg>
            ` }} style={{width: 32, height: 32}} />
            }
          </TouchableOpacity>
        </View>)
      }
    }
  }),
  tabBarOptions: {
    activeTintColor: '#6495ed',
    activeBackgroundColor: '#cccccc',
    inactiveBackgroundColor: '#ffffff',
    inactiveTintColor: 'gray',
    showIcon: true,
    upperCaseLabel: false,
    scrollEnabled: true,
    style: {
      backgroundColor: 'white'
    },
    indicatorStyle: {
      borderBottomColor: '#6495ed',
      borderBottomWidth: 2
    }
  },
  tabBarComponent: TabBarTop,
  tabBarPosition: 'top',
  animationEnabled: true,
  swipeEnabled: true,
  backBehavior: false,
  initialRouteName: 'Device' 
};

// tab bar instance that we will dynamically set through 
let Tab;

const assetsMap = {
  user_icon: require('assets/icon/user-silhouette.png'),
  device_icon: require('assets/icon/smartphone.png'),
  fb_icon: require('assets/icon/facebook.png')
};

// A wrapper component to hold these two components down and render
class TabNavigation extends Component {
  constructor() {
    super();
    this.state = { editModeActive: false, eventId: '', reload: () => {}, animating: false }
  }
  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    const { params } = this.props.navigation.state;
    if(!!params && !!params.eventId) {
      this.setState({ editModeActive: params.isEditMode, eventId: params.eventId, reload: params.willReload })
    }
    this.renderTabBar();
  }

  renderTabBar() {
    const routes = this.props.user.accountType != "facebook"?{
      Device: { screen: AddDeviceUser },
      New: { screen: AddNewUser }
    }:{
      Device: { screen: AddDeviceUser },
      New: { screen: AddNewUser },
      Facebook: { screen: AddNewUser }
    };

    // now update the tab instance according to auth provider
    Tab = TabNavigator(routes, tabNavConfig);
  }

  showSpinner(state) {
    console.log("++ inside show spinner param ++", state);
    this.props.onShowIndicator(state);
    this.setState({ animating: state })
  }

  render() {
    return(
      <View style={{ flex: 1 }}>
        <AppBarComponent headerTitle="Add New Contact" />
        <Tab screenProps={{ rootNavigation: this.props.navigation, editMode: this.state.editModeActive, eventKey: this.state.eventId, willReload: this.props.navigation.state.params.willReload, willShowSpinner: this.showSpinner.bind(this)}} />
        {this.state.animating &&
          <View style={styles.overlay}>
            <Spinner color={'lightgoldenrodyellow'} style={styles.spinner} />
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999999,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user,
    indicatorShow: state.auth.indicatorShow,
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    onShowIndicator: (bShow) => { dispatch(setVisibleIndicatorAction(bShow)) },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabNavigation);