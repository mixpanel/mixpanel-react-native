import Foundation
import Mixpanel
import UIKit

@objc(MixpanelReactNative)
open class MixpanelReactNative: NSObject {
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // MARK: - Mixpanel Instance
    
    /**
     Create Mixpanel instance by providing your project token
     and boolean value for opting out tracking. Default value of optOutTrackingDefault is
     false, by setting it to true will prevent data from being collected by default.
     */
    @objc
    func initialize(_ token: String,
                    optOutTrackingByDefault: Bool = false,
                    properties: [String: Any],
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        AutomaticProperties.setAutomaticProperties(properties)
        
        Mixpanel.initialize(token: token, launchOptions: nil, flushInterval: Constants.DEFAULT_FLUSH_INTERVAL, instanceName: token, automaticPushTracking: Constants.AUTOMATIC_PUSH_TRACKING, optOutTrackingByDefault: optOutTrackingByDefault)
        resolve(true)
    }
    
    // MARK: - Opting Users Out of Tracking
    
    /**
     This method is used to opt out from tracking. This causes all events and people request no longer
     to be sent back to the Mixpanel server.
     */
    @objc
    func optOutTracking(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.optOutTracking()
        resolve(nil)
    }
    
    /**
     Check whether the current user has opted out from tracking or not.
     */
    @objc
    func hasOptedOutTracking(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                             rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.hasOptedOutTracking())
    }
    
    /**
     Use this method to opt in an already opted out user from tracking. People updates and track calls will be
     sent to Mixpanel after using this method.
     
     This method will internally track an opt in event to your project.
     */
    @objc
    func optInTracking(_ token: String, distinctId: String?,
                       properties: [String: Any]? = nil,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        let mpProperties = MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true)
        instance?.optInTracking(distinctId: distinctId, properties: mpProperties)
        resolve(nil)
    }
    
    // MARK: - Track Events
    
    /**
     Track an event with properties.
     Properties are optional and can be added only if needed.
     Properties will allow you to segment your events in your Mixpanel reports.
     */
    @objc
    func track(_ token: String, event: String?,
               properties: [String: Any]? = nil,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        let mpProperties = MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true)
        instance?.track(event: event, properties: mpProperties)
        resolve(nil)
    }
    
    // MARK: - Timing Events
    
    /**
     Start a timer that will be stopped and added as a property when a
     corresponding event is tracked.
     
     This method is intended to be used in advance of events that have
     a duration.
     */
    @objc
    func timeEvent(_ token: String, event: String,
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.time(event: event)
        resolve(nil)
    }
    
    /**
     Clear all current event timers.
     */
    @objc
    func clearTimedEvents(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.clearTimedEvents()
        resolve(nil)
    }
    
    /**
     Retrieve the time elapsed for the named event since timeEvent(event) was called.
     */
    @objc
    func eventElapsedTime(_ token: String, event: String,
                          resolver resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.eventElapsedTime(event: event))
    }
    
    // MARK: - Managing User Identity
    
    /**
     Identify the user uniquely by providing the user's distinctId, so all the event, update, track call
     will manipulate the data only for identified user's profile.
     */
    @objc
    func identify(_ token: String, distinctId: String,
                  resolver resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.identify(distinctId: distinctId)
        resolve(nil)
    }
    
    /**
     Create a distinctId alias from alias to the current id.
     
     This method is used to map an identifier called an alias to the existing Mixpanel
     distinctId. This causes all events and people requests sent with the alias to be
     mapped back to the original distinctId.
     */
    @objc
    func alias(_ token: String, alias: String,
               distinctId: String,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.createAlias(alias, distinctId: distinctId)
        resolve(nil)
    }
    
    /**
     Upload queued data to the Mixpanel server.
     
     By default, queued data is flushed to the Mixpanel servers every minute (the
     default for `flushInterval`), and on background (since
     `flushOnBackground` is on by default). You only need to call this
     method manually if you want to force a flush at a particular moment.
     */
    @objc
    func flush(_ token: String, resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.flush()
        resolve(nil)
    }
    
    /**
     Clear all stored properties including the distinctId.
     */
    @objc
    func reset(_ token: String, resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.reset()
        resolve(nil)
    }

    /**
     Returns the string id currently being used to uniquely identify the user associated
     with events.
     */
    @objc
    func getDistinctId(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.distinctId)
    }

    // MARK: - Super Properties
    
    /**
     Register super properties, overwriting ones that have already been set.
     
     Super properties, once registered, are automatically sent as properties for
     all event tracking calls. They save it having to maintain and add a common
     set of properties to your events.
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     */
    @objc
    func registerSuperProperties(_ token: String, properties: [String: Any],
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.registerSuperProperties(MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }
    
    /**
     Register super properties without overwriting ones that have already been set,
     unless the existing value is equal to defaultValue. DefaultValue is optional.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     */
    @objc
    func registerSuperPropertiesOnce(_ token: String, properties: [String: Any],
                                     defaultValue: Any? = nil,
                                     resolver resolve: RCTPromiseResolveBlock,
                                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.registerSuperPropertiesOnce(MixpanelTypeHandler.processProperties(properties: properties), defaultValue: MixpanelTypeHandler.ToMixpanelType(defaultValue as Any))
        resolve(nil)
    }
    
    /**
     Return the currently set super properties.
     */
    @objc
    func getSuperProperties(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.currentSuperProperties())
    }
    
    /**
     Remove a previously registered super property.
     
     As an alternative to clearing all properties, unregistering specific super
     property prevents them from being recorded on future events. This operation
     does not affect the value of other super properties. Any property name that is
     not registered is ignored.
     Note that after removing a super property, events will show the attribute as
     having the value `undefined` in Mixpanel until a new value is
     registered.
     */
    @objc
    func unregisterSuperProperty(_ token: String, propertyName: String,
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.unregisterSuperProperty(propertyName)
        resolve(nil)
    }
    
    /**
     Clear all currently set super properties.
     */
    @objc
    func clearSuperProperties(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.clearSuperProperties()
        resolve(nil)
    }

    // MARK: - People
    
    /**
     Set properties on the current user in Mixpanel People.
     
     The properties will be set on the current user.
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     You can override the current project token and distinctId by
     including the special properties: $token and $distinct_id. If the existing
     user record on the server already has a value for a given property, the old
     value is overwritten. Other existing properties will not be affected.
     */
    @objc
    func set(_ token: String, properties: [String: Any],
             resolver resolve: RCTPromiseResolveBlock,
             rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.set(properties: MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true))
        resolve(nil)
    }
    
    /**
     Set properties on the current user in Mixpanel People, but doesn't overwrite if
     there is an existing value.
     
     This method is identical to `set:` except it will only set
     properties that are not already set.
     */
    @objc
    func setOnce(_ token: String, properties: [String: Any],
                 resolver resolve: RCTPromiseResolveBlock,
                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.setOnce(properties: MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true))
        resolve(nil)
    }
    
    /**
     Remove a list of properties and their values from the current user's profile
     in Mixpanel People.
     
     The properties array must contain String names of properties. There will be no effect on properties
     which do not exist.
     */
    @objc
    func unset(_ token: String, propertyName: String,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.unset(properties: [propertyName])
        resolve(nil)
    }
    
    /**
     Increment the given numeric properties by the given values.
     
     Property keys must be String names of numeric properties. A property is
     numeric if its current value is a number. If a property does not exist, it
     will be set to the increment amount. Property values must be number objects.
     */
    @objc
    func increment(_ token: String, properties: [String: Any],
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.increment(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }
    
    /**
     Append value to list-valued properties.
     
     Property keys must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     */
    @objc
    func append(_ token: String, properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.append(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }
    
    /**
     Remove a value from a list-valued property.
     
     Property key must be String objects and the supported value types need to conform to MixpanelType.
     MixpanelType can be either String, Int, UInt, Double, Float, Bool, [MixpanelType], [String: MixpanelType], Date, URL, or NSNull.
     */
    @objc
    func remove(_ token: String, properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.remove(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }
    
    /**
     Add values to a list-valued property only if, they are not already present in the list.
     If the property does not currently exist, it will be created with the given list as it's value.
     If the property exists and is not list-valued, the union will be ignored.
     
     Property values must be array objects.
     */
    @objc
    func union(_ token: String, properties: [String: Any],
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.union(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }
    
    /**
     Track money spent by the current user for revenue analytics and associate
     properties with the charge. Properties are optional.
     Charge properties allow you to segment on types of revenue.
     */
    @objc
    func trackCharge(_ token: String, amount: Double,
                     properties: [String: Any]? = nil,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.trackCharge(amount: amount, properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }
    
    /**
     Delete current user's revenue history.
     */
    @objc
    func clearCharges(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.clearCharges()
        resolve(nil)
    }
    
    /**
     Delete current user's record from Mixpanel People.
     */
    @objc
    func deleteUser(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.deleteUser()
        resolve(nil)
    }
    
    // MARK: - Registering for Push Notifications
    
    /**
     Register the given device to receive push notifications.
     This will associate the device token with the current user in Mixpanel People,
     which will allow you to send push notifications to the user from the Mixpanel
     People web interface.
     */
    @objc
    func setPushRegistrationId(_ token: String, deviceToken: String,
                               resolver resolve: RCTPromiseResolveBlock,
                               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.union(properties: ["$ios_devices": [deviceToken] ])
        resolve(nil)
    }
    
    /**
     Register the given device to receive push notifications.
     */
    @objc
    open class func setPushRegistrationId(_ token: String, deviceToken: Data) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.addPushDeviceToken(deviceToken)
    }
    
    /**
     Unregister a specific device token from the ability to receive push notifications.
     This will remove the provided push token saved to this people profile. This is useful
     in conjunction with a call to `reset`, or when a user is logging out.
     */
    @objc
    func clearPushRegistrationId(_ token: String, deviceToken: String,
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.removePushDeviceToken(deviceToken.data(using: .utf16)!)
        resolve(nil)
    }
    
    /**
     Unregister the given device to receive push notifications.
     This will unset all of the push tokens saved to this people profile. This is useful
     in conjunction with a call to `reset`, or when a user is logging out.
     */
    @objc
    func clearAllPushRegistrationId(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.removeAllPushDeviceTokens()
        resolve(nil)
    }
    
    open class func getMixpanelInstance(_ token: String) -> MixpanelInstance? {
        if token.isEmpty {
            return nil
        }
        var instance = Mixpanel.getInstance(name: token)
        if instance == nil {
            instance = Mixpanel.initialize(token: token, instanceName: token)
        }
        return instance
    }
}
