import { MixpanelPersistent } from "./mixpanel-persistent";

export const MixpanelQueueManager = (() => {
  let _queues = {};
  const mixpanelPersistent = MixpanelPersistent.getInstance();

  const initialize = async (token, type) => {
    if (!_queues[token] || !_queues[token][type]) {
      const queue = await mixpanelPersistent.loadQueue(token, type);
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
    await mixpanelPersistent.saveQueue(token, type, _queues[token][type]);
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
    if (!_queues[token] || !_queues[token][type]) {
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

  return {
    initialize,
    enqueue,
    getQueue,
    spliceQueue,
    clearQueue,
  };
})();
