type MixpanelType = any;
type MixpanelProperties = {[key: string]: MixpanelType};

export type MixpanelAsyncStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export type VariantSource = "network" | "persistence" | "fallback";

export type FallbackReason = "FLAG_NOT_FOUND" | "NOT_READY" | "BACKEND_ERROR";

export interface MixpanelFlagVariant {
  key: string;
  value: any;
  experiment_id?: string;
  is_experiment_active?: boolean;
  is_qa_tester?: boolean;
  variant_source?: VariantSource;
  fallback_reason?: FallbackReason;
  persisted_at_in_ms?: number;
}

export interface NetworkOnlyFlagsPolicy {
  variantLookupPolicy: "networkOnly";
}

export interface NetworkFirstFlagsPolicy {
  variantLookupPolicy: "networkFirst";
  persistenceTtlMs?: number;
}

export interface PersistenceUntilNetworkSuccessFlagsPolicy {
  variantLookupPolicy: "persistenceUntilNetworkSuccess";
  persistenceTtlMs?: number;
}

export type FlagsPersistencePolicy =
  | NetworkOnlyFlagsPolicy
  | NetworkFirstFlagsPolicy
  | PersistenceUntilNetworkSuccessFlagsPolicy;

export interface FeatureFlagsOptions {
  enabled?: boolean;
  context?: {
    [key: string]: any;
    custom_properties?: {
      [key: string]: any;
    };
  };
  persistence?: FlagsPersistencePolicy;
}

export interface UpdateContextOptions {
  replace?: boolean;
}

export interface Flags {
  // Synchronous methods
  loadFlags(): Promise<void>;
  areFlagsReady(): boolean;
  getVariantSync(featureName: string, fallback: MixpanelFlagVariant): MixpanelFlagVariant;
  getVariantValueSync(featureName: string, fallbackValue: any): any;
  isEnabledSync(featureName: string, fallbackValue?: boolean): boolean;
  getAllVariantsSync(): Map<string, MixpanelFlagVariant>;

  // Asynchronous methods with overloads for callback and Promise patterns
  getVariant(featureName: string, fallback: MixpanelFlagVariant): Promise<MixpanelFlagVariant>;
  getVariant(featureName: string, fallback: MixpanelFlagVariant, callback: (result: MixpanelFlagVariant) => void): void;

  getVariantValue(featureName: string, fallbackValue: any): Promise<any>;
  getVariantValue(featureName: string, fallbackValue: any, callback: (value: any) => void): void;

  isEnabled(featureName: string, fallbackValue?: boolean): Promise<boolean>;
  isEnabled(featureName: string, fallbackValue: boolean, callback: (isEnabled: boolean) => void): void;

  getAllVariants(): Promise<Map<string, MixpanelFlagVariant>>;
  getAllVariants(callback: (variants: Map<string, MixpanelFlagVariant>) => void): void;

  // Context management — available in both native and JavaScript modes.
  updateContext(newContext: MixpanelProperties, options?: UpdateContextOptions): Promise<void>;

  // First-time event hook (JavaScript mode only; native mode is a no-op).
  checkFirstTimeEvents(eventName: string, properties?: MixpanelProperties): void;

  // snake_case aliases
  are_flags_ready(): boolean;
  get_variant(featureName: string, fallback: MixpanelFlagVariant): Promise<MixpanelFlagVariant>;
  get_variant(featureName: string, fallback: MixpanelFlagVariant, callback: (result: MixpanelFlagVariant) => void): void;
  get_variant_sync(featureName: string, fallback: MixpanelFlagVariant): MixpanelFlagVariant;
  get_variant_value(featureName: string, fallbackValue: any): Promise<any>;
  get_variant_value(featureName: string, fallbackValue: any, callback: (value: any) => void): void;
  get_variant_value_sync(featureName: string, fallbackValue: any): any;
  is_enabled(featureName: string, fallbackValue?: boolean): Promise<boolean>;
  is_enabled(featureName: string, fallbackValue: boolean, callback: (isEnabled: boolean) => void): void;
  is_enabled_sync(featureName: string, fallbackValue?: boolean): boolean;
  get_all_variants(): Promise<Map<string, MixpanelFlagVariant>>;
  get_all_variants_sync(): Map<string, MixpanelFlagVariant>;
  load_flags(): Promise<void>;
  update_context(newContext: MixpanelProperties, options?: UpdateContextOptions): Promise<void>;
  check_first_time_events(eventName: string, properties?: MixpanelProperties): void;
}

export interface AutocaptureClickOptions {
  enabled?: boolean;
}

export interface AutocaptureRageClickOptions {
  enabled?: boolean;
  clickThreshold?: number;
  timeWindowMs?: number;
  /** Spatial threshold. Unit: dp on Android, pt on iOS. */
  radius?: number;
}

export interface AutocaptureDeadClickOptions {
  enabled?: boolean;
  timeWindowMs?: number;
}

export interface AutocaptureOptions {
  click?: boolean | AutocaptureClickOptions;
  rageClick?: boolean | AutocaptureRageClickOptions;
  deadClick?: boolean | AutocaptureDeadClickOptions;
  /**
   * When enabled, if the tapped view has no meaningful identifier, the SDK
   * walks up the view hierarchy to the nearest clickable ancestor and uses
   * its identity instead. Affects `$el_id` on all autocapture events.
   * Defaults to `true`.
   */
  walkUpToClickableParent?: boolean;
}

export interface ClickEventData {
  /** Touch X coordinate. */
  x: number;
  /** Touch Y coordinate. */
  y: number;
  /** Stable identifier for the tapped element. */
  elementId: string;
  /** Class name or component type of the tapped element. */
  tagName?: string;
  /** Accessibility label of the element. */
  accessibleLabel?: string;
  /** Semantic role (e.g., "button", "link", "switch"). */
  role?: string;
  /** View hierarchy path, ">" separated. */
  elements?: string;
}

export class Autocapture {
  trackScreenView(screenName: string, properties?: MixpanelProperties): void;
  trackScreenLeave(screenName: string, properties?: MixpanelProperties): void;
  trackClick(clickEvent: ClickEventData, properties?: MixpanelProperties): void;
  trackRageClick(clickEvent: ClickEventData, properties?: MixpanelProperties): void;
  trackDeadClick(clickEvent: ClickEventData, properties?: MixpanelProperties): void;
}

export class Mixpanel {
  readonly flags: Flags;
  readonly autocapture: Autocapture;

  constructor(token: string, trackAutoMaticEvents: boolean);
  constructor(token: string, trackAutoMaticEvents: boolean, useNative: true);
  constructor(
    token: string,
    trackAutomaticEvents: boolean,
    useNative: false,
    storage?: MixpanelAsyncStorage
  );
  static init(
    token: string,
    trackAutomaticEvents: boolean,
    optOutTrackingDefault?: boolean
  ): Promise<Mixpanel>;
  init(
    optOutTrackingDefault?: boolean,
    superProperties?: MixpanelProperties,
    serverURL?: string,
    useGzipCompression?: boolean,
    featureFlagsOptions?: FeatureFlagsOptions,
    autocaptureOptions?: AutocaptureOptions | null
  ): Promise<void>;
  setServerURL(serverURL: string): void;
  setLoggingEnabled(loggingEnabled: boolean): void;
  setFlushOnBackground(flushOnBackground: boolean): void;
  setUseIpAddressForGeolocation(useIpAddressForGeolocation: boolean): void;
  setFlushBatchSize(flushBatchSize: number): void;
  hasOptedOutTracking(): Promise<boolean>;
  optInTracking(): void;
  optOutTracking(): void;
  identify(distinctId: string): Promise<void>;
  alias(alias: string, distinctId: string): void;
  track(eventName: string, properties?: MixpanelProperties): void;
  getPeople(): People;
  trackWithGroups(
    eventName: string,
    properties?: MixpanelProperties,
    groups?: MixpanelProperties
  ): void;
  setGroup(groupKey: string, groupID: MixpanelType): void;
  getGroup(groupKey: string, groupID: MixpanelType): MixpanelGroup;
  addGroup(groupKey: string, groupID: MixpanelType): void;
  removeGroup(groupKey: string, groupID: MixpanelType): void;
  deleteGroup(groupKey: string, groupID: MixpanelType): void;
  registerSuperProperties(properties: MixpanelProperties): void;
  registerSuperPropertiesOnce(properties: MixpanelProperties): void;
  unregisterSuperProperty(propertyName: string): void;
  getSuperProperties(): Promise<MixpanelProperties>;
  clearSuperProperties(): void;
  timeEvent(eventName: string): void;
  eventElapsedTime(eventName: string): Promise<number>;
  reset(): void;
  getDistinctId(): Promise<string>;
  getDeviceId(): Promise<string>;
  flush(): void;
}

export class People {
  constructor(token: string, mixpanelInstance: any);
  set(prop: string, to: MixpanelType): void;
  set(properties: MixpanelProperties): void;
  setOnce(prop: string, to: MixpanelType): void;
  setOnce(properties: MixpanelProperties): void;
  increment(prop: string, by: number): void;
  increment(properties: MixpanelProperties): void;
  append(name: string, value: MixpanelType): void;
  union(name: string, value: Array<MixpanelType>): void;
  remove(name: string, value: MixpanelType): void;
  unset(name: string): void;
  trackCharge(charge: number, properties: MixpanelProperties): void;
  clearCharges(): void;
  deleteUser(): void;
}

export class MixpanelGroup {
  constructor(
    token: string,
    groupKey: string,
    groupID: MixpanelType,
    mixpanelInstance: any
  );
  set(prop: string, to: MixpanelType): void;
  setOnce(prop: string, to: MixpanelType): void;
  unset(prop: string): void;
  remove(name: string, value: MixpanelType): void;
  union(name: string, value: MixpanelType): void;
}
