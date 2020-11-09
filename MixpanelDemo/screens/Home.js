import React from 'react';
import { StyleSheet, SafeAreaView, View, Button, ScrollView} from 'react-native';


const Separator = () => (
  <View style={styles.separator} />
);

class HomeScreen extends React.Component {
    /**
      Navigate screen to Welcome page
    */
    navigateEvent = () => {
        this.props.navigation.navigate('Event');
    }

    navigatePeople = () => {
      this.props.navigation.navigate('People');
    }

    navigateGDPR = () => {
      this.props.navigation.navigate('GDPR');
    }

    render() {
        return (
          <SafeAreaView>
            <ScrollView >
                <Separator />
                <Button onPress={this.navigateEvent} title='Event' />
                <Separator />
                <Button onPress={this.navigatePeople} title='Profile' />
                <Separator />
                <Button onPress={this.navigateGDPR} title='GDPR' />
                <Separator />
            </ScrollView>
          </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
  separator: {
    marginVertical: 15,
  }
})

export default HomeScreen;
