import { StyleSheet } from 'react-native'

export const ActiveMapFooterStyle = StyleSheet.create({
    footer: {
        height: 50,
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    footerLeftmostItemStyle: {
        position: 'absolute',
        bottom: -30,
        left: 20
    },
    footerRightmostItemStyle: {
        position: 'absolute',
        bottom: -30,
        right: 20
    },
    c2aBtn: {
        width: 60,
        height: 60,
        position: 'relative'
    },
});