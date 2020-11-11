import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
      Use for Track an event.
    */
    track = () => {
        this.mixpanel.track("Track Event!");
    }

    timeEvent = () => {
        const eventName = "Timed Event";
        this.mixpanel.timeEvent(eventName);
        setTimeout(() => {
          this.mixpanel.track(eventName);
        }, 2000);
    }

    trackWProperties = () => {
        const properties = {"Cool Property": "Property Value"};
        this.mixpanel.track("Track event with property");
    }

    /**
      registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
    */
    registerSuperProperties = () => {
        this.mixpanel.registerSuperProperties({
            "super property": "super property value",
            "super property1": "super property value1",
        });
    }
    /**
      Erase all currently registered superProperties.
    */
    clearSuperProperties = () => {
        this.mixpanel.clearSuperProperties();
    }

    unregisterSuperProperty = () => {
        this.mixpanel.unregisterSuperProperty("super property");
    }
    /**
      Returns a json object of the user's current super properties.
    */
    getSuperProperties = () => {
        this.mixpanel.getSuperProperties().then(t => {
            alert(JSON.stringify(t));
        });
    }

    registerSuperPropertiesOnce = () => {
        this.mixpanel.registerSuperPropertiesOnce({"super property": "super property value1"});
    }

    flush = () => {
      this.mixpanel.flush();
    }

    render() {
        return (
            <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.track}>
                        <Text style={styles.buttonText}>Track w/o Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.trackWProperties}>
                        <Text style={styles.buttonText}>Track w Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.timeEvent}>
                        <Text style={styles.buttonText}>Time Event 2 secs</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.getSuperProperties}>
                        <Text style={styles.buttonText}>Get Current SuperProperties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.clearSuperProperties}>
                        <Text style={styles.buttonText}>Clear SuperProperties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.registerSuperProperties}>
                        <Text style={styles.buttonText}>Register SuperProperties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.registerSuperPropertiesOnce}>
                        <Text style={styles.buttonText}>Register SuperProperties Once</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.unregisterSuperProperty}>
                        <Text style={styles.buttonText}>Unregister SuperProperty</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.flush}>
                        <Text style={styles.buttonText}>Flush</Text>
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
        paddingVertical: 12,
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

export default EventScreen;
