"use strict";

import { NativeModules } from 'react-native';

const { MixpanelReactNative } = NativeModules;

//export default MixpanelReactNative;

var ERROR_MESSAGE = {
    NEED_MP_TOKEN: "The Mixpanel Client needs a Mixpanel token: `init(token)`"    
};

export default class Mixpanel {
    apiToken = "";
    people = undefined;
    
    constructor(token){
        if(!token) {
            throw new Error(ERROR_MESSAGE.NEED_MP_TOKEN);
        }
        alert("Constructor called");
        this.apiToken = token;
        MixpanelReactNative.getInstance(token);
        MixpanelReactNative.getPeople().then(p => {
            this.people = new People(p);
        })
    }
    
    track(event, properties){
        alert("track called");
        MixpanelReactNative.track(event, properties);
    }

    getInformation(){
        MixpanelReactNative.getInformation().then(t=> alert(t));
    }
}

class People {
    constructor(internalPeople){    
        this.people = internalPeople;    
    }
    
    set(distinct_id, properties){
        alert("People set called");
        this.people.set(distinct_id, properties);
    }
}