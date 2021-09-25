import React, { Component } from 'react';
import { Button, SafeAreaView } from "react-native";
import { Mixpanel } from 'mixpanel-react-native';

const mixpanel = new Mixpanel("5d9d3df08d1c34a272abf23d892820bf");
mixpanel.init();

// *************************************
// Example for Function Component
// *************************************

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

// *************************************
// Example for Class Component
// *************************************

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