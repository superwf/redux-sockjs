/* eslint import/no-extraneous-dependencies: 0 */
import babel from 'rollup-plugin-babel'

const banner =
`/*
* sockjs for redux on browser
* (c) 2016 by superwf
* Released under the MIT Liscense.
*/`

module.exports = {
  entry: './src/client/index.js',
  dest: './client.js',
  plugins: [babel()],
  format: 'cjs',
  moduleName: 'redux-sockjs',
  external: ['events', 'sockjs-client', 'uuid'],
  banner,
}
