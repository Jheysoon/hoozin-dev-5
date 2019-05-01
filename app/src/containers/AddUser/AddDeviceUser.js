import React, { Component } from 'react'
import { View, Text, TouchableOpacity, AppState, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Content, Footer, Left, Right, Body, Fab, Icon, Button, Spinner } from 'native-base';
import Toast from 'react-native-root-toast';
import OpenAppSettings from 'react-native-app-settings'
import * as Contact from 'react-native-contacts';
import firebase from "react-native-firebase";
import { connect } from 'react-redux';
import { IconsMap } from 'assets/assetMap';
import { SearchAndAddcontact } from './SearchAndAddContact';

/**
 * Redux container component to host features & functionalities to add app user from device contact
 */
class AddDeviceUserContainer extends Component {
  static navigationOptions = {
    header: null
  }

  constructor() {
    super();
    this.state = {
      contactList: [], // Device contact list
      selectedContactHolder: [], // An array to hold the user selection of Contacts
      name: '',
      email: '',
      phone: '',
      appState: AppState.currentState,
      isContactPermisionDenied: false,
      editMode: false,
      eventId: ''
    };
  }

  componentDidMount() {
    this.checkForDevicePermission();
    if (this.props.screenProps.eventKey) {
      this.setState({ editMode: this.props.screenProps.editMode, eventId: this.props.screenProps.eventKey });
    }
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      this.checkForDevicePermission();
    }
    this.setState({ appState: nextAppState });
  }

  /**
   * @description Check for device DANGEROUS permission to access device contact
   */
  async checkForDevicePermission() {
    const checkPermissionStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);

    if (!checkPermissionStatus) {
      const requestPermissionStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
      if (requestPermissionStatus) {
        return this.getAllDeviceContacts();
      }
      return;
    }
    return this.getAllDeviceContacts();
  }

  /**
   * @description Fetches all the Device contacts
   */
  getAllDeviceContacts() {
    Contact.getAll((err, contacts) => {
      if (err) {
        this.setState({ isContactPermisionDenied: true });
        return;
      }

      // important : to ensure no blank contact is being picked up - by normal or exploitation
      // ISSUE - was causing blank contact and misleading contact issue
      const sanitizedContacts = contacts.filter(contact => (contact.givenName || contact.familyName) && (contact.emailAddresses.filter(item => item.email).length > 0 || contact.phoneNumbers.filter(item => item.number).length > 0));
      this.setState({
        contactList: sanitizedContacts,
        isContactPermisionDenied: false,
      });
    });
  }

  /**
   * @description Presents System settings UI panel if user denies contact
   */
  showSystemSettings() {
    this.setState({ isContactPermisionDenied: false });
    OpenAppSettings.open();
  }

  /**
   * @description update the selected user's button state and reload local state
   * @param {boolean} btnState
   * @param {any} userNode
   * @param {any} thisContext
   */
  reloadLocalState(btnState, userNode, thisContext) {
    userNode['preselect'] = btnState;
    thisContext.setState({
      contactList: thisContext.state.contactList
    });
  }

  /**
   * @description selects one or more contacts to be added as app user and/or friend to current user
   * @param {any} data 
   */
  onSelectContact(data) {
    const contactData = { email: data.emailAddresses[0] ? data.emailAddresses[0].email : "", phone: data.phoneNumbers[0] ? data.phoneNumbers[0].number : "", name: `${data.givenName} ${data.familyName}`.toLowerCase() };

    let allSelectedContacts = this.state.selectedContactHolder;
    allSelectedContacts.push(contactData);
    this.setState({ selectedContactHolder: allSelectedContacts });
    this.reloadLocalState(true, data, this);
  }

  /**
   * @description deselects one or more contacts to be removed as app user and/or friend to current user
   * @param {any} data 
   */
  onDeselectContact(data) {
    let allSelectedContacts = this.state.selectedContactHolder;
    allSelectedContacts = allSelectedContacts.filter(item => {
      let email = "";
      let phone = "";
      if (data.emailAddresses.length > 0) {
        email = data.emailAddresses[0].email;
      }
      if (data.phoneNumbers.length > 0) {
        phone = data.phoneNumbers[0].number;
      }
      return item.email != email || item.phone != phone
    });
    this.setState({ selectedContactHolder: allSelectedContacts });
    this.reloadLocalState(false, data, this);
  }

  /**
   * @description does 2 things -
     * (1) Chceks for user existance first; if not exists, only then create an entry
     * (2) Add the user (new or existing) to the current event as invitee
     * same to `createOrAddUserToEvent` method in AddNewUser screen
   * @param {Array} contactList 
   */
  async onConfirmAction(contactList) {
    if (contactList.length == 0) {
      Alert.alert("Please select at least one contact to continue");
      return;
    }
    this.props.screenProps.willShowSpinner(true);
    await this.asyncLoop(contactList);
    this.props.screenProps.willShowSpinner(false);
    this.props.screenProps.rootNavigation.replace('AddInvitee', { includeInvitees: true, eventKey: this.state.eventId, editMode: this.state.editMode });
  }

  /**
   * @description an async wrapper for loop operation
   * @param {*} contactList 
   */
  asyncLoop(contactList) {
    return Promise.all(contactList.map(async contactData => {
      await SearchAndAddcontact(contactData, this.state.eventId, this.props.user.socialUID);
    }));
  }

  /**
   * @description This function does opposite to what onAddUser does
   * @param {any} data 
   */
  onRemoveUser(data) {
    this.removeContactFromAppUsersAPI(data)
      .then(result => {
        this.reloadLocalState(false, data, this);
      })
  }

  /**
   * @description This function removes `users` from this app's userbase by using Firebase API. *TODO - move to a service
  *  @param {any} data 
  */
  removeContactFromAppUsersAPI(data) {
    return firebase.database().ref('users')
      .orderByChild('email')
      .equalTo(data.emailAddresses[0].email)
      .once("value")
      .then(snapshot => {
        if (snapshot._childKeys.length > 0) {
          return this.removeUserAsInviteeFromEventAPI(snapshot._childKeys[0]).then(() => {
            return ref.child(snapshot._childKeys[0]).remove();
          });
        }
      });
  }

  /**
     * @description Add the selected user as invitee to the current event
     * @param {String} invitationId
     */
  removeUserAsInviteeFromEventAPI(invitationId) {
    const socialUID = this.props.user.socialUID;
    const eventKey = this.state.eventId;
    return firebase.database().ref(`users/${socialUID}/event/${eventKey}/invitee/${invitationId}`).remove();
  }

  render() {
    return (
      <Container style={{ backgroundColor: '#ffffff' }}>
        <Content>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#ffffff' }}>
            <View style={{ flex: 18, marginBottom: 10 }}>
              {this.state.contactList && this.state.contactList.length > 0 ?
                this.state.contactList.map((data, key) => {
                  return (
                    <View style={{ paddingTop: 3 }} key={key}>
                      <View style={{
                        width: '95%',
                        marginBottom: 2,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center', backgroundColor: 'white',
                        borderRadius: 40, marginLeft: 2, shadowColor: '#707070', shadowOffset: { width: 4, height: 6 }, shadowOpacity: 0.3, elevation: 3
                      }}>
                        <View style={{ flex: 1 }}>
                          {
                            data.thumbnailPath ?
                              <Image
                                source={{ uri: data.thumbnailPath }}
                                style={{ alignSelf: 'center', width: 40, height: 40, borderRadius: 20, marginLeft: -15  }}
                              />
                              :
                              <Image
                                source={IconsMap.icon_contact_avatar}
                                style={{ alignSelf: 'center', width: 40, height: 40, borderRadius: 20, top: 0, marginLeft: -15 }}
                              />
                          }
                        </View>
                        <View style={{ flex: 4, justifyContent: 'center', position: 'relative' }}>
                          <Text style={data.colorChange ? { fontSize: 14, color: 'red', position: 'relative',  } : { fontSize: 14, fontFamily: 'Lato', position: 'relative' }}>{data.givenName || null + " " + data.familyName || null}</Text>
                          <View style={{ width: '90%', flex: 1, justifyContent: 'space-between', flexWrap: 'nowrap', flexDirection: 'row' }}>
                            <Text style={{ fontFamily: 'Lato', fontSize: 12, color: '#8E8E93' }}>E: {data.emailAddresses[0]?data.emailAddresses[0].email:''}</Text>
                            <Text style={{ fontFamily: 'Lato', fontSize: 12, color: '#8E8E93' }}>M: {data.phoneNumbers[0]?data.phoneNumbers[0].number:''}</Text>
                          </View>
                        </View>
                        {
                          data.preselect ?
                            <Button 
                              transparent 
                              icon 
                              style={{ alignSelf: 'center', marginTop: -10}} 
                              onPress={() => this.onDeselectContact(data)}
                              >
                              <Icon type="FontAwesome" name="plus" style={{ color: '#689F38', fontSize: 18, marginTop: 10 }} />
                            </Button>
                            :
                            <TouchableOpacity 
                              onPress={() => this.onSelectContact(data)} 
                              style={{ alignSelf: 'center', position:'relative', left: -10 }} 
                              >
                              {Platform.OS === 'ios'?
                                <Image source={IconsMap.icon_success_mini} style={{ width: 19.25, height: 16.25 }} />:
                                <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.25 16.25">
                                <defs>
                                  <style>
                                    .cls-1 {
                                      fill: #2699fb;
                                    }
                              
                                    .cls-2 {
                                      fill: none;
                                    }
                                  </style>
                                </defs>
                                <g id="Yes" transform="translate(-455 -170)">
                                  <path id="Checkbox" class="cls-1" d="M8.375,14.75,1,7.375l1.75-1.75,5.625,5.5L18.5,1l1.75,1.75Z" transform="translate(454 171.5)"/>
                                  <rect id="Rectangle_556" data-name="Rectangle 556" class="cls-2" width="16" height="16" transform="translate(455 170)"/>
                                </g>
                              </svg>
                              ` }} style={{ width: 19.25, height: 16.25 }} />
                              }
                            </TouchableOpacity>
                        }
                      </View>
                    </View>
                  )
                }) : null
              }
            </View>
          </View>
        </Content>
        <View style={Platform.OS === 'ios'?styles.bottomHorizontalBar_ios:styles.bottomHorizontalBar_android}></View>
        {this.state.isContactPermisionDenied ?
          <Toast
            visible={this.state.isContactPermisionDenied}
            position={Toast.positions.BOTTOM}
            shadow={true}
            animation={true}
            hideOnPress={true}
            onHidden={() => this.showSystemSettings()}
          >
            The app requires your phone contact list. Tap to enable
        </Toast> : null}
        {Platform.OS === 'ios'?
        <Footer style={styles.bottomView_ios}>
          <Left>
            <TouchableOpacity 
              style={styles.fabLeftWrapperStyles} 
              onPress={() => this.props.screenProps.rootNavigation.goBack()}
              >
              {Platform.OS === 'ios'?
                <Image source={IconsMap.icon_close_gray} style={styles.fabStyles} />:
                <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                <defs>
                  <style>
                    .cls-1 {
                      fill: #bcbcbc;
                      stroke: #bcbcbc;
                    }
              
                    .cls-2 {
                      fill: #fff;
                    }
              
                    .cls-3 {
                      stroke: none;
                    }
              
                    .cls-4 {
                      fill: none;
                    }
              
                    .cls-5 {
                      filter: url(#Ellipse_111);
                    }
                  </style>
                  <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                    <feOffset dy="3" input="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feFlood flood-opacity="0.161"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                  </filter>
                </defs>
                <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                  <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                    <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                      <circle class="cls-3" cx="21" cy="21" r="21"/>
                      <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                    </g>
                  </g>
                  <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                    <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                  </g>
                </g>
              </svg>
              ` }} style={styles.fabStyles} />
              }
            </TouchableOpacity>
          </Left>
          <Body>
            <TouchableOpacity 
              style={{ position: 'absolute', left: 30, bottom: -33 }} 
              onPress={() => this.onConfirmAction(this.state.selectedContactHolder)}
              >
              {Platform.OS === 'ios'?
                <Image source={IconsMap.icon_success} style={styles.fabStyles} />:
                <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                <defs>
                  <style>
                    .cls-1 {
                      fill: #2699fb;
                    }
              
                    .cls-2 {
                      fill: #fff;
                    }
              
                    .cls-3 {
                      fill: none;
                    }
              
                    .cls-4 {
                      filter: url(#Search_Field);
                    }
                  </style>
                  <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                    <feOffset dy="6" input="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feFlood flood-opacity="0.161"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                  </filter>
                </defs>
                <g id="Group_1162" data-name="Group 1162" transform="translate(-158 -619)">
                  <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                    <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                  </g>
                  <g id="Yes" transform="translate(-277 465)">
                    <path id="Checkbox" class="cls-2" d="M8.375,14.75,1,7.375l1.75-1.75,5.625,5.5L18.5,1l1.75,1.75Z" transform="translate(454 171.5)"/>
                    <rect id="Rectangle_556" data-name="Rectangle 556" class="cls-3" width="16" height="16" transform="translate(455 170)"/>
                  </g>
                </g>
              </svg>
              ` }} style={styles.fabStyles} />
              }
            </TouchableOpacity>
          </Body>
          <Right></Right>
        </Footer>:
        <View style={styles.bottomView_android}>
        <Left>
          <TouchableOpacity 
            style={styles.fabLeftWrapperStyles} 
            onPress={() => this.props.screenProps.rootNavigation.goBack()}
            >
            {Platform.OS === 'ios'?
              <Image source={IconsMap.icon_close_gray} style={styles.fabStyles} />:
              <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
              <defs>
                <style>
                  .cls-1 {
                    fill: #bcbcbc;
                    stroke: #bcbcbc;
                  }
            
                  .cls-2 {
                    fill: #fff;
                  }
            
                  .cls-3 {
                    stroke: none;
                  }
            
                  .cls-4 {
                    fill: none;
                  }
            
                  .cls-5 {
                    filter: url(#Ellipse_111);
                  }
                </style>
                <filter id="Ellipse_111" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                  <feOffset dy="3" input="SourceAlpha"/>
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feFlood flood-opacity="0.161"/>
                  <feComposite operator="in" in2="blur"/>
                  <feComposite in="SourceGraphic"/>
                </filter>
              </defs>
              <g id="Group_1204" data-name="Group 1204" transform="translate(-9 -621)">
                <g class="cls-5" transform="matrix(1, 0, 0, 1, 9, 621)">
                  <g id="Ellipse_111-2" data-name="Ellipse 111" class="cls-1" transform="translate(9 6)">
                    <circle class="cls-3" cx="21" cy="21" r="21"/>
                    <circle class="cls-4" cx="21" cy="21" r="20.5"/>
                  </g>
                </g>
                <g id="Symbol_85_1" data-name="Symbol 85 – 1" transform="translate(30.6 639.6)">
                  <path id="Union_3" data-name="Union 3" class="cls-2" d="M9,10.636,1.636,18,0,16.363,7.364,9,0,1.636,1.636,0,9,7.363,16.364,0,18,1.636,10.636,9,18,16.363,16.364,18Z"/>
                </g>
              </g>
            </svg>
            ` }} style={styles.fabStyles} />
            }
          </TouchableOpacity>
        </Left>
        <Body>
          <TouchableOpacity 
            style={{ position: 'absolute', left: 30, bottom: -33 }} 
            onPress={() => this.onConfirmAction(this.state.selectedContactHolder)}
            >
            {Platform.OS === 'ios'?
              <Image source={IconsMap.icon_success} style={styles.fabStyles} />:
              <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
              <defs>
                <style>
                  .cls-1 {
                    fill: #2699fb;
                  }
            
                  .cls-2 {
                    fill: #fff;
                  }
            
                  .cls-3 {
                    fill: none;
                  }
            
                  .cls-4 {
                    filter: url(#Search_Field);
                  }
                </style>
                <filter id="Search_Field" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
                  <feOffset dy="6" input="SourceAlpha"/>
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feFlood flood-opacity="0.161"/>
                  <feComposite operator="in" in2="blur"/>
                  <feComposite in="SourceGraphic"/>
                </filter>
              </defs>
              <g id="Group_1162" data-name="Group 1162" transform="translate(-158 -619)">
                <g class="cls-4" transform="matrix(1, 0, 0, 1, 158, 619)">
                  <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                </g>
                <g id="Yes" transform="translate(-277 465)">
                  <path id="Checkbox" class="cls-2" d="M8.375,14.75,1,7.375l1.75-1.75,5.625,5.5L18.5,1l1.75,1.75Z" transform="translate(454 171.5)"/>
                  <rect id="Rectangle_556" data-name="Rectangle 556" class="cls-3" width="16" height="16" transform="translate(455 170)"/>
                </g>
              </g>
            </svg>
            ` }} style={styles.fabStyles} />
            }
          </TouchableOpacity>
        </Body>
        <Right></Right>
      </View>
      }
      </Container>
    )
  }

}
const styles = StyleSheet.create({
  bottomView_ios: {
    height: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    flexDirection: 'row',
    borderTopWidth: 0,
  },
  bottomView_android: {
    height: 50,
    width: '100%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    flexDirection: 'row',
    borderTopWidth: 0,
  },  
  fabLeftWrapperStyles: {
    position: 'absolute',
    bottom: -30,
    left: 20
  },
  fabRightWrapperStyles: {
    position: 'absolute',
    bottom: -30,
    right: 20
  },
  fabStyles: {
    width: 60,
    height: 60
  },
  bottomHorizontalBar_ios: { 
    width: '90%', 
    height: 1, 
    backgroundColor: '#BCE0FD', 
    marginBottom: 10, 
    position: 'relative', 
    left: 10, 
    top: -20 
  },
  bottomHorizontalBar_android: { 
    width: '90%', 
    height: 1, 
    backgroundColor: '#BCE0FD', 
    marginBottom: 10, 
    position: 'relative', 
    left: 10, 
    top: 0 
  }
});

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.auth.user,
    event: state.event.details,
    indicatorShow: state.auth.indicatorShow,
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    onShowIndicator: (bShow) => { dispatch(setVisibleIndicatorAction(bShow)) },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddDeviceUserContainer);
