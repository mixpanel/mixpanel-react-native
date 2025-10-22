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
      const MixpanelFlagsJS = require('./mixpanel-flags-js').MixpanelFlagsJS;
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
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
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

  /**
   * Check if a feature flag is enabled asynchronously.
   * Supports both callback and Promise patterns.
   * @param {string} featureName - Name of the feature flag
   * @param {boolean} fallbackValue - Fallback value if flag is not available
   * @param {function} callback - Optional callback function
   * @returns {Promise|void} Promise if no callback provided, void otherwise
   */
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
    return new Promise((resolve, reject) => {
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
   * Update the feature flags context for runtime targeting.
   * This will trigger a reload of flags with the new context.
   * @param {object} context - New context object with custom properties
   */
  async updateContext(context) {
    if (this.isNativeMode) {
      // For native mode, we need to reload flags with new context
      // This would require native implementation support
      return await this.mixpanelImpl.updateFlagsContext(this.token, context);
    } else if (this.jsFlags) {
      return await this.jsFlags.updateContext(context);
    }
    throw new Error("Feature flags are not initialized");
  }
}