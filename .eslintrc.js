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
    // 'object-curly-spacing': [1, 'never']
  },
}
