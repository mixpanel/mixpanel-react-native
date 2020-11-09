import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import Home from './screens/Home';
import Event from './screens/EventScreen';
import People from './screens/PeopleScreen';
import GDPR from './screens/GDPRScreen'


const Router = createStackNavigator({
    MixpanelDemo:
    {
        screen: Home,
    },
    Event:
    {
        screen: Event
    },
    People:
    {
        screen: People
    },
    GDPR:
    {
        screen: GDPR
    }
});
const AppContainer = createAppContainer(Router);

export default AppContainer;
