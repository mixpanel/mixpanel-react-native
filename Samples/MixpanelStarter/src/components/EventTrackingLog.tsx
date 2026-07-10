import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {TrackedEvent} from '../types/flags.types';

interface EventTrackingLogProps {
  events: TrackedEvent[];
  maxEvents?: number;
}

const getEventEmoji = (eventName: string): string => {
  if (eventName === '$experiment_started') return '🧪';
  if (eventName.startsWith('FLAG_')) return '🚩';
  if (eventName.startsWith('$')) return '📊';
  return '✅';
};

const formatEventProperties = (properties: Record<string, any>): string => {
  const relevantProps: Record<string, any> = {};

  // Extract only the most relevant properties for display
  const keys = ['$experiment_name', '$variant_name', '$variant_value', '$experiment_id',
                'flag_key', 'flag_enabled', 'flag_value', 'screen_name'];

  keys.forEach(key => {
    if (properties[key] !== undefined) {
      relevantProps[key] = properties[key];
    }
  });

  return JSON.stringify(relevantProps, null, 2);
};

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleTimeString();
};

export const EventTrackingLog: React.FC<EventTrackingLogProps> = ({
  events,
  maxEvents = 10,
}) => {
  const displayEvents = events.slice(0, maxEvents);

  if (displayEvents.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>
          No events tracked yet. Interact with flags to see tracking events.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
      {displayEvents.map(event => (
        <View
          key={event.id}
          style={[
            styles.eventCard,
            event.eventName === '$experiment_started' && styles.experimentEvent,
          ]}>
          <View style={styles.eventHeader}>
            <View style={styles.eventHeaderLeft}>
              <Text style={styles.emoji}>{getEventEmoji(event.eventName)}</Text>
              <View>
                <Text style={styles.eventName}>{event.eventName}</Text>
                <Text style={styles.timestamp}>{getTimeAgo(event.timestamp)}</Text>
              </View>
            </View>
          </View>

          {Object.keys(event.properties).length > 0 && (
            <View style={styles.propertiesSection}>
              <Text style={styles.propertiesText}>
                {formatEventProperties(event.properties)}
              </Text>
            </View>
          )}
        </View>
      ))}

      {events.length > maxEvents && (
        <Text style={styles.moreText}>
          + {events.length - maxEvents} more events
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  placeholder: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    padding: 12,
  },
  experimentEvent: {
    borderColor: '#9c27b0',
    borderWidth: 2,
    backgroundColor: '#f3e5f5',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  emoji: {
    fontSize: 20,
    marginRight: 10,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  propertiesSection: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  propertiesText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#555',
  },
  moreText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    paddingVertical: 8,
    fontStyle: 'italic',
  },
});
