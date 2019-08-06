import React, { Component } from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import Home from './screens/Home';
import Welcome from './screens/Welcome';
import MixpanelInstance from './screens/MixpanelInstance';
import Mixpanel from './screens/Mixpanel';
import People from './screens/People';

const Router = createStackNavigator({
  Home:
    {
      screen: Home
    },
  Welcome:
    {
      screen: Welcome
    },
  MixpanelInstance:
    {
      screen: MixpanelInstance
    },
  Mixpanel:
    {
      screen: Mixpanel
    },
  People:
    {
      screen: People
    }
});
const AppContainer = createAppContainer(Router);

export default AppContainer;

