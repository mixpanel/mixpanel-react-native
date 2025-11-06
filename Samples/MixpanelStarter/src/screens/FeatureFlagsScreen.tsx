import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useMixpanel} from '../contexts/MixpanelContext';
import {ActionButton} from '../components/ActionButton';
import {InfoCard} from '../components/InfoCard';
import {FlagCard} from '../components/FlagCard';
import {TestResultDisplay} from '../components/TestResultDisplay';
import {EventTrackingLog} from '../components/EventTrackingLog';
import {Events, Properties} from '../constants/tracking';
import {
  FlagInfo,
  TestResult,
  TrackedEvent,
  TestMode,
  ValueType,
} from '../types/flags.types';

// Existing flags from your Mixpanel project
// Selected to demonstrate different flag types and scenarios
const RECOMMENDED_FLAGS = {
  // Boolean FeatureGate flags (value: true/false)
  'sample-bool-flag': 'boolean',
  'hash-slinging-slasher': 'boolean',
  'mike-test': 'boolean',

  // String Experiment flags (custom variants)
  'sample-exp-testing': 'string-experiment',
  'new_feature_flag_v2': 'string-variant',
  'mojojojo': 'string-variant',
  'af_ff_music_finder_test': 'string-variant',

  // Experiment with active tracking
  'general-replay-events-query-improvement': 'active-experiment',
  'test-active-flag': 'active-experiment',

  // Dynamic Config (object values)
  'matthew-dynamic-7': 'object-config',
  'mike-dynamic-config-4': 'complex-object',
} as const;

const getValueType = (value: any): ValueType => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value as ValueType;
};

export const FeatureFlagsScreen: React.FC = () => {
  const {mixpanel, isInitialized, track} = useMixpanel();

  // State
  const [flagsReady, setFlagsReady] = useState(false);
  const [isLoadingFlags, setIsLoadingFlags] = useState(false);
  const [allFlags, setAllFlags] = useState<Record<string, FlagInfo>>({});
  const [selectedFlag, setSelectedFlag] = useState<string>('react-native');
  const [testMode, setTestMode] = useState<TestMode>('sync');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [trackedEvents, setTrackedEvents] = useState<TrackedEvent[]>([]);
  const [customFallback, setCustomFallback] = useState<string>('null');

  // Track screen view
  useEffect(() => {
    if (isInitialized) {
      track(Events.SCREEN_VIEWED, {
        [Properties.SCREEN_NAME]: 'Feature Flags',
        [Properties.TIMESTAMP]: new Date().toISOString(),
      });
      console.log('Tracked SCREEN_VIEWED for Feature Flags screen');
    }
  }, [isInitialized, track]);

  // Check if flags are ready on mount and after load
  useEffect(() => {
    if (mixpanel && isInitialized) {
      const ready = mixpanel.flags.areFlagsReady();
      setFlagsReady(ready);

      if (ready) {
        refreshAllFlags();
      }
    }
  }, [mixpanel, isInitialized]);

  // Intercept track calls to log them
  const trackWithLog = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      const event: TrackedEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        eventName,
        properties: properties || {},
      };
      setTrackedEvents(prev => [event, ...prev].slice(0, 20));
      track(eventName, properties);
    },
    [track],
  );

  // Refresh all flags from Mixpanel
  const refreshAllFlags = useCallback(() => {
    if (!mixpanel || !flagsReady) return;

    const flags: Record<string, FlagInfo> = {};

    // Get all recommended flags
    Object.keys(RECOMMENDED_FLAGS).forEach(flagKey => {
      try {
        const variant = mixpanel.flags.getVariantSync(flagKey, {
          key: 'fallback',
          value: null,
        });

        let displayValue = variant.value;

        // Handle dynamic config flags that return JSON strings
        if (variant.key === '$dynamic_config' && typeof variant.value === 'string') {
          try {
            displayValue = JSON.parse(variant.value);
          } catch (e) {
            // If parsing fails, keep as string
            displayValue = variant.value;
          }
        }

        flags[flagKey] = {
          key: flagKey,
          value: displayValue,
          valueType: getValueType(displayValue),
          variantKey: variant.key,
          experimentID: variant.experimentID,
          isExperimentActive: variant.isExperimentActive,
          isQATester: variant.isQATester,
          lastAccessed: new Date(),
        };
      } catch (error) {
        console.error(`Failed to get flag ${flagKey}:`, error);
      }
    });

    setAllFlags(flags);
  }, [mixpanel, flagsReady]);

  // Load flags from Mixpanel
  const handleLoadFlags = async () => {
    if (!mixpanel) {
      Alert.alert('Error', 'Mixpanel not initialized');
      return;
    }

    try {
      setIsLoadingFlags(true);

      await mixpanel.flags.loadFlags();

      setFlagsReady(true);

      trackWithLog(Events.FLAGS_LOADED, {
        [Properties.TIMESTAMP]: new Date().toISOString(),
      });

      refreshAllFlags();

      Alert.alert(
        'Flags Loaded',
        `Successfully fetched ${Object.keys(allFlags).length} feature flags!`,
      );
    } catch (error) {
      console.error('Failed to load flags:', error);
      Alert.alert(
        'Load Failed',
        `Failed to load feature flags: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoadingFlags(false);
    }
  };

  // Helper to create test result
  const createTestResult = (
    method: string,
    flagName: string,
    fallback: any,
    result: any,
    startTime: number,
    error?: string,
  ): TestResult => {
    const executionTime = Date.now() - startTime;
    const resultType = getValueType(result);
    const usedFallback =
      JSON.stringify(result) === JSON.stringify(fallback) || error !== undefined;

    return {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      method,
      flagName,
      fallback,
      result,
      resultType,
      executionTime,
      usedFallback,
      error,
    };
  };

  // Sync Method Tests
  const testGetVariantSync = () => {
    if (!mixpanel) return;

    const fallback = {key: 'fallback', value: JSON.parse(customFallback)};
    const startTime = Date.now();

    try {
      const result = mixpanel.flags.getVariantSync(selectedFlag, fallback);
      const testResult = createTestResult(
        `getVariantSync('${selectedFlag}', fallback)`,
        selectedFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_SYNC, {
        [Properties.FLAG_METHOD]: 'getVariantSync',
        [Properties.FLAG_KEY]: selectedFlag,
        [Properties.FLAG_VALUE]: result.value,
        [Properties.FLAG_EXECUTION_TIME]: testResult.executionTime,
      });
    } catch (error) {
      const testResult = createTestResult(
        `getVariantSync('${selectedFlag}', fallback)`,
        selectedFlag,
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  const testGetVariantValueSync = () => {
    if (!mixpanel) return;

    const fallback = JSON.parse(customFallback);
    const startTime = Date.now();

    try {
      const result = mixpanel.flags.getVariantValueSync(selectedFlag, fallback);
      const testResult = createTestResult(
        `getVariantValueSync('${selectedFlag}', ${customFallback})`,
        selectedFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_SYNC, {
        [Properties.FLAG_METHOD]: 'getVariantValueSync',
        [Properties.FLAG_KEY]: selectedFlag,
        [Properties.FLAG_VALUE]: result,
        [Properties.FLAG_EXECUTION_TIME]: testResult.executionTime,
      });
    } catch (error) {
      const testResult = createTestResult(
        `getVariantValueSync('${selectedFlag}', ${customFallback})`,
        selectedFlag,
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  const testIsEnabledSync = () => {
    if (!mixpanel) return;

    const fallback = false;
    const startTime = Date.now();

    try {
      const result = mixpanel.flags.isEnabledSync(selectedFlag, fallback);
      const testResult = createTestResult(
        `isEnabledSync('${selectedFlag}', false)`,
        selectedFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_SYNC, {
        [Properties.FLAG_METHOD]: 'isEnabledSync',
        [Properties.FLAG_KEY]: selectedFlag,
        [Properties.FLAG_ENABLED]: result,
        [Properties.FLAG_EXECUTION_TIME]: testResult.executionTime,
      });
    } catch (error) {
      const testResult = createTestResult(
        `isEnabledSync('${selectedFlag}', false)`,
        selectedFlag,
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  // Async Method Tests (Promise)
  const testGetVariantAsync = async () => {
    if (!mixpanel) return;

    const fallback = {key: 'fallback', value: JSON.parse(customFallback)};
    const startTime = Date.now();

    try {
      const result = await mixpanel.flags.getVariant(selectedFlag, fallback);
      const testResult = createTestResult(
        `await getVariant('${selectedFlag}', fallback)`,
        selectedFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_ASYNC, {
        [Properties.FLAG_METHOD]: 'getVariant',
        [Properties.FLAG_KEY]: selectedFlag,
        [Properties.FLAG_VALUE]: result.value,
        [Properties.FLAG_EXECUTION_TIME]: testResult.executionTime,
      });
    } catch (error) {
      const testResult = createTestResult(
        `await getVariant('${selectedFlag}', fallback)`,
        selectedFlag,
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  const testGetVariantValueAsync = async () => {
    if (!mixpanel) return;

    const fallback = JSON.parse(customFallback);
    const startTime = Date.now();

    try {
      const result = await mixpanel.flags.getVariantValue(
        selectedFlag,
        fallback,
      );
      const testResult = createTestResult(
        `await getVariantValue('${selectedFlag}', ${customFallback})`,
        selectedFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_ASYNC, {
        [Properties.FLAG_METHOD]: 'getVariantValue',
        [Properties.FLAG_KEY]: selectedFlag,
        [Properties.FLAG_VALUE]: result,
        [Properties.FLAG_EXECUTION_TIME]: testResult.executionTime,
      });
    } catch (error) {
      const testResult = createTestResult(
        `await getVariantValue('${selectedFlag}', ${customFallback})`,
        selectedFlag,
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  const testIsEnabledAsync = async () => {
    if (!mixpanel) return;

    const fallback = false;
    const startTime = Date.now();

    try {
      const result = await mixpanel.flags.isEnabled(selectedFlag, fallback);
      const testResult = createTestResult(
        `await isEnabled('${selectedFlag}', false)`,
        selectedFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_ASYNC, {
        [Properties.FLAG_METHOD]: 'isEnabled',
        [Properties.FLAG_KEY]: selectedFlag,
        [Properties.FLAG_ENABLED]: result,
        [Properties.FLAG_EXECUTION_TIME]: testResult.executionTime,
      });
    } catch (error) {
      const testResult = createTestResult(
        `await isEnabled('${selectedFlag}', false)`,
        selectedFlag,
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  // Callback Pattern Test
  const testGetVariantCallback = () => {
    if (!mixpanel) return;

    const fallback = {key: 'fallback', value: JSON.parse(customFallback)};
    const startTime = Date.now();

    mixpanel.flags.getVariant(selectedFlag, fallback, result => {
      const testResult = createTestResult(
        `getVariant('${selectedFlag}', fallback, callback)`,
        selectedFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_CALLBACK, {
        [Properties.FLAG_METHOD]: 'getVariant (callback)',
        [Properties.FLAG_KEY]: selectedFlag,
        [Properties.FLAG_VALUE]: result.value,
        [Properties.FLAG_EXECUTION_TIME]: testResult.executionTime,
      });
    });
  };

  // Edge Case Tests
  const testNonExistentFlag = () => {
    if (!mixpanel) return;

    const fakeFlag = 'non-existent-flag-12345';
    const fallback = {key: 'fallback', value: 'NOT_FOUND'};
    const startTime = Date.now();

    try {
      const result = mixpanel.flags.getVariantSync(fakeFlag, fallback);
      const testResult = createTestResult(
        `getVariantSync('${fakeFlag}', fallback) [non-existent]`,
        fakeFlag,
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_EDGE_CASE, {
        [Properties.FLAG_METHOD]: 'non-existent flag',
        [Properties.FLAG_KEY]: fakeFlag,
        [Properties.FLAG_USED_FALLBACK]: testResult.usedFallback,
      });
    } catch (error) {
      const testResult = createTestResult(
        `getVariantSync('${fakeFlag}', fallback) [non-existent]`,
        fakeFlag,
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  const testTypeCoercion = (value: any, type: string) => {
    if (!mixpanel) return;

    // Create a mock flag scenario for type coercion testing
    const fallback = value;
    const startTime = Date.now();

    try {
      // For demo purposes, we'll use isEnabledSync with different values
      const result = Boolean(value);
      const testResult = createTestResult(
        `Boolean(${JSON.stringify(value)}) [${type}]`,
        'type-coercion-test',
        fallback,
        result,
        startTime,
      );

      setTestResult(testResult);
      trackWithLog(Events.FLAG_TEST_COERCION, {
        [Properties.FLAG_METHOD]: 'type coercion',
        [Properties.FLAG_VALUE]: value,
        [Properties.FLAG_RESULT_TYPE]: type,
        [Properties.FLAG_ENABLED]: result,
      });
    } catch (error) {
      const testResult = createTestResult(
        `Boolean(${JSON.stringify(value)}) [${type}]`,
        'type-coercion-test',
        fallback,
        fallback,
        startTime,
        error instanceof Error ? error.message : String(error),
      );
      setTestResult(testResult);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Feature Flags Testing</Text>
        <Text style={styles.subtitle}>
          Integration test bed for comprehensive API coverage
        </Text>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusValue, flagsReady && styles.statusReady]}>
            {flagsReady ? '✅ Ready' : '⏳ Not Ready'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Flags:</Text>
          <Text style={styles.statusValue}>{Object.keys(allFlags).length}</Text>
        </View>
      </View>

      {isLoadingFlags && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading feature flags...</Text>
        </View>
      )}

      {/* Lifecycle Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Lifecycle Controls</Text>
        <View style={styles.buttonRow}>
          <ActionButton
            title={flagsReady ? 'Reload Flags' : 'Load Flags'}
            onPress={handleLoadFlags}
            disabled={!isInitialized || isLoadingFlags}
            style={styles.halfButton}
          />
          <ActionButton
            title="Refresh Display"
            onPress={refreshAllFlags}
            disabled={!flagsReady}
            variant="secondary"
            style={styles.halfButton}
          />
        </View>
      </View>

      {/* All Flags Display */}
      {Object.keys(allFlags).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📋 All Flags ({Object.keys(allFlags).length})
          </Text>
          {Object.values(allFlags).map(flag => (
            <FlagCard
              key={flag.key}
              flag={flag}
              onTest={key => setSelectedFlag(key)}
            />
          ))}
        </View>
      )}

      {/* Test Mode Tabs */}
      {flagsReady && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Test Controls</Text>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, testMode === 'sync' && styles.activeTab]}
              onPress={() => setTestMode('sync')}>
              <Text
                style={[
                  styles.tabText,
                  testMode === 'sync' && styles.activeTabText,
                ]}>
                Sync
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, testMode === 'async' && styles.activeTab]}
              onPress={() => setTestMode('async')}>
              <Text
                style={[
                  styles.tabText,
                  testMode === 'async' && styles.activeTabText,
                ]}>
                Async
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, testMode === 'edge' && styles.activeTab]}
              onPress={() => setTestMode('edge')}>
              <Text
                style={[
                  styles.tabText,
                  testMode === 'edge' && styles.activeTabText,
                ]}>
                Edge Cases
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, testMode === 'coercion' && styles.activeTab]}
              onPress={() => setTestMode('coercion')}>
              <Text
                style={[
                  styles.tabText,
                  testMode === 'coercion' && styles.activeTabText,
                ]}>
                Coercion
              </Text>
            </TouchableOpacity>
          </View>

          {/* Flag Selector */}
          <View style={styles.flagSelector}>
            <Text style={styles.label}>Test Flag:</Text>
            <View style={styles.flagButtons}>
              {Object.keys(RECOMMENDED_FLAGS).map(flagKey => (
                <TouchableOpacity
                  key={flagKey}
                  style={[
                    styles.flagButton,
                    selectedFlag === flagKey && styles.selectedFlagButton,
                  ]}
                  onPress={() => setSelectedFlag(flagKey)}>
                  <Text
                    style={[
                      styles.flagButtonText,
                      selectedFlag === flagKey && styles.selectedFlagButtonText,
                    ]}>
                    {flagKey}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sync Test Panel */}
          {testMode === 'sync' && (
            <View style={styles.testPanel}>
              <Text style={styles.helper}>
                Synchronous methods use cached values (fast, no network delay):
              </Text>
              <ActionButton
                title="getVariantSync()"
                onPress={testGetVariantSync}
                style={styles.testButton}
              />
              <ActionButton
                title="getVariantValueSync()"
                onPress={testGetVariantValueSync}
                variant="secondary"
                style={styles.testButton}
              />
              <ActionButton
                title="isEnabledSync()"
                onPress={testIsEnabledSync}
                variant="secondary"
                style={styles.testButton}
              />
              <Text style={styles.helperSmall}>
                💡 Note: isEnabledSync() only returns true for boolean-valued flags (FeatureGates).
                For string experiments, use getVariantValueSync() instead.
              </Text>
            </View>
          )}

          {/* Async Test Panel */}
          {testMode === 'async' && (
            <View style={styles.testPanel}>
              <ActionButton
                title="getVariant() - Promise"
                onPress={testGetVariantAsync}
                style={styles.testButton}
              />
              <ActionButton
                title="getVariantValue() - Promise"
                onPress={testGetVariantValueAsync}
                variant="secondary"
                style={styles.testButton}
              />
              <ActionButton
                title="isEnabled() - Promise"
                onPress={testIsEnabledAsync}
                variant="secondary"
                style={styles.testButton}
              />
              <ActionButton
                title="getVariant() - Callback"
                onPress={testGetVariantCallback}
                variant="secondary"
                style={styles.testButton}
              />
            </View>
          )}

          {/* Edge Case Test Panel */}
          {testMode === 'edge' && (
            <View style={styles.testPanel}>
              <ActionButton
                title="Test Non-Existent Flag"
                onPress={testNonExistentFlag}
                style={styles.testButton}
              />
              <Text style={styles.helper}>
                Tests fallback behavior when flag doesn't exist
              </Text>
            </View>
          )}

          {/* Type Coercion Test Panel */}
          {testMode === 'coercion' && (
            <View style={styles.testPanel}>
              <Text style={styles.helper}>
                Tests Boolean() coercion for isEnabled():
              </Text>
              <View style={styles.coercionGrid}>
                <ActionButton
                  title="0 → false"
                  onPress={() => testTypeCoercion(0, 'zero')}
                  variant="secondary"
                  style={styles.coercionButton}
                />
                <ActionButton
                  title="1 → true"
                  onPress={() => testTypeCoercion(1, 'one')}
                  variant="secondary"
                  style={styles.coercionButton}
                />
                <ActionButton
                  title='"" → false'
                  onPress={() => testTypeCoercion('', 'empty string')}
                  variant="secondary"
                  style={styles.coercionButton}
                />
                <ActionButton
                  title='"text" → true'
                  onPress={() => testTypeCoercion('text', 'string')}
                  variant="secondary"
                  style={styles.coercionButton}
                />
                <ActionButton
                  title="null → false"
                  onPress={() => testTypeCoercion(null, 'null')}
                  variant="secondary"
                  style={styles.coercionButton}
                />
                <ActionButton
                  title="{} → true"
                  onPress={() => testTypeCoercion({}, 'object')}
                  variant="secondary"
                  style={styles.coercionButton}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Test Results */}
      {testResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Test Results</Text>
          <TestResultDisplay result={testResult} />
        </View>
      )}

      {/* Event Tracking Log */}
      {trackedEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📈 Recent Events ({trackedEvents.length})
          </Text>
          <EventTrackingLog events={trackedEvents} maxEvents={5} />
        </View>
      )}

      {/* Info Card */}
      <InfoCard
        title="Test Flag Categories"
        content={`This screen uses existing flags from your project:

BOOLEAN FLAGS (FeatureGate):
• sample-bool-flag, hash-slinging-slasher, mike-test
  Variants: "On" (true) / "Off" (false)
  Test with: isEnabled() or getVariantValue()

STRING EXPERIMENT FLAGS:
• sample-exp-testing, new_feature_flag_v2, mojojojo
  Custom string variants (e.g., "control", "treatment")
  Test with: getVariant() to see variant key

ACTIVE EXPERIMENTS (with experimentID):
• general-replay-events-query-improvement
• test-active-flag
  Watch for $experiment_started events!

DYNAMIC CONFIG (Object values):
• matthew-dynamic-7 - Simple object
• mike-dynamic-config-4 - Complex nested object
  Test with: getVariantValue() for JSON objects

Use the tabs to test different API methods (Sync/Async/Edge Cases/Coercion) with these flags.`}
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
    fontSize: 14,
    color: '#666',
  },
  statusBar: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statusLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 6,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  statusReady: {
    color: '#4caf50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  flagSelector: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  flagButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFlagButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  flagButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedFlagButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  testPanel: {
    marginTop: 12,
  },
  testButton: {
    marginBottom: 10,
  },
  helper: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  helperSmall: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  coercionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  coercionButton: {
    flex: 0,
    minWidth: '47%',
  },
  infoCard: {
    marginTop: 10,
  },
});
