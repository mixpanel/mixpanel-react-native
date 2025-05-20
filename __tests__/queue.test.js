import { MixpanelType } from "mixpanel-react-native/javascript/mixpanel-constants";

jest.mock("mixpanel-react-native/javascript/mixpanel-persistent", () => ({
  MixpanelPersistent: {
    getInstance: jest.fn().mockReturnValue({
      loadQueue: jest.fn().mockResolvedValue([]),
      saveQueue: jest.fn(),
      isIdentified: jest.fn(),
      getDistinctId: jest.fn(),
      getDeviceId: jest.fn(),
      getUserId: jest.fn(),
    }),
  },
}));

describe("MixpanelQueueManager", () => {
  let MixpanelQueueManager;
  let mixpanelPersistent;
  let token = "testToken";
  let eventsType = MixpanelType.EVENTS;

  beforeEach(() => {
    jest.isolateModules(async () => {
      MixpanelQueueManager = require("mixpanel-react-native/javascript/mixpanel-queue")
        .MixpanelQueueManager;
      const MixpanelPersistent = require("mixpanel-react-native/javascript/mixpanel-persistent")
        .MixpanelPersistent;
      mixpanelPersistent = MixpanelPersistent.getInstance();
      await MixpanelQueueManager.clearQueue(token, eventsType);
    });
  });

  it("initializes the queue correctly", async () => {
    await MixpanelQueueManager.initialize(token, eventsType);
    expect(MixpanelQueueManager.getQueue(token, eventsType)).toEqual([]);
  });

  it("enqueue adds data to the queue and updates storage", async () => {
    const data = { test: "data" };

    await MixpanelQueueManager.initialize(token, eventsType);
    await MixpanelQueueManager.enqueue(token, eventsType, data);

    expect(mixpanelPersistent.saveQueue).toHaveBeenCalledWith(
      token,
      eventsType,
      expect.any(Array)
    );
  });

  it("splices the queue correctly", async () => {
    await MixpanelQueueManager.enqueue(token, eventsType, { data: "sample1" });
    await MixpanelQueueManager.enqueue(token, eventsType, { data: "sample2" });

    await MixpanelQueueManager.spliceQueue(token, eventsType, 0, 1);

    const queue = MixpanelQueueManager.getQueue(token, eventsType);
    expect(queue.length).toBe(1);
    expect(queue).toEqual([{ data: "sample2" }]);
  });

  it("clears the queue correctly", async () => {
    await MixpanelQueueManager.enqueue(token, eventsType, { data: "sample" });
    await MixpanelQueueManager.clearQueue(token, eventsType);

    const queue = MixpanelQueueManager.getQueue(token, eventsType);
    expect(queue).toEqual([]);
  });
});

describe("MixpanelQueueManager - extended", () => {
  let MixpanelQueueManager;
  let mixpanelPersistent;
  let token = "testToken";
  let userType = MixpanelType.USER;

  beforeEach(async () => {
    jest.isolateModules(() => {
      MixpanelQueueManager = require("mixpanel-react-native/javascript/mixpanel-queue").MixpanelQueueManager;
      mixpanelPersistent = require("mixpanel-react-native/javascript/mixpanel-persistent").MixpanelPersistent.getInstance();
    });
    // Reset internal queues
    await MixpanelQueueManager.clearQueue(token, userType);
  });

  describe("getQueue", () => {
    it("returns empty array if no queue exists", () => {
      expect(MixpanelQueueManager.getQueue(token, userType)).toEqual([]);
    });

    it("returns queue if present and identified", async () => {
      mixpanelPersistent.isIdentified.mockReturnValue(true);
      await MixpanelQueueManager.enqueue(token, userType, { foo: "bar" });
      const queue = MixpanelQueueManager.getQueue(token, userType);
      expect(queue).toEqual([{ foo: "bar" }]);
    });

    it("returns empty array for USER type if not identified", async () => {
      mixpanelPersistent.isIdentified.mockReturnValue(false);
      // Manually set internal queue
      await MixpanelQueueManager.enqueue(token, userType, { foo: "bar" });
      const queue = MixpanelQueueManager.getQueue(token, userType);
      expect(queue).toEqual([]);
    });

    it("returns queue for non-USER type regardless of identification", async () => {
      mixpanelPersistent.isIdentified.mockReturnValue(false);
      const nonUserType = MixpanelType.EVENTS;
      await MixpanelQueueManager.enqueue(token, nonUserType, { foo: "baz" });
      const queue = MixpanelQueueManager.getQueue(token, nonUserType);
      expect(queue).toEqual([{ foo: "baz" }]);
    });
  });

  describe("identifyUserQueue", () => {
    it("returns empty array if USER queue does not exist", async () => {
      const result = await MixpanelQueueManager.identifyUserQueue(token);
      expect(result).toEqual([]);
    });

    it("updates identity fields if they are missing or null", async () => {
      // Setup persistent mocks
      mixpanelPersistent.getDistinctId.mockReturnValue("did");
      mixpanelPersistent.getDeviceId.mockReturnValue("devid");
      mixpanelPersistent.getUserId.mockReturnValue("uid");
      // Insert a record missing identity fields
      await MixpanelQueueManager.enqueue(token, userType, { foo: 1, $distinct_id: null, $device_id: null, $user_id: null });

      const result = await MixpanelQueueManager.identifyUserQueue(token);
      expect(result[0]).toEqual({ foo: 1, $distinct_id: "did", $device_id: "devid", $user_id: "uid" });
      expect(mixpanelPersistent.saveQueue).toHaveBeenCalledWith(
        token,
        MixpanelType.USER,
        expect.any(Array)
      );
    });

    it("does not update queue if identity fields already match", async () => {
      mixpanelPersistent.getDistinctId.mockReturnValue("did");
      mixpanelPersistent.getDeviceId.mockReturnValue("devid");
      mixpanelPersistent.getUserId.mockReturnValue("uid");
      await MixpanelQueueManager.enqueue(token, userType, {
        foo: 1,
        $distinct_id: "did",
        $device_id: "devid",
        $user_id: "uid"
      });

      mixpanelPersistent.saveQueue.mockClear();
      const result = await MixpanelQueueManager.identifyUserQueue(token);
      expect(result[0]).toEqual({
        foo: 1,
        $distinct_id: "did",
        $device_id: "devid",
        $user_id: "uid"
      });
      expect(mixpanelPersistent.saveQueue).not.toHaveBeenCalled();
    });
  });
});