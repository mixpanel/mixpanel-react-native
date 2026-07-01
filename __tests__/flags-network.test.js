import { Mixpanel } from "mixpanel-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock fetch globally
global.fetch = jest.fn();

describe("Feature Flags - Network Operations", () => {
  const testToken = "test-token-123";
  let mixpanel;
  let mockAsyncStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    AsyncStorage.clear();

    // Create a mock AsyncStorage for JavaScript mode
    mockAsyncStorage = {
      getItem: jest.fn().mockResolvedValue(null),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Successful Loading", () => {
    it("should successfully load flags with new format (mixpanel-js compatible)", async () => {
      const mockFlags = {
        flags: {
          "feature-1": {
            variant_key: "treatment",
            variant_value: "blue",
            experiment_id: 123
          },
          "feature-2": {
            variant_key: "control",
            variant_value: false
          }
        }
      };

      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve(mockFlags)
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      await mixpanel.flags.loadFlags();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/flags?"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );

      expect(mixpanel.flags.areFlagsReady()).toBe(true);
      const variant = mixpanel.flags.getVariantSync("feature-1", "fallback");
      expect(variant.value).toBe("blue");
      expect(variant.variant_source).toBe("network");
    });

    it("should send Authorization header as HTTP Basic with token (no password)", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ flags: {} }),
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      await mixpanel.flags.loadFlags();

      const fetchOptions = global.fetch.mock.calls[0][1];
      const expected = `Basic ${Buffer.from(testToken + ":").toString("base64")}`;
      expect(fetchOptions.headers.Authorization).toBe(expected);
    });

    it("should include context parameters in request", async () => {
      global.fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ flags: {} })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });
      void mixpanel.flags;
      await mixpanel.flags.jsFlags.persistenceLoadedPromise;
      await mixpanel.flags.whenReady();

      global.fetch.mockClear();
      await mixpanel.flags.updateContext({ plan: "premium", feature_set: "advanced" });

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain("context=");
      expect(callUrl).toContain("premium");
      expect(callUrl).toContain("advanced");
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 responses without retry for GET requests", async () => {
      global.fetch.mockResolvedValue({
        status: 404,
        json: () => Promise.reject(new Error("Not Found"))
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });
      void mixpanel.flags;
      await mixpanel.flags.jsFlags.persistenceLoadedPromise;
      await expect(mixpanel.flags.whenReady()).rejects.toBeDefined();

      global.fetch.mockClear();
      await expect(mixpanel.flags.loadFlags()).rejects.toBeDefined();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(mixpanel.flags.areFlagsReady()).toBe(false);
    });

    it("should handle malformed JSON responses", async () => {
      global.fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.reject(new Error("Invalid JSON"))
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });
      void mixpanel.flags;
      await mixpanel.flags.jsFlags.persistenceLoadedPromise;
      await expect(mixpanel.flags.whenReady()).rejects.toBeDefined();

      await expect(mixpanel.flags.loadFlags()).rejects.toBeDefined();

      expect(mixpanel.flags.areFlagsReady()).toBe(false);
    });

    it("should handle missing flags field in response", async () => {
      global.fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({
          metadata: { request_id: "123" }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });
      void mixpanel.flags;
      await mixpanel.flags.jsFlags.persistenceLoadedPromise;
      await expect(mixpanel.flags.whenReady()).rejects.toBeDefined();

      await expect(mixpanel.flags.loadFlags()).rejects.toBeDefined();

      expect(mixpanel.flags.areFlagsReady()).toBe(false);
      const variant = mixpanel.flags.getVariantSync("any-flag", "fallback");
      expect(variant.value).toBe("fallback");
      expect(variant.variant_source).toBe("fallback");
    });

    it("should handle network timeout errors", async () => {
      global.fetch.mockRejectedValue(new Error("Network timeout"));

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });
      void mixpanel.flags;
      await mixpanel.flags.jsFlags.persistenceLoadedPromise;
      await expect(mixpanel.flags.whenReady()).rejects.toBeDefined();

      await expect(mixpanel.flags.loadFlags()).rejects.toBeDefined();

      expect(mixpanel.flags.areFlagsReady()).toBe(false);
    });

    it("should not retry GET requests on client errors (4xx)", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ flags: {} })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });
      void mixpanel.flags;
      await mixpanel.flags.jsFlags.persistenceLoadedPromise;
      await mixpanel.flags.whenReady();

      global.fetch.mockClear();
      global.fetch.mockResolvedValueOnce({
        status: 400,
        json: () => Promise.reject(new Error("Bad Request"))
      });

      await expect(mixpanel.flags.loadFlags()).rejects.toBeDefined();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});