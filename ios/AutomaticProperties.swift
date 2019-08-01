import Foundation
import Mixpanel

class AutomaticProperties {
    static var peopleProperties: Dictionary<String, MixpanelType> = {
        var p = Dictionary<String, MixpanelType>()
        p[LibraryMetadata.MP_LIB_KEY] = LibraryMetadata.MP_LIB_VALUE
        p[LibraryMetadata.VERSION_KEY] = LibraryMetadata.VERSION_VALUE
        return p
    }()
}
