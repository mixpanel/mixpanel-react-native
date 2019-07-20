"use strict";

import { NativeModules } from 'react-native';

const { MixpanelReactNative } = NativeModules;


var ERROR_MESSAGE = {
    NEED_MP_TOKEN: "The Mixpanel Client needs a Mixpanel token: `init(token)`"    
};

var DEFAULT_OPT_OUT = false;

export class Mixpanel {
    apiToken = "";
    people = this.people = new People();      
    
    getInstance(token){
        if(!token || token === "") {
            throw new Error(ERROR_MESSAGE.NEED_MP_TOKEN);
        }
        this.apiToken = token;
        return MixpanelReactNative.getInstance(this.apiToken, DEFAULT_OPT_OUT);
    }
    
    identify(distinct_id){
        return MixpanelReactNative.identify(distinct_id);
    }
    track(event, properties){
        return MixpanelReactNative.track(event, properties);
    }

    getInformation(){
        return MixpanelReactNative.getInformation().then(t => alert(t));
    }  
    
    flush(){
        return MixpanelReactNative.flush();
    }
}

export class People {

    identify(distinct_id){
        return MixpanelReactNative.identify(distinct_id).then(t => alert(t));
    }

    set(properties){        
        alert("Set called - ");
        return MixpanelReactNative.set(properties).then(t => alert(t));
    }
}

const mixpanel = new Mixpanel();
export default mixpanel;