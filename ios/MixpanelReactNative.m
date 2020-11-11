#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MixpanelReactNative, NSObject)
// MARK: - Mixpanel Instance

RCT_EXTERN_METHOD(initialize: (NSString *)token optOutTrackingByDefault: (BOOL)optOutTrackingByDefault properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

// MARK: - Opting Users Out of Tracking

RCT_EXTERN_METHOD(optOutTracking: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(hasOptedOutTracking: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(optInTracking: (NSString *)token distinctId: (NSString *)distinctId properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

// MARK: - Track Events

RCT_EXTERN_METHOD(track: (NSString *)token event: (NSString *)event properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)


// MARK: - Timing Events

RCT_EXTERN_METHOD(timeEvent: (NSString *)token event: (NSString *)event resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearTimedEvents: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(eventElapsedTime: (NSString *)token event: (NSString *)event resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

// MARK: - Managing User Identity

RCT_EXTERN_METHOD(identify: (NSString *)token distinctId: (NSString *)distinctId resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(alias: (NSString *)token alias: (NSString *)alias distinctId: (NSString *)distinctId resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(flush: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reset: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getDistinctId: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

// MARK: - Super Properties

RCT_EXTERN_METHOD(registerSuperProperties: (NSString *)token properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerSuperPropertiesOnce: (NSString *)token properties: (NSDictionary *)properties defaultValue: (NSString *)defaultValue  resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getSuperProperties: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(unregisterSuperProperty: (NSString *)token propertyName: (NSString *)propertyName resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearSuperProperties: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

// MARK: - Storing User Profiles

RCT_EXTERN_METHOD(set: (NSString *)token properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setOnce: (NSString *)token properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(unset: (NSString *)token propertyName: (NSString *)propertyName resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(increment: (NSString *)token properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(append: (NSString *)token properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(remove: (NSString *)token properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(union: (NSString *)token properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackCharge: (NSString *)token amount: (double)amount properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearCharges: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deleteUser: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setPushRegistrationId: (NSString *)token deviceToken: (NSString *)deviceToken resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearPushRegistrationId: (NSString *)token deviceToken: (NSString *)deviceToken resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearAllPushRegistrationId: (NSString *)token resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)
@end
