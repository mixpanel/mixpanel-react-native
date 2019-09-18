import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export default class Logo extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Image style={{ width: 200, height: 200, marginTop: 50, borderWidth: 1, borderColor: "#1E90FF" }}
                    source={require("../images/logo.jpg")} />
                <Text style={styles.logoText}> Welcome To React DemoApp</Text>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    logoText: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.7)',
        margin: 10
    }
})
