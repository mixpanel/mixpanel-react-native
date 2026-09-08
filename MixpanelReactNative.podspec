require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = "MixpanelReactNative"
  s.version = package['version']
  s.summary = package['description']
  s.description = package['description']
  s.license = package['license']
  s.author = { 'Mixpanel, Inc' => 'support@mixpanel.com' }
  s.homepage = package['homepage']
  s.platform = :ios, "12.0"
  s.swift_version = '5.0'
  s.source = { :git => "https://github.com/mixpanel/mixpanel-react-native.git", :tag => s.version }
  s.source_files = "ios/*.{swift,h,m}"
  s.requires_arc = true
  s.preserve_paths = 'LICENSE', 'README.md', 'package.json', 'index.js'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }

  s.dependency "React-Core"
  # 6.6.1 is the first release that resolves a React Native `nativeID` into `$el_id`.
  # 6.6.0 shipped autocapture but not that fix, so it is deliberately excluded.
  s.dependency "Mixpanel-swift", '>= 6.6.1', '< 7.0'
end
