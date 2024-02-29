import AsyncStorage from "@react-native-async-storage/async-storage";
import {MixpanelLogger} from "mixpanel-react-native/javascript/mixpanel-logger";

export class IMixpanelStorage {
  async getItem(key) {
    throw new Error(`getItem method not implemented`);
  }

  async setItem(key, value) {
    throw new Error(`setItem method not implemented`);
  }

  async removeItem(key) {
    throw new Error(`removeItem method not implemented`);
  }
}

export class AsyncStorageAdapter extends IMixpanelStorage {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      MixpanelLogger.error("error getting item from AsyncStorage");
      return null;
    }
  }

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      MixpanelLogger.error("error setting item in AsyncStorage");
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      MixpanelLogger.error("error removing item in AsyncStorage");
    }
  }
}
