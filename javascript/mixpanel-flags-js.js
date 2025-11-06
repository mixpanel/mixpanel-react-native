import { MixpanelLogger } from "./mixpanel-logger";
import { MixpanelNetwork } from "./mixpanel-network";
import { MixpanelPersistent } from "./mixpanel-persistent";

/**
 * JavaScript implementation of Feature Flags for React Native
 * This is used when native modules are not available (Expo, React Native Web)
 * Aligned with mixpanel-js reference implementation
 */
export class MixpanelFlagsJS {
  constructor(token, mixpanelImpl, storage) {
    this.token = token;
    this.mixpanelImpl = mixpanelImpl;
    this.storage = storage;
    this.flags = new Map(); // Use Map like mixpanel-js
    this.flagsReady = false;
    this.experimentTracked = new Set();
    this.context = {};
    this.flagsCacheKey = `MIXPANEL_${token}_FLAGS_CACHE`;
    this.flagsReadyKey = `MIXPANEL_${token}_FLAGS_READY`;
    this.mixpanelPersistent = MixpanelPersistent.getInstance(storage, token);

    // Performance tracking (mixpanel-js alignment)
    this._fetchStartTime = null;
    this._fetchCompleteTime = null;
    this._fetchLatency = null;
    this._traceparent = null;

    // Load cached flags on initialization (fire and forget - loads in background)
    // This is async but intentionally not awaited to avoid blocking constructor
    // Flags will be available once cache loads or after explicit loadFlags() call
    this.loadCachedFlags().catch(error => {
      MixpanelLogger.log(this.token, "Failed to load cached flags in constructor:", error);
    });
  }

  /**
   * Load cached flags from storage
   */
  async loadCachedFlags() {
    try {
      const cachedFlags = await this.storage.getItem(this.flagsCacheKey);
      if (cachedFlags) {
        const parsed = JSON.parse(cachedFlags);
        // Convert array back to Map for consistency
        this.flags = new Map(parsed);
        this.flagsReady = true;
        MixpanelLogger.log(this.token, "Loaded cached feature flags");
      }
    } catch (error) {
      MixpanelLogger.log(this.token, "Error loading cached flags:", error);
    }
  }

  /**
   * Cache flags to storage
   */
  async cacheFlags() {
    try {
      // Convert Map to array for JSON serialization
      const flagsArray = Array.from(this.flags.entries());
      await this.storage.setItem(
        this.flagsCacheKey,
        JSON.stringify(flagsArray)
      );
      await this.storage.setItem(this.flagsReadyKey, "true");
    } catch (error) {
      MixpanelLogger.log(this.token, "Error caching flags:", error);
    }
  }

  /**
   * Generate W3C traceparent header
   * Format: 00-{traceID}-{parentID}-{flags}
   * Returns null if UUID generation fails (graceful degradation)
   */
  generateTraceparent() {
    try {
      // Try expo-crypto first
      const crypto = require("expo-crypto");
      const traceID = crypto.randomUUID().replace(/-/g, "");
      const parentID = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
      return `00-${traceID}-${parentID}-01`;
    } catch (expoCryptoError) {
      try {
        // Fallback to uuid (import the v4 function directly)
        const { v4: uuidv4 } = require("uuid");
        const traceID = uuidv4().replace(/-/g, "");
        const parentID = uuidv4().replace(/-/g, "").substring(0, 16);
        return `00-${traceID}-${parentID}-01`;
      } catch (uuidError) {
        // Graceful degradation: traceparent is optional for observability
        // Don't block flag loading if UUID generation fails
        MixpanelLogger.log(
          this.token,
          "Could not generate traceparent (UUID unavailable):",
          uuidError
        );
        return null;
      }
    }
  }

  /**
   * Mark fetch operation complete and calculate latency
   */
  markFetchComplete() {
    if (!this._fetchStartTime) {
      MixpanelLogger.error(
        this.token,
        "Fetch start time not set, cannot mark fetch complete"
      );
      return;
    }
    this._fetchCompleteTime = Date.now();
    this._fetchLatency = this._fetchCompleteTime - this._fetchStartTime;
    this._fetchStartTime = null;
  }

  /**
   * Fetch feature flags from Mixpanel API
   */
  async loadFlags() {
    this._fetchStartTime = Date.now();

    // Generate traceparent if possible (graceful degradation if UUID unavailable)
    try {
      this._traceparent = this.generateTraceparent();
    } catch (error) {
      // Silently skip traceparent if generation fails
      this._traceparent = null;
    }

    try {
      const distinctId = this.mixpanelPersistent.getDistinctId(this.token);
      const deviceId = this.mixpanelPersistent.getDeviceId(this.token);

      const requestData = {
        token: this.token,
        distinct_id: distinctId,
        $device_id: deviceId,
        ...this.context,
      };

      MixpanelLogger.log(
        this.token,
        "Fetching feature flags with data:",
        requestData
      );

      const serverURL =
        this.mixpanelImpl.config?.getServerURL?.(this.token) ||
        "https://api.mixpanel.com";
      const response = await MixpanelNetwork.sendRequest({
        token: this.token,
        endpoint: "/decide",
        data: requestData,
        serverURL: serverURL,
        useIPAddressForGeoLocation: true,
      });

      this.markFetchComplete();

      // Support both response formats for backwards compatibility
      if (response && response.flags) {
        // New format (mixpanel-js compatible): {flags: {key: {variant_key, variant_value, ...}}}
        this.flags = new Map();
        for (const [key, data] of Object.entries(response.flags)) {
          this.flags.set(key, {
            key: data.variant_key,
            value: data.variant_value,
            experiment_id: data.experiment_id,
            is_experiment_active: data.is_experiment_active,
            is_qa_tester: data.is_qa_tester,
          });
        }
        this.flagsReady = true;
        await this.cacheFlags();
        MixpanelLogger.log(this.token, "Feature flags loaded successfully");
      } else if (response && response.featureFlags) {
        // Legacy format: {featureFlags: [{key, value, experimentID, ...}]}
        this.flags = new Map();
        for (const flag of response.featureFlags) {
          this.flags.set(flag.key, {
            key: flag.key,
            value: flag.value,
            experiment_id: flag.experimentID,
            is_experiment_active: flag.isExperimentActive,
            is_qa_tester: flag.isQATester,
          });
        }
        this.flagsReady = true;
        await this.cacheFlags();
        MixpanelLogger.warn(
          this.token,
          'Received legacy featureFlags format. Please update backend to use "flags" format.'
        );
      }
    } catch (error) {
      this.markFetchComplete();
      MixpanelLogger.log(this.token, "Error loading feature flags:", error);
      // Keep using cached flags if available
      if (this.flags.size > 0) {
        this.flagsReady = true;
      }
    }
  }

  /**
   * Check if flags are ready to use
   */
  areFlagsReady() {
    return this.flagsReady;
  }

  /**
   * Track experiment started event
   * Aligned with mixpanel-js tracking properties
   */
  async trackExperimentStarted(featureName, variant) {
    if (this.experimentTracked.has(featureName)) {
      return; // Already tracked
    }

    try {
      const properties = {
        "Experiment name": featureName, // Human-readable (mixpanel-js format)
        "Variant name": variant.key, // Human-readable (mixpanel-js format)
        $experiment_type: "feature_flag", // Added to match mixpanel-js
      };

      // Add performance metrics if available
      if (this._fetchCompleteTime) {
        const fetchStartTime =
          this._fetchCompleteTime - (this._fetchLatency || 0);
        properties["Variant fetch start time"] = new Date(
          fetchStartTime
        ).toISOString();
        properties["Variant fetch complete time"] = new Date(
          this._fetchCompleteTime
        ).toISOString();
        properties["Variant fetch latency (ms)"] = this._fetchLatency || 0;
      }

      // Add traceparent if available
      if (this._traceparent) {
        properties["Variant fetch traceparent"] = this._traceparent;
      }

      // Add experiment metadata (system properties)
      if (
        variant.experiment_id !== undefined &&
        variant.experiment_id !== null
      ) {
        properties["$experiment_id"] = variant.experiment_id;
      }
      if (variant.is_experiment_active !== undefined) {
        properties["$is_experiment_active"] = variant.is_experiment_active;
      }
      if (variant.is_qa_tester !== undefined) {
        properties["$is_qa_tester"] = variant.is_qa_tester;
      }

      // Track the experiment started event
      await this.mixpanelImpl.track(
        this.token,
        "$experiment_started",
        properties
      );
      this.experimentTracked.add(featureName);

      MixpanelLogger.log(
        this.token,
        `Tracked experiment started for ${featureName}`
      );
    } catch (error) {
      MixpanelLogger.log(this.token, "Error tracking experiment:", error);
    }
  }

  /**
   * Get variant synchronously (only works when flags are ready)
   */
  getVariantSync(featureName, fallback) {
    if (!this.flagsReady || !this.flags.has(featureName)) {
      return fallback;
    }

    const variant = this.flags.get(featureName);

    // Track experiment on first access (fire and forget)
    if (!this.experimentTracked.has(featureName)) {
      this.trackExperimentStarted(featureName, variant).catch(() => {});
    }

    return variant;
  }

  /**
   * Get variant value synchronously
   */
  getVariantValueSync(featureName, fallbackValue) {
    const variant = this.getVariantSync(featureName, {
      key: featureName,
      value: fallbackValue,
    });
    return variant.value;
  }

  /**
   * Check if feature is enabled synchronously
   * Enhanced with boolean validation like mixpanel-js
   */
  isEnabledSync(featureName, fallbackValue = false) {
    const value = this.getVariantValueSync(featureName, fallbackValue);

    // Validate boolean type (mixpanel-js pattern)
    if (value !== true && value !== false) {
      MixpanelLogger.error(
        this.token,
        `Feature flag "${featureName}" value: ${value} is not a boolean; returning fallback value: ${fallbackValue}`
      );
      return fallbackValue;
    }

    return value;
  }

  /**
   * Get variant asynchronously
   */
  async getVariant(featureName, fallback) {
    // If flags not ready, try to load them
    if (!this.flagsReady) {
      await this.loadFlags();
    }

    if (!this.flags.has(featureName)) {
      return fallback;
    }

    const variant = this.flags.get(featureName);

    // Track experiment on first access
    if (!this.experimentTracked.has(featureName)) {
      await this.trackExperimentStarted(featureName, variant);
    }

    return variant;
  }

  /**
   * Get variant value asynchronously
   */
  async getVariantValue(featureName, fallbackValue) {
    const variant = await this.getVariant(featureName, {
      key: featureName,
      value: fallbackValue,
    });
    return variant.value;
  }

  /**
   * Check if feature is enabled asynchronously
   */
  async isEnabled(featureName, fallbackValue = false) {
    const value = await this.getVariantValue(featureName, fallbackValue);
    if (typeof value === "boolean") {
      return value;
    } else {
      MixpanelLogger.log(this.token, `Flag "${featureName}" value is not boolean:`, value);
      return fallbackValue;
    }
  }

  /**
   * Update context and reload flags
   * Aligned with mixpanel-js API signature
   * @param {object} newContext - New context properties to add/update
   * @param {object} options - Options object
   * @param {boolean} options.replace - If true, replace entire context instead of merging
   */
  async updateContext(newContext, options = {}) {
    if (options.replace) {
      // Replace entire context
      this.context = { ...newContext };
    } else {
      // Merge with existing context (default)
      this.context = {
        ...this.context,
        ...newContext,
      };
    }

    // Clear experiment tracking since context changed
    this.experimentTracked.clear();

    // Reload flags with new context
    await this.loadFlags();

    MixpanelLogger.log(this.token, "Context updated, flags reloaded");
  }

  /**
   * Clear cached flags
   */
  async clearCache() {
    try {
      await this.storage.removeItem(this.flagsCacheKey);
      await this.storage.removeItem(this.flagsReadyKey);
      this.flags = new Map();
      this.flagsReady = false;
      this.experimentTracked.clear();
    } catch (error) {
      MixpanelLogger.log(this.token, "Error clearing flag cache:", error);
    }
  }

  // snake_case aliases for API consistency with mixpanel-js
  are_flags_ready() {
    return this.areFlagsReady();
  }

  get_variant(featureName, fallback) {
    return this.getVariant(featureName, fallback);
  }

  get_variant_sync(featureName, fallback) {
    return this.getVariantSync(featureName, fallback);
  }

  get_variant_value(featureName, fallbackValue) {
    return this.getVariantValue(featureName, fallbackValue);
  }

  get_variant_value_sync(featureName, fallbackValue) {
    return this.getVariantValueSync(featureName, fallbackValue);
  }

  is_enabled(featureName, fallbackValue = false) {
    return this.isEnabled(featureName, fallbackValue);
  }

  is_enabled_sync(featureName, fallbackValue = false) {
    return this.isEnabledSync(featureName, fallbackValue);
  }

  update_context(newContext, options) {
    return this.updateContext(newContext, options);
  }
}
