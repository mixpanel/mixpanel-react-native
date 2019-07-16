#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MixpanelReactNative, NSObject)

RCT_EXTERN_METHOD(getInstance: (NSString *)apiToken optOutTrackingByDefault: (BOOL)optOutTrackingByDefault resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(optOutTracking: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(hasOptedOutTracking: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(optInTracking: (NSString *)distinctId properties: (NSDictionary *)properties resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getInformation: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);
@end
