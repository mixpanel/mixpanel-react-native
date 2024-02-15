import AsyncStorage from '@react-native-async-storage/async-storage';

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
    return AsyncStorage.getItem(key);
  }

  async setItem(key, value) {
    return AsyncStorage.setItem(key, value);
  }

  async removeItem(key) {
    return AsyncStorage.removeItem(key);
  }
}
