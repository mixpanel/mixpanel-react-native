#!/usr/bin/env node

/**
 * Test script to verify JavaScript mode feature flags functionality
 * This script simulates an environment where native modules are not available
 */

// Enable JavaScript mode for testing
process.env.MIXPANEL_ENABLE_JS_FLAGS = 'true';

// Mock React Native completely before any imports
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'react-native') {
    return {
      NativeModules: {},
      Platform: {
        OS: 'ios',
        select: (obj) => obj.ios || obj.default
      },
      NativeEventEmitter: class NativeEventEmitter {}
    };
  }
  // Mock expo-crypto as unavailable
  if (id === 'expo-crypto') {
    throw new Error('Module not found');
  }
  // Let uuid work normally
  return originalRequire.apply(this, arguments);
};

// Mock React Native modules
global.NativeModules = {};

// Mock AsyncStorage
const storage = new Map();
global.AsyncStorage = {
  getItem: async (key) => storage.get(key) || null,
  setItem: async (key, value) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  removeItem: async (key) => {
    storage.delete(key);
    return Promise.resolve();
  },
  getAllKeys: async () => Array.from(storage.keys()),
  multiGet: async (keys) => keys.map(key => [key, storage.get(key) || null]),
  multiSet: async (keyValuePairs) => {
    keyValuePairs.forEach(([key, value]) => storage.set(key, value));
    return Promise.resolve();
  },
  multiRemove: async (keys) => {
    keys.forEach(key => storage.delete(key));
    return Promise.resolve();
  }
};

// Import Mixpanel
const { Mixpanel } = require('./index.js');

async function testJavaScriptModeFlags() {
  console.log('🧪 Testing JavaScript Mode Feature Flags\n');
  console.log('===================================\n');

  try {
    // Create Mixpanel instance in JavaScript mode
    const mixpanel = new Mixpanel('test-token-123', false, false);
    console.log('✅ Created Mixpanel instance in JavaScript mode\n');

    // Verify we're in JavaScript mode
    const isNativeMode = mixpanel.mixpanelImpl.constructor.name === 'MixpanelReactNative';
    console.log(`Mode: ${isNativeMode ? 'Native' : 'JavaScript'} ✅\n`);

    // Initialize with feature flags enabled
    const success = await mixpanel.init(false, {
      featureFlagsOptions: {
        enabled: true,
        context: {
          user_type: 'tester',
          environment: 'development'
        }
      }
    });
    console.log(`Initialized: ${success ? '✅' : '❌'}\n`);

    // Access feature flags
    const flags = mixpanel.flags;
    console.log('✅ Accessed flags property without error\n');

    // Test synchronous methods
    console.log('Testing Synchronous Methods:');
    console.log('----------------------------');

    const ready = flags.areFlagsReady();
    console.log(`areFlagsReady(): ${ready}`);

    const variant = flags.getVariantSync('test-flag', 'fallback');
    console.log(`getVariantSync('test-flag'): ${variant}`);

    const value = flags.getVariantValueSync('button-color', 'blue');
    console.log(`getVariantValueSync('button-color'): ${value}`);

    const enabled = flags.isEnabledSync('new-feature', false);
    console.log(`isEnabledSync('new-feature'): ${enabled}\n`);

    // Test asynchronous methods
    console.log('Testing Asynchronous Methods:');
    console.log('-----------------------------');

    // Load flags (this will fail in test environment but should handle gracefully)
    try {
      await flags.loadFlags();
      console.log('loadFlags(): Success (unexpected)');
    } catch (error) {
      console.log('loadFlags(): Failed gracefully (expected in test) ✅');
    }

    // Test async variants with promises
    const asyncVariant = await flags.getVariant('async-test', 'async-fallback');
    console.log(`getVariant('async-test'): ${asyncVariant}`);

    const asyncValue = await flags.getVariantValue('async-color', 'red');
    console.log(`getVariantValue('async-color'): ${asyncValue}`);

    const asyncEnabled = await flags.isEnabled('async-feature', true);
    console.log(`isEnabled('async-feature'): ${asyncEnabled}\n`);

    // Test JavaScript-specific features
    console.log('Testing JavaScript-Specific Features:');
    console.log('------------------------------------');

    // Test updateContext (JavaScript mode only)
    try {
      await flags.updateContext({
        user_type: 'premium',
        plan: 'enterprise'
      });
      console.log('updateContext(): Success ✅');
    } catch (error) {
      console.log(`updateContext(): ${error.message}`);
    }

    // Test snake_case aliases
    console.log('\nTesting snake_case Aliases:');
    console.log('---------------------------');

    const snakeReady = flags.are_flags_ready();
    console.log(`are_flags_ready(): ${snakeReady}`);

    const snakeVariant = flags.get_variant_sync('snake-test', 'snake-fallback');
    console.log(`get_variant_sync(): ${snakeVariant}`);

    console.log('\n✅ All JavaScript mode feature flag tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
testJavaScriptModeFlags().catch(console.error);