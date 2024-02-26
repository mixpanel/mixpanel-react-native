import * as ReactNative from "react-native";

jest.mock("mixpanel-react-native/javascript/mixpanel-storage", () => {
  return {
    AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    })),
  };
});
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.doMock("react-native", () => {
  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      // Redefine an export, like a component
      Button: "MockedButton",

      // Mock out properties of an already mocked export
      LayoutAnimation: {
        ...ReactNative.LayoutAnimation,
        configureNext: jest.fn(),
      },

      // Mock a native module
      NativeModules: {
        ...ReactNative.NativeModules,
        MixpanelReactNative: {
          initialize: jest.fn(),
          setServerURL: jest.fn(),
          setLoggingEnabled: jest.fn(),
          setFlushOnBackground: jest.fn(),
          setUseIpAddressForGeolocation: jest.fn(),
          setFlushBatchSize: jest.fn(),
          hasOptedOutTracking: jest.fn(),
          optInTracking: jest.fn(),
          optOutTracking: jest.fn(),
          identify: jest.fn(),
          alias: jest.fn(),
          track: jest.fn(),
          trackWithGroups: jest.fn(),
          setGroup: jest.fn(),
          getGroup: jest.fn(),
          addGroup: jest.fn(),
          removeGroup: jest.fn(),
          deleteGroup: jest.fn(),
          registerSuperProperties: jest.fn(),
          registerSuperPropertiesOnce: jest.fn(),
          unregisterSuperProperty: jest.fn(),
          getSuperProperties: jest.fn(),
          clearSuperProperties: jest.fn(),
          timeEvent: jest.fn(),
          eventElapsedTime: jest.fn(),
          reset: jest.fn(),
          getDistinctId: jest.fn(),
          set: jest.fn(),
          setOnce: jest.fn(),
          increment: jest.fn(),
          append: jest.fn(),
          union: jest.fn(),
          remove: jest.fn(),
          unset: jest.fn(),
          trackCharge: jest.fn(),
          clearCharges: jest.fn(),
          deleteUser: jest.fn(),
          groupSetProperties: jest.fn(),
          groupSetPropertyOnce: jest.fn(),
          groupUnsetProperty: jest.fn(),
          groupRemovePropertyValue: jest.fn(),
          groupUnionProperty: jest.fn(),
        },
      },
    },
    ReactNative
  );
});
