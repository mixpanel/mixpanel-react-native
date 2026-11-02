// Hierarchical groups in the public JS API, in native mode: what reaches the native bridge.

import { Mixpanel, MixpanelGroup } from "mixpanel-react-native";
import { NativeModules } from "react-native";
import { MixpanelLogger } from "mixpanel-react-native/javascript/mixpanel-logger";

const native = NativeModules.MixpanelReactNative;

const start = async (hierarchicalGroups) => {
  const mixpanel = new Mixpanel("token", true);
  await mixpanel.init(false, {}, undefined, false, {}, null, hierarchicalGroups);
  return mixpanel;
};

let errorSpy;

beforeEach(() => {
  jest.clearAllMocks();
  errorSpy = jest.spyOn(MixpanelLogger, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

test(`init passes hierarchicalGroups to the native SDK`, async () => {
  await start(true);
  expect(native.initialize.mock.calls.at(-1)[8]).toBe(true);
});

test(`hierarchicalGroups defaults to false`, async () => {
  const mixpanel = new Mixpanel("token", true);
  await mixpanel.init();
  expect(native.initialize.mock.calls.at(-1)[8]).toBe(false);
});

test(`identify with an identity sends only the identity fields`, async () => {
  const mixpanel = await start(true);
  await mixpanel.identify({ userId: "user_123", companyId: "acme", extra: "dropped" });
  expect(native.identifyWithIdentity).toBeCalledWith("token", {
    userId: "user_123",
    companyId: "acme",
    deviceId: null,
  });
  expect(native.identify).not.toBeCalled();
});

test(`identify with a distinct id is unchanged`, async () => {
  const mixpanel = await start(false);
  await mixpanel.identify("user_123");
  expect(native.identify).toBeCalledWith("token", "user_123");
  expect(native.identifyWithIdentity).not.toBeCalled();
});

test(`identify leaves missing ids for the SDK to report`, async () => {
  const mixpanel = await start(true);
  await mixpanel.identify({ userId: "user_123" });
  expect(native.identifyWithIdentity).toBeCalledWith("token", {
    userId: "user_123",
    companyId: null,
    deviceId: null,
  });
});

test(`identify rejects ids that are not strings`, async () => {
  const mixpanel = new Mixpanel("token", true);
  await expect(mixpanel.identify({ userId: 123, companyId: "acme" })).rejects.toThrow(
    "userId is not a valid string"
  );
  expect(native.identifyWithIdentity).not.toBeCalled();
});

test(`getIdentity returns the native identity`, async () => {
  native.getIdentity.mockResolvedValueOnce({
    userId: "user_123",
    companyId: "acme",
    deviceId: "device",
  });
  const mixpanel = await start(true);
  expect(await mixpanel.getIdentity()).toEqual({
    userId: "user_123",
    companyId: "acme",
    deviceId: "device",
  });
});

test(`getIdentity fills missing fields with null`, async () => {
  native.getIdentity.mockResolvedValueOnce({ deviceId: "device" });
  const mixpanel = await start(false);
  expect(await mixpanel.getIdentity()).toEqual({
    userId: null,
    companyId: null,
    deviceId: "device",
  });
});

test(`getCompany returns the identified company's group`, async () => {
  native.getIdentity.mockResolvedValueOnce({
    userId: "user_123",
    companyId: "acme",
    deviceId: "device",
  });
  const mixpanel = await start(true);
  const company = await mixpanel.getCompany();
  expect(company).toBeInstanceOf(MixpanelGroup);
  company.set("tier", "enterprise");
  expect(native.groupSetProperties).toBeCalledWith("token", "$company_id", "acme", {
    tier: "enterprise",
  });
});

test(`getCompany is not cached across identities`, async () => {
  const mixpanel = await start(true);
  native.getIdentity.mockResolvedValueOnce({ userId: "u", companyId: "acme", deviceId: "d" });
  const first = await mixpanel.getCompany();
  native.getIdentity.mockResolvedValueOnce({ userId: "u", companyId: "globex", deviceId: "d" });
  const second = await mixpanel.getCompany();
  expect(first.groupID).toBe("acme");
  expect(second.groupID).toBe("globex");
});

test(`getCompany before identify drops updates`, async () => {
  const mixpanel = await start(true);
  const company = await mixpanel.getCompany();
  company.set("tier", "enterprise");
  company.setOnce("tier", "enterprise");
  company.unset("tier");
  company.remove("plans", "a");
  company.union("plans", ["a"]);

  expect(company).toBeInstanceOf(MixpanelGroup);
  expect(native.groupSetProperties).not.toBeCalled();
  expect(native.groupSetPropertyOnce).not.toBeCalled();
  expect(native.groupUnsetProperty).not.toBeCalled();
  expect(native.groupRemovePropertyValue).not.toBeCalled();
  expect(native.groupUnionProperty).not.toBeCalled();
  expect(errorSpy).toHaveBeenCalledTimes(5);
  expect(errorSpy).toBeCalledWith(
    "token",
    "getCompany() needs a company. Call identify({userId, companyId}) first. The update was dropped."
  );
});

test(`getCompany when disabled drops updates`, async () => {
  const mixpanel = await start(false);
  const company = await mixpanel.getCompany();
  company.set("tier", "enterprise");

  expect(native.getIdentity).not.toBeCalled();
  expect(native.groupSetProperties).not.toBeCalled();
  expect(errorSpy).toBeCalledWith(
    "token",
    "getCompany() is only for hierarchical groups projects, enabled with the " +
      "hierarchicalGroups argument of init(). The update was dropped."
  );
});

test(`optInTrackingWithIdentity passes the identity and properties`, async () => {
  const mixpanel = await start(true);
  mixpanel.optInTrackingWithIdentity({ userId: "user_123", companyId: "acme" }, { a: 1 });
  expect(native.optInTrackingWithIdentity).toBeCalledWith(
    "token",
    { userId: "user_123", companyId: "acme", deviceId: null },
    { a: 1 }
  );
});

test(`optInTrackingWithIdentity without an identity passes nulls`, async () => {
  const mixpanel = await start(true);
  mixpanel.optInTrackingWithIdentity();
  expect(native.optInTrackingWithIdentity).toBeCalledWith("token", null, null);
});

test(`optInTracking is unchanged`, async () => {
  const mixpanel = await start(true);
  mixpanel.optInTracking();
  expect(native.optInTracking).toBeCalledWith("token");
});

test(`setGroup with a list is dropped when enabled`, async () => {
  const mixpanel = await start(true);
  mixpanel.setGroup("team_id", ["eng", "ops"]);
  expect(native.setGroup).not.toBeCalled();
  expect(errorSpy).toBeCalledWith(
    "token",
    "setGroup with a list is not supported for hierarchical groups projects, which allow " +
      "one team_id per user. Use setGroup(groupKey, groupID). The update was dropped."
  );
});

test(`setGroup with one group reaches the SDK when enabled`, async () => {
  const mixpanel = await start(true);
  mixpanel.setGroup("team_id", "eng");
  expect(native.setGroup).toBeCalledWith("token", "team_id", "eng");
});

test(`setGroup with a list is unchanged when disabled`, async () => {
  const mixpanel = await start(false);
  mixpanel.setGroup("team_id", ["eng", "ops"]);
  expect(native.setGroup).toBeCalledWith("token", "team_id", ["eng", "ops"]);
});
