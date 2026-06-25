import { Mixpanel } from "mixpanel-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MixpanelFlagPersistence,
  VariantLookupPolicy,
} from "../javascript/mixpanel-flag-persistence";

global.fetch = jest.fn();

const persistedKey = (token) => `persisted_variants_for_${token}`;

const POLICY_PERSIST_UNTIL_NET = {
  variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
  persistenceTtlMs: 60 * 60 * 1000,
};

describe("Feature Flags - JS-fallback Persistence (end-to-end)", () => {
  const token = "test-token-123";
  let mixpanel;
  let mockStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    AsyncStorage.clear();
    const store = {};
    mockStorage = {
      getItem: jest.fn((k) => Promise.resolve(store[k] ?? null)),
      setItem: jest.fn((k, v) => {
        store[k] = v;
        return Promise.resolve();
      }),
      removeItem: jest.fn((k) => {
        delete store[k];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        for (const k of Object.keys(store)) delete store[k];
        return Promise.resolve();
      }),
    };
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("writes the persisted blob under the mixpanel-js key after a successful fetch", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      json: () =>
        Promise.resolve({
          flags: {
            "cached-feature": {
              variant_key: "treatment",
              variant_value: "cached-value",
              experiment_id: 456,
            },
          },
        }),
    });

    mixpanel = new Mixpanel(token, false, false, mockStorage);
    await mixpanel.init(false, {}, "https://api.mixpanel.com", false, {
      enabled: true,
      persistence: POLICY_PERSIST_UNTIL_NET,
    });
    await mixpanel.flags.loadFlags();

    const writes = mockStorage.setItem.mock.calls.filter(
      ([key]) => key === persistedKey(token)
    );
    expect(writes.length).toBeGreaterThanOrEqual(1);
    const payload = JSON.parse(writes[writes.length - 1][1]);
    expect(payload.flagVariants["cached-feature"].variant_key).toBe("treatment");
    expect(payload.flagVariants["cached-feature"].variant_value).toBe("cached-value");
    expect(payload.flagVariants["cached-feature"].experiment_id).toBe(456);
    expect(typeof payload.persistedAt).toBe("number");
  });

  it("does NOT persist when variantLookupPolicy is unset (default networkOnly)", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({ flags: { a: { variant_key: "k", variant_value: 1 } } }),
    });

    mixpanel = new Mixpanel(token, false, false, mockStorage);
    await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });
    await mixpanel.flags.loadFlags();

    const writesToFlagsKey = mockStorage.setItem.mock.calls.filter(
      ([key]) => key === persistedKey(token)
    );
    expect(writesToFlagsKey).toHaveLength(0);
  });

  it("stamps freshly loaded variants with variant_source='network'", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      json: () =>
        Promise.resolve({
          flags: { "fresh-flag": { variant_key: "v1", variant_value: "new" } },
        }),
    });

    mixpanel = new Mixpanel(token, false, false, mockStorage);
    await mixpanel.init(false, {}, "https://api.mixpanel.com", false, {
      enabled: true,
      persistence: POLICY_PERSIST_UNTIL_NET,
    });
    await mixpanel.flags.loadFlags();

    const v = mixpanel.flags.getVariantSync("fresh-flag", { key: "k", value: null });
    expect(v.value).toBe("new");
    expect(v.variant_source).toBe("network");
  });

  it("isolates persisted blobs per token", async () => {
    const t1 = "token-1";
    const t2 = "token-2";

    global.fetch
      .mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ flags: { a: { variant_key: "k", variant_value: "v1" } } }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ flags: { a: { variant_key: "k", variant_value: "v1" } } }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ flags: { b: { variant_key: "k", variant_value: "v2" } } }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ flags: { b: { variant_key: "k", variant_value: "v2" } } }),
      });

    const mp1 = new Mixpanel(t1, false, false, mockStorage);
    await mp1.init(false, {}, "https://api.mixpanel.com", false, {
      enabled: true,
      persistence: POLICY_PERSIST_UNTIL_NET,
    });
    await mp1.flags.loadFlags();

    const mp2 = new Mixpanel(t2, false, false, mockStorage);
    await mp2.init(false, {}, "https://api.mixpanel.com", false, {
      enabled: true,
      persistence: POLICY_PERSIST_UNTIL_NET,
    });
    await mp2.flags.loadFlags();

    const keys = mockStorage.setItem.mock.calls.map(([k]) => k);
    expect(keys).toContain(persistedKey(t1));
    expect(keys).toContain(persistedKey(t2));
  });

  it("networkFirst falls back to the persisted variant when the network fetch fails", async () => {
    // First session: fetch succeeds and writes a persisted blob under the runtime distinct_id.
    global.fetch.mockResolvedValue({
      status: 200,
      json: () =>
        Promise.resolve({
          flags: {
            "cached-only": {
              variant_key: "treatment",
              variant_value: "from-persistence",
              experiment_id: 99,
            },
          },
        }),
    });

    const POLICY_NETWORK_FIRST = {
      variantLookupPolicy: VariantLookupPolicy.NETWORK_FIRST,
      persistenceTtlMs: 60 * 60 * 1000,
    };

    const mp = new Mixpanel(token, false, false, mockStorage);
    await mp.init(false, {}, "https://api.mixpanel.com", false, {
      enabled: true,
      persistence: POLICY_NETWORK_FIRST,
    });
    await mp.flags.loadFlags();
    expect(
      mockStorage.setItem.mock.calls.some(([k]) => k === persistedKey(token))
    ).toBe(true);

    // Drive a second fetch attempt that fails; in-memory variants should survive.
    global.fetch.mockReset();
    global.fetch.mockRejectedValue(new Error("offline"));

    await expect(mp.flags.loadFlags()).rejects.toBeDefined();

    const variant = await mp.flags.getVariant("cached-only", {
      key: "fb",
      value: "fallback-value",
    });

    expect(variant.value).toBe("from-persistence");
    // In-memory variant retains its origin from the original successful fetch.
    expect(["network", "persistence"]).toContain(variant.variant_source);
  });
});

describe("MixpanelFlagPersistence — direct unit coverage", () => {
  let storage;
  const token = "unit-test-token";
  const ttlMs = 60 * 60 * 1000;

  beforeEach(() => {
    let store = {};
    storage = {
      getItem: jest.fn((k) => Promise.resolve(store[k] ?? null)),
      setItem: jest.fn((k, v) => {
        store[k] = v;
        return Promise.resolve();
      }),
      removeItem: jest.fn((k) => {
        delete store[k];
        return Promise.resolve();
      }),
    };
  });

  function makePersistence(policy = VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS, ttl = ttlMs) {
    return new MixpanelFlagPersistence(
      { variantLookupPolicy: policy, persistenceTtlMs: ttl },
      token,
      storage
    );
  }

  it("round-trips all variant fields including variant_source and persisted_at_in_ms", async () => {
    const p = makePersistence();
    const context = { distinct_id: "u1" };
    const flagsMap = new Map([
      [
        "flag-a",
        {
          key: "treatment",
          value: { theme: "dark" },
          experiment_id: 42,
          is_experiment_active: true,
          is_qa_tester: false,
        },
      ],
    ]);

    await p.save(context, flagsMap, {});
    const loaded = await p.loadFlagsFromStorage(context);
    expect(loaded).not.toBeNull();
    const v = loaded.flags.get("flag-a");
    expect(v.key).toBe("treatment");
    expect(v.value).toEqual({ theme: "dark" });
    expect(v.experiment_id).toBe(42);
    expect(v.is_experiment_active).toBe(true);
    expect(v.is_qa_tester).toBe(false);
    expect(v.variant_source).toBe("persistence");
    expect(typeof v.persisted_at_in_ms).toBe("number");
  });

  it("returns null on TTL expiry without auto-deleting the blob", async () => {
    const p = makePersistence();
    const context = { distinct_id: "u1" };
    await p.save(context, new Map([["a", { key: "k", value: 1 }]]), {});

    const raw = await storage.getItem(persistedKey(token));
    const parsed = JSON.parse(raw);
    parsed.persistedAt = Date.now() - ttlMs - 1000;
    await storage.setItem(persistedKey(token), JSON.stringify(parsed));

    const loaded = await p.loadFlagsFromStorage(context);
    expect(loaded).toBeNull();

    const stillThere = await storage.getItem(persistedKey(token));
    expect(stillThere).not.toBeNull();
  });

  it("clears the blob when the persisted distinct_id no longer matches", async () => {
    const p = makePersistence();
    await p.save({ distinct_id: "user-A" }, new Map([["a", { key: "k", value: 1 }]]), {});
    const loaded = await p.loadFlagsFromStorage({ distinct_id: "user-B" });
    expect(loaded).toBeNull();
    expect(await storage.getItem(persistedKey(token))).toBeNull();
  });

  it("networkOnly policy wipes any existing blob on load", async () => {
    const persisting = makePersistence();
    await persisting.save({ distinct_id: "u1" }, new Map([["a", { key: "k", value: 1 }]]), {});
    expect(await storage.getItem(persistedKey(token))).not.toBeNull();

    const networkOnly = makePersistence(VariantLookupPolicy.NETWORK_ONLY);
    const loaded = await networkOnly.loadFlagsFromStorage({ distinct_id: "u1" });
    expect(loaded).toBeNull();
    expect(await storage.getItem(persistedKey(token))).toBeNull();
  });

  it("save() is a no-op when policy is networkOnly", async () => {
    const p = makePersistence(VariantLookupPolicy.NETWORK_ONLY);
    await p.save({ distinct_id: "u1" }, new Map([["a", { key: "k", value: 1 }]]), {});
    expect(await storage.getItem(persistedKey(token))).toBeNull();
  });

  it("rejects an invalid policy string by falling back to networkOnly", async () => {
    const p = new MixpanelFlagPersistence(
      { variantLookupPolicy: "totallyNotAPolicy" },
      token,
      storage
    );
    expect(p.getPolicy()).toBe(VariantLookupPolicy.NETWORK_ONLY);
  });

  it("round-trips pendingFirstTimeEvents through save() and loadFlagsFromStorage()", async () => {
    const p = makePersistence();
    const context = { distinct_id: "u1" };
    const flagsMap = new Map([
      ["onboarding", { key: "control", value: false }],
    ]);
    const pendingFirstTimeEvents = {
      "onboarding:abc123": {
        flag_key: "onboarding",
        flag_id: "flag-1",
        project_id: 7,
        first_time_event_hash: "abc123",
        event_name: "Dashboard Viewed",
        property_filters: { ">": [{ var: "x" }, 0] },
        pending_variant: { variant_key: "treatment", variant_value: true },
      },
    };

    await p.save(context, flagsMap, pendingFirstTimeEvents);
    const loaded = await p.loadFlagsFromStorage(context);

    expect(loaded).not.toBeNull();
    expect(loaded.pendingFirstTimeEvents).toEqual(pendingFirstTimeEvents);
  });
});
