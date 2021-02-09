'use strict';
const { resolve } = require('path');

module.exports = {
  mode: 'none',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    }],
  },
  node: false,
  target: ['node', 'es5'],
  stats: 'errors-warnings',
  output: {
    path: resolve(__dirname, './tests/bundles'),
  },
};
