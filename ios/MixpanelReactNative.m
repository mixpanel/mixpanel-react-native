#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTConvert.h"

@interface RCT_EXTERN_MODULE(MixpanelReactNative, NSObject)

RCT_EXTERN_METHOD(getInstance: (NSString *)apiToken optOutTrackingByDefault: (BOOL)optOutTrackingByDefault resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(optOutTracking: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(hasOptedOutTracking: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(optInTracking: (NSString *)distinctId properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(timeEvent: (NSString *)event resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(clearTimedEvents: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(identify: (NSString *)distinctId resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(alias: (NSString *)alias distinctId: (NSString *)distinctId usePeople: (BOOL)usePeople resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(flush: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getInformation: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);
@end
