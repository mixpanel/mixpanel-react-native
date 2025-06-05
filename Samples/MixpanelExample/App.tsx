import React from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Mixpanel} from 'mixpanel-react-native';

const trackAutomaticEvents = true;
const mixpanel = new Mixpanel('Your Project Token', trackAutomaticEvents);
mixpanel.init();

function App(): React.JSX.Element {
  const trackEvent = () => {
    mixpanel.track('Button Pressed', {
      source: 'MixpanelExample',
      timestamp: new Date().toISOString(),
    });
  };

  const identifyUser = () => {
    mixpanel.identify('test_user_123');
    mixpanel.getPeople().set({
      $name: 'Test User',
      $email: 'test@example.com',
    });
  };

  const resetUser = () => {
    mixpanel.reset();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>Mixpanel React Native Example</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button title="Track Event" onPress={trackEvent} />
          <View style={styles.spacer} />
          <Button title="Identify User" onPress={identifyUser} />
          <View style={styles.spacer} />
          <Button title="Reset User" onPress={resetUser} />
        </View>
        
        <View style={styles.info}>
          <Text style={styles.infoText}>
            Replace 'Your Project Token' with your actual Mixpanel project token.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
  },
  spacer: {
    height: 10,
  },
  info: {
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;