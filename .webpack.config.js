'use strict';
const resolve = require('path').resolve;
module.exports = {
  options: {
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /modules/,
        loader: 'babel-loader',
      }],
    },
    resolve: {
      alias: {
        'core-js': resolve(__dirname, './packages/core-js'),
        'core-js-pure': resolve(__dirname, './packages/core-js-pure'),
      },
    },
    node: {
      global: false,
      process: false,
      setImmediate: false,
    },
    stats: false,
    output: {
      path: resolve(__dirname, './tests/bundles'),
    },
  },
  helpers: {
    entry: './tests/helpers/qunit-helpers.js',
    output: { filename: 'qunit-helpers.js' },
  },
  pure: {
    entry: './tests/pure/index.js',
    output: { filename: 'pure.js' },
  },
  tests: {
    entry: './tests/tests/index.js',
    output: { filename: 'tests.js' },
  },
  'promises-aplus-tests': {
    entry: 'promises-aplus-tests/lib/testFiles.js',
    output: { filename: 'promises-aplus.js' },
  },
};
