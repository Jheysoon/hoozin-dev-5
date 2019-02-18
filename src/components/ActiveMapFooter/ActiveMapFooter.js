import React, { Component } from 'react'
import { TouchableOpacity, Alert, StyleSheet, Text, View, Platform } from 'react-native'
import { Footer, Left, Body, Right } from 'native-base'
import Image from 'react-native-remote-svg'
import { NavigationActions } from 'react-navigation';

import { ActiveMapFooterStyle } from './ActiveMapFooterStyle'
import { IconsMap } from 'assets/assetMap'

export default class ActiveMapFooter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isCameraActive: false,
            animated: true
        }
    }

    feedbackToUser() {
        Alert.alert(
            'Ooops!',
            'Only a Host user can capture event picture!',
            [
                { text: 'OK', style: 'cancel' }
            ]
        );
    }

    repositionMapToEventLocation() {
        this.props.mapcallback();
        //const { hostId, eventId, isHostUser } = this.props.eventAndHostData;
        // if (this.props.currentScreen != 'activeMap' && this.props.navStackDepth == 2) {
        //     this.props.resetMsgCounterCallbackTo();
        //     return this.props.navInstance.goBack();
        // }
        // else if (this.props.currentScreen != 'activeMap' && this.props.navStackDepth > 2) {
        //     this.props.navInstance.replace('EventActiveMap', { eventId: this.props.eventAndHostData.eventId, hostId: this.props.eventAndHostData.hostId, isHostUser: this.props.eventAndHostData.isHostUser, navStackDepth: this.props.navStackDepth, resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this) });
        // }
        // //this.props.navInstance.replace('EventActiveMap', { eventId: this.props.eventAndHostData.eventId, hostId: this.props.eventAndHostData.hostId, isHostUser: this.props.eventAndHostData.isHostUser });
      
        this.props.navInstance.dispatch(NavigationActions.reset({
          index: 0, key: null, actions: [NavigationActions.navigate(
            'EventActiveMap', 
            { eventId: this.props.eventAndHostData.eventId, 
              hostId: this.props.eventAndHostData.hostId, 
              isHostUser: this.props.eventAndHostData.isHostUser, 
              navStackDepth: this.props.navStackDepth, 
              resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this)
            })]
        }));
    }

    toggleActiveAttendeeView() {
        const { hostId, eventId } = this.props.eventAndHostData;
        this.props.currentScreen != 'activeAttendee' 
          ? 
            this.props.navInstance.dispatch(NavigationActions.reset({
              index: 0, key: null, actions: [NavigationActions.navigate({
                routeName: 'EventActiveAttendees',
                key: 'EventActiveAttendees',
                params: { 
                  hostId, 
                  eventId, 
                  eventAndHostData: this.props.eventAndHostData, 
                  callbackFn: this.props.callbackTo.bind(this), 
                  mapCallbackFn: this.props.mapcallback.bind(this), 
                  eventPhotos: this.props.eventPhotos, 
                  navStackDepth: this.props.navStackDepth, 
                  inviteeLocationcallback: this.props.inviteeLocationcallback 
                    ? this.props.inviteeLocationcallback.bind(this) 
                    : null, 
                  activeMapScreenKey: this.props.activeMapScreenKey, 
                  resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this) 
                }})]
            }))
            // this.props.navInstance.navigate({
            //   routeName: 'EventActiveAttendees',
            //   key: 'EventActiveAttendees',
            //   params: { 
            //     hostId, 
            //     eventId, 
            //     eventAndHostData: this.props.eventAndHostData, 
            //     callbackFn: this.props.callbackTo.bind(this), 
            //     mapCallbackFn: this.props.mapcallback.bind(this), 
            //     eventPhotos: this.props.eventPhotos, 
            //     navStackDepth: this.props.navStackDepth, 
            //     inviteeLocationcallback: this.props.inviteeLocationcallback 
            //       ? this.props.inviteeLocationcallback.bind(this) 
            //       : null, 
            //     activeMapScreenKey: this.props.activeMapScreenKey, 
            //     resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this) 
            // }}) 
          : null;
    }

    togglePublicGalleryView() {
        this.props.currentScreen != 'eventGallery'
          ? 
            // this.props.navInstance.dispatch(NavigationActions.reset({
            //   index: 0, key: null, actions: [NavigationActions.navigate({
            //     routeName: 'EventActiveGallery',
            //     key: 'EventActiveGallery',
            //     params: { isPublicView: true, 
            //       isHostUser: this.props.isHostUser, 
            //       eventAndHostData: this.props.eventAndHostData, 
            //       eventPhotos: this.props.eventPhotos && this.props.eventPhotos.filter(item => item.pinned), 
            //       callbackFn: this.props.callbackTo.bind(this), 
            //       mapCallbackFn: this.props.mapcallback.bind(this), 
            //       currentScreen: this.props.currentScreen, 
            //       navStackDepth: this.props.navStackDepth, 
            //       activeMapScreenKey: this.props.activeMapScreenKey, 
            //       currentUserId: this.props.currentUserId, 
            //       resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this)
            //     }})]
            // }))
            this.props.navInstance.navigate({
              routeName: 'EventActiveGallery', 
              key: 'EventActiveGallery',
              params: { isPublicView: true, 
                isHostUser: this.props.isHostUser, 
                eventAndHostData: this.props.eventAndHostData, 
                eventPhotos: this.props.eventPhotos && this.props.eventPhotos.filter(item => item.pinned), 
                callbackFn: this.props.callbackTo.bind(this), 
                mapCallbackFn: this.props.mapcallback.bind(this), 
                currentScreen: this.props.currentScreen, 
                navStackDepth: this.props.navStackDepth, 
                activeMapScreenKey: this.props.activeMapScreenKey, 
                currentUserId: this.props.currentUserId, 
                resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this)
            }})
          : null;
    }

    captureEventPhoto() {
        if (!this.props.isHostUser) {
            return this.feedbackToUser();
        }
        //this.props.callbackTo();
        if (this.props.currentScreen != 'eventGallery' && this.props.isHostUser) {
            return
              // this.props.navInstance.dispatch(NavigationActions.reset({
              //   index: 0, key: null, actions: [NavigationActions.navigate({
              //     routeName: 'EventActiveGallery',
              //     key: 'EventActiveGallery',
              //     params: { 
              //       isHostUser: this.props.isHostUser, 
              //       eventAndHostData: this.props.eventAndHostData, 
              //       eventPhotos: this.props.eventPhotos, 
              //       callbackFn: this.props.callbackTo.bind(this), 
              //       mapCallbackFn: this.props.mapcallback.bind(this), 
              //       switchToCamera: true, 
              //       currentScreen: this.props.currentScreen, 
              //       navStackDepth: this.props.navStackDepth, 
              //       currentUserId: this.props.currentUserId, 
              //       resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this)
              //     }})]
              // })) 
              this.props.navInstance.navigate({
                routeName: 'EventActiveGallery', 
                key: 'EventActiveGallery',
                params: { 
                  isHostUser: this.props.isHostUser, 
                  eventAndHostData: this.props.eventAndHostData, 
                  eventPhotos: this.props.eventPhotos, 
                  callbackFn: this.props.callbackTo.bind(this), 
                  mapCallbackFn: this.props.mapcallback.bind(this), 
                  switchToCamera: true, 
                  currentScreen: this.props.currentScreen, 
                  navStackDepth: this.props.navStackDepth, 
                  currentUserId: this.props.currentUserId, 
                  resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this) 
              }})
        }
        else if (this.props.currentScreen == 'eventGallery' && this.props.isHostUser) {
            return this.props.navInstance.replace('EventActiveGallery', { 
                isHostUser: this.props.isHostUser,
                eventAndHostData: this.props.eventAndHostData,
                eventPhotos: this.props.eventPhotos,
                callbackFn: this.props.callbackTo.bind(this),
                mapCallbackFn: this.props.mapcallback.bind(this),
                switchToCamera: true,
                currentScreen: this.props.currentScreen,
                navStackDepth: this.props.navStackDepth,
                currentUserId: this.props.currentUserId,
                resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this)
             })
        }

    }

    toggleChatView() {
        this.props.currentScreen != 'activeChat'
          ? 
            // this.props.navInstance.dispatch(NavigationActions.reset({
            //   index: 0, key: null, actions: [NavigationActions.navigate({
            //     routeName: 'EventActiveChat',
            //     key: 'EventActiveChat',
            //     params: {
            //       hostId: this.props.eventAndHostData.hostId, 
            //       eventId: this.props.eventAndHostData.eventId, 
            //       isHostUser: this.props.isHostUser, 
            //       eventAndHostData: this.props.eventAndHostData, 
            //       eventPhotos: this.props.eventPhotos, 
            //       callbackFn: this.props.callbackTo.bind(this), 
            //       mapCallbackFn: this.props.mapcallback.bind(this), 
            //       navStackDepth: this.props.navStackDepth, 
            //       activeMapScreenKey: this.props.activeMapScreenKey, 
            //       resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this)
            //     }})]
            // })) 
            this.props.navInstance.navigate({
              routeName: 'EventActiveChat', 
              key: 'EventActiveChat',
              params: {
                hostId: this.props.eventAndHostData.hostId, 
                eventId: this.props.eventAndHostData.eventId, 
                isHostUser: this.props.isHostUser, 
                eventAndHostData: this.props.eventAndHostData, 
                eventPhotos: this.props.eventPhotos, 
                callbackFn: this.props.callbackTo.bind(this), 
                mapCallbackFn: this.props.mapcallback.bind(this), 
                navStackDepth: this.props.navStackDepth, 
                activeMapScreenKey: this.props.activeMapScreenKey, 
                resetMsgCounterCallbackTo: this.props.resetMsgCounterCallbackTo.bind(this) 
            }}) 
          : null;
    }

    render() {
        return (
            <Footer style={ActiveMapFooterStyle.footer}>
                <Left>
                    <TouchableOpacity
                        style={ActiveMapFooterStyle.footerLeftmostItemStyle}
                        onPress={() => this.repositionMapToEventLocation()}
                    >
                        {Platform.OS === 'ios'?
                            <Image source={IconsMap.icon_active_map} style={ActiveMapFooterStyle.c2aBtn} />:
                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2 {
                                  fill: none;
                                }
                          
                                .cls-3 {
                                  fill: #fff;
                                  fill-rule: evenodd;
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
                            <g id="btn_EventActive_Map" transform="translate(-121 -554)">
                              <g class="cls-4" transform="matrix(1, 0, 0, 1, 121, 554)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                              </g>
                              <g id="Places" transform="translate(-2227 -11810)">
                                <rect id="Rectangle_305" data-name="Rectangle 305" class="cls-2" width="24.784" height="24.784" transform="translate(2366 12376)"/>
                                <path id="Path_114" data-name="Path 114" class="cls-3" d="M10.21,14.743a4.33,4.33,0,0,0,4.337-4.337A4.463,4.463,0,0,0,10.21,5.914a4.33,4.33,0,0,0-4.337,4.337A4.572,4.572,0,0,0,10.21,14.743ZM2.929,2.971A10.3,10.3,0,1,1,17.49,17.531l-7.28,7.28-7.28-7.28A10.577,10.577,0,0,1,2.929,2.971Z" transform="translate(2367.524 12376.05)"/>
                              </g>
                            </g>
                          </svg>
                          ` }} style={ActiveMapFooterStyle.c2aBtn} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.toggleActiveAttendeeView()}
                        style={{ position: 'absolute', left: 90, bottom: -30 }}
                    >
                        {Platform.OS === 'ios'?
                            <Image source={IconsMap.icon_active_attendee} style={ActiveMapFooterStyle.c2aBtn} />:
                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2 {
                                  fill: #7fc4fd;
                                }
                          
                                .cls-3 {
                                  fill: #bce0fd;
                                }
                          
                                .cls-4 {
                                  fill: #fff;
                                }
                          
                                .cls-5 {
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
                            <g id="btn_EventActive_Attendees" transform="translate(-33 -557)">
                              <g class="cls-5" transform="matrix(1, 0, 0, 1, 33, 557)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                              </g>
                              <g id="Group_1303" data-name="Group 1303" transform="translate(0)">
                                <g id="Group_1027" data-name="Group 1027" transform="translate(59 571)">
                                  <path id="Rectangle_31" data-name="Rectangle 31" class="cls-2" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                                  <circle id="Ellipse_14" data-name="Ellipse 14" class="cls-2" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                                </g>
                                <g id="Group_1029" data-name="Group 1029" transform="translate(52 571)">
                                  <path id="Rectangle_31-2" data-name="Rectangle 31" class="cls-3" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                                  <circle id="Ellipse_14-2" data-name="Ellipse 14" class="cls-3" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                                </g>
                                <g id="Group_1030" data-name="Group 1030" transform="translate(45 571)">
                                  <path id="Rectangle_31-3" data-name="Rectangle 31" class="cls-4" d="M8.173,0h5.222a8.173,8.173,0,0,1,8.173,8.173v0a2.043,2.043,0,0,1-2.043,2.043H2.043A2.043,2.043,0,0,1,0,8.173v0A8.173,8.173,0,0,1,8.173,0Z" transform="translate(0 10.784)"/>
                                  <circle id="Ellipse_14-3" data-name="Ellipse 14" class="cls-4" cx="5.676" cy="5.676" r="5.676" transform="translate(5.108)"/>
                                </g>
                              </g>
                            </g>
                          </svg>
                          ` }} style={ActiveMapFooterStyle.c2aBtn} />
                        }
                    </TouchableOpacity>
                </Left>
                <Body>
                    <TouchableOpacity
                        style={{ position: 'absolute', bottom: -30, left: 32 }}
                        onPress={() => this.captureEventPhoto()}
                    >
                        {Platform.OS === 'ios'?
                            <Image source={IconsMap.icon_camera} style={ActiveMapFooterStyle.c2aBtn} />:
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
                          ` }} style={ActiveMapFooterStyle.c2aBtn} />
                        }
                    </TouchableOpacity>
                </Body>
                <Right>
                    <TouchableOpacity
                        style={{ position: 'absolute', right: 90, bottom: -30 }}
                        onPress={() => this.togglePublicGalleryView()}
                    >
                        {Platform.OS === 'ios'?
                            <Image source={IconsMap.icon_photo} style={ActiveMapFooterStyle.c2aBtn} />:
                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60">
                            <defs>
                              <style>
                                .cls-1 {
                                  fill: #2699fb;
                                }
                          
                                .cls-2 {
                                  fill: #fff;
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
                            <g id="btn_EventActive_Photo" transform="translate(-93 -564)">
                              <g class="cls-3" transform="matrix(1, 0, 0, 1, 93, 564)">
                                <rect id="Search_Field-2" data-name="Search Field" class="cls-1" width="42" height="42" rx="21" transform="translate(9 3)"/>
                              </g>
                              <path id="Path_148" data-name="Path 148" class="cls-2" d="M23.765,0a1.621,1.621,0,0,1,1.061.424A1.512,1.512,0,0,1,25.462,1.7V17.611a1.621,1.621,0,0,1-.424,1.061,2.275,2.275,0,0,1-1.273.424H1.7a2.275,2.275,0,0,1-1.273-.424A2.275,2.275,0,0,1,0,17.4V1.7A1.621,1.621,0,0,1,.424.637,1.512,1.512,0,0,1,1.7,0ZM7.214,3.819a2.409,2.409,0,0,0-1.7-.637,2.409,2.409,0,0,0-1.7.637,2.409,2.409,0,0,0-.637,1.7,2.409,2.409,0,0,0,.637,1.7,2.409,2.409,0,0,0,1.7.637,2.409,2.409,0,0,0,1.7-.637,2.409,2.409,0,0,0,.637-1.7A2.409,2.409,0,0,0,7.214,3.819ZM22.28,15.914,15.914,6.366l-5.729,7.427L6.366,11.034l-3.183,4.88Z" transform="translate(110 578)"/>
                            </g>
                          </svg>
                          ` }} style={ActiveMapFooterStyle.c2aBtn} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={ActiveMapFooterStyle.footerRightmostItemStyle}
                        onPress={() => this.toggleChatView()}
                    >
                        {Platform.OS === 'ios'?
                            <Image source={IconsMap.icon_chat_fab} style={ActiveMapFooterStyle.c2aBtn} />:
                            <Image source={{ uri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60 60"><defs><style>.a{fill:#2699fb;}.b{fill:#fff;}.c{filter:url(#a);}</style><filter id="a" x="0" y="0" width="60" height="60" filterUnits="userSpaceOnUse"><feOffset dy="6" input="SourceAlpha"/><feGaussianBlur stdDeviation="3" result="b"/><feFlood flood-opacity="0.161"/><feComposite operator="in" in2="b"/><feComposite in="SourceGraphic"/></filter></defs><g transform="translate(-288 -619)"><g class="c" transform="matrix(1, 0, 0, 1, 288, 619)"><rect class="a" width="42" height="42" rx="21" transform="translate(9 3)"/></g><g transform="translate(-1499.09 217)"><rect class="b" width="27.628" height="21.781" rx="10.891" transform="translate(1803.928 415)"/><path class="b" d="M1740.351,700.226c-2.8,2.119-4.708,6.067-4.17,6.749.7,1.037,9.281-2.658,9.281-2.658Z" transform="translate(67 -269.395)"/></g></g></svg>` }} style={ActiveMapFooterStyle.c2aBtn} />
                        }
                        {parseInt(this.props.chatCounter) < 10?
                            <Text style={styles.chatNumberCounterSingleDigit}>{this.props.chatCounter || 0}</Text>:
                            <Text style={styles.chatNumberCounterDoubleDigit}>{this.props.chatCounter || 0}</Text>
                        }
                    </TouchableOpacity>
                </Right>
            </Footer>
        )
    }
}

const styles = StyleSheet.create({
    chatNumberWrapper: {
        backgroundColor: '#2699FB',
        width: 40,
        height: 40,
        borderRadius: 20,
        bottom: 15,
        right: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    counterWrapperMultiple: {
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 0,
        paddingBottom: 0,
        width: 25,
        height: 25,
        borderRadius: 25 / 2,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    counterWrapperSingle: {
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 0,
        paddingBottom: 0,
        width: 25,
        height: 25,
        borderRadius: 25 / 2,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    chatNumberCounterSingleDigit: {
        fontFamily: 'Lato',
        fontWeight: '800',
        fontSize: 16,
        color: 'red',
        position: 'absolute',
        zIndex: 99999999,
        left: 26,
        top: 14
    },
    chatNumberCounterDoubleDigit: {
        fontFamily: 'Lato',
        fontWeight: '800',
        fontSize: 16,
        color: 'red',
        position: 'absolute',
        zIndex: 99999999,
        left: 20,
        top: 14
    }
});