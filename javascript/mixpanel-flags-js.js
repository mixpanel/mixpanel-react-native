import { encode as base64Encode } from 'base-64';
import { MixpanelLogger } from './mixpanel-logger';
import { MixpanelNetwork } from './mixpanel-network';
import { MixpanelPersistent } from './mixpanel-persistent';
import {
  MixpanelFlagPersistence,
  VariantLookupPolicy,
} from './mixpanel-flag-persistence';
import packageJson from 'mixpanel-react-native/package.json';

const NETWORK_SOURCE = 'network';
const FALLBACK_SOURCE = 'fallback';

function withSource(variant, source, extras) {
  if (!variant || typeof variant !== 'object') {
    return variant;
  }
  const stamped = { ...variant, variant_source: source };
  if (extras) {
    Object.assign(stamped, extras);
  }
  return stamped;
}

export class MixpanelFlagsJS {
  constructor(token, mixpanelImpl, storage, featureFlagsOptions = {}) {
    this.token = token;
    this.mixpanelImpl = mixpanelImpl;
    this.storage = storage;
    this.featureFlagsOptions = featureFlagsOptions || {};
    this.context = this.featureFlagsOptions.context || {};
    this.mixpanelPersistent = MixpanelPersistent.getInstance(storage, token);
  }

  init() {
    this.flags = null;
    this.experimentTracked = new Set();
    this._loadedPersistedAtMs = null;
    this._loadedTtlMs = null;
    this._fetchStartTime = null;
    this._fetchCompleteTime = null;
    this._fetchLatency = null;
    this._traceparent = null;
    this.fetchPromise = null;

    this.persistence = new MixpanelFlagPersistence(
      this.featureFlagsOptions.persistence,
      this.token,
      this.storage
    );

    this.persistenceLoadedPromise = this.persistence
      .loadFlagsFromStorage(this._buildContext())
      .then((loaded) => {
        if (loaded) {
          this.flags = loaded.flags;
          this._loadedPersistedAtMs = loaded.persistedAtMs;
          this._loadedTtlMs = loaded.ttlMs;
        }
      });

    return this.persistenceLoadedPromise
      .then(() => this.fetchFlags())
      .catch((error) => {
        MixpanelLogger.log(
          this.token,
          'Error initializing feature flags:',
          error
        );
      });
  }

  _buildContext() {
    return {
      distinct_id: this.mixpanelPersistent.getDistinctId(this.token),
      device_id: this.mixpanelPersistent.getDeviceId(this.token),
      ...this.context,
    };
  }

  _loadedPersistenceIsStale() {
    if (this._loadedPersistedAtMs === null || !this._loadedTtlMs) {
      return false;
    }
    return Date.now() - this._loadedPersistedAtMs >= this._loadedTtlMs;
  }

  /**
   * Generate W3C traceparent header. Format: 00-{traceID}-{parentID}-{flags}
   * Returns null if UUID generation fails (graceful degradation).
   */
  generateTraceparent() {
    try {
      // Try expo-crypto first
      const crypto = require('expo-crypto');
      const traceID = crypto.randomUUID().replace(/-/g, '');
      const parentID = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      return `00-${traceID}-${parentID}-01`;
    } catch (expoCryptoError) {
      try {
        // Fallback to uuid (import the v4 function directly)
        const { v4: uuidv4 } = require('uuid');
        const traceID = uuidv4().replace(/-/g, '');
        const parentID = uuidv4().replace(/-/g, '').substring(0, 16);
        return `00-${traceID}-${parentID}-01`;
      } catch (uuidError) {
        // Graceful degradation: traceparent is optional for observability
        // Don't block flag loading if UUID generation fails
        MixpanelLogger.log(
          this.token,
          'Could not generate traceparent (UUID unavailable):',
          uuidError
        );
        return null;
      }
    }
  }

  markFetchComplete() {
    if (!this._fetchStartTime) {
      MixpanelLogger.error(
        this.token,
        'Fetch start time not set, cannot mark fetch complete'
      );
      return;
    }
    this._fetchCompleteTime = Date.now();
    this._fetchLatency = this._fetchCompleteTime - this._fetchStartTime;
    this._fetchStartTime = null;
  }

  loadFlags() {
    if (!this.persistence) {
      MixpanelLogger.error(this.token, 'loadFlags called before init');
      return Promise.resolve();
    }
    if (this._fetchStartTime !== null) {
      return this.fetchPromise;
    }
    return this.fetchFlags();
  }

  fetchFlags() {
    this._fetchStartTime = Date.now();

    // Generate traceparent if possible (graceful degradation if UUID unavailable)
    try {
      this._traceparent = this.generateTraceparent();
    } catch (error) {
      // Silently skip traceparent if generation fails
      this._traceparent = null;
    }

    const context = this._buildContext();

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set('context', JSON.stringify(context));
    queryParams.set('token', this.token);
    queryParams.set('mp_lib', 'react-native');
    queryParams.set('$lib_version', packageJson.version);

    MixpanelLogger.log(
      this.token,
      'Fetching feature flags with context:',
      context
    );

    const serverURL =
      this.mixpanelImpl.config?.getServerURL?.(this.token) ||
      'https://api.mixpanel.com';

    // Use /flags endpoint with query parameters
    const endpoint = `/flags?${queryParams.toString()}`;

    // HTTP Basic with the project token as the username and an empty password.
    const authHeaders = {
      Authorization: `Basic ${base64Encode(this.token + ':')}`,
    };
    if (this._traceparent) {
      authHeaders.traceparent = this._traceparent;
    }

    this.fetchPromise = MixpanelNetwork.sendRequest({
      token: this.token,
      endpoint: endpoint,
      data: null,
      serverURL: serverURL,
      useIPAddressForGeoLocation: true,
      headers: authHeaders,
    })
      .then((response) => {
        this.markFetchComplete();

        if (!response || !response.flags) {
          throw new Error('No flags in API response');
        }
        const flags = new Map();
        for (const [key, data] of Object.entries(response.flags)) {
          flags.set(key, {
            key: data.variant_key,
            value: data.variant_value,
            experiment_id: data.experiment_id,
            is_experiment_active: data.is_experiment_active,
            is_qa_tester: data.is_qa_tester,
            variant_source: NETWORK_SOURCE,
          });
        }
        this.flags = flags;
        this._loadedPersistedAtMs = null;
        this._loadedTtlMs = null;
        return this.persistence.save(context, this.flags).then(() => {
          MixpanelLogger.log(this.token, 'Feature flags loaded successfully');
        });
      })
      .catch((error) => {
        if (this._fetchStartTime !== null) {
          this.markFetchComplete();
        }
        MixpanelLogger.log(this.token, 'Error loading feature flags:', error);
        throw error;
      });

    return this.fetchPromise;
  }

  areFlagsReady() {
    return !!this.flags;
  }

  /**
   * Resolves with the current in-flight fetch (if one is running) or
   * immediately with the current state.
   */
  whenReady() {
    if (this.fetchPromise) return this.fetchPromise;
    return Promise.resolve();
  }

  /**
   * Track $experiment_started for a feature on first access. Includes
   * $variant_source so analytics can distinguish network-served from
   * persistence-served evaluations.
   */
  async trackExperimentStarted(featureName, variant) {
    if (this.experimentTracked.has(featureName)) {
      return;
    }

    try {
      const properties = {
        'Experiment name': featureName,
        'Variant name': variant.key,
        $experiment_type: 'feature_flag',
      };

      if (this._fetchCompleteTime) {
        const fetchStartTime =
          this._fetchCompleteTime - (this._fetchLatency || 0);
        properties['Variant fetch start time'] = new Date(
          fetchStartTime
        ).toISOString();
        properties['Variant fetch complete time'] = new Date(
          this._fetchCompleteTime
        ).toISOString();
        properties['Variant fetch latency (ms)'] = this._fetchLatency || 0;
      }

      if (this._traceparent) {
        properties['Variant fetch traceparent'] = this._traceparent;
      }

      if (
        variant.experiment_id !== undefined &&
        variant.experiment_id !== null
      ) {
        properties['$experiment_id'] = variant.experiment_id;
      }
      if (
        variant.is_experiment_active !== undefined &&
        variant.is_experiment_active !== null
      ) {
        properties['$is_experiment_active'] = variant.is_experiment_active;
      }
      if (
        variant.is_qa_tester !== undefined &&
        variant.is_qa_tester !== null
      ) {
        properties['$is_qa_tester'] = variant.is_qa_tester;
      }
      if (
        variant.variant_source !== undefined &&
        variant.variant_source !== null
      ) {
        properties['$variant_source'] = variant.variant_source;
      }
      if (
        variant.persisted_at_in_ms !== undefined &&
        variant.persisted_at_in_ms !== null
      ) {
        properties['$persisted_at_in_ms'] = variant.persisted_at_in_ms;
      }

      await this.mixpanelImpl.track(
        this.token,
        '$experiment_started',
        properties
      );
      this.experimentTracked.add(featureName);
    } catch (error) {
      MixpanelLogger.log(this.token, 'Error tracking experiment:', error);
    }
  }

  getVariantSync(featureName, fallback) {
    if (this._loadedPersistenceIsStale()) {
      MixpanelLogger.log(
        this.token,
        `Loaded persisted variants are past TTL so returning fallback for "${featureName}"`
      );
      return withSource(fallback, FALLBACK_SOURCE);
    }
    if (!this.areFlagsReady()) {
      MixpanelLogger.log(this.token, 'Flags not loaded yet');
      return withSource(fallback, FALLBACK_SOURCE);
    }
    if (!this.flags.has(featureName)) {
      MixpanelLogger.log(this.token, `No flag found: "${featureName}"`);
      return withSource(fallback, FALLBACK_SOURCE);
    }

    const variant = this.flags.get(featureName);
    this.trackExperimentStarted(featureName, variant).catch((error) => {
      MixpanelLogger.warn(
        this.token,
        `Failed to track experiment for ${featureName}:`,
        error
      );
    });
    return variant;
  }

  getVariantValueSync(featureName, fallbackValue) {
    const variant = this.getVariantSync(featureName, {
      key: featureName,
      value: fallbackValue,
    });
    return variant.value;
  }

  isEnabledSync(featureName, fallbackValue = false) {
    const value = this.getVariantValueSync(featureName, fallbackValue);
    if (value !== true && value !== false) {
      MixpanelLogger.error(
        this.token,
        `Feature flag "${featureName}" value: ${value} is not a boolean; returning fallback value: ${fallbackValue}`
      );
      return fallbackValue;
    }
    return value;
  }

  async getVariant(featureName, fallback) {
    if (!this.persistenceLoadedPromise) {
      MixpanelLogger.error(this.token, 'Feature Flags not initialized');
      return withSource(fallback, FALLBACK_SOURCE);
    }
    await this.persistenceLoadedPromise;

    const policy = this.persistence.getPolicy();
    if (policy === VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS) {
      if (this.areFlagsReady() && !this._loadedPersistenceIsStale()) {
        return this.getVariantSync(featureName, fallback);
      }
      if (!this.fetchPromise) {
        return withSource(fallback, FALLBACK_SOURCE);
      }
      try {
        await this.fetchPromise;
        return this.getVariantSync(featureName, fallback);
      } catch (error) {
        MixpanelLogger.error(this.token, 'Error awaiting fetch:', error);
        return withSource(fallback, FALLBACK_SOURCE);
      }
    }

    if (!this.fetchPromise) {
      return withSource(fallback, FALLBACK_SOURCE);
    }
    try {
      await this.fetchPromise;
      return this.getVariantSync(featureName, fallback);
    } catch (error) {
      MixpanelLogger.error(this.token, 'Error awaiting fetch:', error);
      return withSource(fallback, FALLBACK_SOURCE);
    }
  }

  async getVariantValue(featureName, fallbackValue) {
    const variant = await this.getVariant(featureName, {
      key: featureName,
      value: fallbackValue,
    });
    return variant.value;
  }

  async isEnabled(featureName, fallbackValue = false) {
    const value = await this.getVariantValue(featureName, fallbackValue);
    if (typeof value === 'boolean') {
      return value;
    }
    MixpanelLogger.log(
      this.token,
      `Flag "${featureName}" value is not boolean:`,
      value
    );
    return fallbackValue;
  }

  async getAllVariants() {
    if (!this.persistenceLoadedPromise) {
      MixpanelLogger.error(this.token, 'Feature Flags not initialized');
      return {};
    }
    await this.persistenceLoadedPromise;

    const policy = this.persistence.getPolicy();
    if (policy === VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS) {
      if (this.areFlagsReady() && !this._loadedPersistenceIsStale()) {
        return this.getAllVariantsSync();
      }
      if (!this.fetchPromise) {
        return {};
      }
      try {
        await this.fetchPromise;
        return this.getAllVariantsSync();
      } catch (error) {
        MixpanelLogger.error(this.token, 'Error awaiting fetch:', error);
        return {};
      }
    }

    if (!this.fetchPromise) {
      return {};
    }
    try {
      await this.fetchPromise;
      return this.getAllVariantsSync();
    } catch (error) {
      MixpanelLogger.error(this.token, 'Error awaiting fetch:', error);
      return {};
    }
  }

  getAllVariantsSync() {
    if (this._loadedPersistenceIsStale()) {
      return {};
    }
    if (!this.areFlagsReady()) {
      return {};
    }
    return this._snapshotFlags();
  }

  _snapshotFlags() {
    const out = {};
    this.flags.forEach((variant, key) => {
      out[key] = variant;
    });
    return out;
  }

  /**
   * Update context and re-fetch flags. After a context change, persisted
   * variants captured under the old context are no longer relevant.
   */
  async updateContext(newContext, options = {}) {
    if (options.replace) {
      this.context = { ...newContext };
    } else {
      this.context = {
        ...this.context,
        ...newContext,
      };
    }

    this._loadedPersistedAtMs = null;
    this._loadedTtlMs = null;
    this.experimentTracked.clear();

    try {
      await this.loadFlags();
    } catch (error) {
      MixpanelLogger.log(this.token, 'Error fetching flags during updateContext:', error);
    }

    MixpanelLogger.log(this.token, 'Context updated, flags reloaded');
  }

  /** Clear all flag state and trigger a fresh fetch under the new identity. */
  async reset() {
    this.flags = null;
    this.experimentTracked.clear();
    this._loadedPersistedAtMs = null;
    this._loadedTtlMs = null;
    try {
      await this.persistence.clear();
      await this.loadFlags();
    } catch (error) {
      MixpanelLogger.log(this.token, 'Error during flags reset:', error);
    }
  }

  /** Discard in-memory and persisted variants. */
  async clearCache() {
    try {
      await this.persistence.clear();
      this.flags = null;
      this.experimentTracked.clear();
      this._loadedPersistedAtMs = null;
      this._loadedTtlMs = null;
    } catch (error) {
      MixpanelLogger.log(this.token, 'Error clearing flag cache:', error);
    }
  }

  // snake_case aliases
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

  get_all_variants() {
    return this.getAllVariants();
  }

  get_all_variants_sync() {
    return this.getAllVariantsSync();
  }

  load_flags() {
    return this.loadFlags();
  }

  when_ready() {
    return this.whenReady();
  }

  update_context(newContext, options) {
    return this.updateContext(newContext, options);
  }
}
