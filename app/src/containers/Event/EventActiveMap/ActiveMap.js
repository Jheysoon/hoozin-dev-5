import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
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
import { activeMapCoords } from "../../../actions/events/invitee";

const ActiveMap = ({
  lng,
  lat,
  singleUserOnly,
  event,
  coords,
  activeMapCoords
}) => {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}
      region={coords}
      onRegionChangeComplete={() => activeMapCoords(null)}
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

      <InviteeMarker eventId={event.id} hostId={event.hostID} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
});

const mapStateToProps = state => {
  return {
    eventList: state.eventList.events,
    coords: state.invitee.activeMapCoords
  };
};

const mapDispatchToProps = dispatch => {
  return {
    activeMapCoords: coords => {
      dispatch(activeMapCoords(coords));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActiveMap);
