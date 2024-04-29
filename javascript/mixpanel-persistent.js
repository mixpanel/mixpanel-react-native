import {
  getDeviceIdKey,
  getDistinctIdKey,
  getSuperPropertiesKey,
  getTimeEventsKey,
  getOptedOutKey as getOutedOutKey,
  getQueueKey,
  getUserIdKey,
  getAppHasOpenedBeforeKey,
} from "./mixpanel-constants";

import {AsyncStorageAdapter} from "./mixpanel-storage";
import uuid from "uuid";
import {MixpanelLogger} from "mixpanel-react-native/javascript/mixpanel-logger";

export class MixpanelPersistent {
  static instance;

  static getInstance(storage) {
    if (!MixpanelPersistent.instance) {
      MixpanelPersistent.instance = new MixpanelPersistent(
        new AsyncStorageAdapter(storage)
      );
      MixpanelPersistent.initializationCompletePromise = MixpanelPersistent.instance.initializationCompletePromise();
    }
    return MixpanelPersistent.instance;
  }

  constructor(storageAdapter) {
    if (MixpanelPersistent.instance) {
      throw new Error(`Use MixpanelPersistent.getInstance()`);
    }

    this.storageAdapter = storageAdapter;
    this._superProperties = {};
    this._timeEvents = {};
    this._identity = {};
    this._optedOut = {};
    this._appHasOpenedBefore = {};
  }

  async initializationCompletePromise(token) {
    Promise.all([
      this.loadIdentity(token),
      this.loadSuperProperties(token),
      this.loadTimeEvents(token),
      this.loadOptOut(token),
      this.loadAppHasOpenedBefore(token),
    ]);
  }

  async loadDeviceId(token) {
    await this.storageAdapter
      .getItem(getDeviceIdKey(token))
      .then((deviceId) => {
        if (!this._identity[token]) {
          this._identity[token] = {};
        }
        this._identity[token].deviceId = deviceId;
      });
    if (!this._identity[token].deviceId) {
      this._identity[token].deviceId = uuid.v4();
      await this.storageAdapter.setItem(
        getDeviceIdKey(token),
        this._identity[token].deviceId
      );
    }
    MixpanelLogger.log(token, "deviceId:", this._identity[token].deviceId);
  }

  async loadDistinctId(token) {
    await this.storageAdapter
      .getItem(getDistinctIdKey(token))
      .then((distinctId) => {
        if (!this._identity[token]) {
          this._identity[token] = {};
        }
        this._identity[token].distinctId = distinctId;
      });
    if (!this._identity[token].distinctId) {
      this._identity[token].distinctId =
        "$device:" + this._identity[token].deviceId;
      await this.storageAdapter.setItem(
        getDistinctIdKey(token),
        this._identity[token].distinctId
      );
    }
    MixpanelLogger.log(token, "distinctId:", this._identity[token].distinctId);
  }

  async loadUserId(token) {
    await this.storageAdapter.getItem(getUserIdKey(token)).then((userId) => {
      if (!this._identity[token]) {
        this._identity[token] = {};
      }
      this._identity[token].userId = userId;
    });
    MixpanelLogger.log(token, "userId:", this._identity[token].userId);
  }

  async loadIdentity(token) {
    await this.loadDeviceId(token);
    await this.loadDistinctId(token);
    await this.loadUserId(token);
  }

  async persistIdentity(token) {
    await this.persistDeviceId(token);
    await this.persistDistinctId(token);
    await this.persistUserId(token);
  }

  getDeviceId(token) {
    if (!this._identity[token]) {
      return null;
    }
    return this._identity[token].deviceId;
  }

  updateDeviceId(token, deviceId) {
    this._identity[token].deviceId = deviceId;
  }

  async persistDeviceId(token) {
    if (!this._identity[token] || this._identity[token].deviceId === null) {
      return;
    }
    await this.storageAdapter.setItem(
      getDeviceIdKey(token),
      this._identity[token].deviceId
    );
  }

  getDistinctId(token) {
    if (!this._identity[token]) {
      return null;
    }
    return this._identity[token].distinctId;
  }

  updateDistinctId(token, distinctId) {
    this._identity[token].distinctId = distinctId;
  }

  async persistDistinctId(token) {
    if (!this._identity[token] || this._identity[token].distinctId === null) {
      return;
    }
    await this.storageAdapter.setItem(
      getDistinctIdKey(token),
      this._identity[token].distinctId
    );
  }

  getUserId(token) {
    if (!this._identity[token]) {
      return null;
    }
    return this._identity[token].userId;
  }

  updateUserId(token, userId) {
    this._identity[token].userId = userId;
  }

  async persistUserId(token) {
    if (!this._identity[token] || this._identity[token].userId === null) {
      return;
    }
    await this.storageAdapter.setItem(
      getUserIdKey(token),
      this._identity[token].userId
    );
  }

  async loadSuperProperties(token) {
    const superPropertiesString = await this.storageAdapter.getItem(
      getSuperPropertiesKey(token)
    );
    this._superProperties[token] = superPropertiesString
      ? JSON.parse(superPropertiesString)
      : {};
  }

  getSuperProperties(token) {
    return this._superProperties[token];
  }

  updateSuperProperties(token, superProperties) {
    this._superProperties = {
      ...this._superProperties,
      [token]: {...superProperties},
    };
  }

  async persistSuperProperties(token) {
    if (this._superProperties[token] === null) {
      return;
    }
    await this.storageAdapter.setItem(
      getSuperPropertiesKey(token),
      JSON.stringify(this._superProperties[token])
    );
  }

  async loadTimeEvents(token) {
    const timeEventsString = await this.storageAdapter.getItem(
      getTimeEventsKey(token)
    );
    this._timeEvents[token] = timeEventsString
      ? JSON.parse(timeEventsString)
      : {};
  }

  getTimeEvents(token) {
    return this._timeEvents[token];
  }

  updateTimeEvents(token, timeEvents) {
    this._timeEvents = {...this._timeEvents, [token]: {...timeEvents}};
  }

  async persistTimeEvents(token) {
    if (this._timeEvents[token] === null) {
      return;
    }
    await this.storageAdapter.setItem(
      getTimeEventsKey(token),
      JSON.stringify(this._timeEvents[token])
    );
  }

  async loadOptOut(token) {
    const optOutString = await this.storageAdapter.getItem(
      getOutedOutKey(token)
    );
    this._optedOut[token] = optOutString === "true";
  }

  getOptedOut(token) {
    return this._optedOut[token] === true;
  }

  updateOptedOut(token, optOut) {
    this._optedOut = {...this._optedOut, [token]: optOut};
  }

  async persistOptedOut(token) {
    if (this._optedOut[token] === null) {
      return;
    }
    await this.storageAdapter.setItem(
      getOutedOutKey(token),
      this._optedOut[token].toString()
    );
  }

  async loadQueue(token, type) {
    const queueString = await this.storageAdapter.getItem(
      getQueueKey(token, type)
    );
    return queueString ? JSON.parse(queueString) : [];
  }

  async saveQueue(token, type, queue) {
    await this.storageAdapter.setItem(
      getQueueKey(token, type),
      JSON.stringify(queue)
    );
  }

  async loadAppHasOpenedBefore(token) {
    const appHasOpenedBeforeString = await this.storageAdapter.getItem(
      getAppHasOpenedBeforeKey(token)
    );
    this._appHasOpenedBefore[token] = appHasOpenedBeforeString === "true";
  }

  getAppHasOpenedBefore(token) {
    return this._appHasOpenedBefore[token] === true;
  }

  updateAppHasOpenedBefore(token, appHasOpenedBefore) {
    this._appHasOpenedBefore = {
      ...this._appHasOpenedBefore,
      [token]: appHasOpenedBefore,
    };
  }

  async persistAppHasOpenedBefore(token) {
    if (this._appHasOpenedBefore[token] === null) {
      return;
    }
    await this.storageAdapter.setItem(
      getAppHasOpenedBeforeKey(token),
      this._appHasOpenedBefore[token].toString()
    );
  }

  async reset(token) {
    await this.storageAdapter.removeItem(getDeviceIdKey(token));
    await this.storageAdapter.removeItem(getDistinctIdKey(token));
    await this.storageAdapter.removeItem(getUserIdKey(token));
    await this.storageAdapter.removeItem(getSuperPropertiesKey(token));
    await this.storageAdapter.removeItem(getTimeEventsKey(token));
    await this.loadIdentity(token);
    await this.loadSuperProperties(token);
    await this.loadTimeEvents(token);
  }
}
