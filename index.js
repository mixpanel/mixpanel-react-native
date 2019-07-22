"use strict";

import { NativeModules } from 'react-native';

const { MixpanelReactNative } = NativeModules;


var ERROR_MESSAGE = {
    NEED_MP_TOKEN: "The Mixpanel Client needs a Mixpanel token: `init(token)`",
    REQUIRED_PARAMETER: "is required"
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

    hasOptedOutTracking(){
        return MixpanelReactNative.hasOptedOutTracking(distinct_id);
    }

    optInTracking(distinct_id, properties){
        return MixpanelReactNative.optInTracking(distinct_id, properties);
    }

    optOutTracking(){
        return MixpanelReactNative.optInTracking();
    }
    
    identify(distinct_id){
        return MixpanelReactNative.identify(distinct_id);
    }

    alias(alias, distinct_id){
        return MixpanelReactNative.alias(alias, distinct_id);
    }

    track(event_name, properties){
        return MixpanelReactNative.track(event_name, properties);
    }
    
    //for andriod only
    trackMap(event_name, properties){
        return MixpanelReactNative.trackMap(event_name, properties);
    }

    registerSuperProperties(properties){
        return MixpanelReactNative.registerSuperProperties(properties);
    }
    //According to Android
    registerSuperPropertiesOnce(properties){
        return MixpanelReactNative.registerSuperProperties(properties);
    }

    registerSuperPropertiesMap(properties){
        return MixpanelReactNative.registerSuperPropertiesMap(properties);
    }

    unregisterSuperProperty(properties_name){
        return MixpanelReactNative.unregisterSuperProperty(properties_name);
    }

    getSuperProperties(properties_name){
        return MixpanelReactNative.getSuperProperties(properties_name);
    }

    registerSuperPropertiesOnceMap(properties){
        return MixpanelReactNative.registerSuperPropertiesOnceMap(properties);
    }

    clearSuperProperties(){
        return MixpanelReactNative.clearSuperProperties();
    }

    timeEvent(event){
        return MixpanelReactNative.timeEvent(event);
    }

    eventElapsedTime(event_name){
        return MixpanelReactNative.eventElapsedTime(event_name);
    }

    reset(){
        return MixpanelReactNative.reset();
    }

    isIdentified(){
        return MixpanelReactNative.isIdentified();
    }

    set(properties){
        return MixpanelReactNative.set(properties);
    }
    setOnce(properties){
        return MixpanelReactNative.setOnce(properties);
    }

    trackCharge(charge, properties){
        return MixpanelReactNative.trackCharge(charge, properties);
    }

    clearCharges(){
        return MixpanelReactNative.clearCharges();
    }

    increment(name, incrementValue){
        return MixpanelReactNative.increment(name, incrementValue);
    }

    append(name, properties){
        return MixpanelReactNative.append(name, properties);
    }

    merge(property_name, properties){
        return MixpanelReactNative.merge(property_name, properties);
    }

    deleteUser(){
        return MixpanelReactNative.deleteUser();
    }
    getInformation(){
        return MixpanelReactNative.getInformation();
    }  
    
    flush(){
        return MixpanelReactNative.flush();
    }
}

export class People {

    identify(distinct_id){
        return MixpanelReactNative.identify(distinct_id);
    }

    set(properties){
        return MixpanelReactNative.set(properties);
    }
    setOnce(properties){
        return MixpanelReactNative.setOnce(properties);
    }

    trackCharge(charge, properties){
        return MixpanelReactNative.trackCharge(charge, properties);
    }

    clearCharges(){
        return MixpanelReactNative.clearCharges();
    }

    increment(name, incrementValue){
        return MixpanelReactNative.increment(name, incrementValue);
    }

    append(name, properties){
        return MixpanelReactNative.append(name, properties);
    }

    merge(property_name, properties){
        return MixpanelReactNative.merge(property_name, properties);
    }

    deleteUser(){
        return MixpanelReactNative.deleteUser();
    }

    setPushRegistrationId(token){
        return MixpanelReactNative.setPushRegistrationId(token);
    }
    //android only
    getPushRegistrationId(){
        return MixpanelReactNative.getPushRegistrationId(token);
    }

    clearPushRegistrationId(token){
        return MixpanelReactNative.clearPushRegistrationId(token);
    }
}

const mixpanel = new Mixpanel();
export default mixpanel;