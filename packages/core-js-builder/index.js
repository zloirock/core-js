'use strict';
const { mkdir, readFile, unlink, writeFile } = require('fs').promises;
const { dirname, join } = require('path');
const { promisify } = require('util');
const tmpdir = require('os').tmpdir();
const webpack = promisify(require('webpack'));
const { minify: terser } = require('terser');
const compat = require('@core-js/compat/compat');
const modulesList = require('@core-js/compat/modules');
const { banner } = require('./config');

function normalizeSummary(unit = {}) {
  let size, modules;
  if (typeof unit !== 'object') {
    size = modules = !!unit;
  } else {
    size = !!unit.size;
    modules = !!unit.modules;
  } return { size, modules };
}

module.exports = async function ({
  modules = modulesList.slice(),
  exclude = [],
  targets,
  minify = true,
  filename,
  summary = {},
} = {}) {
  const TITLE = filename != null ? filename : '`core-js`';

  let summarySize, summaryModules, modulesWithTargets;
  if (typeof summary !== 'object') {
    summarySize = summaryModules = !!summary;
  } else {
    summarySize = !!summary.size;
    summaryModules = !!summary.modules;
  }

  const set = new Set();
  let script = banner;
  let code = '';
  let modulesWithTargets;

  function filter(method, list) {
    for (const ns of list) {
      for (const name of modulesList) {
        if (name === ns || name.startsWith(`${ ns }.`)) {
          // eslint-disable-next-line sonarjs/no-empty-collection -- false positive
          set[method](name);
        }
      }
    }
  }

  filter('add', modules);
  filter('delete', exclude);

  // eslint-disable-next-line sonarjs/no-empty-collection -- false positive
  modules = modulesList.filter(it => set.has(it));

  if (targets) {
    const compatResult = compat({ targets, filter: modules });
    modules = compatResult.list;
    modulesWithTargets = compatResult.targets;
  }

  if (summaryModules) {
    // eslint-disable-next-line no-console -- output
    console.log(`\u001B[36m${ TITLE }\u001B[32m bundle modules:\u001B[0m`);
    // eslint-disable-next-line no-console -- output
    console.table(modulesWithTargets || modules);
  }

  let script = banner;

  if (modules.length) {
    const tempFileName = `core-js-${ Math.random().toString(36).slice(2) }.js`;
    const tempFile = join(tmpdir, tempFileName);

    await webpack({
      mode: 'none',
      node: false,
      target: ['node', 'es5'],
      entry: modules.map(it => require.resolve(`core-js/commonjs/modules/${ it }`)),
      output: {
        path: tmpdir,
        filename: tempFileName,
      },
    });

    const file = await readFile(tempFile);

    await unlink(tempFile);

    code = `!function (undefined) { 'use strict'; ${
      // compress `__webpack_require__` with `keep_fnames` option
      String(file).replace(/function __webpack_require__/, 'var __webpack_require__ = function ')
    } }();`;

    if (minify) {
      ({ code } = await terser(code, {
        ecma: 5,
        keep_fnames: true,
        compress: {
          hoist_funs: false,
          hoist_vars: true,
          pure_getters: true,
          passes: 3,
          unsafe_proto: true,
          unsafe_undefined: true,
        },
        format: {
          max_line_len: 32000,
          webkit: false,
        },
      }));
    }
  }

  if (summary.comment.size) script += `/*\n * size: ${ (code.length / 1024).toFixed(2) }KB w/o comments\n */`;
  if (summary.comment.modules) script += `/*\n * modules:\n${ modules.map(it => ` * ${ it }\n`).join('') } */`;
  if (code) script += `\n${ code }`;

  if (summary.console.size) {
    // eslint-disable-next-line no-console -- output
    console.log(`\u001B[32mbundling \u001B[36m${ TITLE }\u001B[32m, size: \u001B[36m${
      (script.length / 1024).toFixed(2)
    }KB\u001B[0m`);
  }

  if (summary.console.modules) {
    // eslint-disable-next-line no-console -- output
    console.log(`\u001B[32mbundling \u001B[36m${ TITLE }\u001B[32m, modules:\u001B[0m`);
    // eslint-disable-next-line no-console -- output
    console.table(modulesWithTargets || modules);
  }

  if (summarySize) {
    // eslint-disable-next-line no-console -- output
    console.log(`\u001B[32mbundling: \u001B[36m${ TITLE }\u001B[32m, size: \u001B[36m${
      (script.length / 1024).toFixed(2)
    }KB\u001B[0m`);
  }

  if (typeof filename != 'undefined') {
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, script);
  }

  return script;
};
