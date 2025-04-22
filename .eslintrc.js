module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        quoteProps: 'consistent',
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        useTabs: false
      }
    ]
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended'
      ]
    }
  ]
}; 