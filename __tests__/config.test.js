import { MixpanelConfig } from "mixpanel-react-native/javascript/mixpanel-config";

// Mock the dependencies
jest.mock("mixpanel-react-native/javascript/mixpanel-logger", () => ({
  MixpanelLogger: {
    log: jest.fn(),
  },
}));

jest.mock("mixpanel-react-native/javascript/mixpanel-constants", () => ({
  defaultServerURL: "https://api.mixpanel.com",
  defaultFlushInterval: 60000,
  defaultFlushBatchSize: 50,
}));

describe("MixpanelConfig", () => {
  let config;
  const testToken = "test-token-123";

  beforeEach(() => {
    // Clear singleton instance before each test
    MixpanelConfig.instance = undefined;
    config = MixpanelConfig.getInstance();
  });

  describe("getUseIpAddressForGeolocation", () => {
    test("should return true by default when no config is set", () => {
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe(true);
    });

    test("should return false when explicitly set to false", () => {
      config.setUseIpAddressForGeolocation(testToken, false);
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe(false);
    });

    test("should return true when explicitly set to true", () => {
      config.setUseIpAddressForGeolocation(testToken, true);
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe(true);
    });

    test("should return 0 when set to 0 (falsy number)", () => {
      config.setUseIpAddressForGeolocation(testToken, 0);
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe(0);
    });

    test("should return 1 when set to 1 (truthy number)", () => {
      config.setUseIpAddressForGeolocation(testToken, 1);
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe(1);
    });

    test("should return null when set to null", () => {
      config.setUseIpAddressForGeolocation(testToken, null);
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe(null);
    });

    test("should return undefined when set to undefined", () => {
      config.setUseIpAddressForGeolocation(testToken, undefined);
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe(undefined);
    });

    test("should return empty string when set to empty string", () => {
      config.setUseIpAddressForGeolocation(testToken, "");
      const result = config.getUseIpAddressForGeolocation(testToken);
      expect(result).toBe("");
    });

    test("should handle multiple tokens independently", () => {
      const token1 = "token-1";
      const token2 = "token-2";

      config.setUseIpAddressForGeolocation(token1, false);
      config.setUseIpAddressForGeolocation(token2, true);

      expect(config.getUseIpAddressForGeolocation(token1)).toBe(false);
      expect(config.getUseIpAddressForGeolocation(token2)).toBe(true);
    });

    test("should preserve value after multiple sets", () => {
      config.setUseIpAddressForGeolocation(testToken, true);
      expect(config.getUseIpAddressForGeolocation(testToken)).toBe(true);

      config.setUseIpAddressForGeolocation(testToken, false);
      expect(config.getUseIpAddressForGeolocation(testToken)).toBe(false);

      config.setUseIpAddressForGeolocation(testToken, true);
      expect(config.getUseIpAddressForGeolocation(testToken)).toBe(true);
    });

    test("should not affect other config properties when setting geolocation", () => {
      // Set some other config values first
      config.setFlushBatchSize(testToken, 100);
      config.setServerURL(testToken, "https://custom.mixpanel.com");

      // Set geolocation
      config.setUseIpAddressForGeolocation(testToken, false);

      // Verify other config values are preserved
      expect(config.getFlushBatchSize(testToken)).toBe(100);
      expect(config.getServerURL(testToken)).toBe("https://custom.mixpanel.com");
      expect(config.getUseIpAddressForGeolocation(testToken)).toBe(false);
    });
  });

  describe("setUseIpAddressForGeolocation", () => {
    test("should create config object if it doesn't exist", () => {
      config.setUseIpAddressForGeolocation(testToken, false);
      expect(config._config[testToken]).toBeDefined();
      expect(config._config[testToken].useIpAddressForGeolocation).toBe(false);
    });

    test("should preserve existing config when updating geolocation", () => {
      // Set initial config
      config._config[testToken] = {
        serverURL: "https://custom.mixpanel.com",
        flushBatchSize: 100,
      };

      // Update geolocation
      config.setUseIpAddressForGeolocation(testToken, false);

      // Verify all properties are preserved
      expect(config._config[testToken].serverURL).toBe("https://custom.mixpanel.com");
      expect(config._config[testToken].flushBatchSize).toBe(100);
      expect(config._config[testToken].useIpAddressForGeolocation).toBe(false);
    });
  });

  describe("Regression tests for issue #315", () => {
    test("BUG FIX: should correctly return false instead of defaulting to true", () => {
      // This is the main bug that was fixed
      config.setUseIpAddressForGeolocation(testToken, false);
      const result = config.getUseIpAddressForGeolocation(testToken);

      // Before fix, this would incorrectly return true
      expect(result).toBe(false);
      expect(result).not.toBe(true);
    });

    test("BUG FIX: should handle all falsy values correctly", () => {
      const falsyValues = [false, 0, "", null, undefined, NaN];

      falsyValues.forEach((value, index) => {
        const token = `token-falsy-${index}`;
        config.setUseIpAddressForGeolocation(token, value);
        const result = config.getUseIpAddressForGeolocation(token);

        // Before fix, all these would incorrectly return true
        if (Number.isNaN(value)) {
          expect(Number.isNaN(result)).toBe(true);
        } else {
          expect(result).toBe(value);
        }
      });
    });
  });

  describe("Integration with network layer", () => {
    test("should provide correct value for IP parameter in network requests", () => {
      // Test that the config value would be used correctly in network requests
      config.setUseIpAddressForGeolocation(testToken, false);

      // This simulates what happens in mixpanel-core.js when sending requests
      const useIPAddressForGeoLocation = config.getUseIpAddressForGeolocation(testToken);
      const ipParam = +useIPAddressForGeoLocation; // Convert to number as done in network layer

      expect(ipParam).toBe(0); // false should become 0

      // Test with true
      config.setUseIpAddressForGeolocation(testToken, true);
      const useIPAddressForGeoLocationTrue = config.getUseIpAddressForGeolocation(testToken);
      const ipParamTrue = +useIPAddressForGeoLocationTrue;

      expect(ipParamTrue).toBe(1); // true should become 1
    });
  });
});