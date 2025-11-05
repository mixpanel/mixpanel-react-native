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
