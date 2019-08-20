import React, { Component } from 'react';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import MixpanelInstance from './MixpanelInstance';
import Mixpanel from './Mixpanel';
import People from './People';
import GetInstance from './GetInstance';
import MultipleInstance from './MultipleInstance';

export default class Welcome extends React.Component {
  render() {
    return (
      <Tab />
    )
  }
}
/* Botton Tab Navigator: To navigate between Screens*/ 
const tabBar = createBottomTabNavigator({
  Screen1: GetInstance,
  Screen2: Mixpanel,
  Screen3: MixpanelInstance,
  Screen4: People,
  Screen5: MultipleInstance
});
const Tab = createAppContainer(tabBar)