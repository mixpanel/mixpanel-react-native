import { MixpanelType } from "mixpanel-react-native/javascript/mixpanel-constants";

jest.mock("mixpanel-react-native/javascript/mixpanel-queue", () => ({
  MixpanelQueueManager: {
    initialize: jest.fn(),
    enqueue: jest.fn(),
    getQueue: jest.fn(),
    spliceQueue: jest.fn(),
    clearQueue: jest.fn(),
  },
}));

jest.mock("mixpanel-react-native/javascript/mixpanel-persistent", () => ({
  MixpanelPersistent: {
    getInstance: jest.fn().mockReturnValue({
      getOptedOut: jest.fn(),
    }),
  },
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
    }),
  },
}));

jest.mock("mixpanel-react-native/javascript/mixpanel-logger", () => ({
  MixpanelLogger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const {
  MixpanelCore,
} = require("mixpanel-react-native/javascript/mixpanel-core");

const {
  MixpanelQueueManager,
} = require("mixpanel-react-native/javascript/mixpanel-queue");

const {
  MixpanelPersistent,
} = require("mixpanel-react-native/javascript/mixpanel-persistent");

const {
  MixpanelNetwork,
} = require("mixpanel-react-native/javascript/mixpanel-network");

describe("MixpanelQueueManager", () => {
  let mixpanelPersistent;
  const token = "test-token";
  const type = MixpanelType.EVENTS;
  const data = { event: "testEvent" };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      MixpanelPersistent.getInstance().getOptedOut.mockReturnValue(false);
      MixpanelQueueManager.getQueue.mockReturnValue([]);
    });
  });

  it("initializes the Mixpanel queue for events", async () => {
    await MixpanelCore().initialize(token);
    expect(MixpanelQueueManager.initialize).toHaveBeenCalledWith(
      token,
      expect.any(String)
    );
  });

  it("adds data to the Mixpanel queue if not opted out and data is valid", async () => {
    MixpanelPersistent.getInstance().getOptedOut.mockReturnValueOnce(false);
    await MixpanelCore().addToMixpanelQueue(token, type, data);
    expect(MixpanelQueueManager.enqueue).toHaveBeenCalledWith(
      token,
      type,
      expect.any(Object)
    );
  });

  it("do not add data to the Mixpanel queue if opted out", async () => {
    MixpanelPersistent.getInstance().getOptedOut.mockReturnValueOnce(true);
    await MixpanelCore().addToMixpanelQueue(token, type, data);
    expect(MixpanelQueueManager.enqueue).toHaveBeenCalledTimes(0);
  });

  it("do not add data to the Mixpanel queue if data is not valid", async () => {
    MixpanelPersistent.getInstance().getOptedOut.mockReturnValueOnce(false);
    // mock JSON.stringify to throw an error
    jest.spyOn(JSON, "stringify").mockImplementationOnce(() => {
      throw new Error("mock error");
    });
    await MixpanelCore().addToMixpanelQueue(token, type, data);
    expect(MixpanelQueueManager.enqueue).toHaveBeenCalledTimes(0);
  });

  it("flushes the queue", async () => {
    MixpanelPersistent.getInstance().getOptedOut.mockReturnValueOnce(false);
    MixpanelQueueManager.getQueue.mockImplementation((token, type) => {
      return [data];
    });
    await MixpanelCore().flush(token);
    expect(MixpanelNetwork.sendRequest).toHaveBeenCalled();
  });

  it("do not flush the queue if opted out", async () => {
    MixpanelPersistent.getInstance().getOptedOut.mockReturnValueOnce(true);
    MixpanelQueueManager.getQueue.mockImplementation((token, type) => {
      return [data];
    });
    await MixpanelCore().flush(token);
    expect(MixpanelNetwork.sendRequest).toHaveBeenCalledTimes(0);
  });

  it("not flushes the queue if there is no data", async () => {
    MixpanelPersistent.getInstance().getOptedOut.mockReturnValueOnce(false);
    MixpanelQueueManager.getQueue.mockImplementation((token, type) => {
      return [];
    });
    await MixpanelCore().flush(token);
    expect(MixpanelNetwork.sendRequest).toHaveBeenCalledTimes(0);
  });

  it("does not send the same batch twice while a request is in flight", async () => {
    const queue = [data];
    MixpanelQueueManager.getQueue.mockImplementation(() => [...queue]);
    MixpanelQueueManager.spliceQueue.mockImplementation(async (t, ty, start, count) => {
      queue.splice(start, count);
    });
    let finishRequest;
    MixpanelNetwork.sendRequest.mockImplementation(
      () => new Promise((resolve) => (finishRequest = resolve))
    );

    // Two instances for the same token (e.g. a component that creates its own
    // Mixpanel) flush the shared queue at the same time.
    await MixpanelCore().flush("in-flight-token");
    await MixpanelCore().flush("in-flight-token");
    finishRequest();
    await new Promise(setImmediate);

    const trackCalls = MixpanelNetwork.sendRequest.mock.calls.filter(
      ([args]) => args.endpoint === MixpanelType.EVENTS
    );
    expect(trackCalls).toHaveLength(1);
    expect(queue).toHaveLength(0);
  });

  describe("with an events-only queue", () => {
    let queue;
    // Scope the queue to one token so flush loops left running by other tests
    // (e.g. "flushes the queue") can't send or remove these events.
    let queueToken;
    const eventSends = () =>
      MixpanelNetwork.sendRequest.mock.calls.filter(
        ([args]) => args.token === queueToken && args.endpoint === MixpanelType.EVENTS
      ).length;

    beforeEach(() => {
      queue = [data];
      MixpanelQueueManager.getQueue.mockImplementation((t, ty) =>
        t === queueToken && ty === MixpanelType.EVENTS ? [...queue] : []
      );
      MixpanelQueueManager.spliceQueue.mockImplementation(async (t, ty, start, count) => {
        queue.splice(start, count);
      });
      MixpanelNetwork.sendRequest.mockResolvedValue(undefined);
    });

    it("starts a new flush when the in-flight request never settles", async () => {
      queueToken = "stuck-token";
      MixpanelNetwork.sendRequest.mockImplementationOnce(() => new Promise(() => {}));
      const now = jest.spyOn(Date, "now").mockReturnValue(1000);

      await MixpanelCore().flush("stuck-token");
      now.mockReturnValue(1000 + 60 * 1000); // still within the retry window
      await MixpanelCore().flush("stuck-token");
      expect(eventSends()).toBe(1);

      now.mockReturnValue(1000 + 3 * 60 * 1000);
      await MixpanelCore().flush("stuck-token");
      await new Promise(setImmediate);
      expect(eventSends()).toBe(2);
      expect(queue).toHaveLength(0);
      now.mockRestore();
    });

    it("releases the flush when processing throws unexpectedly", async () => {
      queueToken = "throwing-token";
      MixpanelQueueManager.getQueue.mockImplementationOnce(() => {
        throw new Error("storage failure");
      });

      await MixpanelCore().flush("throwing-token");
      await new Promise(setImmediate);
      await MixpanelCore().flush("throwing-token");
      await new Promise(setImmediate);

      expect(eventSends()).toBe(1);
      expect(queue).toHaveLength(0);
    });
  });
});
