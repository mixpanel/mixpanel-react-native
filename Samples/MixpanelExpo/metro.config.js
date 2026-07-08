const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the parent mixpanel-react-native package
config.watchFolders = [workspaceRoot];

// Ensure node_modules resolution works from both locations
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Prevent duplicate React Native instances
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
