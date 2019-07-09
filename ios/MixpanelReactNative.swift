import Foundation

@objc(MixpanelReactNative)
class MixpanelReactNative: NSObject {
    
    @objc
    func getInformation(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        let welcomeText = "IOS library invoked: new Demo app";
        
        resolve(welcomeText);
    }
}

