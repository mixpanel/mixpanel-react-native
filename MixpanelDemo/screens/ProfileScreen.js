import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ScrollView } from 'react-native';
import Mixpanel from "mixpanel-react-native";
import { token as MixpanelToken } from '../app.json';

export default class ProfileScreen extends React.Component {

    constructor(props) {
        super(props);
        this.configMixpanel();
    }

    configMixpanel = async () => {
        this.mixpanel = await Mixpanel.init(MixpanelToken);
    }
    
    createAlias = () => {
        this.mixpanel.alias("New Alias", "testDistinctId");
    }

    reset = () => {
        this.mixpanel.reset();
    }

    setProperty = () => {
        this.mixpanel.getPeople().set({
          "a": 1,
          "b": 2.3,
          "c": ["4", 5],
        }).then(t => alert("success"));
    }

    setOneProperty = () => {
        this.mixpanel.getPeople().set("d", "yo").then(t => alert("success"));
    }

    setOnePropertyOnce = () => {
        this.mixpanel.getPeople().setOnce("c", "just once").then(t => alert("success"));
    }

    unsetProperties = () => {
        this.mixpanel.getPeople().unset("a");
    }

    incrementProperties = () => {
        this.mixpanel.getPeople().increment({"a": 1.2, "b": 3});
    }

    incrementProperty = () => {
        this.mixpanel.getPeople().increment("a", 1.2);
    }
    
    removePropertyValue = () => {
        this.mixpanel.getPeople().remove("c", 5);
    }

    appendProperties = () => {
        this.mixpanel.getPeople().append("e", "Hello");
    }

    unionProperties = () => {
        this.mixpanel.getPeople().union({"a": ["goodbye", "hi"], "c": ["hello"]});
    }

    trackChargeWithoutProperties = () => {
        this.mixpanel.getPeople().trackCharge(22.8).then(t => alert("success"));
    }

    trackCharge = () => {
        this.mixpanel.getPeople().trackCharge(12.8, {"sandwich": 1}).then(t => alert("success"));
    }

    clearCharges = () => {
        this.mixpanel.getPeople().clearCharges();
    }

    deleteUser = () => {
        this.mixpanel.getPeople().deleteUser();
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
                    <TouchableOpacity style={styles.button} onPress={this.createAlias}>
                        <Text style={styles.buttonText}>Create Alias</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.reset}>
                        <Text style={styles.buttonText}>Reset</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.setProperty}>
                        <Text style={styles.buttonText}>Set Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.setOneProperty}>
                        <Text style={styles.buttonText}>Set One Property</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.setOnePropertyOnce}>
                        <Text style={styles.buttonText}>Set Properties Once</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.unsetProperties}>
                        <Text style={styles.buttonText}>Unset Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.incrementProperties}>
                        <Text style={styles.buttonText}>Increment Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.incrementProperty}>
                        <Text style={styles.buttonText}>Increment Property</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.removePropertyValue}>
                        <Text style={styles.buttonText}>Remove Property Value</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.appendProperties}>
                        <Text style={styles.buttonText}>Append Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.identify}>
                        <Text style={styles.buttonText}>Union Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.trackChargeWithoutProperties}>
                        <Text style={styles.buttonText}>Track Charge w/o Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.trackCharge}>
                        <Text style={styles.buttonText}>Track Charge w Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.clearCharges}>
                        <Text style={styles.buttonText}>Clear Charges</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.deleteUser}>
                        <Text style={styles.buttonText}>Delete User</Text>
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
