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
    optIn = () => {
        this.mixpanel.optInTracking(this.mixpanel.getDistinctId());
    }

    optOut = () => {
        this.mixpanel.optOutTracking();
    }

    render() {
        return (
            <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.optIn}>
                        <Text style={styles.buttonText}>Opt In</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button} onPress={this.optOut}>
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
