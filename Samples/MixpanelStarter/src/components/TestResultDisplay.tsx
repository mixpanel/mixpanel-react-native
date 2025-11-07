import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {TestResult} from '../types/flags.types';

interface TestResultDisplayProps {
  result: TestResult | null;
}

const formatResult = (value: any): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
};

export const TestResultDisplay: React.FC<TestResultDisplayProps> = ({result}) => {
  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>
          No test results yet. Run a test to see results here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test Result</Text>
        <Text style={styles.timestamp}>
          {result.timestamp.toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Method Called</Text>
        <Text style={styles.codeText}>{result.method}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Flag:</Text>
          <Text style={styles.value}>{result.flagName}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{result.resultType}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Used Fallback:</Text>
          <Text style={[styles.value, result.usedFallback && styles.warning]}>
            {result.usedFallback ? '⚠️ Yes' : '✅ No'}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{result.executionTime}ms</Text>
        </View>
      </View>

      {result.usedFallback && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fallback Value</Text>
          <Text style={styles.codeText}>{formatResult(result.fallback)}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Returned Value</Text>
        <Text style={styles.codeText}>{formatResult(result.result)}</Text>
      </View>

      {result.error && (
        <View style={[styles.section, styles.errorSection]}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{result.error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    maxHeight: 400,
  },
  placeholder: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Courier',
  },
  warning: {
    color: '#ff9800',
  },
  errorSection: {
    backgroundColor: '#fff3f3',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    fontFamily: 'Courier',
  },
});
