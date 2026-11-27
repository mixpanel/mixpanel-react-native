// Uses the real MixpanelPersistent with slow storage to cover calls made
// right after an un-awaited init(), as shown in the README.
describe("MixpanelMain - identify and init() loading", () => {
  const token = "test-token";
  let addToMixpanelQueue;

  const createMain = (store = {}) => {
    jest.resetModules();
    addToMixpanelQueue = jest.fn();
    jest.doMock("mixpanel-react-native/javascript/mixpanel-core", () => ({
      MixpanelCore: jest.fn().mockImplementation(() => ({
        initialize: jest.fn(),
        startProcessingQueue: jest.fn(),
        addToMixpanelQueue,
        identifyUserQueue: jest.fn(),
      })),
    }));
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        getItem: jest.fn((key) => {
          const value = store[key] ?? null;
          return new Promise((resolve) => setTimeout(() => resolve(value), 10));
        }),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      })),
    }));
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    MixpanelPersistent.instance = null;
    const MixpanelMain = require("mixpanel-react-native/javascript/mixpanel-main").default;
    return new MixpanelMain(token, false, null);
  };

  const queuedEvent = (name) =>
    addToMixpanelQueue.mock.calls.find(([, , data]) => data.event === name)[2];

  it("identify right after an un-awaited init does not throw", async () => {
    const mixpanelMain = createMain();

    mixpanelMain.initialize(token);
    await mixpanelMain.identify(token, "user@example.com");

    expect(mixpanelMain.mixpanelPersistent.getDistinctId(token)).toBe(
      "user@example.com"
    );
  });

  it("track right after an un-awaited identify uses the new identity", async () => {
    const mixpanelMain = createMain();
    await mixpanelMain.initialize(token);

    const identify = mixpanelMain.identify(token, "B");
    await mixpanelMain.track(token, "Signed In", {});
    await identify;

    expect(queuedEvent("Signed In").properties.distinct_id).toBe("B");
    expect(queuedEvent("Signed In").properties.$user_id).toBe("B");
  });

  it("identify still works after the init load fails", async () => {
    const mixpanelMain = createMain({
      [`MIXPANEL_${token}_SUPER_PROPERTIES`]: "{corrupt",
    });
    // The constructor-time load fails the same way and has no handler of its own.
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    MixpanelPersistent.initializationCompletePromise.catch(() => {});
    await expect(mixpanelMain.initialize(token)).rejects.toThrow();

    await mixpanelMain.identify(token, "B");

    expect(queuedEvent("$identify").properties.distinct_id).toBe("B");
  });
});
