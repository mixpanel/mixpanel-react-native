import React from 'react';
import {Button, SafeAreaView} from 'react-native';
import {Mixpanel} from 'mixpanel-react-native';

const trackAutomaticEvents = true;
const mixpanel = new Mixpanel('Your Project Token', trackAutomaticEvents);
mixpanel.init();

// *************************************
// Example for Function Component
// *************************************

const SampleApp = () => {
  return (
    <SafeAreaView>
      <Button
        title="Select Premium Plan"
        onPress={() => mixpanel.track('Plan Selected', {Plan: 'Premium'})}
      />
    </SafeAreaView>
  );
};

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
