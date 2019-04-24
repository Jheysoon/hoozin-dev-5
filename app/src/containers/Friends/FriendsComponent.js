import React from "react";
import { connect } from "react-redux";
import { Content, List } from "native-base";
import { ActivityIndicator } from "react-native";

import FriendItem from "./FriendItem";
import { getUserFriends } from "./../../actions/friends";

class FriendsComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { getUserFriends, user } = this.props;

    getUserFriends(user.socialUID);
  }

  render() {
    const { list, loading } = this.props;

    return (
      <Content>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#1d6cbc"
            style={{ marginTop: 20 }}
          />
        )}

        <List style={{ marginBottom: 10 }}>
          {list.map((val, key) => (
            <FriendItem key={key} data={val} />
          ))}
        </List>
      </Content>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    list: state.friends.list,
    loading: state.friends.loading
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserFriends: id => {
      dispatch(getUserFriends(id));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FriendsComponent);
