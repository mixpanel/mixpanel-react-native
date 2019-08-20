import React, { Component } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';
import mixpanel from "mixpanel-react-native";
import PushNotificationHandler from '../PushNotificationHandler'

export default class Mixpanel extends React.Component {
    setPushRegistrationId = () => {
        mixpanel.people.setPushRegistrationId(this.state.TextInput_Token);
    }
    clearPushRegistrationId = () => {
        mixpanel.people.clearPushRegistrationId();
    }
    getPushRegistrationId = () => {
        mixpanel.people.getPushRegistrationId();
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
                <PushNotificationHandler/>
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