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
    /**
      Identify the user uniquely by providing the user distinctId.
     */
    identify = () => {
        this.mixpanel.identify("testDistinctId");
    }
    
    createAlias = () => {
        this.mixpanel.alias("New Alias", "testDistinctId");
    }

    reset = () => {
        this.mixpanel.reset();
    }

    setProperty = () => {
        this.mixpanel.people.set({
          "a": 1,
          "b": 2.3,
          "c": ["4", 5],
        }).then(t => alert("success"));
    }

    setOneProperty = () => {
        this.mixpanel.people.set("d", "yo").then(t => alert("success"));
    }

    setOnePropertyOnce = () => {
        this.mixpanel.people.setOnce("c", "just once").then(t => alert("success"));
    }

    unsetProperties = () => {
        this.mixpanel.people.unset("a");
    }

    incrementProperties = () => {
        this.mixpanel.people.increment({"a": 1.2, "b": 3});
    }

    incrementProperty = () => {
        this.mixpanel.people.increment("a", 1.2);
    }
    
    appendProperties = () => {
        this.mixpanel.people.append("e", "Hello");
    }

    unionProperties = () => {
        this.mixpanel.people.union({"a": ["goodbye", "hi"], "c": ["hello"]});
    }

    trackChargeWithoutProperties = () => {
      this.mixpanel.people.trackCharge(22.8).then(t => alert("success"));
    }

    trackCharge = () => {
        this.mixpanel.people.trackCharge(12.8, {"sandwich": 1}).then(t => alert("success"));
    }

    clearCharges = () => {
        this.mixpanel.people.clearCharges();
    }

    deleteUser = () => {
        this.mixpanel.people.deleteUser();
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
                        <Text style={styles.buttonText}>Identify</Text>
                    </TouchableOpacity>
                </View>
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
