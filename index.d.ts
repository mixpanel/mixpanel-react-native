type BasicObject = { [key: string]: any };

export class People {
  append: (name: string, value: string) => void;
  clearCharges: () => void;
  deleteUser: () => void;
  increment: (prop: string, by: string) => void;
  remove: (name: string, value: string) => void;
  set: (prop: string, to: string) => void;
  setOnce: (prop: string, to: string) => void;
  trackCharge: (charge: string, properties: string) => void;
  union: (name: string, value: string) => void;
  unset: (name: string) => void;
}

export class Mixpanel {
  static init: (token: string, optInTracking?: boolean) => Mixpanel;
  addGroup: (groupKey: string, groupID: BasicObject) => void;
  alias: (alias: string, distinctId: string) => void;
  clearSuperProperties: () => void;
  deleteGroup: (groupKey: string, groupID: BasicObject) => void;
  eventElapsedTime: (eventName: string) => number;
  flush: () => void;
  getDistinctId: () => Promise<string>;
  getGroup: (groupKey: string, groupID: BasicObject) => void;
  getPeople: () => People;
  getSuperProperties: () => BasicObject;
  hasOptedOutTracking: () => boolean;
  identify: (distinctId: string) => void;
  optInTracking: () => void;
  optOutTracking: () => void;
  registerSuperProperties: (properties: BasicObject) => void;
  registerSuperPropertiesOnce: (properties: BasicObject) => void;
  removeGroup: (groupKey: string, groupID: BasicObject) => void;
  reset: () => void;
  setGroup: (groupKey: string, groupID: BasicObject) => void;
  setLoggingEnabled: (loggingEnabled: boolean) => void;
  setServerURL: (serverURL: string) => void;
  timeEvent: (eventName: string) => void;
  track: (eventName: string, properties?: BasicObject) => void;
  trackWithGroups: (eventName: string, properties?: BasicObject, groups: BasicObject) => void;
  unregisterSuperProperty: (propertyName: string) => void;
}
