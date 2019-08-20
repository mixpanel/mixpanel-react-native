import Foundation
import Mixpanel
import UIKit

@objc(MixpanelReactNative)
class MixpanelReactNative: NSObject {
    private var mToken: String = ""
    // MARK: - Mixpanel Instance
    
    /**
     Get the instance of Mixpanel with providing your project token
     and boolean value for opting out tracking,  default value for optOutTrackingDefault is
     false by setting it to true will prevent data from being collected by default
     This instance of Mixpanel you can use to send events and updates to Mixpanel.
     */
    @objc
    func getInstance(_ token: String,
                     optOutTrackingByDefault: Bool = false,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        initialize(apiToken: token, optOutTrackingByDefault: optOutTrackingByDefault, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func initialize(token: String,
                    optOutTrackingByDefault: Bool = false,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        
        var instance = Mixpanel.initialize(token: token, launchOptions: nil, flushInterval: Constants.DEFAULT_FLUSH_INTERVAL, instanceName: token, automaticPushTracking: Constants.AUTOMATIC_PUSH_TRACKING, optOutTrackingByDefault: optOutTrackingByDefault)
        if (instance == nil){
            reject(Constants.ERROR, Constants.INSTANCE_NOT_FOUND, nil)
        } else {
            resolve(true)
        }
    }
    
    // MARK: - Opting Users Out of Tracking
    
    /**
     Opt out tracking.
     
     This method is used to opt out tracking. This causes all events and people request no longer
     to be sent back to the Mixpanel server.
     */
    @objc
    func optOutTracking(_ token: String, resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = Mixpanel.getInstance(name: token)
        if instance == nil {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        } else {
            instance.optOutTracking()
            resolve(nil)
        }
    }
    
    /**
     Returns if the current user has opted out tracking.
     
     - returns: the current super opted out tracking status
     */
    @objc
    func hasOptedOutTracking(_ token: String, resolve: RCTPromiseResolveBlock,
                             rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = Mixpanel.getInstance(name: token)
        if instance == nil {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        } else {
            instance.hasOptedOutTracking()
            resolve(nil)
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
    func optInTracking(_ token: String, distinctId: String?,
                       properties: [String: Any]? = nil,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = Mixpanel.getInstance(name: token)
        if instance == nil {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        } else {
            let mpProperties = MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true)
            instance.optInTracking(distinctId: distinctId, properties: mpProperties)
            resolve(nil)
        }
    }
    
    // MARK: - Track Events
    
    /**
     Tracks an event with properties.
     Properties are optional and can be added only if needed.
     Properties will allow you to segment your events in your Mixpanel reports.
     If the event is being timed, the timer will stop and be added as a property.
     
     - parameter event:      event name
     - parameter properties: properties dictionary
     */
    @objc
    func track(_ token: String, event: String?,
               properties: [String: Any]? = nil,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        let instance = Mixpanel.getInstance(name: token)
        if instance == nil {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        } else {
            let mpProperties = MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true)
            instance.track(event: event, properties: mpProperties)
            resolve(nil)
        }
    }
    
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
    func timeEvent(_ token: String, event: String,
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().time(event: event)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Clears all current event timers.
     */
    @objc
    func clearTimedEvents(_ token: String, resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().clearTimedEvents()
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Retrieves the time elapsed for the named event since time(event:) was called.
     
     - parameter event: the name of the event to be tracked that was passed to time(event:)
     */
    @objc
    func eventElapsedTime(_ token: String, event: String,
                          resolver resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            resolve(Mixpanel.mainInstance().eventElapsedTime(event: event))
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func identify(_ token: String, distinctId: String,
                  resolver resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().identify(distinctId: distinctId)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func alias(_ token: String, alias: String,
               distinctId: String,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().createAlias(alias, distinctId: distinctId)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func flush(_ token: String, resolve: RCTPromiseResolveBlock,
               rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().flush()
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Clears all stored properties including the distinct Id.
     Useful if your app's user logs out.
     */
    @objc
    func reset(_ token: String, resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().reset()
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func registerSuperProperties(_ token: String, properties: [String: Any],
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().registerSuperProperties(MixpanelTypeHandler.processProperties(properties: properties))
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func registerSuperPropertiesOnce(_ token: String, properties: [String: Any],
                                     defaultValue: Any? = nil,
                                     resolver resolve: RCTPromiseResolveBlock,
                                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().registerSuperPropertiesOnce(MixpanelTypeHandler.processProperties(properties: properties), defaultValue: MixpanelTypeHandler.ToMixpanelType(defaultValue as Any))
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Returns the currently set super properties.
     
     - returns: the current super properties
     */
    @objc
    func getSuperProperties(_ token: String, resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            resolve(Mixpanel.mainInstance().currentSuperProperties())
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func unregisterSuperProperty(_ token: String, propertyName: String,
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().unregisterSuperProperty(propertyName)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Clears all currently set super properties.
     */
    @objc
    func clearSuperProperties(_ token: String, resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().clearSuperProperties()
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func set(_ token: String, properties: [String: Any],
             resolver resolve: RCTPromiseResolveBlock,
             rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            let mpProperties = MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true)
            Mixpanel.mainInstance().people.set(properties: mpProperties)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func setPropertyTo(_ token: String, property: String,
                       to: Any,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.set(property: property, to: MixpanelTypeHandler.ToMixpanelType(to as Any)!)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func setOnce(_ token: String, properties: [String: Any],
                 resolver resolve: RCTPromiseResolveBlock,
                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            let mpProperties = MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true)
            Mixpanel.mainInstance().people.setOnce(properties: mpProperties)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func unset(_ token: String, properties: [String],
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.unset(properties: properties)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func increment(_ token: String, properties: [String: Any],
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.increment(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Convenience method for incrementing a single numeric property by the specified
     amount.
     
     - parameter property: property name
     - parameter by:       amount to increment by
     */
    @objc
    func incrementPropertyBy(_ token: String, property: String,
                             by: Double,
                             resolver resolve: RCTPromiseResolveBlock,
                             rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.increment(property: property, by: by)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Append values to list properties.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     
     - parameter propertyName: the People Analytics property that should have it's value appended to
     - parameter properties: mapping of list property names to values to append
     */
    @objc
    func append(_ token: String, propertyName: String,
                properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.append(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Removes list properties.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     
     - parameter propertyName: name the People Analytics property that should have it's value removed from
     - parameter properties: mapping of list property names to values to remove
     */
    @objc
    func remove(_ token: String, propertyName: String,
                properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.remove(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Union list properties.
     
     Property values must be array objects.
     
     - parameter propertyName: name of the list-valued property to set or modify
     - parameter properties: mapping of list property names to lists to union
     */
    @objc
    func union(_ token: String, propertyName: String,
               properties: [String: Any],
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.union(properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
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
    func trackCharge(_ token: String, amount: Double,
                     properties: [String: Any]? = nil,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.trackCharge(amount: amount, properties: MixpanelTypeHandler.processProperties(properties: properties))
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Delete current user's revenue history.
     */
    @objc
    func clearCharges(_ token: String, resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.clearCharges()
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Delete current user's record from Mixpanel People.
     */
    @objc
    func deleteUser(_ token: String, resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.deleteUser()
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    // MARK: - Registering for Push Notifications
    
    /**
     Register the given device to receive push notifications.
     
     This will associate the device token with the current user in Mixpanel People,
     which will allow you to send push notifications to the user from the Mixpanel
     People web interface. You should call this method with the `Data`
     token passed to
     `application:didRegisterForRemoteNotificationsWithDeviceToken:`.
     
     - parameter deviceToken: device token as returned from
     `application:didRegisterForRemoteNotificationsWithDeviceToken:`
     */
    @objc
    func setPushRegistrationId(_ token: String, deviceToken: Data,
                               resolver resolve: RCTPromiseResolveBlock,
                               rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.addPushDeviceToken(deviceToken)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Register the given device to receive push notifications.
     
     This will associate the device token with the current user in Mixpanel People,
     which will allow you to send push notifications to the user from the Mixpanel
     People web interface. You should call this method with the `Data`
     token passed to
     `application:didRegisterForRemoteNotificationsWithDeviceToken:`.
     
     - parameter deviceToken: device token as returned from
     `application:didRegisterForRemoteNotificationsWithDeviceToken:`
     */
    @objc
    func clearPushRegistrationId(_ token: String, deviceToken: Data,
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.removePushDeviceToken(deviceToken)
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Unregister the given device to receive push notifications.
     
     This will unset all of the push tokens saved to this people profile. This is useful
     in conjunction with a call to `reset`, or when a user is logging out.
     */
    @objc
    func clearAllPushRegistrationId(_ token: String, resolve: RCTPromiseResolveBlock,
                                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        if !mToken.isEmpty {
            Mixpanel.mainInstance().people.removeAllPushDeviceTokens()
            resolve(nil)
        } else {
            reject(Constants.ERROR,Constants.INSTANCE_NOT_FOUND,nil)
        }
    }
    
    /**
     Sets metadata like `$lib_version`, `mp_lib`
     */
    @objc
    func setMetadata(_ properties: [String: Any],
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        AutomaticProperties.setAutomaticProperties(properties)
    }
    
    // MARK: - Test Method
    
    /**
     TODO: Remove this method in the final release
     */
    @objc
    func getInformation(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        resolve(Constants.LIBRARY_INVOKED)
    }
    
    // MARK: - Private methods
    @objc
    func getMixpanelInstance(token: String) throws -> Mixpanel.MixpanelInstance? {
        if token.isEmpty {
            throw NSError("MixpanelReactNative", code: -1, userInfo: [NSLocalizedDescriptionKey: Constants.INVALID_TOKEN])
        }
        let instance = Mixpanel.getInstance(name: token)
        if instance == nil {
            throw NSError("MixpanelReactNative", code: -1, userInfo: [NSLocalizedDescriptionKey: Constants.INSTANCE_NOT_FOUND])
        }
        return instance
    }
}
