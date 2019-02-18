import { StyleSheet } from 'react-native'
import * as Theme from '../../../theme/hoozin-theme'
import * as Mixins from '../../../theme/mixins'

export const EditUserProfileStyles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 4,
    },
    socialLine: {
        backgroundColor: '#bcbcbc',
        height: 1,
        paddingTop: 1,
        marginBottom: 4
    },
    socialTextInput: {
        ...Theme.BRAND_BODY_TEXT,
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
        justifyContent: 'space-between'
    },
    line: {
        borderBottomColor: '#bcbcbc',
        borderBottomWidth: 1,
        marginBottom: 8
    },
    textInput: {
        alignSelf: 'stretch',
        ...Theme.BRAND_BODY_TEXT,
        overflow: 'visible',
        marginTop: 2,
        width: '100%'
    },
    phoneMaskArea: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignSelf: 'flex-start'
    },
    phoneMaskInput: {
        width: '90%'
    },
    addressText: {
        fontSize: 20,
        paddingLeft: 0,
        paddingBottom: 4
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
        width: '100%',
        height: 70,
        position: 'relative',
        left: -10,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        flexDirection: 'row',
        borderTopWidth: 0,
    },
    overlay: {
        ...Mixins.fullScreenAbsoluteContainer,
        backgroundColor: Theme.BRAND_COLOR.OVERLAY
    },
    spinner: {
        ...Mixins.fullWidthCenterAlignedFlexContainer
    },
    camContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        flexDirection: 'column',
        backgroundColor: 'black'
    },
    camPreview: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
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
    }
})