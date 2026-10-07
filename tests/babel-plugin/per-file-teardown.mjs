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
import { parseAsync, transformFromAstAsync } from '@babel/core';
import corejsPlugin from '../../packages/core-js-babel-plugin/index.js';

// `cfg` is bound to an object literal, so the census records `cfg.at` with the assigned
// FunctionExpression as its value node; the trailing call gives the file real work to do
const CODE = 'const cfg = { at: 1 };\ncfg.at = function marker() {};\n[1].at(0);\n';
// A restored parameter makes its wrapper opaque. The escape answer's held-name set then
// keys an AST-bearing walk cache, even though the answer itself only closes over name sets.
const RESTORED_CODE = `export function checkDirty(link) {
  const stack = { value: link };
  link = link.deps;
  link = stack.value;
  return link.sub;
}`;
// The array plan holds its original pattern, property occurrences and live default.
// None may survive the transform through the provider's per-instance plan cache.
const ARRAY_CODE = `export function read(receiver, fallback) {
  const [{ at = fallback(), other }] = [receiver];
  return [at, other];
}`;
// The usage handler holds the question scope a selection level asked in for the visit of the
// level's left operand. Nothing after this file's only level reaches the handler - its operands
// are literals - so a scope held for it would outlive the file.
const SELECTION_CODE = 'export const mode = "production" || "development";\n';
// hoisted so babel reuses ONE plugin instance across files, as a real build does - an
// instance that is itself garbage would hide the retention the check is looking for
const OPTIONS = {
  'usage-global': { method: 'usage-global', version: '4.0', targets: { ie: 11 } },
  'usage-pure': { method: 'usage-pure', version: '4.0', targets: { ie: 11 } },
};
const NOOP_OPTIONS = { marker: 'noop' };
const RESULT_PREFIX = 'per-file-teardown-result ';
const retained = { ast: null };

function noopPlugin() {
  return { name: 'noop', visitor: {} };
}

function retainingPlugin() {
  return { name: 'retaining', visitor: {}, post() { retained.ast = this.file.ast; } };
}

async function transformHoldingMarker(plugin, options, filename, form) {
  const source = form === 'restored' ? RESTORED_CODE : form === 'array' ? ARRAY_CODE : form === 'selection' ? SELECTION_CODE : CODE;
  const ast = await parseAsync(source, { filename, configFile: false, babelrc: false });
  const marker = form === 'array' ? ast.program.body[0].declaration.body.body[0].declarations[0].id
    : form === 'restored' ? ast.program.body[0].declaration.body.body[0].declarations[0].init
    : form === 'selection' ? ast.program.body[0].declaration.declarations[0].init
    : ast.program.body[1].expression.right;
  const expectedType = form === 'array' ? 'ArrayPattern' : form === 'restored' ? 'ObjectExpression'
    : form === 'selection' ? 'LogicalExpression' : 'FunctionExpression';
  if (marker.type !== expectedType) throw new Error(`unexpected marker ${ marker.type }`);
  const ref = new WeakRef(marker);
  // `cloneInputAst: false` so the plugin walks the very nodes this WeakRef points at
  await transformFromAstAsync(ast, source, {
    filename, configFile: false, babelrc: false, cloneInputAst: false, plugins: [[plugin, options]],
  });
  return ref;
}

// Each deref keeps its target alive for the current job. Yield between GC attempts;
// transient VM roots may survive the first collection, but persistent roots must fail.
async function collectable(make) {
  const ref = await make();
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 0));
    globalThis.gc();
    globalThis.gc();
    if (ref.deref() === undefined) return true;
  }
  return false;
}

async function measure() {
  const results = {};
  for (const prefix of ['written', 'restored', 'array', 'selection']) {
    // harness gate: the same transform driven by a plugin that keeps nothing must collect.
    // if it does not, the environment cannot answer the question and the rest is noise
    results[`${ prefix }/control`] = await collectable(() => transformHoldingMarker(noopPlugin, NOOP_OPTIONS, 'control.js', prefix));
    let retainedRef;
    results[`${ prefix }/retained/control`] = await collectable(async () => {
      retainedRef = await transformHoldingMarker(retainingPlugin, NOOP_OPTIONS, 'retained.js', prefix);
      return retainedRef;
    });
    retained.ast = null;
    results[`${ prefix }/released/control`] = await collectable(() => retainedRef);
    // Two timer turns release a temporary root after the first collection opportunity.
    results[`${ prefix }/delayed/control`] = await collectable(async () => {
      const ref = await transformHoldingMarker(retainingPlugin, NOOP_OPTIONS, 'delayed.js', prefix);
      setTimeout(() => setTimeout(() => { retained.ast = null; }, 0), 0);
      return ref;
    });
    for (const [method, options] of Object.entries(OPTIONS)) {
      // two files through one instance: the first also proves the instance itself outlives a
      // collection, so a pass is teardown and not a dead plugin
      results[`${ prefix }/${ method }/earlier`] = await collectable(() => transformHoldingMarker(corejsPlugin, options, 'earlier.js', prefix));
      results[`${ prefix }/${ method }/last`] = await collectable(() => transformHoldingMarker(corejsPlugin, options, 'last.js', prefix));
    }
  }
  return results;
}

if (typeof globalThis.gc === 'function') {
  console.log(RESULT_PREFIX + JSON.stringify(await measure()));
} else {
  const { createChecker } = await import('../polyfill-provider/harness.mjs');
  const { check, checkTruthy, finish } = createChecker('per-file-teardown');
  const node = process.execPath.replaceAll('\\', '/');
  const { stdout } = await $({ quiet: true, cwd: import.meta.dirname })`${ node } --expose-gc ./per-file-teardown.mjs`;
  const line = stdout.split('\n').find(row => row.startsWith(RESULT_PREFIX));
  checkTruthy('child measurement produced a result', !!line);
  if (line) {
    const results = JSON.parse(line.slice(RESULT_PREFIX.length));
    for (const prefix of ['written', 'restored', 'array', 'selection']) {
      const control = results[`${ prefix }/control`];
      checkTruthy(`${ prefix } control: node from a state-free plugin is collectable`, control);
      check(`${ prefix } control: retained tree stays alive`, results[`${ prefix }/retained/control`], false);
      checkTruthy(`${ prefix } control: released tree collects without another transform`, results[`${ prefix }/released/control`]);
      checkTruthy(`${ prefix } control: temporary root eventually releases`, results[`${ prefix }/delayed/control`]);
      // asserting the plugin's own rows against a broken environment would only add noise
      if (!control) continue;
      for (const [label, value] of Object.entries(results)) {
        if (label.startsWith(`${ prefix }/`) && !label.endsWith('/control')) check(`${ label } file tree released`, value, true);
      }
    }
  }
  finish();
}
