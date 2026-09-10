import { Mixpanel } from "mixpanel-react-native";
import { NativeModules } from "react-native";

test(`it calls MixpanelReactNative initialize`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  expect(NativeModules.MixpanelReactNative.initialize).toBeCalledWith(
    "token",
    true,
    false,
    { $lib_version: expect.any(String), mp_lib: "react-native" },
    "https://api.mixpanel.com",
    false,
    {},
    null
  );
});

test(`it calls MixpanelReactNative initialize with optOut, superProperties and useGzipCompression`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init(true, { super: "property" });
  expect(NativeModules.MixpanelReactNative.initialize).toBeCalledWith(
    "token",
    true,
    true,
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
      super: "property",
    },
    "https://api.mixpanel.com",
    false,
    {},
    null
  );
});

test(`it passes useGzipCompression parameter to native modules when enabled`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init(false, {}, "https://api.mixpanel.com", true);
  expect(NativeModules.MixpanelReactNative.initialize).toBeCalledWith(
    "token",
    true,
    false,
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
    },
    "https://api.mixpanel.com",
    true,
    {},
    null
  );
});

test(`it calls MixpanelReactNative setServerURL`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setServerURL("https://api-eu.mixpanel.com");
  expect(NativeModules.MixpanelReactNative.setServerURL).toBeCalledWith(
    "token",
    "https://api-eu.mixpanel.com"
  );
});

test(`it calls MixpanelReactNative setLoggingEnabled`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setLoggingEnabled(true);
  expect(NativeModules.MixpanelReactNative.setLoggingEnabled).toBeCalledWith(
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
  ).toBeCalledWith("token", true);
});

test(`it calls MixpanelReactNative setFlushBatchSize`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.setFlushBatchSize(20);
  expect(NativeModules.MixpanelReactNative.setFlushBatchSize).toBeCalledWith(
    "token",
    20
  );
});

test(`it calls MixpanelReactNative hasOptedOutTracking`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.hasOptedOutTracking();
  expect(NativeModules.MixpanelReactNative.hasOptedOutTracking).toBeCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative optInTracking`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.optInTracking();
  expect(NativeModules.MixpanelReactNative.optInTracking).toBeCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative optOutTracking`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.optOutTracking();
  expect(NativeModules.MixpanelReactNative.optOutTracking).toBeCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative identify`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.identify("distinct_id");
  expect(NativeModules.MixpanelReactNative.identify).toBeCalledWith(
    "token",
    "distinct_id"
  );
});

test(`it calls MixpanelReactNative alias`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.alias("alias", "distinct_id");
  expect(NativeModules.MixpanelReactNative.alias).toBeCalledWith(
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
  expect(NativeModules.MixpanelReactNative.track).toBeCalledWith(
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
  expect(NativeModules.MixpanelReactNative.trackWithGroups).toBeCalledWith(
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
  expect(NativeModules.MixpanelReactNative.setGroup).toBeCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls MixpanelReactNative addGroup`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.addGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.addGroup).toBeCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls MixpanelReactNative removeGroup`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.removeGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.removeGroup).toBeCalledWith(
    "token",
    "company_id",
    12345
  );
});

test(`it calls MixpanelReactNative deleteGroup`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.deleteGroup("company_id", 12345);
  expect(NativeModules.MixpanelReactNative.deleteGroup).toBeCalledWith(
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
  ).toBeCalledWith("token", {
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
  ).toBeCalledWith("token", {
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
  ).toBeCalledWith("token", "super property");
});

test(`it calls MixpanelReactNative getSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getSuperProperties();
  expect(NativeModules.MixpanelReactNative.getSuperProperties).toBeCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative clearSuperProperties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.clearSuperProperties();
  expect(NativeModules.MixpanelReactNative.clearSuperProperties).toBeCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative timeEvent`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.timeEvent("Timed Event");
  expect(NativeModules.MixpanelReactNative.timeEvent).toBeCalledWith(
    "token",
    "Timed Event"
  );
});

test(`it calls MixpanelReactNative eventElapsedTime`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.eventElapsedTime("Timed Event");
  expect(NativeModules.MixpanelReactNative.eventElapsedTime).toBeCalledWith(
    "token",
    "Timed Event"
  );
});

test(`it calls MixpanelReactNative reset`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.reset();
  expect(NativeModules.MixpanelReactNative.reset).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative getDistinctId`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getDistinctId();
  expect(NativeModules.MixpanelReactNative.getDistinctId).toBeCalledWith(
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
  expect(NativeModules.MixpanelReactNative.set).toBeCalledWith("token", {
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  // set one property
  mixpanel.getPeople().set("a", 1);
  expect(NativeModules.MixpanelReactNative.set).toBeCalledWith("token", {
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
  expect(NativeModules.MixpanelReactNative.setOnce).toBeCalledWith("token", {
    a: 1,
    b: 2.3,
    c: ["4", 5],
  });
  // set one property
  mixpanel.getPeople().setOnce("a", 1);
  expect(NativeModules.MixpanelReactNative.setOnce).toBeCalledWith("token", {
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
  expect(NativeModules.MixpanelReactNative.increment).toBeCalledWith("token", {
    a: 1,
    b: 2.3,
  });
  // set one property
  mixpanel.getPeople().increment("a", 1);
  expect(NativeModules.MixpanelReactNative.increment).toBeCalledWith("token", {
    a: 1,
  });
});

test(`it calls MixpanelReactNative profile append`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().append("a", "1");
  expect(NativeModules.MixpanelReactNative.append).toBeCalledWith("token", {
    a: "1",
  });
});

test(`it calls MixpanelReactNative profile union`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().union("a1", "1");
  expect(NativeModules.MixpanelReactNative.union).toBeCalledWith("token", {
    a1: ["1"],
  });
});

test(`it calls MixpanelReactNative profile remove`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().remove("a", "1");
  expect(NativeModules.MixpanelReactNative.remove).toBeCalledWith("token", {
    a: "1",
  });
});

test(`it calls MixpanelReactNative profile unset`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().unset("a");
  expect(NativeModules.MixpanelReactNative.unset).toBeCalledWith("token", "a");
});

test(`it calls MixpanelReactNative profile trackCharge`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().trackCharge(22.8);
  expect(NativeModules.MixpanelReactNative.trackCharge).toBeCalledWith(
    "token",
    22.8,
    {}
  );
});

test(`it calls MixpanelReactNative profile clearCharges`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().clearCharges();
  expect(NativeModules.MixpanelReactNative.clearCharges).toBeCalledWith(
    "token"
  );
});

test(`it calls MixpanelReactNative profile deleteUser`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getPeople().deleteUser();
  expect(NativeModules.MixpanelReactNative.deleteUser).toBeCalledWith("token");
});

test(`it calls MixpanelReactNative group set properties`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).set("prop_key", "prop_value");
  expect(NativeModules.MixpanelReactNative.groupSetProperties).toBeCalledWith(
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
  expect(NativeModules.MixpanelReactNative.groupSetPropertyOnce).toBeCalledWith(
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
  expect(NativeModules.MixpanelReactNative.groupUnsetProperty).toBeCalledWith(
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
  ).toBeCalledWith("token", "company_id", 12345, "prop_key", "334");
});

test(`it calls MixpanelReactNative group union property`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  mixpanel.getGroup("company_id", 12345).union("prop_key", "334");
  expect(
    NativeModules.MixpanelReactNative.groupRemovePropertyValue
  ).toBeCalledWith("token", "company_id", 12345, "prop_key", "334");
});

test(`autocapture getter returns an Autocapture instance and is lazily initialized`, async () => {
  const mixpanel = new Mixpanel("token", true);
  mixpanel.init();
  const autocapture1 = mixpanel.autocapture;
  const autocapture2 = mixpanel.autocapture;
  expect(autocapture1).toBeDefined();
  expect(autocapture1).toBe(autocapture2);
});

test(`autocapture.trackScreenView emits $mp_page_view with merged metadata`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();
  mixpanel.autocapture.trackScreenView("HomeScreen", { custom_prop: "value" });
  expect(NativeModules.MixpanelReactNative.track).toBeCalledWith(
    "token",
    "$mp_page_view",
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
      custom_prop: "value",
      current_page_title: "HomeScreen",
      $mp_autocapture: true,
    }
  );
});

test(`autocapture.trackScreenView emits $mp_page_view with only metadata when no extra properties given`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();
  mixpanel.autocapture.trackScreenView("HomeScreen");
  expect(NativeModules.MixpanelReactNative.track).toBeCalledWith(
    "token",
    "$mp_page_view",
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
      current_page_title: "HomeScreen",
      $mp_autocapture: true,
    }
  );
});

test(`autocapture.trackScreenView emits nothing when screenName is invalid`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();
  mixpanel.autocapture.trackScreenView("");
  expect(NativeModules.MixpanelReactNative.track).not.toBeCalled();
  mixpanel.autocapture.trackScreenView(null);
  expect(NativeModules.MixpanelReactNative.track).not.toBeCalled();
});

test(`autocapture.trackScreenLeave emits $mp_page_leave with merged metadata`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();
  mixpanel.autocapture.trackScreenLeave("HomeScreen", { custom_prop: "value" });
  expect(NativeModules.MixpanelReactNative.track).toBeCalledWith(
    "token",
    "$mp_page_leave",
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
      custom_prop: "value",
      current_page_title: "HomeScreen",
      $mp_autocapture: true,
    }
  );
});

test(`autocapture.trackScreenLeave emits $mp_page_leave with only metadata when no extra properties given`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();
  mixpanel.autocapture.trackScreenLeave("HomeScreen");
  expect(NativeModules.MixpanelReactNative.track).toBeCalledWith(
    "token",
    "$mp_page_leave",
    {
      $lib_version: expect.any(String),
      mp_lib: "react-native",
      current_page_title: "HomeScreen",
      $mp_autocapture: true,
    }
  );
});

test(`autocapture.trackScreenLeave emits nothing when screenName is invalid`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();
  mixpanel.autocapture.trackScreenLeave("");
  expect(NativeModules.MixpanelReactNative.track).not.toBeCalled();
  mixpanel.autocapture.trackScreenLeave(null);
  expect(NativeModules.MixpanelReactNative.track).not.toBeCalled();
});

// Autocapture property precedence.
//
// `MixpanelMain.track` applies identity fields after caller properties so they cannot be
// replaced, and both the native and JavaScript-mode screen-view paths did the same for
// `current_page_title` and `$mp_autocapture`. These pin that ordering for the JS emitter.

test(`autocapture derived click fields outrank caller properties`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();

  mixpanel.autocapture.trackClick(
    { x: 10, y: 20, elementId: "checkout_button" },
    { $el_id: "spoofed", $x: 999, custom: "kept" }
  );

  const [, eventName, props] = NativeModules.MixpanelReactNative.track.mock.calls[0];
  expect(eventName).toBe("$mp_click");
  expect(props.$el_id).toBe("checkout_button");
  expect(props.$x).toBe(10);
  expect(props.custom).toBe("kept");
});

test(`$mp_autocapture cannot be turned off by a caller property`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();

  mixpanel.autocapture.trackClick(
    { x: 1, y: 2, elementId: "btn" },
    { $mp_autocapture: false }
  );

  const [, , props] = NativeModules.MixpanelReactNative.track.mock.calls[0];
  expect(props.$mp_autocapture).toBe(true);
});

test(`current_page_title comes from the screenName argument, not caller properties`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();

  mixpanel.autocapture.trackScreenView("Checkout", {
    current_page_title: "spoofed",
    custom: "kept",
  });

  const [, eventName, props] = NativeModules.MixpanelReactNative.track.mock.calls[0];
  expect(eventName).toBe("$mp_page_view");
  expect(props.current_page_title).toBe("Checkout");
  expect(props.custom).toBe("kept");
});

test(`metadata stays overridable, matching MixpanelMain.track`, async () => {
  const mixpanel = await Mixpanel.init("token", true);
  NativeModules.MixpanelReactNative.track.mockClear();

  mixpanel.autocapture.trackScreenLeave("Checkout", { mp_lib: "custom" });

  const [, , props] = NativeModules.MixpanelReactNative.track.mock.calls[0];
  expect(props.mp_lib).toBe("custom");
  expect(props.current_page_title).toBe("Checkout");
});

// Autocapture option normalization.
//
// `autocaptureOptions` accepts a boolean shorthand or an options object per signal, and any
// signal left out keeps its default. These assert on the eighth `initialize` argument, which is
// what actually reaches the native SDKs.

const initArgs = () =>
  NativeModules.MixpanelReactNative.initialize.mock.calls.at(-1)[7];

test(`autocapture options are omitted entirely when not requested`, async () => {
  NativeModules.MixpanelReactNative.initialize.mockClear();
  await Mixpanel.init("token", true);
  expect(initArgs()).toBeNull();
});

test(`boolean shorthand expands to { enabled }`, async () => {
  NativeModules.MixpanelReactNative.initialize.mockClear();
  const mixpanel = new Mixpanel("token", true);
  await mixpanel.init(false, {}, undefined, false, {}, { click: true, deadClick: false });
  expect(initArgs()).toEqual({
    click: { enabled: true },
    rageClick: { enabled: true },
    deadClick: { enabled: false },
  });
});

test(`omitted signals default to enabled`, async () => {
  NativeModules.MixpanelReactNative.initialize.mockClear();
  const mixpanel = new Mixpanel("token", true);
  await mixpanel.init(false, {}, undefined, false, {}, { click: true });
  const opts = initArgs();
  expect(opts.rageClick).toEqual({ enabled: true });
  expect(opts.deadClick).toEqual({ enabled: true });
});

test(`object form keeps tuning values and defaults enabled`, async () => {
  NativeModules.MixpanelReactNative.initialize.mockClear();
  const mixpanel = new Mixpanel("token", true);
  await mixpanel.init(false, {}, undefined, false, {}, {
    rageClick: { clickThreshold: 5, timeWindowMs: 800 },
  });
  expect(initArgs().rageClick).toEqual({
    enabled: true,
    clickThreshold: 5,
    timeWindowMs: 800,
  });
});

test(`an explicit enabled:false in the object form wins`, async () => {
  NativeModules.MixpanelReactNative.initialize.mockClear();
  const mixpanel = new Mixpanel("token", true);
  await mixpanel.init(false, {}, undefined, false, {}, {
    deadClick: { enabled: false, timeWindowMs: 900 },
  });
  expect(initArgs().deadClick).toEqual({ enabled: false, timeWindowMs: 900 });
});
