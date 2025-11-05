import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useMixpanel} from '../contexts/MixpanelContext';
import {ActionButton} from '../components/ActionButton';
import {InfoCard} from '../components/InfoCard';
import {Events, Properties} from '../constants/tracking';

export const OnboardingScreen: React.FC = () => {
  const {mixpanel, isInitialized, track, identify, alias} = useMixpanel();
  const [userId, setUserId] = useState('');
  const [currentDistinctId, setCurrentDistinctId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Track screen view
    if (isInitialized) {
      track(Events.SCREEN_VIEWED, {
        [Properties.SCREEN_NAME]: 'Onboarding',
        [Properties.TIMESTAMP]: new Date().toISOString(),
      });
    }
  }, [isInitialized, track]);

  useEffect(() => {
    // Get current distinct ID
    const fetchDistinctId = async () => {
      if (mixpanel && isInitialized) {
        try {
          const id = await mixpanel.getDistinctId();
          setCurrentDistinctId(id);
        } catch (error) {
          console.error('Failed to get distinct ID:', error);
        }
      }
    };
    fetchDistinctId();
  }, [mixpanel, isInitialized]);

  const handleSignUp = async () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter a user ID or email');
      return;
    }

    setLoading(true);
    try {
      const previousId = currentDistinctId;

      // 1. Identify the user with the new ID
      identify(userId);

      // 2. Link the previous anonymous ID to the new identified ID
      await alias(userId, previousId);

      // 3. Set user profile properties
      mixpanel?.getPeople().set({
        $email: userId,
        $name: userId.split('@')[0], // Extract name from email
        signup_date: new Date().toISOString(),
        signup_method: 'app',
      });

      // 4. Set properties that should only be set once
      mixpanel?.getPeople().setOnce({
        first_app_open: new Date().toISOString(),
      });

      // 5. Track the signup event
      track(Events.USER_SIGNED_UP, {
        [Properties.USER_ID]: userId,
        [Properties.USER_EMAIL]: userId,
        [Properties.TIMESTAMP]: new Date().toISOString(),
      });

      Alert.alert(
        'Success!',
        `Welcome ${userId}! You've been identified and your profile has been set up.`,
      );

      // Update the displayed distinct ID
      const newId = await mixpanel?.getDistinctId();
      if (newId) {
        setCurrentDistinctId(newId);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    // Track event for anonymous user
    track(Events.GUEST_CONTINUED, {
      [Properties.TIMESTAMP]: new Date().toISOString(),
    });

    Alert.alert(
      'Guest Mode',
      'You can continue using the app. Events will be tracked with your anonymous ID.',
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to MixpanelStarter</Text>
        <Text style={styles.subtitle}>
          This screen demonstrates user identification
        </Text>
      </View>

      <InfoCard
        title="Your Current Distinct ID"
        content={currentDistinctId || 'Loading...'}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sign Up or Log In</Text>
        <Text style={styles.helper}>
          Enter your email to identify yourself and set up your user profile.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={isInitialized}
        />

        <ActionButton
          title="Sign Up"
          onPress={handleSignUp}
          disabled={!isInitialized || !userId.trim()}
          loading={loading}
        />
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue as Guest</Text>
        <Text style={styles.helper}>
          Use the app anonymously. Events will be tracked with your current ID.
        </Text>

        <ActionButton
          title="Continue as Guest"
          onPress={handleGuestContinue}
          variant="secondary"
          disabled={!isInitialized}
        />
      </View>

      <InfoCard
        title="What's Happening?"
        content={`When you sign up:
• identify() sets your user ID
• alias() links your previous anonymous events
• getPeople().set() creates your user profile
• getPeople().setOnce() sets properties only if they don't exist
• track() logs the signup event

When you continue as guest:
• Events are tracked with your anonymous ID
• You can identify later to claim these events`}
        style={styles.infoCard}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helper: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    marginTop: 10,
  },
});
