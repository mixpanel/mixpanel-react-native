import { Mixpanel } from "mixpanel-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock fetch globally
global.fetch = jest.fn();

describe("Feature Flags - Experiment Tracking", () => {
  const testToken = "test-token-123";
  let mixpanel;
  let mockAsyncStorage;
  let mockTrack;

  // Helper to flush promises
  const flushPromises = () => new Promise(setImmediate);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
    AsyncStorage.clear();

    // Create a mock AsyncStorage for JavaScript mode
    mockAsyncStorage = {
      getItem: jest.fn().mockResolvedValue(null),
      setItem: jest.fn().mockResolvedValue(undefined),
      removeItem: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    // Create mock track function
    mockTrack = jest.fn().mockResolvedValue(undefined);

    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    // Clear all mocks to prevent hanging references
    global.fetch.mockReset();
    mockAsyncStorage = null;
    mockTrack = null;
    mixpanel = null;
  });

  describe("Experiment Started Event", () => {
    it("should track $experiment_started on first variant access", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "exp-flag": {
              variant_key: "treatment",
              variant_value: "blue",
              experiment_id: 789,
              is_experiment_active: true,
              is_qa_tester: false
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
      mixpanel.flags.getVariantSync("exp-flag", "fallback");

      // Wait for async tracking
      await flushPromises();

      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "exp-flag",
          "Variant name": "treatment",
          "$experiment_id": 789,
          "$is_experiment_active": true,
          "$is_qa_tester": false,
          "$experiment_type": "feature_flag"
        })
      );
    });

    it("should include performance metrics in experiment tracking", async () => {
      const startTime = Date.now();

      global.fetch.mockImplementation(async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 50));
        return {
          status: 200,
          json: () => Promise.resolve({
            flags: {
              "perf-flag": {
                variant_key: "variant-a",
                variant_value: "performance-test",
                experiment_id: 555,
                is_experiment_active: true
              }
            }
          })
        };
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Replace track with mock
      mixpanel.mixpanelImpl.track = mockTrack;

      await mixpanel.flags.loadFlags();

      // Access variant
      mixpanel.flags.getVariantSync("perf-flag", "fallback");

      // Wait for async tracking
      await flushPromises();

      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "perf-flag",
          "Variant fetch latency (ms)": expect.any(Number),
          "Variant fetch start time": expect.any(String),
          "Variant fetch complete time": expect.any(String)
        })
      );

      // Check that latency is reasonable (should be at least 50ms due to our delay)
      const trackCall = mockTrack.mock.calls[0];
      const properties = trackCall[2];
      expect(properties["Variant fetch latency (ms)"]).toBeGreaterThanOrEqual(50);
    });

    it("should only track experiment once per session", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "once-flag": {
              variant_key: "treatment",
              variant_value: "track-once",
              experiment_id: 333,
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

      // First access - should track
      mixpanel.flags.getVariantSync("once-flag", "fallback");
      await flushPromises();

      expect(mockTrack).toHaveBeenCalledTimes(1);

      // Second access - should NOT track again
      mixpanel.flags.getVariantSync("once-flag", "fallback");
      await flushPromises();

      // Still only called once
      expect(mockTrack).toHaveBeenCalledTimes(1);

      // Third access - still should NOT track
      mixpanel.flags.getVariantSync("once-flag", "fallback");
      await flushPromises();

      expect(mockTrack).toHaveBeenCalledTimes(1);
    });

    it("should re-track after context update", async () => {
      global.fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "context-exp": {
              variant_key: "treatment",
              variant_value: "context-aware",
              experiment_id: 444,
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

      // First access - should track
      mixpanel.flags.getVariantSync("context-exp", "fallback");
      await flushPromises();

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "context-exp"
        })
      );

      // Clear mock calls
      mockTrack.mockClear();

      // Update context (should clear experiment tracking)
      await mixpanel.flags.updateContext({ user_tier: "premium" });

      // Access again after context update - should track again
      mixpanel.flags.getVariantSync("context-exp", "fallback");
      await flushPromises();

      expect(mockTrack).toHaveBeenCalledTimes(1);
      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "context-exp"
        })
      );
    });

    it("should continue working if tracking fails", async () => {
      // Make tracking fail
      mockTrack.mockRejectedValue(new Error("Tracking service unavailable"));

      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "fail-track": {
              variant_key: "treatment",
              variant_value: "continue-anyway",
              experiment_id: 666,
              is_experiment_active: true
            }
          }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Replace track with failing mock
      mixpanel.mixpanelImpl.track = mockTrack;

      await mixpanel.flags.loadFlags();

      // Access variant (tracking will fail)
      const variant = mixpanel.flags.getVariantSync("fail-track", "fallback");

      // Should still return the variant value
      expect(variant.value).toBe("continue-anyway");

      // Wait for async tracking attempt
      await flushPromises();

      // Track should have been attempted
      expect(mockTrack).toHaveBeenCalled();

      // Can still access variants
      const secondAccess = mixpanel.flags.getVariantSync("fail-track", "fallback");
      expect(secondAccess.value).toBe("continue-anyway");
    });
  });

  describe("Tracking Properties", () => {
    it("should include all required tracking properties", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "full-props": {
              variant_key: "variant-x",
              variant_value: { complex: "value" },
              experiment_id: 999,
              is_experiment_active: true,
              is_qa_tester: true
            }
          }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Replace track with mock
      mixpanel.mixpanelImpl.track = mockTrack;

      await mixpanel.flags.loadFlags();

      // Access variant
      mixpanel.flags.getVariantSync("full-props", "fallback");
      await flushPromises();

      const trackCall = mockTrack.mock.calls[0];
      const properties = trackCall[2];

      // Verify all properties are present
      expect(properties).toEqual(expect.objectContaining({
        "Experiment name": "full-props",
        "Variant name": "variant-x",
        "$experiment_id": 999,
        "$is_experiment_active": true,
        "$is_qa_tester": true,
        "$experiment_type": "feature_flag",
        "Variant fetch latency (ms)": expect.any(Number)
      }));
    });

    it("should track for flags without experiment_id", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "regular-flag": {
              variant_key: "control",
              variant_value: "not-experiment"
              // No experiment_id - but still tracks
            }
          }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Replace track with mock
      mixpanel.mixpanelImpl.track = mockTrack;

      await mixpanel.flags.loadFlags();

      // Access variant
      mixpanel.flags.getVariantSync("regular-flag", "fallback");
      await flushPromises();

      // Should track even without experiment_id
      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "regular-flag",
          "Variant name": "control",
          "$experiment_type": "feature_flag"
        })
      );
    });

    it("should track different experiments independently", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "exp-1": {
              variant_key: "treatment-a",
              variant_value: "value-1",
              experiment_id: 111,
              is_experiment_active: true
            },
            "exp-2": {
              variant_key: "treatment-b",
              variant_value: "value-2",
              experiment_id: 222,
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

      // Access first experiment
      mixpanel.flags.getVariantSync("exp-1", "fallback");
      await flushPromises();

      // Access second experiment
      mixpanel.flags.getVariantSync("exp-2", "fallback");
      await flushPromises();

      // Should track both experiments
      expect(mockTrack).toHaveBeenCalledTimes(2);

      // Verify each experiment was tracked correctly
      const firstCall = mockTrack.mock.calls[0];
      const secondCall = mockTrack.mock.calls[1];

      expect(firstCall[2]["Experiment name"]).toBe("exp-1");
      expect(firstCall[2]["$experiment_id"]).toBe(111);

      expect(secondCall[2]["Experiment name"]).toBe("exp-2");
      expect(secondCall[2]["$experiment_id"]).toBe(222);

      // Access first experiment again - should not track again
      mockTrack.mockClear();
      mixpanel.flags.getVariantSync("exp-1", "fallback");
      await flushPromises();

      expect(mockTrack).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle flags with missing optional experiment properties", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "minimal-exp": {
              variant_key: "v1",
              variant_value: "minimal",
              experiment_id: 888
              // is_experiment_active and is_qa_tester are missing
            }
          }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Replace track with mock
      mixpanel.mixpanelImpl.track = mockTrack;

      await mixpanel.flags.loadFlags();

      // Access variant
      mixpanel.flags.getVariantSync("minimal-exp", "fallback");
      await flushPromises();

      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "minimal-exp",
          "Variant name": "v1",
          "$experiment_id": 888,
          "$experiment_type": "feature_flag"
        })
      );

      // Should not include undefined properties
      const properties = mockTrack.mock.calls[0][2];
      expect(properties).not.toHaveProperty("$is_experiment_active");
      expect(properties).not.toHaveProperty("$is_qa_tester");
    });

    it("should handle async variant access for tracking", async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({
          flags: {
            "async-exp": {
              variant_key: "async-variant",
              variant_value: "async-value",
              experiment_id: 1234,
              is_experiment_active: true
            }
          }
        })
      });

      mixpanel = new Mixpanel(testToken, false, false, mockAsyncStorage);
      await mixpanel.init(false, {}, "https://api.mixpanel.com", false, { enabled: true });

      // Replace track with mock
      mixpanel.mixpanelImpl.track = mockTrack;

      // Use async getVariant which triggers load and access
      const variant = await mixpanel.flags.getVariant("async-exp", "fallback");

      // Wait for tracking
      await flushPromises();

      expect(variant.value).toBe("async-value");
      expect(mockTrack).toHaveBeenCalledWith(
        testToken,
        "$experiment_started",
        expect.objectContaining({
          "Experiment name": "async-exp",
          "Variant name": "async-variant"
        })
      );
    });
  });
});