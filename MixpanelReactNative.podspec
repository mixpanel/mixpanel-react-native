require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "MixpanelReactNative"
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platform     = :ios, "8.0"
  # TODO: Change the git URL before publishing on npm
  s.source       = { :git => "https://github.com/author/MixpanelReactNative.git", :tag => s.version }
  s.source_files  = "ios/*.{swift,h,m}"
  s.requires_arc = true
  s.preserve_paths = 'LICENSE', 'README.md', 'package.json', 'index.js'
  s.dependency "React"
  s.dependency "Mixpanel-swift", '~> 2.6.3'
end
