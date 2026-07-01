import Foundation
import Mixpanel
import UIKit

@objc(MixpanelReactNative)
open class MixpanelReactNative: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    // MARK: - Mixpanel Instance

    @objc
    func initialize(_ token: String,
                    trackAutomaticEvents: Bool,
                    optOutTrackingByDefault: Bool = false,
                    properties: [String: Any],
                    serverURL: String,
                    useGzipCompression: Bool = false,
                    featureFlagsOptions: [String: Any]?,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let autoProps = properties // copy
        AutomaticProperties.setAutomaticProperties(autoProps)
        let propsProcessed = MixpanelTypeHandler.processProperties(properties: autoProps)

        var resolvedFeatureFlagOptions: FeatureFlagOptions? = nil
        if let flagsOptions = featureFlagsOptions,
           let enabled = flagsOptions["enabled"] as? Bool, enabled {
            let context = flagsOptions["context"] as? [String: Any] ?? [:]
            let policy = parseVariantLookupPolicy(flagsOptions["persistence"] as? [String: Any])
            resolvedFeatureFlagOptions = FeatureFlagOptions(
                enabled: true,
                context: context,
                variantLookupPolicy: policy
            )
        }

        let options = MixpanelOptions(
            token: token,
            flushInterval: Constants.DEFAULT_FLUSH_INTERVAL,
            instanceName: token,
            trackAutomaticEvents: trackAutomaticEvents,
            optOutTrackingByDefault: optOutTrackingByDefault,
            useUniqueDistinctId: false,
            superProperties: propsProcessed,
            serverURL: serverURL,
            proxyServerConfig: nil,
            useGzipCompression: useGzipCompression,
            featureFlagOptions: resolvedFeatureFlagOptions
        )

        Mixpanel.initialize(options: options)
        resolve(true)
    }

    private func parseVariantLookupPolicy(_ policyMap: [String: Any]?) -> VariantLookupPolicy {
        guard let policyMap = policyMap, let kind = policyMap["variantLookupPolicy"] as? String else {
            return .networkOnly
        }
        switch kind {
        case "networkOnly":
            return .networkOnly
        case "persistenceUntilNetworkSuccess":
            return .persistenceUntilNetworkSuccess(persistenceTtl: readPersistenceTtlSeconds(policyMap))
        case "networkFirst":
            return .networkFirst(persistenceTtl: readPersistenceTtlSeconds(policyMap))
        default:
            NSLog("[Mixpanel] Unknown variantLookupPolicy '\(kind)', falling back to networkOnly")
            return .networkOnly
        }
    }

    private func readPersistenceTtlSeconds(_ policyMap: [String: Any]) -> TimeInterval {
        if let millis = policyMap["persistenceTtlMs"] as? NSNumber {
            return TimeInterval(truncating: millis) / 1000.0
        }
        return 24 * 60 * 60
    }

    @objc
    func setServerURL(_ token: String,
                    serverURL: String,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.serverURL = serverURL
        resolve(nil)
    }

    @objc
    func setLoggingEnabled(_ token: String,
                    loggingEnabled: Bool,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.loggingEnabled = loggingEnabled
        resolve(nil)
    }

    @objc
    func setFlushOnBackground(_ token: String,
                    flushOnBackground: Bool,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.flushOnBackground = flushOnBackground
        resolve(nil)
    }

    @objc
    func setFlushBatchSize(_ token: String,
                    flushBatchSize: Int,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.flushBatchSize = flushBatchSize
        resolve(nil)
    }

    @objc
    func setUseIpAddressForGeolocation(_ token: String,
                    useIpAddressForGeolocation: Bool,
                    resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.useIPAddressForGeoLocation = useIpAddressForGeolocation
        resolve(nil)
    }

    // MARK: - Opting Users Out of Tracking

    @objc
    func optOutTracking(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                        rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.optOutTracking()
        resolve(nil)
    }

    @objc
    func hasOptedOutTracking(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                             rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.hasOptedOutTracking())
    }

    @objc
    func optInTracking(_ token: String,
                       resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.optInTracking()
        resolve(nil)
    }

    // MARK: - Track Events

    @objc
    func track(_ token: String, event: String?,
               properties: [String: Any]? = nil,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        let mpProperties = MixpanelTypeHandler.processProperties(properties: properties)
        instance?.track(event: event, properties: mpProperties)
        resolve(nil)
    }

    // MARK: - Timing Events

    @objc
    func timeEvent(_ token: String, event: String,
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.time(event: event)
        resolve(nil)
    }

    @objc
    func eventElapsedTime(_ token: String, event: String,
                          resolver resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.eventElapsedTime(event: event))
    }

    // MARK: - Managing User Identity

    @objc
    func identify(_ token: String, distinctId: String,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.identify(distinctId: distinctId) {
            resolve(nil)
        }
    }

    @objc
    func alias(_ token: String, alias: String,
               distinctId: String,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.createAlias(alias, distinctId: distinctId)
        resolve(nil)
    }

    @objc
    func flush(_ token: String, resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.flush()
        resolve(nil)
    }

    @objc
    func reset(_ token: String, resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.reset()
        resolve(nil)
    }

    @objc
    func getDistinctId(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.distinctId)
    }

    @objc
    func getDeviceId(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.anonymousId)
    }

    // MARK: - Super Properties

    @objc
    func registerSuperProperties(_ token: String, properties: [String: Any],
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.registerSuperProperties(MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func registerSuperPropertiesOnce(_ token: String, properties: [String: Any],
                                     resolver resolve: RCTPromiseResolveBlock,
                                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.registerSuperPropertiesOnce(MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func getSuperProperties(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        resolve(instance?.currentSuperProperties())
    }

    @objc
    func unregisterSuperProperty(_ token: String, propertyName: String,
                                 resolver resolve: RCTPromiseResolveBlock,
                                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.unregisterSuperProperty(propertyName)
        resolve(nil)
    }

    @objc
    func clearSuperProperties(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.clearSuperProperties()
        resolve(nil)
    }

    // MARK: - People

    @objc
    func set(_ token: String, properties: [String: Any],
             resolver resolve: RCTPromiseResolveBlock,
             rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.set(properties: MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true))
        resolve(nil)
    }

    @objc
    func setOnce(_ token: String, properties: [String: Any],
                 resolver resolve: RCTPromiseResolveBlock,
                 rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.setOnce(properties: MixpanelTypeHandler.processProperties(properties: properties, includeLibInfo: true))
        resolve(nil)
    }

    @objc
    func unset(_ token: String, propertyName: String,
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.unset(properties: [propertyName])
        resolve(nil)
    }

    @objc
    func increment(_ token: String, properties: [String: Any],
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.increment(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func append(_ token: String, properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.append(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func remove(_ token: String, properties: [String: Any],
                resolver resolve: RCTPromiseResolveBlock,
                rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.remove(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func union(_ token: String, properties: [String: Any],
               resolver resolve: RCTPromiseResolveBlock,
               rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.union(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func trackCharge(_ token: String, amount: Double,
                     properties: [String: Any]? = nil,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.trackCharge(amount: amount, properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func clearCharges(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.clearCharges()
        resolve(nil)
    }

    @objc
    func deleteUser(_ token: String, resolver resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.people.deleteUser()
        resolve(nil)
    }

    // MARK: - Group
    @objc
    func trackWithGroups(_ token: String, event: String, properties: [String: Any]? = nil,
                         groups: [String: Any]? = nil,
                         resolver resolve: RCTPromiseResolveBlock,
                         rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        let mpProperties = MixpanelTypeHandler.processProperties(properties: properties)
        var mpGroups = Dictionary<String, MixpanelType>()
        for (key,value) in groups ?? [:] {
            mpGroups[key] = MixpanelTypeHandler.mixpanelTypeValue(value)
        }
        instance?.trackWithGroups(event: event, properties: mpProperties, groups: mpGroups)
        resolve(nil)
    }

    @objc
    func setGroup(_ token: String, groupKey: String, groupID: Any,
                  resolver resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        if groupID is Array<Any> {
            instance?.setGroup(groupKey: groupKey, groupIDs:MixpanelTypeHandler.mixpanelTypeValue(groupID)! as! [MixpanelType])
        } else {
            instance?.setGroup(groupKey: groupKey, groupID:MixpanelTypeHandler.mixpanelTypeValue(groupID)!)
        }
        resolve(nil)
    }

    @objc
    func addGroup(_ token: String, groupKey: String, groupID: Any,
                  resolver resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.addGroup(groupKey: groupKey, groupID: MixpanelTypeHandler.mixpanelTypeValue(groupID)!)
        resolve(nil)
    }

    @objc
    func removeGroup(_ token: String, groupKey: String, groupID: Any,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        let instance = MixpanelReactNative.getMixpanelInstance(token)
        instance?.removeGroup(groupKey: groupKey, groupID: MixpanelTypeHandler.mixpanelTypeValue(groupID)!)
        resolve(nil)
    }

    func mixpanelGroup(_ token: String, groupKey: String, groupID: Any) -> Group? {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token) else {
            return nil
        }

        guard let mixpanelTypeGroupID = MixpanelTypeHandler.mixpanelTypeValue(groupID) else {
            return nil
        }

        return instance.getGroup(groupKey: groupKey, groupID: mixpanelTypeGroupID)
    }

    @objc
    func deleteGroup(_ token: String, groupKey: String, groupID: Any,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) -> Void {
        let group = mixpanelGroup(token, groupKey: groupKey, groupID: groupID)
        group?.deleteGroup()
        resolve(nil)
    }

    @objc
    func groupSetProperties(_ token: String, groupKey: String, groupID: Any,
                            properties: [String: Any],
                            resolver resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) -> Void {
        let group = mixpanelGroup(token, groupKey: groupKey, groupID: groupID)
        group?.set(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func groupSetPropertyOnce(_ token: String, groupKey: String, groupID: Any,
                              properties: [String: Any],
                              resolver resolve: RCTPromiseResolveBlock,
                              rejecter reject: RCTPromiseRejectBlock) -> Void {
        let group = mixpanelGroup(token, groupKey: groupKey, groupID: groupID)
        group?.setOnce(properties: MixpanelTypeHandler.processProperties(properties: properties))
        resolve(nil)
    }

    @objc
    func groupUnsetProperty(_ token: String, groupKey: String, groupID: Any,
                            propertyName: String,
                            resolver resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) -> Void {
        if let group = mixpanelGroup(token, groupKey: groupKey, groupID: groupID) {
            group.unset(property: propertyName)
        }
        resolve(nil)
    }

    @objc
    func groupRemovePropertyValue(_ token: String, groupKey: String, groupID: Any,
                                  name: String,
                                  value: Any,
                                  resolver resolve: RCTPromiseResolveBlock,
                                  rejecter reject: RCTPromiseRejectBlock) -> Void {
        if let group = mixpanelGroup(token, groupKey: groupKey, groupID: groupID) {
            guard let mixpanelTypeValue = MixpanelTypeHandler.mixpanelTypeValue(value) else {
                resolve(nil)
                return
            }
            group.remove(key: name, value: mixpanelTypeValue)
        }
        resolve(nil)
    }

    @objc
    func groupUnionProperty(_ token: String, groupKey: String, groupID: Any,
                            name: String,
                            values: [Any],
                            resolver resolve: RCTPromiseResolveBlock,
                            rejecter reject: RCTPromiseRejectBlock) -> Void {
        if let group = mixpanelGroup(token, groupKey: groupKey, groupID: groupID) {
            group.union(key: name, values: values.map() { MixpanelTypeHandler.mixpanelTypeValue($0)! })
        }
        resolve(nil)
    }

    open class func getMixpanelInstance(_ token: String) -> MixpanelInstance? {
        if token.isEmpty {
            return nil
        }
        return Mixpanel.getInstance(name: token)
    }

    // MARK: - Feature Flags

    @objc
    func loadFlags(_ token: String,
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) -> Void {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            resolve(nil)
            return
        }
        flags.loadFlags()
        resolve(nil)
    }

    @objc
    func areFlagsReadySync(_ token: String) -> NSNumber {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token) else {
            NSLog("[Mixpanel - areFlagsReadySync: instance is nil for token: \(token)]")
            return NSNumber(value: false)
        }

        guard let flags = instance.flags else {
            NSLog("[Mixpanel - areFlagsReadySync: flags is nil")
            return NSNumber(value: false)
        }

        let ready = flags.areFlagsReady()
        NSLog("[Mixpanel - areFlagsReadySync: flags ready = \(ready)")
        return NSNumber(value: ready)
    }

    @objc
    func getVariantSync(_ token: String,
                        featureName: String,
                        fallback: [String: Any]) -> [String: Any] {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            return fallback
        }

        let fallbackVariant = convertDictToVariant(fallback)
        let variant = flags.getVariantSync(featureName, fallback: fallbackVariant)
        return convertVariantToDict(variant)
    }

    @objc
    func getVariantValueSync(_ token: String,
                             featureName: String,
                             fallbackValue: Any) -> Any {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            return fallbackValue
        }

        return flags.getVariantValueSync(featureName, fallbackValue: fallbackValue) ?? fallbackValue
    }

    @objc
    func isEnabledSync(_ token: String,
                       featureName: String,
                       fallbackValue: Bool) -> NSNumber {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            return NSNumber(value: fallbackValue)
        }

        let enabled = flags.isEnabledSync(featureName, fallbackValue: fallbackValue)
        return NSNumber(value: enabled)
    }

    @objc
    func getVariant(_ token: String,
                    featureName: String,
                    fallback: [String: Any],
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            resolve(fallback)
            return
        }

        let fallbackVariant = convertDictToVariant(fallback)
        flags.getVariant(featureName, fallback: fallbackVariant) { variant in
            resolve(self.convertVariantToDict(variant))
        }
    }

    @objc
    func getVariantValue(_ token: String,
                         featureName: String,
                         fallbackValue: Any,
                         resolver resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            resolve(fallbackValue)
            return
        }

        flags.getVariantValue(featureName, fallbackValue: fallbackValue) { value in
            resolve(value)
        }
    }

    @objc
    func isEnabled(_ token: String,
                   featureName: String,
                   fallbackValue: Bool,
                   resolver resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            resolve(fallbackValue)
            return
        }

        flags.isEnabled(featureName, fallbackValue: fallbackValue) { isEnabled in
            resolve(isEnabled)
        }
    }

    // MARK: - Feature Flags (getAllVariants / updateFlagsContext)

    @objc
    func getAllVariants(_ token: String,
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            resolve([String: Any]())
            return
        }
        flags.getAllVariants { variants in
            var out = [String: [String: Any]]()
            for (key, variant) in variants {
                out[key] = self.convertVariantToDict(variant)
            }
            resolve(out)
        }
    }

    @objc
    func getAllVariantsSync(_ token: String) -> [String: [String: Any]] {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            return [:]
        }
        let variants = flags.getAllVariantsSync()
        var out = [String: [String: Any]]()
        for (key, variant) in variants {
            out[key] = self.convertVariantToDict(variant)
        }
        return out
    }

    @objc
    func updateFlagsContext(_ token: String,
                            context: [String: Any],
                            resolver resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard let instance = MixpanelReactNative.getMixpanelInstance(token),
              let flags = instance.flags else {
            resolve(nil)
            return
        }
        flags.setContext(context) {
            resolve(nil)
        }
    }

    // MARK: - Variant conversion

    private func convertDictToVariant(_ dict: [String: Any]) -> MixpanelFlagVariant {
        let key = dict["key"] as? String ?? ""
        let value = dict["value"] ?? NSNull()
        let experimentID = dict["experiment_id"] as? String
        let isExperimentActive = dict["is_experiment_active"] as? Bool
        let isQATester = dict["is_qa_tester"] as? Bool
        return MixpanelFlagVariant(
            key: key,
            value: value,
            isExperimentActive: isExperimentActive,
            isQATester: isQATester,
            experimentID: experimentID
        )
    }

    private func convertVariantToDict(_ variant: MixpanelFlagVariant) -> [String: Any] {
        var dict: [String: Any] = [
            "key": variant.key,
            "value": variant.value ?? NSNull()
        ]

        if let experimentID = variant.experimentID {
            dict["experiment_id"] = experimentID
        }
        if let isExperimentActive = variant.isExperimentActive {
            dict["is_experiment_active"] = isExperimentActive
        }
        if let isQATester = variant.isQATester {
            dict["is_qa_tester"] = isQATester
        }

        switch variant.source {
        case .network:
            dict["variant_source"] = "network"
        case .persistence(let persistedAt):
            dict["variant_source"] = "persistence"
            dict["persisted_at_in_ms"] = Int64(persistedAt.timeIntervalSince1970 * 1000)
        case .fallback(let reason):
            dict["variant_source"] = "fallback"
            switch reason {
            case .flagNotFound: dict["fallback_reason"] = "FLAG_NOT_FOUND"
            case .notReady:     dict["fallback_reason"] = "NOT_READY"
            case .backendError: dict["fallback_reason"] = "BACKEND_ERROR"
            }
        }

        return dict
    }

}
