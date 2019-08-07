import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Logo from './logo'

class HomeScreen extends React.Component {
  /**
     * Navigate screen to Welcome page
  */
  navigate = () => {
    this.props.navigation.navigate('Welcome');
  };
  render() {
    return (
      <View >
        <Text style={styles.text}>Welcome To ReactNative DemoApp</Text><Logo />
        <Button containerStyle={styles.button} onPress={this.navigate} title='Lets get started' />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    top: 10,
    textAlign: 'center',
    fontSize: 46,
    fontWeight: 'bold',
    color: '#000000',
  },
  button: {
    marginTop: 150
  }
})

export default HomeScreen;
