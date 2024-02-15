export const MixpanelType = {
  EVENTS: '/track/',
  USER: '/engage/',
  GROUPS: '/groups/',
};

export const getQueueKey = (token, type) => `MIXPANEL_${token}_${type}_QUEUE`;

export const getDeviceIdKey = token => `MIXPANEL_${token}_DEVICE_ID`;
export const getDistinctIdKey = token => `MIXPANEL_${token}_DISTINCT_ID`;
export const getUserIdKey = token => `MIXPANEL_${token}_USER_ID`;

export const getOptedOutKey = token => `MIXPANEL_${token}_OPT_OUT`;
export const getSuperPropertiesKey = token =>
  `MIXPANEL_${token}_SUPER_PROPERTIES`;
export const getTimeEventsKey = token => `MIXPANEL_${token}_TIME_EVENTS`;

export const defaultServerURL = `https://api.mixpanel.com`;
export const defaultBatchSize = 50;
export const defaultFlushInterval = 60 * 1000; // 60s
