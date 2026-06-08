/** Jest config: pure-logic unit tests run under the jest-expo preset so that
 *  Expo/React Native module imports resolve and transform correctly. */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Only our own tests; skip the vendored skill packs under .agents/.claude.
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
};
