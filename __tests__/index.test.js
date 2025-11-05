import { Mixpanel } from "mixpanel-react-native";
import { NativeModules } from "react-native";

test(`it calls MixpanelReactNative initialize`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  expect(NativeModules.MixpanelReactNative.initialize).toHaveBeenCalledWith(
    "token",
    true,
    false,
    { $lib_version: expect.any(String), mp_lib: "react-native" },
    "https://api.mixpanel.com"
  );
});

test(`it calls MixpanelReactNative initialize with optOut, superProperties and useGzipCompression`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init(true, { super: "property" });
  expect(NativeModules.MixpanelReactNative.initialize).toHaveBeenCalledWith(
    "token",
    true,
    true,
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
      super: "property",
    },
    "https://api.mixpanel.com",
    false
  );
});

test(`it passes useGzipCompression parameter to native modules when enabled`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init(false, {}, "https://api.mixpanel.com", true);
  expect(NativeModules.MixpanelReactNative.initialize).toHaveBeenCalledWith(
    "token",
    true,
    false,
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
    },
    "https://api.mixpanel.com",
    true
  );
});

test(`it calls MixpanelReactNative setServerURL`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setServerURL("https://api-eu.mixpanel.com");
  expect(NativeModules.MixpanelReactNative.setServerURL).toHaveBeenCalledWith(
    "token",
    "https://api-eu.mixpanel.com"
  );
});

test(`it calls MixpanelReactNative setLoggingEnabled`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setLoggingEnabled(true);
  expect(NativeModules.MixpanelReactNative.setLoggingEnabled).toHaveBeenCalledWith(
    "token",
    true
  );
});

test(`it calls MixpanelReactNative setUseIpAddressForGeolocation`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setUseIpAddressForGeolocation(true);
  expect(
    NativeModules.MixpanelReactNative.setUseIpAddressForGeolocation
  ).toHaveBeenCalledWith("token", true);
});

test(`it calls MixpanelReactNative setFlushBatchSize`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setFlushBatchSize(20);
  expect(NativeModules.MixpanelReactNative.setFlushBatchSize).toHaveBeenCalledWith(
    "token",
    20
  );
});

test(`it calls MixpanelReactNative hasOptedOutTracking`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.hasOptedOutTracking();
  expect(NativeModules.MixpanelReactNative.hasOptedOutTracking).toHaveBeenCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative optInTracking`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.optInTracking();
  expect(NativeModules.MixpanelReactNative.optInTracking).toHaveBeenCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative optOutTracking`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.optOutTracking();
  expect(NativeModules.MixpanelReactNative.optOutTracking).toHaveBeenCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative identify`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.identify("distinct_id");
  expect(NativeModules.MixpanelReactNative.identify).toHaveBeenCalledWith(
    "token",
    "distinct_id"
  );
});

test(`it calls MixpanelReactNative alias`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.alias("alias", "distinct_id");
  expect(NativeModules.MixpanelReactNative.alias).toHaveBeenCalledWith(
    "token",
    "alias",
    "distinct_id"
  );
});

test(`it calls MixpanelReactNative track`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.track("event name", {
    "Cool Property": "Property Value",
  });
  expect(NativeModules.MixpanelReactNative.track).toHaveBeenCalledWith(
    "token",
    "event name",
    {
      "Cool Property": "Property Value",
      $lib_version: expect.any(String),
      mp_lib: "react-native",
    }
  );
});

test(`it calls MixpanelReactNative trackWithGroups`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.trackWithGroups(
    "tracked with groups",
    { a: 1, b: 2.3 },
    { company_id: "Mixpanel" }
  );
  expect(NativeModules.MixpanelReactNative.trackWithGroups).toHaveBeenCalledWith(
    "token",
    "tracked with groups",
    { a: 1, b: 2.3, $lib_version: expect.any(String), mp_lib: "react-native" },
    { company_id: "Mixpanel" }
  );
});

test(`it calls MixpanelReactNative setGroup`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.setGroup).toHaveBeenCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls MixpanelReactNative addGroup`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.addGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.addGroup).toHaveBeenCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls MixpanelReactNative removeGroup`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.removeGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.removeGroup).toHaveBeenCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls MixpanelReactNative deleteGroup`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.deleteGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.deleteGroup).toHaveBeenCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls MixpanelReactNative registerSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.registerSuperProperties({
    "super property": "super property value",
    "super property1": "super property value1",
  });
  expect(
    NativeModules.MixpanelReactNative.registerSuperProperties
  ).toHaveBeenCalledWith("token", {
    "super property": "super property value",
    "super property1": "super property value1",
  });
});

test(`it calls MixpanelReactNative registerSuperPropertiesOnce`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.registerSuperPropertiesOnce({
    "super property": "super property value",
    "super property1": "super property value1",
  });
  expect(
    NativeModules.MixpanelReactNative.registerSuperProperties
  ).toHaveBeenCalledWith("token", {
    "super property": "super property value",
    "super property1": "super property value1",
  });
});

test(`it calls MixpanelReactNative unregisterSuperProperty`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.unregisterSuperProperty("super property");
  expect(
    NativeModules.MixpanelReactNative.unregisterSuperProperty
  ).toHaveBeenCalledWith("token", "super property");
});

test(`it calls MixpanelReactNative getSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getSuperProperties();
  expect(NativeModules.MixpanelReactNative.getSuperProperties).toHaveBeenCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative clearSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.clearSuperProperties();
  expect(NativeModules.MixpanelReactNative.clearSuperProperties).toHaveBeenCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative timeEvent`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.timeEvent("Timed Event");
  expect(NativeModules.MixpanelReactNative.timeEvent).toHaveBeenCalledWith(
    "token",
    "Timed Event"
  );
});

test(`it calls MixpanelReactNative eventElapsedTime`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.eventElapsedTime("Timed Event");
  expect(NativeModules.MixpanelReactNative.eventElapsedTime).toHaveBeenCalledWith(
    "token",
    "Timed Event"
  );
});

test(`it calls MixpanelReactNative reset`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.reset();
  expect(NativeModules.MixpanelReactNative.reset).toHaveBeenCalledWith("token");
});

test(`it calls MixpanelReactNative getDistinctId`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getDistinctId();
  expect(NativeModules.MixpanelReactNative.getDistinctId).toHaveBeenCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative profile set`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().set({
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  expect(NativeModules.MixpanelReactNative.set).toHaveBeenCalledWith("token", {
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  // set one property
  mixpanel.getPeople().set("a", 1);
  expect(NativeModules.MixpanelReactNative.set).toHaveBeenCalledWith("token", {
    a: 1,
  });
});

test(`it calls MixpanelReactNative profile setOnce`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().setOnce({
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  expect(NativeModules.MixpanelReactNative.setOnce).toHaveBeenCalledWith("token", {
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  // set one property
  mixpanel.getPeople().setOnce("a", 1);
  expect(NativeModules.MixpanelReactNative.setOnce).toHaveBeenCalledWith("token", {
    a: 1,
  });
});

test(`it calls MixpanelReactNative profile increment`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().increment({
    a: 1,
    b: 2.3,
  });
  expect(NativeModules.MixpanelReactNative.increment).toHaveBeenCalledWith("token", {
    a: 1,
    b: 2.3,
  });
  // set one property
  mixpanel.getPeople().increment("a", 1);
  expect(NativeModules.MixpanelReactNative.increment).toHaveBeenCalledWith("token", {
    a: 1,
  });
});

test(`it calls MixpanelReactNative profile append`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().append("a", "1");
  expect(NativeModules.MixpanelReactNative.append).toHaveBeenCalledWith("token", {
    a: "1",
  });
});

test(`it calls MixpanelReactNative profile union`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().union("a1", "1");
  expect(NativeModules.MixpanelReactNative.union).toHaveBeenCalledWith("token", {
    a1: ["1"],
  });
});

test(`it calls MixpanelReactNative profile remove`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().remove("a", "1");
  expect(NativeModules.MixpanelReactNative.remove).toHaveBeenCalledWith("token", {
    a: "1",
  });
});

test(`it calls MixpanelReactNative profile unset`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().unset("a");
  expect(NativeModules.MixpanelReactNative.unset).toHaveBeenCalledWith("token", "a");
});

test(`it calls MixpanelReactNative profile trackCharge`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().trackCharge(22.8);
  expect(NativeModules.MixpanelReactNative.trackCharge).toHaveBeenCalledWith(
    "token",
    22.8,
    {}
  );
});

test(`it calls MixpanelReactNative profile clearCharges`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().clearCharges();
  expect(NativeModules.MixpanelReactNative.clearCharges).toHaveBeenCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative profile deleteUser`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().deleteUser();
  expect(NativeModules.MixpanelReactNative.deleteUser).toHaveBeenCalledWith("token");
});

test(`it calls MixpanelReactNative group set properties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).set("prop_key", "prop_value");
  expect(NativeModules.MixpanelReactNative.groupSetProperties).toHaveBeenCalledWith(
    "token",
    "company_id",
    12345,
    { prop_key: "prop_value" }
  );
});

test(`it calls MixpanelReactNative group set property once`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).setOnce("prop_key", "prop_value");
  expect(NativeModules.MixpanelReactNative.groupSetPropertyOnce).toHaveBeenCalledWith(
    "token",
    "company_id",
    12345,
    { prop_key: "prop_value" }
  );
});

test(`it calls MixpanelReactNative group unset property`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).unset("prop_key");
  expect(NativeModules.MixpanelReactNative.groupUnsetProperty).toHaveBeenCalledWith(
    "token",
    "company_id",
    12345,
    "prop_key"
  );
});

test(`it calls MixpanelReactNative group remove property`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).remove("prop_key", "334");
  expect(
    NativeModules.MixpanelReactNative.groupRemovePropertyValue
  ).toHaveBeenCalledWith("token", "company_id", 12345, "prop_key", "334");
});

test(`it calls MixpanelReactNative group union property`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).union("prop_key", "334");
  expect(
    NativeModules.MixpanelReactNative.groupRemovePropertyValue
  ).toHaveBeenCalledWith("token", "company_id", 12345, "prop_key", "334");
});
