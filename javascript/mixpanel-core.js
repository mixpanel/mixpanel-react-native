import { MixpanelQueueManager } from "./mixpanel-queue";
import { MixpanelNetwork } from "./mixpanel-network";
import { SessionMetadata } from "./mixpanel-utils";
import { MixpanelType } from "./mixpanel-constants";
import { MixpanelConfig } from "./mixpanel-config";
import { MixpanelPersistent } from "./mixpanel-persistent";
import { MixpanelLogger } from "./mixpanel-logger";

// One flush per token and endpoint at a time; the queue is shared by every
// instance for a token. A flush whose current batch has been pending longer
// than sendRequest's full retry window (~62s of backoff) is treated as stuck,
// so a request that never settles can't block flushing for the session.
const FLUSH_LOCK_STALE_MS = 2 * 60 * 1000;
const flushLocks = new Map();

export const MixpanelCore = (storage) => {
  const mixpanelPersistent = MixpanelPersistent.getInstance(storage);
  const config = MixpanelConfig.getInstance();
  let isProcessingQueue = false;
  let processQueueInterval = null;

  const initialize = async (token) => {
    await MixpanelQueueManager.initialize(token, MixpanelType.EVENTS);
  };

  const startProcessingQueue = (token) => {
    if (mixpanelPersistent.getOptedOut(token)) {
      MixpanelLogger.log(
        token,
        `User has opted out of tracking, skipping processing queue.`
      );
      return;
    }

    if (isProcessingQueue) {
      MixpanelLogger.log(
        token,
        `Queue is already being processed. Skipping new cycle.`
      );
      return;
    }

    isProcessingQueue = true;

    processQueueInterval = setInterval(async () => {
      clearInterval(processQueueInterval);
      await processQueue(token, MixpanelType.EVENTS);
      await processQueue(token, MixpanelType.USER);
      await processQueue(token, MixpanelType.GROUPS);

      isProcessingQueue = false;
      startProcessingQueue(token);
    }, config.getFlushInterval(token));
  };

  const isValidAndSerializable = (token, obj, depth = 1) => {
    try {
      JSON.stringify(obj);
    } catch (error) {
      MixpanelLogger.error(token, `Error in Mixpanel payload: ${error}`);
      return false;
    }
    return true;
  };

  const addToMixpanelQueue = async (token, type, data) => {
    if (mixpanelPersistent.getOptedOut(token)) {
      MixpanelLogger.log(
        token,
        `User has opted out of tracking, skipping tracking.`
      );
      return;
    }
    if (!isValidAndSerializable(token, data)) {
      MixpanelLogger.error(
        token,
        `The Mixpanel payload is not valid or not serializable.`
      );
      return;
    }
    const sessionMetadata = new SessionMetadata();
    await MixpanelQueueManager.enqueue(token, type, {
      ...sessionMetadata.toDict(type),
      ...data,
    });
    MixpanelLogger.log(
      token,
      `The mixpanel payload is added to the Mixpanel queue. Payload: '${JSON.stringify(
        {
          ...sessionMetadata.toDict(type),
          ...data,
        }
      )}' Type: '${type}' `
    );
  };

  const flush = async (token) => {
    if (mixpanelPersistent.getOptedOut(token)) {
      MixpanelLogger.log(
        token,
        `User has opted out of tracking, do not flush queue.`
      );
      return;
    }
    await processQueue(token, MixpanelType.EVENTS);
    await processQueue(token, MixpanelType.USER);
    await processQueue(token, MixpanelType.GROUPS);
  };

  const processQueue = async (token, type) => {
    const flushKey = `${token}|${type}`;
    const current = flushLocks.get(flushKey);
    if (current && Date.now() - current.batchStartedAt < FLUSH_LOCK_STALE_MS) {
      MixpanelLogger.log(token, `Flush already in progress for endpoint: ${type}`);
      return;
    }
    if (current) {
      MixpanelLogger.warn(
        token,
        `Previous flush for endpoint ${type} appears stuck, starting a new one.`
      );
    }
    const lock = { batchStartedAt: Date.now() };
    flushLocks.set(flushKey, lock);

    MixpanelLogger.log(token, `Processing queue for endpoint: ${type}`);
    drainQueue(token, type, flushKey, lock);
  };

  const drainQueue = async (token, type, flushKey, lock) => {
    // A newer flush may take over a stuck lock; this loop then stops without
    // touching the queue, so it can't remove events the new flush hasn't sent.
    const ownsLock = () => flushLocks.get(flushKey) === lock;
    try {
      while (ownsLock()) {
        const queue = MixpanelQueueManager.getQueue(token, type);
        if (queue.length === 0) {
          return;
        }
        lock.batchStartedAt = Date.now();
        MixpanelLogger.log(token, `[Flushing queue] endpoint: ${type}`);
        MixpanelLogger.log(
          token,
          `[Flushing queue] queue: ${JSON.stringify(queue)}`
        );
        const batchSize = config.getFlushBatchSize(token);
        const batch = queue.slice(0, batchSize);
        let removeCount = batch.length;
        try {
          await MixpanelNetwork.sendRequest({
            token,
            data: batch,
            endpoint: type,
            serverURL: config.getServerURL(token),
            useIPAddressForGeoLocation:
              config.getUseIpAddressForGeolocation(token),
          });
        } catch (error) {
          if (error.code !== 400) {
            MixpanelLogger.error(
              token,
              `Error sending event batch from queue, error: ${error}`
            );
            return;
          }
          MixpanelLogger.error(
            token,
            `Bad request received due to corrupted data within the batch. The corrupted data is now being removed from the queue...`
          );
          // Remove the corrupted data from the queue, to avoid the data loss, only remove one event at a time
          removeCount = 1;
        }
        if (!ownsLock()) {
          return;
        }
        await MixpanelQueueManager.spliceQueue(token, type, 0, removeCount);
        // Yield before the next batch
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    } catch (error) {
      MixpanelLogger.error(token, `Error flushing queue, error: ${error}`);
    } finally {
      if (ownsLock()) {
        flushLocks.delete(flushKey);
      }
    }
  };

  const identifyUserQueue = async (token) => {
    await MixpanelQueueManager.identifyUserQueue(token);
  };

  return {
    initialize,
    startProcessingQueue,
    addToMixpanelQueue,
    flush,
    identifyUserQueue,
  };
};
