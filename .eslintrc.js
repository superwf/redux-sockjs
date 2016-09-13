module.exports = {
  root: true,
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  parserOptions: {
    ecmascript: 7,
    jsx: true,
    modules: true
  },
  plugins: [
    'json',
  ],
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
  },
  globals: {expect: true},
  rules: {
    semi: [1, 'never'],
    'no-console': ['error'],
    'max-len': ['error', {ignoreComments: true, code: 200}],
    'no-underscore-dangle': ['error', {allowAfterThis: true, allowAfterSuper: true}],
    'arrow-parens': [2, 'as-needed'],
  },
}
