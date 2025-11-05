import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {Text} from 'react-native';
import {MixpanelProvider, useMixpanel} from '../src/contexts/MixpanelContext';

// Mock the Mixpanel SDK
jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    registerSuperProperties: jest.fn(),
    setLoggingEnabled: jest.fn(),
    track: jest.fn(),
    identify: jest.fn(),
    alias: jest.fn(),
    reset: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Test component that uses the hook
const TestComponent = () => {
  const {isInitialized, isLoading, error} = useMixpanel();

  return (
    <>
      <Text testID="initialized">{isInitialized ? 'true' : 'false'}</Text>
      <Text testID="loading">{isLoading ? 'true' : 'false'}</Text>
      <Text testID="error">{error ? error.message : 'none'}</Text>
    </>
  );
};

describe('MixpanelContext', () => {
  it('should provide Mixpanel context to children', async () => {
    const {getByTestId} = render(
      <MixpanelProvider token="test-token">
        <TestComponent />
      </MixpanelProvider>,
    );

    // Initially loading
    expect(getByTestId('loading').props.children).toBe('true');
    expect(getByTestId('initialized').props.children).toBe('false');

    // Wait for initialization
    await waitFor(() => {
      expect(getByTestId('initialized').props.children).toBe('true');
      expect(getByTestId('loading').props.children).toBe('false');
      expect(getByTestId('error').props.children).toBe('none');
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useMixpanel must be used within a MixpanelProvider');

    consoleError.mockRestore();
  });
});
