import React, { Component } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';
import Mixpanel from "mixpanel-react-native";

export default class PeopleScreen extends React.Component {
  
  constructor(){
    this.mixpanel = new Mixpanel("bb71c6d97ef1bde11ffe83037a388b57");
  }  

  /**
     * Set a collection of properties on the identified user.
  */
  set = () => {
    var key = this.state.TextInput_Key;
    var value = this.state.TextInput_Value;
    var properties = {};
    properties[key] = value;
    this.mixpanel.people.set(properties);
  }
  /**
     * Track a revenue transaction for the identified people profile.
     * @param charge-the amount of money exchanged.
  */
  trackCharge = () => {
    var chargeInDouble = parseFloat(this.state.TextInput_Charge)
    this.mixpanel.people.trackCharge(chargeInDouble);
  }
  /**
     * Push all queued Mixpanel events and People Analytics changes to Mixpanel servers.
  */
  flush = () => {
    this.mixpanel.flush();
  }
  render() {
    return (
      <View>
        <TextInput style={styles.inputBox}
          placeholder="Property Key"
          onChangeText={data => this.setState({ TextInput_Key: data })}
          placeholderTextColor="#fffffff" />
        <TextInput style={styles.inputBox}
          placeholder="Property Value"
          onChangeText={data => this.setState({ TextInput_Value: data })}
          placeholderTextColor="#fffffff" />
        <TouchableOpacity style={styles.button1} onPress={this.set}>
          <Text style={styles.buttonText}>Set</Text>
        </TouchableOpacity>
        <TextInput style={styles.inputBox}
          placeholder="Charge"
          keyboardType='numeric'
          onChangeText={data => this.setState({ TextInput_Charge: data })}
          placeholderTextColor="#fffffff" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.button} onPress={this.trackCharge}>
            <Text style={styles.buttonText}>TrackCharge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.flush}>
            <Text style={styles.buttonText}>Flush</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1E90FF',
    borderRadius: 25,
    width: 200,
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 10,
  },
  inputBox: {
    width: 410,
    backgroundColor: '#F0FFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#1E90FF",
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: "center"
  },
  button1: {
    backgroundColor: '#1E90FF',
    borderRadius: 25,
    width: 410,
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 10,
  }
})