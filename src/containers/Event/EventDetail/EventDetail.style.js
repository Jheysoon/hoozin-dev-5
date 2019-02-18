import { StyleSheet } from 'react-native';

export const EventDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
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
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bottomView_android: {
        width: '100%',
        height: 70,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
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
        fontSize: 15
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventDetailCard: {
        flexDirection: 'row', 
        paddingBottom: 40
    },
    eventDetail: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: 2,
        paddingRight: 12
    },
    eventInvitee: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: 1,
        paddingBottom: 1,
        paddingLeft: 2,
        paddingRight: 12
    },
    cardAvatarWrapper: {
        flex: 1,
        justifyContent: 'flex-start'
    },
    cardDetail: {
        flex: 3,
        justifyContent: 'flex-start',
        marginLeft: 20
    },
    invitees: {
        marginTop: 20,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    cardAvatar: {
        shadowOffset: { width: 5, height: 5 },
        shadowColor: '#000000',
        shadowOpacity: 0.125,
        shadowRadius: 8
    },
    eventHostName: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Lato',
        color: '#000000'
    },
    eventTitle: {
        fontSize: 16,
        fontFamily: 'Lato',
        fontWeight: 'bold',
        color: '#004D9B',
        marginTop: 5
    },
    eventMetaWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: 20
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
    rsvpStyles: {
        width: 93,
        height: 39
    },
    btnGroups: {
        paddingTop: 6,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#ffffff'
    },
    btnGroupTxt: {
        color: '#004D9B'
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