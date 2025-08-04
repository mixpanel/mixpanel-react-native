// Test UUID generation with polyfilled crypto.getRandomValues
describe("MixpanelPersistent - UUID Generation", () => {
  const token = "test-token";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
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
    const mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

    // Load device ID (which triggers UUID generation)
    await mixpanelPersistent.loadDeviceId(token);

    // Verify uuid.v4 was called
    expect(uuid.v4).toHaveBeenCalled();

    // Verify the device ID was set to the mocked value
    expect(mixpanelPersistent.getDeviceId(token)).toBe("default-uuid-1234");
  });

  it("should handle multiple instances with different tokens", async () => {
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    const token1 = "token1";
    const token2 = "token2";
    
    // Reset singleton
    MixpanelPersistent.instance = null;
    
    // Get instance (singleton)
    const instance = MixpanelPersistent.getInstance(null, token1);
    
    // Load device IDs for both tokens
    await instance.loadDeviceId(token1);
    await instance.loadDeviceId(token2);
    
    // Both should have device IDs
    expect(instance.getDeviceId(token1)).toBe("default-uuid-1234");
    expect(instance.getDeviceId(token2)).toBe("default-uuid-1234");
  });

  it("should persist and load identity correctly", async () => {
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    
    // Reset singleton
    MixpanelPersistent.instance = null;
    const instance = MixpanelPersistent.getInstance(null, token);
    
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
  });
});