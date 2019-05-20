import React, { Component } from 'react'
import { TouchableOpacity, StyleSheet, View, Text, AsyncStorage, Platform } from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Footer, Left, Body, Right, Icon, Item, Button, Spinner } from 'native-base';
import { connect } from 'react-redux';

import AppBarComponent from '../../components/AppBar/appbar.index';
import { EventServiceAPI, AuthServiceAPI, UserManagementServiceAPI } from '../../api';
import { IconsMap } from 'assets/assetMap';

import ActiveMapFooter from '../../components/ActiveMapFooter/ActiveMapFooter';

/* Redux container component to present a detailed view of the created event */
class EventActiveUserContainer extends Component {
    static navigationOptions = {
        header: null
    };
    constructor() {
        super()
        this.state = {
            userData: {},
            hostUserProfileImgUrl: '',
            hostId: '',
            isHostUser: false,
            userFavouriteCount: 0,
            eventAndHostData: null,
            animating: true,
            chats: [],
            chatCounter: 0
        }
    }
    // componentWillMount() {
    //     const { params } = this.props.navigation.state;
    //     if (!!params && !!params.hostId) {
    //         this.getHostUserDetails(params);
    //         clearInterval(params.hostUserLocationWatcher);
    //         clearInterval(params.attendeeLocationWatcher);
    //     }
    // }

    componentDidMount() {
        if (this.props.navigation.state.params) {
            this.getHostUserDetails(this.props.navigation.state.params.withUser);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.navigation.state.params && prevProps.navigation.state.params.withUser != this.props.navigation.state.params.withUser) {
            console.log("++ requested user id ++", this.props.navigation.state.params.withUser);
            this.getHostUserDetails(this.props.navigation.state.params.withUser);
        }
    }

    getHostUserDetails(userId) {
        const eventSvc = new EventServiceAPI();
        console.log("++ incoming host id ++", userId);
        
        eventSvc.getUserDetailsAPI2(userId)
            .then(userData => {
                this.setState({ 
                    userData, 
                    userFavouriteCount: userData.favouriteList ? userData.favouriteList.length : 0, 
                    hostUserProfileImgUrl: userData.profileImgUrl || '', 
                    animating: false 
                });

                //this.resetUnreadMsgCount();
                //this.getUnreadChatMsgCount(hostId, eventId, isHostUser);
                //this.watchForIncomingChats(hostId, eventAndHostData.eventId, isHostUser);
            });
    }

    showEventAttendees() {
        const { hostId, eventId, eventHostId, eventAndHostData, mapCallback, callbackTo, eventPhotos } = this.props.navigation.state.params;
        this.props.navigation.navigate({
            routeName: 'EventActiveAttendees',
            key: 'EventActiveAttendees',
            params: { 
                hostId: eventHostId, 
                eventId: eventId, 
                eventAndHostData: eventAndHostData, 
                mapCallback: mapCallback.bind(this), 
                callbackTo: callbackTo.bind(this), 
                eventPhotos: eventPhotos 
            }});
    }

    loadImagesStart() {
        this.setState({ animating: true });
    }
    
    loadImagesComplete() {
        this.setState({ animating: false });
    }

    /**
     * @description mark a user favourite
     */
    async markUserFavourite() {
        const userSvc = new UserManagementServiceAPI();
        const eventSvc = new EventServiceAPI();

        const hostUserData = await eventSvc.getUserDetailsAPI2(this.props.navigation.state.params.hostId);
        const tempArr = [];

        if (hostUserData.favouriteList) {
            hostUserData.favouriteList.map(item => {
                if (item.userId != this.props.user.socialUID) {
                    tempArr.push({ userId: this.props.user.socialUID });
                }
            });
            hostUserData.favouriteList = hostUserData.favouriteList.concat(tempArr);
            return userSvc.updateUserDetailsAPI(this.props.navigation.state.params.hostId, { favouriteList: hostUserData.favouriteList })
                .then(() => {
                    this.setState({ userFavouriteCount: hostUserData.favouriteList.length });
                });
        }
        const newFavouriteUser = [{ userId: this.props.user.socialUID }];
        return userSvc.updateUserDetailsAPI(this.props.navigation.state.params.hostId, { favouriteList: newFavouriteUser })
            .then(() => {
                this.setState({ userFavouriteCount: newFavouriteUser.length });
            });
    }

    render() {
        return (
            <React.Fragment>
                <Container style={{ backgroundColor: '#ffffff' }}>
                    <AppBarComponent showBackBtnCircle={true} skipCacheBurst={true} />
                    <View style={{ width: '100%', padding: 4, backgroundColor: '#ffffff', zIndex: 99999, marginBottom: 14 }}>
                        <Item style={{ justifyContent: 'flex-start', borderBottomWidth: 0 }}>
                            <Left style={{ flex: 0.9, position: 'relative', left: 0, top: 0 }}>
                                {this.state.hostUserProfileImgUrl ?
                                    <Image source={{ uri: this.state.hostUserProfileImgUrl }} style={{ width: 140, height: 140, borderRadius: 140 / 2 }} onLoadEnd={() => this.loadImagesComplete()} onLoadStart={() => this.loadImagesStart()} /> :
                                    <Image source={IconsMap.icon_contact_avatar} style={{ width: 140, height: 140, borderRadius: 140 / 2 }} />
                                }
                            </Left>
                            <Body style={{ flex: 1, alignItems: 'flex-start', alignSelf: 'flex-start' }}>
                                <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 24, fontWeight: '400', color: '#000000', marginTop: 6, marginBottom: 6 }}>{this.state.userData.name}</Text>
                                <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 14, fontWeight: '300', color: '#000000', marginBottom: 6 }}>{this.state.userData.email}</Text>
                                <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 14, fontWeight: '300', color: '#000000', marginBottom: 6 }}>{this.state.userData.phone}</Text>
                                <Text style={{ textAlign: 'left', fontFamily: 'Lato', fontSize: 14, fontWeight: '300', color: '#000000', marginBottom: 6 }}>{this.state.userData.address}</Text>
                                <TouchableOpacity style={{ marginTop: 5, flex: 1, flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start' }} onPress={() => this.markUserFavourite()}>
                                {Platform.OS === 'ios'?
                                        <Image source={IconsMap.icon_heart} />:
                                        <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 14.119">
                                        <defs>
                                          <style>
                                            .cls-1 {
                                              fill: #7fc4fd;
                                              fill-rule: evenodd;
                                            }
                                          </style>
                                        </defs>
                                        <path id="Heart" class="cls-1" d="M14.746,1.3a4.3,4.3,0,0,0-6.119,0l-.6.6-.6-.6A4.327,4.327,0,0,0,1.3,7.423l6.721,6.721,6.721-6.721a4.3,4.3,0,0,0,0-6.119" transform="translate(-0.025 -0.025)"/>
                                      </svg>
                                      ` }} />
                                    }
                                    <Text style={{ marginLeft: 5 }}>{this.state.userFavouriteCount}</Text>
                                </TouchableOpacity>
                            </Body>
                        </Item>
                        <Item style={{ borderBottomWidth: 0 }}>
                            <Left style={{ flex: 1, justifyContent: 'flex-start', flexWrap: 'nowrap', display: 'flex', flexDirection: 'row', marginLeft: 10 }}>
                                {this.state.userData.facebook ?
                                    <TouchableOpacity style={{ marginRight: 10 }}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_fb_26x26} style={{ width: 26, height: 26 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
                                            <image id="facebookLogo" width="26" height="26" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAk1BMVEU7WZj///9DYJxAXptJZZ83VZb3+PspTJGYpccxUZNIYp2/yd3d4uxjeavY3ek9XJtQbKUmSY/r7vXK0uOgrsyqttGLm7/S2ed6jbceRI0yUpfb4Od0h7BmfKxbdKjz9fe5w9KElrXH0Nl9kLSvutO6xNlfeaauuszO1t2Oobvo6/Nacqhxhq5lfahwhrWJmsCZqcDpXmosAAAEu0lEQVR4nO3dW3+aMBjH8aAEiKeheMSprYfOanV7/69u2Nb1Yg4eiYE82f93sd2ske8nQEShE95n819vse9K8el1foWJ9z+D9VuaSuFOMg1PT6sv4eFVOuV7L5XP86tw/j2te3OMlJ72H0JXgRfi/CIMXl0FZsTNKhOupXOH4FfpUyZ8c3cKs3PqMhBzl4FChGvxy21h+ixODh+FWfJF+HVvg+F80ah7EwzXhJB9EPIPQv5ByD8I+Qch/yDkH4T8g5B/EFqQvFbuxy0WShX2+2GYfvqUUmmY1b+U/a2IZEuFMoPI+Dwe7ZJJr/NerzeZJEl7tx0No5/TczduiTT7R4VD2SiU/ZnsDpOBl1sQDA6TXauQaJ9QqfhnEuTrvopV0XiWCaVqTHdkXjaRzIRSHscJncdOKFUcTe7yebz2UiWm9MOP4xyG/rbg5Mlc2O/27p5ATkI5m5bxeWyOQzmLSgKZzKFMh+V8XOZQimHJGWQzh9Gq9BSyEMpNiVXiTwyEstvRADKYQ9loawA5CMNIB8hAqOLSp9GPrBfOtPZRBnMYdvWA9s9hePf1ILM5DM+6U2i7UN33kcWt7Baqhc67GQ5zGI40lwrbhbLV0wVaLgyn2jup5cehGukDrZ5D2dJdDC/ZLFQLncsmFsLxHZf2weBw+X7t73yLhXJL5vXaw80ibjW//V3x69QmpF/6TqKlCEOl5K2KX6g2oTrSTjSr0TFUOo/11CeknWgGY1F4pOVXn5C03geR9sOR9QnHlDelO6H93Fl9ZxrKJ/mdheYuKuoUUt6ztR/wAG996yFhOVyNQ/3XqUsom7ti4WGpv5PaLew1H/B8a23CFkGYPGAKaxQS3rTtHnAYWi0MRs4Lh84LIwgpQWgqCCGkB6GpIISQHoSmghBCehCaCkII6UFoKgiZCNW/C78VfyIcRLOcEd6rWdjo5rQovi8xGB3zRsjG6NYrVMtOXoR7TQa5A2S1CbuxSaH2Lc6FJTPXhVvnhVHfdeHZ+eOwS1guWAuDuN67vswLD03CZrAWJpTNYC3c1fyuzbxw6Lxw7Lxw6rowWFBuKOIsPBxdF05814VtyoLPWrglbQZn4ZB05yJn4dh1YUBaDjkLB7Tb3BkLe0vX99KEcv3LWrhruC6kLYechbTlkLEwIF0dchYOaMshY+Hh7LpwQlsOGQsT0tUhZ2Gb+FCUSeHx5hP01wjfkB5yfrwTETfD6Pf4N56f//McvU+6UyFvBBuEN5+g//wN64TH8YOonzOCFcKcHLnbJCcIIaQHoakghJAehKaCEEJ6EJoKQgjpQWgqCCGkB6GpIISQHoSmghBCehCaCkII6UFoKgghpAehqSCEkB6EpoIQQnoQmgpCCOlBaCoIIaQHoakghJAehKaCEEJ6EJoKQgjpQWgqCCGkB6GpIISQ3v8g9B8wyv1VJ2yJlwf8v8n3V5lQLsVrqj9MiReuSphuxN5tYbgW3qmO3bQqoYxXwntyWZj+8IS32tSwn1YkTN9WmdCbn6onViNMl3vvIvT21RMrEabLtfch9OYbVfHBWIFQpt/33lXorZ6W/bRKpGmhVP34x8evExPX8fbPL36jsppx2wuKimTZ4f2X53XwCfsNE8N+WABDbt8AAAAASUVORK5CYII="/>
                                          </svg>
                                          ` }} style={{ width: 26, height: 26 }} />
                                        }
                                    </TouchableOpacity> : null}
                                {this.state.userData.instagram ?
                                    <TouchableOpacity style={{ marginRight: 10 }}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_instagram} style={{ width: 26, height: 26 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
                                            <defs>
                                              <style>
                                                .cls-1 {
                                                  fill: url(#pattern);
                                                }
                                              </style>
                                              <pattern id="pattern" preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 225 225">
                                                <image width="225" height="225" xlink:href="data:image/jpeg;base64,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"/>
                                              </pattern>
                                            </defs>
                                            <rect id="instaLogo" class="cls-1" width="26" height="26" rx="7"/>
                                          </svg>
                                          ` }} style={{ width: 26, height: 26 }} />
                                        }
                                    </TouchableOpacity> : null}
                                {this.state.userData.linkedin ?
                                    <TouchableOpacity style={{ marginRight: 10 }}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_linkedin} style={{ width: 26, height: 26 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
                                            <image id="linkedinLogo" width="26" height="26" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAhFBMVEUAe7X///8AcbDi6/MAd7N9rM4Ac7G70eStyN/I2ukAebQAdbIAcLDY6fLM4e5QmsXn8ve10+U5j7/0+vx2qc2Cs9Ntq88Af7idw9uly+EgiLxvpMpTnsg4k8JEk8Lq8/i92uqev9qNu9jR4+6uy+CZvNh4sNGvyuCIstJinceTuNUxir3eoYF2AAAEwklEQVR4nO2dbXfiKhRGARk6gjEvjho1tzq215lO////u1FrrTZQOwsP9dxnf+kHk7WyCxxIOICQB7K6mU8FC+ZNnb16iZe/ZaWcTv1k0dBOVeWJYZErm/qpImNVXhwNh4JP8R3RYngwHA64FeAeOxjuDQvBU7BVFMXOMOdYRffofGtYqtTPcUVU2RpWfIuwraeVFBnnImwLMRO1S/0QV8XVouFcSdtY04h56me4MnPBZLANAAAAAAAAAAAAAAAAAID/NVYbpQbKOKZpANboRT3sFVm5rgYM5yCtmc5e86pkb2K4laN1a3lCdm9SP1NU7D7b6IQNp3wAa7N3glKO+Sha974EtyzYZASYdaegHM25hJtpt6CUJZNoY2Y+Q8mjEK0deQ1rFoWon7yCsmARTl3tN5Qs0o/UKmCYc2iIqqu3P/CDQ5eoegHDbxwMzUPAkMWwxvm7QykrDu3Qjf2CI83B0FZ+wxWLHj8UTCccmmFoUFPwKMJAIbKIpFu0pyUyaYVb3KRLMOMQRw+YTYfglJOhMPnyTLDktgDOTU+GNsWCTxt8xYh1tn/bH62aAZcoeopT03zx46nSiqffDq21tcwaIADgK2CUn9Og6gJXns0aW9sGLWdecNsARqh0ivnV9zJ8eqvo/viv7P8+KlrrjHjOJ+P68a795a6crSf5szWp9um4/FubuQtc+eswCGpNmvVDcT5VMCr66/s0+QGRDL/vDbWqHv3zIEU9TZAgENPQmqp7svVI+Uw+4o1pqENzIAdq6o1XIhrqjwpwT1HRNsdohtaEZkBOmJDW1GiGpgz8fMaaUjGW4aC5XFDKMaFiNMOL6+iOhq4txjLMPyVImQURybD+RCvc8UCW5BnL0D+S8bChqqeRDC/rCt8yonrdiGT4F1Bl66QzpJp/TWcoNzQD1ISGGU01TWgo70kKMaUhTaxJaZiRdIkpDeUzRTRNakiS7JHUsKSopkkNSfqLpIaSYliT1vAfgoaY1nBM0BCjGy5Xs/pnPVsVl1w8I2iIcQ2z8Xy7RtM5YwbTzccvjSuC1QAxDZcL8zZ0OJV/9HmqGNyU4fuN0rX+6PPNTdXSzo3SB4/hmwi2W41muOxMhLMffEclyCSPZjjpDvyhLOuW5nYMe74WZUKLcijWrMQyXPv6bh2c0CDo8mMZ+r/ST88zOy/6x3w5w5G/YwuuyiHYYD3WN29/xxZYpNoO227GMLBm+Hw3g0vv+2KGjwHDb4H7CBYExM4Yeo8OGl5/6B03Y+jThkP2hg83U0v/1pDgwJHEhj0YwhCGMIQhDGEIQxjCEIYwhCEMYQhDGMIQhjCEIQxhCEMYwhCGMIQhDGEIQxjCEIYwhCEMYQhDGMIQhjBMYhhYb5Ha0PR7XpaLt8u13Hf/lb1//avs7GLpv69PsEw2tI/w6Xq00D7CoWWENnAfw/37AQAAAAAAAAAAAAAAAAAAAAAAgCPz1A9wZeaiYXz0u9juSiwItq1NiasFwVaLKVGZoNjlPB26kkKWnAvRlK2hzPnGGp3LrWEhuNZTK4qdYfcxDAywg+2hJ1vDjqM0OKDF7lSXnaEscsWtGLXJ92fziJfM1LJSjk9Baqeqw3ku4jX7NqsbLmPUeVMfTzr5D3pkWtnuvn/IAAAAAElFTkSuQmCC"/>
                                          </svg>
                                          ` }} style={{ width: 26, height: 26 }} />
                                        }
                                    </TouchableOpacity> : null}
                                {this.state.userData.twitter ?
                                    <TouchableOpacity style={{ marginRight: 10 }}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_twitter} style={{ width: 26, height: 26 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
                                            <defs>
                                              <style>
                                                .cls-1 {
                                                  fill: url(#pattern);
                                                }
                                              </style>
                                              <pattern id="pattern" preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 225 225">
                                                <image width="225" height="225" xlink:href="data:image/png;base64,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"/>
                                              </pattern>
                                            </defs>
                                            <rect id="twitterLogo" class="cls-1" width="26" height="26" rx="13"/>
                                          </svg>
                                          ` }} style={{ width: 26, height: 26 }} />
                                        }
                                    </TouchableOpacity> : null}
                                {this.state.userData.snapchat ?
                                    <TouchableOpacity style={{ marginRight: 10 }}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_snapchat} style={{ width: 26, height: 26 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
                                            <defs>
                                              <style>
                                                .cls-1 {
                                                  fill: url(#pattern);
                                                }
                                              </style>
                                              <pattern id="pattern" preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 225 225">
                                                <image width="225" height="225" xlink:href="data:image/png;base64,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"/>
                                              </pattern>
                                            </defs>
                                            <rect id="snapchatLogo" class="cls-1" width="26" height="26" rx="13"/>
                                          </svg>
                                          ` }} style={{ width: 26, height: 26 }} />
                                        }
                                    </TouchableOpacity> : null}
                                {this.state.userData.strava ?
                                    <TouchableOpacity style={{ marginRight: 10 }}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_strava} style={{ width: 26, height: 26 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
                                            <defs>
                                              <style>
                                                .cls-1 {
                                                  fill: url(#pattern);
                                                }
                                              </style>
                                              <pattern id="pattern" preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 225 225">
                                                <image width="225" height="225" xlink:href="data:image/jpeg;base64,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"/>
                                              </pattern>
                                            </defs>
                                            <rect id="StravaLogo" class="cls-1" width="26" height="26" rx="13"/>
                                          </svg>
                                          ` }} style={{ width: 26, height: 26 }} />
                                        }
                                    </TouchableOpacity> : null}
                                {this.state.userData.mapmyfitness ?
                                    <TouchableOpacity style={{ marginRight: 10 }}>
                                        {Platform.OS === 'ios'?
                                            <Image source={IconsMap.icon_ua} style={{ width: 26, height: 26 }} />:
                                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26">
                                            <image id="mapmyfitnessLogo" width="26" height="26" xlink:href="data:image/jpeg;base64,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"/>
                                          </svg>
                                          ` }} style={{ width: 26, height: 26 }} />
                                        }
                                    </TouchableOpacity> : null}
                            </Left>
                        </Item>
                    </View>
                    <View style={{ width: '90%', height: 1, backgroundColor: '#BCE0FD', zIndex: 9999, position: 'relative', left: 14 }}></View>
                    {this.state.animating &&
                        <View style={styles.overlay}>
                            <Spinner
                                color={'lightgoldenrodyellow'}
                                style={styles.spinner} />
                        </View>
                    }
                </Container>
            </React.Fragment>
        )
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    fabContainer: {
        height: 50,
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        justifyContent: 'center',
        flexDirection: 'row',
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
        onShowIndicator: (bShow) => { dispatch(setVisibleIndicator(bShow)) }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EventActiveUserContainer);