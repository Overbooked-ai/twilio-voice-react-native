module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/test',
    '<rootDir>/lib',
    '<rootDir>/types'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/__tests__/Voice.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-*|@?expo(nent)?|@expo-google-fonts|@react-navigation))'
  ]
}; 