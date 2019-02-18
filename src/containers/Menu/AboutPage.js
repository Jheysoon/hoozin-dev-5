import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Content, Footer, Left, Body, Right } from 'native-base';
import { IconsMap } from 'assets/assetMap';
import AppBarComponent from '../../components/AppBar/appbar.index';

class About extends Component {
    static navigationOptions = {
        header: null
    };

    render() {
        return (
            <Container style={{ backgroundColor: '#ffffff' }}>
            <AppBarComponent />
            <View style={styles.tabBarView}>
                    <TouchableOpacity
                        onPress={() => this.onAbout()} >
                        <Image source={images.img_about_infocus} />
                    </TouchableOpacity >
                    <TouchableOpacity
                        onPress={() => this.onProfile()} >
                        <Image source={images.img_btn_profile} />
                    </TouchableOpacity >
                    <TouchableOpacity
                        onPress={() => this.onFriends()} >
                        <Image source={images.img_btn_friends} />
                    </TouchableOpacity >
            </View>
            <Content>
                <View style={{ padding: 15 }}>
                    <Text style={styles.textStyle} >
                        hoozin was designed to…
                </Text>
                    <Text style={styles.textStyle}>
                        Please bear with is as we begin the journey of
                        taking hoozin through the beta stage. Any and all
                        feedback will be reviewed and taken into consideration
                        for product updates.
                </Text>
                    <Text style={styles.textStyle}>
                        As you get started in using hoozin, please keep in
                        mind that one of the requirements is sharing your
                        location with hoozin. Through hoozin, your location
                        will be shared with other event members. This will
                        allow for a better experience overall. please keep
                        in mind that your safety is taken very seriously by
                        us, but please br mindful of your own safety.
                </Text>
                    <Text style={styles.textStyle}>
                        In order to offer a complete event experience, hoozin
                        is reliant on the location services functionality of
                        your mobile device. As a result, the location presented
                        for each event is only as good as the data that is provided
                        to hoozin from a mobile device. Relying on location for
                        event members should be tempered by the expectations of the
                        mobile devices being used. Depending on actual location
                        should be not be considered reliable in the event of an
                        emergency. Please remember that the device not only needs
                        to be able to transmit that location via an internet
                        connection. (i.e. If a mobile device cannot connect to
                        the internet via wifi or cellular the location signal
                        cannot be passed to others.
                </Text>
                </View>
            </Content>
                <Footer style={styles.bottomView}>
                    <Left>
                        <TouchableOpacity 
                            onPress={() => this.props.navigation.navigate({
                                routeName: 'EventList',
                                key: 'EventList',
                            })}
                            style={styles.fabLeftWrapperStyles}
                            >
                            <Image source={IconsMap.icon_list_circle} style={styles.fabStyles} />
                        </TouchableOpacity>
                    </Left>
                    <Body></Body>
                    <Right></Right>
                </Footer>
            </Container>
        );
    }
    onMenuPressed() {
        this.props.navigation.navigate({
            routeName: 'Menu',
            key: 'Menu',
        });
    }
    onAbout() {
        this.props.navigation.navigate({
            routeName: 'About',
            key: 'About',
        });
    }
    onProfile() {
        this.props.navigation.navigate({
            routeName: 'ShowProfile',
            key: 'ShowProfile',
        });
    }
    onFriends() {

    }

}

const images = {
    img_about_infocus: require('assets/icon/btn_About_infocus.png'),
    img_btn_about: require('assets/icon/btn_About.png'),
    img_btn_friends_infocus: require('assets/icon/btn_Friends_infocus.png'),
    img_btn_friends: require('assets/icon/btn_Friends.png'),
    img_btn_profile_infocus: require('assets/icon/btn_Profile_infocus.png'),
    img_btn_profile: require('assets/icon/btn_Profile.png'),
    img_btn_add_profile: require('assets/icon/btn_Add_Profile.png'),
    img_btn_cancel: require('assets/icon/btn_Cancel.png'),
    img_btn_confirm: require('assets/icon/btn_Confirm.png'),
    img_btn_edit: require('assets/icon/btn_Edit.png')
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomView: {
        height: 50,
        backgroundColor: 'transparent',
        borderTopWidth: 0
    },
    bottomBtn: {
        marginRight: 20,
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

    line: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
    },
    textStyle: {
        fontFamily: 'Lato',
        fontSize: 14,
        paddingBottom: 20,
        color: '#004D9B'
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
    }
});

export default About;