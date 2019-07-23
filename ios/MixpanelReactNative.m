#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTConvert.h"

@interface RCT_EXTERN_MODULE(MixpanelReactNative, NSObject)
// MARK: - Mixpanel Instance

RCT_EXTERN_METHOD(getInstance: (NSString *)apiToken optOutTrackingByDefault: (BOOL)optOutTrackingByDefault resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

// MARK: - Opting Users Out of Tracking
RCT_EXTERN_METHOD(optOutTracking: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(hasOptedOutTracking: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(optInTracking: (NSString *)distinctId properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

// MARK: - Track Events

RCT_EXTERN_METHOD(track: (NSString *)event properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

// MARK: - Automatically Track Events
// MARK: - Sending Events
// MARK: - Timing Events

RCT_EXTERN_METHOD(timeEvent: (NSString *)event resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(clearTimedEvents: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(eventElapsedTime: (NSString *)event resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

// MARK: - Managing User Identity

RCT_EXTERN_METHOD(identify: (NSString *)distinctId resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(alias: (NSString *)alias distinctId: (NSString *)distinctId usePeople: (BOOL)usePeople resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(flush: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(reset: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

// MARK: - Super Properties
RCT_EXTERN_METHOD(registerSuperProperties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(registerSuperPropertiesOnce: (NSDictionary *)properties defaultValue: (NSString *)defaultValue  resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getSuperProperties: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(unregisterSuperProperty: (NSString *)propertyName properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(clearSuperProperties: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

// MARK: - Storing User Profiles

RCT_EXTERN_METHOD(set: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(setPropertyTo: (NSString *)property to: (id)to resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(setOnce: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(unset: (NSArray *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(increment: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(incrementPropertyBy: (NSString *)property by: (double)by resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(append: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(remove: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(union: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(trackCharge: (double)amount properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(clearCharges: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(deleteUser: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(setPushRegistrationId: (NSData *)deviceToken resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(clearPushRegistrationId: (NSData *)deviceToken resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(clearAllPushRegistrationId: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);
// MARK: - Registering for Push Notifications
// MARK: - Test Method


RCT_EXTERN_METHOD(getInformation: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);
@end


