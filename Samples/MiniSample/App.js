import React, { Component } from 'react';
import { Button, SafeAreaView } from "react-native";
import { Mixpanel } from 'mixpanel-react-native';

const mixpanel = new Mixpanel("Your Project Token");
mixpanel.init();

// Function Component
const SampleApp = () => {
  return (
    <SafeAreaView>
      <Button
        title="Select Premium Plan"
        onPress={() => mixpanel.track("Plan Selected", {"Plan": "Premium"})}
      />
    </SafeAreaView>
  );
}

export default SampleApp;

// Class Component
// class SampleApp extends Component {
//   render() {
//     return (
//       <SafeAreaView>
//         <Button
//           title="Select Premium Plan"
//           onPress={() => mixpanel.track("Plan Selected", {"Plan": "Premium"})}
//         />
//       </SafeAreaView>
//     );    
//   }
// }

// export default SampleApp;