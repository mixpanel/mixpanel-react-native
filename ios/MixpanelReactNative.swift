import Foundation
import Mixpanel
import UIKit

@objc(MixpanelReactNative)
class MixpanelReactNative: NSObject {
    private var mInstance: MixpanelInstance?;
    private var mToken: String = "";
    // MARK: - Mixpanel Instance
    
    /**
     Get the instance of MixpanelAPI with providing your project token
     and boolean value for opting out tracking,  default value for optOutTrackingDefault is
     false by setting it to true will prevent data from being collected by default
     This instance of MixpanelAPI you can use to send events and updates to Mixpanel.
     */
    
    @objc
    func getInstance(_ apiToken: String,
                     optOutTrackingByDefault: Bool = false,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        mToken = apiToken;
        mInstance = initialize(apiToken: apiToken,instanceName: apiToken,optOutTrackingByDefault: optOutTrackingByDefault);
        resolve(self);
    }
    
    func initialize(apiToken: String,
                    launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil,
                    flushInterval: Double = 60,
                    instanceName: String = UUID().uuidString,
                    automaticPushTracking: Bool = true,
                    optOutTrackingByDefault: Bool = false) -> MixpanelInstance {
        return Mixpanel.initialize(token: apiToken, launchOptions: launchOptions, flushInterval: flushInterval, instanceName: instanceName, automaticPushTracking: automaticPushTracking, optOutTrackingByDefault: optOutTrackingByDefault);
    }
    // MARK: - Opting Users Out of Tracking
    
    /**
     Opt out tracking.
     
     This method is used to opt out tracking. This causes all events and people request no longer
     to be sent back to the Mixpanel server.
     */
    @objc
    func optOutTracking(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.optOutTracking();
            resolve(Constants.OPT_OUT_SUCCESS);
        }
    }
    
    /**
     Returns if the current user has opted out tracking.
     
     - returns: the current super opted out tracking status
     */
    @objc
    func hasOptedOutTracking(_ resolve: RCTPromiseResolveBlock,
                             rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            resolve(mInstance?.hasOptedOutTracking());
        }
    }
    
    /**
     Opt in tracking.
     
     Use this method to opt in an already opted out user from tracking. People updates and track calls will be
     sent to Mixpanel after using this method.
     
     This method will internally track an opt in event to your project.
     
     - parameter distintId: an optional string to use as the distinct ID for events
     - parameter properties: an optional properties dictionary that could be passed to add properties to the opt-in event that is sent to Mixpanel
     */
    @objc
    func optInTracking(_ distinctId: String?,
                       properties: [String: AnyObject]? = nil,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.optInTracking(distinctId: distinctId, properties: MixpanelTypeHandler.processProperties(properties: properties));
            resolve(Constants.OPT_IN_SUCCESS);
        }
    }
    // MARK: - Track Events
    @objc
    func track(_ event: String?,
                       properties: [String: AnyObject]? = nil,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.track(event: event, properties: MixpanelTypeHandler.processProperties(properties: properties));
            resolve(Constants.TRACK_SUCCESS);
        }
    }

    // MARK: - Automatically Track Events
    // MARK: - Sending Events
    // MARK: - Timing Events
    
    /**
     Starts a timer that will be stopped and added as a property when a
     corresponding event is tracked.
     
     This method is intended to be used in advance of events that have
     a duration. For example, if a developer were to track an "Image Upload" event
     she might want to also know how long the upload took. Calling this method
     before the upload code would implicitly cause the `track`
     call to record its duration.
     
     - precondition:
     // begin timing the image upload:
     mixpanelInstance.time(event:"Image Upload")
     // upload the image:
     self.uploadImageWithSuccessHandler() { _ in
     // track the event
     mixpanelInstance.track("Image Upload")
     }
     
     - parameter event: the event name to be timed
     
     */
    @objc
    func timeEvent(_ event: String,
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.time(event: event);
            mInstance?.flush();
            resolve(Constants.TIME_EVENT_SUCCESS);
        }
    }
    
    /**
     Clears all current event timers.
     */
    @objc
    func clearTimedEvents(_ resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.clearTimedEvents();
            resolve(Constants.CLEAR_TIME_EVENT_SUCCESS);
        }
    }
    
    /**
     Retrieves the time elapsed for the named event since time(event:) was called.
     
     - parameter event: the name of the event to be tracked that was passed to time(event:)
     */
    @objc
    func eventElapsedTime(_ event: String, resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
           resolve(mInstance?.eventElapsedTime(event: event));
        }
    }
    
    // MARK: - Managing User Identity
    /**
     Identify the user uniquely by providing the user distinct id, so all the event, update ,track call
     will manipulate the data only for identified users profile.
     This call does not identify the user for People Analytics to do that you have to call
     method.
     
     - parameter distinctId: string that uniquely identifies the current user
     - parameter usePeople: boolean that controls whether or not to set the people distinctId to the event distinctId.
     This should only be set to false if you wish to prevent people profile updates for that user.
     */
    @objc
    func identify(_ distinctId: String,
                  resolver resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.identify(distinctId: distinctId);
            resolve(Constants.USER_IDENTIFIED_SUCCESS);
        }
    }
    
    /**
     Creates a distinctId alias from alias to the current id.
     
     This method is used to map an identifier called an alias to the existing Mixpanel
     distinct id. This causes all events and people requests sent with the alias to be
     mapped back to the original distinct id. The recommended usage pattern is to call
     createAlias: and then identify: (with their new user ID)
     when they log in the next time. This will keep your signup funnels working
     correctly.
     This makes the current id and 'Alias' interchangeable distinct ids.
     Mixpanel.
     mixpanelInstance.createAlias("Alias", mixpanelInstance.distinctId)
     
     - precondition: You must call identify if you haven't already
     (e.g. when your app launches)
     
     - parameter alias:      the new distinct id that should represent the original
     - parameter distinctId: the old distinct id that alias will be mapped to
     - parameter usePeople: boolean that controls whether or not to set the people distinctId to the event distinctId.
     This should only be set to false if you wish to prevent people profile updates for that user.
     */
    
    @objc
    func alias(_ alias: String,
               distinctId: String,
               usePeople: Bool = true,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.createAlias(alias, distinctId: distinctId, usePeople: usePeople);
            resolve(Constants.ALIAS_SUCCESS);
        }
    }
    
    /**
     Uploads queued data to the Mixpanel server.
     
     By default, queued data is flushed to the Mixpanel servers every minute (the
     default for `flushInterval`), and on background (since
     `flushOnBackground` is on by default). You only need to call this
     method manually if you want to force a flush at a particular moment.

     */
    @objc
    func flush(_ resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.flush();
            resolve(Constants.FLUSH_SUCCESS);
        }
    }
    
    /**
     Clears all stored properties including the distinct Id.
     Useful if your app's user logs out.
     */
    @objc
    func reset(_ resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.reset();
            resolve(Constants.RESET_SUCCESS);
        }
    }
    
    // MARK: - Super Properties
    
    /**
     Registers super properties, overwriting ones that have already been set.
     
     Super properties, once registered, are automatically sent as properties for
     all event tracking calls. They save you having to maintain and add a common
     set of properties to your events.
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     
     - parameter properties: properties dictionary
     */
    @objc
    func registerSuperProperties(_ properties: [String: AnyObject],
                              resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.registerSuperProperties(MixpanelTypeHandler.processProperties(properties: properties));
            resolve(Constants.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }
    
    /**
     Registers super properties without overwriting ones that have already been set,
     unless the existing value is equal to defaultValue. defaultValue is optional.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     
     - parameter properties:   properties dictionary
     - parameter defaultValue: Optional. overwrite existing properties that have this value
     */
    @objc
    func registerSuperPropertiesOnce(_ properties: [String: AnyObject],
                                     defaultValue: Any? = nil,
                                 resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.registerSuperPropertiesOnce(MixpanelTypeHandler.processProperties(properties: properties), defaultValue: MixpanelTypeHandler.ToMixpanelType(defaultValue as Any));
            resolve(Constants.REGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }
    
    @objc
    func getSuperProperties(_ resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            resolve(mInstance?.currentSuperProperties());
        }
    }
    /**
     Removes a previously registered super property.
     
     As an alternative to clearing all properties, unregistering specific super
     properties prevents them from being recorded on future events. This operation
     does not affect the value of other super properties. Any property name that is
     not registered is ignored.
     Note that after removing a super property, events will show the attribute as
     having the value `undefined` in Mixpanel until a new value is
     registered.
     
     - parameter propertyName: array of property name strings to remove
     */
    @objc
    func unregisterSuperProperty(_ propertyName: String,
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.unregisterSuperProperty(propertyName);
            resolve(Constants.UNREGISTER_SUPER_PROPERTY_SUCCESS);
        }
    }
    /**
     Clears all currently set super properties.
     */
    @objc
    func clearSuperProperties(_ resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.clearSuperProperties();
            resolve(Constants.CLEAR_SUPER_PROPERTY_SUCCESS);
        }
    }
    
    // MARK: - Storing User Profiles
    // MARK: - Registering for Push Notifications
    
    // MARK: - Test Method
    @objc
    func getInformation(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.identify(distinctId: "abcd");
            mInstance?.people.set(property: "$name", to: "Gayatri Lokhande");
            mInstance?.flush();
            let welcomeText = "IOS library invoked :: Mixpanel Demo app:: opt";
            resolve(welcomeText);
        }
    }
}
