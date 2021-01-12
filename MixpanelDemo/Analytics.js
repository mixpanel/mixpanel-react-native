import {Mixpanel} from 'mixpanel-react-native';
import {token as MixpanelToken} from './app.json';

export default class MixpanelManager {
    static sharedInstance = MixpanelManager.sharedInstance || new MixpanelManager();

    constructor() {
        this.configMixpanel();
    }
    
    configMixpanel = async () => {
        this.mixpanel = await Mixpanel.init(MixpanelToken);
    }
}
