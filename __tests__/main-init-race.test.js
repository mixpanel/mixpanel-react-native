// Uses the real MixpanelPersistent with slow storage to cover calls made
// right after an un-awaited init(), as shown in the README.
describe("MixpanelMain - calls before init() completes", () => {
  const token = "test-token";

  beforeEach(() => {
    jest.resetModules();
    jest.doMock("mixpanel-react-native/javascript/mixpanel-core", () => ({
      MixpanelCore: jest.fn().mockImplementation(() => ({
        initialize: jest.fn(),
        startProcessingQueue: jest.fn(),
        addToMixpanelQueue: jest.fn(),
        identifyUserQueue: jest.fn(),
      })),
    }));
    jest.doMock("mixpanel-react-native/javascript/mixpanel-storage", () => ({
      AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
        getItem: jest.fn(
          () => new Promise((resolve) => setTimeout(() => resolve(null), 10))
        ),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      })),
    }));
  });

  it("identify right after an un-awaited init does not throw", async () => {
    const { MixpanelPersistent } = require("mixpanel-react-native/javascript/mixpanel-persistent");
    MixpanelPersistent.instance = null;
    const MixpanelMain = require("mixpanel-react-native/javascript/mixpanel-main").default;
    const mixpanelMain = new MixpanelMain(token, false, null);

    mixpanelMain.initialize(token);
    await mixpanelMain.identify(token, "user@example.com");

    expect(mixpanelMain.mixpanelPersistent.getDistinctId(token)).toBe(
      "user@example.com"
    );
  });
});
