import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import mixpanel from 'mixpanel-react-native';

class MixpanelInstance extends React.Component {
  constructor(props) {
    super(props);
    this.state = { TextInput_Id: '' }
  }
  /**
       * Identify the user uniquely by providing the user distinct id
   */
  identify = () => {
    mixpanel.people.identify(this.state.TextInput_Id).then(t => alert(t));
  }
  /**
       * Use this method to opt-in an already opted-out user from tracking.
  */
  optIn = () => {
    mixpanel.optInTracking(this.state.TextInput_Id).then(t => alert(t));
  }
  /**
       * Use to accept user entered properties in the format of key-value pair.
  */
  takeProperty = () => {
    var key = this.state.TextInput_Key;
    var value = this.state.TextInput_Value;
    var properties = {};
    properties[key] = value;
    return properties;
  }
  /**
     * Use for Track an event.
  */
  track = () => {
    var properties = this.takeProperty();
    mixpanel.track(this.state.TextInput_EventName, properties).then(t => alert(t));
  }
  /**
     * registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
  */
  registerSuperProperty = () => {
    var properties = this.takeProperty();
    mixpanel.registerSuperProperties(properties).then(t => alert(t));
  }
  /**
     * Erase all currently registered superProperties.
  */
  clearSuperProperty = () => {
    var properties = this.takeProperty();
    mixpanel.clearSuperProperties(properties).then(t => alert(t));
  }
  /**
     * Returns a json object of the user's current super properties
  */
  getSuperProperty = () => {
    mixpanel.getSuperProperties().then(t => {
      alert(JSON.stringify(t));
    });
  }
  render() {
    return (
      <View>
        <TextInput style={styles.inputBox}
          placeholder="Distinct Id"
          onChangeText={data => this.setState({ TextInput_Id: data })}
          placeholderTextColor="#fffffff" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.button} onPress={this.identify}>
            <Text style={styles.buttonText}>Identify User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.optIn}>
            <Text style={styles.buttonText}>Opt In</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.inputBox}
          placeholder="Event Name"
          onChangeText={data => this.setState({ TextInput_EventName: data })}
          placeholderTextColor="#fffffff" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TextInput style={styles.inputBox1}
            placeholder="Property Key"
            onChangeText={data => this.setState({ TextInput_Key: data })}
            placeholderTextColor="#fffffff" />
          <TextInput style={styles.inputBox1}
            placeholder="Property Value"
            onChangeText={data => this.setState({ TextInput_Value: data })}
            placeholderTextColor="#fffffff" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.button} onPress={this.track}>
            <Text style={styles.buttonText}>Track</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.registerSuperProperty}>
            <Text style={styles.buttonText}>Register Super Property</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.button} onPress={this.clearSuperProperty}>
            <Text style={styles.buttonText}>Clear Super Property</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.getSuperProperty}>
            <Text style={styles.buttonText}>Get Super Property</Text>
          </TouchableOpacity>
        </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  inputBox: {
    width: 410,
    borderWidth: 2,
    backgroundColor: '#F0FFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    borderColor: "#1E90FF",
    marginVertical: 10
  },
  inputBox1: {
    width: 200,
    borderWidth: 2,
    backgroundColor: '#F0FFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    borderColor: "#1E90FF",
    marginVertical: 10
  },
  text: {
    top: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#1E90FF',
    borderRadius: 25,
    width: 200,
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: "center"
  },
})

export default MixpanelInstance;
