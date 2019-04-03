import React, { Component } from 'react'
import { TouchableOpacity, StyleSheet, AsyncStorage } from 'react-native';
import Image from 'react-native-remote-svg';
import { Container, Footer, Left, Body, Right, Icon, Fab } from 'native-base';
import MapView, { Marker } from 'react-native-maps';
import { Popup } from 'react-native-map-link'
import { connect } from 'react-redux';

import AppBarComponent from '../../components/AppBar/appbar.index';
import { IconsMap } from 'assets/assetMap';

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#523735"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#c9b2a6"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#dcd2be"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ae9e90"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#93817c"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a5b076"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#447530"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fdfcf8"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f8c967"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#e9bc62"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e98d58"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#db8555"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#806b63"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8f7d77"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#b9d3c2"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#92998d"
            }
        ]
    }
];
const appWhiteList = ['google-maps', 'apple-maps'];
/* Redux container component to present a detailed view of the created event */
class EventMapContainer extends Component {
    static navigationOptions = {
        header: null
    };
    constructor() {
        super()
        this.state = {
            eventData: {},
            userLocation: {},
            isVisible: false,
            hostId: '',
            defaultOrEventLocation: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            },
        }
    }
    componentWillMount() {
        const { params } = this.props.navigation.state;
        if (!!params && !!params.eventLocation) {
            this.getCachedUserLocation();
            this.setState({ defaultOrEventLocation: { latitude: params.eventLocation.lat, longitude: params.eventLocation.lng, latitudeDelta: this.state.defaultOrEventLocation.latitudeDelta, longitudeDelta: this.state.defaultOrEventLocation.longitudeDelta } });
        }
    }

    /**
     * @description retrieve last cached user location
     */
    getCachedUserLocation() {
        AsyncStorage.getItem('userLocation')
            .then(result => {
                const cachedUserLocation = JSON.parse(result);
                const userRegion = { latitude: Number(cachedUserLocation.latitude), longitude: Number(cachedUserLocation.longitude), latitudeDelta: this.state.defaultOrEventLocation.latitudeDelta, longitudeDelta: this.state.defaultOrEventLocation.longitudeDelta };
                //console.log("[EventMap] cached user location", userRegion);
                this.setState({ userLocation: userRegion });
            });
    }

    /**
     * @description get user's current physical location
     */
    getUserLocation() {
        navigator.geolocation.setRNConfiguration({ skipPermissionRequests: false });
        navigator.geolocation.getCurrentPosition(position => {
            const userRegion = { latitude: position.coords.latitude, longitude: position.coords.longitude, latitudeDelta: this.state.defaultOrEventLocation.latitudeDelta, longitudeDelta: this.state.defaultOrEventLocation.longitudeDelta };
            AsyncStorage.setItem('userLocation', JSON.stringify(userLocation));
            this.setState({ userLocation: userRegion });
        },
            error => {
                console.log(error);
            },
            {
                enableHighAccuracy: true
            }
        );
    }

    /**
     * @description switch to Google Maps app and show event location direction from there
     */
    showDirectionFromApp() {
        this.setState({ isVisible: true });
    }

    render() {
        return (
            <Container style={{ backgroundColor: '#ffffff' }}>
                <AppBarComponent showBackBtn={true} />
                <MapView
                    style={styles.map}
                    initialRegion={this.state.defaultOrEventLocation}
                    region={this.state.defaultOrEventLocation}
                    customMapStyle={mapStyle}
                >
                    <Marker coordinate={{ latitude: this.state.defaultOrEventLocation.latitude, longitude: this.state.defaultOrEventLocation.longitude }}></Marker>
                </MapView>
                <Popup
                    isVisible={this.state.isVisible}
                    onCancelPressed={() => this.setState({ isVisible: false })}
                    onAppPressed={() => this.setState({ isVisible: false })}
                    onBackButtonPressed={() => this.setState({ isVisible: false })}
                    modalProps={{
                        animationIn: 'slideInUp'
                    }}
                    appsWhiteList={appWhiteList}
                    options={{ latitude: this.state.defaultOrEventLocation.latitude, longitude: this.state.defaultOrEventLocation.longitude}}
                />
                {/* <Fab style={{ position: 'absolute', top: -450, right: 5, width: 42, height: 42, borderRadius: 21, backgroundColor: '#ffffff' }} onPress={() => this.getUserLocation()}>
                    <Icon type="MaterialIcons" name="room" color='#cccccc' style={{ color: '#cccccc' }} />
                </Fab> */}
            <Footer style={styles.fabContainer}>
                <Left>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                    >
                        <Image source={IconsMap.icon_chevron_left} style={styles.fabStyles} />
                    </TouchableOpacity>
                </Left>
                <Body>
                    <TouchableOpacity
                        style={styles.fabWrapperStyles}
                        onPress={() => this.showDirectionFromApp()}
                    >
                        <Image source={IconsMap.icon_direction} style={styles.fabStyles} />
                    </TouchableOpacity>
                </Body>
                <Right></Right>
            </Footer>
            </Container >
        )
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    fabContainer: {
        height: 50,
        paddingLeft: 20,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        position: 'absolute',
        bottom: 0,
    },
    fabWrapperStyles: {
        position: 'absolute',
        left: 20
    },
    fabStyles: {
        width: 60,
        height: 60
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

export default connect(mapStateToProps, mapDispatchToProps)(EventMapContainer);