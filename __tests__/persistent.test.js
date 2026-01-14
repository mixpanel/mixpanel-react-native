// Test UUID generation with uuid v9
describe("MixpanelPersistent - UUID Generation", () => {
  const token = "test-token";

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should generate device ID using uuid.v4() with polyfill", async () => {
    // Set up mocks before requiring modules
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      })),
    }));

    jest.doMock("uuid", () => ({
      v4: jest.fn(() => "polyfilled-uuid-1234"),
    }));

    // Now require the modules
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    const uuid = require("uuid");

    // Create instance
    MixpanelPersistent.instance = null;
    const mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

    // Load device ID (which triggers UUID generation)
    await mixpanelPersistent.loadDeviceId(token);

    // Verify uuid.v4 was called
    expect(uuid.v4).toHaveBeenCalled();

    // Verify the device ID was set
    expect(mixpanelPersistent.getDeviceId(token)).toBe("polyfilled-uuid-1234");
  });

  it("should use uuid v9 named export correctly", async () => {
    // This test verifies that our uuid v9 import pattern works
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      })),
    }));

    // uuid v9 exports v4 as a named export
    jest.doMock("uuid", () => ({
      v4: jest.fn(() => "uuid-v9-style-id"),
    }));

    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");

    MixpanelPersistent.instance = null;
    const mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

    await mixpanelPersistent.loadDeviceId(token);

    // Verify the device ID uses the uuid v9 mock
    expect(mixpanelPersistent.getDeviceId(token)).toBe("uuid-v9-style-id");
  });
});
