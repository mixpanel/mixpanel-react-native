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

  it.each([
    [
      "a registration",
      (m) => [m.registerSuperProperties(token, { source: "ad" })],
      { plan: "free", source: "ad" },
    ],
    [
      "an unregister",
      (m) => [m.unregisterSuperProperty(token, "plan")],
      {},
    ],
    [
      "registerSuperPropertiesOnce",
      (m) => [
        m.registerSuperPropertiesOnce(token, { plan: "paid", source: "ad" }),
      ],
      { plan: "free", source: "ad" },
    ],
    [
      "two registrations",
      (m) => [
        m.registerSuperProperties(token, { a: 1 }),
        m.registerSuperProperties(token, { b: 2 }),
      ],
      { plan: "free", a: 1, b: 2 },
    ],
    [
      "a clear after a registration",
      (m) => [
        m.registerSuperProperties(token, { plan: "paid" }),
        m.clearSuperProperties(token),
      ],
      {},
    ],
  ])("applies %s made before the initial load finishes", async (_, run, expected) => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({ plan: "free" }),
    });
    const mixpanelMain = new MixpanelMain(token, false, storage);

    const pending = run(mixpanelMain);
    storage._releaseReads();
    await Promise.all(pending);
    await flushAsync();

    expect(await mixpanelMain.getSuperProperties(token)).toEqual(expected);
    expect(
      JSON.parse(storage._map.get(getSuperPropertiesKey(token)))
    ).toEqual(expected);
  });

  it("applies reset after a registration made while the initial load is in flight", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({ plan: "free" }),
    });
    const mixpanelMain = new MixpanelMain(token, false, storage);

    mixpanelMain.registerSuperProperties(token, { plan: "paid" });
    let resetDone = false;
    mixpanelMain.reset(token).then(() => {
      resetDone = true;
    });
    while (!resetDone) {
      storage._releaseReads();
      await flushAsync();
    }

    expect(mixpanelMain.mixpanelPersistent.getSuperProperties(token)).toEqual(
      {}
    );
    expect(storage._map.has(getSuperPropertiesKey(token))).toBe(false);
  });

  it("keeps the anonymous identity on an event tracked before identify while super properties load", async () => {
    const storage = createControllableStorage();
    const mixpanelMain = new MixpanelMain(token, false, storage);
    for (let i = 0; i < 5; i++) {
      storage._releaseReads();
      await flushAsync();
    }
    const anonymousId = mixpanelMain.mixpanelPersistent.getDistinctId(token);
    // Identity is loaded but super properties are not.
    delete mixpanelMain.mixpanelPersistent._superProperties[token];

    mixpanelMain.registerSuperProperties(token, { plan: "paid" });
    const track = mixpanelMain.track(token, "BeforeLogin");
    const identify = mixpanelMain.identify(token, "new-user");
    storage._releaseReads();
    await Promise.all([track, identify]);

    const [, , eventData] = mixpanelMain.core.addToMixpanelQueue.mock.calls[0];
    expect(eventData.event).toBe("BeforeLogin");
    expect(eventData.properties.distinct_id).toBe(anonymousId);
    expect(eventData.properties.plan).toBe("paid");
  });

  it("resolves getSuperProperties with changes issued while the initial load is in flight", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({ plan: "free" }),
    });
    const mixpanelMain = new MixpanelMain(token, false, storage);

    mixpanelMain.registerSuperProperties(token, { source: "ad" });
    const read = mixpanelMain.getSuperProperties(token);
    storage._releaseReads();

    expect(await read).toEqual({ plan: "free", source: "ad" });
  });

  it("applies optOutTracking after a registration made while the initial load is in flight", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({ plan: "free" }),
    });
    const mixpanelMain = new MixpanelMain(token, false, storage);

    // The registration's lazy-load read resolves only when the test releases
    // it, like a slow AsyncStorage read landing while opt-out's reset runs.
    let resolveRegisterRead;
    storage.getItem.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRegisterRead = () => resolve(JSON.stringify({ plan: "free" }));
        })
    );
    mixpanelMain.registerSuperProperties(token, { plan: "paid" });

    let optOutDone = false;
    mixpanelMain.optOutTracking(token).then(() => {
      optOutDone = true;
    });
    for (let i = 0; !optOutDone && i < 50; i++) {
      storage._releaseReads();
      await flushAsync();
      if (i === 1) {
        resolveRegisterRead();
      }
    }
    await flushAsync();

    expect(mixpanelMain.mixpanelPersistent.getSuperProperties(token)).toEqual(
      {}
    );
    expect(storage._map.has(getSuperPropertiesKey(token))).toBe(false);
  });

  it("applies a registration made while a reset is still running", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({ plan: "free" }),
    });
    const mixpanelMain = new MixpanelMain(token, false, storage);
    storage._releaseReads();
    await flushAsync();

    let resetDone = false;
    mixpanelMain.reset(token).then(() => {
      resetDone = true;
    });
    mixpanelMain.registerSuperProperties(token, { source: "ad" });
    while (!resetDone) {
      storage._releaseReads();
      await flushAsync();
    }
    await flushAsync();

    expect(await mixpanelMain.getSuperProperties(token)).toEqual({
      source: "ad",
    });
    expect(
      JSON.parse(storage._map.get(getSuperPropertiesKey(token)))
    ).toEqual({ source: "ad" });
  });

  it("applies a change queued behind a change whose storage read failed", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({ plan: "free" }),
    });
    const mixpanelMain = new MixpanelMain(token, false, storage);

    storage.getItem.mockImplementationOnce(() =>
      Promise.reject(new Error("storage read failed"))
    );
    await expect(
      mixpanelMain.registerSuperProperties(token, { a: 1 })
    ).rejects.toThrow("storage read failed");

    const second = mixpanelMain.registerSuperProperties(token, { b: 2 });
    storage._releaseReads();
    await second;

    expect(await mixpanelMain.getSuperProperties(token)).toEqual({
      plan: "free",
      b: 2,
    });
  });

  it("does not let a read started before reset restore the cleared properties", async () => {
    const storage = createControllableStorage({
      [getSuperPropertiesKey(token)]: JSON.stringify({ plan: "paid" }),
    });
    const mixpanelMain = new MixpanelMain(token, false, storage);
    storage._releaseReads();
    await flushAsync();

    // This read sees the value from before reset but lands after it.
    let resolveStaleRead;
    storage.getItem.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStaleRead = () => resolve(JSON.stringify({ plan: "paid" }));
        })
    );
    const staleLoad =
      mixpanelMain.mixpanelPersistent.loadSuperProperties(token);

    let resetDone = false;
    mixpanelMain.reset(token).then(() => {
      resetDone = true;
    });
    while (!resetDone) {
      storage._releaseReads();
      await flushAsync();
    }
    resolveStaleRead();
    await staleLoad;

    expect(mixpanelMain.mixpanelPersistent.getSuperProperties(token)).toEqual(
      {}
    );
  });
});
