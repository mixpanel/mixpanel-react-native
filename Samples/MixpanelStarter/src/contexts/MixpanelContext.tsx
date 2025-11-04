import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {Mixpanel} from 'mixpanel-react-native';
import {Platform} from 'react-native';
import {MixpanelContextValue} from '../types/mixpanel.types';
import {SuperProperties} from '../constants/tracking';

const MixpanelContext = createContext<MixpanelContextValue | undefined>(
  undefined,
);

interface MixpanelProviderProps {
  children: ReactNode;
  token: string;
  trackAutomaticEvents?: boolean;
  useNative?: boolean;
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({
  children,
  token,
  trackAutomaticEvents = true,
  useNative = true,
}) => {
  const [mixpanel, setMixpanel] = useState<Mixpanel | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initMixpanel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create Mixpanel instance
        const instance = useNative
          ? new Mixpanel(token, trackAutomaticEvents, true)
          : new Mixpanel(token, trackAutomaticEvents, false);

        // Initialize
        await instance.init();

        // Set up default super properties
        instance.registerSuperProperties({
          [SuperProperties.APP_VERSION]: '1.0.0',
          [SuperProperties.PLATFORM]: Platform.OS,
          [SuperProperties.ENVIRONMENT]: __DEV__ ? 'development' : 'production',
        });
        // Enable logging for debugging
        instance.setLoggingEnabled(true);
        
        setMixpanel(instance);
        setIsInitialized(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Failed to initialize Mixpanel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initMixpanel();
  }, [token, trackAutomaticEvents, useNative]);

  // Convenience wrapper methods
  const track = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      if (!mixpanel || !isInitialized) {
        console.warn(
          'Mixpanel not initialized yet. Event not tracked:',
          eventName,
        );
        return;
      }
      mixpanel.track(eventName, properties);
    },
    [mixpanel, isInitialized],
  );

  const identify = useCallback(
    (distinctId: string) => {
      if (!mixpanel || !isInitialized) {
        console.warn('Mixpanel not initialized yet. Identify skipped.');
        return;
      }
      mixpanel.identify(distinctId);
    },
    [mixpanel, isInitialized],
  );

  const alias = useCallback(
    async (aliasValue: string, distinctId?: string) => {
      if (!mixpanel || !isInitialized) {
        console.warn('Mixpanel not initialized yet. Alias skipped.');
        return;
      }
      const currentId = distinctId || (await mixpanel.getDistinctId());
      mixpanel.alias(aliasValue, currentId);
    },
    [mixpanel, isInitialized],
  );

  const reset = useCallback(() => {
    if (!mixpanel || !isInitialized) {
      console.warn('Mixpanel not initialized yet. Reset skipped.');
      return;
    }
    mixpanel.reset();
  }, [mixpanel, isInitialized]);

  const flush = useCallback(async () => {
    if (!mixpanel || !isInitialized) {
      console.warn('Mixpanel not initialized yet. Flush skipped.');
      return;
    }
    await mixpanel.flush();
  }, [mixpanel, isInitialized]);

  const value: MixpanelContextValue = {
    mixpanel,
    isInitialized,
    isLoading,
    error,
    track,
    identify,
    alias,
    reset,
    flush,
  };

  return (
    <MixpanelContext.Provider value={value}>
      {children}
    </MixpanelContext.Provider>
  );
};

/**
 * Hook to access Mixpanel instance and convenience methods
 * @throws Error if used outside of MixpanelProvider
 */
export const useMixpanel = (): MixpanelContextValue => {
  const context = useContext(MixpanelContext);
  if (context === undefined) {
    throw new Error('useMixpanel must be used within a MixpanelProvider');
  }
  return context;
};
