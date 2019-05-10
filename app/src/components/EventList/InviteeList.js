import React from "react";
import Image from "react-native-remote-svg";
import { List, ListItem, Icon } from "native-base";
import { CachedImage } from "react-native-cached-image";
import UserAvatar from "react-native-user-avatar";

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
              <UserAvatar
                size={48}
                name={item.name}
                src={item.profileImgUrl}
                component={CachedImage}
                containerStyle={{ opacity: item.status == "going" ? 1 : 0.3 }}
              />
            ) : (
              <UserAvatar
                name={item.name}
                size={48}
                containerStyle={{ opacity: item.status == "going" ? 1 : 0.3 }}
                textColor={item.status == "going" ? "#fff" : "rgba(0,0,0,.5)"}
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
