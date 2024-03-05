import {MixpanelLogger} from "mixpanel-react-native/javascript/mixpanel-logger";

export class AsyncStorageAdapter {
  constructor(storage) {
    if (!storage) {
      this.storage = require("@react-native-async-storage/async-storage");
    } else {
      this.storage = storage;
    }
  }

  async getItem(key) {
    try {
      return await this.storage.getItem(key);
    } catch {
      MixpanelLogger.error("error getting item from storage");
      return null;
    }
  }

  async setItem(key, value) {
    try {
      await this.storage.setItem(key, value);
    } catch {
      MixpanelLogger.error("error setting item in storage");
    }
  }

  async removeItem(key) {
    try {
      await this.storage.removeItem(key);
    } catch {
      MixpanelLogger.error("error removing item from storage");
    }
  }
}
