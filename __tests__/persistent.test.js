// Test device ID generation and loading
describe("MixpanelPersistent - device ID", () => {
  const token = "test-token";
  const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should generate and persist a UUID v4 device ID", async () => {
    const setItem = jest.fn().mockResolvedValue(undefined);
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        getItem: jest.fn().mockResolvedValue(null),
        setItem,
        removeItem: jest.fn().mockResolvedValue(undefined),
      })),
    }));

    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");

    MixpanelPersistent.instance = null;
    const mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

    await mixpanelPersistent.loadDeviceId(token);

    const deviceId = mixpanelPersistent.getDeviceId(token);
    expect(deviceId).toMatch(UUID_V4);
    expect(setItem).toHaveBeenCalledWith(`MIXPANEL_${token}_DEVICE_ID`, deviceId);
  });

  it("should load existing device ID from storage without regenerating", async () => {
    // This test ensures backward compatibility - existing users keep their device IDs
    const existingDeviceId = "550e8400-e29b-41d4-a716-446655440000";
    const deviceIdKey = `MIXPANEL_${token}_DEVICE_ID`;
    const setItem = jest.fn().mockResolvedValue(undefined);

    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        getItem: jest.fn().mockImplementation((key) => {
          // Only return the device ID for the device ID key
          if (key === deviceIdKey) {
            return Promise.resolve(existingDeviceId);
          }
          return Promise.resolve(null);
        }),
        setItem,
        removeItem: jest.fn().mockResolvedValue(undefined),
      })),
    }));

    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");

    MixpanelPersistent.instance = null;
    const mixpanelPersistent = MixpanelPersistent.getInstance(null, token);

    await mixpanelPersistent.loadDeviceId(token);

    // A new device ID should NOT be generated or saved when one already exists
    expect(setItem).not.toHaveBeenCalledWith(deviceIdKey, expect.anything());
    // Existing device ID should be loaded correctly
    expect(mixpanelPersistent.getDeviceId(token)).toBe(existingDeviceId);
  });
});

describe("MixpanelPersistent - time events", () => {
  const token = "test-token";
  const key = `MIXPANEL_${token}_TIME_EVENTS`;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const createPersistent = (store) => {
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        getItem: jest.fn().mockImplementation(async (k) => store[k] ?? null),
        setItem: jest.fn().mockImplementation(async (k, v) => {
          store[k] = v;
        }),
        removeItem: jest.fn().mockImplementation(async (k) => {
          delete store[k];
        }),
      })),
    }));
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    MixpanelPersistent.instance = null;
    return MixpanelPersistent.getInstance(null, token);
  };

  it("keeps a timer started while time events were loading", async () => {
    const persistent = createPersistent({ [key]: JSON.stringify({ stored: 1 }) });
    await persistent.initializationCompletePromise(token);

    const load = persistent.loadTimeEvents(token); // e.g. an un-awaited init()
    persistent.updateTimeEvents(token, {
      ...persistent.getTimeEvents(token),
      started: 2,
    });
    await load;

    expect(persistent.getTimeEvents(token)).toEqual({ stored: 1, started: 2 });
  });

  it("clears time events on reset", async () => {
    const persistent = createPersistent({ [key]: JSON.stringify({ stored: 1 }) });
    await persistent.initializationCompletePromise(token);

    await persistent.reset(token);

    expect(persistent.getTimeEvents(token)).toEqual({});
  });
});
