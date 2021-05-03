type MixpanelType = any;
type MixpanelProperties = { [key: string]: MixpanelType };

export class Mixpanel {
    static init(token: string, optInTracking?: boolean): Promise<Mixpanel>;
    setServerURL(serverURL: string): void;
    setLoggingEnabled(loggingEnabled: boolean): void;
    setUseIpAddressForGeolocation(useIpAddressForGeolocation: boolean): void;
    hasOptedOutTracking(): Promise<boolean>;
    optInTracking(): void;
    optOutTracking(): void;
    identify(distinctId: string): void;
    alias(alias: string, distinctId: string): void
    track(eventName: string, properties?: MixpanelProperties): void
    getPeople(): People;
    trackWithGroups(eventName: string, properties?: MixpanelProperties, groups: MixpanelProperties): void;
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
    flush(): void;
}

export class People {
    set(prop: string, to: MixpanelType): void;
    setOnce(prop: string, to: MixpanelType): void;
    increment(prop: string, by: number): void;
    append(name: string, value: MixpanelType): void;
    union(name: string, value: Array<MixpanelType>): void;
    remove(name: string, value: MixpanelType): void;
    unset(name: string): void;
    trackCharge(charge: number, properties: MixpanelProperties): void;
    clearCharges(): void;
    deleteUser(): void;
}

export class MixpanelGroup {
    set(prop: string, to: MixpanelType): void;
    setOnce(prop: string, to: MixpanelType): void;
    unset(prop: string): void;
    remove(name: string, value: MixpanelType): void;
    union(name: string, value: MixpanelType): void;
}
