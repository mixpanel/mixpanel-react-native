import { MixpanelLogger } from './mixpanel-logger';
import { getPersistedVariantsKey } from './mixpanel-constants';

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

const VariantLookupPolicy = Object.freeze({
  NETWORK_ONLY: 'networkOnly',
  NETWORK_FIRST: 'networkFirst',
  PERSISTENCE_UNTIL_NETWORK_SUCCESS: 'persistenceUntilNetworkSuccess',
});

const VALID_POLICIES = [
  VariantLookupPolicy.NETWORK_ONLY,
  VariantLookupPolicy.NETWORK_FIRST,
  VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
];

/**
 * Storage and retrieval of persisted feature flag variants for the JS-fallback
 * implementation. Uses the AsyncStorage adapter; payloads are serialized to a
 * string via JSON.stringify / JSON.parse.
 */
export class MixpanelFlagPersistence {
  constructor(persistence, token, storage) {
    this.persistence = persistence;
    this.persistedVariantsKey = getPersistedVariantsKey(token);
    this.storage = storage;
    this.token = token;
  }

  getPolicy() {
    if (!this._isConfigValid()) {
      return VariantLookupPolicy.NETWORK_ONLY;
    }
    return this.persistence.variantLookupPolicy;
  }

  getTtlMs() {
    if (!this._isConfigValid()) {
      return DEFAULT_TTL_MS;
    }
    const configuredTtl = this.persistence.persistenceTtlMs;
    return configuredTtl === undefined || configuredTtl === null
      ? DEFAULT_TTL_MS
      : configuredTtl;
  }

  _isConfigValid() {
    const config = this.persistence;
    if (!config) {
      return false;
    }

    if (VALID_POLICIES.indexOf(config.variantLookupPolicy) === -1) {
      MixpanelLogger.error(
        this.token,
        'Invalid variantLookupPolicy:',
        config.variantLookupPolicy
      );
      return false;
    }

    if (
      config.persistenceTtlMs !== undefined &&
      config.persistenceTtlMs !== null &&
      config.persistenceTtlMs <= 0
    ) {
      MixpanelLogger.error(
        this.token,
        'If provided, persistenceTtlMs must be a positive number. Provided value:',
        config.persistenceTtlMs
      );
      return false;
    }

    return true;
  }

  /**
   * Load persisted variants if they match the current context and haven't
   * expired. Returns `null` for any miss (no persisted blob, TTL expired,
   * distinct_id mismatch, or unreadable storage). Stale entries are NOT
   * auto-deleted on read — the next successful fetch overwrites them.
   */
  async loadFlagsFromStorage(context) {
    if (this.getPolicy() === VariantLookupPolicy.NETWORK_ONLY) {
      await this.clear();
      return null;
    }

    const ttlMs = this.getTtlMs();
    let data;
    try {
      const raw = await this.storage.getItem(this.persistedVariantsKey);
      data = raw ? JSON.parse(raw) : null;
    } catch (error) {
      MixpanelLogger.error(
        this.token,
        'Failed to load persisted variants from storage, so clearing',
        error
      );
      await this.clear();
      return null;
    }

    if (!data) {
      return null;
    }

    if (ttlMs && Date.now() - data.persistedAt >= ttlMs) {
      return null;
    }

    if (!context || data.distinctId !== context.distinct_id) {
      await this.clear();
      return null;
    }

    const persistedFlags = new Map();
    const flagVariants = data.flagVariants || {};
    Object.keys(flagVariants).forEach((key) => {
      const variantData = flagVariants[key];
      persistedFlags.set(key, {
        key: variantData.variant_key,
        value: variantData.variant_value,
        experiment_id: variantData.experiment_id,
        is_experiment_active: variantData.is_experiment_active,
        is_qa_tester: variantData.is_qa_tester,
        variant_source: 'persistence',
        persisted_at_in_ms: data.persistedAt,
      });
    });

    return {
      flags: persistedFlags,
      pendingFirstTimeEvents: data.pendingFirstTimeEvents || {},
      persistedAtMs: data.persistedAt,
      ttlMs: ttlMs,
    };
  }

  async save(context, flagsMap, pendingFirstTimeEvents) {
    if (this.getPolicy() === VariantLookupPolicy.NETWORK_ONLY) {
      return;
    }

    const flagVariants = {};
    flagsMap.forEach((variant, key) => {
      flagVariants[key] = {
        variant_key: variant.key,
        variant_value: variant.value,
        experiment_id: variant.experiment_id,
        is_experiment_active: variant.is_experiment_active,
        is_qa_tester: variant.is_qa_tester,
      };
    });

    const data = {
      persistedAt: Date.now(),
      distinctId: context && context.distinct_id,
      context: context,
      flagVariants: flagVariants,
      pendingFirstTimeEvents: pendingFirstTimeEvents || {},
    };

    try {
      await this.storage.setItem(this.persistedVariantsKey, JSON.stringify(data));
    } catch (error) {
      MixpanelLogger.error(
        this.token,
        'Failed to persist variants to storage:',
        error
      );
    }
  }

  async clear() {
    try {
      await this.storage.removeItem(this.persistedVariantsKey);
    } catch (error) {
      MixpanelLogger.error(
        this.token,
        'Failed to clear persisted variants from storage:',
        error
      );
    }
  }
}

export { VariantLookupPolicy, DEFAULT_TTL_MS };
