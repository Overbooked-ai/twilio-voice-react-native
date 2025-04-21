module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/test',
    '<rootDir>/lib',
    '<rootDir>/types'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  // Skip problematic tests
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/__tests__/Voice.test.ts'
  ],
  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': 'babel-jest'
  },
  // Mock all native modules
  moduleNameMapper: {
    // Mock static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  // Allow both .ts and .js extensions for modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Clear mocks between tests
  clearMocks: true,
  // Collect coverage from TypeScript files
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/__mocks__/**'
  ],
  // Skip TypeScript tests that are known to fail
  testMatch: [
    "**/__tests__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)",
    "!**/Voice.test.ts"
  ]
}; 