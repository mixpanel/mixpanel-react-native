import { Mixpanel } from "mixpanel-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock fetch globally
global.fetch = jest.fn();

describe("Feature Flags - Concurrency", () => {
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

  describe("Concurrent Loading", () => {
    it("should handle multiple simultaneous loadFlags() calls", async () => {
      // Don't use fake timers for this test as it can cause issues
      let resolvers = [];
      let callCount = 0;

      global.fetch.mockImplementation(() => {
        const index = callCount++;
        return new Promise(resolve => {
          resolvers[index] = () => resolve({
            status: 200,
            json: () => Promise.resolve({
              flags: {
                "concurrent-flag": {
                  variant_key: "loaded",
                  variant_value: "success"
                }
              }
            })
          });
        });
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Start multiple loads simultaneously
      const load1 = mixpanel.flags.loadFlags();
      const load2 = mixpanel.flags.loadFlags();
      const load3 = mixpanel.flags.loadFlags();

      // All three should trigger network requests (no deduplication currently)
      expect(callCount).toBe(3);

      // Resolve all loads
      resolvers.forEach(resolve => resolve && resolve());
      await Promise.all([load1, load2, load3]);

      expect(mixpanel.flags.areFlagsReady()).toBe(true);
      const variant = mixpanel.flags.getVariantSync("concurrent-flag", "fallback");
      expect(variant.value).toBe("success");
    });

    it("should return fallback when reading flags while loading is in progress (sync)", async () => {
      jest.useFakeTimers();

      let resolveLoad;
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => {
          resolveLoad = () => resolve({
            status: 200,
            json: () => Promise.resolve({
              flags: {
                "delayed": {
                  variant_key: "loaded",
                  variant_value: "success"
                }
              }
            })
          });
        })
      );

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Start loading (don't await)
      const loadPromise = mixpanel.flags.loadFlags();

      // Read immediately - should return fallback since flags aren't ready
      const variant = mixpanel.flags.getVariantSync("delayed", "fallback");
      expect(variant).toBe("fallback");

      // Complete load
      resolveLoad();
      await loadPromise;

      // Now should return loaded value
      const variantAfter = mixpanel.flags.getVariantSync("delayed", "fallback");
      expect(variantAfter.value).toBe("success");

      jest.useRealTimers();
    });

    it("should trigger its own load if needed when using async read", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "auto-load": {
              variant_key: "treatment",
              variant_value: "async-loaded"
            }
          }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Don't load flags initially - let async read trigger it
      expect(mixpanel.flags.areFlagsReady()).toBe(false);

      // Async read should trigger load
      const variant = await mixpanel.flags.getVariant("auto-load", "fallback");

      expect(global.fetch).toHaveBeenCalled();
      expect(variant.value).toBe("async-loaded");
      expect(mixpanel.flags.areFlagsReady()).toBe(true);
    });
  });

  describe("Context Updates", () => {
    it("should handle concurrent updateContext() calls", async () => {
      let fetchCallCount = 0;
      global.fetch.mockImplementation(() => {
        fetchCallCount++;
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({
            flags: {
              "context-flag": {
                variant_key: `variant-${fetchCallCount}`,
                variant_value: `value-${fetchCallCount}`
              }
            }
          })
        });
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Load initial flags
      await mixpanel.flags.loadFlags();
      expect(fetchCallCount).toBe(1);

      // Update context multiple times concurrently
      const update1 = mixpanel.flags.updateContext({ plan: "free" });
      const update2 = mixpanel.flags.updateContext({ plan: "premium" });
      const update3 = mixpanel.flags.updateContext({ plan: "enterprise" });

      await Promise.all([update1, update2, update3]);

      // Each update should trigger a new load
      expect(fetchCallCount).toBe(4); // Initial + 3 updates

      // Flags should be ready after all updates
      expect(mixpanel.flags.areFlagsReady()).toBe(true);
    });

    it("should clear experiment tracking on context update", async () => {
      const mockTrack = jest.fn().mockResolvedValue(undefined);

      global.fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "experiment-flag": {
              variant_key: "treatment",
              variant_value: "blue",
              experiment_id: 123,
              is_experiment_active: true
            }
          }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Replace track with mock
      mixpanel.mixpanelImpl.track = mockTrack;

      await mixpanel.flags.loadFlags();

      // Access variant (triggers tracking)
      mixpanel.flags.getVariantSync("experiment-flag", "fallback");

      // Wait for async tracking
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "experiment-flag"
        })
      );

      // Clear mock calls
      mockTrack.mockClear();

      // Update context (should clear experiment tracking)
      await mixpanel.flags.updateContext({ user_type: "premium" });

      // Access variant again (should trigger tracking again)
      mixpanel.flags.getVariantSync("experiment-flag", "fallback");

      // Wait for async tracking
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should track again after context update
      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "experiment-flag"
        })
      );
    });
  });

  describe("Race Conditions", () => {
    it("should handle read during concurrent loads correctly", async () => {
      let resolveCount = 0;
      let resolvers = [];

      global.fetch.mockImplementation(() => {
        return new Promise(resolve => {
          const index = resolveCount++;
          resolvers[index] = () => resolve({
            status: 200,
            json: () => Promise.resolve({
              flags: {
                "race-flag": {
                  variant_key: `variant-${index}`,
                  variant_value: `value-${index}`
                }
              }
            })
          });
        });
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Start two loads
      const load1 = mixpanel.flags.loadFlags();
      const load2 = mixpanel.flags.loadFlags();

      // Try to read while loads are in progress
      const variantDuringLoad = mixpanel.flags.getVariantSync("race-flag", "fallback");
      expect(variantDuringLoad).toBe("fallback");

      // Complete first load
      resolvers[0]();
      await load1;

      // Read should now get first load's value
      const variantAfterFirst = mixpanel.flags.getVariantSync("race-flag", "fallback");
      expect(variantAfterFirst.value).toBe("value-0");

      // Complete second load
      resolvers[1]();
      await load2;

      // Read should now get second load's value (last one wins)
      const variantAfterSecond = mixpanel.flags.getVariantSync("race-flag", "fallback");
      expect(variantAfterSecond.value).toBe("value-1");
    });

    it("should handle interleaved async and sync reads", async () => {
      let resolveLoad;
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => {
          resolveLoad = () => resolve({
            status: 200,
            json: () => Promise.resolve({
              flags: {
                "interleaved": {
                  variant_key: "loaded",
                  variant_value: true
                }
              }
            })
          });
        })
      );

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Start async read (will trigger load)
      const asyncReadPromise = mixpanel.flags.getVariant("interleaved", false);

      // Immediately do sync read (should return fallback)
      const syncValue = mixpanel.flags.getVariantSync("interleaved", false);
      expect(syncValue).toBe(false);

      // Complete load
      resolveLoad();

      // Wait for async read to complete
      const asyncValue = await asyncReadPromise;
      expect(asyncValue.value).toBe(true);

      // Now sync read should also return loaded value
      const syncValueAfter = mixpanel.flags.getVariantSync("interleaved", false);
      expect(syncValueAfter.value).toBe(true);
    });

    it("should maintain data integrity during concurrent operations", async () => {
      const operations = [];
      let resolvers = [];
      let callCount = 0;

      global.fetch.mockImplementation(() => {
        const index = callCount++;
        return new Promise(resolve => {
          resolvers[index] = () => resolve({
            status: 200,
            json: () => Promise.resolve({
              flags: {
                "flag-1": { variant_key: "a", variant_value: 1 },
                "flag-2": { variant_key: "b", variant_value: 2 },
                "flag-3": { variant_key: "c", variant_value: 3 }
              }
            })
          });
        });
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Start multiple concurrent operations
      operations.push(mixpanel.flags.loadFlags());
      operations.push(mixpanel.flags.getVariant("flag-1", "default"));
      operations.push(mixpanel.flags.getVariantSync("flag-2", "default"));
      operations.push(mixpanel.flags.updateContext({ test: "concurrent" }));

      // Resolve all pending loads
      resolvers.forEach(resolve => resolve && resolve());

      // Wait for all operations
      await Promise.all(operations.filter(op => op instanceof Promise));

      // Verify flags are in consistent state
      expect(mixpanel.flags.areFlagsReady()).toBe(true);
      const flag1 = mixpanel.flags.getVariantSync("flag-1", "default");
      const flag2 = mixpanel.flags.getVariantSync("flag-2", "default");
      const flag3 = mixpanel.flags.getVariantSync("flag-3", "default");

      expect(flag1.value).toBe(1);
      expect(flag2.value).toBe(2);
      expect(flag3.value).toBe(3);
    });
  });
});