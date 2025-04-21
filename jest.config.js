module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/test',
    '<rootDir>/lib',
    '<rootDir>/types'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/__tests__/Voice.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
    '!src/error/generated.ts'
  ]
}; 