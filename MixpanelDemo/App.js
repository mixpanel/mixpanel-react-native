/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import MixpanelReactNative from 'react-native-ts';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  render() {
    if(MixpanelReactNative){
      MixpanelReactNative.getInstance("bb71c6d97ef1bde11ffe83037a388b57",false).then((t) => {
        alert(t);
        //MixpanelReactNative.getInformation().then(s => alert(s));
        //return MixpanelReactNative.hasOptedOutTracking().then(s => alert(s));
        return MixpanelReactNative.optInTracking("123456789",{}).then(s => alert(s))
      }).catch(e => console.log(e.message, e.code));
    }else{
      alert("Undefined MixpanelReactNative");
    }
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
