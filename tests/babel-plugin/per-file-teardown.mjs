// The plugin keeps per-file state in factory-scoped slots and drops it in `post()` so the
// previous file's tree is not pinned for the plugin instance's lifetime (a watch-mode dev
// server holds one instance for the whole session). The census belongs to that set: its
// written-container map keys each written slot to the VALUE NODES assigned to it, so keeping
// it alive keeps the file's tree alive. Nothing in the emitted output shows this, so the
// oracle is a WeakRef over a node the census records, taken after the LAST transform.
//
// The measurement needs `--expose-gc`, which the suite orchestrator does not carry, so the
// module re-execs itself as a plain node child and reads back one JSON line. The child stays
// zx-free on purpose - only the parent half reports through the shared checker.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { parseAsync, transformFromAstAsync } from '@babel/core';
import corejsPlugin from '../../packages/core-js-babel-plugin/index.js';

// `cfg` is bound to an object literal, so the census records `cfg.at` with the assigned
// FunctionExpression as its value node; the trailing call gives the file real work to do
const CODE = 'const cfg = { at: 1 };\ncfg.at = function marker() {};\n[1].at(0);\n';
// hoisted so babel reuses ONE plugin instance across files, as a real build does - an
// instance that is itself garbage would hide the retention the check is looking for
const OPTIONS = {
  'usage-global': { method: 'usage-global', version: '4.0', targets: { ie: 11 } },
  'usage-pure': { method: 'usage-pure', version: '4.0', targets: { ie: 11 } },
};
const NOOP_OPTIONS = { marker: 'noop' };
const RESULT_PREFIX = 'per-file-teardown-result ';

function noopPlugin() {
  return { name: 'noop', visitor: {} };
}

async function transformHoldingMarker(plugin, options, filename) {
  const ast = await parseAsync(CODE, { filename, configFile: false, babelrc: false });
  const marker = ast.program.body[1].expression.right;
  if (marker.type !== 'FunctionExpression') throw new Error(`unexpected marker ${ marker.type }`);
  const ref = new WeakRef(marker);
  // `cloneInputAst: false` so the plugin walks the very nodes this WeakRef points at
  await transformFromAstAsync(ast, CODE, {
    filename, configFile: false, babelrc: false, cloneInputAst: false, plugins: [[plugin, options]],
  });
  return ref;
}

// WeakRef targets survive the remainder of the current job, so yield a macrotask first
async function collectable(make) {
  const ref = await make();
  await new Promise(resolve => setTimeout(resolve, 0));
  globalThis.gc();
  globalThis.gc();
  return ref.deref() === undefined;
}

async function measure() {
  const results = {
    // harness gate: the same transform driven by a plugin that keeps nothing must collect.
    // if it does not, the environment cannot answer the question and the rest is noise
    control: await collectable(() => transformHoldingMarker(noopPlugin, NOOP_OPTIONS, 'control.js')),
  };
  for (const [method, options] of Object.entries(OPTIONS)) {
    // two files through one instance: the first also proves the instance itself outlives a
    // collection, so a pass is teardown and not a dead plugin
    results[`${ method }/earlier`] = await collectable(() => transformHoldingMarker(corejsPlugin, options, 'earlier.js'));
    results[`${ method }/last`] = await collectable(() => transformHoldingMarker(corejsPlugin, options, 'last.js'));
  }
  return results;
}

if (typeof globalThis.gc === 'function') {
  console.log(RESULT_PREFIX + JSON.stringify(await measure()));
} else {
  const { createChecker } = await import('../polyfill-provider/harness.mjs');
  const { check, checkTruthy, finish } = createChecker('per-file-teardown');
  const { stdout } = await promisify(execFile)(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url)]);
  const line = stdout.split('\n').find(row => row.startsWith(RESULT_PREFIX));
  checkTruthy('child measurement produced a result', !!line);
  if (line) {
    const results = JSON.parse(line.slice(RESULT_PREFIX.length));
    checkTruthy('control: node from a state-free plugin is collectable', results.control);
    // asserting the plugin's own rows against a broken environment would only add noise
    if (results.control) for (const [label, value] of Object.entries(results)) {
      if (label !== 'control') check(`${ label } file tree released`, value, true);
    }
  }
  finish();
}
