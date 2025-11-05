import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';

interface InfoCardProps {
  title: string;
  content: string | Record<string, any>;
  style?: ViewStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({title, content, style}) => {
  const renderContent = () => {
    if (typeof content === 'string') {
      return <Text style={styles.content}>{content}</Text>;
    }

    // Render object as key-value pairs
    return (
      <View style={styles.kvContainer}>
        {Object.entries(content).map(([key, value]) => (
          <View key={key} style={styles.kvRow}>
            <Text style={styles.key}>{key}:</Text>
            <Text style={styles.value}>{JSON.stringify(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  kvContainer: {
    gap: 6,
  },
  kvRow: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    minWidth: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
