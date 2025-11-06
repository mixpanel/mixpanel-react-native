import { MixpanelFlagsJS } from './mixpanel-flags-js';

/**
 * Flags class for managing Feature Flags functionality
 * This class handles both native and JavaScript fallback implementations
 */
export class Flags {
  constructor(token, mixpanelImpl, storage) {
    this.token = token;
    this.mixpanelImpl = mixpanelImpl;
    this.storage = storage;
    this.isNativeMode = typeof mixpanelImpl.loadFlags === 'function';

    // For JavaScript mode, create the JS implementation
    if (!this.isNativeMode && storage) {
      this.jsFlags = new MixpanelFlagsJS(token, mixpanelImpl, storage);
    }
  }

  /**
   * Manually trigger a fetch of feature flags from the Mixpanel servers.
   * This is usually automatic but can be called manually if needed.
   */
  async loadFlags() {
    if (this.isNativeMode) {
      return await this.mixpanelImpl.loadFlags(this.token);
    } else if (this.jsFlags) {
      return await this.jsFlags.loadFlags();
    }
    throw new Error("Feature flags are not initialized");
  }

  /**
   * Check if feature flags have been fetched and are ready to use.
   * @returns {boolean} True if flags are ready, false otherwise
   */
  areFlagsReady() {
    if (this.isNativeMode) {
      return this.mixpanelImpl.areFlagsReadySync(this.token);
    } else if (this.jsFlags) {
      return this.jsFlags.areFlagsReady();
    }
    return false;
  }

  /**
   * Get a feature flag variant synchronously. Only works when flags are ready.
   * @param {string} featureName - Name of the feature flag
   * @param {object} fallback - Fallback variant if flag is not available
   * @returns {object} The flag variant with key and value properties
   */
  getVariantSync(featureName, fallback) {
    if (!this.areFlagsReady()) {
      return fallback;
    }

    if (this.isNativeMode) {
      return this.mixpanelImpl.getVariantSync(this.token, featureName, fallback);
    } else if (this.jsFlags) {
      return this.jsFlags.getVariantSync(featureName, fallback);
    }
    return fallback;
  }

  /**
   * Get a feature flag variant value synchronously. Only works when flags are ready.
   * @param {string} featureName - Name of the feature flag
   * @param {any} fallbackValue - Fallback value if flag is not available
   * @returns {any} The flag value
   */
  getVariantValueSync(featureName, fallbackValue) {
    if (!this.areFlagsReady()) {
      return fallbackValue;
    }

    if (this.isNativeMode) {
      // Android returns a wrapped object due to React Native limitations
      const result = this.mixpanelImpl.getVariantValueSync(this.token, featureName, fallbackValue);
      if (result && typeof result === 'object' && 'type' in result) {
        // Android wraps the response
        return result.type === 'fallback' ? fallbackValue : result.value;
      }
      // iOS returns the value directly
      return result;
    } else if (this.jsFlags) {
      return this.jsFlags.getVariantValueSync(featureName, fallbackValue);
    }
    return fallbackValue;
  }

  /**
   * Check if a feature flag is enabled synchronously. Only works when flags are ready.
   * @param {string} featureName - Name of the feature flag
   * @param {boolean} fallbackValue - Fallback value if flag is not available
   * @returns {boolean} True if enabled, false otherwise
   */
  isEnabledSync(featureName, fallbackValue = false) {
    if (!this.areFlagsReady()) {
      return fallbackValue;
    }

    if (this.isNativeMode) {
      return this.mixpanelImpl.isEnabledSync(this.token, featureName, fallbackValue);
    } else if (this.jsFlags) {
      return this.jsFlags.isEnabledSync(featureName, fallbackValue);
    }
    return fallbackValue;
  }

  /**
   * Get a feature flag variant asynchronously.
   * Supports both callback and Promise patterns.
   * @param {string} featureName - Name of the feature flag
   * @param {object} fallback - Fallback variant if flag is not available
   * @param {function} callback - Optional callback function
   * @returns {Promise|void} Promise if no callback provided, void otherwise
   */
  getVariant(featureName, fallback, callback) {
    // If callback provided, use callback pattern
    if (typeof callback === 'function') {
      if (this.isNativeMode) {
        this.mixpanelImpl.getVariant(this.token, featureName, fallback)
          .then(result => callback(result))
          .catch(() => callback(fallback));
      } else if (this.jsFlags) {
        this.jsFlags.getVariant(featureName, fallback)
          .then(result => callback(result))
          .catch(() => callback(fallback));
      } else {
        callback(fallback);
      }
      return;
    }

    // Promise pattern
    return new Promise((resolve) => {
      if (this.isNativeMode) {
        this.mixpanelImpl.getVariant(this.token, featureName, fallback)
          .then(resolve)
          .catch(() => resolve(fallback));
      } else if (this.jsFlags) {
        this.jsFlags.getVariant(featureName, fallback)
          .then(resolve)
          .catch(() => resolve(fallback));
      } else {
        resolve(fallback);
      }
    });
  }

  /**
   * Get a feature flag variant value asynchronously.
   * Supports both callback and Promise patterns.
   * @param {string} featureName - Name of the feature flag
   * @param {any} fallbackValue - Fallback value if flag is not available
   * @param {function} callback - Optional callback function
   * @returns {Promise|void} Promise if no callback provided, void otherwise
   */
  getVariantValue(featureName, fallbackValue, callback) {
    // If callback provided, use callback pattern
    if (typeof callback === 'function') {
      if (this.isNativeMode) {
        this.mixpanelImpl.getVariantValue(this.token, featureName, fallbackValue)
          .then(result => callback(result))
          .catch(() => callback(fallbackValue));
      } else if (this.jsFlags) {
        this.jsFlags.getVariantValue(featureName, fallbackValue)
          .then(result => callback(result))
          .catch(() => callback(fallbackValue));
      } else {
        callback(fallbackValue);
      }
      return;
    }

    // Promise pattern
    return new Promise((resolve) => {
      if (this.isNativeMode) {
        this.mixpanelImpl.getVariantValue(this.token, featureName, fallbackValue)
          .then(resolve)
          .catch(() => resolve(fallbackValue));
      } else if (this.jsFlags) {
        this.jsFlags.getVariantValue(featureName, fallbackValue)
          .then(resolve)
          .catch(() => resolve(fallbackValue));
      } else {
        resolve(fallbackValue);
      }
    });
  }

  isEnabled(featureName, fallbackValue = false, callback) {
    // If callback provided, use callback pattern
    if (typeof callback === 'function') {
      if (this.isNativeMode) {
        this.mixpanelImpl.isEnabled(this.token, featureName, fallbackValue)
          .then(result => callback(result))
          .catch(() => callback(fallbackValue));
      } else if (this.jsFlags) {
        this.jsFlags.isEnabled(featureName, fallbackValue)
          .then(result => callback(result))
          .catch(() => callback(fallbackValue));
      } else {
        callback(fallbackValue);
      }
      return;
    }

    // Promise pattern
    return new Promise((resolve) => {
      if (this.isNativeMode) {
        this.mixpanelImpl.isEnabled(this.token, featureName, fallbackValue)
          .then(resolve)
          .catch(() => resolve(fallbackValue));
      } else if (this.jsFlags) {
        this.jsFlags.isEnabled(featureName, fallbackValue)
          .then(resolve)
          .catch(() => resolve(fallbackValue));
      } else {
        resolve(fallbackValue);
      }
    });
  }

  /**
   * Update the context used for feature flag evaluation
   * Aligned with mixpanel-js API
   *
   * NOTE: This method is only available in JavaScript mode (Expo/React Native Web).
   * In native mode, context must be set during initialization via FeatureFlagsOptions.
   *
   * @param {object} newContext - New context properties to add/update
   * @param {object} options - Options object
   * @param {boolean} options.replace - If true, replace entire context instead of merging
   * @returns {Promise<void>}
   */
  async updateContext(newContext, options = { replace: false }) {
    if (this.isNativeMode) {
      throw new Error(
        "updateContext() is not supported in native mode. " +
        "Context must be set during initialization via FeatureFlagsOptions. " +
        "This feature is only available in JavaScript mode (Expo/React Native Web)."
      );
    } else if (this.jsFlags) {
      return await this.jsFlags.updateContext(newContext, options);
    }
    throw new Error("Feature flags are not initialized");
  }

  // snake_case aliases for API consistency with mixpanel-js
  are_flags_ready() {
    return this.areFlagsReady();
  }

  get_variant(featureName, fallback, callback) {
    return this.getVariant(featureName, fallback, callback);
  }

  get_variant_sync(featureName, fallback) {
    return this.getVariantSync(featureName, fallback);
  }

  get_variant_value(featureName, fallbackValue, callback) {
    return this.getVariantValue(featureName, fallbackValue, callback);
  }

  get_variant_value_sync(featureName, fallbackValue) {
    return this.getVariantValueSync(featureName, fallbackValue);
  }

  is_enabled(featureName, fallbackValue, callback) {
    return this.isEnabled(featureName, fallbackValue, callback);
  }

  is_enabled_sync(featureName, fallbackValue) {
    return this.isEnabledSync(featureName, fallbackValue);
  }

  update_context(newContext, options) {
    return this.updateContext(newContext, options);
  }
}