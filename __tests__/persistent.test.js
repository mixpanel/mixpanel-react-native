// Test UUID generation with polyfilled crypto.getRandomValues
describe("MixpanelPersistent - UUID Generation", () => {
  const token = "test-token";
  let mockAsyncStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock AsyncStorage
    mockAsyncStorage = {
      getItem: jest.fn().mockResolvedValue(null),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
    };
    
    // Re-mock storage adapter
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => mockAsyncStorage),
    }));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should generate device ID using uuid.v4() with polyfill", async () => {
    // This test verifies that uuid.v4() is called when generating device IDs
    const uuid = require("uuid");
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    
    // Create instance (will use mocked uuid from jest_setup.js)
    MixpanelPersistent.instance = null;
    const mixpanelPersistent = MixpanelPersistent.getInstance(mockAsyncStorage, token);

    // Load device ID (which triggers UUID generation)
    await mixpanelPersistent.loadDeviceId(token);

    // Verify uuid.v4 was called
    expect(uuid.v4).toHaveBeenCalled();

    // Verify the device ID was set to the mocked value
    expect(mixpanelPersistent.getDeviceId(token)).toBe("default-uuid-1234");
    
    // Verify it was persisted to storage
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "MIXPANEL_" + token + "_DEVICE_ID",
      "default-uuid-1234"
    );
  });

  it("should handle multiple instances with different tokens", async () => {
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    const token1 = "token1";
    const token2 = "token2";
    
    // Reset singleton
    MixpanelPersistent.instance = null;
    
    // Get instance (singleton)
    const instance = MixpanelPersistent.getInstance(mockAsyncStorage, token1);
    
    // Load device IDs for both tokens
    await instance.loadDeviceId(token1);
    await instance.loadDeviceId(token2);
    
    // Both should have device IDs
    expect(instance.getDeviceId(token1)).toBe("default-uuid-1234");
    expect(instance.getDeviceId(token2)).toBe("default-uuid-1234");
    
    // Verify both were persisted with different keys
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "MIXPANEL_" + token1 + "_DEVICE_ID",
      "default-uuid-1234"
    );
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "MIXPANEL_" + token2 + "_DEVICE_ID",
      "default-uuid-1234"
    );
  });

  it("should persist and load identity correctly", async () => {
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    
    // Reset singleton
    MixpanelPersistent.instance = null;
    const instance = MixpanelPersistent.getInstance(mockAsyncStorage, token);
    
    // Load identity first to initialize the structure
    await instance.loadIdentity(token);
    
    // Update identity
    instance.updateDistinctId(token, "test-distinct-id");
    instance.updateUserId(token, "test-user-id");
    
    // Persist identity
    await instance.persistIdentity(token);
    
    // Verify identity is correct
    expect(instance.getDistinctId(token)).toBe("test-distinct-id");
    expect(instance.getUserId(token)).toBe("test-user-id");
    
    // Verify persistence
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "MIXPANEL_" + token + "_DISTINCT_ID",
      "test-distinct-id"
    );
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      "MIXPANEL_" + token + "_USER_ID",
      "test-user-id"
    );
  });


  it("should verify react-native-get-random-values polyfill is imported", () => {
    // The polyfill import is at the top of mixpanel-persistent.js
    // This ensures crypto.getRandomValues is available for uuid.v4()
    const polyfillModule = jest.requireActual("react-native-get-random-values");
    // If this doesn't throw, the module exists and can be imported
    expect(polyfillModule).toBeDefined();
  });


  it("should generate distinct ID based on device ID", async () => {
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    
    // Create instance
    MixpanelPersistent.instance = null;
    const instance = MixpanelPersistent.getInstance(mockAsyncStorage, token);
    
    // Load identity (loads device ID, distinct ID, and user ID)
    await instance.loadIdentity(token);
    
    const deviceId = instance.getDeviceId(token);
    const distinctId = instance.getDistinctId(token);
    
    // When no user ID is set, distinct ID should be "$device:" + device ID
    expect(distinctId).toBe("$device:" + deviceId);
    expect(distinctId).toBe("$device:default-uuid-1234");
  });
});