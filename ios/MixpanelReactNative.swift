import Foundation
import Mixpanel
import UIKit

@objc(MixpanelReactNative)
class MixpanelReactNative: NSObject {
    private var mInstance: MixpanelInstance?;
    private var mToken: String = "";
    // MARK: - Mixpanel Instance
    
    /**
     Get the instance of MixpanelAPI with providing your project token
     and boolean value for opting out tracking,  default value for optOutTrackingDefault is
     false by setting it to true will prevent data from being collected by default
     This instance of MixpanelAPI you can use to send events and updates to Mixpanel.
     */
    
    @objc
    func getInstance(_ apiToken: String,
                     optOutTrackingByDefault: Bool = false,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        mToken = apiToken;
        mInstance = initialize(apiToken: apiToken,instanceName: apiToken,optOutTrackingByDefault: optOutTrackingByDefault);
        resolve(self);
    }
    
    func initialize(apiToken: String,
                    launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil,
                    flushInterval: Double = 60,
                    instanceName: String = UUID().uuidString,
                    automaticPushTracking: Bool = true,
                    optOutTrackingByDefault: Bool = false) -> MixpanelInstance {
        return Mixpanel.initialize(token: apiToken, launchOptions: launchOptions, flushInterval: flushInterval, instanceName: instanceName, automaticPushTracking: automaticPushTracking, optOutTrackingByDefault: optOutTrackingByDefault);
    }
    // MARK: - Opting Users Out of Tracking
    
    /**
     By calling this method user opted out from tracking and before calling this method
     call flush() if you want to send all the events or updates to Mixpanel otherwise it will be deleted.
     */
    @objc
    func optOutTracking(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.optOutTracking();
            resolve(Constants.OPT_OUT_SUCCESS);
        }
    }
    
    /**
     This method Will return true if the user has opted out from tracking.
     */
    @objc
    func hasOptedOutTracking(_ resolve: RCTPromiseResolveBlock,
                             rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            resolve(mInstance?.hasOptedOutTracking());
        }
    }
    
    /**
     Use this method to opt-in an already opted-out user from tracking.
     String to use as the distinct ID for events. This will call identify(String).
     Optional JSONObject that could be passed to add properties to the opt-in event that is sent to Mixpanel.
     People updates and track calls will be sent to Mixpanel after using this method.
     This method will internally track an opt-in event to your project.
     */
    @objc
    func optInTracking(_ distinctId: String?,
                       properties: NSDictionary?,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.optInTracking(distinctId: distinctId, properties: properties as? Properties);
            resolve(Constants.OPT_IN_SUCCESS);
        }
    }
    
    // MARK: - Test Method
    @objc
    func getInformation(_ resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        if(mInstance != nil){
            mInstance?.identify(distinctId: "1234abcd");
            mInstance?.people.set(property: "$name", to: "Gayatri Lokhnde");
            mInstance?.flush();
            let welcomeText = "IOS library invoked :: Mixpanel Demo app:: opt";
            resolve(welcomeText);
        }
        
    }
}
