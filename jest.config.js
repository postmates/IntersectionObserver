module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testMatch: ['**/tests/**/*.ts?(x)'],
  roots: ["<rootDir>"],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.jest.json"
    }
  },
  setupTestFrameworkScriptFile: './setupTests.ts',
};
