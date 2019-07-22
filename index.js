"use strict";

import { NativeModules } from 'react-native';

const { MixpanelReactNative } = NativeModules;
var KEY = {
    DISTINCT_ID: "Distinct id",
    ALIAS: "Alias",
    EVENT_NAME: "Event name",
    PROPERTIES: "Properties",
    PROPERTY_NAME: "Property name"
};

var ERROR_MESSAGE = {
    NEED_MP_TOKEN: "The Mixpanel Client needs a Mixpanel token: `init(token)`",
    REQUIRED_PARAMETER: " is required",
    REQUIRED_OBJECT: " is required. Cannot be null or undefined"
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
        return MixpanelReactNative.hasOptedOutTracking();
    }

    optInTracking(distinct_id, properties){
        return MixpanelReactNative.optInTracking(distinct_id, properties);
    }

    optOutTracking(){
        return MixpanelReactNative.optInTracking();
    }
    
    identify(distinct_id){
        return MixpanelReactNative.identify(Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    alias(alias, distinct_id){
        return MixpanelReactNative.alias(Helper.getValidString(alias, KEY.ALIAS), Helper.getValidString(distinct_id, KEY.DISTINCT_ID));
    }

    track(event_name, properties){
        return MixpanelReactNative.track(Helper.getValidString(event_name,KEY.EVENT_NAME), properties);
    }
    
    //for andriod only
    trackMap(event_name, properties){
        return MixpanelReactNative.trackMap(Helper.getValidString(event_name,KEY.EVENT_NAME), properties);
    }

    registerSuperProperties(properties){
        return MixpanelReactNative.registerSuperProperties(Helper.getValidObject(properties, KEY.PROPERTIES));
    }
    //According to Android
    registerSuperPropertiesOnce(properties){
        return MixpanelReactNative.registerSuperProperties(Helper.getValidObject(properties, KEY.PROPERTIES));
    }
    //for andriod only
    registerSuperPropertiesMap(properties){
        return MixpanelReactNative.registerSuperPropertiesMap(Helper.getValidObject(properties ,KEY.PROPERTIES));
    }

    unregisterSuperProperty(properties_name){
        return MixpanelReactNative.unregisterSuperProperty(Helper.getValidString(properties_name,KEY.PROPERTY_NAME));
    }

    getSuperProperties(){
        return MixpanelReactNative.getSuperProperties();
    }
    
    //for andriod only
    registerSuperPropertiesOnceMap(properties){
        return MixpanelReactNative.registerSuperPropertiesOnceMap(Helper.getValidObject(properties, KEY.PROPERTIES));
    }

    clearSuperProperties(){
        return MixpanelReactNative.clearSuperProperties();
    }

    timeEvent(event_name){
        return MixpanelReactNative.timeEvent(Helper.getValidString(event_name,KEY.EVENT_NAME));
    }

    eventElapsedTime(event_name){
        return MixpanelReactNative.eventElapsedTime(Helper.getValidString(event_name,KEY.EVENT_NAME));
    }

    reset(){
        return MixpanelReactNative.reset();
    }

    isIdentified(){
        return MixpanelReactNative.isIdentified();
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
        return MixpanelReactNative.getPushRegistrationId();
    }

    clearPushRegistrationId(token){
        return MixpanelReactNative.clearPushRegistrationId(token);
    }
}

class Helper {
    static getValidString(str,parameter_name){
    if(!str || str === "" ) {
        throw new Error(parameter_name + ERROR_MESSAGE.REQUIRED_PARAMETER );
    }
    return str;
   }
   static getValidObject(obj, parameter_name){
    if(obj && typeof value === 'object' && obj !== 'null' && obj !== 'undefined') {
        throw new Error(parameter_name + ERROR_MESSAGE.REQUIRED_OBJECT );
    }
    return obj; 
   }
}


const mixpanel = new Mixpanel();
export default mixpanel;