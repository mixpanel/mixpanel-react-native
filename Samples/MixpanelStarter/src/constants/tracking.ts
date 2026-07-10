// Event Names
export const Events = {
  // Screen Views
  SCREEN_VIEWED: 'Screen Viewed',

  // User Actions
  USER_SIGNED_UP: 'User Signed Up',
  USER_LOGGED_IN: 'User Logged In',
  USER_LOGGED_OUT: 'User Logged Out',
  GUEST_CONTINUED: 'Guest Continued',

  // Content Interactions
  PRODUCT_VIEWED: 'Product Viewed',
  VIDEO_STARTED: 'Video Started',
  VIDEO_COMPLETED: 'Video Completed',

  // Settings
  DARK_MODE_TOGGLED: 'Dark Mode Toggled',
  NOTIFICATIONS_TOGGLED: 'Notifications Toggled',
  TRACKING_OPTED_IN: 'Tracking Opted In',
  TRACKING_OPTED_OUT: 'Tracking Opted Out',
  DATA_RESET: 'Data Reset',
  EVENTS_FLUSHED: 'Events Flushed',

  // Feature Flags
  FLAGS_LOADED: 'Feature Flags Loaded',
  FLAG_CHECKED: 'Feature Flag Checked',
  FLAG_CONTEXT_UPDATED: 'Feature Flag Context Updated',
  FLAG_TEST_SYNC: 'Flag Test Sync',
  FLAG_TEST_ASYNC: 'Flag Test Async',
  FLAG_TEST_CALLBACK: 'Flag Test Callback',
  FLAG_TEST_EDGE_CASE: 'Flag Test Edge Case',
  FLAG_TEST_COERCION: 'Flag Test Type Coercion',
} as const;

// Property Names
export const Properties = {
  // Screen properties
  SCREEN_NAME: 'screen_name',

  // User properties
  USER_ID: 'user_id',
  USER_EMAIL: 'user_email',
  SIGNUP_DATE: 'signup_date',

  // Content properties
  PRODUCT_ID: 'product_id',
  PRODUCT_NAME: 'product_name',
  PRODUCT_CATEGORY: 'product_category',
  VIDEO_TITLE: 'video_title',
  VIDEO_DURATION: 'video_duration',

  // Settings properties
  DARK_MODE_ENABLED: 'dark_mode_enabled',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',

  // Feature Flag properties
  FLAG_KEY: 'flag_key',
  FLAG_ENABLED: 'flag_enabled',
  FLAG_VALUE: 'flag_value',
  FLAG_METHOD: 'flag_method',
  FLAG_EXECUTION_TIME: 'flag_execution_time',
  FLAG_USED_FALLBACK: 'flag_used_fallback',
  FLAG_RESULT_TYPE: 'flag_result_type',

  // Metadata
  TIMESTAMP: 'timestamp',
  APP_VERSION: 'app_version',
  PLATFORM: 'platform',
} as const;

// Super Property Keys
export const SuperProperties = {
  APP_VERSION: 'App Version',
  PLATFORM: 'Platform',
  ENVIRONMENT: 'Environment',
} as const;
