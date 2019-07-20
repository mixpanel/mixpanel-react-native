import Foundation
import Mixpanel
import UIKit

@objc(MixpanelReactNative)
class MixpanelReactNative: NSObject {
    private var mInstance: MixpanelInstance?
    private var mToken: String = ""
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
        mToken = apiToken
        mInstance = initialize(apiToken: apiToken,instanceName: apiToken,optOutTrackingByDefault: optOutTrackingByDefault)
        resolve(self)
    }
    
    func initialize(apiToken: String,
                    launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil,
                    flushInterval: Double = 60,
                    instanceName: String = UUID().uuidString,
                    automaticPushTracking: Bool = true,
                    optOutTrackingByDefault: Bool = false) -> MixpanelInstance {
        return Mixpanel.initialize(token: apiToken, launchOptions: launchOptions, flushInterval: flushInterval, instanceName: instanceName, automaticPushTracking: automaticPushTracking, optOutTrackingByDefault: optOutTrackingByDefault)
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
            mInstance?.optOutTracking()
            resolve(Constants.OPT_OUT_SUCCESS)
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
            resolve(mInstance?.hasOptedOutTracking())
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
                       properties: [String: Any]? = nil,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.optInTracking(distinctId: distinctId, properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.OPT_IN_SUCCESS)
        }
    }
    // MARK: - Track Events
    @objc
    func track(_ event: String?,
                 properties: [String: Any]? = nil,
                 resolver resolve: RCTPromiseResolveBlock,
                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.track(event: event, properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.TRACK_SUCCESS)
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
            mInstance?.time(event: event)
            mInstance?.flush()
            resolve(Constants.TIME_EVENT_SUCCESS)
        }
    }
    
    /**
     Clears all current event timers.
     */
    @objc
    func clearTimedEvents(_ resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.clearTimedEvents()
            resolve(Constants.CLEAR_TIME_EVENT_SUCCESS)
        }
    }
    
    /**
     Retrieves the time elapsed for the named event since time(event:) was called.
     
     - parameter event: the name of the event to be tracked that was passed to time(event:)
     */
    @objc
    func eventElapsedTime(_ event: String,
                          resolver resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
           resolve(mInstance?.eventElapsedTime(event: event))
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
            mInstance?.identify(distinctId: distinctId)
            resolve(Constants.USER_IDENTIFIED_SUCCESS)
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
            mInstance?.createAlias(alias, distinctId: distinctId, usePeople: usePeople)
            resolve(Constants.ALIAS_SUCCESS)
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
            mInstance?.flush()
            resolve(Constants.FLUSH_SUCCESS)
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
            mInstance?.reset()
            resolve(Constants.RESET_SUCCESS)
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
    func registerSuperProperties(_ properties: [String: Any],
                              resolver resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.registerSuperProperties(MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.REGISTER_SUPER_PROPERTY_SUCCESS)
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
    func registerSuperPropertiesOnce(_ properties: [String: Any],
                                     defaultValue: Any? = nil,
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.registerSuperPropertiesOnce(MixpanelTypeHandler.processProperties(properties: properties), defaultValue: MixpanelTypeHandler.ToMixpanelType(defaultValue as Any))
            resolve(Constants.REGISTER_SUPER_PROPERTY_SUCCESS)
        }
    }
    
    @objc
    func getSuperProperties(_ resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            resolve(mInstance?.currentSuperProperties())
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
            mInstance?.unregisterSuperProperty(propertyName)
            resolve(Constants.UNREGISTER_SUPER_PROPERTY_SUCCESS)
        }
    }
    /**
     Clears all currently set super properties.
     */
    @objc
    func clearSuperProperties(_ resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.clearSuperProperties()
            resolve(Constants.CLEAR_SUPER_PROPERTY_SUCCESS)
        }
    }
    
    // MARK: - People
    
    /**
     Set properties on the current user in Mixpanel People.
     
     The properties will be set on the current user.
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     You can override the current project token and distinct Id by
     including the special properties: $token and $distinct_id. If the existing
     user record on the server already has a value for a given property, the old
     value is overwritten. Other existing properties will not be affected.
     
     - precondition: You must identify for the set information to be linked to that user
     
     - parameter properties: properties dictionary
     */
    @objc
    func set(_ properties: [String: Any],
             resolver resolve: RCTPromiseResolveBlock,
             rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.set(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.SET_SUCCESS)
        }
    }
    /**
     Convenience method for setting a single property in Mixpanel People.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     
     - parameter property: property name
     - parameter to:       property value
     */
    @objc
    func setPropertyTo(_ property: String,
                       to: Any,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.set(property: property, to: MixpanelTypeHandler.ToMixpanelType(to as Any)!)
            resolve(Constants.SET_SUCCESS)
        }
    }
    
    /**
     Set properties on the current user in Mixpanel People, but doesn't overwrite if
     there is an existing value.
     
     This method is identical to `set:` except it will only set
     properties that are not already set. It is particularly useful for collecting
     data about the user's initial experience and source, as well as dates
     representing the first time something happened.
     
     - parameter properties: properties dictionary
     */
    @objc
    func setOnce(_ properties: [String: Any],
                 resolver resolve: RCTPromiseResolveBlock,
                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.setOnce(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.SET_ONCE_SUCCESS)
        }
    }
    
    /**
     Remove a list of properties and their values from the current user's profile
     in Mixpanel People.
     
     The properties array must ony contain String names of properties. For properties
     that don't exist there will be no effect.
     
     - parameter properties: properties array
     */
    @objc
    func unset(_ properties: [String],
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.unset(properties: properties)
            resolve(Constants.UNSET_SUCCESS)
        }
    }
    
    /**
     Increment the given numeric properties by the given values.
     
     Property keys must be String names of numeric properties. A property is
     numeric if its current value is a number. If a property does not exist, it
     will be set to the increment amount. Property values must be number objects.
     
     - parameter properties: properties array
     */
    @objc
    func increment(_ properties: [String: Any],
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.increment(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.INCREMENT_SUCCESS)
        }
    }
    
    /**
     Convenience method for incrementing a single numeric property by the specified
     amount.
     
     - parameter property: property name
     - parameter by:       amount to increment by
     */
    @objc
    func incrementPropertyby(_ property: String,
                             by: Double,
                             resolver resolve: RCTPromiseResolveBlock,
                             rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.increment(property: property, by: by)
            resolve(Constants.INCREMENT_PROPERTIES_SUCCESS)
        }
    }
    
    /**
     Append values to list properties.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     
     - parameter properties: mapping of list property names to values to append
     */
    @objc
    func append(_ properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.append(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.APPEND_SUCCESS)
        }
    }
    
    /**
     Removes list properties.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     
     - parameter properties: mapping of list property names to values to remove
     */
    @objc
    func remove(_ properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.remove(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.REMOVE_SUCCESS)
        }
    }
    
    /**
     Union list properties.
     
     Property values must be array objects.
     
     - parameter properties: mapping of list property names to lists to union
     */
    @objc
    func union(_ properties: [String: Any],
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.union(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.UNION_SUCCESS)
        }
    }
    
    /**
     Track money spent by the current user for revenue analytics and associate
     properties with the charge. Properties is optional.
     
     Charge properties allow you to segment on types of revenue. For instance, you
     could record a product ID with each charge so that you could segement on it in
     revenue analytics to see which products are generating the most revenue.
     
     - parameter amount:     amount of revenue received
     - parameter properties: Optional. properties dictionary
     */
    @objc
    func trackCharge(_ amount: Double,
                     properties: [String: Any]? = nil,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.trackCharge(amount: amount, properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(Constants.TRACK_CHARGE_SUCCESS)
        }
    }
    
    /**
     Delete current user's revenue history.
     */
    @objc
    func clearCharges(_ resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.clearCharges();
            resolve(Constants.CLEAR_CHARGE_SUCCESS)
        }
    }
    
    /**
     Delete current user's record from Mixpanel People.
     */
    @objc
    func deleteUser(_ resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.people.deleteUser();
            resolve(Constants.DELETE_USER_SUCCESS)
        }
    }
    
    // MARK: - Registering for Push Notifications
    
    // MARK: - Test Method
    @objc
    func getInformation(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            resolve(Constants.LIBRARY_INVOKED)
        }
    }
}
