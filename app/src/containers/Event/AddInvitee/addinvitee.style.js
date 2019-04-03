import { StyleSheet } from 'react-native';
import * as Theme from '../../../theme/hoozin-theme';
import * as Mixins from '../../../theme/mixins';

export const AddInviteeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textStyle: {
        fontSize: 16,
        paddingBottom: 10,
        color: '#276DAF'
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
        borderTopWidth: 0
    },
    bottomView_android: {
        width: '100%',
        height: 90,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
        borderTopWidth: 0,
    },
    bottomBtn: {
        marginRight: 20,
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
        fontSize: 12
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabLeftWrapperStyles: {
        position: 'absolute',
        bottom: -32,
        left: 20
    },
    fabRightWrapperStyles: {
        position: 'absolute',
        bottom: -34,
        right: 20
    },
    fabStyles: {
        width: 60,
        height: 60
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)'
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})