import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
  Platform
} from "react-native";
import Image from "react-native-remote-svg";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import InviteeMarker from "./InviteeMarker";
import { IconsMap } from "../../../../assets/assetMap";
import { mapStyle } from "../../../components/NearbyEvents/config";

class ActiveMap extends Component {
  state = {
    userDraggedRegion: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    }
  };

  constructor(props) {
    super(props);

    this.handleMapDragEvents = this.handleMapDragEvents.bind(this);
  }

  handleMapDragEvents() {
    this.setState({
      userDraggedRegion: null
    });
  }

  componentDidMount() {
    const { lng, lat } = this.props;

    this.setState({
      userDraggedRegion: {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    });
  }

  render() {
    const { lng, lat, singleUserOnly, event } = this.props;

    return (
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
        region={this.state.userDraggedRegion}
        onRegionChangeComplete={() => this.handleMapDragEvents()}
        customMapStyle={mapStyle}
        loadingEnabled={true}
      >
        {!singleUserOnly && (
          <Marker
            coordinate={{
              latitude: lat,
              longitude: lng
            }}
          >
            {Platform.OS === "ios" ? (
              <Image
                source={IconsMap.icon_event_location}
                style={{ width: 30, height: 35 }}
              />
            ) : (
              <Image
                source={IconsMap.icon_location_marker_png}
                style={{ width: 30, height: 35 }}
              />
            )}
          </Marker>
        )}

        <InviteeMarker
          eventId={event.id}
          hostId={event.hostID}
        />
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
});

export default ActiveMap;
