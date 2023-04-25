import Foundation
import Mixpanel

class AutomaticProperties {
    static var peopleProperties: Dictionary<String, MixpanelType> = [:];
    private static let semaphore = DispatchSemaphore(value: 0)
    
    
    static func setAutomaticProperties(_ properties: [String: Any]) {
        semaphore.wait()
        for (key,value) in properties {
            peopleProperties[key] = MixpanelTypeHandler.mixpanelTypeValue(value)
        }
        semaphore.signal()
    }
}
