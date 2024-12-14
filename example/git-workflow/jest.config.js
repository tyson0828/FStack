module.exports = {
  // Automatically clear mock calls, instances, and results before every test
  clearMocks: true,

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // A set of global variables that need to be available in all test environments
  globals: {},

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Automatically reset mock state before every test
  resetMocks: true,

  // Automatically restore mock state and implementation before every test
  restoreMocks: true,

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.js?(x)",
    "**/?(*.)+(spec|test).js?(x)",
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "json", "jsx", "node"],
};

