import Foundation
import Mixpanel

class AutomaticProperties {
    static var peopleProperties: Dictionary<String, MixpanelType> = [:];
    
    static func setAutomaticProperties(_ properties: [String: Any]) {
        for (key,value) in properties {
            peopleProperties[key] = MixpanelTypeHandler.mixpanelTypeValue(value)
        }
    }
}
