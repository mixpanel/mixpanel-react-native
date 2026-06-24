import React, {useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {MixpanelProvider, useMixpanel} from './contexts/MixpanelContext';
import {ErrorBoundary} from './components/ErrorBoundary';
import {OnboardingScreen} from './screens/OnboardingScreen';
import {HomeScreen} from './screens/HomeScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {MIXPANEL_TOKEN} from '@env';

const Tab = createBottomTabNavigator();

// Fallback token for demo purposes (use your own from Mixpanel dashboard)
const DEMO_TOKEN = 'YOUR_TOKEN_HERE';
const token = MIXPANEL_TOKEN || DEMO_TOKEN;

// Navigation wrapper component to access Mixpanel context
function NavigationWithTracking({children}: {children: React.ReactNode}) {
  const {mixpanel} = useMixpanel();
  const routeNameRef = useRef<string>();
  const navigationRef = useRef<any>();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRoute = navigationRef.current?.getCurrentRoute();
        const currentRouteName = currentRoute?.name;

        if (previousRouteName !== currentRouteName && mixpanel) {
          // Track screen leave for previous screen
          if (previousRouteName) {
            mixpanel.screenLeave(previousRouteName);
          }

          // Track screen view for current screen
          if (currentRouteName) {
            mixpanel.screenView(currentRouteName);
          }
        }

        // Save the current route name for next change
        routeNameRef.current = currentRouteName;
      }}>
      {children}
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <MixpanelProvider token={token} trackAutomaticEvents={true} useNative={true} serverURL="https://api-eu.mixpanel.com">
        <NavigationWithTracking>
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
        </NavigationWithTracking>
      </MixpanelProvider>
    </ErrorBoundary>
  );
}

export default App;
