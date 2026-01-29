'use strict';
/* eslint-disable no-console -- output */
const { promisify } = require('node:util');
const { mkdir, readFile, unlink, writeFile } = require('node:fs/promises');
const { dirname, join, basename } = require('node:path');
const tmpdir = require('node:os').tmpdir();
const webpack = promisify(require('webpack'));
const compat = require('@core-js/compat/compat');
const { banner } = require('./config');
const MagicString = require('magic-string');
const remapping = require('@ampproject/remapping');
const terser = require('terser');

function normalizeSummary(unit = {}) {
  let size, modules;
  if (typeof unit != 'object') {
    size = modules = !!unit;
  } else {
    size = !!unit.size;
    modules = !!unit.modules;
  } return { size, modules };
}

async function bundleModules(list, options) {
  const { sourceMap, minify, filename, summary } = options;
  const maps = {};
  const files = {};

  // --- Step 1: Webpack temp files ---
  const webpackFileName = `core-js-webpack-${ Math.random().toString(36).slice(2) }.js`;
  const webpackFile = join(tmpdir, webpackFileName);
  const webpackMapFile = `${ webpackFile }.map`;

  const tempFiles = [webpackFile, webpackMapFile]; // track files to delete later

  try {
    await webpack({
      mode: 'none',
      devtool: 'source-map',
      node: false,
      target: ['es5', 'node'],
      entry: list.map(it => require.resolve(`core-js/modules/${ it }`)),
      output: { filename: webpackFileName, path: tmpdir },
    });

    const webpackCode = String(await readFile(webpackFile));
    files[webpackFileName] = webpackCode;

    try {
      maps[webpackFileName] = JSON.parse(await readFile(webpackMapFile, 'utf8'));
    } catch {
      maps[webpackFileName] = null;
    }

    // --- Step 2: Webpack require + IIFE edits + allow webpack require minify ---
    const optimizeFileName = `core-js-optimize-${ Math.random().toString(36).slice(2) }.js`;
    tempFiles.push(optimizeFileName);

    const msOptimize = new MagicString(webpackCode);
    msOptimize.replace(/function __webpack_require__/, 'var __webpack_require__ = function ');
    msOptimize.prepend('!function (undefined) { \'use strict\'; ');
    msOptimize.append(' \n}();\n');
    const optimizeCode = msOptimize.toString();
    files[optimizeFileName] = optimizeCode;
    maps[optimizeFileName] = msOptimize.generateMap({ source: webpackFileName, hires: true, includeContent: true });

    // --- Step 3: Minify (optional) ---
    let minifyFileName = optimizeFileName;
    if (minify) {
      minifyFileName = `core-js-minify-${ Math.random().toString(36).slice(2) }.js`;
      tempFiles.push(minifyFileName);

      const terserResult = await terser.minify(optimizeCode, {
        sourceMap: { content: maps[optimizeFileName], filename: optimizeFileName, url: false },
        ecma: 3,
        ie8: true,
        safari10: true,
        keep_fnames: true,
        compress: {
          hoist_funs: true,
          hoist_vars: true,
          passes: 2,
          pure_getters: true,
          typeofs: false,
          unsafe_proto: true,
          unsafe_undefined: true,
        },
        format: {
          max_line_len: 32000,
          webkit: true,
          wrap_func_args: false,
        },
      });

      files[minifyFileName] = terserResult.code;
      maps[minifyFileName] = terserResult.map;
    }

    // --- Step 4: Header + Footer ---
    const headerFooterFileName = `core-js-final-${ Math.random().toString(36).slice(2) }.js`;
    tempFiles.push(headerFooterFileName);

    const msFinal = new MagicString(files[minifyFileName]);
    msFinal.prepend('\n');
    msFinal.prepend(banner);
    if (summary.comment.size) msFinal.append(`/*\n * size: ${ (files[minifyFileName].length / 1024).toFixed(2) }KB w/o comments\n */\n`);
    if (summary.comment.modules) msFinal.append(`/*\n * modules:\n${ list.map(m => ` * ${ m }\n`).join('') } */\n`);
    const finalCode = msFinal.toString();
    files[headerFooterFileName] = finalCode;
    maps[headerFooterFileName] = JSON.parse(
      msFinal.generateMap({ source: minifyFileName, hires: true, includeContent: true }).toString(),
    );

    // --- Step 5: Compose maps ---
    const composedMap = remapping(maps[headerFooterFileName], source => maps[source] || null);

    // --- Step 6: Write final output ---
    if (sourceMap && filename) {
      await mkdir(dirname(filename), { recursive: true });
      await writeFile(filename, `${ finalCode }\n//# sourceMappingURL=${ basename(filename) }.map`);
      await writeFile(`${ filename }.map`, composedMap.toString());
    }

    return { code: finalCode, map: composedMap.toString() };
  } finally {
    // --- Step 7: Clean up temp files ---
    await Promise.allSettled(tempFiles.map(f => unlink(f)));
  }
}

module.exports = async function ({
  modules = null,
  exclude = [],
  targets = null,
  format = 'bundle',
  filename = null,
  summary = {},
  sourceMap = format === 'bundle',
  minify = format === 'bundle',
} = {}) {
  if (!['bundle', 'cjs', 'esm'].includes(format)) throw new TypeError('Incorrect output type');
  summary = { comment: normalizeSummary(summary.comment), console: normalizeSummary(summary.console) };
  if ((minify || sourceMap) && format !== 'bundle') throw new TypeError('Cannot use minify or sourceMap with a non-bundle format');

  const TITLE = filename !== null || filename !== undefined ? filename : '`core-js`';
  const { list, targets: compatTargets } = compat({ targets, modules, exclude });

  let script = '';
  let map = '';
  if (list.length) {
    if (format === 'bundle') {
      const result = await bundleModules(list, { sourceMap, minify, filename, summary });
      script = result.code;
      map = result.map;
    } else {
      const template = it => format === 'esm'
        ? `import 'core-js/modules/${ it }.js';\n`
        : `require('core-js/modules/${ it }');\n`;
      script = list.map(template).join('');
    }
  }
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
    if (sourceMap) {
      await writeFile(`${ filename }.map`, map);
    }
  }

  return { script, map };
};
