import React from "react";
import { Container } from "native-base";
import { withNavigation } from "react-navigation";
import { StyleSheet, Text, Dimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import TabIcons from "./TabIcons";
import AboutPage from "./AboutPage";
import FriendsComponent from "./../Friends/FriendsComponent";
import AppBarComponent from "../../components/AppBar/appbar.index";
import ViewUserProfileContainer from "../Profile/view-profile/view-profile.index";

class TabContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      routes: [
        {
          key: "about",
          title: "About"
        },
        {
          key: "profile",
          title: "Profile"
        },
        {
          key: "friends",
          title: "Friends"
        }
      ]
    };
  }

  componentWillMount() {
    const { params } = this.props.navigation.state;
    this.setState({
      index: params.initialPage
    });
  }

  render() {
    return (
      <Container>
        <AppBarComponent />
        <TabView
          lazy
          navigationState={this.state}
          renderScene={SceneMap({
            about: AboutPage,
            profile: ViewUserProfileContainer,
            friends: FriendsComponent
          })}
          renderTabBar={props => (
            <TabBar
              {...props}
              labelStyle={{ color: "#1d6cbc" }}
              indicatorStyle={styles.indicator}
              renderIcon={props => <TabIcons {...props} />}
              renderLabel={({ route, focused }) => (
                <Text
                  style={{
                    color: focused ? "#1d6cbc" : "rgba(29, 108, 188, .7)",
                    fontWeight: focused ? "700" : "400",
                    width: 50
                  }}
                >
                  {route.title}
                </Text>
              )}
              style={styles.tabbar}
            />
          )}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get("window").width }}
        />
      </Container>
    );
  }
}

TabContainer.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  tabbar: {
    backgroundColor: "#ffffff",
    color: "#1d6cbc"
  },
  indicator: {
    backgroundColor: "#1d6cbc"
  }
});

export default withNavigation(TabContainer);
