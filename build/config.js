import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'server/index.js',
  format: 'es',
  plugins: [babel(), json()],
  dest: 'bundle.js',
  moduleName: 'redux-sockjs',
}
