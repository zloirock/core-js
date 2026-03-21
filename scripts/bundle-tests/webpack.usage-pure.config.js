'use strict';
const { resolve } = require('node:path');
const baseConfig = require('./webpack.config');
const babelConfig = require('../../babel.config');

const e2eUsagePure = resolve(__dirname, '../../tests/e2e-usage-pure');

module.exports = {
  ...baseConfig,
  module: {
    rules: [{
      // test files — apply usage-pure plugin + standard transforms
      test: /\.js$/,
      include: e2eUsagePure,
      use: {
        loader: 'babel-loader',
        options: {
          ...babelConfig,
          plugins: [
            ['@core-js', { method: 'usage-pure', version: '4.0', mode: 'full' }],
            ...babelConfig.plugins,
          ],
          assumptions: {
            ...babelConfig.assumptions,
            // e2e tests need proper Symbol.iterator usage for for-of/spread/destructuring
            iterableIsArray: false,
            skipForOfIteratorClosing: false,
          },
        },
      },
    }, {
      // everything else — standard transforms only, no polyfill injection
      ...baseConfig.module.rules[0],
      exclude: [/node_modules/, e2eUsagePure],
    }],
  },
};
