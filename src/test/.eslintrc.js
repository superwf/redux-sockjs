module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  parserOptions: {
    ecmascript: 7,
    jsx: true,
    modules: true
  },
  plugins: [
    'babel',
    'json',
  ],
  // ecmaFeatures: {
  // },
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
  },
  globals: {expect: true},
  rules: {
    semi: [1, 'never'],
    'import/no-extraneous-dependencies': 0,
    'no-console': 0,
    'max-len': ['error', {ignoreComments: true, code: 200}],
    'no-underscore-dangle': 0,
    'arrow-parens': [0, 'as-needed'],
    'babel/arrow-parens': 0,
    'babel/arrow-parens': 0,
  },
}
