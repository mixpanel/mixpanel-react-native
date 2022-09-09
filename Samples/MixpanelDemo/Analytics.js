import {Mixpanel} from 'mixpanel-react-native';
import {token as MixpanelToken, trackAutomaticEvents} from './app.json';


export class MixpanelManager {
    static sharedInstance = MixpanelManager.sharedInstance || new MixpanelManager();

    constructor() {
        this.mixpanel = new Mixpanel(MixpanelToken, trackAutomaticEvents);
        this.mixpanel.init();
        this.mixpanel.setLoggingEnabled(true);
    }
}

export const MixpanelInstance = MixpanelManager.sharedInstance.mixpanel;
