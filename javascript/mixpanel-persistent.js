import {
  getDeviceIdKey,
  getDistinctIdKey,
  getSuperPropertiesKey,
  getTimeEventsKey,
  getOptedOutKey as getOutedOutKey,
  getQueueKey,
  getUserIdKey,
} from './mixpanel-constants';

import {IMixpanelStorage, AsyncStorageAdapter} from './mixpanel-storage';
import uuid from 'uuid';
import {MixpanelLogger} from 'mixpanel-react-native/javascript/mixpanel-logger';

export class MixpanelPersistent {
  static instance;

  static getInstance(storage = new AsyncStorageAdapter()) {
    if (!MixpanelPersistent.instance) {
      MixpanelPersistent.instance = new MixpanelPersistent(storage);
      MixpanelPersistent.initializationCompletePromise =
        MixpanelPersistent.instance.initializationCompletePromise();
    }
    return MixpanelPersistent.instance;
  }

  constructor(storage) {
    if (!(storage instanceof IMixpanelStorage)) {
      throw new Error(`Storage must implement IStorage interface`);
    }

    if (MixpanelPersistent.instance) {
      throw new Error(`Use MixpanelPersistent.getInstance()`);
    }

    this.storage = storage;
    this._superProperties = {};
    this._timeEvents = {};
    this._identity = {};
    this._optedOut = {};
  }

  async initializationCompletePromise(token) {
    Promise.all([
      this.loadIdentity(token),
      this.loadSuperProperties(token),
      this.loadTimeEvents(token),
      this.loadOptOut(token),
    ]);
  }

  async loadDeviceId(token) {
    await this.storage.getItem(getDeviceIdKey(token)).then(deviceId => {
      if (!this._identity[token]) {
        this._identity[token] = {};
      }
      this._identity[token].deviceId = deviceId;
    });
    if (!this._identity[token].deviceId) {
      this._identity[token].deviceId = uuid.v4();
      await this.storage.setItem(
        getDeviceIdKey(token),
        this._identity[token].deviceId,
      );
    }
    MixpanelLogger.log(token, 'deviceId:', this._identity[token].deviceId);
  }

  async loadDistinctId(token) {
    await this.storage.getItem(getDistinctIdKey(token)).then(distinctId => {
      if (!this._identity[token]) {
        this._identity[token] = {};
      }
      this._identity[token].distinctId = distinctId;
    });
    if (!this._identity[token].distinctId) {
      this._identity[token].distinctId =
        '$device:' + this._identity[token].deviceId;
      await this.storage.setItem(
        getDistinctIdKey(token),
        this._identity[token].distinctId,
      );
    }
    MixpanelLogger.log(token, 'distinctId:', this._identity[token].distinctId);
  }

  async loadUserId(token) {
    await this.storage.getItem(getUserIdKey(token)).then(userId => {
      if (!this._identity[token]) {
        this._identity[token] = {};
      }
      this._identity[token].userId = userId;
    });
    MixpanelLogger.log(token, 'userId:', this._identity[token].userId);
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
    await this.storage.setItem(
      getDeviceIdKey(token),
      this._identity[token].deviceId,
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
    await this.storage.setItem(
      getDistinctIdKey(token),
      this._identity[token].distinctId,
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
    await this.storage.setItem(
      getUserIdKey(token),
      this._identity[token].userId,
    );
  }

  async loadSuperProperties(token) {
    const superPropertiesString = await this.storage.getItem(
      getSuperPropertiesKey(token),
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
    await this.storage.setItem(
      getSuperPropertiesKey(token),
      JSON.stringify(this._superProperties[token]),
    );
  }

  async loadTimeEvents(token) {
    const timeEventsString = await this.storage.getItem(
      getTimeEventsKey(token),
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
    await this.storage.setItem(
      getTimeEventsKey(token),
      JSON.stringify(this._timeEvents[token]),
    );
  }

  async loadOptOut(token) {
    const optOutString = await this.storage.getItem(getOutedOutKey(token));
    this._optedOut[token] = optOutString === 'true';
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
    await this.storage.setItem(
      getOutedOutKey(token),
      this._optedOut[token].toString(),
    );
  }

  async loadQueue(token, type) {
    const queueString = await this.storage.getItem(getQueueKey(token, type));
    return queueString ? JSON.parse(queueString) : [];
  }

  async saveQueue(token, type, queue) {
    await this.storage.setItem(getQueueKey(token, type), JSON.stringify(queue));
  }

  async reset(token) {
    await this.storage.removeItem(getDeviceIdKey(token));
    await this.storage.removeItem(getDistinctIdKey(token));
    await this.storage.removeItem(getUserIdKey(token));
    await this.loadIdentity(token);
  }
}
