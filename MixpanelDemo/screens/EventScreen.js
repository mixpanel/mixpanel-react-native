import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Mixpanel from 'mixpanel-react-native';
import { token as MixpanelToken } from '../app.json';

class EventScreen extends React.Component {

    constructor(props) {
        super(props);
        this.configMixpanel();
    }

    configMixpanel = async () => {
        this.mixpanel = await Mixpanel.init(MixpanelToken);
    }
    /**
      Use this method to opt-in an already opted-out user from tracking.
    */
    optIn = () => {
        this.mixpanel.optInTracking(this.state.TextInput_Id);
    }
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
    track = () => {
        var properties = this.takeProperty();
        this.mixpanel.track(this.state.TextInput_EventName, properties);
    }
    /**
      registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
    */
    registerSuperProperties = () => {
        var properties = this.takeProperty();
        this.mixpanel.registerSuperProperties(properties);
    }
    /**
      Erase all currently registered superProperties.
    */
    clearSuperProperties = () => {
        var properties = this.takeProperty();
        this.mixpanel.clearSuperProperties(properties);
    }
    /**
      Returns a json object of the user's current super properties.
    */
    getSuperProperties = () => {
        this.mixpanel.getSuperProperties().then(t => {
            alert(JSON.stringify(t));
        });
    }

    render() {
        return (
            <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Track w/o Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Track w Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Time Event 5secs</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Clear Timed Events</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Get Current SuperProperties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Clear SuperProperties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Register SuperProperties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Register SuperProperties Once</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Register SP Once w Default Value</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Unregister SuperProperty</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Flush</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    inputBox: {
        width: '100%',
        borderWidth: 2,
        backgroundColor: '#F0FFFF',
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        borderColor: "#1E90FF",
        marginVertical: 10
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
    },
    text: {
        top: 10,
        fontSize: 16,
        color: '#ffffff',
    },
    button: {
        backgroundColor: '#1E90FF',
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: "center"
    }
})

export default EventScreen;
