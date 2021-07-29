import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";

import Home from './screens/Home';
import Event from './screens/EventScreen';
import Profile from './screens/ProfileScreen';
import GDPR from './screens/GDPRScreen';
import Group from './screens/GroupScreen';


const Router = createStackNavigator({
    MixpanelDemo:
    {
        screen: Home,
    },
    Event:
    {
        screen: Event
    },
    Profile:
    {
        screen: Profile
    },
    GDPR:
    {
        screen: GDPR
    },
    Group:
    {
        screen: Group
    }
});
const AppContainer = createAppContainer(Router);

export default AppContainer;
