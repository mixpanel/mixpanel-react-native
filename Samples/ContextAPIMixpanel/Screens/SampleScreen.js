import React from 'react';
import { Button, SafeAreaView } from "react-native";
import { useMixpanel } from '../Analytics';

export const SampleScreen = () => {
  const mixpanel = useMixpanel();
  return (
    <SafeAreaView>
      <Button
        title="Select Premium Plan"
        onPress={() => {
          mixpanel.track("Plan Selected", {"Plan": "Premium"});
        }}
      />
    </SafeAreaView>
  );
}
