'use strict';
const { resolve } = require('node:path');
const babelConfig = require('../../babel.config');

module.exports = {
  mode: 'none',
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /node_modules/,
      // Babel lowers modules to CommonJS, including explicitly named ESM inputs.
      type: 'javascript/auto',
      use: {
        loader: 'babel-loader',
        options: babelConfig,
      },
    }],
  },
  node: false,
  target: ['node', 'es5'],
  stats: 'errors-warnings',
  output: {
    hashFunction: 'md5',
    path: resolve(__dirname, '../../tests/bundles'),
  },
};
