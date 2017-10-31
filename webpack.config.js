const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  resolveLoader: {
    alias: {
      'remove-hashbang-loader': path.join(__dirname, './loaders/remove-hashbang-loader')
    }
  },
  entry: slsw.lib.entries,
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.json',
      '.ts',
      '.tsx'
    ]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    loaders: [
      { test: /JSONStream\/index.js$/, loader: 'remove-hashbang-loader' },
      { test: /\.ts(x?)$/, loader: 'ts-loader' },
    ],
  },
};
