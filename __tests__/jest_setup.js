import * as ReactNative from "react-native";
import { jest } from "@jest/globals";

// Mock react-native-get-random-values polyfill
jest.mock("react-native-get-random-values", () => {
  // Polyfill is imported for side effects, no need to mock specific functions
  return {};
});

jest.mock("mixpanel-react-native/javascript/mixpanel-storage", () => {
  return {
    AsyncStorageAdapter: jest.fn().mockImplementation(() => ({
      getItem: jest.fn().mockResolvedValue(null),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
    })),
  };
});
jest.mock("uuid", () => ({
  v4: jest.fn(() => "polyfilled-uuid-1234"),
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
          initialize: jest.fn().mockResolvedValue(undefined),
          setServerURL: jest.fn(),
          setLoggingEnabled: jest.fn(),
          setFlushOnBackground: jest.fn(),
          setUseIpAddressForGeolocation: jest.fn(),
          setFlushBatchSize: jest.fn(),
          hasOptedOutTracking: jest.fn().mockResolvedValue(false),
          optInTracking: jest.fn(),
          optOutTracking: jest.fn(),
          identify: jest.fn().mockResolvedValue(undefined),
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
