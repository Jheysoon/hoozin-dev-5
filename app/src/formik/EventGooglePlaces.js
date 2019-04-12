import React from "react";
import RNGooglePlaces from "react-native-google-places";
import { TouchableOpacity, TextInput } from "react-native";

class EventGooglePlaces extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      textInputHeight: 0
    };
  }

  render() {
    const { field, form } = this.props;

    return (
      <TouchableOpacity
        style={{
          height: Math.max(85, this.state.textInputHeight + 30),
          width: "100%",
          marginTop: -10
        }}
        onPress={() => {
          RNGooglePlaces.openAutocompleteModal()
            .then(place => {
              form.setFieldValue(field.name, place.address);
              form.setFieldValue("evtCoords", {
                lat: place.latitude,
                lng: place.longitude
              });
            })
            .catch(e => {
              console.log(e);
            });
        }}
      >
        <TextInput
          ref="eventLoc"
          selection={{ start: 0, end: 0 }}
          multiline={true}
          editable={false}
          value={field.value}
          onContentSizeChange={event => {
            this.setState({
              textInputHeight: event.nativeEvent.contentSize.height
            });
          }}
          style={{
            marginTop: 35,
            marginLeft: -5,
            fontSize: 17,
            color: "#707070",
            height: Math.max(45, this.state.textInputHeight)
          }}
          placeholder="Location"
        />
      </TouchableOpacity>
    );
  }
}

export default EventGooglePlaces;
