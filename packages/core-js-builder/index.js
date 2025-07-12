'use strict';
/* eslint-disable no-console -- output */
const { promisify } = require('node:util');
const { mkdir, readFile, unlink, writeFile, copyFile } = require('node:fs/promises');
const { dirname, join } = require('node:path');
const TerserPlugin = require('terser-webpack-plugin');
const tmpdir = require('node:os').tmpdir();
const webpack = promisify(require('webpack'));
const compat = require('@core-js/compat/compat');
const { banner } = require('./config');

function normalizeSummary(unit = {}) {
  let size, modules;
  if (typeof unit != 'object') {
    size = modules = !!unit;
  } else {
    size = !!unit.size;
    modules = !!unit.modules;
  } return { size, modules };
}

module.exports = async function ({
  modules = null,
  exclude = [],
  targets = null,
  format = 'bundle',
  filename = null,
  sourcemap = null,
  summary = {},
  minified = false,
} = {}) {
  if (!['bundle', 'cjs', 'esm'].includes(format)) throw new TypeError('Incorrect output type');
  summary = { comment: normalizeSummary(summary.comment), console: normalizeSummary(summary.console) };

  const TITLE = filename !== null || filename !== undefined ? filename : '`core-js`';
  let preamble = banner;
  const { list, targets: compatTargets } = compat({ targets, modules, exclude });

  if (summary.comment.size) preamble += `/*\n * size: ${ (code.length / 1024).toFixed(2) }KB w/o comments\n */`;
  if (summary.comment.modules) preamble += `/*\n * modules:\n${ list.map(it => ` * ${ it }\n`).join('') } */`;
  let script = '';
  let code = '';

  if (list.length) {
    if (format === 'bundle') {
      const randomId = Math.random().toString(36).slice(2);
      const tempFileName = `core-js-${ randomId }.js`;
      const tempSourceMapName = `core-js-${ randomId }.js.map`;
      const tempFile = join(tmpdir, tempFileName);
      const tempSourceMap = join(tmpdir, tempSourceMapName);
      await webpack({
        mode: 'none',
        node: false,
        target: ['es5', 'node'],
        entry: list.map(it => require.resolve(`core-js/modules/${ it }`)),
        output: {
          filename: tempFileName,
          path: tmpdir,
          sourceMapFilename: tempSourceMapName,
        },
        devtool: 'source-map',
        optimization: {
          minimize: minified,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                ecma: 3,
                ie8: true,
                safari10: true,
                keep_fnames: true,
                compress: {
                  hoist_funs: true,
                  hoist_vars: true,
                  passes: 2,
                  pure_getters: true,
                  // document.all detection case
                  typeofs: false,
                  unsafe_proto: true,
                  unsafe_undefined: true,
                },
                format: {
                  max_line_len: 32000,
                  webkit: true,
                  // https://v8.dev/blog/preparser#pife
                  wrap_func_args: false,
                  preamble,
                  comments: false,
                },
              },
              extractComments: false,
            }),
          ],
        },
      });

      const file = await readFile(tempFile);

      await unlink(tempFile);

      if (!(sourcemap === null || sourcemap === undefined) && minified) {
        await copyFile(tempSourceMap, sourcemap);
      }

      if (minified) {
        code = String(file);
      } else {
        script = preamble;
        code = `!function (undefined) { 'use strict'; ${
          // compress `__webpack_require__` with `keep_fnames` option
          String(file).replace(/function __webpack_require__/, 'var __webpack_require__ = function ')
        }\n}();\n`;  // first \n is needed because of sourcemap location comment
      }
    } else {
      script = preamble;
      const template = it => format === 'esm'
        ? `import 'core-js/modules/${ it }.js';\n`
        : `require('core-js/modules/${ it }');\n`;
      code = list.map(template).join('');
    }
  }

  if (code && script) script += `\n${ code }`;
  else if (code) script = code;

  if (summary.console.size) {
    console.log(`\u001B[32mbundling \u001B[36m${ TITLE }\u001B[32m, size: \u001B[36m${
      (script.length / 1024).toFixed(2)
    }KB\u001B[0m`);
  }

  if (summary.console.modules) {
    console.log(`\u001B[32mbundling \u001B[36m${ TITLE }\u001B[32m, modules:\u001B[0m`);
    if (list.length) for (const it of list) {
      console.log(`\u001B[36m${ it + (targets ? ` \u001B[32mfor \u001B[36m${ JSON.stringify(compatTargets[it]) }` : '') }\u001B[0m`);
    } else console.log('\u001B[36mnothing\u001B[0m');
  }

  if (!(filename === null || filename === undefined)) {
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, script);
  }

  return { script };
};
