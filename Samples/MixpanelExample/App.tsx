import React, {useEffect, useState} from 'react';
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

function App(): React.JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMixpanel = async () => {
      try {
        await mixpanel.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Mixpanel:', error);
      }
    };

    initializeMixpanel();
  }, []);
  const trackEvent = () => {
    if (!isInitialized) {
      console.warn('Mixpanel not initialized yet');
      return;
    }
    mixpanel.track('Button Pressed', {
      source: 'MixpanelExample',
      timestamp: new Date().toISOString(),
    });
  };

  const identifyUser = () => {
    if (!isInitialized) {
      console.warn('Mixpanel not initialized yet');
      return;
    }
    mixpanel.identify('test_user_123');
    mixpanel.getPeople().set({
      $name: 'Test User',
      $email: 'test@example.com',
    });
  };

  const resetUser = () => {
    if (!isInitialized) {
      console.warn('Mixpanel not initialized yet');
      return;
    }
    mixpanel.reset();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>Mixpanel React Native Example</Text>
          {!isInitialized && (
            <Text style={styles.statusText}>Initializing Mixpanel...</Text>
          )}
          {isInitialized && (
            <Text style={styles.statusText}>✓ Mixpanel Ready</Text>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Track Event" 
            onPress={trackEvent} 
            disabled={!isInitialized}
          />
          <View style={styles.spacer} />
          <Button 
            title="Identify User" 
            onPress={identifyUser} 
            disabled={!isInitialized}
          />
          <View style={styles.spacer} />
          <Button 
            title="Reset User" 
            onPress={resetUser} 
            disabled={!isInitialized}
          />
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
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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