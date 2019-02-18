import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Button,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    ImageBackground
} from 'react-native'
import { strings } from '../locales/i18n';
import { connect } from 'react-redux';
import { forgotPasswordAction, clearRecoveryStatusAction} from '../actions/auth'

class ForgotPasswordPage extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props, context) {
        super(props, context)
        this.state = { email: null}
        this.mount = true
    }

    componentWillReceiveProps(nextProps) {
        if (!this.mount) return

        if (nextProps.recoveryResult !== null) {
            if (nextProps.recoveryResult) {
                Alert.alert(
                    '',
                    'Please check your email for link to reset password.',
                    [{
                        text: 'OK', onPress: () => {
                            const { navigate } = this.props.navigation;
                            navigate('Login')} },], { cancelable: false }
                )
            } else {

            }
            this.props.onClearRecovery()
        }
    }

    componentWillUnmount() {
        this.mount = false;
    }

    render() {   
        let email = this.state.email !== null ? this.state.email : this.props.email     

        return (
        <View style = { styles.container } >
            <View style = { styles.header } >
                <View style = {styles.banner} >
                    <Image source = { images.img_title }
                    resizeMode = 'contain'
                    style = { styles.title }
                    />   
                </View>      

                <TouchableOpacity 
                    onPress = {() => this.onBack()}
                    style = {styles.backBtnContainer}>                                    
                    <Text style = { styles.backButton } > { strings('common.back') } </Text> 
                </TouchableOpacity>
    
            </View > 

            <TextInput multiline = { false }
                style = {
                    [styles.textInput, styles.rowItem, styles.line]
                }
                autoCapitalize = 'none'
                autoCorrect = { false }
                onChangeText = {
                    (text) => this.onEmailChanged(text)
                }
                value = { email }
                placeholder = { strings('login.email') }
                placeholderTextColor = { 'gray' }
            />

            <TouchableOpacity onPress = {() => this.onSend()} >
                <Text style = { styles.sendBtn } > { strings('forgot_page.send') } </Text> 
            </TouchableOpacity > 
        </View >
        );
    }

    onLogoutPressed() {
        const { navigate } = this.props.navigation;
        navigate('Login')     
    }

    onEmailChanged(text) {
        this.setState({
            email: text
        })
    }

    onBack() {
        const { navigate } = this.props.navigation;
        navigate('Login')
    }

    onSend() {
        let email = this.state.email
        if (email && (email !== '')) {
            this.props.onForgotPassword(this.state.email);
        }
        else
        {
            Alert.alert(
                '',
                'Please enter your email address.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') },], { cancelable: false }
            )
        }
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
    textInput: {
        alignSelf: 'stretch',
        textAlignVertical: "center",
        textAlign: "center",
        fontSize: 20,
        marginTop: 50,
        overflow: 'visible'
    },
    sendBtn: {
        color: 'rgb(49, 107, 242)',
        fontSize: 20,
        marginTop: 30,
        textAlign: "center",
    },
    backBtnContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    sideMenu: {
        width: 30,
        height: 24,
        marginTop: 25,
        marginRight: 5,
    },
    backButton: {
        color: 'white',
        fontSize: 18,
        marginTop: 15
    },
});

const images = {
    img_title: require('../../assets/img/hoozin_title.png'),
    img_sidemenu: require('../../assets/icon/sidemenu_white.png'),
}

const mapStateToProps = (state, ownProps) => {
    return {
        recoveryResult: state.auth.recovery,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        onForgotPassword: (email) => { dispatch(forgotPasswordAction(email)) },
        onClearRecovery: () => { dispatch(clearRecoveryStatusAction()) },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordPage);