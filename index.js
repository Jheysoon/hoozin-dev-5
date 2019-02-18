/**
 * @description entry point to the entire app. It register the root app component into the bundle
 */
import { AppRegistry } from 'react-native';
import RootAppComponent from './App';
import bgMessaging from './src/bgMessaging'

AppRegistry.registerComponent('hoozin', () => RootAppComponent);
// New task registration
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);