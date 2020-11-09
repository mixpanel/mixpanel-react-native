import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ScrollView } from 'react-native';
import Mixpanel from "mixpanel-react-native";
import { token as MixpanelToken } from '../app.json';

export default class GDPRScreen extends React.Component {

    constructor(props) {
        super(props);
        this.configMixpanel();
    }

    configMixpanel = async () => {
        this.mixpanel = await Mixpanel.init(MixpanelToken);
    }
    /**
      Identify the user uniquely by providing the user distinctId.
     */
    identify = () => {
      this.mixpanel.identify(this.state.TextInput_Id);
    }
    reset = () => {
      this.mixpanel.reset();
    }
   /**
      Set a collection of properties on the identified user.
    */
    set = () => {
        var key = this.state.TextInput_Key;
        var value = this.state.TextInput_Value;
        var properties = {};
        properties[key] = value;
        this.mixpanel.people.set(properties).then(t => alert("success"));
    }
    /**
      Track a revenue transaction for the identified people profile.
    */
    trackCharge = () => {
        var chargeInDouble = parseFloat(this.state.TextInput_Charge)
        this.mixpanel.people.trackCharge(chargeInDouble).then(t => alert("success"));
    }
    /**
      Push all queued Mixpanel events and People Analytics changes to Mixpanel servers.
    */
    flush = () => {
        this.mixpanel.flush();
    }

    render() {
        return (
            <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Opt In</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Opt Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1E90FF',
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: "center"
    },
    touchableOpacity: {
        backgroundColor: '#1E90FF',
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 10,
    }
})
