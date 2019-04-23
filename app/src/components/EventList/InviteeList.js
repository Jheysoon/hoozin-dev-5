import React from "react";
import Image from "react-native-remote-svg";
import { List, ListItem } from "native-base";
import { CachedImage } from "react-native-cached-image";

import { EventServiceAPI } from "../../api";
import { IconsMap } from "../../../assets/assetMap";

const eventSrv = new EventServiceAPI();

class InviteeList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: []
    };
  }

  async componentDidMount() {
    let list = await eventSrv.getEventInvitees(this.props.eventId);

    this.setState({
      list: list
    });
  }

  render() {
    return this.state.list.length ? (
      <List
        dataArray={this.state.list}
        horizontal={true}
        renderRow={(item, key) => (
          <ListItem
            key={key}
            style={{
              padding: 0,
              marginLeft: 5,
              borderBottomWidth: 0
            }}
          >
            {item.profileImgUrl ? (
              <CachedImage
                source={{ uri: item.profileImgUrl }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24
                }}
              />
            ) : (
              <Image
                source={IconsMap.icon_contact_avatar}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24
                }}
              />
            )}
          </ListItem>
        )}
        {...this.props}
      />
    ) : null;
  }
}

export default InviteeList;
