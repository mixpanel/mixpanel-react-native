/**
 * Tests for JavaScript mode feature flags functionality
 */

// Mock React Native to simulate JavaScript mode (no native modules)
jest.mock('react-native', () => ({
  NativeModules: {}, // Empty to simulate no native modules
  Platform: { OS: 'ios' },
  NativeEventEmitter: jest.fn()
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve())
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock fetch for network requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' })
  })
);

// Don't use fake timers - we'll handle cleanup manually

const { Mixpanel } = require('../index');

describe('Feature Flags - JavaScript Mode', () => {
  let mixpanel;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up to prevent hanging
    if (mixpanel) {
      // Call reset to clean up any pending operations
      if (mixpanel.mixpanelImpl && mixpanel.mixpanelImpl.reset) {
        mixpanel.mixpanelImpl.reset(mixpanel.token);
      }
    }
    mixpanel = null;
  });

  describe('JavaScript Mode Initialization', () => {
    it('should create Mixpanel instance in JavaScript mode', () => {
      // Pass AsyncStorage as the 4th parameter for JavaScript mode
      mixpanel = new Mixpanel('js-test-token', false, false, mockAsyncStorage);

      // Verify we're NOT using native module
      expect(mixpanel.mixpanelImpl.constructor.name).not.toBe('MixpanelReactNative');
    });

    it('should initialize with feature flags enabled', async () => {
      mixpanel = new Mixpanel('js-test-token', false, false, mockAsyncStorage);

      // init doesn't return a value, just await it
      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true,
        context: {
          user_type: 'tester'
        }
      });

      // Check that flags property is accessible
      expect(mixpanel.flags).toBeDefined();
    });

    it('should access flags property without error in JavaScript mode', async () => {
      mixpanel = new Mixpanel('js-test-token', false, false, mockAsyncStorage);

      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true
      });

      // This should not throw an error with JavaScript mode enabled
      expect(() => mixpanel.flags).not.toThrow();
    });
  });

  describe('JavaScript Mode Flag Methods', () => {
    beforeEach(async () => {
      mixpanel = new Mixpanel('js-test-token', false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true
      });
    });

    describe('Synchronous Methods', () => {
      it('should handle areFlagsReady', () => {
        const ready = mixpanel.flags.areFlagsReady();
        expect(typeof ready).toBe('boolean');
      });

      it('should return fallback from getVariantSync', () => {
        const variant = mixpanel.flags.getVariantSync('test-flag', 'fallback-value');
        expect(variant).toBe('fallback-value');
      });

      it('should return fallback from getVariantValueSync', () => {
        const value = mixpanel.flags.getVariantValueSync('button-color', 'blue');
        expect(value).toBe('blue');
      });

      it('should return fallback from isEnabledSync', () => {
        const enabled = mixpanel.flags.isEnabledSync('new-feature', false);
        expect(enabled).toBe(false);
      });
    });

    describe('Asynchronous Methods', () => {
      it('should handle loadFlags gracefully', async () => {
        // loadFlags will fail in test environment (no real API)
        // but the method should exist and be callable
        expect(typeof mixpanel.flags.loadFlags).toBe('function');

        // Call it and let it fail gracefully (network error is expected)
        try {
          await mixpanel.flags.loadFlags();
        } catch (error) {
          // This is expected in test environment
          expect(error).toBeDefined();
        }
      });

      it('should return fallback from getVariant', async () => {
        const variant = await mixpanel.flags.getVariant('async-test', 'async-fallback');
        expect(variant).toBe('async-fallback');
      });

      it('should return fallback from getVariantValue', async () => {
        const value = await mixpanel.flags.getVariantValue('async-color', 'red');
        expect(value).toBe('red');
      });

      it('should return fallback from isEnabled', async () => {
        const enabled = await mixpanel.flags.isEnabled('async-feature', true);
        expect(enabled).toBe(true);
      });

      it('should support callback pattern', (done) => {
        mixpanel.flags.getVariant('callback-test', 'callback-fallback', (variant) => {
          expect(variant).toBe('callback-fallback');
          done();
        });
      });
    });

    describe('JavaScript-Specific Features', () => {
      it('should support updateContext method', async () => {
        // updateContext is JavaScript mode only
        expect(typeof mixpanel.flags.updateContext).toBe('function');

        // Call it - it should work in JS mode
        await mixpanel.flags.updateContext({
          user_type: 'premium',
          plan: 'enterprise'
        });

        // Verify the context was updated
        expect(mixpanel.flags.jsFlags.context).toEqual({
          user_type: 'premium',
          plan: 'enterprise'
        });
      });

      it('should support snake_case aliases', () => {
        expect(typeof mixpanel.flags.are_flags_ready).toBe('function');
        expect(typeof mixpanel.flags.get_variant_sync).toBe('function');
        expect(typeof mixpanel.flags.get_variant_value_sync).toBe('function');
        expect(typeof mixpanel.flags.is_enabled_sync).toBe('function');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      mixpanel = new Mixpanel('js-test-token', false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true
      });
    });

    it('should handle null feature names gracefully', () => {
      expect(() => mixpanel.flags.getVariantSync(null, 'fallback')).not.toThrow();
      const result = mixpanel.flags.getVariantSync(null, 'fallback');
      expect(result).toBe('fallback');
    });

    it('should handle undefined callbacks', async () => {
      await expect(
        mixpanel.flags.getVariant('test', 'fallback', undefined)
      ).resolves.not.toThrow();
    });
  });

  describe('Type Preservation', () => {
    beforeEach(async () => {
      mixpanel = new Mixpanel('js-test-token', false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true
      });
    });

    it('should preserve boolean types', async () => {
      const boolValue = await mixpanel.flags.getVariantValue('bool-flag', true);
      expect(typeof boolValue).toBe('boolean');
    });

    it('should preserve number types', async () => {
      const numValue = await mixpanel.flags.getVariantValue('num-flag', 42);
      expect(typeof numValue).toBe('number');
    });

    it('should preserve object types', async () => {
      const objValue = await mixpanel.flags.getVariantValue('obj-flag', { key: 'value' });
      expect(typeof objValue).toBe('object');
    });
  });
});