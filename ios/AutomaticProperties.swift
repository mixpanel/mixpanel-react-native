import Foundation
import Mixpanel

class AutomaticProperties {
    static var peopleProperties: Dictionary<String, MixpanelType> = [:];
    
    /**
     Set automatic properties
     */
    static func setAutomaticProperties(_ properties: [String: Any]) {
        for (key,value) in properties {
            peopleProperties[key] = MixpanelTypeHandler.ToMixpanelType(value)
        }
    }
}
