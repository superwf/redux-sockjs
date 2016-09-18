/* eslint import/no-extraneous-dependencies: 0 */
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'

const banner =
`/*
* sockjs for redux on both server and browser
* (c) 2016 by superwf
* Released under the MIT Liscense.
*/`

module.exports = {
  entry: './client/index.js',
  dest: './build/browser.js',
  plugins: [babel(), json()],
  format: 'cjs',
  moduleName: 'redux-sockjs',
  banner,
}
