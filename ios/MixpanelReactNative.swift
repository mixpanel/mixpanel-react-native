import Foundation
import Mixpanel

@objc(MixpanelReactNative)
class MixpanelReactNative: NSObject {
    
    @objc
    func getInformation(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        Mixpanel.initialize(token: "bb71c6d97ef1bde11ffe83037a388b57");
        Mixpanel.mainInstance().identify(distinctId: "12345678");
        Mixpanel.mainInstance().people.set(property: "$name", to: "Gayatri Lokhande")
        Mixpanel.mainInstance().flush();
        let welcomeText = "IOS library invoked :: Mixpanel Demo app";
        resolve(welcomeText);
    }
}

