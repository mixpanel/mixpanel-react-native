import { encode as base64Encode } from 'base-64';
import jsonLogic from 'json-logic-js';
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

// Fallback reasons surfaced via a NEW `fallback_reason` field on the returned
// variant. `variant_source` stays as the coarse 'network' | 'persistence' |
// 'fallback' values — adding a sibling field rather than extending the
// existing one keeps every consumer of the published type working unchanged.
// Values match mixpanel-js so the OpenFeature wrapper dispatch is consistent
// across SDKs.
const FALLBACK_REASON_FLAG_NOT_FOUND = 'FLAG_NOT_FOUND';
const FALLBACK_REASON_NOT_READY = 'NOT_READY';
const FALLBACK_REASON_BACKEND_ERROR = 'BACKEND_ERROR';

function withSource(variant, source, reason) {
  const extras = { variant_source: source };
  if (reason) {
    extras.fallback_reason = reason;
  }
  return variant !== null && typeof variant === 'object'
    ? { ...variant, ...extras }
    : { value: variant, ...extras };
}

function getPendingEventKey(flagKey, firstTimeEventHash) {
  return flagKey + ':' + firstTimeEventHash;
}

function getFlagKeyFromPendingEventKey(eventKey) {
  return eventKey.split(':')[0];
}

/**
 * Direct port of ~/mixpanel-js/src/targeting/event-matcher.js. Replaces the
 * window.__mp_targeting bundle dance with a synchronous json-logic-js import.
 */
function eventMatchesCriteria(eventName, properties, criteria) {
  if (eventName !== criteria.event_name) {
    return { matches: false };
  }
  const propertyFilters = criteria.property_filters;
  if (!propertyFilters || Object.keys(propertyFilters).length === 0) {
    return { matches: true };
  }
  try {
    return { matches: !!jsonLogic.apply(propertyFilters, properties || {}) };
  } catch (error) {
    return { matches: false, error: String(error) };
  }
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
    this.pendingFirstTimeEvents = {};
    this.activatedFirstTimeEvents = {};
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

    // Register a back-reference so MixpanelMain.track() can invoke
    // checkFirstTimeEvents on every tracked event in JS-fallback mode.
    if (this.mixpanelImpl) {
      this.mixpanelImpl._flagsJS = this;
    }

    this.persistenceLoadedPromise = this.persistence
      .loadFlagsFromStorage(this._buildContext())
      .then((loaded) => {
        if (loaded) {
          this.flags = loaded.flags;
          this.pendingFirstTimeEvents = loaded.pendingFirstTimeEvents || {};
          this._loadedPersistedAtMs = loaded.persistedAtMs;
          this._loadedTtlMs = loaded.ttlMs;
        }
      });

    return this.persistenceLoadedPromise
      .then(() => this.loadFlags())
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
   * Generate W3C traceparent header. Format: 00-{traceID}-{parentID}-{flags}.
   * Callers wrap in try/catch; this method does not — failures bubble.
   */
  generateTraceparent() {
    const uuidv4 = require('uuid/v4');
    const traceID = uuidv4().replace(/-/g, '');
    const parentID = uuidv4().replace(/-/g, '').substring(0, 16);
    return `00-${traceID}-${parentID}-01`;
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

    const myPromise = MixpanelNetwork.sendRequest({
      token: this.token,
      endpoint: endpoint,
      data: null,
      serverURL: serverURL,
      useIPAddressForGeoLocation: true,
      headers: authHeaders,
    })
      .then((response) => {
        // Guard by promise identity so a fetch abandoned by
        // _invalidateInFlightFetch() (reset/updateContext/identify) can't
        // install its stale result, even after a replacement fetch is in
        // flight or has completed.
        if (this.fetchPromise !== myPromise) {
          MixpanelLogger.log(
            this.token,
            'Fetch was superseded and is not stale. Ignoring result'
          );
          return;
        }
        this.markFetchComplete();

        if (!response || !response.flags) {
          throw new Error('No flags in API response');
        }
        const flags = new Map();
        const pendingFirstTimeEvents = {};

        for (const [key, data] of Object.entries(response.flags)) {
          // If a first-time event for this flag has already been activated
          // this session, preserve the activated variant rather than
          // overwriting it with the server's current variant.
          let hasActivatedEvent = false;
          const prefix = key + ':';
          for (const eventKey of Object.keys(this.activatedFirstTimeEvents)) {
            if (eventKey.startsWith(prefix)) {
              hasActivatedEvent = true;
              break;
            }
          }
          if (hasActivatedEvent) {
            const currentFlag = this.flags && this.flags.get(key);
            if (currentFlag) {
              flags.set(key, currentFlag);
              continue;
            }
          }
          flags.set(key, {
            key: data.variant_key,
            value: data.variant_value,
            experiment_id: data.experiment_id,
            is_experiment_active: data.is_experiment_active,
            is_qa_tester: data.is_qa_tester,
            variant_source: NETWORK_SOURCE,
          });
        }

        const topLevelDefinitions = response.pending_first_time_events;
        if (Array.isArray(topLevelDefinitions)) {
          for (const def of topLevelDefinitions) {
            const eventKey = getPendingEventKey(
              def.flag_key,
              def.first_time_event_hash
            );
            // Skip events that have already been activated this session.
            if (this.activatedFirstTimeEvents[eventKey]) {
              continue;
            }
            pendingFirstTimeEvents[eventKey] = {
              flag_key: def.flag_key,
              flag_id: def.flag_id,
              project_id: def.project_id,
              first_time_event_hash: def.first_time_event_hash,
              event_name: def.event_name,
              property_filters: def.property_filters,
              pending_variant: def.pending_variant,
            };
          }
        }

        // Preserve activated orphan flags whose flag_key is no longer in the
        // server response.
        for (const eventKey of Object.keys(this.activatedFirstTimeEvents)) {
          if (!this.activatedFirstTimeEvents[eventKey]) continue;
          const flagKey = getFlagKeyFromPendingEventKey(eventKey);
          if (!flags.has(flagKey) && this.flags && this.flags.has(flagKey)) {
            flags.set(flagKey, this.flags.get(flagKey));
          }
        }

        this.flags = flags;
        this.experimentTracked = new Set();
        this.pendingFirstTimeEvents = pendingFirstTimeEvents;
        this._loadedPersistedAtMs = null;
        this._loadedTtlMs = null;
        return this.persistence
          .save(context, this.flags, this.pendingFirstTimeEvents)
          .then(() => {
            MixpanelLogger.log(this.token, 'Feature flags loaded successfully');
          });
      })
      .catch((error) => {
        if (this.fetchPromise !== myPromise) {
          MixpanelLogger.log(
            this.token,
            'Fetch was superseded and is not stale. Ignoring result'
          );
          return;
        }
        this.markFetchComplete();
        MixpanelLogger.log(this.token, 'Error loading feature flags:', error);
        throw error;
      });

    this.fetchPromise = myPromise;
    return myPromise;
  }

  areFlagsReady() {
    if (this._loadedPersistenceIsStale()) return false;
    return !!this.flags;
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
    this.experimentTracked.add(featureName);

    try {
      const fetchStartTime =
        this._fetchCompleteTime != null
          ? this._fetchCompleteTime - (this._fetchLatency || 0)
          : null;
      const properties = {
        'Experiment name': featureName,
        'Variant name': variant.key,
        $experiment_type: 'feature_flag',
        'Variant fetch start time':
          fetchStartTime != null
            ? new Date(fetchStartTime).toISOString()
            : null,
        'Variant fetch complete time':
          this._fetchCompleteTime != null
            ? new Date(this._fetchCompleteTime).toISOString()
            : null,
        'Variant fetch latency (ms)':
          this._fetchLatency != null ? this._fetchLatency : null,
        'Variant fetch traceparent': this._traceparent || null,
      };

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
    } catch (error) {
      this.experimentTracked.delete(featureName);
      MixpanelLogger.log(this.token, 'Error tracking experiment:', error);
    }
  }

  getVariantSync(featureName, fallback) {
    if (this._loadedPersistenceIsStale()) {
      MixpanelLogger.log(
        this.token,
        `Loaded persisted variants are past TTL so returning fallback for "${featureName}"`
      );
      return withSource(fallback, FALLBACK_SOURCE, FALLBACK_REASON_NOT_READY);
    }
    if (!this.areFlagsReady()) {
      MixpanelLogger.log(this.token, 'Flags not loaded yet');
      return withSource(fallback, FALLBACK_SOURCE, FALLBACK_REASON_NOT_READY);
    }
    if (!this.flags.has(featureName)) {
      MixpanelLogger.log(this.token, `No flag found: "${featureName}"`);
      return withSource(fallback, FALLBACK_SOURCE, FALLBACK_REASON_FLAG_NOT_FOUND);
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
      return withSource(fallback, FALLBACK_SOURCE, FALLBACK_REASON_NOT_READY);
    }
    await this.persistenceLoadedPromise;

    const policy = this.persistence.getPolicy();
    if (
      policy === VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS &&
      this.areFlagsReady() &&
      !this._loadedPersistenceIsStale()
    ) {
      return this.getVariantSync(featureName, fallback);
    }

    if (this.fetchPromise) {
      try {
        await this.fetchPromise;
        return this.getVariantSync(featureName, fallback);
      } catch (error) {
        MixpanelLogger.log(this.token, 'Error awaiting fetch:', error);
        // If the fetch failure still left usable state (e.g. persistence hit
        // under a different policy), serve from cache. Otherwise stamp
        // BACKEND_ERROR so callers can distinguish "backend is down" from
        // "flags never loaded".
        return this.areFlagsReady()
          ? this.getVariantSync(featureName, fallback)
          : withSource(fallback, FALLBACK_SOURCE, FALLBACK_REASON_BACKEND_ERROR);
      }
    }
    // No fetch in flight and no ready state to serve from.
    return withSource(fallback, FALLBACK_SOURCE, FALLBACK_REASON_NOT_READY);
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
      return new Map();
    }
    await this.persistenceLoadedPromise;

    const policy = this.persistence.getPolicy();
    if (
      policy === VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS &&
      this.areFlagsReady() &&
      !this._loadedPersistenceIsStale()
    ) {
      return this.getAllVariantsSync();
    }

    if (this.fetchPromise) {
      try {
        await this.fetchPromise;
      } catch (error) {
        MixpanelLogger.log(this.token, 'Error awaiting fetch:', error);
      }
    }
    return this.getAllVariantsSync();
  }

  getAllVariantsSync() {
    if (this._loadedPersistenceIsStale()) {
      return new Map();
    }
    if (!this.areFlagsReady()) {
      return new Map();
    }
    return new Map(this.flags);
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
    this.pendingFirstTimeEvents = {};
    this.activatedFirstTimeEvents = {};

    // Any in-flight fetch was built under the previous context; discard it so
    // loadFlags() below issues a fresh request under the updated context.
    this._invalidateInFlightFetch();

    try {
      await this.loadFlags();
    } catch (error) {
      MixpanelLogger.log(this.token, 'Error fetching flags during updateContext:', error);
    }

    MixpanelLogger.log(this.token, 'Context updated, flags reloaded');
  }

  /**
   * Discard any in-flight fetch so subsequent loadFlags() starts fresh under
   * the current identity. Used by reset() and by identify() flows that need
   * to abandon a fetch keyed under a stale identity.
   */
  _invalidateInFlightFetch() {
    this.fetchPromise = null;
    this._fetchStartTime = null;
  }

  /** Clear all flag state and trigger a fresh fetch under the new identity. */
  async reset() {
    this.flags = null;
    this.experimentTracked.clear();
    this.pendingFirstTimeEvents = {};
    this.activatedFirstTimeEvents = {};
    this._loadedPersistedAtMs = null;
    this._loadedTtlMs = null;
    this._invalidateInFlightFetch();
    try {
      await this.persistence.clear();
      await this.loadFlags();
    } catch (error) {
      MixpanelLogger.log(this.token, 'Error during flags reset:', error);
    }
  }

  /**
   * If a tracked event matches any pending first-time event, switch the
   * corresponding flag to its pending variant and record the activation
   * with the server (fire-and-forget). Synchronous because json-logic-js
   * imports synchronously — no targeting-bundle Promise dance needed.
   */
  checkFirstTimeEvents(eventName, properties) {
    if (
      !this.pendingFirstTimeEvents ||
      Object.keys(this.pendingFirstTimeEvents).length === 0
    ) {
      return;
    }
    this._processFirstTimeEventCheck(eventName, properties);
  }

  _processFirstTimeEventCheck(eventName, properties) {
    for (const eventKey of Object.keys(this.pendingFirstTimeEvents)) {
      if (this.activatedFirstTimeEvents[eventKey]) {
        continue;
      }
      const pendingEvent = this.pendingFirstTimeEvents[eventKey];
      const flagKey = pendingEvent.flag_key;

      const criteria = {
        event_name: pendingEvent.event_name,
        property_filters: pendingEvent.property_filters,
      };
      const matchResult = eventMatchesCriteria(eventName, properties, criteria);

      if (matchResult.error) {
        MixpanelLogger.error(
          this.token,
          `Error checking first-time event for flag "${flagKey}": ${matchResult.error}`
        );
        continue;
      }
      if (!matchResult.matches) {
        continue;
      }

      MixpanelLogger.log(
        this.token,
        `First-time event matched for flag "${flagKey}": ${eventName}`
      );

      const newVariant = {
        key: pendingEvent.pending_variant.variant_key,
        value: pendingEvent.pending_variant.variant_value,
        experiment_id: pendingEvent.pending_variant.experiment_id,
        is_experiment_active: pendingEvent.pending_variant.is_experiment_active,
        is_qa_tester: pendingEvent.pending_variant.is_qa_tester,
        variant_source: NETWORK_SOURCE,
      };

      this.flags.set(flagKey, newVariant);
      this.experimentTracked.delete(flagKey);
      this.activatedFirstTimeEvents[eventKey] = true;

      this.recordFirstTimeEvent(
        pendingEvent.flag_id,
        pendingEvent.project_id,
        pendingEvent.first_time_event_hash
      );
    }
  }

  getFirstTimeEventApiRoute(flagId) {
    const serverURL =
      this.mixpanelImpl.config?.getServerURL?.(this.token) ||
      'https://api.mixpanel.com';
    return `${serverURL.replace(/\/$/, '')}/flags/${flagId}/first-time-events`;
  }

  /** Fire-and-forget POST to record a first-time event activation. */
  recordFirstTimeEvent(flagId, projectId, firstTimeEventHash) {
    const distinctId = this.mixpanelPersistent.getDistinctId(this.token);

    const searchParams = new URLSearchParams();
    searchParams.set('mp_lib', 'react-native');
    searchParams.set('$lib_version', packageJson.version);
    const url = `${this.getFirstTimeEventApiRoute(flagId)}?${searchParams.toString()}`;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${base64Encode(this.token + ':')}`,
    };
    if (this._traceparent) {
      headers.traceparent = this._traceparent;
    }

    const payload = {
      distinct_id: distinctId,
      project_id: projectId,
      first_time_event_hash: firstTimeEventHash,
    };

    MixpanelLogger.log(this.token, `Recording first-time event for flag: ${flagId}`);

    // Direct fetch (not MixpanelNetwork) mirrors mixpanel-js: fire-and-forget
    // with no retries, raw JSON body. Swallow errors — cohort sync catches up.
    try {
      const promise = fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch((error) => {
          MixpanelLogger.error(
            this.token,
            `Failed to record first-time event for flag ${flagId}:`,
            error
          );
        });
      }
    } catch (error) {
      MixpanelLogger.error(
        this.token,
        `Failed to record first-time event for flag ${flagId}:`,
        error
      );
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

  update_context(newContext, options) {
    return this.updateContext(newContext, options);
  }

  check_first_time_events(eventName, properties) {
    return this.checkFirstTimeEvents(eventName, properties);
  }
}
