import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {MixpanelProvider} from './contexts/MixpanelContext';
import {ErrorBoundary} from './components/ErrorBoundary';
import {OnboardingScreen} from './screens/OnboardingScreen';
import {HomeScreen} from './screens/HomeScreen';
import {FeatureFlagsScreen} from './screens/FeatureFlagsScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {MIXPANEL_TOKEN} from '@env';

const Tab = createBottomTabNavigator();

// Fallback token for demo purposes (use your own from Mixpanel dashboard)
const DEMO_TOKEN = 'DEMO_TOKEN';
const token = MIXPANEL_TOKEN || DEMO_TOKEN;

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <MixpanelProvider token={token} trackAutomaticEvents={true} useNative={true}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: '#8E8E93',
              headerStyle: {
                backgroundColor: '#F2F2F7',
              },
              headerTintColor: '#000',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}>
            <Tab.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{
                tabBarLabel: 'User ID',
                tabBarIcon: ({color}) => (
                  <Text style={{fontSize: 20, color}}>👤</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: 'Events',
                tabBarIcon: ({color}) => (
                  <Text style={{fontSize: 20, color}}>📊</Text>
                ),
              }}
            />
            <Tab.Screen
              name="FeatureFlags"
              component={FeatureFlagsScreen}
              options={{
                tabBarLabel: 'Flags',
                tabBarIcon: ({color}) => (
                  <Text style={{fontSize: 20, color}}>🚩</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({color}) => (
                  <Text style={{fontSize: 20, color}}>⚙️</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </MixpanelProvider>
    </ErrorBoundary>
  );
}

export default App;
