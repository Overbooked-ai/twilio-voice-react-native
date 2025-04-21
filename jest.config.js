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
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*)/)'
  ],
  setupFiles: [
    '<rootDir>/jest.setup.js'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/error/generated.ts',
    '!src/__tests__/**/*'
  ]
}; 