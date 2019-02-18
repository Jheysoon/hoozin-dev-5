import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Content, Footer, Left, Right, Body, Fab, Icon } from 'native-base';
import { connect } from 'react-redux';
import { IconsMap } from 'assets/assetMap';
import { SearchAndAddcontact } from './SearchAndAddContact';

/**
 * Redux container component to host features & functionalities to add new user
 */
class AddNewUserContainer extends Component {
    static navigationOptions = {
        header: null
    };
    constructor() {
        super();
        this.state = {
            searchText: '',
            contactList: '',
            name: '',
            email: '',
            phone: '',
            editMode: false,
            eventId: '',

        }
    }

    componentWillMount() {
        if (this.props.screenProps.eventKey) {
            this.setState({ editMode: this.props.screenProps.editMode, eventId: this.props.screenProps.eventKey });
        }
    }

    /**
     * @description handles back navigation with eventemitter like listener to force reload the screen
     */
    handleBackNavigation() {
        this.props.screenProps.willReload();
        this.props.screenProps.rootNavigation.goBack();
    }

    /**
     * @description Mask the phone input
     * @param {string} number 
     */
    maskPhoneNumber(number) {
        // use RegExp to just match and group part of the phone number which will be formated next
        const x = number.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        number = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        this.setState({ phone: number });
    }

    /**
     * @description Create a new user (if doesn't exist), fetches userid if exists
     * @param {string} submitType 
     */
    onAddUser(submitType) {
        const newUserInfo = {
            name: this.state.name.toLowerCase(),
            email: this.state.email.toLowerCase(),
            phone: this.state.phone
        };

        if (!this.state.name || !(this.state.email || this.state.phone)) {
            Alert.alert("Please fill all the information first");
            return;
        }
        this.props.screenProps.willShowSpinner(true);
        SearchAndAddcontact(newUserInfo, this.state.eventId, this.props.user.socialUID)
            .then(() => {
                if (submitType === 'another') {
                    this.props.screenProps.willShowSpinner(false);
                    this.setState({ name: '', email: '', phone: '' });
                }
                else {
                    this.props.screenProps.willShowSpinner(false);
                    this.props.screenProps.rootNavigation.navigate({
                        routeName: 'AddInvitee',
                        key: 'AddInvitee',
                        params: { 
                            includeInvitees: true, 
                            eventKey: this.state.eventId, 
                            editMode: this.state.editMode 
                        }});
                }
            });
    }

    render() {
        return (
            <Container style={{ backgroundColor: '#ffffff' }}>
                <Content>
                    <View style={{ paddingTop: 10, alignSelf: 'center' }} >
                        <Text style={styles.textStyle}>Enter Contact details below</Text>
                    </View>
                    <View style={{ paddingTop: 25, alignSelf: 'center', paddingLeft: 30, paddingRight: 30 }} >
                        <Text style={{ fontFamily: 'Lato', fontSize: 16, color: '#707070', textAlign: 'center' }}>You must enter either an email address or phone number (to be used)</Text>
                    </View>
                    <View style={{ paddingTop: 10, flexDirection: 'column', paddingLeft: 20, paddingRight: 20 }}>
                        <View style={{ padding: 5 }}>
                            <TextInput
                                placeholder="Name"
                                enablesReturnKeyAutomatically={true}
                                autoCapitalize="words"
                                value={this.state.name}
                                onChangeText={(text) => { this.setState({ name: text }) }}
                                underlineColorAndroid="transparent"
                            />
                            <View style={{ borderBottomColor: '#cecece', borderBottomWidth: 1, paddingTop: 3 }} ></View>
                        </View>
                        <View style={{ padding: 5 }}>
                            <TextInput
                                placeholder="Email"
                                enablesReturnKeyAutomatically={true}
                                value={this.state.email}
                                onChangeText={(text) => { this.setState({ email: text }) }}
                                underlineColorAndroid="transparent"
                            />
                            <View style={{ borderBottomColor: '#cecece', borderBottomWidth: 1, paddingTop: 3 }} ></View>
                        </View>
                        <View style={{ padding: 5 }}>
                            <TextInput
                                keyboardType="phone-pad"
                                placeholder="Phone"
                                enablesReturnKeyAutomatically={true}
                                value={this.state.phone}
                                maxLength={14}
                                onChangeText={(text) => this.maskPhoneNumber(text)}
                                underlineColorAndroid="transparent"
                            />
                            <View style={{ borderBottomColor: '#cecece', borderBottomWidth: 1, paddingTop: 3 }} ></View>
                        </View>
                    </View>
                    <View style={{ paddingTop: 60 }}></View>
                    <TouchableOpacity
                        style={{ paddingTop: 5, alignSelf: 'center' }}
                        onPress={() => this.onAddUser('none')}
                    >
                        {Platform.OS === 'ios'?
                            <Image source={IconsMap.icon_complete} style={{}} />:
                            <Image source={IconsMap.icon_complete_png} />
                        }
                    </TouchableOpacity>
                    <View style={{ paddingTop: 20 }}></View>
                    <TouchableOpacity
                        onPress={() => this.onAddUser('another')}
                        style={{ paddingTop: 5, alignSelf: 'center', }}
                    >
                        {Platform.OS === 'ios'?
                            <Image source={IconsMap.icon_complete_add_another} style={{}} />:
                            <Image source={IconsMap.icon_complete_add_another_png} />
                        }
                    </TouchableOpacity>
                </Content>
                <View style={Platform.OS === 'ios'?styles.bottomHorizontalBar_ios:styles.bottomHorizontalBar_android}></View>
                {Platform.OS === 'ios'?
                <Footer style={styles.bottomView_ios}>
                    <Left>
                        <TouchableOpacity 
                            style={styles.fabLeftWrapperStyles} 
                            onPress={() => this.handleBackNavigation()}
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
                    <Body></Body>
                    <Right></Right>
                </Footer>:
                <View style={styles.bottomView_android}>
                <Left>
                    <TouchableOpacity 
                        style={styles.fabLeftWrapperStyles} 
                        onPress={() => this.handleBackNavigation()}
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
                <Body></Body>
                <Right></Right>
            </View>}
            </Container>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 50,
        backgroundColor: 'rgb(38, 153, 251)',
    },
    banner: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    },
    title: {
        marginTop: 10,
        alignSelf: 'center',
        width: '20%',
    },
    textStyle: {
        fontSize: 16,
        fontFamily: 'Lato',
        paddingBottom: 10,
        color: '#1D6CBC'
    },
    menuBack: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        flexDirection: 'row-reverse',
    },
    sideMenu: {
        width: 30,
        height: 24,
        marginTop: 25,
        marginRight: 5,
    },
    tabBarView: {
        height: 45,
        flexDirection: 'row',
        paddingTop: 5,
    },
    avatarView: {
        flex: 1,
        alignItems: 'center',
    },
    dataView: {
        marginLeft: 20,
        marginRight: 20,
        flex: 2,
        flexDirection: 'column',
    },
    sociallinkView: {
        flex: 2,
        marginLeft: 20,
        marginRight: 20,
    },
    socialContent: {
        flex: 1,
    },
    socialInput: {
        flexDirection: 'row',
        paddingBottom: 2,
    },
    socialLine: {
        backgroundColor: 'gray',
        height: 1,
    },
    socialTextInput: {
        fontSize: 18,
        flex: 1,
        marginLeft: 10,
    },
    nameArea: {
        flex: 1,
    },
    passwordArea: {
        marginTop: 10,
        flexDirection: 'row',
        flex: 1,
    },
    phoneArea: {
        flex: 2,
        marginTop: 10,
    },
    line: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    textInput: {
        alignSelf: 'stretch',
        fontSize: 20,
        overflow: 'visible',
        marginTop: 2,
    },
    addressText: {
        fontSize: 20,
        height: '75%',
    },
    iconArea: {
        padding: 5,
    },
    passwordInput: {
        flex: 1,
    },
    bottomView_ios: {
        height: 50,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        flexDirection: 'row',
        borderTopWidth: 0,
    },
    bottomView_android: {
        height: 70,
        width: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        flexDirection: 'row',
        borderTopWidth: 0,
      },
    bottomBtn: {
        marginRight: 90,
    },
    blocker: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#55555555',
    },
    textSearchList: {
        color: '#276DAF',
        fontSize: 15
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
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
        onShowIndicator: (bShow) => { dispatch(setVisibleIndicator(bShow)) },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddNewUserContainer);