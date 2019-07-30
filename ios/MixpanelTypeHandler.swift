 import Foundation
 import Mixpanel
 
 class MixpanelTypeHandler {
    static func ToMixpanelType(_ object: Any) -> MixpanelType? {
        switch object {
        case let value as String:
            return value as MixpanelType
            
        case let value as Int:
            return value as MixpanelType
            
        case let value as UInt:
            return value as MixpanelType
            
        case let value as Double:
            return value as MixpanelType
            
        case let value as Float:
            return value as MixpanelType
            
        case let value as Bool:
            return value as MixpanelType
            
        case let value as Date:
            return value as MixpanelType
            
        case let value as MixpanelType:
            return value
            
        case let value as [MixpanelType]:
            return value
            
        case let value as [String: MixpanelType]:
            return value
            
        case let value as URL:
            return value
            
        case let value as NSNull:
            return value
            
        default:
            return nil
        }
    }
    
    static func processProperties(properties: Dictionary<String, Any>? = nil, includeLibInfo: Bool = false) -> Dictionary<String, MixpanelType> {
        var mpProperties = Dictionary<String, MixpanelType>()
        for (key,value) in properties ?? [:] {
            mpProperties[key] = ToMixpanelType(value)
        }
        if (includeLibInfo) {
            mpProperties["mp_lib"] = "react-native"
            mpProperties["$lib_version"] = "1.0.0"
        }
        return mpProperties
    }
 }
