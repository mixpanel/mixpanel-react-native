import { createAppContainer, createStackNavigator } from 'react-navigation';
import Home from './screens/Home';
import Welcome from './screens/Welcome';
import EventScreen from './screens/EventScreen';
import PeopleScreen from './screens/PeopleScreen';
import PushNotification from './screens/PushNotification';
import MultiInstance from './screens/MultiInstance';

const Router = createStackNavigator({
  Home:
    {
      screen: Home
    },
  Welcome:
    {
      screen: Welcome
    },
    EventScreen:
    {
      screen: EventScreen
    },
    PeopleScreen:
    {
      screen: PeopleScreen
    },
    PushNotification:
    {
      screen: PushNotification
    },
  MultiInstance:
    {
      screen: MultiInstance
    }
});
const AppContainer = createAppContainer(Router);

export default AppContainer;
