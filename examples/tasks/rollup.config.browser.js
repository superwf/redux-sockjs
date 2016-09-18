// import babel from 'rollup-plugin-babel'

module.exports = {
  entry: './client.es',
  dest: './public/index.js',
  // plugins: [babel()],
  format: 'umd',
}
