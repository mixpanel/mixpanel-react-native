import React, { Component } from 'react';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import MixpanelInstance from './MixpanelInstance';
import Mixpanel from './Mixpanel';
import People from './People';
import MultipleInstance from './MultipleInstance';
import PushNotificationHandler from '../PushNotificationHandler';

export default class Welcome extends React.Component {
  render() {
    return ( 
      <Tab>
        <PushNotificationHandler/>
      </Tab>
    )
  }
}
/* Botton Tab Navigator: To navigate between Screens*/ 
const tabBar = createBottomTabNavigator({
  Screen1: Mixpanel,
  Screen2: MixpanelInstance,
  Screen3: People,
  Screen4: MultipleInstance
});
const Tab = createAppContainer(tabBar)