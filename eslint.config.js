// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Generated, native, and build output + Node-only asset scripts
    // (scripts/gen-icon.mjs uses a no-save `sharp` dep and Node globals).
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*', 'scripts/*'],
  },
]);
