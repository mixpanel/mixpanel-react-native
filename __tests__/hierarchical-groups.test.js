// Hierarchical groups in JavaScript mode. Ports the behavioral contract of mixpanel-android's
// HierarchicalGroupsTest: MixpanelMain runs on the real MixpanelPersistent over in-memory
// storage, and the queue is mocked so each test reads exactly what would be sent where.

import { MixpanelType } from "mixpanel-react-native/javascript/mixpanel-constants";

const mockCore = {
  initialize: jest.fn(),
  startProcessingQueue: jest.fn(),
  addToMixpanelQueue: jest.fn(),
  sendWhileOptedOut: jest.fn(),
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
  MixpanelLogger,
} = require("mixpanel-react-native/javascript/mixpanel-logger");
const {
  MixpanelQueueManager,
} = require("mixpanel-react-native/javascript/mixpanel-queue");

const token = "hg-token";

const createStorage = () => {
  const values = {};
  return {
    values,
    getItem: jest.fn(async (key) => (key in values ? values[key] : null)),
    setItem: jest.fn(async (key, value) => {
      values[key] = value;
    }),
    removeItem: jest.fn(async (key) => {
      delete values[key];
    }),
  };
};

let storage;
let errorSpy;
let warnSpy;

const start = async ({ hierarchicalGroups = true, superProperties = {} } = {}) => {
  // A fresh process: the persistent singleton reloads from storage
  MixpanelPersistent.instance = undefined;
  const main = new MixpanelMain(token, false, storage);
  await main.initialize(
    token,
    false,
    false,
    superProperties,
    "https://api.mixpanel.com",
    false,
    {},
    null,
    hierarchicalGroups
  );
  mockCore.addToMixpanelQueue.mockClear();
  mockCore.sendWhileOptedOut.mockClear();
  mockCore.flush.mockClear();
  return main;
};

const queued = (type) =>
  mockCore.addToMixpanelQueue.mock.calls
    .filter(([, queueType]) => queueType === type)
    .map(([, , data]) => data);
const events = () => queued(MixpanelType.EVENTS);
const lastEvent = () => events().at(-1);
const groups = () => queued(MixpanelType.GROUPS);
const engage = () => queued(MixpanelType.USER);
const errors = () => errorSpy.mock.calls.map((args) => args.slice(1).join(" "));

const acme = { userId: "user_123", companyId: "acme" };

beforeEach(() => {
  jest.clearAllMocks();
  storage = createStorage();
  errorSpy = jest.spyOn(MixpanelLogger, "error").mockImplementation(() => {});
  warnSpy = jest.spyOn(MixpanelLogger, "warn").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
  warnSpy.mockRestore();
});

describe("events", () => {
  it("carry the user, company and device", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    await main.track(token, "Opened");

    const props = lastEvent().properties;
    expect(props.$user_id).toBe("user_123");
    expect(props.$company_id).toBe("acme");
    expect(props.$device_id).toBe(main.mixpanelPersistent.getDeviceId(token));
    // No distinct_id; ingestion resolves the user from the identity keys
    expect(props).not.toHaveProperty("distinct_id");
  });

  it("$identify carries the new company", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);

    const identify = events().find((e) => e.event === "$identify");
    expect(identify.properties.$company_id).toBe("acme");
    expect(identify.properties.$user_id).toBe("user_123");
  });

  it("anonymous events carry no company", async () => {
    const main = await start();
    await main.track(token, "Opened");
    expect(lastEvent().properties).not.toHaveProperty("$company_id");
  });

  it("$company_id overrides a super property", async () => {
    const main = await start({ superProperties: { $company_id: "spoofed" } });
    await main.identifyWithIdentity(token, acme);
    await main.track(token, "Opened");
    expect(lastEvent().properties.$company_id).toBe("acme");
  });

  it("carry no company when disabled", async () => {
    const main = await start({ hierarchicalGroups: false });
    await main.identifyWithIdentity(token, { userId: "user_123" });
    await main.track(token, "Opened");
    expect(lastEvent().properties).not.toHaveProperty("$company_id");
    expect(lastEvent().properties.$user_id).toBe("user_123");
  });
});

describe("identify", () => {
  it("treats a company change as an identity change", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "globex" });
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "globex" });

    const identifies = events().filter((e) => e.event === "$identify");
    expect(identifies).toHaveLength(2);
    expect(identifies[1].properties.$company_id).toBe("globex");
    expect((await main.getIdentity(token)).companyId).toBe("globex");
  });

  it("rejects identify(distinctId) and keeps the current identity", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.identify(token, "someone_else");

    expect(events()).toHaveLength(0);
    expect(await main.getIdentity(token)).toMatchObject(acme);
    expect(errors()).toContain(
      "identify(String) is not supported for hierarchical groups projects, which identify a " +
        "user by company and user id. Use identify({userId, companyId}). Nothing was identified."
    );
  });

  it.each([
    [{ userId: "user_123" }],
    [{ userId: "user_123", companyId: "" }],
    [{ userId: "", companyId: "acme" }],
    [{ userId: null, companyId: "acme" }],
    [{ companyId: "acme" }],
  ])("ignores %o without both ids", async (identity) => {
    const main = await start();
    const before = await main.getIdentity(token);
    await main.identifyWithIdentity(token, identity);

    expect(events()).toHaveLength(0);
    expect(await main.getIdentity(token)).toEqual(before);
    expect(errors().at(-1)).toMatch(
      /^Can't identify MixpanelIdentity\(.*\): hierarchical groups projects identify a user by company and user id, so both are required\. Nothing was identified\.$/
    );
  });

  it("ignores a null identity", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, null);
    expect(events()).toHaveLength(0);
    expect(errors()).toHaveLength(1);
  });

  it("formats the identity in the error", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, { userId: "user_123" });
    expect(errors()[0]).toMatch(/^Can't identify MixpanelIdentity\(userId=user_123\): /);
  });

  it("ignores the identity's device id", async () => {
    const main = await start();
    const deviceId = main.mixpanelPersistent.getDeviceId(token);
    await main.identifyWithIdentity(token, { ...acme, deviceId: "other-device" });

    expect((await main.getIdentity(token)).deviceId).toBe(deviceId);
    expect(lastEvent().properties.$device_id).toBe(deviceId);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("does nothing while opted out", async () => {
    const main = await start();
    await main.optOutTracking(token);
    await main.identifyWithIdentity(token, acme);
    expect((await main.getIdentity(token)).userId).toBeNull();
  });

  it("persists the company across restarts", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);

    const restarted = await start();
    expect(await restarted.getIdentity(token)).toMatchObject(acme);
    await restarted.track(token, "Opened");
    expect(lastEvent().properties.$company_id).toBe("acme");
  });

  it("rejects an identity with a company when disabled", async () => {
    const main = await start({ hierarchicalGroups: false });
    await main.identifyWithIdentity(token, acme);

    expect(events()).toHaveLength(0);
    expect((await main.getIdentity(token)).userId).toBeNull();
    expect(errors()[0]).toContain("a company requires hierarchicalGroups");
  });

  it("identifies a user without a company when disabled", async () => {
    const main = await start({ hierarchicalGroups: false });
    await main.identifyWithIdentity(token, { userId: "user_123" });

    expect(await main.getIdentity(token)).toMatchObject({
      userId: "user_123",
      companyId: null,
    });
    expect(await main.getDistinctId(token)).toBe("user_123");
  });

  it("drops alias", async () => {
    const main = await start();
    await main.alias(token, "new_alias", "user_123");
    expect(events()).toHaveLength(0);
    expect(errors()[0]).toContain("alias is not supported for hierarchical groups projects");
  });
});

describe("getIdentity and getDistinctId", () => {
  it("getIdentity reports the user, company and device", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    expect(await main.getIdentity(token)).toEqual({
      ...acme,
      deviceId: main.mixpanelPersistent.getDeviceId(token),
    });
  });

  it("the distinct id is the device before identify", async () => {
    const main = await start();
    const deviceId = main.mixpanelPersistent.getDeviceId(token);
    expect(await main.getDistinctId(token)).toBe(`$device:${deviceId}`);
  });

  it("the distinct id combines company and user", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    expect(await main.getDistinctId(token)).toBe("$company:acme|$user:user_123");
  });

  it("the distinct id stays on the device until a company is known", async () => {
    const main = await start();
    // A user stored without a company, e.g. identified before hierarchical groups was enabled
    main.mixpanelPersistent.updateDistinctId(token, "user_123");
    main.mixpanelPersistent.updateUserId(token, "user_123");
    const deviceId = main.mixpanelPersistent.getDeviceId(token);
    expect(await main.getDistinctId(token)).toBe(`$device:${deviceId}`);
  });

  it("reset returns to the device and clears the company", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    await main.reset(token);

    const identity = await main.getIdentity(token);
    expect(identity.userId).toBeNull();
    expect(identity.companyId).toBeNull();
    expect(await main.getDistinctId(token)).toBe(`$device:${identity.deviceId}`);
    await main.track(token, "Opened");
    expect(lastEvent().properties).not.toHaveProperty("$company_id");
  });
});

describe("opt in and out", () => {
  it("optInTrackingWithIdentity identifies with the company", async () => {
    const main = await start();
    await main.optOutTracking(token);
    await main.optInTrackingWithIdentity(token, acme, { source: "settings" });

    expect(main.mixpanelPersistent.getOptedOut(token)).toBe(false);
    const optIn = events().find((e) => e.event === "$opt_in");
    expect(optIn.properties.$company_id).toBe("acme");
    expect(optIn.properties.source).toBe("settings");
    expect(events().some((e) => e.event === "$identify")).toBe(true);
  });

  it("optInTrackingWithIdentity without an identity stays anonymous", async () => {
    const main = await start();
    await main.optOutTracking(token);
    await main.optInTrackingWithIdentity(token, null);

    const optIn = events().find((e) => e.event === "$opt_in");
    expect(optIn.properties.$user_id).toBeFalsy();
    expect(optIn.properties).not.toHaveProperty("$company_id");
  });

  it("optInTracking without arguments still works", async () => {
    const main = await start();
    await main.optOutTracking(token);
    await main.optInTracking(token);
    expect(events().map((e) => e.event)).toEqual(["$opt_in"]);
  });

  it("opt out deletes the user profile without clearing charges", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.optOutTracking(token);

    expect(mockCore.sendWhileOptedOut).toHaveBeenCalledTimes(1);
    expect(mockCore.sendWhileOptedOut).toHaveBeenCalledWith(
      token,
      MixpanelType.GROUPS,
      expect.objectContaining({
        $group_key: "$user_id",
        $group_id: "user_123",
        $company_id: "acme",
        $delete: "null",
      })
    );
    expect(groups()).toHaveLength(0);
    expect(engage()).toHaveLength(0);
    expect((await main.getIdentity(token)).companyId).toBeNull();
  });

  it("opt out clears pending group updates before the user delete", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    const clearQueue = jest.spyOn(MixpanelQueueManager, "clearQueue");

    await main.optOutTracking(token);

    expect(clearQueue).toHaveBeenCalledWith(token, MixpanelType.GROUPS);
    expect(clearQueue.mock.invocationCallOrder[0]).toBeLessThan(
      mockCore.sendWhileOptedOut.mock.invocationCallOrder[0]
    );
    clearQueue.mockRestore();
  });

  it("opt out drops calls made while the user delete is sent", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();
    // The core drops what it is given while opted out
    const optedOutWhenQueued = [];
    mockCore.addToMixpanelQueue.mockImplementation(async () => {
      optedOutWhenQueued.push(main.mixpanelPersistent.getOptedOut(token));
    });

    const optedOut = main.optOutTracking(token);
    await main.track(token, "Opened");
    await main.set(token, { plan: "pro" });
    await optedOut;
    mockCore.addToMixpanelQueue.mockReset();

    expect(events()).toHaveLength(0);
    expect(optedOutWhenQueued).toEqual([true]);
    expect(mockCore.sendWhileOptedOut).toHaveBeenCalledTimes(1);
  });

  it("opt out of an anonymous user deletes nothing", async () => {
    const main = await start();
    await main.optOutTracking(token);
    expect(groups()).toHaveLength(0);
    expect(errors()).toHaveLength(0);
  });
});

describe("user profiles", () => {
  it("are sent to /engage when disabled", async () => {
    const main = await start({ hierarchicalGroups: false });
    await main.identifyWithIdentity(token, { userId: "user_123" });
    await main.set(token, { plan: "pro" });

    expect(groups()).toHaveLength(0);
    expect(engage().at(-1)).toMatchObject({
      $set: { plan: "pro" },
      $distinct_id: "user_123",
    });
  });

  it("become $user_id group profiles", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.set(token, { plan: "pro" });
    await main.setOnce(token, { first_seen: "today" });
    await main.union(token, "roles", ["admin"]);
    await main.remove(token, "roles", "viewer");
    await main.unset(token, "legacy");
    await main.deleteUser(token);

    expect(engage()).toHaveLength(0);
    const sent = groups();
    expect(sent.map((g) => Object.keys(g).find((k) => k.startsWith("$") && ![
      "$token", "$time", "$group_key", "$group_id", "$company_id",
    ].includes(k)))).toEqual(["$set", "$set_once", "$union", "$remove", "$unset", "$delete"]);
    for (const update of sent) {
      expect(update).toMatchObject({
        $token: token,
        $group_key: "$user_id",
        $group_id: "user_123",
        $company_id: "acme",
      });
      expect(update).not.toHaveProperty("$distinct_id");
      expect(update).not.toHaveProperty("$device_id");
      expect(update).not.toHaveProperty("$user_id");
    }
    expect(sent[0].$set).toEqual({ plan: "pro" });
  });

  it("drop the operations /groups can't express", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.increment(token, { logins: 1 });
    await main.append(token, "history", "a");
    await main.trackCharge(token, 9.99, {});
    await main.clearCharges(token);

    expect(groups()).toHaveLength(0);
    expect(engage()).toHaveLength(0);
    expect(errors()).toEqual([
      "$add is not supported for hierarchical groups projects, whose user profiles are group " +
        "profiles keyed by $user_id. Supported operations are [$set, $set_once, $unset, $union, " +
        "$remove, $delete], so increment, append, merge and trackCharge have no hierarchical " +
        "groups equivalent. The update was dropped.",
      expect.stringMatching(/^\$append is not supported/),
      expect.stringMatching(/^\$append is not supported/),
      "clearCharges is not supported for hierarchical groups projects, which can't " +
        "trackCharge. The update was dropped.",
    ]);
  });

  it("are dropped before identify", async () => {
    const main = await start();
    await main.set(token, { plan: "pro" });

    expect(groups()).toHaveLength(0);
    expect(engage()).toHaveLength(0);
    expect(errors()).toEqual([
      "User profile updates for hierarchical groups projects need a user and a company. " +
        "Call identify({userId, companyId}) first. The $set update was dropped.",
    ]);
  });

  it("are dropped without a company", async () => {
    const main = await start();
    main.mixpanelPersistent.updateDistinctId(token, "user_123");
    main.mixpanelPersistent.updateUserId(token, "user_123");
    await main.set(token, { plan: "pro" });

    expect(groups()).toHaveLength(0);
    expect(errors()[0]).toContain("need a user and a company");
  });
});

describe("group membership", () => {
  it("setGroup stores one group and writes the user profile through /groups", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.setGroup(token, "team_id", "eng");

    expect(main.mixpanelPersistent.getSuperProperties(token).team_id).toBe("eng");
    expect(groups()).toEqual([
      expect.objectContaining({
        $group_key: "$user_id",
        $group_id: "user_123",
        $company_id: "acme",
        $set: { team_id: "eng" },
      }),
    ]);
    await main.track(token, "Opened");
    expect(lastEvent().properties.team_id).toBe("eng");
  });

  it("setGroup with a list is dropped", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.setGroup(token, "team_id", ["eng", "ops"]);

    expect(main.mixpanelPersistent.getSuperProperties(token)).not.toHaveProperty("team_id");
    expect(groups()).toHaveLength(0);
    expect(errors()).toEqual([
      "setGroup with a list is not supported for hierarchical groups projects, which allow " +
        "one team_id per user. Use setGroup(groupKey, groupID). The update was dropped.",
    ]);
  });

  it("addGroup is dropped", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    await main.setGroup(token, "team_id", "eng");
    mockCore.addToMixpanelQueue.mockClear();

    await main.addGroup(token, "team_id", "ops");

    expect(main.mixpanelPersistent.getSuperProperties(token).team_id).toBe("eng");
    expect(groups()).toHaveLength(0);
    expect(errors()[0]).toMatch(/^addGroup is not supported for hierarchical groups projects/);
  });

  it("removeGroup clears the group", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    await main.setGroup(token, "team_id", "eng");
    mockCore.addToMixpanelQueue.mockClear();

    await main.removeGroup(token, "team_id", "eng");

    expect(main.mixpanelPersistent.getSuperProperties(token)).not.toHaveProperty("team_id");
    expect(groups()).toEqual([
      expect.objectContaining({ $group_key: "$user_id", $unset: ["team_id"] }),
    ]);
  });

  it("removeGroup of another group does nothing", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    await main.setGroup(token, "team_id", "eng");
    mockCore.addToMixpanelQueue.mockClear();

    await main.removeGroup(token, "team_id", "ops");

    expect(main.mixpanelPersistent.getSuperProperties(token).team_id).toBe("eng");
    expect(groups()).toHaveLength(0);
  });

  it("removeGroup clears a one-item list stored before hierarchical groups", async () => {
    const main = await start({ superProperties: { team_id: ["eng"] } });
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.removeGroup(token, "team_id", "eng");

    expect(main.mixpanelPersistent.getSuperProperties(token)).not.toHaveProperty("team_id");
    expect(groups()).toHaveLength(1);
  });

  it("stays a list when disabled", async () => {
    const main = await start({ hierarchicalGroups: false });
    await main.setGroup(token, "team_id", "eng");
    expect(main.mixpanelPersistent.getSuperProperties(token).team_id).toEqual(["eng"]);
  });
});

describe("group profiles", () => {
  it("carry the company", async () => {
    const main = await start();
    await main.identifyWithIdentity(token, acme);
    mockCore.addToMixpanelQueue.mockClear();

    await main.groupSetProperties(token, "team_id", "eng", { name: "Engineering" });
    await main.deleteGroup(token, "team_id", "eng");

    expect(groups()).toEqual([
      expect.objectContaining({
        $group_key: "team_id",
        $group_id: "eng",
        $company_id: "acme",
        $set: { name: "Engineering" },
      }),
      expect.objectContaining({
        $group_key: "team_id",
        $group_id: "eng",
        $company_id: "acme",
        $delete: "null",
      }),
    ]);
  });

  it("are dropped without a company", async () => {
    const main = await start();
    await main.groupSetProperties(token, "team_id", "eng", { name: "Engineering" });

    expect(groups()).toHaveLength(0);
    expect(errors()).toEqual([
      "Group profile updates for hierarchical groups projects require a company. Call " +
        "identify({userId, companyId}) first. The update to team_id=eng was dropped.",
    ]);
  });

  it("carry no company when disabled", async () => {
    const main = await start({ hierarchicalGroups: false });
    await main.groupSetProperties(token, "team_id", "eng", { name: "Engineering" });

    expect(groups()).toHaveLength(1);
    expect(groups()[0]).not.toHaveProperty("$company_id");
  });
});

describe("Mixpanel in JavaScript mode", () => {
  const { Mixpanel } = require("mixpanel-react-native");

  const startMixpanel = async (hierarchicalGroups) => {
    MixpanelPersistent.instance = undefined;
    const mixpanel = new Mixpanel(token, false, false, storage);
    await mixpanel.init(false, {}, undefined, false, {}, null, hierarchicalGroups);
    mockCore.addToMixpanelQueue.mockClear();
    return mixpanel;
  };

  it("identifies with an identity and reports it", async () => {
    const mixpanel = await startMixpanel(true);
    await mixpanel.identify(acme);

    const identity = await mixpanel.getIdentity();
    expect(identity).toMatchObject(acme);
    expect(identity.deviceId).toEqual(expect.any(String));
    expect(await mixpanel.getDistinctId()).toBe("$company:acme|$user:user_123");
  });

  it("getCompany updates the identified company", async () => {
    const mixpanel = await startMixpanel(true);
    await mixpanel.identify(acme);
    mockCore.addToMixpanelQueue.mockClear();

    const company = await mixpanel.getCompany();
    company.set("tier", "enterprise");
    await new Promise((resolve) => setImmediate(resolve));

    expect(groups()).toEqual([
      expect.objectContaining({
        $group_key: "$company_id",
        $group_id: "acme",
        $company_id: "acme",
        $set: { tier: "enterprise" },
      }),
    ]);
  });

  it("a saved getCompany handle keeps its company after identify and reset", async () => {
    const mixpanel = await startMixpanel(true);
    await mixpanel.identify(acme);
    const company = await mixpanel.getCompany();
    await mixpanel.identify({ userId: "user_123", companyId: "globex" });
    mockCore.addToMixpanelQueue.mockClear();

    company.set("tier", "enterprise");
    await new Promise((resolve) => setImmediate(resolve));
    await mixpanel.reset();
    company.set("tier", "free");
    await new Promise((resolve) => setImmediate(resolve));

    expect(groups()).toEqual([
      expect.objectContaining({
        $group_key: "$company_id",
        $group_id: "acme",
        $company_id: "acme",
        $set: { tier: "enterprise" },
      }),
      expect.objectContaining({
        $group_key: "$company_id",
        $group_id: "acme",
        $company_id: "acme",
        $set: { tier: "free" },
      }),
    ]);
  });

  it("getCompany before identify resolves to null", async () => {
    const mixpanel = await startMixpanel(true);

    expect(await mixpanel.getCompany()).toBeNull();
    expect(groups()).toHaveLength(0);
    expect(errors()).toEqual([
      "getCompany() needs a company. Call identify({userId, companyId}) first.",
    ]);
  });

  it("getCompany when disabled resolves to null", async () => {
    const mixpanel = await startMixpanel(false);
    await mixpanel.identify({ userId: "user_123" });

    expect(await mixpanel.getCompany()).toBeNull();
    expect(groups()).toHaveLength(0);
    expect(errors()).toEqual([
      "getCompany() is only for hierarchical groups projects, enabled with the " +
        "hierarchicalGroups argument of init().",
    ]);
  });
});

describe("flags in JavaScript mode", () => {
  const {
    MixpanelFlagsJS,
  } = require("mixpanel-react-native/javascript/mixpanel-flags-js");
  const {
    MixpanelNetwork,
  } = require("mixpanel-react-native/javascript/mixpanel-network");

  let sendRequestSpy;
  let fetchMock;
  const originalFetch = global.fetch;

  beforeEach(() => {
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
  const startFlags = async ({ hierarchicalGroups = true, context } = {}) => {
    const main = await start({ hierarchicalGroups });
    const flags = new MixpanelFlagsJS(token, main, storage, { enabled: true, context });
    await flags.init();
    return { main, flags };
  };

  const lastContext = () => {
    const endpoint = sendRequestSpy.mock.calls.at(-1)[0].endpoint;
    const query = new URLSearchParams(endpoint.slice(endpoint.indexOf("?") + 1));
    return JSON.parse(query.get("context"));
  };

  it("send the user and company in the context after identify", async () => {
    const { main, flags } = await startFlags();
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "company_123" });
    await flags.fetchPromise;

    expect(lastContext()).toEqual({
      distinct_id: "user_123",
      device_id: main.mixpanelPersistent.getDeviceId(token),
      $user_id: "user_123",
      $company_id: "company_123",
    });
  });

  it("send no user or company in the context before identify", async () => {
    const { main } = await startFlags();

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(lastContext())).toBe(
      JSON.stringify({
        distinct_id: main.mixpanelPersistent.getDistinctId(token),
        device_id: main.mixpanelPersistent.getDeviceId(token),
      })
    );
  });

  it("refetch with the new company when it changes", async () => {
    const { main, flags } = await startFlags();
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "company_123" });
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "company_456" });
    await flags.fetchPromise;

    expect(sendRequestSpy).toHaveBeenCalledTimes(3);
    expect(lastContext().$company_id).toBe("company_456");
    expect(lastContext().distinct_id).toBe("user_123");
  });

  it("let the configured context override the user and company", async () => {
    const { main, flags } = await startFlags({ context: { $company_id: "configured" } });
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "company_123" });
    await flags.fetchPromise;

    expect(lastContext().$company_id).toBe("configured");
    expect(lastContext().$user_id).toBe("user_123");
  });

  it("send the context unchanged when disabled", async () => {
    const { main, flags } = await startFlags({ hierarchicalGroups: false });
    await main.identifyWithIdentity(token, { userId: "user_123" });
    await flags.fetchPromise;

    // The user id is stored after identify, but only hierarchical groups sends it
    expect(main.mixpanelPersistent.getUserId(token)).toBe("user_123");
    expect(JSON.stringify(lastContext())).toBe(
      JSON.stringify({
        distinct_id: "user_123",
        device_id: main.mixpanelPersistent.getDeviceId(token),
      })
    );
  });

  const firstTimeEventBody = () => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/flags/flag_1/first-time-events");
    expect(options.method).toBe("POST");
    return options.body;
  };

  it("send the user and company when recording a first-time event", async () => {
    const { main, flags } = await startFlags();
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "company_123" });
    await flags.fetchPromise;
    await main.track(token, "Signed Up");

    expect(firstTimeEventBody()).toBe(
      JSON.stringify({
        project_id: 123,
        first_time_event_hash: "HASH",
        $user_id: "user_123",
        $company_id: "company_123",
      })
    );
  });

  it("record a first-time event unchanged when disabled", async () => {
    const { main, flags } = await startFlags({ hierarchicalGroups: false });
    await main.identifyWithIdentity(token, { userId: "user_123" });
    await flags.fetchPromise;
    await main.track(token, "Signed Up");

    expect(firstTimeEventBody()).toBe(
      JSON.stringify({
        distinct_id: "user_123",
        project_id: 123,
        first_time_event_hash: "HASH",
      })
    );
  });

  it("track $experiment_started with the user and company", async () => {
    const { main, flags } = await startFlags();
    await main.identifyWithIdentity(token, { userId: "user_123", companyId: "company_123" });
    await flags.fetchPromise;
    await flags.trackExperimentStarted("checkout_flow", flags.getVariantSync("checkout_flow", null));

    const exposure = events().find((e) => e.event === "$experiment_started");
    expect(exposure.properties["Experiment name"]).toBe("checkout_flow");
    expect(exposure.properties.$user_id).toBe("user_123");
    expect(exposure.properties.$company_id).toBe("company_123");
    expect(exposure.properties).not.toHaveProperty("distinct_id");
  });
});
