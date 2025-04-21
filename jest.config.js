module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/test',
    '<rootDir>/lib',
    '<rootDir>/types'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/Voice.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}; 