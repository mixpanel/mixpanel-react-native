import { MixpanelLogger } from "./mixpanel-logger";
import { MixpanelNetwork } from "./mixpanel-network";
import { MixpanelPersistent } from "./mixpanel-persistent";

/**
 * JavaScript implementation of Feature Flags for React Native
 * This is used when native modules are not available (Expo, React Native Web)
 */
export class MixpanelFlagsJS {
  constructor(token, mixpanelImpl, storage) {
    this.token = token;
    this.mixpanelImpl = mixpanelImpl;
    this.storage = storage;
    this.flags = {};
    this.flagsReady = false;
    this.experimentTracked = new Set();
    this.context = {};
    this.flagsCacheKey = `MIXPANEL_${token}_FLAGS_CACHE`;
    this.flagsReadyKey = `MIXPANEL_${token}_FLAGS_READY`;
    this.mixpanelPersistent = MixpanelPersistent.getInstance(storage, token);

    // Load cached flags on initialization
    this.loadCachedFlags();
  }

  /**
   * Load cached flags from storage
   */
  async loadCachedFlags() {
    try {
      const cachedFlags = await this.storage.getItem(this.flagsCacheKey);
      if (cachedFlags) {
        this.flags = JSON.parse(cachedFlags);
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
      await this.storage.setItem(this.flagsCacheKey, JSON.stringify(this.flags));
      await this.storage.setItem(this.flagsReadyKey, "true");
    } catch (error) {
      MixpanelLogger.log(this.token, "Error caching flags:", error);
    }
  }

  /**
   * Fetch feature flags from Mixpanel API
   */
  async loadFlags() {
    try {
      const distinctId = this.mixpanelPersistent.getDistinctId(this.token);
      const deviceId = this.mixpanelPersistent.getDeviceId(this.token);

      const requestData = {
        token: this.token,
        distinct_id: distinctId,
        $device_id: deviceId,
        ...this.context
      };

      MixpanelLogger.log(this.token, "Fetching feature flags with data:", requestData);

      const serverURL = this.mixpanelImpl.config?.getServerURL?.(this.token) || "https://api.mixpanel.com";
      const response = await MixpanelNetwork.sendRequest({
        token: this.token,
        endpoint: "/decide",
        data: requestData,
        serverURL: serverURL,
        useIPAddressForGeoLocation: true
      });

      if (response && response.featureFlags) {
        // Transform the response to our internal format
        this.flags = {};
        for (const flag of response.featureFlags) {
          this.flags[flag.key] = {
            key: flag.key,
            value: flag.value,
            experimentID: flag.experimentID,
            isExperimentActive: flag.isExperimentActive,
            isQATester: flag.isQATester
          };
        }
        this.flagsReady = true;
        await this.cacheFlags();
        MixpanelLogger.log(this.token, "Feature flags loaded successfully");
      }
    } catch (error) {
      MixpanelLogger.log(this.token, "Error loading feature flags:", error);
      // Keep using cached flags if available
      if (Object.keys(this.flags).length > 0) {
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
   */
  async trackExperimentStarted(featureName, variant) {
    if (this.experimentTracked.has(featureName)) {
      return; // Already tracked
    }

    try {
      const properties = {
        $experiment_name: featureName,
        $variant_name: variant.key,
        $variant_value: variant.value
      };

      if (variant.experimentID) {
        properties.$experiment_id = variant.experimentID;
      }

      // Track the experiment started event
      await this.mixpanelImpl.track(this.token, "$experiment_started", properties);
      this.experimentTracked.add(featureName);

      MixpanelLogger.log(this.token, `Tracked experiment started for ${featureName}`);
    } catch (error) {
      MixpanelLogger.log(this.token, "Error tracking experiment:", error);
    }
  }

  /**
   * Get variant synchronously (only works when flags are ready)
   */
  getVariantSync(featureName, fallback) {
    if (!this.flagsReady || !this.flags[featureName]) {
      return fallback;
    }

    const variant = this.flags[featureName];

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
    const variant = this.getVariantSync(featureName, { key: featureName, value: fallbackValue });
    return variant.value;
  }

  /**
   * Check if feature is enabled synchronously
   */
  isEnabledSync(featureName, fallbackValue = false) {
    const value = this.getVariantValueSync(featureName, fallbackValue);
    return Boolean(value);
  }

  /**
   * Get variant asynchronously
   */
  async getVariant(featureName, fallback) {
    // If flags not ready, try to load them
    if (!this.flagsReady) {
      await this.loadFlags();
    }

    if (!this.flags[featureName]) {
      return fallback;
    }

    const variant = this.flags[featureName];

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
    const variant = await this.getVariant(featureName, { key: featureName, value: fallbackValue });
    return variant.value;
  }

  /**
   * Check if feature is enabled asynchronously
   */
  async isEnabled(featureName, fallbackValue = false) {
    const value = await this.getVariantValue(featureName, fallbackValue);
    return Boolean(value);
  }

  /**
   * Update context and reload flags
   */
  async updateContext(context) {
    this.context = {
      ...this.context,
      ...context
    };

    // Clear experiment tracking since context changed
    this.experimentTracked.clear();

    // Reload flags with new context
    await this.loadFlags();
  }

  /**
   * Clear cached flags
   */
  async clearCache() {
    try {
      await this.storage.removeItem(this.flagsCacheKey);
      await this.storage.removeItem(this.flagsReadyKey);
      this.flags = {};
      this.flagsReady = false;
      this.experimentTracked.clear();
    } catch (error) {
      MixpanelLogger.log(this.token, "Error clearing flag cache:", error);
    }
  }
}