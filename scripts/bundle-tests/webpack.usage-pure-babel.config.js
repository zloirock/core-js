'use strict';
const { resolve } = require('node:path');
const baseConfig = require('./webpack.config');
const babelConfig = require('../../babel.config');

const e2eUsagePure = resolve(__dirname, '../../tests/e2e-usage-pure');

module.exports = {
  ...baseConfig,
  resolve: {
    // extension-less `import './x'` in the generated index must also find `.ts` e2e files
    extensions: ['.js', '.ts', '.json'],
  },
  module: {
    rules: [{
      // test files — apply usage-pure plugin + standard transforms; `.ts` files run the plugin
      // against the TYPED AST first (type-driven dispatch is the point of the TS e2e leg), then
      // strip types before the standard ES transforms
      test: /\.(?:js|ts)$/,
      include: e2eUsagePure,
      use: {
        loader: 'babel-loader',
        options: {
          ...babelConfig,
          plugins: [
            ['@core-js', {
              method: 'usage-pure',
              mode: 'full',
              targets: 'IE 11, Chrome>=38, Safari>=7.1, FF>=15',
            }],
            ['@babel/plugin-transform-typescript'],
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
      // everything else — standard transforms only, no polyfill injection. webpack rules are
      // CUMULATIVE: without the suite dir in exclude, its `.js` files would ALSO pass through
      // this rule — and FIRST, lowering spread/for-of under the base `iterableIsArray: true`
      // before the e2e rule's proper-iteration overrides ever see the code. the field override
      // replaces the base exclude wholesale, so `/node_modules/` is restated alongside
      ...baseConfig.module.rules[0],
      exclude: [/node_modules/, e2eUsagePure],
    }],
  },
};
