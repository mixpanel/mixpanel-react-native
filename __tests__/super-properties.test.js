jest.mock("mixpanel-react-native/javascript/mixpanel-core", () => ({
  MixpanelCore: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    startProcessingQueue: jest.fn(),
    addToMixpanelQueue: jest.fn(),
    flush: jest.fn(),
    identifyUserQueue: jest.fn(),
  })),
}));

jest.mock("mixpanel-react-native/javascript/mixpanel-network", () => ({
  MixpanelNetwork: {
    sendRequest: jest.fn(),
  },
}));

jest.mock("mixpanel-react-native/javascript/mixpanel-config", () => ({
  MixpanelConfig: {
    getInstance: jest.fn().mockReturnValue({
      getFlushInterval: jest.fn().mockReturnValue(1000),
      getFlushBatchSize: jest.fn().mockReturnValue(50),
      getServerURL: jest.fn(),
      getUseIpAddressForGeolocation: jest.fn(),
      setLoggingEnabled: jest.fn(),
      getLoggingEnabled: jest.fn().mockReturnValue(true),
      setServerURL: jest.fn(),
      setGzipCompression: jest.fn(),
      getOptedOut: jest.fn(),
      setOptedOut: jest.fn(),
      getOptOutTrackingDefault: jest.fn(),
      setOptOutTrackingDefault: jest.fn(),
      getDisableGestureBinding: jest.fn(),
      getDisableAppOpenEvent: jest.fn(),
      getDisableAutomaticEvents: jest.fn(),
      getFlagsConfig: jest.fn().mockReturnValue({}),
      getTestMode: jest.fn(),
      getLogAllRequests: jest.fn(),
      getDisabledEvents: jest.fn().mockReturnValue(new Set()),
    }),
  },
}));

const MixpanelMain =
  require("mixpanel-react-native/javascript/mixpanel-main").default;
const {
  MixpanelPersistent,
} = require("mixpanel-react-native/javascript/mixpanel-persistent");
const {
  getSuperPropertiesKey,
} = require("mixpanel-react-native/javascript/mixpanel-constants");

// Storage whose getItem calls stay pending until the test releases them. The
// stored value is read at release time, so a test can control what the storage
// layer "saw" once a slow AsyncStorage read finally lands.
const createControllableStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial));
  const pendingReads = [];
  return {
    getItem: jest.fn(
      (key) =>
        new Promise((resolve) => {
          pendingReads.push(() =>
            resolve(map.has(key) ? map.get(key) : null)
          );
        })
    ),
    setItem: jest.fn((key, value) => {
      map.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      map.delete(key);
      return Promise.resolve();
    }),
    _map: map,
    _pendingReads: pendingReads,
    _releaseReads() {
      pendingReads.splice(0).forEach((release) => release());
    },
  };
};

const flushAsync = async () => {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
};

describe("MixpanelMain super properties ordering", () => {
  const token = "test-token";

  beforeEach(() => {
    MixpanelPersistent.instance = null;
    jest.clearAllMocks();
  });

  it("applies every unregisterSuperProperty call when a storage load resolves mid-sequence", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({
        superProp1: "value1",
        superProp2: "value2",
        superProp3: "value3",
      }),
    });

    const mixpanelMain = new MixpanelMain(token, false, storage);

    // Let the constructor's initial loadSuperProperties finish.
    storage._releaseReads();
    await flushAsync();
    expect(mixpanelMain.mixpanelPersistent.getSuperProperties(token)).toEqual({
      superProp1: "value1",
      superProp2: "value2",
      superProp3: "value3",
    });

    // A second load is still in flight (initialize() and the lazy
    // getSuperProperties path can leave one pending) while the public API
    // fires unregisters without awaiting them.
    const inflightLoad =
      mixpanelMain.mixpanelPersistent.loadSuperProperties(token);

    mixpanelMain.unregisterSuperProperty(token, "superProp1");
    await flushAsync();

    // The in-flight read now lands, observing storage after only the first
    // removal, and its result is written over the in-memory map.
    storage._releaseReads();
    mixpanelMain.unregisterSuperProperty(token, "superProp2");
    mixpanelMain.unregisterSuperProperty(token, "superProp3");
    await inflightLoad;
    await flushAsync();

    expect(await mixpanelMain.getSuperProperties(token)).toEqual({});
    expect(
      JSON.parse(storage._map.get(getSuperPropertiesKey(token)))
    ).toEqual({});
  });

  it("keeps properties registered while a storage load is in flight", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({
        superProp1: "value1",
      }),
    });

    const mixpanelMain = new MixpanelMain(token, false, storage);

    // Registration lands while the constructor's initial load is still
    // reading storage; the late read must not overwrite the new property.
    const pending = mixpanelMain.registerSuperProperties(token, {
      superProp2: "value2",
    });
    storage._releaseReads();
    await pending;
    await flushAsync();

    expect(await mixpanelMain.getSuperProperties(token)).toEqual({
      superProp1: "value1",
      superProp2: "value2",
    });
  });

  it("applies unregisterSuperProperty calls made before the initial load finishes", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({
        superProp1: "value1",
        superProp2: "value2",
      }),
    });

    const mixpanelMain = new MixpanelMain(token, false, storage);

    // The initial load is still in flight; this call must not throw or get
    // lost once storage resolves.
    const pending = mixpanelMain.unregisterSuperProperty(token, "superProp1");
    storage._releaseReads();
    await pending;
    await flushAsync();

    expect(await mixpanelMain.getSuperProperties(token)).toEqual({
      superProp2: "value2",
    });
  });
});
