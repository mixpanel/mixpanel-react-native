import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ScrollView } from 'react-native';
import Mixpanel from "mixpanel-react-native";
import { token as MixpanelToken } from '../app.json';

export default class GroupScreen extends React.Component {

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
    setProperties = () => {
        this.mixpanel.identify("testDistinctId");
    }
    
    trackWithGroups = () => {
        this.mixpanel.trackWithGroups("tracked with groups", {"a": 1, "b": 2.3}, {"company_id": "Mixpanel"});
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
                    <TouchableOpacity style={styles.button} onPress={this.setProperties}>
                        <Text style={styles.buttonText}>Set Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.createAlias}>
                        <Text style={styles.buttonText}>Set One Property</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.reset}>
                        <Text style={styles.buttonText}>Set Properties Once</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.setProperty}>
                        <Text style={styles.buttonText}>Unset Property</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.setOneProperty}>
                        <Text style={styles.buttonText}>Remove Proeprty</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.setOnePropertyOnce}>
                        <Text style={styles.buttonText}>Union Properties</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.unsetProperties}>
                        <Text style={styles.buttonText}>Delete Group</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.incrementProperties}>
                        <Text style={styles.buttonText}>Set Group</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.incrementProperty}>
                        <Text style={styles.buttonText}>Set One Group</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.incrementProperty}>
                        <Text style={styles.buttonText}>Add Group</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.incrementProperty}>
                        <Text style={styles.buttonText}>Remove Group</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.trackWithGroups}>
                        <Text style={styles.buttonText}>Track with Groups</Text>
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
