import React, {useEffect, useRef} from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {MixpanelProvider, useMixpanel} from './contexts/MixpanelContext';
import {ErrorBoundary} from './components/ErrorBoundary';
import {OnboardingScreen} from './screens/OnboardingScreen';
import {HomeScreen} from './screens/HomeScreen';
import {FeatureFlagsScreen} from './screens/FeatureFlagsScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {MIXPANEL_TOKEN} from '@env';

const Tab = createBottomTabNavigator();

// Fallback token for demo purposes (use your own from Mixpanel dashboard)
const DEMO_TOKEN = 'YOUR_TOKEN_HERE';
const token = MIXPANEL_TOKEN || DEMO_TOKEN;

function AppNavigator(): React.JSX.Element {
  const {mixpanel, isInitialized} = useMixpanel();
  const navigationRef = useNavigationContainerRef();
  const previousRouteNameRef = useRef<string | undefined>();
  const isNavigationReadyRef = useRef(false);
  const initialScreenTrackedRef = useRef(false);

  // Track initial screen view once both navigation and Mixpanel are ready
  useEffect(() => {
    if (
      isInitialized &&
      mixpanel &&
      isNavigationReadyRef.current &&
      !initialScreenTrackedRef.current
    ) {
      const currentRoute = navigationRef.getCurrentRoute()?.name;
      if (currentRoute) {
        mixpanel.autocapture.trackScreenView(currentRoute);
        initialScreenTrackedRef.current = true;
      }
    }
  }, [isInitialized, mixpanel, navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const initialRouteName = navigationRef.getCurrentRoute()?.name;
        previousRouteNameRef.current = initialRouteName;
        isNavigationReadyRef.current = true;
        if (isInitialized && mixpanel && initialRouteName) {
          mixpanel.autocapture.trackScreenView(initialRouteName);
          initialScreenTrackedRef.current = true;
        }
      }}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;
        const previousRouteName = previousRouteNameRef.current;

        if (currentRouteName !== previousRouteName) {
          if (isInitialized && mixpanel) {
            if (previousRouteName) {
              mixpanel.autocapture.trackScreenLeave(previousRouteName);
            }
            if (currentRouteName) {
              mixpanel.autocapture.trackScreenView(currentRouteName);
            }
          }
          previousRouteNameRef.current = currentRouteName;
        }
      }}>
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
  );
}

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <MixpanelProvider token={token} trackAutomaticEvents={true} useNative={true} serverURL="https://api-eu.mixpanel.com">
        <AppNavigator />
      </MixpanelProvider>
    </ErrorBoundary>
  );
}

export default App;
