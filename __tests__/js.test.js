import { Mixpanel } from "mixpanel-react-native";

jest.mock("mixpanel-react-native/javascript/mixpanel-main", () => {
  return jest.fn().mockImplementation(() => {
    return {
      initialize: jest.fn(),
    };
  });
});

const {
  MixpanelMain,
} = require("mixpanel-react-native/javascript/mixpanel-main");

test(`it calls Mixpanel initialize`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();

  expect(MixpanelMain).toHaveBeenCalledTimes(1);
  expect(MixpanelMain.mock.instances[0].initialize).toBeCalledWith(
    "token",
    true,
    false,
    { $lib_version: "2.4.0", mp_lib: "react-native" },
    "https://api.mixpanel.com"
  );
});

test(`it calls Mixpanel initialize with optOut and superProperties`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init(true, { super: "property" });
  expect(MixpanelMain.mock.instances[0].initialize).toBeCalledWith(
    "token",
    true,
    true,
    { $lib_version: "2.4.0", mp_lib: "react-native", super: "property" },
    "https://api.mixpanel.com"
  );
});

test(`it calls Mixpanel setServerURL`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.setServerURL("https://api-eu.mixpanel.com");
  expect(MixpanelMain.mock.instances[0].setServerURL).toBeCalledWith(
    "token",
    "https://api-eu.mixpanel.com"
  );
});

test(`it calls Mixpanel setLoggingEnabled`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.setLoggingEnabled(true);
  expect(MixpanelMain.mock.instances[0].setLoggingEnabled).toBeCalledWith(
    "token",
    true
  );
});

test(`it calls Mixpanel setUseIpAddressForGeolocation`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.setUseIpAddressForGeolocation(true);
  expect(
    MixpanelMain.mock.instances[0].setUseIpAddressForGeolocation
  ).toBeCalledWith("token", true);
});

test(`it calls Mixpanel hasOptedOutTracking`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.hasOptedOutTracking();
  expect(MixpanelMain.mock.instances[0].hasOptedOutTracking).toBeCalledWith(
    "token"
  );
});

test(`it calls Mixpanel optInTracking`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.optInTracking();
  expect(MixpanelMain.mock.instances[0].optInTracking).toBeCalledWith("token");
});

test(`it calls Mixpanel optOutTracking`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.optOutTracking();
  expect(MixpanelMain.mock.instances[0].optOutTracking).toBeCalledWith("token");
});

test(`it calls Mixpanel identify`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.identify("distinct_id");
  expect(MixpanelMain.mock.instances[0].identify).toBeCalledWith(
    "token",
    "distinct_id"
  );
});

test(`it calls Mixpanel track`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.track("event name", { "Cool Property": "Property Value" });
  expect(MixpanelMain.mock.instances[0].track).toBeCalledWith(
    "token",
    "event name",
    { "Cool Property": "Property Value" }
  );
});

test(`it calls Mixpanel trackWithGroups`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.trackWithGroups(
    "tracked with groups",
    { a: 1, b: 2.3 },
    { company_id: "Mixpanel" }
  );
  expect(MixpanelMain.mock.instances[0].trackWithGroups).toBeCalledWith(
    "token",
    "tracked with groups",
    { a: 1, b: 2.3 },
    { company_id: "Mixpanel" }
  );
});

test(`it calls Mixpanel setGroup`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.setGroup("company_id", 12345);
  expect(MixpanelMain.mock.instances[0].setGroup).toBeCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls Mixpanel addGroup`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.addGroup("company_id", 12345);
  expect(MixpanelMain.mock.instances[0].addGroup).toBeCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls Mixpanel removeGroup`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.removeGroup("company_id", 12345);
  expect(MixpanelMain.mock.instances[0].removeGroup).toBeCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls Mixpanel deleteGroup`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.deleteGroup("company_id", 12345);
  expect(MixpanelMain.mock.instances[0].deleteGroup).toBeCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls Mixpanel registerSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.registerSuperProperties({
    "super property": "super property value",
    "super property1": "super property value1",
  });
  expect(MixpanelMain.mock.instances[0].registerSuperProperties).toBeCalledWith(
    "token",
    {
      "super property": "super property value",
      "super property1": "super property value1",
    }
  );
});

test(`it calls Mixpanel registerSuperPropertiesOnce`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.registerSuperPropertiesOnce({
    "super property": "super property value",
    "super property1": "super property value1",
  });
  expect(
    MixpanelMain.mock.instances[0].registerSuperPropertiesOnce
  ).toBeCalledWith("token", {
    "super property": "super property value",
    "super property1": "super property value1",
  });
});

test(`it calls Mixpanel unregisterSuperProperty`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.unregisterSuperProperty("super property");
  expect(MixpanelMain.mock.instances[0].unregisterSuperProperty).toBeCalledWith(
    "token",
    "super property"
  );
});

test(`it calls Mixpanel getSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getSuperProperties();
  expect(MixpanelMain.mock.instances[0].getSuperProperties).toBeCalledWith(
    "token"
  );
});

test(`it calls Mixpanel clearSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.clearSuperProperties();
  expect(MixpanelMain.mock.instances[0].clearSuperProperties).toBeCalledWith(
    "token"
  );
});

test(`it calls Mixpanel timeEvent`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.timeEvent("Timed Event");
  expect(MixpanelMain.mock.instances[0].timeEvent).toBeCalledWith(
    "token",
    "Timed Event"
  );
});

test(`it calls Mixpanel eventElapsedTime`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.eventElapsedTime("Timed Event");
  expect(MixpanelMain.mock.instances[0].eventElapsedTime).toBeCalledWith(
    "token",
    "Timed Event"
  );
});

test(`it calls Mixpanel reset`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.reset();
  expect(MixpanelMain.mock.instances[0].reset).toBeCalledWith("token");
});

test(`it calls Mixpanel getDistinctId`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getDistinctId();
  expect(MixpanelMain.mock.instances[0].getDistinctId).toBeCalledWith("token");
});

test(`it calls Mixpanel profile set`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().set({
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  expect(MixpanelMain.mock.instances[0].set).toBeCalledWith("token", {
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  // set one property
  mixpanel.getPeople().set("a", 1);
  expect(MixpanelMain.mock.instances[0].set).toBeCalledWith("token", {
    a: 1,
  });
});

test(`it calls Mixpanel profile setOnce`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().setOnce({
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  expect(MixpanelMain.mock.instances[0].setOnce).toBeCalledWith("token", {
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  // set one property
  mixpanel.getPeople().setOnce("a", 1);
  expect(MixpanelMain.mock.instances[0].setOnce).toBeCalledWith("token", {
    a: 1,
  });
});

test(`it calls Mixpanel profile increment`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().increment({
    a: 1,
    b: 2.3,
  });
  expect(MixpanelMain.mock.instances[0].increment).toBeCalledWith("token", {
    a: 1,
    b: 2.3,
  });
  // set one property
  mixpanel.getPeople().increment("a", 1);
  expect(MixpanelMain.mock.instances[0].increment).toBeCalledWith("token", {
    a: 1,
  });
});

test(`it calls Mixpanel profile append`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().append("a", "1");
  expect(MixpanelMain.mock.instances[0].append).toBeCalledWith("token", {
    a: "1",
  });
});

test(`it calls Mixpanel profile union`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().union("a1", "1");
  expect(MixpanelMain.mock.instances[0].union).toBeCalledWith("token", {
    a1: ["1"],
  });
});

test(`it calls Mixpanel profile remove`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().remove("a", "1");
  expect(MixpanelMain.mock.instances[0].remove).toBeCalledWith("token", {
    a: "1",
  });
});

test(`it calls Mixpanel profile unset`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().unset("a");
  expect(MixpanelMain.mock.instances[0].unset).toBeCalledWith("token", "a");
});

test(`it calls Mixpanel profile trackCharge`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().trackCharge(22.8);
  expect(MixpanelMain.mock.instances[0].trackCharge).toBeCalledWith(
    "token",
    22.8,
    {}
  );
});

test(`it calls Mixpanel profile clearCharges`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().clearCharges();
  expect(MixpanelMain.mock.instances[0].clearCharges).toBeCalledWith("token");
});

test(`it calls Mixpanel profile deleteUser`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getPeople().deleteUser();
  expect(MixpanelMain.mock.instances[0].deleteUser).toBeCalledWith("token");
});

test(`it calls Mixpanel group set properties`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).set("prop_key", "prop_value");
  expect(
    MixpanelMain.mock.instances[0].groupSetProperties
  ).toBeCalledWith("token", "company_id", 12345, { prop_key: "prop_value" });
});

test(`it calls Mixpanel group set property once`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).setOnce("prop_key", "prop_value");
  expect(
    MixpanelMain.mock.instances[0].groupSetPropertyOnce
  ).toBeCalledWith("token", "company_id", 12345, { prop_key: "prop_value" });
});

test(`it calls Mixpanel group unset property`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).unset("prop_key");
  expect(MixpanelMain.mock.instances[0].groupUnsetProperty).toBeCalledWith(
    "token",
    "company_id",
    12345,
    "prop_key"
  );
});

test(`it calls Mixpanel group remove property`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).remove("prop_key", "334");
  expect(
    MixpanelMain.mock.instances[0].groupRemovePropertyValue
  ).toBeCalledWith("token", "company_id", 12345, "prop_key", "334");
});

test(`it calls Mixpanel group union property`, async () => {
  const mixpanel = new Mixpanel("token", true, false);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).union("prop_key", "334");
  expect(
    MixpanelMain.mock.instances[0].groupUnionProperty
  ).toBeCalledWith("token", "company_id", 12345, "prop_key", ["334"]);
});
