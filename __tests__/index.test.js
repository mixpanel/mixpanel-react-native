/**
 * @format
 */

import { Mixpanel } from 'mixpanel-react-native';

import { NativeModules } from 'react-native';


test(`it calls MixpanelReactNative initialize`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  expect(NativeModules.MixpanelReactNative.initialize).toBeCalledWith("token", true, false, {"$lib_version": "2.2.5", "mp_lib": "react-native"});
});

test(`it calls MixpanelReactNative initialize with optOut and superProperties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init(true, {"super": "property"})
  expect(NativeModules.MixpanelReactNative.initialize).toBeCalledWith("token", true, true, {"$lib_version": "2.2.5", "mp_lib": "react-native", "super": "property"}, "https://api.mixpanel.com");
});

test(`it calls MixpanelReactNative setServerURL`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.setServerURL("https://api-eu.mixpanel.com");
  expect(NativeModules.MixpanelReactNative.setServerURL).toBeCalledWith("token", "https://api-eu.mixpanel.com");
});

test(`it calls MixpanelReactNative setLoggingEnabled`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.setLoggingEnabled(true);
  expect(NativeModules.MixpanelReactNative.setLoggingEnabled).toBeCalledWith("token", true);
});

test(`it calls MixpanelReactNative setUseIpAddressForGeolocation`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.setUseIpAddressForGeolocation(true);
  expect(NativeModules.MixpanelReactNative.setUseIpAddressForGeolocation).toBeCalledWith("token", true);
});

test(`it calls MixpanelReactNative hasOptedOutTracking`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.hasOptedOutTracking();
  expect(NativeModules.MixpanelReactNative.hasOptedOutTracking).toBeCalledWith("token");
});


test(`it calls MixpanelReactNative optInTracking`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.optInTracking();
  expect(NativeModules.MixpanelReactNative.optInTracking).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative optOutTracking`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.optOutTracking();
  expect(NativeModules.MixpanelReactNative.optOutTracking).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative identify`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.identify("distinct_id");
  expect(NativeModules.MixpanelReactNative.identify).toBeCalledWith("token", "distinct_id");
});

test(`it calls MixpanelReactNative alias`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.alias("alias", "distinct_id");
  expect(NativeModules.MixpanelReactNative.alias).toBeCalledWith("token", "alias", "distinct_id");
});

test(`it calls MixpanelReactNative track`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.track("event name",  {"Cool Property": "Property Value"});
  expect(NativeModules.MixpanelReactNative.track).toBeCalledWith("token", "event name",  {"Cool Property": "Property Value"});
});

test(`it calls MixpanelReactNative trackWithGroups`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.trackWithGroups("tracked with groups", {"a": 1, "b": 2.3}, {"company_id": "Mixpanel"});
  expect(NativeModules.MixpanelReactNative.trackWithGroups).toBeCalledWith("token", "tracked with groups", {"a": 1, "b": 2.3}, {"company_id": "Mixpanel"});
});

test(`it calls MixpanelReactNative setGroup`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.setGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.setGroup).toBeCalledWith("token", "company_id", 12345);
});

test(`it calls MixpanelReactNative addGroup`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.addGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.addGroup).toBeCalledWith("token", "company_id", 12345);
});

test(`it calls MixpanelReactNative removeGroup`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.removeGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.removeGroup).toBeCalledWith("token", "company_id", 12345);
});

test(`it calls MixpanelReactNative deleteGroup`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.deleteGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.deleteGroup).toBeCalledWith("token", "company_id", 12345);
});

test(`it calls MixpanelReactNative registerSuperProperties`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.registerSuperProperties({
    "super property": "super property value",
    "super property1": "super property value1",
  });
  expect(NativeModules.MixpanelReactNative.registerSuperProperties).toBeCalledWith("token", {
    "super property": "super property value",
    "super property1": "super property value1",
  });
});

test(`it calls MixpanelReactNative registerSuperPropertiesOnce`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.registerSuperPropertiesOnce({
    "super property": "super property value",
    "super property1": "super property value1",
  });
  expect(NativeModules.MixpanelReactNative.registerSuperProperties).toBeCalledWith("token", {
    "super property": "super property value",
    "super property1": "super property value1",
  });
});

test(`it calls MixpanelReactNative unregisterSuperProperty`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.unregisterSuperProperty("super property");
  expect(NativeModules.MixpanelReactNative.unregisterSuperProperty).toBeCalledWith("token", "super property");
});

test(`it calls MixpanelReactNative getSuperProperties`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getSuperProperties();
  expect(NativeModules.MixpanelReactNative.getSuperProperties).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative clearSuperProperties`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.clearSuperProperties();
  expect(NativeModules.MixpanelReactNative.clearSuperProperties).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative timeEvent`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.timeEvent("Timed Event");
  expect(NativeModules.MixpanelReactNative.timeEvent).toBeCalledWith("token", "Timed Event");
});

test(`it calls MixpanelReactNative eventElapsedTime`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.eventElapsedTime("Timed Event");
  expect(NativeModules.MixpanelReactNative.eventElapsedTime).toBeCalledWith("token", "Timed Event");
});

test(`it calls MixpanelReactNative reset`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.reset();
  expect(NativeModules.MixpanelReactNative.reset).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative getDistinctId`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getDistinctId();
  expect(NativeModules.MixpanelReactNative.getDistinctId).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative profile set`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().set({
    "a": 1,
    "b": 2.3,
    "c": ["4", 5],
  });
  expect(NativeModules.MixpanelReactNative.set).toBeCalledWith("token", {
    "a": 1,
    "b": 2.3,
    "c": ["4", 5],
  });
  // set one property
  mixpanel.getPeople().set("a", 1);
  expect(NativeModules.MixpanelReactNative.set).toBeCalledWith("token", {"a": 1});
});

test(`it calls MixpanelReactNative profile setOnce`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().setOnce({
    "a": 1,
    "b": 2.3,
    "c": ["4", 5],
  });
  expect(NativeModules.MixpanelReactNative.setOnce).toBeCalledWith("token", {
    "a": 1,
    "b": 2.3,
    "c": ["4", 5],
  });
  // set one property
  mixpanel.getPeople().setOnce("a", 1);
  expect(NativeModules.MixpanelReactNative.setOnce).toBeCalledWith("token", {"a": 1});
});

test(`it calls MixpanelReactNative profile increment`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().increment({
    "a": 1,
    "b": 2.3,
  });
  expect(NativeModules.MixpanelReactNative.increment).toBeCalledWith("token", {
    "a": 1,
    "b": 2.3,
  });
  // set one property
  mixpanel.getPeople().increment("a", 1);
  expect(NativeModules.MixpanelReactNative.increment).toBeCalledWith("token", {"a": 1});
});

test(`it calls MixpanelReactNative profile append`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().append("a", "1");
  expect(NativeModules.MixpanelReactNative.append).toBeCalledWith("token", {"a": "1"});
});

test(`it calls MixpanelReactNative profile union`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().union("a1", "1");
  expect(NativeModules.MixpanelReactNative.union).toBeCalledWith("token", {"a1": ["1"]});
});

test(`it calls MixpanelReactNative profile remove`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().remove("a", "1");
  expect(NativeModules.MixpanelReactNative.remove).toBeCalledWith("token", {"a": "1"});
});

test(`it calls MixpanelReactNative profile unset`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().unset("a");
  expect(NativeModules.MixpanelReactNative.unset).toBeCalledWith("token", "a");
});

test(`it calls MixpanelReactNative profile trackCharge`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().trackCharge(22.8);
  expect(NativeModules.MixpanelReactNative.trackCharge).toBeCalledWith("token", 22.8, {});
});

test(`it calls MixpanelReactNative profile clearCharges`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().clearCharges();
  expect(NativeModules.MixpanelReactNative.clearCharges).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative profile deleteUser`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getPeople().deleteUser();
  expect(NativeModules.MixpanelReactNative.deleteUser).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative group set properties`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getGroup("company_id", 12345).set("prop_key", "prop_value");
  expect(NativeModules.MixpanelReactNative.groupSetProperties).toBeCalledWith("token", "company_id", 12345, {"prop_key": "prop_value"});
});

test(`it calls MixpanelReactNative group set property once`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getGroup("company_id", 12345).setOnce("prop_key", "prop_value");
  expect(NativeModules.MixpanelReactNative.groupSetPropertyOnce).toBeCalledWith("token", "company_id", 12345, {"prop_key": "prop_value"});
});

test(`it calls MixpanelReactNative group unset property`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getGroup("company_id", 12345).unset("prop_key");
  expect(NativeModules.MixpanelReactNative.groupUnsetProperty).toBeCalledWith("token", "company_id", 12345, "prop_key");
});

test(`it calls MixpanelReactNative group remove property`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getGroup("company_id", 12345).remove("prop_key", "334");
  expect(NativeModules.MixpanelReactNative.groupRemovePropertyValue).toBeCalledWith("token", "company_id", 12345, "prop_key", "334");
});

test(`it calls MixpanelReactNative group union property`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  mixpanel.getGroup("company_id", 12345).union("prop_key", "334");
  expect(NativeModules.MixpanelReactNative.groupRemovePropertyValue).toBeCalledWith("token", "company_id", 12345, "prop_key", "334");
});
