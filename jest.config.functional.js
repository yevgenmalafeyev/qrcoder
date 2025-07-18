/** @type {import('jest').Config} */
module.exports = {
  displayName: 'Functional Tests',
  testMatch: ['<rootDir>/src/__tests__/functional/**/*.test.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.functional.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        target: 'es2019',
        module: 'commonjs',
        lib: ['es2019', 'dom'],
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 60000, // 60 seconds per test
  maxWorkers: 1, // Run tests sequentially to avoid conflicts
  verbose: true,
  collectCoverage: false, // Disable coverage for functional tests
  bail: false, // Continue running tests even if some fail
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports',
      filename: 'functional-tests.html',
      expand: true,
    }],
  ],
}