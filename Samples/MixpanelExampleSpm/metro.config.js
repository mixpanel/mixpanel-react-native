const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '../..');

// The library resolves to the repo root, whose node_modules has its own react and
// react-native from the library's dev dependencies. Hide those so the library's imports
// fall through to the sample's copies; otherwise the bundle holds two React Natives.
const sampleOnly = ['react', 'react-native'];
const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    root, // Watch the root mixpanel-react-native directory
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],
    blockList: sampleOnly.map(
      name =>
        new RegExp(`^${escapeRegExp(path.join(root, 'node_modules', name))}[/\\\\]`),
    ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
