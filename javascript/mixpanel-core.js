import {MixpanelQueueManager} from './mixpanel-queue';
import {MixpanelNetwork} from './mixpanel-network';
import {SessionMetadata} from './mixpanel-utils';
import {MixpanelType} from './mixpanel-constants';
import {MixpanelConfig} from './mixpanel-config';
import {MixpanelPersistent} from './mixpanel-persistent';
import {MixpanelLogger} from './mixpanel-logger';
import {Mixpanel} from 'mixpanel-react-native';

export const MixpanelCore = () => {
  const mixpanelPersistent = MixpanelPersistent.getInstance();
  const config = MixpanelConfig.getInstance();
  let isProcessingQueue = false;
  let processQueueInterval = null;

  const initialize = async token => {
    await MixpanelQueueManager.initialize(token, MixpanelType.EVENTS);
  };

  const startProcessingQueue = token => {
    if (mixpanelPersistent.getOptedOut(token)) {
      MixpanelLogger.log(
        token,
        `User has opted out of tracking, skipping processing queue.`,
      );
      return;
    }

    if (isProcessingQueue) {
      MixpanelLogger.log(
        token,
        `Queue is already being processed. Skipping new cycle.`,
      );
      return;
    }

    isProcessingQueue = true;

    processQueueInterval = setInterval(async () => {
      clearInterval(processQueueInterval);
      console.log('startProcessingQueue-------');
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
        `User has opted out of tracking, skipping tracking.`,
      );
      return;
    }
    if (!isValidAndSerializable(token, data)) {
      MixpanelLogger.error(
        token,
        `The Mixpanel payload is not valid or not serializable.`,
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
        },
      )}' Type: '${type}' `,
    );
  };

  const flush = async token => {
    if (mixpanelPersistent.getOptedOut(token)) {
      MixpanelLogger.log(
        token,
        `User has opted out of tracking, do not flush queue.`,
      );
      return;
    }
    await processQueue(token, MixpanelType.EVENTS);
    await processQueue(token, MixpanelType.USER);
    await processQueue(token, MixpanelType.GROUPS);
  };

  const processQueue = async (token, type) => {
    MixpanelLogger.log(token, `Processing queue for endpoint: ${type}`);
    const processBatch = async () => {
      const queue = MixpanelQueueManager.getQueue(token, type);
      if (queue.length > 0) {
        MixpanelLogger.log(token, `[Flushing queue] endpoint: ${type}`);
        MixpanelLogger.log(
          token,
          `[Flushing queue] queue: ${JSON.stringify(queue)}`,
        );
        const batchSize = config.getFlushBatchSize(token);
        const batch = queue.slice(0, batchSize);
        try {
          await MixpanelNetwork.sendRequest({
            token,
            data: batch,
            endpoint: type,
            serverURL: config.getServerURL(token),
            useIPAddressForGeoLocation:
              config.getUseIpAddressForGeolocation(token),
          });
          await MixpanelQueueManager.spliceQueue(token, type, 0, batch.length);
          // Process the next batch if there are more events in the queue
          const queue = MixpanelQueueManager.getQueue(token, type);
          if (queue.length > 0) {
            setTimeout(processBatch, 0);
          }
        } catch (error) {
          handleBatchError(token, error, type, processBatch);
        }
      }
    };

    processBatch();
  };

  const handleBatchError = (token, error, type, callback) => {
    if (error.code === 400) {
      MixpanelLogger.error(
        token,
        `Bad request received due to corrupted data within the batch. The corrupted data is now being removed from the queue...`,
      );
      // Remove the corrupted data from the queue, to avoid the data loss, only remove one event at a time
      MixpanelQueueManager.spliceQueue(token, type, 0, 1).then(() => {
        setTimeout(callback, 0);
      });
    } else {
      MixpanelLogger.error(
        token,
        `Error sending event batch from queue, error: ${error}`,
      );
    }
  };

  return {
    initialize,
    startProcessingQueue,
    addToMixpanelQueue,
    flush,
  };
};
