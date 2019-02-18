import { StyleSheet } from 'react-native';
import * as Theme from '../../../theme/hoozin-theme';
import * as Mixins from '../../../theme/mixins';

export const AddOrCreateEventStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textStyle: {
        paddingBottom: 20,
        ...Theme.BRAND_HEADING_TEXT
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
        overflow: 'visible',
        marginTop: 2,
        width: '100%',
        ...Theme.BRAND_BODY_TEXT
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
        height: 70,
        position: 'relative',
        left: -10,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        flexDirection: 'row',
        borderTopWidth: 0,
    },
    bottomBtn: {
        marginRight: 20,
    },
    overlay: {
        ...Mixins.fullScreenAbsoluteContainer,
        backgroundColor: Theme.BRAND_COLOR.OVERLAY
    },
    spinner: {
        ...Mixins.fullWidthCenterAlignedFlexContainer
    },
    fabLeftWrapperStyles: {
        position: 'absolute',
        bottom: -30,
        left: 20
    },
    fabRightWrapperStyles: {
        position: 'absolute',
        bottom: -33,
        right: 20
    },
    fabStyles: {
        width: 60,
        height: 60
    },
    checkbox_ios: {
        position: 'relative', 
        left: -30, 
        borderBottomWidth: 0
    },
    checkbox_android: {
        position: 'relative', 
        left: 0, 
        borderBottomWidth: 0
    }
})