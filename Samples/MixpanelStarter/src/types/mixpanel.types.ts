import {Mixpanel} from 'mixpanel-react-native';

export interface MixpanelContextValue {
  mixpanel: Mixpanel | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;

  // Convenience methods
  track: (eventName: string, properties?: Record<string, any>) => void;
  identify: (distinctId: string) => void;
  alias: (alias: string, distinctId?: string) => Promise<void>;
  reset: () => void;
  flush: () => Promise<void>;
}

export interface UserProfile {
  $email?: string;
  $name?: string;
  signup_date?: string;
  [key: string]: any;
}

export interface EventProperties {
  [key: string]: any;
}
