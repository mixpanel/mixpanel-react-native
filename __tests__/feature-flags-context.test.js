/**
 * Test for Feature Flags Context Bug in JavaScript Mode
 * This test verifies that the context provided during initialization
 * is properly passed to the JavaScript implementation of feature flags
 */

// Clear any cached modules to ensure our mocks take effect
jest.resetModules();

// Mock React Native to simulate JavaScript mode (no native modules)
jest.mock('react-native', () => ({
  NativeModules: {}, // Empty to simulate no native modules
  Platform: { OS: 'ios' },
  NativeEventEmitter: jest.fn()
}));

// Mock uuid to return a consistent value for device ID generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-device-id-1234')
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

// Track the last network request made
let lastFetchRequest = null;

// Mock fetch to capture network requests
global.fetch = jest.fn((url) => {
  lastFetchRequest = { url, parsedUrl: new URL(url) };
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      flags: {
        'test-flag': {
          variant_key: 'treatment',
          variant_value: true,
          experiment_id: 'exp-123',
          is_experiment_active: true,
          is_qa_tester: false
        }
      }
    })
  });
});

// Require Mixpanel after mocks are set up
// Use isolateModules to ensure we get a fresh copy with our mocks
let Mixpanel;
jest.isolateModules(() => {
  const module = require('../index');
  Mixpanel = module.Mixpanel;
});

describe('Feature Flags Context Bug - JavaScript Mode', () => {
  let mixpanel;

  // Force test to exit by using --forceExit
  // JavaScript implementation has background intervals that need to be cleared

  beforeEach(() => {
    // Clear all mocks and reset state
    jest.clearAllMocks();
    lastFetchRequest = null;
    // Don't use fake timers - they cause issues with async operations
    // Tests will need --forceExit due to background intervals in JS implementation
  });

  afterEach(async () => {
    // Clean up to prevent hanging
    if (mixpanel) {
      // Call reset to cleanup any background operations
      if (mixpanel.mixpanelImpl && mixpanel.mixpanelImpl.reset) {
        await mixpanel.mixpanelImpl.reset(mixpanel.token);
      }
    }

    // Clear references
    mixpanel = null;
  });

  describe('Context Initialization Bug', () => {
    it('should apply context from init() to flag requests in JavaScript mode', async () => {
      // Setup: Create Mixpanel in JavaScript mode with context
      const expectedContext = {
        platform: 'mobile',
        user_tier: 'premium',
        app_version: '2.0.0'
      };

      mixpanel = new Mixpanel('context-test-token', false, false, mockAsyncStorage);

      // Initialize with feature flags enabled and context
      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true,
        context: expectedContext
      });

      // Act: Load feature flags (this should make a network request)
      await mixpanel.flags.loadFlags();

      // Assert: Verify that the network request was made
      expect(global.fetch).toHaveBeenCalled();
      expect(lastFetchRequest).not.toBeNull();

      // Extract the context from the query parameters
      const contextParam = lastFetchRequest.parsedUrl.searchParams.get('context');
      expect(contextParam).toBeDefined();

      // Parse the context JSON
      const sentContext = JSON.parse(contextParam);

      // Verify the user-provided context was included
      expect(sentContext).toMatchObject({
        platform: 'mobile',
        user_tier: 'premium',
        app_version: '2.0.0'
      });
    });

    it('should merge context with distinct_id and device_id in flag requests', async () => {
      const userContext = {
        environment: 'staging',
        feature_set: 'beta'
      };

      mixpanel = new Mixpanel('merge-test-token', false, false, mockAsyncStorage);

      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true,
        context: userContext
      });

      // Load flags
      await mixpanel.flags.loadFlags();

      // Verify request was made
      expect(global.fetch).toHaveBeenCalled();
      expect(lastFetchRequest).not.toBeNull();

      // Parse the context from the request
      const contextParam = lastFetchRequest.parsedUrl.searchParams.get('context');
      const sentContext = JSON.parse(contextParam);

      // Should have user context plus system properties
      expect(sentContext).toMatchObject(userContext);
      expect(sentContext).toHaveProperty('distinct_id');
      expect(sentContext).toHaveProperty('device_id');
    });

    it('should update context dynamically after initialization', async () => {
      mixpanel = new Mixpanel('update-test-token', false, false, mockAsyncStorage);

      const initialContext = { version: '1.0' };

      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true,
        context: initialContext
      });

      // First load with initial context
      await mixpanel.flags.loadFlags();

      let contextParam = lastFetchRequest.parsedUrl.searchParams.get('context');
      let sentContext = JSON.parse(contextParam);
      expect(sentContext).toMatchObject(initialContext);

      // Update context
      const newContext = { version: '2.0', tier: 'gold' };
      await mixpanel.flags.updateContext(newContext, { replace: true });

      // Verify new request has updated context
      contextParam = lastFetchRequest.parsedUrl.searchParams.get('context');
      sentContext = JSON.parse(contextParam);

      // When replace:true, should only have new context (plus system props)
      expect(sentContext).toMatchObject(newContext);
      expect(sentContext.version).toBe('2.0');
      expect(sentContext).toHaveProperty('distinct_id');
      expect(sentContext).toHaveProperty('device_id');
    });
  });

  describe('Synchronous Flag Access with Context', () => {
    it('should use cached flags that were fetched with proper context', async () => {
      const context = { experiment_group: 'A' };

      mixpanel = new Mixpanel('sync-test-token', false, false, mockAsyncStorage);

      await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
        enabled: true,
        context: context
      });

      // Load flags with context
      await mixpanel.flags.loadFlags();

      // Verify context was sent
      const contextParam = lastFetchRequest.parsedUrl.searchParams.get('context');
      const sentContext = JSON.parse(contextParam);
      expect(sentContext).toMatchObject(context);

      // Now use synchronous access
      if (mixpanel.flags.areFlagsReady()) {
        const isEnabled = mixpanel.flags.isEnabledSync('test-flag', false);
        expect(isEnabled).toBe(true); // Based on our mock response
      }
    });
  });
});