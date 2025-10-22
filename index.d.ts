type MixpanelType = any;
type MixpanelProperties = {[key: string]: MixpanelType};

export type MixpanelAsyncStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export interface MixpanelFlagVariant {
  key: string;
  value: any;
  experimentID?: string;
  isExperimentActive?: boolean;
  isQATester?: boolean;
}

export interface FeatureFlagsOptions {
  enabled?: boolean;
  context?: {
    [key: string]: any;
    custom_properties?: {
      [key: string]: any;
    };
  };
}

export interface Flags {
  // Synchronous methods
  loadFlags(): Promise<void>;
  areFlagsReady(): boolean;
  getVariantSync(featureName: string, fallback: MixpanelFlagVariant): MixpanelFlagVariant;
  getVariantValueSync(featureName: string, fallbackValue: any): any;
  isEnabledSync(featureName: string, fallbackValue?: boolean): boolean;

  // Asynchronous methods with overloads for callback and Promise patterns
  getVariant(featureName: string, fallback: MixpanelFlagVariant): Promise<MixpanelFlagVariant>;
  getVariant(featureName: string, fallback: MixpanelFlagVariant, callback: (result: MixpanelFlagVariant) => void): void;

  getVariantValue(featureName: string, fallbackValue: any): Promise<any>;
  getVariantValue(featureName: string, fallbackValue: any, callback: (value: any) => void): void;

  isEnabled(featureName: string, fallbackValue?: boolean): Promise<boolean>;
  isEnabled(featureName: string, fallbackValue: boolean, callback: (isEnabled: boolean) => void): void;

  updateContext(context: { [key: string]: any }): Promise<void>;
}

export class Mixpanel {
  readonly flags: Flags;

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
    featureFlagsOptions?: FeatureFlagsOptions
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
