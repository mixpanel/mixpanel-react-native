import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';
import Mixpanel from "mixpanel-react-native";
import {token as MixpanelToken} from '../../app.json';

export default class People extends React.Component {
    // async componentDidMount() {
    //     const mixpanel = await Mixpanel.init(MixpanelToken);        
    //     this.setState({mixpanel: mixpanel});
    //   } 
      
    constructor(props) {
        super(props);
        this.configMixpanel();
    }
    
    configMixpanel =  async () => {      
        this.mixpanel = await Mixpanel.init(MixpanelToken);      
    } 
    
    setPushRegistrationId = () => {
        this.mixpanel.people.setPushRegistrationId(this.state.TextInput_Token);
    }
    clearPushRegistrationId = () => {
        this.mixpanel.people.clearPushRegistrationId();
    }
    getPushRegistrationId = () => {
        this.mixpanel.people.getPushRegistrationId();
    }
    render() {
        return (
            <View>
                <TextInput style={styles.inputBox}
                    placeholder="Token"
                    onChangeText={data => this.setState({ TextInput_Token: data })}
                    placeholderTextColor="#fffffff" />
                <TouchableOpacity style={styles.button1} onPress={this.setPushRegistrationId}>
                    <Text style={styles.buttonText}>Set Push RegistrationId</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button1} onPress={this.clearPushRegistrationId}>
                    <Text style={styles.buttonText}>Clear Push RegistrationId</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button1} onPress={this.getPushRegistrationId}>
                    <Text style={styles.buttonText}>Get Push RegistrationId</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
        paddingVertical: 12
    }
})
