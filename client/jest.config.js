/** @type {import('jest').Config} */
module.exports = {
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(test|integration).[jt]s?(x)"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testEnvironment: "jsdom",
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
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  verbose: true,
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    '^@/utils/env$': '<rootDir>/src/utils/__mocks__/env.ts',
    "^@/(.*)$": "<rootDir>/src/$1",
    "^hooks/(.*)$": "<rootDir>/hooks/$1",
  },
};
