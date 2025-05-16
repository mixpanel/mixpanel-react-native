import { MixpanelLogger } from "./mixpanel-logger";
import { MixpanelPersistent } from "./mixpanel-persistent";
import { MixpanelType } from "./mixpanel-constants";

export const MixpanelQueueManager = (() => {
  let _queues = {};
  let mixpanelPersistent;

  const getPersistent = () => {
    if (!mixpanelPersistent) {
      mixpanelPersistent = MixpanelPersistent.getInstance();
    }
    return mixpanelPersistent;
  };

  const initialize = async (token, type) => {
    if (!_queues[token] || !_queues[token][type]) {
      const queue = await getPersistent().loadQueue(token, type);
      _queues[token] = {
        ..._queues[token],
        [type]: queue,
      };
    }
  };

  const updateQueueInStorage = async (token, type) => {
    if (!_queues[token] || !_queues[token][type]) {
      return;
    }
    await getPersistent().saveQueue(token, type, _queues[token][type]);
  };

  const enqueue = async (token, type, data) => {
    if (!_queues[token] || !_queues[token][type]) {
      _queues[token] = {
        ..._queues[token],
        [type]: [],
      };
    }
    _queues[token][type].push(data);
    await updateQueueInStorage(token, type);
  };

  const getQueue = (token, type) => {
    if (
      !_queues[token] ||
      !_queues[token][type] ||
      (type === MixpanelType.USER && !getPersistent().isIdentified(token))
    ) {
      return [];
    }

    return [..._queues[token][type]];
  };

  const spliceQueue = async (token, type, start, deleteCount) => {
    if (!_queues[token] || !_queues[token][type]) {
      return;
    }
    _queues[token][type].splice(start, deleteCount);
    await updateQueueInStorage(token, type);
  };

  const clearQueue = async (token, type) => {
    if (!_queues[token] || !_queues[token][type]) {
      return;
    }
    _queues[token][type] = [];
    await updateQueueInStorage(token, type);
  };

  /**
   * Ensures all USER queue records for the given token have the correct identity fields.
   * Returns the updated queue (may be unchanged).
   */
  const identifyUserQueue = async (token) => {
    const persistent = getPersistent();
    const distinctId = persistent.getDistinctId(token);
    const deviceId = persistent.getDeviceId(token);
    const userId = persistent.getUserId(token);

    const userQueue = _queues[token]?.[MixpanelType.USER];
    if (!userQueue) return [];

    let changed = false;
    const updatedQueue = userQueue.map(record => {
      let updated = record;
      const updateDistinctId = distinctId != null && record.$distinct_id !== distinctId;
      const updateDeviceId = deviceId != null && record.$device_id !== deviceId;
      const updateUserId = userId != null && record.$user_id !== userId;
      // Only update if there is a difference; minimize object copies
      if (updateDistinctId || updateDeviceId || updateUserId) {
        updated = { ...record }; // shallow copy only if needed
        if (updateDistinctId) updated.$distinct_id = distinctId;
        if (updateDeviceId) updated.$device_id = deviceId;
        if (updateUserId) updated.$user_id = userId;
        changed = true;
      }
      return updated;
    });

    if (changed) {
      _queues[token][MixpanelType.USER] = updatedQueue;
      await persistent.saveQueue(token, MixpanelType.USER, updatedQueue);
    }
    return updatedQueue;
  };

  return {
    initialize,
    enqueue,
    getQueue,
    spliceQueue,
    clearQueue,
    identifyUserQueue,
  };
})();
