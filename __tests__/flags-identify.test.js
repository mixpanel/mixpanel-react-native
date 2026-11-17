// Feature flags in JavaScript mode across identify. MixpanelMain runs on the real
// MixpanelPersistent over in-memory storage, with the queue and network mocked.

const mockCore = {
  initialize: jest.fn(),
  startProcessingQueue: jest.fn(),
  addToMixpanelQueue: jest.fn(),
  flush: jest.fn(),
  identifyUserQueue: jest.fn(),
};

jest.mock("mixpanel-react-native/javascript/mixpanel-core", () => ({
  MixpanelCore: () => mockCore,
}));

jest.mock("react-native", () => ({
  NativeModules: {},
  Platform: { OS: "ios", Version: "17", constants: {} },
}));

const MixpanelMain =
  require("mixpanel-react-native/javascript/mixpanel-main").default;
const {
  MixpanelPersistent,
} = require("mixpanel-react-native/javascript/mixpanel-persistent");
const {
  MixpanelFlagsJS,
} = require("mixpanel-react-native/javascript/mixpanel-flags-js");
const {
  MixpanelNetwork,
} = require("mixpanel-react-native/javascript/mixpanel-network");

const token = "flags-identify-token";

const createStorage = () => {
  const values = {};
  return {
    getItem: jest.fn(async (key) => (key in values ? values[key] : null)),
    setItem: jest.fn(async (key, value) => {
      values[key] = value;
    }),
    removeItem: jest.fn(async (key) => {
      delete values[key];
    }),
  };
};

describe("feature flags across identify in JavaScript mode", () => {
  let storage;
  let sendRequestSpy;
  let fetchMock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    storage = createStorage();
    sendRequestSpy = jest.spyOn(MixpanelNetwork, "sendRequest").mockResolvedValue({
      flags: {
        checkout_flow: {
          variant_key: "treatment",
          variant_value: true,
          experiment_id: "exp_1",
          is_experiment_active: true,
        },
      },
      pending_first_time_events: [
        {
          flag_key: "checkout_flow",
          flag_id: "flag_1",
          project_id: 123,
          first_time_event_hash: "HASH",
          event_name: "Signed Up",
          pending_variant: { variant_key: "pending", variant_value: "pending" },
        },
      ],
    });
    fetchMock = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    sendRequestSpy.mockRestore();
    global.fetch = originalFetch;
  });

  // Waits for the fetch init() starts, so later fetches are the ones under test
  const startFlags = async () => {
    MixpanelPersistent.instance = undefined;
    const main = new MixpanelMain(token, false, storage);
    await main.initialize(token, false, false, {}, "https://api.mixpanel.com", false, {});
    const flags = new MixpanelFlagsJS(token, main, storage, { enabled: true });
    await flags.init();
    return { main, flags };
  };

  const lastContext = () => {
    const endpoint = sendRequestSpy.mock.calls.at(-1)[0].endpoint;
    const query = new URLSearchParams(endpoint.slice(endpoint.indexOf("?") + 1));
    return JSON.parse(query.get("context"));
  };

  it("drops a first-time variant activated for the previous user", async () => {
    const { main, flags } = await startFlags();
    await main.identify(token, "user_a");
    await flags.fetchPromise;
    await main.track(token, "Signed Up");
    expect(flags.getVariantSync("checkout_flow", null).key).toBe("pending");

    await main.identify(token, "user_b");
    await flags.fetchPromise;

    expect(flags.getVariantSync("checkout_flow", null).key).toBe("treatment");
    expect(lastContext().distinct_id).toBe("user_b");
    await main.track(token, "Signed Up");
    expect(flags.getVariantSync("checkout_flow", null).key).toBe("pending");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("waits for the new user's flags when read right after identify", async () => {
    const { main, flags } = await startFlags();
    await main.identify(token, "user_a");
    await flags.fetchPromise;
    await main.track(token, "Signed Up");

    await main.identify(token, "user_b");
    const variant = await flags.getVariant("checkout_flow", { key: "fallback", value: null });

    expect(variant.key).toBe("treatment");
    expect(lastContext().distinct_id).toBe("user_b");
  });

  it("keeps a first-time variant when identify repeats the same user", async () => {
    const { main, flags } = await startFlags();
    await main.identify(token, "user_a");
    await flags.fetchPromise;
    await main.track(token, "Signed Up");

    await main.identify(token, "user_a");

    expect(flags.getVariantSync("checkout_flow", null).key).toBe("pending");
  });
});
