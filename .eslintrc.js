module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'json',
  ],
  ecmaFeatures: {
    ecmascript: 7,
    jsx: true,
    modules: true
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    mocha: true,
  },
  globals: {expect: true},
  rules: {
    semi: [1, 'never'],
    'import/no-extraneous-dependencies': [1, 'never'],
    'no-console': ['error'],
    'max-len': ['error', {ignoreComments: true, code: 200}],
    'no-underscore-dangle': ['error', {allowAfterThis: true, allowAfterSuper: true}],
    // 'object-curly-spacing': [1, 'never']
    'arrow-parens': [2, 'as-needed'],
  },
}
