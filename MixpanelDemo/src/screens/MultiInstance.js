import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Mixpanel from 'mixpanel-react-native';

class MultipleInstance extends React.Component {

    constructor(props) {
        super(props);
      }

    init = async () => {
        let [mixpanelInstance1, mixpanelInstance2] = 
            await Promise.all([
                Mixpanel.init(this.state.firstMpToken), 
                Mixpanel.init(this.state.secondMpToken)
            ]);
        this.mixpanelInstance1 = mixpanelInstance1;
        this.mixpanelInstance2 = mixpanelInstance2;
        alert(JSON.stringify( {mixpanelInstance1, mixpanelInstance2}));
    };  
    /**
      Use to accept user entered properties in the format of key-value pair.
    */
    takeProperty = () => {
        var key = this.state.TextInput_Key;
        var value = this.state.TextInput_Value;
        var properties = {};
        properties[key] = value;
        return properties;
    }   
    /**
      Use for Track an event.
    */
    trackFirstInstance = () => {
        var properties = this.takeProperty();
        this.mixpanelInstance1.track(this.state.TextInput_EventName, properties);
    }       
    trackSecondInstance = () => {
        var properties = this.takeProperty();
        this.mixpanelInstance2.track(this.state.TextInput_EventName, properties);
    }

   render() {
       return (
           <View>
                <TextInput style={styles.inputBox}
                   placeholder="First-Instance Token"
                   onChangeText={data => this.setState({ firstMpToken: data })}
                   placeholderTextColor="#fffffff" />
                <TextInput style={styles.inputBox}
                   placeholder="Second-Instance Token"
                   onChangeText={data => this.setState({ secondMpToken: data })}
                   placeholderTextColor="#fffffff" />        
                <TouchableOpacity style={styles.touchableOpacity} onPress={this.init}>
                <Text style={styles.buttonText}>Initialize</Text>
                </TouchableOpacity>
                   <TextInput style={styles.inputBox}
                    placeholder="Event Name"
                    onChangeText={data => this.setState({ TextInput_EventName: data })}
                    placeholderTextColor="#fffffff" />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput style={styles.textInput}
                        placeholder="Property Key"
                        onChangeText={data => this.setState({ TextInput_Key: data })}
                        placeholderTextColor="#fffffff" />
                <TextInput style={styles.textInput}
                        placeholder="Property Value"
                        onChangeText={data => this.setState({ TextInput_Value: data })}
                        placeholderTextColor="#fffffff" />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.button} onPress={this.trackFirstInstance}>
                <Text style={styles.buttonText}>Track First-Instance </Text>
                </TouchableOpacity>
                   <TouchableOpacity style={styles.button} onPress={this.trackSecondInstance}>
                       <Text style={styles.buttonText}>Track Second-Instance</Text>
                   </TouchableOpacity>
               </View>
           </View>
       );
   }
}
const styles = StyleSheet.create({
    touchableOpacity:{
        backgroundColor: '#1E90FF',
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 12
    },
   inputBox: {
       width: '100%',
       backgroundColor: '#F0FFFF',
       borderRadius: 25,
       paddingHorizontal: 16,
       fontSize: 16,
       borderWidth: 2,
       borderColor: "#1E90FF",
       marginVertical: 10,
   },
   text: {
       width: '100%',
       color: '#000000',
       paddingHorizontal: 16,
       fontSize: 26,
       textAlign: "center",
       marginVertical: 10,
   },
   buttonText: {
       fontSize: 16,
       fontWeight: '500',
       color: '#ffffff',
       textAlign: "center"
   },
   button: {
       backgroundColor: '#1E90FF',
       borderRadius: 25,
       width: '48%',
       alignItems: 'center',
       paddingVertical: 12
   },
   textInput: {
    width: '48%',
    borderWidth: 2,
    backgroundColor: '#F0FFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    borderColor: "#1E90FF",
    marginVertical: 10
  }
})

export default MultipleInstance;