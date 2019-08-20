import React, { Component } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, TextInput } from 'react-native';
import mixpanel from "mixpanel-react-native";

export default class GetInstance extends React.Component {
    /**
         * Get the instance of MixpanelAPI with providing token
    */
    getInstance = () => {
       // mixpanel.getInstance(this.state.TextInput_Token);
       mixpanel.getInstance("bb71c6d97ef1bde11ffe83037a388b57");
    }
    render() {
        return (
            <View>
                <TextInput style={styles.inputBox}
                    placeholder="Token"
                    onChangeText={data => this.setState({ TextInput_Token: data })}
                    placeholderTextColor="#fffffff" />
                <TouchableOpacity style={styles.button1} onPress={this.getInstance}>
                    <Text style={styles.buttonText}>Create Mixpanel Instance</Text>
                </TouchableOpacity>
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
        paddingVertical: 12
    }
})