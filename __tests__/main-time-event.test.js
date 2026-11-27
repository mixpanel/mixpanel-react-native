// Uses the real MixpanelPersistent with slow storage to cover timeEvent()
// right after an un-awaited init(), as shown in the README.
describe("MixpanelMain - timeEvent before init() completes", () => {
  const token = "test-token";

  it("tracks $duration for a timer started right after an un-awaited init", async () => {
    jest.resetModules();
    const store = {};
    const addToMixpanelQueue = jest.fn();
    jest.doMock("mixpanel-react-native/javascript/mixpanel-core", () => ({
      MixpanelCore: jest.fn().mockImplementation(() => ({
        initialize: jest.fn(),
        startProcessingQueue: jest.fn(),
        addToMixpanelQueue,
      })),
    }));
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        // Reads see storage as it was when the read started.
        getItem: jest.fn((key) => {
          const value = store[key] ?? null;
          return new Promise((resolve) => setTimeout(() => resolve(value), 10));
        }),
        setItem: jest.fn(async (key, value) => {
          store[key] = value;
        }),
        removeItem: jest.fn(async (key) => {
          delete store[key];
        }),
      })),
    }));
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    MixpanelPersistent.instance = null;
    const MixpanelMain = require("mixpanel-react-native/javascript/mixpanel-main").default;
    const mixpanelMain = new MixpanelMain(token, false, null);

    const init = mixpanelMain.initialize(token);
    await mixpanelMain.timeEvent(token, "TimeToInteract");
    await init;
    await mixpanelMain.track(token, "TimeToInteract", {});

    const [, , eventData] = addToMixpanelQueue.mock.calls.find(
      ([, , data]) => data.event === "TimeToInteract"
    );
    expect(eventData.properties.$duration).toEqual(expect.any(Number));
  });
});
