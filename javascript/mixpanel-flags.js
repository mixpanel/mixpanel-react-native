import { MixpanelFlagsJS } from './mixpanel-flags-js';
import { MixpanelLogger } from './mixpanel-logger';

/**
 * Core class for using Mixpanel Feature Flags.
 *
 * <p>The Flags class provides access to Mixpanel's Feature Flags functionality, enabling
 * dynamic feature control, A/B testing, and personalized user experiences. Feature flags
 * allow you to remotely configure your app's features without deploying new code.
 *
 * <p>This class is accessed through the {@link Mixpanel#flags} property and is lazy-loaded
 * to minimize performance impact until feature flags are actually used.
 *
 * <p><b>Platform Support:</b>
 * <ul>
 * <li><b>Native Mode (iOS/Android):</b> Fully supported with automatic experiment tracking</li>
 * <li><b>JavaScript Mode (Expo/React Native Web):</b> Planned for future release</li>
 * </ul>
 *
 * <p><b>Key Concepts:</b>
 * <ul>
 * <li><b>Feature Name:</b> The unique identifier for your feature flag (e.g., "new-checkout")</li>
 * <li><b>Variant:</b> An object containing both a key and value representing the feature configuration</li>
 * <li><b>Variant Key:</b> The identifier for the specific variation (e.g., "control", "treatment")</li>
 * <li><b>Variant Value:</b> The actual configuration value (can be any JSON-serializable type)</li>
 * <li><b>Fallback:</b> Default value returned when a flag is not available or not loaded</li>
 * </ul>
 *
 * <p><b>Automatic Experiment Tracking:</b> When a feature flag is evaluated for the first time,
 * Mixpanel automatically tracks a "$experiment_started" event with relevant metadata.
 *
 * @example
 * // Initialize with feature flags enabled
 * const mixpanel = new Mixpanel('YOUR_TOKEN', true);
 * await mixpanel.init(false, {}, 'https://api.mixpanel.com', false, {
 *   enabled: true,
 *   context: { platform: 'mobile' }
 * });
 *
 * @example
 * // Synchronous access (when flags are ready)
 * if (mixpanel.flags.areFlagsReady()) {
 *   const isEnabled = mixpanel.flags.isEnabledSync('new-feature', false);
 *   const color = mixpanel.flags.getVariantValueSync('button-color', 'blue');
 *   const variant = mixpanel.flags.getVariantSync('checkout-flow', {
 *     key: 'control',
 *     value: 'standard'
 *   });
 * }
 *
 * @example
 * // Asynchronous access with Promise pattern
 * const variant = await mixpanel.flags.getVariant('pricing-test', {
 *   key: 'control',
 *   value: { price: 9.99, currency: 'USD' }
 * });
 *
 * @example
 * // Asynchronous access with callback pattern
 * mixpanel.flags.isEnabled('beta-features', false, (isEnabled) => {
 *   if (isEnabled) {
 *     // Enable beta features
 *   }
 * });
 *
 * @see Mixpanel#flags
 */
export class Flags {
  constructor(token, mixpanelImpl, storage) {
    this.token = token;
    this.mixpanelImpl = mixpanelImpl;
    this.storage = storage;
    this.isNativeMode = typeof mixpanelImpl.loadFlags === 'function';

    // For JavaScript mode, create the JS implementation
    if (!this.isNativeMode && storage) {
      // Get the initial context from mixpanelImpl (always MixpanelMain in JS mode)
      const initialContext = mixpanelImpl.getFeatureFlagsContext();
      this.jsFlags = new MixpanelFlagsJS(token, mixpanelImpl, storage, initialContext);
    }
  }

  /**
   * Manually fetch feature flags from the Mixpanel servers.
   *
   * <p>Feature flags are automatically loaded during initialization when feature flags are enabled.
   * This method allows you to manually trigger a refresh of the flags, which is useful when:
   * <ul>
   * <li>You want to reload flags after a user property change</li>
   * <li>You need to ensure you have the latest flag configuration</li>
   * <li>Initial automatic load failed and you want to retry</li>
   * </ul>
   *
   * <p>After successfully loading flags, {@link areFlagsReady} will return true and synchronous
   * methods can be used to access flag values.
   *
   * @returns {Promise<void>} A promise that resolves when flags have been fetched and loaded
   *
   * @example
   * // Manually reload flags after user identification
   * await mixpanel.identify('user123');
   * await mixpanel.flags.loadFlags();
   */
  async loadFlags() {
    if (this.isNativeMode) {
      return await this.mixpanelImpl.loadFlags(this.token);
    } else if (this.jsFlags) {
      return await this.jsFlags.loadFlags();
    }
    // Log warning and return gracefully instead of throwing
    MixpanelLogger.warn(this.token, "Feature flags are not initialized - cannot load flags");
    return;
  }

  /**
   * Check if feature flags have been fetched from the server and are ready to use.
   *
   * <p>This method returns true after feature flags have been successfully loaded via {@link loadFlags}
   * or during initialization. When flags are ready, you can safely use the synchronous methods
   * ({@link getVariantSync}, {@link getVariantValueSync}, {@link isEnabledSync}) without waiting.
   *
   * <p>It's recommended to check this before using synchronous methods to ensure you're not
   * getting fallback values due to flags not being loaded yet.
   *
   * @returns {boolean} true if flags have been loaded and are ready to use, false otherwise
   *
   * @example
   * // Check before using synchronous methods
   * if (mixpanel.flags.areFlagsReady()) {
   *   const isEnabled = mixpanel.flags.isEnabledSync('new-feature', false);
   * } else {
   *   console.log('Flags not ready yet, using fallback');
   * }
   *
   * @example
   * // Wait for flags to be ready
   * await mixpanel.flags.loadFlags();
   * if (mixpanel.flags.areFlagsReady()) {
   *   // Now safe to use sync methods
   * }
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
   * Get a feature flag variant synchronously.
   *
   * <p>Returns the complete variant object for a feature flag, including both the variant key
   * (e.g., "control", "treatment") and the variant value (the actual configuration data).
   *
   * <p><b>Important:</b> This is a synchronous method that only works when flags are ready.
   * Always check {@link areFlagsReady} first, or use the asynchronous {@link getVariant} method instead.
   *
   * <p>When a flag is evaluated for the first time, Mixpanel automatically tracks a
   * "$experiment_started" event with relevant experiment metadata.
   *
   * @param {string} featureName The unique identifier for the feature flag
   * @param {object} fallback The fallback variant object to return if the flag is not available.
   *     Must include both 'key' and 'value' properties.
   * @returns {object} The flag variant object with the following structure:
   *     - key: {string} The variant key (e.g., "control", "treatment")
   *     - value: {any} The variant value (can be any JSON-serializable type)
   *     - experiment_id: {string|number} (optional) The experiment ID if this is an experiment
   *     - is_experiment_active: {boolean} (optional) Whether the experiment is currently active
   *
   * @example
   * // Get a checkout flow variant
   * if (mixpanel.flags.areFlagsReady()) {
   *   const variant = mixpanel.flags.getVariantSync('checkout-flow', {
   *     key: 'control',
   *     value: 'standard'
   *   });
   *   console.log(`Using variant: ${variant.key}`);
   *   console.log(`Configuration: ${JSON.stringify(variant.value)}`);
   * }
   *
   * @example
   * // Get a complex configuration variant
   * const defaultConfig = {
   *   key: 'default',
   *   value: {
   *     theme: 'light',
   *     layout: 'grid',
   *     itemsPerPage: 20
   *   }
   * };
   * const config = mixpanel.flags.getVariantSync('ui-config', defaultConfig);
   *
   * @see getVariant for asynchronous access
   * @see getVariantValueSync to get only the value (not the full variant object)
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
   * Get a feature flag variant value synchronously.
   *
   * <p>Returns only the value portion of a feature flag variant, without the variant key or metadata.
   * This is useful when you only care about the configuration data, not which variant was selected.
   *
   * <p><b>Important:</b> This is a synchronous method that only works when flags are ready.
   * Always check {@link areFlagsReady} first, or use the asynchronous {@link getVariantValue} method instead.
   *
   * <p>When a flag is evaluated for the first time, Mixpanel automatically tracks a
   * "$experiment_started" event with relevant experiment metadata.
   *
   * @param {string} featureName The unique identifier for the feature flag
   * @param {any} fallbackValue The fallback value to return if the flag is not available.
   *     Can be any JSON-serializable type (string, number, boolean, object, array, etc.)
   * @returns {any} The flag's value, or the fallback if the flag is not available.
   *     The return type matches the type of value configured in your Mixpanel project.
   *
   * @example
   * // Get a simple string value
   * if (mixpanel.flags.areFlagsReady()) {
   *   const buttonColor = mixpanel.flags.getVariantValueSync('button-color', 'blue');
   *   applyButtonColor(buttonColor);
   * }
   *
   * @example
   * // Get a complex object value
   * const defaultPricing = { price: 9.99, currency: 'USD', trial_days: 7 };
   * const pricing = mixpanel.flags.getVariantValueSync('pricing-config', defaultPricing);
   * console.log(`Price: ${pricing.price} ${pricing.currency}`);
   *
   * @example
   * // Get a boolean value
   * const showPromo = mixpanel.flags.getVariantValueSync('show-promo', false);
   * if (showPromo) {
   *   displayPromotionalBanner();
   * }
   *
   * @see getVariantValue for asynchronous access
   * @see getVariantSync to get the full variant object including key and metadata
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
   * Check if a feature flag is enabled synchronously.
   *
   * <p>This is a convenience method for boolean feature flags. It checks if a feature is enabled
   * by evaluating the variant value as a boolean. A feature is considered "enabled" when its
   * variant value evaluates to true.
   *
   * <p><b>Important:</b> This is a synchronous method that only works when flags are ready.
   * Always check {@link areFlagsReady} first, or use the asynchronous {@link isEnabled} method instead.
   *
   * <p>When a flag is evaluated for the first time, Mixpanel automatically tracks a
   * "$experiment_started" event with relevant experiment metadata.
   *
   * @param {string} featureName The unique identifier for the feature flag
   * @param {boolean} [fallbackValue=false] The fallback value to return if the flag is not available.
   *     Defaults to false if not provided.
   * @returns {boolean} true if the feature is enabled, false otherwise
   *
   * @example
   * // Simple feature toggle
   * if (mixpanel.flags.areFlagsReady()) {
   *   if (mixpanel.flags.isEnabledSync('new-checkout', false)) {
   *     showNewCheckout();
   *   } else {
   *     showLegacyCheckout();
   *   }
   * }
   *
   * @example
   * // With explicit fallback
   * const enableBetaFeatures = mixpanel.flags.isEnabledSync('beta-features', true);
   *
   * @see isEnabled for asynchronous access
   * @see getVariantValueSync for non-boolean flag values
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
   *
   * <p>Returns the complete variant object for a feature flag, including both the variant key
   * and the variant value. This method works regardless of whether flags are ready, making it
   * safe to use at any time.
   *
   * <p>Supports both Promise and callback patterns for maximum flexibility.
   *
   * <p>When a flag is evaluated for the first time, Mixpanel automatically tracks a
   * "$experiment_started" event with relevant experiment metadata.
   *
   * @param {string} featureName The unique identifier for the feature flag
   * @param {object} fallback The fallback variant object to return if the flag is not available.
   *     Must include both 'key' and 'value' properties.
   * @param {function} [callback] Optional callback function that receives the variant object.
   *     If provided, the method returns void. If omitted, the method returns a Promise.
   * @returns {Promise<object>|void} Promise that resolves to the variant object if no callback provided,
   *     void if callback is provided. The variant object has the following structure:
   *     - key: {string} The variant key (e.g., "control", "treatment")
   *     - value: {any} The variant value (can be any JSON-serializable type)
   *     - experiment_id: {string|number} (optional) The experiment ID if this is an experiment
   *     - is_experiment_active: {boolean} (optional) Whether the experiment is currently active
   *
   * @example
   * // Promise pattern (recommended)
   * const variant = await mixpanel.flags.getVariant('checkout-flow', {
   *   key: 'control',
   *   value: 'standard'
   * });
   * console.log(`Using ${variant.key}: ${variant.value}`);
   *
   * @example
   * // Callback pattern
   * mixpanel.flags.getVariant('pricing-test', {
   *   key: 'default',
   *   value: { price: 9.99 }
   * }, (variant) => {
   *   console.log(`Price: ${variant.value.price}`);
   * });
   *
   * @see getVariantSync for synchronous access when flags are ready
   * @see getVariantValue to get only the value without the variant key
   */
  getVariant(featureName, fallback, callback) {
    // If callback provided, use callback pattern
    if (typeof callback === 'function') {
      if (this.isNativeMode) {
        this.mixpanelImpl.getVariant(this.token, featureName, fallback)
          .then(result => callback(result))
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant for ${featureName}:`, error);
            callback(fallback);
          });
      } else if (this.jsFlags) {
        this.jsFlags.getVariant(featureName, fallback)
          .then(result => callback(result))
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant for ${featureName}:`, error);
            callback(fallback);
          });
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
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant for ${featureName}:`, error);
            resolve(fallback);
          });
      } else if (this.jsFlags) {
        this.jsFlags.getVariant(featureName, fallback)
          .then(resolve)
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant for ${featureName}:`, error);
            resolve(fallback);
          });
      } else {
        resolve(fallback);
      }
    });
  }

  /**
   * Get a feature flag variant value asynchronously.
   *
   * <p>Returns only the value portion of a feature flag variant. This method works regardless
   * of whether flags are ready, making it safe to use at any time.
   *
   * <p>Supports both Promise and callback patterns for maximum flexibility.
   *
   * <p>When a flag is evaluated for the first time, Mixpanel automatically tracks a
   * "$experiment_started" event with relevant experiment metadata.
   *
   * @param {string} featureName The unique identifier for the feature flag
   * @param {any} fallbackValue The fallback value to return if the flag is not available.
   *     Can be any JSON-serializable type (string, number, boolean, object, array, etc.)
   * @param {function} [callback] Optional callback function that receives the flag value.
   *     If provided, the method returns void. If omitted, the method returns a Promise.
   * @returns {Promise<any>|void} Promise that resolves to the flag value if no callback provided,
   *     void if callback is provided. The return type matches the type of value configured in
   *     your Mixpanel project.
   *
   * @example
   * // Promise pattern (recommended)
   * const buttonColor = await mixpanel.flags.getVariantValue('button-color', 'blue');
   * applyButtonColor(buttonColor);
   *
   * @example
   * // Promise pattern with object value
   * const pricing = await mixpanel.flags.getVariantValue('pricing-config', {
   *   price: 9.99,
   *   currency: 'USD'
   * });
   * displayPrice(pricing.price, pricing.currency);
   *
   * @example
   * // Callback pattern
   * mixpanel.flags.getVariantValue('theme', 'light', (theme) => {
   *   applyTheme(theme);
   * });
   *
   * @see getVariantValueSync for synchronous access when flags are ready
   * @see getVariant to get the full variant object including key and metadata
   */
  getVariantValue(featureName, fallbackValue, callback) {
    // If callback provided, use callback pattern
    if (typeof callback === 'function') {
      if (this.isNativeMode) {
        this.mixpanelImpl.getVariantValue(this.token, featureName, fallbackValue)
          .then(result => callback(result))
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant value for ${featureName}:`, error);
            callback(fallbackValue);
          });
      } else if (this.jsFlags) {
        this.jsFlags.getVariantValue(featureName, fallbackValue)
          .then(result => callback(result))
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant value for ${featureName}:`, error);
            callback(fallbackValue);
          });
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
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant value for ${featureName}:`, error);
            resolve(fallbackValue);
          });
      } else if (this.jsFlags) {
        this.jsFlags.getVariantValue(featureName, fallbackValue)
          .then(resolve)
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to get variant value for ${featureName}:`, error);
            resolve(fallbackValue);
          });
      } else {
        resolve(fallbackValue);
      }
    });
  }

  /**
   * Check if a feature flag is enabled asynchronously.
   *
   * <p>This is a convenience method for boolean feature flags. It checks if a feature is enabled
   * by evaluating the variant value as a boolean. This method works regardless of whether flags
   * are ready, making it safe to use at any time.
   *
   * <p>Supports both Promise and callback patterns for maximum flexibility.
   *
   * <p>When a flag is evaluated for the first time, Mixpanel automatically tracks a
   * "$experiment_started" event with relevant experiment metadata.
   *
   * @param {string} featureName The unique identifier for the feature flag
   * @param {boolean} [fallbackValue=false] The fallback value to return if the flag is not available.
   *     Defaults to false if not provided.
   * @param {function} [callback] Optional callback function that receives the boolean result.
   *     If provided, the method returns void. If omitted, the method returns a Promise.
   * @returns {Promise<boolean>|void} Promise that resolves to true if enabled, false otherwise
   *     (when no callback provided). Returns void if callback is provided.
   *
   * @example
   * // Promise pattern (recommended)
   * const isEnabled = await mixpanel.flags.isEnabled('new-checkout', false);
   * if (isEnabled) {
   *   showNewCheckout();
   * } else {
   *   showLegacyCheckout();
   * }
   *
   * @example
   * // Callback pattern
   * mixpanel.flags.isEnabled('beta-features', false, (isEnabled) => {
   *   if (isEnabled) {
   *     enableBetaFeatures();
   *   }
   * });
   *
   * @example
   * // Default fallback (false)
   * const showPromo = await mixpanel.flags.isEnabled('show-promo');
   *
   * @see isEnabledSync for synchronous access when flags are ready
   * @see getVariantValue for non-boolean flag values
   */
  isEnabled(featureName, fallbackValue = false, callback) {
    // If callback provided, use callback pattern
    if (typeof callback === 'function') {
      if (this.isNativeMode) {
        this.mixpanelImpl.isEnabled(this.token, featureName, fallbackValue)
          .then(result => callback(result))
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to check if ${featureName} is enabled:`, error);
            callback(fallbackValue);
          });
      } else if (this.jsFlags) {
        this.jsFlags.isEnabled(featureName, fallbackValue)
          .then(result => callback(result))
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to check if ${featureName} is enabled:`, error);
            callback(fallbackValue);
          });
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
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to check if ${featureName} is enabled:`, error);
            resolve(fallbackValue);
          });
      } else if (this.jsFlags) {
        this.jsFlags.isEnabled(featureName, fallbackValue)
          .then(resolve)
          .catch((error) => {
            MixpanelLogger.error(this.token, `Failed to check if ${featureName} is enabled:`, error);
            resolve(fallbackValue);
          });
      } else {
        resolve(fallbackValue);
      }
    });
  }

  /**
   * Update the context used for feature flag evaluation.
   *
   * <p>Context properties are used to determine which feature flag variants a user should receive
   * based on targeting rules configured in your Mixpanel project. This allows for personalized
   * feature experiences based on user attributes, device properties, or custom criteria.
   *
   * <p><b>IMPORTANT LIMITATION:</b> This method is <b>only available in JavaScript mode</b>
   * (Expo/React Native Web). In native mode (iOS/Android), context must be set during initialization
   * via {@link Mixpanel#init} and cannot be updated at runtime.
   *
   * <p>By default, the new context properties are merged with existing context. Set
   * <code>options.replace = true</code> to completely replace the context instead.
   *
   * @param {object} newContext New context properties to add or update. Can include any
   *     JSON-serializable properties that are used in your feature flag targeting rules.
   *     Common examples include user tier, region, platform version, etc.
   * @param {object} [options={replace: false}] Configuration options for the update
   * @param {boolean} [options.replace=false] If true, replaces the entire context instead of merging.
   *     If false (default), merges new properties with existing context.
   * @returns {Promise<void>} A promise that resolves when the context has been updated and
   *     flags have been re-evaluated with the new context
   * @throws {Error} if called in native mode (iOS/Android)
   *
   * @example
   * // Merge new properties into existing context (JavaScript mode only)
   * await mixpanel.flags.updateContext({
   *   user_tier: 'premium',
   *   region: 'us-west'
   * });
   *
   * @example
   * // Replace entire context (JavaScript mode only)
   * await mixpanel.flags.updateContext({
   *   device_type: 'tablet',
   *   os_version: '14.0'
   * }, { replace: true });
   *
   * @example
   * // This will throw an error in native mode
   * try {
   *   await mixpanel.flags.updateContext({ tier: 'premium' });
   * } catch (error) {
   *   console.error('Context updates not supported in native mode');
   * }
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

  /**
   * Alias for {@link areFlagsReady}. Provided for API consistency with mixpanel-js.
   * @see areFlagsReady
   */
  are_flags_ready() {
    return this.areFlagsReady();
  }

  /**
   * Alias for {@link getVariant}. Provided for API consistency with mixpanel-js.
   * @see getVariant
   */
  get_variant(featureName, fallback, callback) {
    return this.getVariant(featureName, fallback, callback);
  }

  /**
   * Alias for {@link getVariantSync}. Provided for API consistency with mixpanel-js.
   * @see getVariantSync
   */
  get_variant_sync(featureName, fallback) {
    return this.getVariantSync(featureName, fallback);
  }

  /**
   * Alias for {@link getVariantValue}. Provided for API consistency with mixpanel-js.
   * @see getVariantValue
   */
  get_variant_value(featureName, fallbackValue, callback) {
    return this.getVariantValue(featureName, fallbackValue, callback);
  }

  /**
   * Alias for {@link getVariantValueSync}. Provided for API consistency with mixpanel-js.
   * @see getVariantValueSync
   */
  get_variant_value_sync(featureName, fallbackValue) {
    return this.getVariantValueSync(featureName, fallbackValue);
  }

  /**
   * Alias for {@link isEnabled}. Provided for API consistency with mixpanel-js.
   * @see isEnabled
   */
  is_enabled(featureName, fallbackValue, callback) {
    return this.isEnabled(featureName, fallbackValue, callback);
  }

  /**
   * Alias for {@link isEnabledSync}. Provided for API consistency with mixpanel-js.
   * @see isEnabledSync
   */
  is_enabled_sync(featureName, fallbackValue) {
    return this.isEnabledSync(featureName, fallbackValue);
  }

  /**
   * Alias for {@link updateContext}. Provided for API consistency with mixpanel-js.
   * JavaScript mode only.
   * @see updateContext
   */
  update_context(newContext, options) {
    return this.updateContext(newContext, options);
  }
}