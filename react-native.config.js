module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    'react-native-sound': {
      platforms: {
        android: null, // Disable autolinking to avoid New Architecture codegen issues
      },
    },
  },
};
