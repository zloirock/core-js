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

module.exports = async function ({
    exclude = [],
    modules = modulesList.slice(),
    targets,
    minify = true,
    filename,
} = {}) {
  const set = new Set();

  function filter(method, list) {
    for (const ns of list) {
      for (const name of modulesList) {
        if (name === ns || name.startsWith(`${ ns }.`)) {
          set[method](name);
        }
      }
    }
  }

  filter('add', modules);
  filter('delete', exclude);

  modules = modulesList.filter(it => set.has(it));

  if (targets) modules = compat({ targets, filter: modules }).list;

  let script = banner;

  if (modules.length) {
    const tempFileName = `core-js-${ Math.random().toString(36).slice(2) }.js`;
    const tempFile = join(tmpdir, tempFileName);

    await webpack({
      mode: 'none',
      node: false,
      target: ['node', 'es5'],
      entry: modules.map(it => require.resolve(`core-js/modules/${ it }`)),
      output: {
        path: tmpdir,
        filename: tempFileName,
      },
    });

    const file = await readFile(tempFile);

    await unlink(tempFile);

    script += `\n!function (undefined) { 'use strict'; ${
      // compress `__webpack_require__` with `keep_fnames` option
      String(file).replace(/function __webpack_require__/, 'var __webpack_require__ = function ')
    } }();`;
  }

  if (minify) {
    const { code } = await terser(script, {
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
        preamble: banner,
        webkit: false,
      },
    });

    script = code;
  }

  if (typeof filename != 'undefined') {
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, script);
  }

  return script;
};
