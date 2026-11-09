import { Platform } from "react-native";
import { MixpanelCore } from "./mixpanel-core";
import { MixpanelQueueManager } from "./mixpanel-queue";
import { MixpanelType } from "./mixpanel-constants";
import { MixpanelConfig } from "./mixpanel-config";
import { MixpanelPersistent } from "./mixpanel-persistent";
import { MixpanelLogger } from "mixpanel-react-native/javascript/mixpanel-logger";
import { identityToString } from "./mixpanel-utils";
import packageJson from "mixpanel-react-native/package.json";

const USER_ID_GROUP_KEY = "$user_id";
const COMPANY_ID_GROUP_KEY = "$company_id";
// /groups has no $add, $append or $merge
const HIERARCHICAL_GROUPS_OPERATIONS = [
  "$set",
  "$set_once",
  "$unset",
  "$union",
  "$remove",
  "$delete",
];

export default class MixpanelMain {
  constructor(token, trackAutomaticEvents, storage) {
    this.token = token;
    this.config = MixpanelConfig.getInstance();
    this.core = MixpanelCore(storage);
    this.core.initialize(token);
    this.core.startProcessingQueue(token);
    this.mixpanelPersistent = MixpanelPersistent.getInstance(storage, token);
    this.hierarchicalGroups = false;
  }

  async initialize(
    token,
    trackAutomaticEvents = false,
    optOutTrackingDefault = false,
    superProperties = null,
    serverURL = "https://api.mixpanel.com",
    useGzipCompression = false,
    featureFlagsOptions = {},
    autocaptureOptions = null,
    hierarchicalGroups = false
  ) {
    MixpanelLogger.log(token, `Initializing Mixpanel`);

    // Fixed for the life of the instance
    this.hierarchicalGroups = hierarchicalGroups === true;

    // Store feature flags options for later use
    this.featureFlagsOptions = featureFlagsOptions;
    this.featureFlagsEnabled = featureFlagsOptions.enabled || false;
    this.featureFlagsContext = featureFlagsOptions.context || {};

    await this.mixpanelPersistent.initializationCompletePromise(token);
    if (optOutTrackingDefault) {
      await this._optOutTracking(token);
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

  /**
   * Get the full feature flags options object that was provided during
   * initialization. Used by the JS-fallback Flags impl to read the
   * variantLookupPolicy and any other persistence-related configuration.
   * @returns {object}
   */
  getFeatureFlagsOptions() {
    return this.featureFlagsOptions || {};
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
    const userId = this.mixpanelPersistent.getUserId(token);
    const companyIdentityProps = this._companyIdentityProps(token);
    const identityProps = {
      // On a hierarchical groups project an identified user is $user_id and $company_id, so no
      // distinct_id
      ...(userId && companyIdentityProps.$company_id
        ? {}
        : { distinct_id: this.mixpanelPersistent.getDistinctId(token) }),
      $device_id: this.mixpanelPersistent.getDeviceId(token),
      $user_id: userId,
      ...companyIdentityProps,
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

    // Notify the JS-fallback flags subsystem so it can activate any
    // matching first-time event and switch the corresponding variant.
    // Self-registered as `_flagsJS` by MixpanelFlagsJS.init(); absent in
    // native mode (the platform SDK handles this internally).
    if (this._flagsJS) {
      try {
        this._flagsJS.checkFirstTimeEvents(eventName, properties);
      } catch (e) {
        MixpanelLogger.log(token, "checkFirstTimeEvents error:", e);
      }
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
    const userId = this.mixpanelPersistent.getUserId(token);
    const companyId = this.mixpanelPersistent.getCompanyId(token);
    const deleteProfile =
      this.hierarchicalGroups &&
      !this.mixpanelPersistent.getOptedOut(token) &&
      userId &&
      companyId;
    // Opted out before anything is awaited, so calls made meanwhile are dropped
    this.mixpanelPersistent.updateOptedOut(token, true);
    if (deleteProfile) {
      // Delete the user's $user_id profile, never the company or team profiles. Sent now
      // because nothing is flushed while opted out, so pending /groups updates are cleared
      // first to send only the delete.
      MixpanelLogger.log(token, `Delete user`);
      await MixpanelQueueManager.clearQueue(token, MixpanelType.GROUPS);
      await this.core.sendWhileOptedOut(
        token,
        MixpanelType.GROUPS,
        this._groupRecord(
          token,
          USER_ID_GROUP_KEY,
          userId,
          { $company_id: companyId },
          { $delete: "null" }
        )
      );
    }
    await this._optOutTracking(token);
  }

  async _optOutTracking(token) {
    await this._setOptedOutTrackingFlag(token, true);
    MixpanelLogger.log(token, "User has opted out of tracking");
    await this.mixpanelPersistent.reset(token);
  }

  async optInTracking(token) {
    await this._setOptedOutTrackingFlag(token, false);
    MixpanelLogger.log(token, "User has opted in to tracking");
    await this.track(token, "$opt_in");
  }

  async optInTrackingWithIdentity(token, identity, properties) {
    if (identity != null && typeof identity === "object") {
      const identityError = this._identityError(identity);
      if (identityError) {
        MixpanelLogger.error(token, `${identityError} The user is still opted out.`);
        return;
      }
    }
    await this._setOptedOutTrackingFlag(token, false);
    MixpanelLogger.log(token, "User has opted in to tracking");
    if (identity != null) {
      await this.identifyWithIdentity(token, identity);
    }
    await this.track(token, "$opt_in", properties);
  }

  async _setOptedOutTrackingFlag(token, optedOut) {
    this.mixpanelPersistent.updateOptedOut(token, optedOut);
    await this.mixpanelPersistent.persistOptedOut(token);
  }

  hasOptedOutTracking(token) {
    return this.mixpanelPersistent.getOptOut(token);
  }

  async identify(token, newDistinctId) {
    if (this.hierarchicalGroups) {
      MixpanelLogger.error(
        token,
        "identify(String) is not supported for hierarchical groups projects, which identify a " +
          "user by company and user id. Use identify({userId, companyId}). Nothing was identified."
      );
      return;
    }
    await this._identify(token, newDistinctId, null);
  }

  async identifyWithIdentity(token, identity) {
    if (this.mixpanelPersistent.getOptedOut(token)) {
      return;
    }
    if (identity == null || typeof identity !== "object") {
      MixpanelLogger.error(token, "Can't identify with a null identity.");
      return;
    }
    const identityError = this._identityError(identity);
    if (identityError) {
      MixpanelLogger.error(token, `${identityError} Nothing was identified.`);
      return;
    }
    const userId = identity.userId;
    const companyId = identity.companyId == null ? null : identity.companyId;
    const description = identityToString(identity);
    const deviceId = identity.deviceId == null ? null : identity.deviceId;
    const currentDeviceId = this.mixpanelPersistent.getDeviceId(token);
    if (deviceId != null && deviceId !== currentDeviceId) {
      MixpanelLogger.warn(
        token,
        `Ignoring deviceId ${deviceId} on ${description}. The SDK owns the device id ` +
          `(${currentDeviceId}) so earlier anonymous events follow the user.`
      );
    }
    await this._identify(token, userId, companyId);
  }

  // Why an identity can't be used on this project, or null when it can. Callers add what was dropped.
  _identityError(identity) {
    const userId = identity.userId == null ? null : identity.userId;
    const companyId = identity.companyId == null ? null : identity.companyId;
    const description = identityToString(identity);
    if (this.hierarchicalGroups) {
      if (!userId || !companyId) {
        return (
          `Can't identify ${description}: hierarchical groups projects identify a user by ` +
          "company and user id, so both are required."
        );
      }
    } else {
      if (!userId) {
        return `Can't identify ${description} without a user id.`;
      }
      if (companyId != null) {
        return (
          `Can't identify ${description}: a company requires hierarchicalGroups in init(). ` +
          "Mixpanel ignores $company_id on other projects."
        );
      }
    }
    return null;
  }

  async _identify(token, newDistinctId, companyId) {
    MixpanelLogger.log(token, `Identify '${newDistinctId}'`);
    const oldDistinctId = this.mixpanelPersistent.getDistinctId(token);
    const userChanged = oldDistinctId !== newDistinctId;
    // A user in another company is another user, so a new company is an identity change.
    const companyChanged =
      this.hierarchicalGroups &&
      companyId != null &&
      companyId !== this.mixpanelPersistent.getCompanyId(token);
    if (!userChanged && !companyChanged) {
      MixpanelLogger.log(
        token,
        `Distinct Id is already set to ${newDistinctId}, skipping identify.`
      );
      return;
    }
    if (this.hierarchicalGroups) {
      this.mixpanelPersistent.updateCompanyId(token, companyId);
    }
    this.mixpanelPersistent.updateDistinctId(token, newDistinctId);
    this.mixpanelPersistent.updateUserId(token, newDistinctId);
    const deviceId = this.mixpanelPersistent.getDeviceId(token);
    await this.mixpanelPersistent.persistIdentity(token);
    await this.core.identifyUserQueue(token);

    // A hierarchical groups project ties the device to the user from the identity keys on later
    // events, so it has no $identify
    if (!this.hierarchicalGroups) {
      await this.track(token, "$identify", {
        distinctId: newDistinctId,
        $user_id: newDistinctId,
        $anon_distinct_id: oldDistinctId,
        $device_id: deviceId,
      });
    }

    if (this._flagsJS) {
      this._flagsJS._invalidateInFlightFetch();
      this._flagsJS.loadFlags().catch(() => {
        MixpanelLogger.log(
          token,
          `Failed to load flags for distinct Id ${newDistinctId}.`
        );
      });
    }

  }

  async alias(token, alias, distinctId) {
    if (this.hierarchicalGroups) {
      MixpanelLogger.error(
        token,
        "alias is not supported for hierarchical groups projects, which identify a user by " +
          "company and user id. Use identify({userId, companyId}). The alias was dropped."
      );
      return;
    }
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
    const distinctId = this.mixpanelPersistent.getDistinctId(token);
    if (!this.hierarchicalGroups) {
      return distinctId;
    }
    const userId = this.mixpanelPersistent.getUserId(token);
    if (!userId) {
      // Anonymous, so already $device:{deviceId}
      return distinctId;
    }
    const companyId = this.mixpanelPersistent.getCompanyId(token);
    if (companyId) {
      return `$company:${companyId}|$user:${userId}`;
    }
    // Mixpanel ignores a user id without a company while the event carries a device id
    const deviceId = this.mixpanelPersistent.getDeviceId(token);
    return deviceId ? `$device:${deviceId}` : distinctId;
  }

  async getIdentity(token) {
    if (!this.mixpanelPersistent.getDeviceId(token)) {
      await this.mixpanelPersistent.loadIdentity(token);
    }
    return {
      userId: this.mixpanelPersistent.getUserId(token) || null,
      companyId: this.hierarchicalGroups
        ? this.mixpanelPersistent.getCompanyId(token)
        : null,
      deviceId: this.mixpanelPersistent.getDeviceId(token) || null,
    };
  }

  _companyIdentityProps(token) {
    if (!this.hierarchicalGroups) {
      return {};
    }
    const companyId = this.mixpanelPersistent.getCompanyId(token);
    return companyId ? { $company_id: companyId } : {};
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
    if (this.hierarchicalGroups) {
      await this._sendHierarchicalProfileData(token, action);
      return;
    }
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

  // A hierarchical groups user profile is a group profile keyed by $user_id, so it supports
  // only what /groups supports.
  async _sendHierarchicalProfileData(token, action) {
    const operation = Object.keys(action)[0];
    if (!HIERARCHICAL_GROUPS_OPERATIONS.includes(operation)) {
      MixpanelLogger.error(
        token,
        `${operation} is not supported for hierarchical groups projects, whose user profiles ` +
          "are group profiles keyed by $user_id. Supported operations are " +
          `[${HIERARCHICAL_GROUPS_OPERATIONS.join(", ")}], so increment, append, merge and ` +
          "trackCharge have no hierarchical groups equivalent. The update was dropped."
      );
      return;
    }
    const userId = this.mixpanelPersistent.getUserId(token);
    const companyId = this.mixpanelPersistent.getCompanyId(token);
    if (!userId || !companyId) {
      MixpanelLogger.error(
        token,
        "User profile updates for hierarchical groups projects need a user and a company. " +
          `Call identify({userId, companyId}) first. The ${operation} update was dropped.`
      );
      return;
    }
    await this.sendGroupDataToMixpanel({
      token,
      groupKey: USER_ID_GROUP_KEY,
      groupID: userId,
      action,
    });
  }

  async sendGroupDataToMixpanel({ token, groupKey, groupID, action }) {
    let companyProps = {};
    if (this.hierarchicalGroups) {
      // Hierarchical groups require $company_id at the top level of every /groups write. A
      // company profile's own id is its company, whatever the user is identified with now.
      const companyId =
        groupKey === COMPANY_ID_GROUP_KEY
          ? groupID
          : this.mixpanelPersistent.getCompanyId(token);
      if (!companyId) {
        MixpanelLogger.error(
          token,
          "Group profile updates for hierarchical groups projects require a company. Call " +
            `identify({userId, companyId}) first. The update to ${groupKey}=${groupID} was dropped.`
        );
        return;
      }
      companyProps = { $company_id: companyId };
    }
    await this.core.addToMixpanelQueue(
      token,
      MixpanelType.GROUPS,
      this._groupRecord(token, groupKey, groupID, companyProps, action)
    );
  }

  _groupRecord(token, groupKey, groupID, companyProps, action) {
    return {
      $token: token,
      $time: Date.now(),
      $group_key: groupKey,
      $group_id: groupID,
      ...companyProps,
      ...action,
    };
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
    // trackCharge has no hierarchical groups equivalent, so there are no charges to clear
    if (this.hierarchicalGroups) {
      MixpanelLogger.error(
        token,
        "clearCharges is not supported for hierarchical groups projects, which can't " +
          "trackCharge. The update was dropped."
      );
      return;
    }
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
    if (this.hierarchicalGroups) {
      await this._setHierarchicalGroup(token, groupKey, groupID);
      return;
    }
    const properties = { [groupKey]: [groupID] };
    await this.registerSuperProperties(token, properties);
    await this.set(token, properties);
  }

  async addGroup(token, groupKey, groupID) {
    MixpanelLogger.log(token, `Add group: `, groupKey, groupID);
    if (this.hierarchicalGroups) {
      this._logSingleGroupOnly(token, "addGroup", groupKey);
      return;
    }
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
    if (this.hierarchicalGroups) {
      await this._removeHierarchicalGroup(token, groupKey, groupID);
      return;
    }
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

  async _setHierarchicalGroup(token, groupKey, groupID) {
    if (groupKey == null || groupID == null) {
      MixpanelLogger.warn(token, "groupKey and groupID must be non-null");
      return;
    }
    // Hierarchical groups read a list as the name of one group, not as membership in each
    if (Array.isArray(groupID)) {
      this._logSingleGroupOnly(token, "setGroup with a list", groupKey);
      return;
    }
    const properties = { [groupKey]: groupID };
    await this.registerSuperProperties(token, properties);
    await this.set(token, properties);
  }

  _logSingleGroupOnly(token, operation, groupKey) {
    MixpanelLogger.error(
      token,
      `${operation} is not supported for hierarchical groups projects, which allow one ` +
        `${groupKey} per user. Use setGroup(groupKey, groupID). The update was dropped.`
    );
  }

  async _removeHierarchicalGroup(token, groupKey, groupID) {
    if (groupKey == null || groupID == null) {
      MixpanelLogger.warn(token, "groupKey and groupID must be non-null");
      return;
    }
    const superProperties =
      this.mixpanelPersistent.getSuperProperties(token) || {};
    let current = superProperties[groupKey];
    // A one-item list, stored by an earlier version or before hierarchical groups was
    // enabled, counts as that item.
    if (Array.isArray(current) && current.length === 1) {
      current = current[0];
    }
    if (current === undefined || current !== groupID) {
      return;
    }
    await this.unregisterSuperProperty(token, groupKey);
    await this.unset(token, groupKey);
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
