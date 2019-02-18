import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native'
import Image from 'react-native-remote-svg'
import { Container, Button, Icon, List, ListItem, Item, Spinner } from 'native-base'
import { RNCamera } from 'react-native-camera'

import AppBarComponent from '../../../components/AppBar/appbar.index'
import ActiveMapFooter from '../../../components/ActiveMapFooter/ActiveMapFooter'
import CameraService from '../../../utils/camera.service'

import { EventServiceAPI, UserManagementServiceAPI } from '../../../api'
import { IconsMap } from 'assets/assetMap'

export default class EventGallery extends Component {
    // static navigationOptions = {
    //     header: null,
    //     onTabPress: (tab) => {
    //         alert(tab.index);
    //         if (tab.index == 2) {
    //             Alert.alert("Save","Dont forget to save your weather!");
    //         }
    //     },
    // };
    // static navigationOptions = { 
    //     tabBar: ({ state, navigate }) => ({ label: 'schedule',
            
    //         // icon: () => { 
    //         //     return( <TouchableHighlight onPress={() => { navigate('Schedule') }}> <Image source={require('../assets/tabbar_icons/scheduleActive.png')} /> </TouchableHighlight> ); 
    //         // }, 
    //     }), 
    // }
    static navigationOptions = ({ navigation }) => {
        // const { routeName } = navigation.state.routes[navigation.state.index];
        // alert('routeName-->'+ navigation.state.routes);
        return {
            header: null,
        };
    }
    constructor(props) {
        super(props);
        this.state = {
            eventPhotos: [],
            selectedImgUrl: '',
            animating: false,
            eventImagePinCounter: 0,
            selectedImageIndex: 0,
            isGalleryAtEnd: false,
            isGalleryAtStart: true,
            isCameraActive: false,
            eventPhotosStash: null,
            currentNavStackDepth: 0,
            chats: [],
            chatCounter: 0
        };
    }

    async componentDidMount() {
        console.log('Event Gallery-->'+ JSON.stringify(this.props.screenProps.rootNav.state.key ));
        
        console.log('EventnavigationState-->'+ JSON.stringify(this.props.navigationState ));
        const eventSvc = new EventServiceAPI();
        const { hostId, eventId, isHostUser } = this.props.screenProps.rootNav.state.params;
        const { switchToCamera, navStackDepth, currentUserId } = this.props.screenProps.rootNav.state.params;

        if (switchToCamera) {
            this.setState({ isCameraActive: true, animating: false });
        }
        this.props.navigation.addListener('didFocus', () => {
            this.getAllEventPhotos(hostId, eventId, eventSvc, isHostUser, navStackDepth);
        });
        eventSvc.watchForEventDataByFieldAPI(hostId, eventId, 'photos')
            .on('child_changed', snapshot => {
                this.setState({ animating: true });
                const newPhotosArr = [];
                this.state.eventPhotos.map(photo => {
                    if (photo.id == snapshot._value.id) {
                        photo.pinned = snapshot._value.pinned;
                    }
                    else {
                        newPhotosArr.push(snapshot._value);
                    }
                    return photo;
                });
                const newPhotoArr = [...this.state.eventPhotos, snapshot._value];
                if (!isHostUser && snapshot._value) {
                    return this.setState({ eventPhotos: newPhotoArr.filter(item => item.pinned), animating: false });
                }
            });
    }

    async getAllEventPhotos(hostId, eventId, eventInstance, isHostUser, navStackDepth) {
        const photos = await eventInstance.getEventDetailsByFieldAPI(hostId, eventId, 'photos');
        console.log('photos-->'+ JSON.stringify(photos));

        if (photos && isHostUser) {
            const pinCounter = photos && photos.filter(item => item.pinned).length;
            this.setState({ eventPhotos: photos, animating: false, eventImagePinCounter: pinCounter, currentNavStackDepth: navStackDepth + 1 });
        }
        else if (photos && !isHostUser) {
            const eventOnlyPhotos = photos && photos.filter(item => item.pinned);
            this.setState({ eventPhotos: eventOnlyPhotos, animating: false, eventImagePinCounter: eventOnlyPhotos.length, currentNavStackDepth: navStackDepth + 1 });
        }
    }

    loadImagesStart() {
        this.setState({ animating: true });
    }

    loadImagesComplete() {
        this.setState({ animating: false });
    }

    displaySelectedPicture(imgUrl) {
        this.setState({ selectedImgUrl: imgUrl });
    }

    switchToEventCameraMode() {
        this.setState({ isCameraActive: true });
    }

    /**
    * @description Capture event image
    */
    takeEventPicture() {
        const { hostId, eventId } = this.props.screenProps.rootNav.state.params;
        const camSvc = new CameraService();
        this.setState({ animating: true });

        camSvc.captureEventPicture(this.camera, hostId, eventId)
            .then(uploadResult => {
                console.log("++ upload result data ++", uploadResult);
                this.setState({ animating: false, isCameraActive: false, eventPhotos: uploadResult });
            });
    }

    markAsEventImage(image) {
        // const {isHostUser, eventAndHostData, isPublicView} = this.props.navigation.state.params;
        const {isHostUser, hostId,eventId, isPublicView} = this.props.screenProps.rootNav.state.params;

        let currentIndex = 0;
        this.setState({ animating: true });
        this.state.eventPhotos.forEach((item, index) => {
            if (item.id == image.id) {
                currentIndex = index;
            }
        });

        if (isHostUser) {
            const eventSvc = new EventServiceAPI();

            if (!image.pinned && this.state.eventImagePinCounter < 5) {
                console.log("++ Current pin counter at increement ++", this.state.eventImagePinCounter);
                return eventSvc.updateDataToEventAPI(hostId, eventId, image, 'photos', true, true)
                    .then(result => this.setState({ eventPhotos: result, selectedImgUrl: image.imgUrl, selectedImageIndex: currentIndex, eventImagePinCounter: this.state.eventImagePinCounter + 1, animating: false }));
            }
            else if (image.pinned) {
                console.log("++ Current pin counter at decrement ++", this.state.eventImagePinCounter);
                return eventSvc.updateDataToEventAPI(hostId, eventId, image, 'photos', true, false)
                    .then(result => this.setState({ eventPhotos: result, selectedImgUrl: image.imgUrl, selectedImageIndex: currentIndex, eventImagePinCounter: this.state.eventImagePinCounter == 0 ? 0 : this.state.eventImagePinCounter - 1, animating: false }));
            }
            else if (!image.pinned && this.state.eventImagePinCounter == 5) {
                this.setState({ selectedImgUrl: image.imgUrl, selectedImageIndex: currentIndex, animating: false });
                return this.feedbackToUser();
            }
        }
        this.setState({ selectedImgUrl: image.imgUrl, selectedImageIndex: currentIndex, animating: false });
    }

    feedbackToUser() {
        Alert.alert(
            'Oops!!',
            'You cannot set more than 5 images to an event!',
            [
                { text: 'OK', style: 'default' }
            ]
        );
    }

    goToNextImage() {
        console.log("++ current index ++", this.state.selectedImageIndex);
        const nextIndex = this.state.selectedImageIndex + 1;
        if (this.state.eventPhotos[nextIndex]) {
            this.setState({ selectedImgUrl: this.state.eventPhotos[nextIndex] && this.state.eventPhotos[nextIndex].imgUrl, selectedImageIndex: nextIndex, isGalleryAtStart: false });
        }
        else if (!this.state.eventPhotos[nextIndex]) {
            this.setState({ isGalleryAtEnd: true });
        }
    }

    goToPrevImage() {
        console.log("++ current index ++", this.state.selectedImageIndex);
        const prevIndex = this.state.selectedImageIndex - 1;
        if (this.state.eventPhotos[prevIndex]) {
            this.setState({ selectedImgUrl: this.state.eventPhotos[prevIndex] && this.state.eventPhotos[prevIndex].imgUrl, selectedImageIndex: prevIndex, isGalleryAtEnd: false });
        }
        else if (!this.state.eventPhotos[prevIndex]) {
            this.setState({ isGalleryAtStart: true });
        }
    }

    exitFromCameraView() {
        const { currentScreen } = this.props.navigation.state.params;
        if (currentScreen && currentScreen == 'eventGallery') {
            this.setState({ isCameraActive: false });
        }
        else if (currentScreen && currentScreen != 'eventGallery'){
            this.props.navigation.goBack();
        }
    }

    render() {
        const { params } = this.props.screenProps.rootNav.state;
        return (
            <React.Fragment>
                <Container style={{ backgroundColor: '#ffffff' }}>
                    {!this.state.isCameraActive ?
                        <AppBarComponent showBackBtnCircle={true} skipCacheBurst={true} withNav={this.props.screenProps.rootNav} />:null
                    }
                    <View style={{ height: '84%', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        {this.state.eventPhotos && this.state.eventPhotos.length ?
                            <View style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                                <View style={{ width: '98%', height: '74%', paddingTop: 20, paddingBottom: 20, position: 'relative', left: '1%' }}>
                                    <Image source={{ uri: this.state.selectedImgUrl || this.state.eventPhotos[0].imgUrl }} style={{ flex: 1, borderRadius: 10, zIndex: 999 }} onLoadEnd={() => this.loadImagesComplete()} onLoadStart={() => this.loadImagesStart()} resizeMode="cover" />
                                    <Button icon transparent onPress={() => this.goToPrevImage()} style={{ position: 'absolute', left: 10, top: '50%', zIndex: 9999 }}>
                                        {this.state.isGalleryAtStart ?
                                            <Icon type="FontAwesome" name="chevron-left" style={{ color: 'grey' }} /> :
                                            <Icon type="FontAwesome" name="chevron-left" style={{ color: 'white' }} />
                                        }
                                    </Button>
                                    <Button icon transparent onPress={() => this.goToNextImage()} style={{ position: 'absolute', right: 10, top: '50%', zIndex: 9999 }}>
                                        {this.state.isGalleryAtEnd ?
                                            <Icon type="FontAwesome" name="chevron-right" style={{ color: 'grey' }} /> :
                                            <Icon type="FontAwesome" name="chevron-right" style={{ color: 'white' }} />
                                        }
                                    </Button>
                                </View>
                                <View style={{ width: '100%', height: '26%' }}>
                                {console.log('eventPhoto-->'+ JSON.stringify(this.state.eventPhotos))}
                                    <List dataArray={this.state.eventPhotos} horizontal={true} style={{ marginTop: 10 }}
                                        renderRow={item =>
                                            <ListItem style={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0, paddingBottom: 0, marginLeft: 5, borderBottomWidth: 0, position: 'relative' }}>
                                                <Item style={{ width: 120, height: 120, zIndex: 99 }} onPress={() => this.markAsEventImage(item)}>
                                                    <Image source={{ uri: item.imgUrl }} style={{ width: 120, height: 120, borderRadius: 8 }} onLoadEnd={() => this.loadImagesComplete()} onLoadStart={() => this.loadImagesStart()} />
                                                </Item>
                                                {params.isHostUser && item.pinned ?
                                                    <Icon type="FontAwesome" name="link" color="white" style={{ width: 32, height: 32, color: 'white', position: 'absolute', top: 15, right: 10, zIndex: 999 }} />
                                                    : null
                                                }
                                            </ListItem>
                                        }>
                                    </List>
                                </View>
                            </View> :
                            <Text>No photos yet. Try capturing some!</Text>
                        }
                    </View>
                    {this.state.isCameraActive ?
                        <View style={styles.camContainer}>
                            <RNCamera
                                ref={ref => {
                                    this.camera = ref;
                                }}
                                style={styles.camPreview}
                                type={RNCamera.Constants.Type.back}
                                flashMode={RNCamera.Constants.FlashMode.on}
                                permissionDialogTitle={'Permission to use camera'}
                                permissionDialogMessage={'We need your permission to use your camera phone'}
                            />
                            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 0, left: '18%' }}>
                                <TouchableOpacity
                                    onPress={() => this.exitFromCameraView()}
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
                                    onPress={this.takeEventPicture.bind(this)}
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
                {this.state.animating &&
                    <View style={styles.overlay}>
                        <Spinner
                            color={'lightgoldenrodyellow'}
                            style={styles.spinner} />
                    </View>
                }
            </React.Fragment>
        )
    }
}

const styles = StyleSheet.create({
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
});