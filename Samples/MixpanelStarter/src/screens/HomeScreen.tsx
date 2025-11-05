import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Switch, Alert} from 'react-native';
import {useMixpanel} from '../contexts/MixpanelContext';
import {ActionButton} from '../components/ActionButton';
import {InfoCard} from '../components/InfoCard';
import {Events, Properties} from '../constants/tracking';

export const HomeScreen: React.FC = () => {
  const {mixpanel, isInitialized, track} = useMixpanel();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [superProps, setSuperProps] = useState<Record<string, any>>({});

  useEffect(() => {
    // Track screen view
    if (isInitialized) {
      track(Events.SCREEN_VIEWED, {
        [Properties.SCREEN_NAME]: 'Home',
        [Properties.TIMESTAMP]: new Date().toISOString(),
      });
      console.log('Tracked SCREEN_VIEWED for Home screen');
    }
  }, [isInitialized, track]);

  useEffect(() => {
    // Fetch and display current super properties
    const fetchSuperProps = async () => {
      if (mixpanel && isInitialized) {
        try {
          const props = await mixpanel.getSuperProperties();
          setSuperProps(props);
        } catch (error) {
          console.error('Failed to get super properties:', error);
        }
      }
    };
    fetchSuperProps();
  }, [mixpanel, isInitialized]);

  const handleProductView = () => {
    // Track event with rich properties
    track(Events.PRODUCT_VIEWED, {
      [Properties.PRODUCT_ID]: 'prod-123',
      [Properties.PRODUCT_NAME]: 'Sample Product',
      [Properties.PRODUCT_CATEGORY]: 'Electronics',
      [Properties.TIMESTAMP]: new Date().toISOString(),
    });

    Alert.alert('Product Viewed', 'Event tracked with product details!');
  };

  const handleVideoStart = () => {
    if (videoPlaying) {
      Alert.alert('Already Playing', 'Video is already in progress');
      return;
    }

    // Start timing the video event
    mixpanel?.timeEvent(Events.VIDEO_COMPLETED);
    setVideoPlaying(true);

    track(Events.VIDEO_STARTED, {
      [Properties.VIDEO_TITLE]: 'Introduction to Mixpanel',
      [Properties.TIMESTAMP]: new Date().toISOString(),
    });

    Alert.alert('Video Started', 'Timer started for video completion event');
  };

  const handleVideoComplete = () => {
    if (!videoPlaying) {
      Alert.alert('Not Playing', 'Start the video first');
      return;
    }

    // This will automatically include the duration since timeEvent was called
    track(Events.VIDEO_COMPLETED, {
      [Properties.VIDEO_TITLE]: 'Introduction to Mixpanel',
      [Properties.TIMESTAMP]: new Date().toISOString(),
    });

    setVideoPlaying(false);

    Alert.alert(
      'Video Completed',
      'Event tracked with automatic duration calculation!',
    );
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);

    // Update super properties with the new preference
    mixpanel?.registerSuperProperties({
      [Properties.DARK_MODE_ENABLED]: value,
    });

    // Track the toggle event
    track(Events.DARK_MODE_TOGGLED, {
      [Properties.DARK_MODE_ENABLED]: value,
      [Properties.TIMESTAMP]: new Date().toISOString(),
    });

    // Refresh super properties display
    const props = await mixpanel?.getSuperProperties();
    if (props) {
      setSuperProps(props);
    }

    Alert.alert(
      'Dark Mode Updated',
      `Dark mode ${value ? 'enabled' : 'disabled'}. This preference is now saved as a super property and will be included in all future events.`,
    );
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);

    // Update super properties
    mixpanel?.registerSuperProperties({
      [Properties.NOTIFICATIONS_ENABLED]: value,
    });

    // Track the toggle event
    track(Events.NOTIFICATIONS_TOGGLED, {
      [Properties.NOTIFICATIONS_ENABLED]: value,
      [Properties.TIMESTAMP]: new Date().toISOString(),
    });

    // Refresh super properties display
    const props = await mixpanel?.getSuperProperties();
    if (props) {
      setSuperProps(props);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Event tracking and super properties</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.helper}>
          Tap these buttons to track events with custom properties
        </Text>

        <ActionButton
          title="View Product"
          onPress={handleProductView}
          disabled={!isInitialized}
          style={styles.actionButton}
        />

        <ActionButton
          title={videoPlaying ? 'Video Playing...' : 'Start Video'}
          onPress={handleVideoStart}
          disabled={!isInitialized || videoPlaying}
          variant={videoPlaying ? 'secondary' : 'primary'}
          style={styles.actionButton}
        />

        <ActionButton
          title="Complete Video"
          onPress={handleVideoComplete}
          disabled={!isInitialized || !videoPlaying}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Preferences</Text>
        <Text style={styles.helper}>
          These toggles save preferences as super properties that are included
          in all events
        </Text>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceLabel}>
            <Text style={styles.preferenceTitle}>Dark Mode</Text>
            <Text style={styles.preferenceSubtitle}>
              Save as super property
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            disabled={!isInitialized}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceLabel}>
            <Text style={styles.preferenceTitle}>Notifications</Text>
            <Text style={styles.preferenceSubtitle}>
              Include in all events
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            disabled={!isInitialized}
          />
        </View>
      </View>

      <InfoCard
        title="Current Super Properties"
        content={
          Object.keys(superProps).length > 0
            ? superProps
            : 'No super properties set'
        }
      />

      <InfoCard
        title="What's Happening?"
        content={`Events with Properties:
• track() sends events with custom data
• Properties provide context about user actions
• Use constants for event/property names

Timed Events:
• timeEvent() starts a timer for an event
• When you track that event, duration is auto-calculated
• Perfect for measuring video views, page reads, etc.

Super Properties:
• registerSuperProperties() sets global context
• Automatically included in every event
• Great for user preferences, app state, etc.
• getSuperProperties() retrieves current values`}
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
  actionButton: {
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
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
  infoCard: {
    marginTop: 10,
  },
});
