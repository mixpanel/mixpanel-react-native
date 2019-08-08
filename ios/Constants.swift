struct Constants {
    static let ERROR = "ERROR: "
    static let INSTANCE_NOT_FOUND_ERROR  = "You have to call `getInstance(token)` before calling methods on Mixpanel Instance"
    static let LIBRARY_INVOKED  = "iOS library invoked successfully"
}

struct LibraryMetadata {
    static let MP_LIB_KEY = "mp_lib"
    static let VERSION_KEY = "$lib_version"
    static let MP_LIB_VALUE = "react-native"
    static let VERSION_VALUE = "1.0.0"
}
