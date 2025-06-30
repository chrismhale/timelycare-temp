/** @type {import('jest').Config} */
module.exports = {
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(test|integration).[jt]s?(x)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  coverageThreshold: {
	global: {
		branches: 90,
		functions: 90,
		lines: 90,
		statements: 90,
	}
  },
  verbose: true,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
};
