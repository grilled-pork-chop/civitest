module.exports = function (api) {
  // Cache must vary by env so the production-only console stripping below applies.
  api.cache.using(() => process.env.NODE_ENV);
  const isProd = api.env('production');
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Strip all console.* from release builds only.
      ...(isProd ? ['transform-remove-console'] : []),
      // react-native-worklets/plugin (Reanimated 4) must be listed last.
      'react-native-worklets/plugin',
    ],
  };
};
