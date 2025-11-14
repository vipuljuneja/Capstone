const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    // Block Metro from watching temp-videos directories
    blockList: [
      /.*\/temp-videos\/.*/,
      /.*\/backend\/temp-videos\/.*/,
    ],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

module.exports = mergeConfig(defaultConfig, config);
