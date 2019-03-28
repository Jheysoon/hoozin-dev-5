/**
 * @description entry point to the entire app. It register the root app component into the bundle
 */
import { AppRegistry } from 'react-native';
import RootAppComponent from './App';
import bgMessaging from './src/bgMessaging'
import { Client } from 'bugsnag-react-native';
const bugsnag = new Client("6c10791f6aba53199acc2ecd662a6125");

//bugsnag.notify(new Error("Test error"));

AppRegistry.registerComponent('hoozin', () => RootAppComponent);
// New task registration
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);