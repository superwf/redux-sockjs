module.exports = {
  globals: {
    React: true,
  },
  parser: 'babel-eslint',
  plugins: [
    'babel',
    'react',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
}
