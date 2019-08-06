import React, { Component } from 'react';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import MixpanelInstance from './MixpanelInstance';
import Mixpanel from './Mixpanel';
import People from './People';
import GetInstance from './GetInstance'

export default class Welcome extends React.Component {
  render() {
    return (
      <Tab />
    )
  }
}

const tabBar = createBottomTabNavigator({
  Screen1: GetInstance,
  screen2: Mixpanel,
  Screen3: MixpanelInstance,
  Screen4: People
});
const Tab = createAppContainer(tabBar)