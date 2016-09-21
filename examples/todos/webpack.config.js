const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin')

module.exports = {
  entry: {
    index: './client.js',
  },
  output: {
    path: 'public',
    filename: '[name].js',
    publicPath: '/',
  },

  devtool: 'eval-source-map',

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['index'],
      filename: 'index.html',
      template: './index.html',
    }),
    new webpack.WatchIgnorePlugin([/node_modules/]),
    new webpack.SourceMapDevToolPlugin({
      exclude: /node_modules/,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new WebpackShellPlugin({
      onBuildStart: ['./node_modules/.bin/babel-node server.js'],
    })
  ],
  devServer: {
    hot: true,
    contentBase: './public/',
    inline: true,
    colors: true,
    host: '0.0.0.0',
    port: 3000,
  },
}
