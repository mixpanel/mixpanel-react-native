import {MixpanelType} from "mixpanel-react-native/javascript/mixpanel-constants";
import {exp} from "react-native/Libraries/Animated/src/Easing";
import {get} from "react-native/Libraries/Utilities/PixelRatio";

jest.mock("mixpanel-react-native/javascript/mixpanel-core", () => ({
  MixpanelCore: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    startProcessingQueue: jest.fn(),
    addToMixpanelQueue: jest.fn(),
    flush: jest.fn(),
  })),
}));

jest.mock("mixpanel-react-native/javascript/mixpanel-network", () => ({
  MixpanelNetwork: {
    sendRequest: jest.fn(),
  },
}));

jest.mock("mixpanel-react-native/javascript/mixpanel-persistent", () => {
  return {
    MixpanelPersistent: {
      getInstance: jest.fn().mockImplementation(() => {
        return {
          initializationCompletePromise: jest.fn(),
          reset: jest.fn(),
          updateOptedOut: jest.fn(),
          persistOptedOut: jest.fn(),
          getSuperProperties: jest.fn().mockReturnValue({
            company_id: [222],
            superProp1: "value1",
            superProp2: "value2",
          }),
          getDistinctId: jest.fn().mockReturnValue("distinct-id-mock"),
          getDeviceId: jest.fn().mockReturnValue("device-id-mock"),
          getUserId: jest.fn().mockReturnValue("user-id-mock"),
          getOptedOut: jest.fn(),
          getQueue: jest.fn(),
          saveQueue: jest.fn(),
          loadQueue: jest.fn(),
          loadDeviceId: jest.fn(),
          updateDeviceId: jest.fn(),
          persistDeviceId: jest.fn(),
          loadDistinctId: jest.fn(),
          updateDistinctId: jest.fn(),
          persistDistinctId: jest.fn(),
          loadUserId: jest.fn(),
          updateUserId: jest.fn(),
          persistUserId: jest.fn(),
          loadSuperProperties: jest.fn(),
          persistSuperProperties: jest.fn(),
          loadOptedOut: jest.fn(),
          persistOptedOut: jest.fn(),
          loadIdentity: jest.fn(),
          persistIdentity: jest.fn(),
          getIdentity: jest.fn(),
          resetIdentity: jest.fn(),
          getTimeEvents: jest.fn().mockReturnValue({
            "test-event": Math.round(Date.now() / 1000 - 1000),
          }),
          loadTimeEvents: jest.fn(),
          updateTimeEvents: jest.fn(),
          persistTimeEvents: jest.fn(),
          updateSuperProperties: jest.fn(),
        };
      }),
    },
  };
});

jest.mock("mixpanel-react-native/javascript/mixpanel-config", () => ({
  MixpanelConfig: {
    getInstance: jest.fn().mockReturnValue({
      getFlushInterval: jest.fn().mockReturnValue(1000),
      getFlushBatchSize: jest.fn().mockReturnValue(50),
      getServerURL: jest.fn(),
      getUseIpAddressForGeolocation: jest.fn(),
      setLoggingEnabled: jest.fn(),
      getLoggingEnabled: jest.fn().mockReturnValue(true),
      setServerURL: jest.fn(),
    }),
  },
}));

// jest.mock("mixpanel-react-native/javascript/mixpanel-logger", () => {
//   return {
//     MixpanelLogger: {
//       log: jest.fn(),
//     },
//   };
// });

const {
  MixpanelNetwork,
} = require("mixpanel-react-native/javascript/mixpanel-network");

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
  MixpanelConfig,
} = require("mixpanel-react-native/javascript/mixpanel-config");

describe("MixpanelMain", () => {
  let mixpanelMain;
  const token = "test-token";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(async () => {
      const MixpanelMain = require("mixpanel-react-native/javascript/mixpanel-main")
        .default;
      mixpanelMain = new MixpanelMain(token);
      MixpanelConfig.getInstance().getLoggingEnabled.mockReturnValue(true);
    });
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should initialize properly", async () => {
    const trackAutomaticEvents = false;
    const optOutTrackingDefault = false;
    const superProperties = {superProp1: "value1", superProp2: "value2"};
    const serverURL = "https://api.mixpanel.com";

    await mixpanelMain.initialize(
      token,
      trackAutomaticEvents,
      optOutTrackingDefault,
      superProperties,
      serverURL
    );

    expect(mixpanelMain.core.initialize).toHaveBeenCalledWith(token);

    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      superProp1: "value1",
      superProp2: "value2",
      company_id: [222],
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
  });

  it("should not track if initialize with optOutTrackingDefault being true", async () => {
    const trackAutomaticEvents = false;
    const optOutTrackingDefault = true;
    const superProperties = {superProp1: "value1", superProp2: "value2"};
    const serverURL = "https://api.mixpanel.com";


    await mixpanelMain.initialize(
      token,
      trackAutomaticEvents,
      optOutTrackingDefault,
      superProperties,
      serverURL
    );

    const eventName = "Test Event";
    const eventProperties = {prop1: "value1", prop2: "value2"};

    expect(
          mixpanelMain.mixpanelPersistent.updateOptedOut
        ).toHaveBeenCalledWith(token, true);

    mixpanelMain.mixpanelPersistent.getOptedOut.mockReturnValue(true);
    await mixpanelMain.track(token, eventName, eventProperties);
    expect(mixpanelMain.core.addToMixpanelQueue).not.toHaveBeenCalled();
  });

  it("should track if initialize with optOutTrackingDefault being false", async () => {
    const trackAutomaticEvents = false;
    const optOutTrackingDefault = false;
    const superProperties = {superProp1: "value1", superProp2: "value2"};
    const serverURL = "https://api.mixpanel.com";

    await mixpanelMain.initialize(
      token,
      trackAutomaticEvents,
      optOutTrackingDefault,
      superProperties,
      serverURL
    );
    mixpanelMain.setLoggingEnabled(token, true);
    const eventName = "Test Event";
    const eventProperties = {prop1: "value1", prop2: "value2"};

    await mixpanelMain.track(token, eventName, eventProperties);
    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalled();
  });

  it("register super properties should update properties", async () => {
    mixpanelMain.registerSuperProperties(token, {superProp3: "value3"});
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      superProp1: "value1",
      superProp2: "value2",
      superProp3: "value3",
      company_id: [222],
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
  });

  it("register super properties once should update properties only once", async () => {
    mixpanelMain.registerSuperPropertiesOnce(token, {superProp3: "value3"});
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      superProp1: "value1",
      superProp2: "value2",
      superProp3: "value3",
      company_id: [222],
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
    mixpanelMain.registerSuperPropertiesOnce(token, {superProp3: "value4"});
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      superProp1: "value1",
      superProp2: "value2",
      superProp3: "value3",
      company_id: [222],
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
  });

  it("unregister super properties should update properties properly", async () => {
    mixpanelMain.registerSuperPropertiesOnce(token, {superProp3: "value3"});
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      superProp1: "value1",
      superProp2: "value2",
      superProp3: "value3",
      company_id: [222],
    });

    mixpanelMain.unregisterSuperProperty(token, "superProp3");
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      superProp1: "value1",
      superProp2: "value2",
      company_id: [222],
    });
  });

  it("clear super properties should clear properties properly", async () => {
    mixpanelMain.clearSuperProperties(token);
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {});
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
  });

  it("should send correct payload on track event", async () => {
    const eventName = "Test Event";
    const eventProperties = {prop1: "value1", prop2: "value2"};

    await mixpanelMain.track(token, eventName, eventProperties);
    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.EVENTS,
      expect.objectContaining({
        event: eventName,
        properties: expect.objectContaining({
          token: token,
          time: expect.any(Number),
          prop1: "value1",
          prop2: "value2",
          $device_id: "device-id-mock",
          $user_id: "user-id-mock",
          distinct_id: "distinct-id-mock",
          superProp1: "value1", // include super properties
          superProp2: "value2",
        }),
      })
    );
  });

  it("should trigger the flush on the flush call", async () => {
    mixpanelMain.flush(token);
    expect(mixpanelMain.core.flush).toHaveBeenCalledWith(token);
  });

  it("setLoggingEnabled should work as expected", async () => {
    mixpanelMain.setLoggingEnabled(token, true);
    expect(mixpanelMain.config.setLoggingEnabled).toHaveBeenCalledWith(
      token,
      true
    );
    MixpanelConfig.getInstance().getLoggingEnabled.mockReturnValueOnce(true);
    await mixpanelMain.track(token, "test-event");
    expect(console.log).toHaveBeenCalled();
  });

  it("timeEvent should work as expected", async () => {
    mixpanelMain.timeEvent(token, "test-event");
    expect(
      mixpanelMain.mixpanelPersistent.updateTimeEvents
    ).toHaveBeenCalledWith(token, {"test-event": expect.any(Number)});
    expect(
      mixpanelMain.mixpanelPersistent.persistTimeEvents
    ).toHaveBeenCalledWith(token);
  });

  it("eventElapsedTime should work as expected", async () => {
    mixpanelMain.timeEvent(token, "test-event");
    const elapsedTime = await mixpanelMain.eventElapsedTime(
      token,
      "test-event"
    );
    expect(elapsedTime).toBeGreaterThan(0);
  });

  it("should update the identity properties on identify", async () => {
    jest.resetModules();
    const newDistinctId = "new-distinct-id";
    await mixpanelMain.identify(token, newDistinctId);
    expect(
      mixpanelMain.mixpanelPersistent.updateDistinctId
    ).toHaveBeenCalledWith(token, newDistinctId);
    expect(mixpanelMain.mixpanelPersistent.updateUserId).toHaveBeenCalledWith(
      token,
      newDistinctId
    );
  });

  it("should not update the identity properties if the new distinctid is the save as before", async () => {
    const newDistinctId = "distinct-id-mock";
    await mixpanelMain.identify(token, newDistinctId);
    expect(
      mixpanelMain.mixpanelPersistent.updateDistinctId
    ).toHaveBeenCalledTimes(0);
    expect(mixpanelMain.mixpanelPersistent.updateUserId).toHaveBeenCalledTimes(
      0
    );
  });

  it("should send correct payload on set profile properties", async () => {
    const properties = {prop1: "value1", prop2: "value2"};

    await mixpanelMain.set(token, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $set: {prop1: "value1", prop2: "value2"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on setOnce profile properties", async () => {
    const properties = {prop1: "value1", prop2: "value2"};

    await mixpanelMain.setOnce(token, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $set_once: {prop1: "value1", prop2: "value2"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on increment profile properties", async () => {
    const properties = {prop1: 3};

    await mixpanelMain.increment(token, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $add: {prop1: 3},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on append profile properties", async () => {
    const properties = {prop1: "value1"};

    await mixpanelMain.append(token, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $append: {prop1: "value1"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );

    await mixpanelMain.append(token, "testProp", "testValue");

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $append: {testProp: "testValue"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on union profile properties", async () => {
    const properties = {prop1: "value1"};

    await mixpanelMain.union(token, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $union: {prop1: "value1"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );

    await mixpanelMain.union(token, "testProp", "testValue");

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $union: {testProp: "testValue"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on remove profile properties", async () => {
    const properties = {prop1: "value1"};

    await mixpanelMain.remove(token, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $remove: {prop1: "value1"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );

    await mixpanelMain.remove(token, "testProp", "testValue");

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $remove: {testProp: "testValue"},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on trackCharge", async () => {
    const properties = {prop1: "value1"};
    const charge = 100;

    await mixpanelMain.trackCharge(token, charge, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $append: {
          $transactions: {
            $amount: 100,
            $time: expect.any(Number),
            prop1: "value1",
          },
        },
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on clearCharge", async () => {
    await mixpanelMain.clearCharges(token);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $set: {
          $transactions: [],
        },
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on unset profile properties", async () => {
    const property = "prop1";

    await mixpanelMain.unset(token, property);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $unset: [property],
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on delete profile", async () => {
    await mixpanelMain.deleteUser(token);
    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $delete: "null",
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );
  });

  it("should send correct payload on trackWithGroups", async () => {
    const properties = {prop1: "value1"};
    const eventName = "event1";
    const groups = {company_id: 111};
    await mixpanelMain.trackWithGroups(token, eventName, properties, groups);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.EVENTS,
      expect.objectContaining({
        event: "event1",
        properties: expect.objectContaining({
          token: token,
          time: expect.any(Number),
          prop1: "value1",
          $device_id: "device-id-mock",
          $user_id: "user-id-mock",
          distinct_id: "distinct-id-mock",
          superProp1: "value1", // include super properties
          superProp2: "value2",
          company_id: 111,
        }),
      })
    );
  });

  it("should send correct payload on addGroup", async () => {
    await mixpanelMain.addGroup(token, "company_id", 111);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $union: {company_id: [111]},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );

    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      company_id: [222, 111],
      superProp1: "value1",
      superProp2: "value2",
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
  });

  it("should send correct payload on setGroup", async () => {
    await mixpanelMain.setGroup(token, "company_id", 333);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $set: {company_id: [333]},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );

    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      company_id: [333],
      superProp1: "value1",
      superProp2: "value2",
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
  });

  it("should send correct payload on removeGroup", async () => {
    await mixpanelMain.addGroup(token, "company_id", 111);
    // The company id has been added
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      company_id: [222, 111],
      superProp1: "value1",
      superProp2: "value2",
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);

    await mixpanelMain.removeGroup(token, "company_id", 111);
    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.USER,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $remove: {company_id: 111},
        $distinct_id: "distinct-id-mock",
        $device_id: "device-id-mock",
        $user_id: "user-id-mock",
      })
    );

    // The company id has been removed
    expect(
      mixpanelMain.mixpanelPersistent.updateSuperProperties
    ).toHaveBeenCalledWith(token, {
      company_id: [222],
      superProp1: "value1",
      superProp2: "value2",
    });
    expect(
      mixpanelMain.mixpanelPersistent.persistSuperProperties
    ).toHaveBeenCalledWith(token);
  });

  it("should send correct payload on deleteGroup", async () => {
    await mixpanelMain.deleteGroup(token);
    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.GROUPS,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $delete: "null",
      })
    );
  });

  it("should send correct payload on group set", async () => {
    const properties = {prop1: "value1", prop2: "value2"};

    await mixpanelMain.groupSetProperties(token, "company_id", 444, properties);

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.GROUPS,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $group_id: 444,
        $group_key: "company_id",
        $set: {prop1: "value1", prop2: "value2"},
      })
    );
  });

  it("should send correct payload on group set once", async () => {
    const properties = {prop1: "value1", prop2: "value2"};

    await mixpanelMain.groupSetPropertyOnce(
      token,
      "company_id",
      444,
      properties
    );

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.GROUPS,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $group_id: 444,
        $group_key: "company_id",
        $set_once: {prop1: "value1", prop2: "value2"},
      })
    );
  });

  it("should send correct payload on groupUnsetProperty", async () => {
    await mixpanelMain.groupUnsetProperty(token, "company_id", 444, "prop1");

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.GROUPS,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $group_id: 444,
        $group_key: "company_id",
        $unset: ["prop1"],
      })
    );
  });

  it("should send correct payload on groupRemovePropertyValue", async () => {
    await mixpanelMain.groupRemovePropertyValue(
      token,
      "company_id",
      444,
      "prop1",
      "value1"
    );

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.GROUPS,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $group_id: 444,
        $group_key: "company_id",
        $remove: {prop1: "value1"},
      })
    );
  });

  it("should send correct payload on groupUnionProperty", async () => {
    await mixpanelMain.groupUnionProperty(
      token,
      "company_id",
      444,
      "prop1",
      "value1"
    );

    expect(mixpanelMain.core.addToMixpanelQueue).toHaveBeenCalledWith(
      token,
      MixpanelType.GROUPS,
      expect.objectContaining({
        $token: token,
        $time: expect.any(Number),
        $group_id: 444,
        $group_key: "company_id",
        $union: {prop1: "value1"},
      })
    );
  });
});
