// Config factory for the e2e-usage-pure unplugin legs: the REAL `@core-js/unplugin` webpack
// adapter transforms the suite instead of the `@core-js` babel plugin, while babel-loader keeps
// the TS strip + ES lowering. The adapter applies to the whole module graph (production-shaped,
// `isCoreJSFile` guards the pure sources), so unlike the babel leg the helpers are transformed too.
// `phase` decides where the transform runs relative to babel-loader via webpack `enforce`:
// 'pre+post' straddles it (detection on typed source, emission on lowered text), the default
// single 'pre' completes before it.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import coreJSPlugin from '@core-js/unplugin/webpack';

const require = createRequire(import.meta.url);
const webpack = require('webpack');
const baseConfig = require('./webpack.config.js');
const babelConfig = require('../../babel.config.js');

const e2eUsagePure = resolve(import.meta.dirname, '../../tests/e2e-usage-pure');

export default function buildConfig(phase) {
  return {
    ...baseConfig,
    resolve: {
      // extension-less `import './x'` in the generated index must also find `.ts` e2e files
      extensions: ['.js', '.ts', '.json'],
    },
    plugins: [
      coreJSPlugin({
        method: 'usage-pure',
        mode: 'full',
        // same targets as the babel leg so the injected set stays comparable
        targets: 'IE 11, Chrome>=38, Safari>=7.1, FF>=15',
        // babel-loader lowers every test file to CJS AFTER our transform, so the injected
        // specifiers should be `require` too. left to auto-detection the `post` / `pre+post`
        // passes inject ESM `import` into already-lowered CJS text (most side-effect test
        // modules carry no top-level `exports` write for `detectCommonJS` to key on), which
        // forces webpack's harmony-interop codegen onto every injection site - ~380KB of
        // `__WEBPACK_IMPORTED_MODULE_n___default()` wrappers in the post bundle alone
        importStyle: 'require',
        ...phase ? { phase } : {},
      }),
      // phase-conditional test-expectation flags; legs without a flag leave the identifier
      // undefined and the in-test `typeof` guards hold:
      // - E2E_POST_LOWERED ('pre+post' AND 'post'): EMISSION lands on babel-lowered text, so
      //   the post pass soundly polyfills plain member reads that single-pass shape-bails protect
      // - E2E_DETECT_LOWERED ('post' only): DETECTION also ran on the lowered text (types
      //   stripped, classes / optional chains / destructures already helper-soup) - value-add
      //   folds that need the pre-lowering shape never fire and stay native-faithful; the
      //   handful of tests asserting those folds skip
      ...phase === 'pre+post' || phase === 'post' ? [new webpack.DefinePlugin({
        E2E_POST_LOWERED: 'true',
        ...phase === 'post' ? { E2E_DETECT_LOWERED: 'true' } : {},
      })] : [],
    ],
    module: {
      rules: [{
        // test files — same babel pipeline as the babel leg minus `@core-js`
        test: /\.(?:js|ts)$/,
        include: e2eUsagePure,
        use: {
          loader: 'babel-loader',
          options: {
            ...babelConfig,
            plugins: [
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
        // everything else - standard transforms only. webpack rules are CUMULATIVE: without the
        // suite dir in exclude, its `.js` files would ALSO pass through this rule - and FIRST,
        // lowering spread/for-of under the base `iterableIsArray: true` before the dedicated
        // rule's proper-iteration overrides ever see the code. the field override replaces the
        // base exclude wholesale, so `/node_modules/` is restated alongside
        ...baseConfig.module.rules[0],
        exclude: [/node_modules/, e2eUsagePure],
      }],
    },
  };
}
