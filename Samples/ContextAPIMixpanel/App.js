import React from 'react';
import { SafeAreaView } from "react-native";
import { MixpanelProvider }  from './Analytics';
import { SampleScreen } from './Screens/SampleScreen';


const App = () => {
  return (
    <SafeAreaView>
      <MixpanelProvider>
        <SampleScreen />
      </MixpanelProvider>
    </SafeAreaView>
  )
}

export default App;