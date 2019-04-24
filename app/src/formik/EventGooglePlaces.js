import React from "react";
import RNGooglePlaces from "react-native-google-places";
import { TouchableOpacity, TextInput, View } from "react-native";

class EventGooglePlaces extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      textInputHeight: 0
    };

    this.onPress = this.onPress.bind(this);
    this.renderTextInput = this.renderTextInput.bind(this);
  }

  onPress() {
    const { field, form } = this.props;

    RNGooglePlaces.openAutocompleteModal()
      .then(place => {
        form.setFieldValue(field.name, place.name);
        form.setFieldValue("evtCoords", {
          lat: place.latitude,
          lng: place.longitude
        });
      })
      .catch(e => {
        console.log(e);
      });
  }

  renderTextInput() {
    const { field } = this.props;

    return (
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
          marginTop: -7,
          marginLeft: -1,
          fontSize: 17,
          color: "#707070",
          height: Math.max(45, this.state.textInputHeight),
          zIndex: -1
        }}
        placeholder="Location"
      />
    );
  }

  render() {
    return (
      <TouchableOpacity
        style={{
          height: Math.max(85, this.state.textInputHeight + 30),
          width: "100%",
          zIndex: 100
        }}
        onPress={this.onPress}
      >
        <View pointerEvents="none">{this.renderTextInput()}</View>
      </TouchableOpacity>
    );
  }
}

export default EventGooglePlaces;
