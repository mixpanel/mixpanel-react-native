const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for MixpanelStarter
 * Configured to work with the parent mixpanel-react-native package via symlink
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Path to the parent mixpanel-react-native package
const parentPackage = path.resolve(__dirname, '../..');

const config = {
  watchFolders: [
    __dirname,
    parentPackage, // Watch the parent package for changes
  ],
  resolver: {
    // Prevent multiple copies of React Native
    blockList: [
      // Exclude node_modules from parent package to prevent conflicts
      new RegExp(`${parentPackage.replace(/[/\\]/g, '[/\\\\]')}/node_modules/.*`),
    ],
    extraNodeModules: {
      // Ensure react-native and other deps resolve from sample app's node_modules
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'node_modules/@react-native-async-storage/async-storage'),
      'react-native-get-random-values': path.resolve(__dirname, 'node_modules/react-native-get-random-values'),
      'uuid': path.resolve(__dirname, 'node_modules/uuid'),
      // Resolve mixpanel-react-native to parent package
      'mixpanel-react-native': parentPackage,
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(parentPackage, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
