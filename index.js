"use strict";

import { NativeModules } from 'react-native';

const { MixpanelReactNative } = NativeModules;

//export default MixpanelReactNative;

var ERROR_MESSAGE = {
    NEED_MP_TOKEN: "The Mixpanel Client needs a Mixpanel token: `init(token)`"    
};

var DEFAULT_OPT_OUT = false;

export default class Mixpanel {
    apiToken = "";
    people = this.people = new People();      
    
    constructor(token){
        if(!token) {
            throw new Error(ERROR_MESSAGE.NEED_MP_TOKEN);
        }        
        this.apiToken = token;
    }

    getInstance(){
        return MixpanelReactNative.getInstance(this.apiToken, DEFAULT_OPT_OUT);
    }
    
    identify(distinct_id){
        return MixpanelReactNative.identify(distinct_id);
    }
    track(event, properties){
        alert("track called");
        return MixpanelReactNative.track(event, properties);
    }

    getInformation(){
        let t = await MixpanelReactNative.getInformation();
        alert (t);
    }    
}

export class People {

    identify(distinct_id){
        return MixpanelReactNative.identify(distinct_id);
    }

    set(properties){        
        alert("Set called - ");
        return MixpanelReactNative.set(properties);
    }
}