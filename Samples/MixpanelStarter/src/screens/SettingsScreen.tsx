import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Switch, Alert} from 'react-native';
import {useMixpanel} from '../contexts/MixpanelContext';
import {ActionButton} from '../components/ActionButton';
import {InfoCard} from '../components/InfoCard';
import {Events} from '../constants/tracking';

export const SettingsScreen: React.FC = () => {
  const {mixpanel, isInitialized, track, reset, flush} = useMixpanel();
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [distinctId, setDistinctId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sdkVersion, setSdkVersion] = useState<string>('');

  useEffect(() => {
    // Track screen view
    if (isInitialized) {
      track(Events.SCREEN_VIEWED, {
        screen_name: 'Settings',
        timestamp: new Date().toISOString(),
      });
    }
  }, [isInitialized, track]);

  useEffect(() => {
    // Get current settings
    const fetchSettings = async () => {
      if (mixpanel && isInitialized) {
        try {
          // Get distinct ID
          const id = await mixpanel.getDistinctId();
          setDistinctId(id);

          // Check opt-out status
          const hasOptedOut = await mixpanel.hasOptedOutTracking();
          setTrackingEnabled(!hasOptedOut);
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        }
      }
    };
    fetchSettings();
  }, [mixpanel, isInitialized]);

  const handleToggleTracking = async (value: boolean) => {
    setLoading(true);
    try {
      if (value) {
        // Opt in to tracking
        await mixpanel?.optInTracking();
        track(Events.TRACKING_OPTED_IN, {
          timestamp: new Date().toISOString(),
        });
        Alert.alert(
          'Tracking Enabled',
          'Analytics tracking has been enabled. Your events will now be sent to Mixpanel.',
        );
      } else {
        // Track opt-out event before opting out
        track(Events.TRACKING_OPTED_OUT, {
          timestamp: new Date().toISOString(),
        });
        // Flush events before opting out
        await mixpanel?.flush();
        // Opt out of tracking
        await mixpanel?.optOutTracking();
        Alert.alert(
          'Tracking Disabled',
          'Analytics tracking has been disabled. No events will be sent until you opt back in.',
        );
      }
      setTrackingEnabled(value);
    } catch (error) {
      console.error('Failed to toggle tracking:', error);
      Alert.alert('Error', 'Failed to update tracking preference');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear your distinct ID, user profile, and all local data. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Track reset event before resetting
              track(Events.DATA_RESET, {
                timestamp: new Date().toISOString(),
              });

              // Flush events to ensure reset event is sent
              await flush();

              // Reset all data
              reset();

              Alert.alert(
                'Data Reset',
                'All your data has been cleared. You now have a new anonymous ID.',
              );

              // Fetch new distinct ID
              const newId = await mixpanel?.getDistinctId();
              if (newId) {
                setDistinctId(newId);
              }
            } catch (error) {
              console.error('Failed to reset data:', error);
              Alert.alert('Error', 'Failed to reset data');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleFlushEvents = async () => {
    setLoading(true);
    try {
      // Track flush event
      track(Events.EVENTS_FLUSHED, {
        timestamp: new Date().toISOString(),
      });

      // Flush all queued events
      await flush();

      Alert.alert(
        'Events Flushed',
        'All queued events have been sent to Mixpanel immediately.',
      );
    } catch (error) {
      console.error('Failed to flush events:', error);
      Alert.alert('Error', 'Failed to flush events');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDistinctId = () => {
    Alert.alert('Your Distinct ID', distinctId || 'Loading...');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Privacy controls and data management</Text>
      </View>

      <InfoCard title="Your Distinct ID" content={distinctId || 'Loading...'} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Controls</Text>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceLabel}>
            <Text style={styles.preferenceTitle}>Analytics Tracking</Text>
            <Text style={styles.preferenceSubtitle}>
              {trackingEnabled
                ? 'Events are being sent to Mixpanel'
                : 'Tracking is disabled (GDPR compliant)'}
            </Text>
          </View>
          <Switch
            value={trackingEnabled}
            onValueChange={handleToggleTracking}
            disabled={!isInitialized || loading}
          />
        </View>

        <ActionButton
          title="Reset All Data"
          onPress={handleResetData}
          variant="danger"
          disabled={!isInitialized || loading}
          loading={loading}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer Tools</Text>

        <ActionButton
          title="Flush Events Now"
          onPress={handleFlushEvents}
          variant="secondary"
          disabled={!isInitialized || loading}
          loading={loading}
          style={styles.actionButton}
        />

        <ActionButton
          title="View Distinct ID"
          onPress={handleViewDistinctId}
          variant="secondary"
          disabled={!isInitialized}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <InfoCard
          title="SDK Information"
          content={{
            'SDK Version': '3.1.2',
            'Implementation Mode': 'Native (iOS: Swift, Android: Java)',
            'Tracking Status': trackingEnabled ? 'Enabled' : 'Disabled',
          }}
        />
      </View>

      <InfoCard
        title="What's Happening?"
        content={`Privacy Controls:
• optInTracking() / optOutTracking() controls data collection
• Complies with GDPR and privacy regulations
• hasOptedOutTracking() checks current status
• When opted out, no events are sent to Mixpanel

Data Reset:
• reset() clears all local data and user identity
• Generates a new anonymous distinct ID
• Use this for logout or "forget me" functionality
• Previous events remain in Mixpanel (not deleted)

Manual Flush:
• flush() immediately sends all queued events
• Useful before app termination or user logout
• Events are normally flushed automatically every 60s
• Ensures data is sent even if app is force-closed

Distinct ID:
• Every user has a unique distinct ID
• Anonymous users get an auto-generated UUID
• Identified users get their custom ID (email, etc.)
• Used to associate events with individual users`}
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
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
  },
  preferenceLabel: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  actionButton: {
    marginBottom: 12,
  },
  infoCard: {
    marginTop: 10,
  },
});
