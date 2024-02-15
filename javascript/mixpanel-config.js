import {
  defaultBatchSize,
  defaultFlushInterval,
  defaultServerURL,
} from './mixpanel-constants';

import {MixpanelLogger} from './mixpanel-logger';

export class MixpanelConfig {
  static instance;

  static getInstance() {
    if (!MixpanelConfig.instance) {
      MixpanelConfig.instance = new MixpanelConfig();
    }
    return MixpanelConfig.instance;
  }

  constructor() {
    if (MixpanelConfig.instance) {
      throw new Error(`Use MixpanelConfig.getInstance()`);
    }
    this._config = {};
  }

  setLoggingEnabled(token, loggingEnabled) {
    this._config[token] = {
      ...this._config[token],
      loggingEnabled,
    };
    if (loggingEnabled) {
      console.info(`Mixpanel Logging Enabled`);
    } else {
      console.info(`Mixpanel Logging Disabled`);
    }
  }

  getLoggingEnabled(token) {
    return (this._config[token] && this._config[token].loggingEnabled) || false;
  }

  setServerURL(token, serverURL) {
    this._config[token] = {
      ...this._config[token],
      serverURL,
    };
    MixpanelLogger.log(token, `Set serverURL: ${serverURL}`);
  }

  getServerURL(token) {
    return (
      (this._config[token] && this._config[token].serverURL) || defaultServerURL
    );
  }

  setUseIpAddressForGeolocation(token, useIpAddressForGeolocation) {
    this._config[token] = {
      ...this._config[token],
      useIpAddressForGeolocation,
    };
    MixpanelLogger.log(
      token,
      `Set useIpAddressForGeolocation: ${useIpAddressForGeolocation}`,
    );
  }

  getUseIpAddressForGeolocation(token) {
    return (
      (this._config[token] && this._config[token].useIpAddressForGeolocation) ||
      true
    );
  }

  setFlushBatchSize(token, batchSize) {
    this._config[token] = {
      ...this._config[token],
      batchSize,
    };
    MixpanelLogger.log(token, `Set flush batch size: ${batchSize}`);
  }

  getFlushBatchSize(token) {
    return (
      (this._config[token] && this._config[token].batchSize) || defaultBatchSize
    );
  }

  setFlushInterval(token, flushInterval) {
    this._config[token] = {
      ...this._config[token],
      flushInterval,
    };
    MixpanelLogger.log(token, `Set flush interval: ${flushInterval}`);
  }

  getFlushInterval(token) {
    return (
      (this._config[token] && this._config[token].flushInterval) ||
      defaultFlushInterval
    );
  }
}
