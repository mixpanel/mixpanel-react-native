import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {FlagInfo, ValueType} from '../types/flags.types';

interface FlagCardProps {
  flag: FlagInfo;
  onTest?: (flagKey: string) => void;
}

const getValueTypeEmoji = (type: ValueType): string => {
  switch (type) {
    case 'string':
      return '📝';
    case 'number':
      return '🔢';
    case 'boolean':
      return '✓';
    case 'object':
      return '📦';
    case 'array':
      return '📋';
    case 'null':
      return '∅';
    default:
      return '❓';
  }
};

const formatValue = (value: any, type: ValueType): string => {
  if (type === 'object' || type === 'array') {
    return JSON.stringify(value, null, 2);
  }
  if (type === 'string') {
    return `"${value}"`;
  }
  if (type === 'null') {
    return 'null';
  }
  return String(value);
};

const getTimeAgo = (date?: Date): string => {
  if (!date) return 'Never';
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

export const FlagCard: React.FC<FlagCardProps> = ({flag, onTest}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.emoji}>{getValueTypeEmoji(flag.valueType)}</Text>
          <View>
            <Text style={styles.flagKey}>{flag.key}</Text>
            <Text style={styles.value} numberOfLines={expanded ? undefined : 1}>
              {formatValue(flag.value, flag.valueType)}
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.detailValue}>{flag.valueType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Variant Key:</Text>
            <Text style={styles.detailValue}>{flag.variantKey || 'N/A'}</Text>
          </View>

          {flag.experimentID && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Experiment ID:</Text>
              <Text style={styles.detailValue}>{flag.experimentID}</Text>
            </View>
          )}

          {flag.isExperimentActive !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Active:</Text>
              <Text style={styles.detailValue}>
                {flag.isExperimentActive ? '✅ Yes' : '⏸️ No'}
              </Text>
            </View>
          )}

          {flag.isQATester !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>QA Tester:</Text>
              <Text style={styles.detailValue}>
                {flag.isQATester ? '🧪 Yes' : 'No'}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.label}>Last Accessed:</Text>
            <Text style={styles.detailValue}>{getTimeAgo(flag.lastAccessed)}</Text>
          </View>

          {onTest && (
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => onTest(flag.key)}>
              <Text style={styles.testButtonText}>Test This Flag</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  flagKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Courier',
  },
  expandIcon: {
    fontSize: 12,
    color: '#999',
  },
  details: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Courier',
  },
  testButton: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
