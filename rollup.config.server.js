/* eslint import/no-extraneous-dependencies: 0 */
import babel from 'rollup-plugin-babel'

const banner =
`/*
* sockjs for redux on server
* (c) 2016 by superwf
* Released under the MIT Liscense.
*/`

module.exports = {
  entry: './src/server/index.js',
  dest: './server.js',
  plugins: [babel()],
  format: 'cjs',
  moduleName: 'redux-sockjs',
  external: ['events', 'sockjs', 'http'],
  banner,
}
