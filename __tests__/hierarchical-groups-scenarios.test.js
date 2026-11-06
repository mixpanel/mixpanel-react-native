// The hierarchical groups scenarios from the Notion testing doc, one test per section and in the
// same order.
//
// Runs the public Mixpanel API in JavaScript mode, which builds its own payloads for /track,
// /engage and /groups. Persistence is real over in-memory storage, and the queue is captured, so
// each test asserts the endpoint a call hits and the request it sends, or that nothing is sent.
// Edge cases beyond the doc live in hierarchical-groups.test.js.

import { MixpanelType } from "mixpanel-react-native/javascript/mixpanel-constants";

const TRACK = MixpanelType.EVENTS;
const GROUPS = MixpanelType.GROUPS;

const USER_ID = "my_user_id";
const COMPANY_ID = "my_company_id";
const TEAM_ID = "my_team_id";

// Every /groups write has these top-level keys beside its one operation
const GROUP_MESSAGE_KEYS = [
  "$token",
  "$time",
  "$group_key",
  "$group_id",
  "$company_id",
  "$mp_metadata",
];

// Each request the SDK queued, with the endpoint its queue is sent to
const mockSent = [];

jest.mock("mixpanel-react-native/javascript/mixpanel-queue", () => ({
  MixpanelQueueManager: {
    initialize: async () => {},
    enqueue: async (token, type, data) => {
      // As serialized for the request body
      mockSent.push({ endpoint: type, data: JSON.parse(JSON.stringify(data)) });
    },
    // Nothing is left to flush, so nothing reaches the network
    getQueue: () => [],
    spliceQueue: async () => {},
    clearQueue: async () => {},
    identifyUserQueue: async () => [],
  },
}));

jest.mock("react-native", () => ({
  NativeModules: {},
  Platform: { OS: "ios", Version: "17", constants: {} },
}));

const { Mixpanel } = require("mixpanel-react-native");
const {
  MixpanelPersistent,
} = require("mixpanel-react-native/javascript/mixpanel-persistent");
const {
  MixpanelLogger,
} = require("mixpanel-react-native/javascript/mixpanel-logger");

const token = "hg-scenarios-token";

const createStorage = () => {
  const values = {};
  return {
    getItem: async (key) => (key in values ? values[key] : null),
    setItem: async (key, value) => {
      values[key] = value;
    },
    removeItem: async (key) => {
      delete values[key];
    },
  };
};

let mixpanel;
let errorSpy;
let warnSpy;

// The public API doesn't return its promises, so let each call finish before asserting
const settle = () => new Promise((resolve) => setImmediate(resolve));

const identify = async () => {
  await mixpanel.identify({ userId: USER_ID, companyId: COMPANY_ID });
  await settle();
};

// Starts a scenario from what the steps before it set up, so it asserts only its own requests
const clearSent = () => {
  mockSent.length = 0;
};

const assertNothingSent = () => {
  expect(mockSent).toEqual([]);
};

const onlySent = (endpoint) => {
  expect(mockSent).toHaveLength(1);
  expect(mockSent[0].endpoint).toBe(endpoint);
  return mockSent[0].data;
};

const onlyEvent = (eventName) => {
  const data = onlySent(TRACK);
  expect(data.event).toBe(eventName);
  return data.properties;
};

const deviceId = () => mixpanel.getDeviceId();

// hasOptedOutTracking() throws in JavaScript mode (it calls a getOptOut that MixpanelPersistent
// doesn't have), so read the flag it would return
const hasOptedOutTracking = () =>
  mixpanel.mixpanelImpl.mixpanelPersistent.getOptedOut(token);

const assertAnonymous = async (props) => {
  const device = await deviceId();
  expect(props.distinct_id).toBe(`$device:${device}`);
  expect(props.$device_id).toBe(device);
  expect(props.$user_id).toBeNull();
  expect(props).not.toHaveProperty("$company_id");
};

const assertIdentified = async (props) => {
  expect(props).not.toHaveProperty("distinct_id");
  expect(props.$user_id).toBe(USER_ID);
  expect(props.$company_id).toBe(COMPANY_ID);
  expect(props.$device_id).toBe(await deviceId());
};

const assertGroupsUpdate = (message, groupKey, groupId, operation) => {
  expect(Object.keys(message).sort()).toEqual(
    [...GROUP_MESSAGE_KEYS, operation].sort()
  );
  expect(message.$token).toBe(token);
  expect(message.$group_key).toBe(groupKey);
  expect(message.$group_id).toBe(groupId);
  expect(message.$company_id).toBe(COMPANY_ID);
  return message[operation];
};

// Asserts the single /groups request and returns the value of its operation
const onlyGroupsUpdate = (groupKey, groupId, operation) =>
  assertGroupsUpdate(onlySent(GROUPS), groupKey, groupId, operation);

const onlyUserUpdate = (operation) =>
  onlyGroupsUpdate("$user_id", USER_ID, operation);

beforeEach(async () => {
  // Keeps the queue's flush interval from firing or holding the test run open
  jest.useFakeTimers({ doNotFake: ["setImmediate", "nextTick", "queueMicrotask"] });
  clearSent();
  errorSpy = jest.spyOn(MixpanelLogger, "error").mockImplementation(() => {});
  warnSpy = jest.spyOn(MixpanelLogger, "warn").mockImplementation(() => {});
  // A fresh install: the persistent singleton loads from empty storage
  MixpanelPersistent.instance = undefined;
  mixpanel = new Mixpanel(token, false, false, createStorage());
  await mixpanel.init(false, {}, undefined, false, {}, null, true);
  await settle();
  clearSent();
});

afterEach(() => {
  errorSpy.mockRestore();
  warnSpy.mockRestore();
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("Hierarchical groups scenarios", () => {
  it("Track (Anonymous)", async () => {
    mixpanel.track("HG Event!", { source: "hierarchical_groups_page" });
    await settle();

    const props = onlyEvent("HG Event!");
    await assertAnonymous(props);
    expect(props.source).toBe("hierarchical_groups_page");
  });

  it("Identify", async () => {
    const anonymousDistinctId = `$device:${await deviceId()}`;
    await identify();

    const props = onlyEvent("$identify");
    await assertIdentified(props);
    expect(props.$anon_distinct_id).toBe(anonymousDistinctId);
  });

  it("Track (Identified)", async () => {
    await identify();
    clearSent();
    mixpanel.track("HG Event!", { source: "hierarchical_groups_page" });
    await settle();

    const props = onlyEvent("HG Event!");
    await assertIdentified(props);
    expect(props.source).toBe("hierarchical_groups_page");
  });

  it("Set User Property", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().set("plan", "enterprise");
    await settle();

    expect(onlyUserUpdate("$set")).toEqual({ plan: "enterprise" });
  });

  it("Set User Properties", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().set({ role: "admin", seats: 5 });
    await settle();

    expect(onlyUserUpdate("$set")).toEqual({ role: "admin", seats: 5 });
  });

  it("Set Once User Property", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().setOnce("first_seen", "2026-10-27");
    await settle();

    expect(onlyUserUpdate("$set_once")).toEqual({ first_seen: "2026-10-27" });
  });

  it("Union User Property", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().union("devices", ["android"]);
    await settle();

    // On iOS, People.union() calls union twice, so the same $union is queued twice
    expect(mockSent).toHaveLength(2);
    for (const { endpoint, data } of mockSent) {
      expect(endpoint).toBe(GROUPS);
      expect(assertGroupsUpdate(data, "$user_id", USER_ID, "$union")).toEqual({
        devices: ["android"],
      });
    }
  });

  it("Remove User Property", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().remove("devices", "android");
    await settle();

    expect(onlyUserUpdate("$remove")).toEqual({ devices: "android" });
  });

  it("Unset User Property", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().unset("plan");
    await settle();

    expect(onlyUserUpdate("$unset")).toEqual(["plan"]);
  });

  it("Delete User", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().deleteUser();
    await settle();

    expect(onlyUserUpdate("$delete")).toBe("null");
  });

  it("Clear Charges (Unsupported)", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().clearCharges();
    await settle();

    assertNothingSent();
  });

  it("Increment User Property (Unsupported)", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().increment("logins", 1);
    mixpanel.getPeople().increment({ logins: 1, sessions: 2 });
    await settle();

    assertNothingSent();
  });

  it("Append User Property (Unsupported)", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().append("history", "opened_hg_page");
    await settle();

    assertNothingSent();
  });

  it("Track Charge (Unsupported)", async () => {
    await identify();
    clearSent();
    mixpanel.getPeople().trackCharge(9.99);
    await settle();

    assertNothingSent();
  });

  it("Set Company Property", async () => {
    await identify();
    clearSent();
    (await mixpanel.getCompany()).set("tier", "enterprise");
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$set")).toEqual({
      tier: "enterprise",
    });
  });

  it("Set Company Property through getGroup", async () => {
    await identify();
    clearSent();
    mixpanel.getGroup("$company_id", COMPANY_ID).set("tier", "enterprise");
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$set")).toEqual({
      tier: "enterprise",
    });
  });

  it("Set Company Properties", async () => {
    await identify();
    clearSent();
    (await mixpanel.getCompany()).set({ size: 12, region: "us" });
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$set")).toEqual({
      size: 12,
      region: "us",
    });
  });

  it("Set Once Company Property", async () => {
    await identify();
    clearSent();
    (await mixpanel.getCompany()).setOnce("created", "2026-10-27");
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$set_once")).toEqual({
      created: "2026-10-27",
    });
  });

  it("Union Company Property", async () => {
    await identify();
    clearSent();
    (await mixpanel.getCompany()).union("tags", ["android"]);
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$union")).toEqual({
      tags: ["android"],
    });
  });

  it("Remove Company Property", async () => {
    await identify();
    clearSent();
    (await mixpanel.getCompany()).remove("tags", "android");
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$remove")).toEqual({
      tags: "android",
    });
  });

  it("Unset Company Property", async () => {
    await identify();
    clearSent();
    (await mixpanel.getCompany()).unset("tier");
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$unset")).toEqual(["tier"]);
  });

  it("Set User's Custom Group (setGroup)", async () => {
    await identify();
    clearSent();
    mixpanel.setGroup("team_id", TEAM_ID);
    await settle();

    expect(onlyUserUpdate("$set")).toEqual({ team_id: TEAM_ID });
  });

  it("Track with Custom Group (trackWithGroups)", async () => {
    await identify();
    clearSent();
    mixpanel.trackWithGroups("HG Team Event!", null, { team_id: TEAM_ID });
    await settle();

    const props = onlyEvent("HG Team Event!");
    await assertIdentified(props);
    expect(props.team_id).toBe(TEAM_ID);
  });

  it("Track (After setGroup)", async () => {
    await identify();
    mixpanel.setGroup("team_id", TEAM_ID);
    await settle();
    clearSent();
    mixpanel.track("HG Event!", { source: "hierarchical_groups_page" });
    await settle();

    const props = onlyEvent("HG Event!");
    await assertIdentified(props);
    // A single value, not a list: hierarchical groups would read ["my_team_id"] as one group
    expect(props.team_id).toBe(TEAM_ID);
    expect(props.source).toBe("hierarchical_groups_page");
  });

  it("Remove User's Custom Group (removeGroup)", async () => {
    await identify();
    mixpanel.setGroup("team_id", TEAM_ID);
    await settle();
    clearSent();
    mixpanel.removeGroup("team_id", TEAM_ID);
    await settle();

    expect(onlyUserUpdate("$unset")).toEqual(["team_id"]);
    expect(await mixpanel.getSuperProperties()).not.toHaveProperty("team_id");
  });

  it("Set Custom Group Property", async () => {
    await identify();
    clearSent();
    mixpanel.getGroup("team_id", TEAM_ID).set("tier", "enterprise");
    await settle();

    expect(onlyGroupsUpdate("team_id", TEAM_ID, "$set")).toEqual({ tier: "enterprise" });
  });

  it("Set Custom Group Properties", async () => {
    await identify();
    clearSent();
    mixpanel.getGroup("team_id", TEAM_ID).set({ size: 12, region: "us" });
    await settle();

    expect(onlyGroupsUpdate("team_id", TEAM_ID, "$set")).toEqual({ size: 12, region: "us" });
  });

  it("Set Once Custom Group Property", async () => {
    await identify();
    clearSent();
    mixpanel.getGroup("team_id", TEAM_ID).setOnce("created", "2026-10-27");
    await settle();

    expect(onlyGroupsUpdate("team_id", TEAM_ID, "$set_once")).toEqual({
      created: "2026-10-27",
    });
  });

  it("Union Custom Group Property", async () => {
    await identify();
    clearSent();
    mixpanel.getGroup("team_id", TEAM_ID).union("tags", ["android"]);
    await settle();

    expect(onlyGroupsUpdate("team_id", TEAM_ID, "$union")).toEqual({ tags: ["android"] });
  });

  it("Remove Custom Group Property", async () => {
    await identify();
    clearSent();
    mixpanel.getGroup("team_id", TEAM_ID).remove("tags", "android");
    await settle();

    expect(onlyGroupsUpdate("team_id", TEAM_ID, "$remove")).toEqual({ tags: "android" });
  });

  it("Unset Custom Group Property", async () => {
    await identify();
    clearSent();
    mixpanel.getGroup("team_id", TEAM_ID).unset("tier");
    await settle();

    expect(onlyGroupsUpdate("team_id", TEAM_ID, "$unset")).toEqual(["tier"]);
  });

  it("Delete Company", async () => {
    await identify();
    clearSent();
    mixpanel.deleteGroup("$company_id", COMPANY_ID);
    await settle();

    expect(onlyGroupsUpdate("$company_id", COMPANY_ID, "$delete")).toBe("null");
  });

  it("Delete Custom Group", async () => {
    await identify();
    clearSent();
    mixpanel.deleteGroup("team_id", TEAM_ID);
    await settle();

    expect(onlyGroupsUpdate("team_id", TEAM_ID, "$delete")).toBe("null");
  });

  it("Reset", async () => {
    await identify();
    mixpanel.setGroup("team_id", TEAM_ID);
    await settle();
    const oldDeviceId = await deviceId();
    clearSent();
    mixpanel.reset();
    await settle();

    assertNothingSent();
    const identity = await mixpanel.getIdentity();
    expect(identity.userId).toBeNull();
    expect(identity.companyId).toBeNull();
    expect(identity.deviceId).not.toBe(oldDeviceId);
    expect(await mixpanel.getSuperProperties()).toEqual({});
    expect(hasOptedOutTracking()).toBe(false);
  });

  it("Track (After Reset)", async () => {
    await identify();
    mixpanel.setGroup("team_id", TEAM_ID);
    await settle();
    mixpanel.reset();
    await settle();
    clearSent();
    mixpanel.track("HG Event!", { source: "hierarchical_groups_page" });
    await settle();

    const props = onlyEvent("HG Event!");
    await assertAnonymous(props);
    expect(props).not.toHaveProperty("team_id");
  });

  it("Opt Out (Identified)", async () => {
    await identify();
    const oldDeviceId = await deviceId();
    clearSent();
    mixpanel.optOutTracking();
    await settle();

    // The user's profile is deleted; there is no clearCharges $unset of $transactions
    expect(onlyUserUpdate("$delete")).toBe("null");
    expect(hasOptedOutTracking()).toBe(true);
    const identity = await mixpanel.getIdentity();
    expect(identity.userId).toBeNull();
    expect(identity.companyId).toBeNull();
    expect(identity.deviceId).not.toBe(oldDeviceId);
  });

  it("Opt Out (Anonymous)", async () => {
    const oldDeviceId = await deviceId();
    mixpanel.optOutTracking();
    await settle();

    assertNothingSent();
    expect(hasOptedOutTracking()).toBe(true);
    expect(await deviceId()).not.toBe(oldDeviceId);
  });

  it("Track (Opted Out)", async () => {
    mixpanel.optOutTracking();
    await settle();
    clearSent();
    mixpanel.track("HG Event!", { source: "hierarchical_groups_page" });
    await settle();

    assertNothingSent();
  });

  it("Opt In (Anonymous)", async () => {
    mixpanel.optOutTracking();
    await settle();
    clearSent();
    mixpanel.optInTracking();
    await settle();

    await assertAnonymous(onlyEvent("$opt_in"));
    expect(hasOptedOutTracking()).toBe(false);
  });

  it("Opt In With Identity", async () => {
    mixpanel.optOutTracking();
    await settle();
    clearSent();
    mixpanel.optInTrackingWithIdentity({ userId: USER_ID, companyId: COMPANY_ID });
    await settle();

    // $identify and $opt_in, in that order, both carrying the user and company
    expect(mockSent.map((s) => s.endpoint)).toEqual([TRACK, TRACK]);
    expect(mockSent.map((s) => s.data.event)).toEqual(["$identify", "$opt_in"]);
    for (const { data } of mockSent) {
      await assertIdentified(data.properties);
    }
    expect(hasOptedOutTracking()).toBe(false);
  });

  it("Identify Without Company (Unsupported)", async () => {
    const before = await mixpanel.getIdentity();
    await mixpanel.identify({ userId: USER_ID });
    await settle();

    assertNothingSent();
    expect(await mixpanel.getIdentity()).toEqual(before);
  });

  it("Identify With Distinct ID (Unsupported)", async () => {
    const before = await mixpanel.getIdentity();
    await mixpanel.identify(USER_ID);
    await settle();

    assertNothingSent();
    expect(await mixpanel.getIdentity()).toEqual(before);
  });

  it("Alias (Unsupported)", async () => {
    await identify();
    clearSent();
    mixpanel.alias("new_alias", USER_ID);
    await settle();

    assertNothingSent();
    expect((await mixpanel.getIdentity()).userId).toBe(USER_ID);
  });

  it("Set User's Custom Groups With a List (Unsupported)", async () => {
    await identify();
    clearSent();
    mixpanel.setGroup("team_id", [TEAM_ID]);
    await settle();

    assertNothingSent();
    expect(await mixpanel.getSuperProperties()).not.toHaveProperty("team_id");
  });

  it("Add User's Custom Group (Unsupported)", async () => {
    await identify();
    clearSent();
    mixpanel.addGroup("team_id", TEAM_ID);
    await settle();

    assertNothingSent();
    expect(await mixpanel.getSuperProperties()).not.toHaveProperty("team_id");
  });

  it("Set User Property Before Identify (Unsupported)", async () => {
    mixpanel.getPeople().set("plan", "enterprise");
    await settle();

    assertNothingSent();
  });

  it("Set Company Property Before Identify (Unsupported)", async () => {
    expect(await mixpanel.getCompany()).toBeNull();
    await settle();

    assertNothingSent();
  });

  it("Set Custom Group Property Before Identify (Unsupported)", async () => {
    mixpanel.getGroup("team_id", TEAM_ID).set("tier", "enterprise");
    await settle();

    assertNothingSent();
  });
});
