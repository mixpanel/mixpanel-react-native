#import <Foundation/Foundation.h>

#import "React/RCTBridgeModule.h"
@interface RCT_EXTERN_MODULE(MixpanelReactNative, NSObject)
RCT_EXTERN_METHOD(initialize: (NSString *)apiToken resolver: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getInformation: (RCTPromiseResolveBlock)resolve rejecter: (RCTPromiseRejectBlock)reject)
@end
