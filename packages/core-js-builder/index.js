'use strict';
/* eslint-disable no-console -- output */
const { promisify } = require('node:util');
const { mkdir, readFile, unlink, writeFile } = require('node:fs/promises');
const { dirname, join } = require('node:path');
const tmpdir = require('node:os').tmpdir();
const webpack = promisify(require('webpack'));
const compat = require('core-js-compat/compat');
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
  summary = {},
} = {}) {
  if (!['bundle', 'cjs', 'esm'].includes(format)) throw new TypeError('Incorrect output type');
  summary = { comment: normalizeSummary(summary.comment), console: normalizeSummary(summary.console) };

  const TITLE = filename !== null || filename !== undefined ? filename : '`core-js`';
  let script = banner;
  let code = '\n';

  const { list, targets: compatTargets } = compat({ targets, modules, exclude });

  if (list.length) {
    if (format === 'bundle') {
      const tempFileName = `core-js-${ Math.random().toString(36).slice(2) }.js`;
      const tempFile = join(tmpdir, tempFileName);

      await webpack({
        mode: 'none',
        node: {
          global: false,
          process: false,
          setImmediate: false,
        },
        entry: list.map(it => require.resolve(`core-js/modules/${ it }`)),
        output: {
          filename: tempFileName,
          hashFunction: 'md5',
          path: tmpdir,
        },
      });

      const file = await readFile(tempFile);

      await unlink(tempFile);

      code = `!function (undefined) { 'use strict'; ${
        // compress `__webpack_require__` with `keep_fnames` option
        String(file).replace(/function __webpack_require__/, 'var __webpack_require__ = function ')
      } }();\n`;
    } else {
      const template = it => format === 'esm'
        ? `import 'core-js/modules/${ it }.js';\n`
        : `require('core-js/modules/${ it }');\n`;
      code = list.map(template).join('');
    }
  }

  if (summary.comment.size) script += `/*\n * size: ${ (code.length / 1024).toFixed(2) }KB w/o comments\n */`;
  if (summary.comment.modules) script += `/*\n * modules:\n${ list.map(it => ` * ${ it }\n`).join('') } */`;
  if (code) script += `\n${ code }`;

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

  return script;
};
