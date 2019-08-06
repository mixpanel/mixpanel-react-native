/** @format */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as MixpanelDemo} from './app.json';

// Disable the yellow box
console.disableYellowBox = true;

AppRegistry.registerComponent(MixpanelDemo, () => App);
