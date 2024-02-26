import { MixpanelType } from "mixpanel-react-native/javascript/mixpanel-constants";

jest.mock("mixpanel-react-native/javascript/mixpanel-persistent", () => ({
  MixpanelPersistent: {
    getInstance: jest.fn().mockReturnValue({
      loadQueue: jest.fn().mockResolvedValue([]),
      saveQueue: jest.fn(),
    }),
  },
}));

describe("MixpanelQueueManager", () => {
  let MixpanelQueueManager;
  let mixpanelPersistent;
  let token = "testToken";
  let type = MixpanelType.EVENTS;

  beforeEach(() => {
    jest.isolateModules(async () => {
      MixpanelQueueManager = require("mixpanel-react-native/javascript/mixpanel-queue")
        .MixpanelQueueManager;
      const MixpanelPersistent = require("mixpanel-react-native/javascript/mixpanel-persistent")
        .MixpanelPersistent;
      mixpanelPersistent = MixpanelPersistent.getInstance();
      await MixpanelQueueManager.clearQueue(token, type);
    });
  });

  it("initializes the queue correctly", async () => {
    await MixpanelQueueManager.initialize(token, type);
    expect(MixpanelQueueManager.getQueue(token, type)).toEqual([]);
  });

  it("enqueue adds data to the queue and updates storage", async () => {
    const data = { test: "data" };

    await MixpanelQueueManager.initialize(token, type);
    await MixpanelQueueManager.enqueue(token, type, data);

    expect(mixpanelPersistent.saveQueue).toHaveBeenCalledWith(
      token,
      type,
      expect.any(Array)
    );
  });

  it("splices the queue correctly", async () => {
    await MixpanelQueueManager.enqueue(token, type, { data: "sample1" });
    await MixpanelQueueManager.enqueue(token, type, { data: "sample2" });

    await MixpanelQueueManager.spliceQueue(token, type, 0, 1);

    const queue = MixpanelQueueManager.getQueue(token, type);
    expect(queue.length).toBe(1);
    expect(queue).toEqual([{ data: "sample2" }]);
  });

  it("clears the queue correctly", async () => {
    await MixpanelQueueManager.enqueue(token, type, { data: "sample" });
    await MixpanelQueueManager.clearQueue(token, type);

    const queue = MixpanelQueueManager.getQueue(token, type);
    expect(queue).toEqual([]);
  });
});
