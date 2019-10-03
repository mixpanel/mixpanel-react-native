import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';
import Mixpanel from "mixpanel-react-native";
import { token as MixpanelToken } from '../../app.json';

export default class People extends React.Component {

    constructor(props) {
        super(props);
        this.configMixpanel();
    }

    configMixpanel = async () => {
        this.mixpanel = await Mixpanel.init(MixpanelToken);
    }
    /**
      Register the given device to receive push notifications.
    */
    setPushRegistrationId = () => {
        this.mixpanel.people.setPushRegistrationId(this.state.TextInput_Token);
    }
    /**
      Unregister specific device token from the ability to receive push notifications. This will remove the provided push token saved to user profile.
    */
    clearPushRegistrationId = () => {
        this.mixpanel.people.clearPushRegistrationId();
    }

    render() {
        return (
            <View>
                <TextInput style={styles.inputBox}
                    placeholder="Token"
                    onChangeText={data => this.setState({ TextInput_Token: data })}
                    placeholderTextColor="#fffffff" />
                <TouchableOpacity style={styles.button} onPress={this.setPushRegistrationId}>
                    <Text style={styles.buttonText}>Set Push RegistrationId</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={this.clearPushRegistrationId}>
                    <Text style={styles.buttonText}>Clear Push RegistrationId</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inputBox: {
        width: '100%',
        backgroundColor: '#F0FFFF',
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 2,
        borderColor: "#1E90FF",
        marginVertical: 10,
        height: '15%'
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
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 12
    }
})
