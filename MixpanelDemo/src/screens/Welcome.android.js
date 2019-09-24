import React from 'react';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import EventScreen from './EventScreen';
import PeopleScreen from './PeopleScreen';
import PushNotification from './PushNotification';
import MultiInstance from './MultiInstance';

export default class Welcome extends React.Component {
  render() {
    return (
      <Tab />
    )
  }
}

/* Bottom Tab Navigator: To navigate between screens*/ 
const tabBar = createBottomTabNavigator({
  People: PeopleScreen,
  Event: EventScreen,
  PushNotification: PushNotification,
  MultiInstance: MultiInstance
});
const Tab = createAppContainer(tabBar)
