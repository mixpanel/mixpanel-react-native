import Foundation
import Mixpanel
import UIKit

@objc(MixpanelReactNative)
class MixpanelReactNative: NSObject {
    private var mInstance: MixpanelInstance?;
    private var welcomeText = "IOS library invoked:: TSPL project";
    
    // MARK: - Mixpanel Instance
    @objc
    func initialize(_ apiToken: String,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        
        let mpInstance = initialize(apiToken);
        if(mpInstance != nil){
            self.mInstance = mpInstance;
        }
    }
    private func initialize(_ apiToken: String,
                            launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil,
                            flushInterval: Double = 60,
                            instanceName: String = UUID().uuidString,
                            automaticPushTracking: Bool = true,
                            optOutTrackingByDefault: Bool = true) -> MixpanelInstance? {
        
        return Mixpanel.initialize(token: apiToken, launchOptions: launchOptions, flushInterval: flushInterval, instanceName: instanceName, automaticPushTracking: automaticPushTracking, optOutTrackingByDefault: optOutTrackingByDefault);
    }
    
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
