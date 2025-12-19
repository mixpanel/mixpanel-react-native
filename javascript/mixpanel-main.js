import { Platform } from "react-native";
import { MixpanelCore } from "./mixpanel-core";
import { MixpanelType } from "./mixpanel-constants";
import { MixpanelConfig } from "./mixpanel-config";
import { MixpanelPersistent } from "./mixpanel-persistent";
import { MixpanelLogger } from "mixpanel-react-native/javascript/mixpanel-logger";
import packageJson from "mixpanel-react-native/package.json";

export default class MixpanelMain {
  constructor(token, trackAutomaticEvents, storage) {
    this.token = token;
    this.config = MixpanelConfig.getInstance();
    this.core = MixpanelCore(storage);
    this.core.initialize(token);
    this.core.startProcessingQueue(token);
    this.mixpanelPersistent = MixpanelPersistent.getInstance(storage, token);
  }

  async initialize(
    token,
    trackAutomaticEvents = false,
    optOutTrackingDefault = false,
    superProperties = null,
    serverURL = "https://api.mixpanel.com",
    useGzipCompression = false,
    featureFlagsOptions = {}
  ) {
    MixpanelLogger.log(token, `Initializing Mixpanel`);

    // Store feature flags options for later use
    this.featureFlagsOptions = featureFlagsOptions;
    this.featureFlagsEnabled = featureFlagsOptions.enabled || false;
    this.featureFlagsContext = featureFlagsOptions.context || {};

    await this.mixpanelPersistent.initializationCompletePromise(token);
    if (optOutTrackingDefault) {
      await this.optOutTracking(token);
      return;
    } else {
      await this._setOptedOutTrackingFlag(token, false);
    }

    this.setServerURL(token, serverURL);
    await this.registerSuperProperties(token, {
      ...superProperties,
    });

    // Initialize feature flags if enabled
    if (this.featureFlagsEnabled) {
      MixpanelLogger.log(token, "Feature flags enabled during initialization");
    }
  }

  getMetaData() {
    const { OS, Version, constants } = Platform;
    const { Brand, Manufacturer, Model } = constants || {};

    let metadata = {
      $os: OS,
      $os_version: Version,
      ...JSON.parse(JSON.stringify(packageJson.metadata)),
      $lib_version: packageJson.version,
    };
    if (OS === "ios") {
      metadata = {
        ...metadata,
        $manufacturer: "Apple",
      };
    } else if (OS === "android") {
      metadata = {
        ...metadata,
        $android_brand: Brand,
        $android_manufacturer: Manufacturer,
        $android_model: Model,
      };
    }

    return metadata;
  }

  async reset(token) {
    await this.mixpanelPersistent.reset(token);
  }

  /**
   * Get the feature flags context that was provided during initialization
   * @returns {object} The feature flags context object
   */
  getFeatureFlagsContext() {
    return this.featureFlagsContext || {};
  }

  async track(token, eventName, properties) {
    if (this.mixpanelPersistent.getOptedOut(token)) {
      MixpanelLogger.log(
        token,
        `User has opted out of tracking, skipping tracking.`
      );
      return;
    }

    MixpanelLogger.log(
      token,
      `Track '${eventName}' with properties`,
      properties
    );
    const superProperties = this.mixpanelPersistent.getSuperProperties(token);
    const identityProps = {
      distinct_id: this.mixpanelPersistent.getDistinctId(token),
      $device_id: this.mixpanelPersistent.getDeviceId(token),
      $user_id: this.mixpanelPersistent.getUserId(token),
    };
    const eventElapsedTime = await this.eventElapsedTime(token, eventName);
    const eventProperties = Object.freeze({
      token,
      time: Date.now(),
      ...this.getMetaData(),
      ...superProperties,
      ...properties,
      ...identityProps,
      ...(eventElapsedTime !== null && {
        $duration: eventElapsedTime,
      }),
    });

    const eventData = Object.freeze({
      event: eventName,
      properties: eventProperties,
    });

    if (eventElapsedTime !== null) {
      let timeEvents = this.mixpanelPersistent.getTimeEvents(token);
      delete timeEvents[eventName];
      this.mixpanelPersistent.updateTimeEvents(token, timeEvents);
      await this.mixpanelPersistent.persistTimeEvents(token);
    }
    await this.core.addToMixpanelQueue(token, MixpanelType.EVENTS, eventData);
  }

  setLoggingEnabled(token, loggingEnabled) {
    this.config.setLoggingEnabled(token, loggingEnabled);
  }

  setServerURL(token, serverURL) {
    this.config.setServerURL(token, serverURL);
  }

  setUseIpAddressForGeolocation(token, useIpAddressForGeolocation) {
    this.config.setUseIpAddressForGeolocation(
      token,
      useIpAddressForGeolocation
    );
  }

  setFlushBatchSize(token, flushBatchSize) {
    this.config.setFlushBatchSize(token, flushBatchSize);
  }

  flush(token) {
    this.core.flush(token);
  }

  async optOutTracking(token) {
    await this._setOptedOutTrackingFlag(token, true);
    MixpanelLogger.log(token, "User has opted out of tracking");
    await this.mixpanelPersistent.reset(token);
  }

  async optInTracking(token) {
    await this._setOptedOutTrackingFlag(token, false);
    MixpanelLogger.log(token, "User has opted in to tracking");
    await this.track(token, "$opt_in");
  }

  async _setOptedOutTrackingFlag(token, optedOut) {
    this.mixpanelPersistent.updateOptedOut(token, optedOut);
    await this.mixpanelPersistent.persistOptedOut(token);
  }

  hasOptedOutTracking(token) {
    return this.mixpanelPersistent.getOptOut(token);
  }

  async identify(token, newDistinctId) {
    MixpanelLogger.log(token, `Identify '${newDistinctId}'`);
    const oldDistinctId = this.mixpanelPersistent.getDistinctId(token);
    if (oldDistinctId === newDistinctId) {
      MixpanelLogger.log(
        token,
        `Distinct Id is already set to ${newDistinctId}, skipping identify.`
      );
      return;
    }
    this.mixpanelPersistent.updateDistinctId(token, newDistinctId);
    this.mixpanelPersistent.updateUserId(token, newDistinctId);
    const deviceId = this.mixpanelPersistent.getDeviceId(token);
    await this.mixpanelPersistent.persistIdentity(token);
    await this.core.identifyUserQueue(token);
    await this.track(token, "$identify", {
      distinctId: newDistinctId,
      $user_id: newDistinctId,
      $anon_distinct_id: oldDistinctId,
      $device_id: deviceId,
    });
  }

  async alias(token, alias, distinctId) {
    MixpanelLogger.log(token, `Alias '${alias}' to '${distinctId}'`);
    await this.track(token, "$create_alias", {
      alias,
      distinct_id: distinctId,
    });
    await this.identify(token, distinctId);
  }

  async getDeviceId(token) {
    if (!this.mixpanelPersistent.getDeviceId(token)) {
      await this.mixpanelPersistent.loadIdentity(token);
    }
    return this.mixpanelPersistent.getDeviceId(token);
  }

  async getDistinctId(token) {
    if (!this.mixpanelPersistent.getDistinctId(token)) {
      await this.mixpanelPersistent.loadIdentity(token);
    }
    return this.mixpanelPersistent.getDistinctId(token);
  }

  async _updateSuperProperties(token, properties) {
    this.mixpanelPersistent.updateSuperProperties(token, properties);
    await this.mixpanelPersistent.persistSuperProperties(token);
  }

  async registerSuperProperties(token, properties) {
    MixpanelLogger.log(token, `Register super properties:`, properties);
    const currentSuperProperties =
      this.mixpanelPersistent.getSuperProperties(token);
    MixpanelLogger.log(
      token,
      `Current Super Properties:`,
      currentSuperProperties
    );
    const updatedSuperProperties = {
      ...currentSuperProperties,
      ...properties,
    };

    this._updateSuperProperties(token, updatedSuperProperties);
    MixpanelLogger.log(
      token,
      `Updated Super Properties:`,
      updatedSuperProperties
    );
  }

  async registerSuperPropertiesOnce(token, properties) {
    MixpanelLogger.log(token, `Register super properties once`, properties);
    const currentSuperProperties =
      this.mixpanelPersistent.getSuperProperties(token);

    const updatedSuperProperties = {
      ...properties,
      ...currentSuperProperties,
    };

    this._updateSuperProperties(token, updatedSuperProperties);
    MixpanelLogger.log(
      token,
      `Updated Super Properties:`,
      updatedSuperProperties
    );
  }

  async unregisterSuperProperty(token, propertyName) {
    MixpanelLogger.log(token, `Unregister super property '${propertyName}'`);
    let superProperties = this.mixpanelPersistent.getSuperProperties(token);
    delete superProperties[propertyName];
    this._updateSuperProperties(token, superProperties);
    MixpanelLogger.log(token, `Updated Super Properties:`, superProperties);
  }

  async getSuperProperties(token) {
    if (!this.mixpanelPersistent.getSuperProperties(token)) {
      await this.mixpanelPersistent.loadSuperProperties(token);
    }
    return this.mixpanelPersistent.getSuperProperties(token);
  }

  async clearSuperProperties(token) {
    MixpanelLogger.log(token, `Clear super properties`);
    this._updateSuperProperties(token, {});
    MixpanelLogger.log(token, `Updated Super Properties:`, {});
  }

  async timeEvent(token, eventName) {
    const currentTime = Math.round(Date.now() / 1000);
    MixpanelLogger.log(
      token,
      `Add time event '${eventName}' at`,
      new Date(currentTime * 1000).toLocaleString()
    );
    this.mixpanelPersistent.updateTimeEvents(token, {
      ...this.mixpanelPersistent.getTimeEvents(token),
      [eventName]: currentTime,
    });
    await this.mixpanelPersistent.persistTimeEvents(token);
  }

  async eventElapsedTime(token, eventName) {
    if (!this.mixpanelPersistent.getTimeEvents(token)) {
      await this.mixpanelPersistent.loadTimeEvents(token);
    }
    const timeEvents = this.mixpanelPersistent.getTimeEvents(token);
    const startTime = timeEvents ? timeEvents[eventName] : undefined;

    if (startTime) {
      const duration = Math.round(Date.now() / 1000) - startTime;
      return duration;
    }
    return null;
  }

  async sendProfileDataToMixpanel(token, action) {
    const distinctId = this.mixpanelPersistent.getDistinctId(token);
    const deviceId = this.mixpanelPersistent.getDeviceId(token);
    const userId = this.mixpanelPersistent.getUserId(token);
    const profileData = {
      $token: token,
      $time: Date.now(),
      ...action,
      ...(distinctId != null && { $distinct_id: distinctId }),
      ...(deviceId != null && { $device_id: deviceId }),
      ...(userId != null && { $user_id: userId }),
    };
    await this.core.addToMixpanelQueue(token, MixpanelType.USER, profileData);
  }

  async sendGroupDataToMixpanel({ token, groupKey, groupID, action }) {
    const profileData = {
      $token: token,
      $time: Date.now(),
      $group_key: groupKey,
      $group_id: groupID,
      ...action,
    };
    await this.core.addToMixpanelQueue(token, MixpanelType.GROUPS, profileData);
  }

  async set(token, properties) {
    MixpanelLogger.log(token, `Set properties: `, properties);
    await this.sendProfileDataToMixpanel(token, { $set: properties });
  }

  async setOnce(token, properties) {
    MixpanelLogger.log(token, `Set once properties: `, properties);
    await this.sendProfileDataToMixpanel(token, { $set_once: properties });
  }

  async increment(token, properties) {
    MixpanelLogger.log(token, `Increment properties: `, properties);
    await this.sendProfileDataToMixpanel(token, { $add: properties });
  }

  async append(token, nameOrProperties, value) {
    if (typeof nameOrProperties === "string" && value !== undefined) {
      MixpanelLogger.log(token, `Append properties: `, {
        [nameOrProperties]: value,
      });
      await this.sendProfileDataToMixpanel(token, {
        $append: { [nameOrProperties]: value },
      });
    } else if (typeof nameOrProperties === "object") {
      MixpanelLogger.log(token, `Append properties: `, nameOrProperties);
      await this.sendProfileDataToMixpanel(token, {
        $append: nameOrProperties,
      });
    }
  }

  async union(token, nameOrProperties, value) {
    if (typeof nameOrProperties === "string" && value !== undefined) {
      MixpanelLogger.log(token, `Union properties: `, {
        [nameOrProperties]: value,
      });
      await this.sendProfileDataToMixpanel(token, {
        $union: { [nameOrProperties]: value },
      });
    } else if (typeof nameOrProperties === "object") {
      MixpanelLogger.log(token, `Union properties: `, nameOrProperties);
      await this.sendProfileDataToMixpanel(token, { $union: nameOrProperties });
    }
  }

  async remove(token, nameOrProperties, value) {
    if (typeof nameOrProperties === "string" && value !== undefined) {
      MixpanelLogger.log(token, `Remove properties: `, {
        [nameOrProperties]: value,
      });
      await this.sendProfileDataToMixpanel(token, {
        $remove: { [nameOrProperties]: value },
      });
    } else if (typeof nameOrProperties === "object") {
      MixpanelLogger.log(token, `Remove properties: `, nameOrProperties);
      await this.sendProfileDataToMixpanel(token, {
        $remove: nameOrProperties,
      });
    }
  }

  async trackCharge(token, charge, properties) {
    MixpanelLogger.log(token, `Track charge: `, charge, properties);
    await this.append(token, {
      $transactions: { $amount: charge, $time: Date.now(), ...properties },
    });
  }

  async clearCharges(token) {
    MixpanelLogger.log(token, `Clear charges`);
    await this.set(token, {
      $transactions: [],
    });
  }

  async unset(token, property) {
    MixpanelLogger.log(token, `Unset property: `, property);
    await this.sendProfileDataToMixpanel(token, { $unset: [property] });
  }

  async deleteUser(token) {
    MixpanelLogger.log(token, `Delete user`);
    await this.sendProfileDataToMixpanel(token, { $delete: "null" });
  }

  async groupSetProperties(token, groupKey, groupID, properties) {
    MixpanelLogger.log(
      token,
      `Group set properties: `,
      groupKey,
      groupID,
      properties
    );
    await this.sendGroupDataToMixpanel({
      token,
      groupKey,
      groupID,
      action: {
        $set: properties,
      },
    });
  }

  async groupSetPropertyOnce(token, groupKey, groupID, properties) {
    MixpanelLogger.log(
      token,
      `Group set once properties: `,
      groupKey,
      groupID,
      properties
    );
    await this.sendGroupDataToMixpanel({
      token,
      groupKey,
      groupID,
      action: {
        $set_once: properties,
      },
    });
  }

  async groupUnsetProperty(token, groupKey, groupID, prop) {
    MixpanelLogger.log(
      token,
      `Group unset property: `,
      groupKey,
      groupID,
      prop
    );
    await this.sendGroupDataToMixpanel({
      token,
      groupKey,
      groupID,
      action: {
        $unset: [prop],
      },
    });
  }

  async groupRemovePropertyValue(token, groupKey, groupID, name, value) {
    MixpanelLogger.log(
      token,
      `Group remove property value: `,
      groupKey,
      groupID,
      name,
      value
    );
    await this.sendGroupDataToMixpanel({
      token,
      groupKey,
      groupID,
      action: {
        $remove: { [name]: value },
      },
    });
  }

  async groupUnionProperty(token, groupKey, groupID, name, value) {
    MixpanelLogger.log(
      token,
      `Group union property: `,
      groupKey,
      groupID,
      name,
      value
    );
    await this.sendGroupDataToMixpanel({
      token,
      groupKey,
      groupID,
      action: {
        $union: { [name]: value },
      },
    });
  }

  async trackWithGroups(token, eventName, properties, groups) {
    MixpanelLogger.log(
      token,
      `Track with groups: `,
      eventName,
      properties,
      groups
    );
    await this.track(token, eventName, { ...properties, ...groups });
  }

  async setGroup(token, groupKey, groupID) {
    MixpanelLogger.log(token, `Set group: `, groupKey, groupID);
    const properties = { [groupKey]: [groupID] };
    await this.registerSuperProperties(token, properties);
    await this.set(token, properties);
  }

  async addGroup(token, groupKey, groupID) {
    MixpanelLogger.log(token, `Add group: `, groupKey, groupID);
    const superProperties = this.mixpanelPersistent.getSuperProperties(token);
    const groupArray = superProperties[groupKey] || [];
    if (!groupArray.includes(groupID)) {
      this.registerSuperProperties(token, {
        [groupKey]: [...groupArray, groupID],
      });
    }
    await this.union(token, { [groupKey]: [groupID] });
  }

  async removeGroup(token, groupKey, groupID) {
    MixpanelLogger.log(token, `Remove group: `, groupKey, groupID);
    const superProperties = this.mixpanelPersistent.getSuperProperties(token);
    if (superProperties && superProperties[groupKey]) {
      const filteredGroup = superProperties[groupKey].filter(
        (id) => id !== groupID
      );
      this.registerSuperProperties(token, { [groupKey]: filteredGroup });
      if (filteredGroup.length === 0) {
        this.unregisterSuperProperty(token, groupKey);
      }
    }
    await this.remove(token, { [groupKey]: groupID });
  }

  async deleteGroup(token, groupKey, groupID) {
    MixpanelLogger.log(token, `Delete group: `, groupKey, groupID);
    await this.sendGroupDataToMixpanel({
      token,
      groupKey,
      groupID,
      action: {
        $delete: "null",
      },
    });
  }
}
