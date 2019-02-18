import React, { Component } from 'react'
import {
    View,
    TextInput,
    Alert,
    TouchableOpacity,
    Text,
    Linking,
    Platform
} from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Content, Footer, Left, Right, Body, Textarea, Spinner } from 'native-base';
import Geocoder from 'react-native-geocoder';
import { RNCamera } from 'react-native-camera';
import CheckBox from 'react-native-check-box';
import { connect } from 'react-redux';

import { strings } from '../../../locales/i18n';
import { createUserAction, clearCreateStatusAction, setVisibleIndicatorAction } from '../../../actions/auth';
import CameraService from '../../../utils/camera.service';
import { IconsMap } from 'assets/assetMap';
import AppBarComponent from '../../../components/AppBar/appbar.index';
import { AuthServiceAPI } from '../../../api';

// Stylesheet
import { CreateProfileStyles } from './create-profile.style';

/* Redux container component for creating user profile for the first time */
class UserCreateProfileContainer extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props, context) {
        super(props, context)
        this.state = {
            facebook: null, instagram: null, linkedin: null, twitter: null, snapchat: null, strava: null,
            mapmyfitness: null, name: null, email: null, password: null, confirmPass: null, phone: '', address: null, animating: false, userCountryCode: 'IN',
            isCameraActive: false, userLocation: null, userProfileImg: null, agreementAccepted: false, tosUrl: "https://hoozin.app/termcondition", privacyUrl: "https://hoozin.app/privacypolicy", cookiesUrl: "https://hoozin.app/useofcookies"
        }
        this.mount = true
    }

    componentWillMount() {
        const { params } = this.props.navigation.state;
        if (!!params && !!params.shouldClearAutofill) {
            console.log(params.shouldClearAutofill);
            this.setState({ name: '', email: '' });
        }
        this.getUserLocation();
    }

    getUserLocation() {
        navigator.geolocation.setRNConfiguration({ skipPermissionRequests: false });
        navigator.geolocation.getCurrentPosition(position => {
            console.log("== current position ==", position);
            Geocoder.geocodePosition({ lat: position.coords.latitude, lng: position.coords.longitude })
                .then(result => {
                    if (result) {
                        console.log("== geocode result ==", result[0]);
                        this.setState({ userCountryCode: result[0].countryCode, userLocation: { latitude: position.coords.latitude, longitude: position.coords.longitude } });
                    }
                })
        },
            error => {
                console.log("+location retrieval error+", error);
            },
            {
                enableHighAccuracy: true
            }
        );
    }

    componentWillReceiveProps(nextProps) {
        if (!this.mount) return

        let { indicatorShow } = nextProps

        if (indicatorShow != this.state.animating) {
            this.setState({
                animating: indicatorShow,
            })
        }

        if (nextProps.result !== null) {
            const { result, exitStatus } = nextProps;
            this.showIndicator(false)

            if (result) {
                const { replace } = this.props.navigation;
                replace('NearbyEvents');
            }
            else if (!result && exitStatus == 1) {
                Alert.alert(
                    '',
                    'The password must be at least 6 characters long',
                    [{ text: 'OK', onPress: () => console.log('OK Pressed') },], { cancelable: false }
                );
            }
            else if (!result && (!exitStatus || exitStatus == 2)) {
                Alert.alert(
                    '',
                    'The email address is already in use by another account!',
                    [{ text: 'OK', onPress: () => console.log('OK Pressed') },], { cancelable: false }
                );
            }

            this.props.onClearCreate()
        }
    }

    componentWillUnmount() {
        this.mount = false;
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
     * @description update local state properties
     * @param {string} state 
     * @param {string} text 
     */
    updateState(state, text) {
        const obj = {};
        obj[state] = text;
        this.setState(obj);
    }

    /**
     * @description Tab bar on profile page - About page
     */
    onAbout() {
        this.props.navigation.navigate({
            routeName: 'About',
            key: 'About', 
        });
    }

    /**
     * @description Tab bar on profile page - Profile page
     */
    onProfile() {
        this.props.navigation.navigate({
            routeName: 'ShowProfile',
            key: 'ShowProfile', 
        });
    }

    /**
     * @description Tab bar on profile page - Friends page
     */
    onFriends() {

    }

    /**
     * @description switch camera view
     */
    onAddProfileImage() {
        this.setState({ isCameraActive: true });
    }

    /**
     * @description Capture user profile image
     */
    takeUserProfilePicture() {
        const camSvc = new CameraService();
        this.setState({ animating: true });

        camSvc.captureUserProfilePicture(this.camera, this.props.user.socialUID)
            .then(uploadResult => this.setState({ userProfileImg: uploadResult.downloadURL, isCameraActive: false }));
    }

    loadImages() {
        this.setState({ animating: false });
    }

    /**
     * @description dismiss user creation and delete user profile from Firebase Auth
     */
    onCancel() {
        Alert.alert(
            'Cancel profile creation',
            'This will clear all the information from this app you have shared with us so far',
            [{
                text: 'Yes, Proceed', onPress: () => {
                    console.log("[Create Profile] user to be deleted", this.props.user);
                    const { navigate } = this.props.navigation;
                    if (!!this.props.navigation.state.params && !!this.props.navigation.state.params.shouldClearAutofill) {
                        navigate('Login');
                        return;
                    }
                    else {
                        const authSvc = new AuthServiceAPI();
                        authSvc.removeUser()
                            .then(() => {
                                navigate('Login')
                            });
                    }
                }
            }, {
                text: 'Cancel', onPress: () => { }, style: 'cancel'
            }], { cancelable: false }
        )
    }

    /**
     * @description create user profile
     */
    onConfirm() {
        let name = this.state.name !== null ? this.state.name : this.props.name ? this.props.name : this.props.user.name
        let email = this.state.email !== null ? this.state.email : this.props.email ? this.props.email : this.props.user.email
        let password = this.state.password
        let confirmPass = this.state.confirmPass
        let phone = this.state.phone
        let address = this.state.address || ""
        // Milstone #1 or Milestone #2 - issue related to password field check bypass due to accountType being null, initially
        let accountType = this.props.user && this.props.user.accountType ? this.props.user.accountType : 'custom'
        let socialUID = this.props.user ? this.props.user.socialUID : null
        let countryCode = this.state.userCountryCode || 'US'
        let profileImgUrl = this.state.userProfileImg || this.props.user.profileImageUrl || ''
        let userLocation = this.state.userLocation

        if ((!name || !email || !phone) || (accountType == 'custom' && (!password || !confirmPass)) && this.state.agreementAccepted) {
            Alert.alert(
                'Required information missing',
                'Name, Email/Password, Phone are required',
                [{ text: 'OK, got it', onPress: () => console.log('OK Pressed') },], { cancelable: false }
            )
        }
        else if (!this.state.agreementAccepted) {
            Alert.alert(
                'Terms not accepted',
                'You must accept the agreement',
                [{ text: 'OK, got it', onPress: () => console.log('OK Pressed') },], { cancelable: false }
            )
        }
        else if (accountType == 'custom' && password !== confirmPass) {
            Alert.alert(
                'Password doesn\'t match',
                'Both password must match. Please enter again',
                [{ text: 'OK, got it', onPress: () => console.log('OK Pressed') },], { cancelable: false }
            )
        }
        else {
            this.showIndicator(true)
            this.props.onCreate(name, email, this.state.password, phone, address, this.state.facebook, this.state.instagram,
                this.state.linkedin, this.state.twitter, this.state.snapchat, this.state.strava, this.state.mapmyfitness, accountType, socialUID, countryCode, profileImgUrl, userLocation);
        }
    }

    /**
     * @description show / hide spinner
     * @param {boolean} bShow 
     */
    showIndicator(bShow) {
        this.props.onShowIndicator(bShow)
    }

    onAcceptAgreement() {
        this.setState({ agreementAccepted: !this.state.agreementAccepted });
        console.log("++ agreement ++", this.state.agreementAccepted);
    }

    // Milestone #2 or Milestone #3 - issue related to clicking T&C links and app crashes
    openLinks(url) {
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + url);
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => console.error('An error occurred', err));
    }

    render() {
        let facebook = this.state.facebook !== null ? this.state.facebook : this.props.facebook
        let instagram = this.state.instagram !== null ? this.state.instagram : this.props.instagram
        let linkedin = this.state.linkedin !== null ? this.state.linkedin : this.props.linkedin
        let twitter = this.state.twitter !== null ? this.state.twitter : this.props.twitter
        let snapchat = this.state.snapchat !== null ? this.state.snapchat : this.props.snapchat
        let strava = this.state.strava !== null ? this.state.strava : this.props.strava
        let mapmyfitness = this.state.mapmyfitness !== null ? this.state.mapmyfitness : this.props.mapmyfitness
        let name = this.state.name !== null ? this.state.name : this.props.name ? this.props.name : this.props.user.name
        let email = this.state.email !== null ? this.state.email : this.props.email ? this.props.email : this.props.user.email
        let password = this.state.password !== null ? this.state.password : this.props.password
        let confirmPass = this.state.confirmPass !== null ? this.state.confirmPass : this.props.confirmPass
        let phone = this.state.phone !== '' ? this.state.phone : this.props.phone
        let address = this.state.address !== null ? this.state.address : this.props.address
        let animating = this.state.animating
        let countryCode = this.state.userCountryCode
        let profileImgUrl = this.state.userProfileImg || this.props.user.profileImageUrl || ''

        return (
            <React.Fragment>
                <Container style={{ backgroundColor: '#ffffff' }}>
                    <AppBarComponent isMenuHidden={true} />
                    <View style={CreateProfileStyles.tabBarView}>
                        <TouchableOpacity
                            onPress={() => this.onAbout()} >
                            <Image source={images.img_btn_about} />
                        </TouchableOpacity >
                        <TouchableOpacity
                            onPress={() => this.onProfile()} >
                            <Image source={images.img_btn_profile_infocus} />
                        </TouchableOpacity >
                        <TouchableOpacity
                            onPress={() => this.onFriends()} >
                            <Image source={images.img_btn_friends} />
                        </TouchableOpacity >
                    </View>
                    {!this.state.isCameraActive ?
                        <Content>
                            <View style={CreateProfileStyles.avatarView}>
                                <TouchableOpacity
                                    onPress={() => this.onAddProfileImage()} >
                                    {this.props.user.profileImageUrl || this.state.userProfileImg ?
                                        <Image source={{ uri: this.state.userProfileImg || this.props.user.profileImageUrl }} style={{ width: 117, height: 117, borderRadius: 117 / 2 }} onLoadEnd={() => this.loadImages()} /> :
                                        <Image source={IconsMap.icon_user_avatar} />
                                    }
                                </TouchableOpacity >
                            </View>
                            <View style={CreateProfileStyles.dataView}>
                                <View style={CreateProfileStyles.nameArea}>
                                    <TextInput multiline={false}
                                        style={
                                            [CreateProfileStyles.textInput, CreateProfileStyles.line]
                                        }
                                        autoCapitalize='words'
                                        autoCorrect={false}
                                        onChangeText={
                                            (text) => this.updateState('name', text)
                                        }
                                        value={name}
                                        placeholder={strings('profile_page.name')}
                                        placeholderTextColor={'#8E8E93'}
                                        underlineColorAndroid='transparent'
                                    />
                                    <TextInput multiline={false}
                                        style={
                                            [CreateProfileStyles.textInput, CreateProfileStyles.line]
                                        }
                                        autoCapitalize='none'
                                        autoCorrect={false}
                                        onChangeText={
                                            (text) => this.updateState('email', text)
                                        }
                                        value={email}
                                        placeholder={strings('login.email')}
                                        placeholderTextColor={'#8E8E93'}
                                        underlineColorAndroid='transparent'
                                    />
                                </View>
                                {
                                    !!this.props.navigation.state.params && !!this.props.navigation.state.params.shouldClearAutofill ?

                                        <View style={CreateProfileStyles.passwordArea}>
                                            <View style={CreateProfileStyles.iconArea} >
                                                <Image source={IconsMap.icon_password}
                                                    resizeMode='contain' />
                                            </View>
                                            <View style={CreateProfileStyles.passwordInput} >
                                                <TextInput multiline={false}
                                                    style={
                                                        [CreateProfileStyles.textInput, CreateProfileStyles.line]
                                                    }
                                                    ellipsizeMode='clip'
                                                    secureTextEntry={true}
                                                    onChangeText={
                                                        (text) => this.updateState('password', text)
                                                    }
                                                    value={password}
                                                    placeholder={strings('login.password')}
                                                    placeholderTextColor={'#8E8E93'}
                                                    underlineColorAndroid='transparent'
                                                />
                                                <TextInput multiline={false}
                                                    style={
                                                        [CreateProfileStyles.textInput, CreateProfileStyles.line]
                                                    }
                                                    ellipsizeMode='clip'
                                                    secureTextEntry={true}
                                                    onChangeText={
                                                        (text) => this.updateState('confirmPass', text)
                                                    }
                                                    value={confirmPass}
                                                    placeholder={strings('profile_page.confirm_password')}
                                                    placeholderTextColor={'#8E8E93'}
                                                    underlineColorAndroid='transparent'
                                                />
                                            </View>
                                        </View> : null
                                }

                                <View style={CreateProfileStyles.phoneArea}>
                                    <View style={CreateProfileStyles.phoneMaskArea}>
                                        <TextInput multiline={false}
                                            style={
                                                [CreateProfileStyles.textInput, CreateProfileStyles.line]
                                            }
                                            autoCapitalize='none'
                                            keyboardType="phone-pad"
                                            maxLength={14}
                                            autoCorrect={false}
                                            onChangeText={
                                                (text) => this.maskPhoneNumber(text)
                                            }
                                            value={phone}
                                            placeholder={strings('profile_page.phone')}
                                            placeholderTextColor={'#8E8E93'}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <Textarea
                                        rowSpan={4}
                                        style={
                                            [CreateProfileStyles.addressText, CreateProfileStyles.line]
                                        }
                                        autoCapitalize='words'
                                        autoCorrect={false}
                                        onChangeText={
                                            (text) => this.updateState('address', text)
                                        }
                                        value={address}
                                        placeholder={strings('profile_page.address')}
                                        placeholderTextColor={'#8E8E93'}
                                        underlineColorAndroid='transparent'
                                    />
                                </View>
                            </View>
                            <View style={CreateProfileStyles.sociallinkView}>
                                <View style={CreateProfileStyles.socialContent} >
                                    <View style={CreateProfileStyles.socialInput}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_fb_26x26} />:
                                            <Image source={IconsMap.icon_fb} />
                                        }

                                        <TextInput multiline={false}
                                            style={CreateProfileStyles.socialTextInput}
                                            autoCapitalize='none'
                                            autoCorrect={false}

                                            onChangeText={
                                                (text) => this.updateState('facebook', text)
                                            }
                                            value={facebook}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <View style={CreateProfileStyles.socialLine}>
                                    </View>
                                </View>

                                <View style={CreateProfileStyles.socialContent} >
                                    <View style={CreateProfileStyles.socialInput}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_instagram} />:
                                            <Image source={IconsMap.icon_instagram_png} />
                                        }

                                        <TextInput multiline={false}
                                            style={CreateProfileStyles.socialTextInput}
                                            autoCapitalize='none'
                                            autoCorrect={false}

                                            onChangeText={
                                                (text) => this.updateState('instagram', text)
                                            }
                                            value={instagram}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <View style={CreateProfileStyles.socialLine}>
                                    </View>
                                </View>

                                <View style={CreateProfileStyles.socialContent} >
                                    <View style={CreateProfileStyles.socialInput}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_linkedin} />:
                                            <Image source={IconsMap.icon_linkedin_png} />
                                        }

                                        <TextInput multiline={false}
                                            style={CreateProfileStyles.socialTextInput}
                                            autoCapitalize='none'
                                            autoCorrect={false}

                                            onChangeText={
                                                (text) => this.updateState('linkedin', text)
                                            }
                                            value={linkedin}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <View style={CreateProfileStyles.socialLine}>
                                    </View>
                                </View>

                                <View style={CreateProfileStyles.socialContent} >
                                    <View style={CreateProfileStyles.socialInput}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_twitter} />:
                                            <Image source={IconsMap.icon_twitter_png} />
                                        }

                                        <TextInput multiline={false}
                                            style={CreateProfileStyles.socialTextInput}
                                            autoCapitalize='none'
                                            autoCorrect={false}

                                            onChangeText={
                                                (text) => this.updateState('twitter', text)
                                            }
                                            value={twitter}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <View style={CreateProfileStyles.socialLine}>
                                    </View>
                                </View>

                                <View style={CreateProfileStyles.socialContent} >
                                    <View style={CreateProfileStyles.socialInput}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_snapchat} />:
                                            <Image source={IconsMap.icon_snapchat_png} />
                                        }

                                        <TextInput multiline={false}
                                            style={CreateProfileStyles.socialTextInput}
                                            autoCapitalize='none'
                                            autoCorrect={false}

                                            onChangeText={
                                                (text) => this.updateState('snapchat', text)
                                            }
                                            value={snapchat}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <View style={CreateProfileStyles.socialLine}>
                                    </View>
                                </View>

                                <View style={CreateProfileStyles.socialContent} >
                                    <View style={CreateProfileStyles.socialInput}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_strava} />:
                                            <Image source={IconsMap.icon_strava_png} />
                                        }

                                        <TextInput multiline={false}
                                            style={CreateProfileStyles.socialTextInput}
                                            autoCapitalize='none'
                                            autoCorrect={false}

                                            onChangeText={
                                                (text) => this.updateState('strava', text)
                                            }
                                            value={strava}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <View style={CreateProfileStyles.socialLine}>
                                    </View>
                                </View>

                                <View style={CreateProfileStyles.socialContent} >
                                    <View style={CreateProfileStyles.socialInput}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_ua} />:
                                            <Image source={IconsMap.icon_ua_png} />
                                        }

                                        <TextInput multiline={false}
                                            style={CreateProfileStyles.socialTextInput}
                                            autoCapitalize='none'
                                            autoCorrect={false}

                                            onChangeText={
                                                (text) => this.updateState('mapmyfitness', text)
                                            }
                                            value={mapmyfitness}
                                            underlineColorAndroid='transparent'
                                        />
                                    </View>
                                    <View style={CreateProfileStyles.socialLine}>
                                    </View>
                                </View>
                                <View style={{ paddingTop: 40, width: '100%' }}>
                                    <CheckBox
                                        style={{ paddingRight: 10, width: '100%' }}
                                        onClick={() => this.onAcceptAgreement()}
                                        isChecked={this.state.agreementAccepted}
                                        rightText="I have read and agreed to the following"
                                        rightTextStyle={{ color: '#666666' }}
                                    />
                                    <TouchableOpacity onPress={() => this.openLinks(this.state.tosUrl)}><Text style={CreateProfileStyles.agreementTxt}>{'\u2022'} &nbsp; Terms of Service</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.openLinks(this.state.privacyUrl)}><Text style={CreateProfileStyles.agreementTxt}>{'\u2022'} &nbsp; Privacy Policy</Text></TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.openLinks(this.state.cookiesUrl)}><Text style={CreateProfileStyles.agreementTxt}>{'\u2022'} &nbsp; Use of Cookies</Text></TouchableOpacity>
                                </View>
                            </View>
                        </Content> : null}
                    {Platform.OS === 'ios' ?    
                    <Footer style={CreateProfileStyles.bottomView_ios}>
                        <Left>
                            <TouchableOpacity
                                onPress={() => this.onCancel()}
                                style={CreateProfileStyles.fabLeftWrapperStyles}
                            >
                                {Platform.OS === 'ios' ?
                                    <Image source={IconsMap.icon_close_gray} style={CreateProfileStyles.fabStyles} /> :
                                    <Image source={{
                                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
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
                                  ` }} style={CreateProfileStyles.fabStyles} />
                                }
                            </TouchableOpacity>
                        </Left>
                        <Body>
                            <TouchableOpacity
                                style={{ position: 'absolute', left: 30 }}
                                onPress={() => this.onConfirm()}
                            >
                                {Platform.OS === 'ios' ?
                                    <Image source={IconsMap.icon_success} style={CreateProfileStyles.fabStyles} /> :
                                    <Image source={{
                                        uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
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
              ` }} style={CreateProfileStyles.fabStyles} />
                                }
                            </TouchableOpacity>
                        </Body>
                        <Right></Right>
                    </Footer>:
                    <View style={CreateProfileStyles.bottomView_android}>
                    <Left>
                        <TouchableOpacity
                            onPress={() => this.onCancel()}
                            style={CreateProfileStyles.fabLeftWrapperStyles}
                        >
                            {Platform.OS === 'ios' ?
                                <Image source={IconsMap.icon_close_gray} style={CreateProfileStyles.fabStyles} /> :
                                <Image source={{
                                    uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
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
                          ` }} style={CreateProfileStyles.fabStyles} />
                            }
                        </TouchableOpacity>
                    </Left>
                    <Body style={{ position: 'relative', top: -25 }}>
                        <TouchableOpacity
                            style={{ position: 'absolute', left: 30 }}
                            onPress={() => this.onConfirm()}
                        >
                            {Platform.OS === 'ios' ?
                                <Image source={IconsMap.icon_success} style={CreateProfileStyles.fabStyles} /> :
                                <Image source={{
                                    uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
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
      ` }} style={CreateProfileStyles.fabStyles} />
                            }
                        </TouchableOpacity>
                    </Body>
                    <Right></Right>
                </View>}
                    {this.state.isCameraActive ?
                        <View style={CreateProfileStyles.camContainer}>
                            <RNCamera
                                ref={ref => {
                                    this.camera = ref;
                                }}
                                style={CreateProfileStyles.preview}
                                type={RNCamera.Constants.Type.front}
                                flashMode={RNCamera.Constants.FlashMode.on}
                                permissionDialogTitle={'Permission to use camera'}
                                permissionDialogMessage={'We need your permission to use your camera phone'}
                            />
                            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 0, left: '18%' }}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ isCameraActive: false })}
                                    style={{ marginRight: 30 }}
                                >
                                    {Platform.OS === 'ios'?
                                        <Image source={IconsMap.icon_chevron_left} />:
                                        <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #2699fb;
                                            }
                                      
                                            .cls-2 {
                                              fill: none;
                                              stroke: #fff;
                                              stroke-width: 4px;
                                            }
                                      
                                            .cls-3 {
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
                                        <g id="Symbol_95_3" data-name="Symbol 95 – 3" transform="translate(-26 -619)">
                                          <g class="cls-3" transform="matrix(1, 0, 0, 1, 26, 619)">
                                            <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                          </g>
                                          <g id="Group_328" data-name="Group 328" transform="translate(355.5 1254) rotate(180)">
                                            <line id="Line_3" data-name="Line 3" class="cls-2" x1="14" y2="16" transform="translate(306.5 624) rotate(180)"/>
                                            <line id="Line_4" data-name="Line 4" class="cls-2" x1="14" y1="13" transform="translate(306.5 611) rotate(180)"/>
                                          </g>
                                        </g>
                                      </svg>
                                      ` }} />
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={this.takeUserProfilePicture.bind(this)}
                                >
                                    {Platform.OS === 'ios'?
                                        <Image source={IconsMap.icon_camera} />:
                                        <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #2699fb;
                                            }
                                      
                                            .cls-2, .cls-3, .cls-4, .cls-5 {
                                              fill: #fff;
                                            }
                                      
                                            .cls-3 {
                                              stroke: #bcbcbc;
                                            }
                                      
                                            .cls-4 {
                                              stroke: #707070;
                                            }
                                      
                                            .cls-5 {
                                              stroke: #fff;
                                            }
                                      
                                            .cls-6 {
                                              stroke: none;
                                            }
                                      
                                            .cls-7 {
                                              fill: none;
                                            }
                                      
                                            .cls-8 {
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
                                        <g id="btn_Camera" transform="translate(-1331 -432)">
                                          <g class="cls-8" transform="matrix(1, 0, 0, 1, 1331, 432)">
                                            <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                                          </g>
                                          <g id="Group_435" data-name="Group 435" transform="translate(1337 285)">
                                            <rect id="Rectangle_57" data-name="Rectangle 57" class="cls-2" width="31" height="21" rx="7" transform="translate(9 162)"/>
                                            <g id="Rectangle_58" data-name="Rectangle 58" class="cls-3" transform="translate(17 165)">
                                              <rect class="cls-6" width="16" height="16" rx="8"/>
                                              <rect class="cls-7" x="0.5" y="0.5" width="15" height="15" rx="7.5"/>
                                            </g>
                                            <path id="Rectangle_59" data-name="Rectangle 59" class="cls-2" d="M5,0H9a5,5,0,0,1,5,5V8a0,0,0,0,1,0,0H0A0,0,0,0,1,0,8V5A5,5,0,0,1,5,0Z" transform="translate(18 156)"/>
                                            <g id="Ellipse_21" data-name="Ellipse 21" class="cls-4" transform="translate(14 165)">
                                              <circle class="cls-6" cx="1" cy="1" r="1"/>
                                              <circle class="cls-7" cx="1" cy="1" r="0.5"/>
                                            </g>
                                            <g id="Ellipse_22" data-name="Ellipse 22" class="cls-5" transform="translate(14 161)">
                                              <circle class="cls-6" cx="1" cy="1" r="1"/>
                                              <circle class="cls-7" cx="1" cy="1" r="0.5"/>
                                            </g>
                                          </g>
                                        </g>
                                      </svg>
                                      ` }} />
                                    }
                                </TouchableOpacity>
                            </View>
                        </View> : null}
                </Container>
                {animating &&
                    <View style={CreateProfileStyles.overlay}>
                        <Spinner color={'lightgoldenrodyellow'} style={CreateProfileStyles.spinner} />
                    </View>
                }
            </React.Fragment>
        );
    }
}

const images = {
    img_about_infocus: require('assets/icon/btn_About_infocus.png'),
    img_btn_about: require('assets/icon/btn_About.png'),
    img_btn_friends_infocus: require('assets/icon/btn_Friends_infocus.png'),
    img_btn_friends: require('assets/icon/btn_Friends.png'),
    img_btn_profile_infocus: require('assets/icon/btn_Profile_infocus.png'),
    img_btn_profile: require('assets/icon/btn_Profile.png')
}

const mapStateToProps = (state, ownProps) => {
    return {
        result: state.auth.profileStatus,
        exitStatus: state.auth.exitStatus,
        user: state.auth.user,
        indicatorShow: state.auth.indicatorShow,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        onCreate: (name, email, password, phone, address, facebook, instagram,
            linkedin, twitter, snapchat, strava, mapmyfitness, accountType, socialUID, countryCode, profileImgUrl, userLocation) => {
            dispatch(createUserAction(name, email, password, phone, address, facebook, instagram,
                linkedin, twitter, snapchat, strava, mapmyfitness, accountType, socialUID, countryCode, profileImgUrl, userLocation))
        },
        onClearCreate: () => { dispatch(clearCreateStatusAction()) },
        onShowIndicator: (bShow) => { dispatch(setVisibleIndicatorAction(bShow)) },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCreateProfileContainer);