// The Babel side of a build: which toolchain, which configuration, and which modules it is allowed
// to touch. `@rollup/plugin-babel` is what wires Babel into rollup - this module configures it
// rather than reimplementing the wiring.
import { shouldTransform } from '@core-js/unplugin';
import { babel } from '@rollup/plugin-babel';
import { createRequire } from 'node:module';
import { SUPPORTED_ENGINES } from './cells.mjs';
import { PACKAGE_JSON, isCoreJsModule } from './paths.mjs';
import { TS_EXTENSION } from './ts-sources.mjs';

// absolute paths rather than bare names: Babel resolves a bare one from the FILE being compiled,
// which here is a library module deep in node_modules
const requireHere = createRequire(PACKAGE_JSON);
const PRESET = requireHere.resolve('@babel/preset-env');
const TYPESCRIPT = requireHere.resolve('@babel/plugin-transform-typescript');
const COREJS = requireHere.resolve('@core-js/babel-plugin');

const BABEL_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'];

// The ES5 down-compile. `coreJs` turns the same pass into the babel-plugin PROVIDER build.
export function makeBabelPlugin(coreJs = null) {
  const provider = coreJs ? [[COREJS, coreJs]] : [];
  return babel({
    babelHelpers: 'inline',
    extensions: BABEL_EXTENSIONS,
    filter: id => !isCoreJsModule(id) && shouldTransform(id),
    configFile: false,
    babelrc: false,
    sourceMaps: false,
    compact: false,
    presets: [[PRESET, { targets: SUPPORTED_ENGINES, useBuiltIns: false, modules: false }]],
    overrides: [
      { test: TS_EXTENSION, plugins: [[TYPESCRIPT, {}], ...provider] },
      { exclude: TS_EXTENSION, plugins: provider },
    ],
  });
}
