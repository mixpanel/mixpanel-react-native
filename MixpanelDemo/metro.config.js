/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path')
const metro = require('metro')

module.exports = {
  resolver: {
    /**
     * Comment this out if used in a different app where the SDK is installed
     * locally (ie symbolink link to a relative dir) and you want to see live changes
     * from the library.
     * /
    // blacklistRE: metro.createBlacklist([
    //   /mixpanel-react-native\/MixpanelDemo\/node_modules\/.*/
    // ]),
    extraNodeModules: new Proxy({}, {
      get: (target, name) => path.join(process.cwd(), `node_modules/${name}`)
    }),
  },
  extraNodeModules: new Proxy({}, {
    get: (target, name) => path.join(process.cwd(), `node_modules/${name}`)
  }),
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [
    path.join(process.cwd(), '../'),
  ],
};
