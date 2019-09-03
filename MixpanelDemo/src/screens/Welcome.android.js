import React, { Component } from 'react';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';
import EventScreen from './EventScreen';
import PeopleScreen from './PeopleScreen';
import People from './People';
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
  Screen1: PeopleScreen,
  Screen2: EventScreen,
  Screen3: People,
  Screen4: MultipleInstance
});
const Tab = createAppContainer(tabBar)