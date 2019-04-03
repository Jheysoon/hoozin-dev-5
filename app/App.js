"use strict";

import React, { Component } from "react";
import { SafeAreaView } from "react-native";
import { Provider } from "react-redux";
import { Root } from "native-base";

import MainAppContainer from "./src/containers/MainApp";
import store from "./src/store";

/**
 * Root app component only bootstraps the app and registers the Redux store into the app
 */
export default class RootAppComponent extends Component {
  render() {
    return (
      <Provider store={store}>
        <SafeAreaView style={{ flex: 1 }}>
          <Root>
            <MainAppContainer />
          </Root>
        </SafeAreaView>
      </Provider>
    );
  }
}
