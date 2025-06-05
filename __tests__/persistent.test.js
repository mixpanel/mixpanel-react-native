// Test UUID generation with polyfilled crypto.getRandomValues
describe("MixpanelPersistent - UUID Generation", () => {
  const token = "test-token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate device ID using uuid.v4() with polyfill", async () => {
    let mixpanelPersistent;
    
    await jest.isolateModules(async () => {
      // Mock uuid to return a specific value
      jest.doMock("uuid", () => ({
        v4: jest.fn(() => "polyfilled-uuid-1234"),
      }));

      // Now require the modules
      const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
      const uuid = require("uuid");

      // Create instance
      MixpanelPersistent.instance = null;
      mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

      // Load device ID (which triggers UUID generation)
      await mixpanelPersistent.loadDeviceId(token);

      // Verify uuid.v4 was called
      expect(uuid.v4).toHaveBeenCalled();

      // Verify the device ID was set
      expect(mixpanelPersistent.getDeviceId(token)).toBe("polyfilled-uuid-1234");
    });
  });

  it("should handle legacy device IDs without expo-crypto format", async () => {
    let mixpanelPersistent;
    
    await jest.isolateModules(async () => {
      // Create a mock storage with a legacy UUID
      const legacyUuid = "550e8400-e29b-41d4-a716-446655440000"; // Standard UUID v4 format
      const mockStorage = {};
      
      jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => {
        return {
          AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
            getItem: jest.fn((key) => {
              return Promise.resolve(mockStorage[key] || null);
            }),
            setItem: jest.fn((key, value) => {
              mockStorage[key] = value;
              return Promise.resolve();
            }),
            removeItem: jest.fn((key) => {
              delete mockStorage[key];
              return Promise.resolve();
            }),
          })),
        };
      });

      // Pre-populate storage with legacy device ID
      const deviceIdKey = `MIXPANEL_${token}_device_id`;
      mockStorage[deviceIdKey] = legacyUuid;

      const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
      
      // Create instance
      MixpanelPersistent.instance = null;
      mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

      // Load device ID from storage
      await mixpanelPersistent.loadDeviceId(token);

      // Verify the legacy device ID was loaded correctly
      expect(mixpanelPersistent.getDeviceId(token)).toBe(legacyUuid);
      
      // Verify it doesn't try to generate a new one
      const { randomUUID } = require("expo-crypto");
      const uuid = require("uuid");
      expect(randomUUID).not.toHaveBeenCalled();
      expect(uuid.v4).not.toHaveBeenCalled();
    });
  });

  it("should migrate from no device ID to expo-crypto format when available", async () => {
    let mixpanelPersistent;
    
    await jest.isolateModules(async () => {
      const mockStorage = {};
      
      jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => {
        return {
          AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
            getItem: jest.fn((key) => Promise.resolve(mockStorage[key] || null)),
            setItem: jest.fn((key, value) => {
              mockStorage[key] = value;
              return Promise.resolve();
            }),
            removeItem: jest.fn((key) => {
              delete mockStorage[key];
              return Promise.resolve();
            }),
          })),
        };
      });

      // Mock expo-crypto to return a specific value
      jest.doMock("expo-crypto", () => ({
        randomUUID: jest.fn(() => "expo-generated-uuid"),
      }));

      const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
      const { randomUUID } = require("expo-crypto");
      
      // Create instance with no existing device ID
      MixpanelPersistent.instance = null;
      mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

      // Load device ID (should generate new one)
      await mixpanelPersistent.loadDeviceId(token);

      // Verify expo-crypto was used for new device ID
      expect(randomUUID).toHaveBeenCalled();
      expect(mixpanelPersistent.getDeviceId(token)).toBe("expo-generated-uuid");
      
      // Verify it was persisted to storage
      const deviceIdKey = `MIXPANEL_${token}_device_id`;
      expect(mockStorage[deviceIdKey]).toBe("expo-generated-uuid");
    });
  });

  it("should handle storage failures gracefully during identity persistence", async () => {
    let mixpanelPersistent;
    
    await jest.isolateModules(async () => {
      let shouldFail = false;
      
      jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => {
        return {
          AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
            getItem: jest.fn(() => Promise.resolve(null)),
            setItem: jest.fn((key, value) => {
              if (shouldFail) {
                return Promise.reject(new Error("Storage write failed"));
              }
              return Promise.resolve();
            }),
            removeItem: jest.fn(() => Promise.resolve()),
          })),
        };
      });

      // Mock expo-crypto
      jest.doMock("expo-crypto", () => ({
        randomUUID: jest.fn(() => "test-uuid-12345"),
      }));

      const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
      
      // Create instance
      MixpanelPersistent.instance = null;
      mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

      // First load should work (storage not failing yet)
      await mixpanelPersistent.loadDeviceId(token);
      expect(mixpanelPersistent.getDeviceId(token)).toBe("test-uuid-12345");

      // Now make storage fail
      shouldFail = true;

      // Update identity and try to persist - should not throw
      mixpanelPersistent.updateDistinctId(token, "new-distinct-id");
      mixpanelPersistent.updateUserId(token, "new-user-id");
      
      // This should not throw even if storage fails
      await expect(mixpanelPersistent.persistIdentity(token)).resolves.not.toThrow();
      
      // Identity should still be in memory even if storage failed
      expect(mixpanelPersistent.getDistinctId(token)).toBe("new-distinct-id");
      expect(mixpanelPersistent.getUserId(token)).toBe("new-user-id");
      expect(mixpanelPersistent.getDeviceId(token)).toBe("test-uuid-12345");
    });
  });

  it("should continue working if storage read fails", async () => {
    let mixpanelPersistent;
    
    await jest.isolateModules(async () => {
      jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => {
        return {
          AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
            getItem: jest.fn(() => Promise.reject(new Error("Storage read failed"))),
            setItem: jest.fn(() => Promise.resolve()),
            removeItem: jest.fn(() => Promise.resolve()),
          })),
        };
      });

      // Mock expo-crypto
      jest.doMock("expo-crypto", () => ({
        randomUUID: jest.fn(() => "fallback-uuid"),
      }));

      const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
      
      // Create instance
      MixpanelPersistent.instance = null;
      mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

      // Loading should not throw even if storage fails
      await expect(mixpanelPersistent.loadDeviceId(token)).resolves.not.toThrow();
      
      // Should generate a new device ID since storage failed
      expect(mixpanelPersistent.getDeviceId(token)).toBe("fallback-uuid");
    });
  });
});