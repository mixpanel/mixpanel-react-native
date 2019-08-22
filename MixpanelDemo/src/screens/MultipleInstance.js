import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Mixpanel from 'mixpanel-react-native';

class MultipleInstance extends React.Component {
    /**
    * Use for Track an event.
    */
    track1 = () => {
        //mixpanel.getInstance(this.state.TextInput_Token1);
        //mixpanel.track("Instance 1").then(t => mixpanel.flush());
    }
    track2 = () => {
        //mixpanel.getInstance(this.state.TextInput_Token2);
        //mixpanel.track("Instance 2").then(t =>  mixpanel.flush());
    }
    track3 = () => {
        //mixpanel.getInstance(this.state.TextInput_Token3);
        //mixpanel.track("Instance 3").then(t =>  mixpanel.flush());
    }

    render() {
        return (
            <View>
                <TextInput style={styles.inputBox}
                    placeholder="Instance1-Token"
                    onChangeText={data => this.setState({ TextInput_Token1: data })}
                    placeholderTextColor="#fffffff" />
                <TextInput style={styles.inputBox}
                    placeholder="Instance2-Token"
                    onChangeText={data => this.setState({ TextInput_Token2: data })}
                    placeholderTextColor="#fffffff" />
                <TextInput style={styles.inputBox}
                    placeholder="Instance3-Token"
                    onChangeText={data => this.setState({ TextInput_Token3: data })}
                    placeholderTextColor="#fffffff" />
                <Text style={styles.text}>EventName:Test-Event</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.button1} onPress={this.track1}>
                        <Text style={styles.buttonText}>Track Instance-1 </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button1} onPress={this.track2}>
                        <Text style={styles.buttonText}>Track Instance-2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button1} onPress={this.track3}>
                        <Text style={styles.buttonText}>Track Instance-3</Text>
                    </TouchableOpacity>
                </View>
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
    text: {
        width: 410,
        color: '#000000',
        paddingHorizontal: 16,
        fontSize: 16,
        textAlign: "center",
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
        width: 130,
        alignItems: 'center',
        paddingVertical: 12
    }
})

export default MultipleInstance;
