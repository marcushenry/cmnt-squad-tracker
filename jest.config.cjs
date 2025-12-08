// jest.config.cjs or jest.config.js

module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(t|j)sx?$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleNameMapper: {
    // If you ever use @/ imports, this will map them correctly
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["<rootDir>/_tests_/**/*.test.(ts|tsx|js|jsx)"],
};
