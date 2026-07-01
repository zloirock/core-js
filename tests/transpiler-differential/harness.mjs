// Transpiler-differential harness: run the same source through BOTH plugins (usage-pure), then compare
// only what actually matters - the injected import-set (strict) and runtime behaviour (native ==
// babel == unplugin). Body-shape (AST codegen vs text rewrite) is deliberately NOT compared: that
// divergence is architectural (the `output-unplugin.mjs` sidecars), not a bug.
//
// On top of the full-environment three-way, a STRIPPED-realm oracle re-runs each polyfilled output
// in a realm where the leaf builtins are gone (a persistent worker preloaded with strip-builtins.mjs).
// That run must still reproduce the full-env native reference - which catches a MISSED injection (the
// leftover native call now throws instead of being masked by the present builtin) and proves the
// polyfill stands alone. See strip-builtins.mjs / stripped-worker.mjs.
import { transformAsync } from '@babel/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { fork } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import tsStrip from '@babel/plugin-transform-typescript';
import decoratorsPlugin from '@babel/plugin-proposal-decorators';
import classPropsPlugin from '@babel/plugin-transform-class-properties';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runtimeKey, serialize } from './serialize.mjs';

export { serialize };

const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = join(HERE, 'tmp');
// `decorators-legacy` is harmless for non-decorator TS, so one parser config covers all TS snippets
const TS_PARSER = { plugins: ['typescript', 'decorators-legacy'] };
// strip TS to runnable JS; legacy decorators + class properties make decorated classes executable.
// babel@8 replaced the `legacy: true` shorthand with a required `version: 'legacy' | '2023-11'`
const STRIP_PLUGINS = [[decoratorsPlugin, { version: 'legacy' }], classPropsPlugin, tsStrip];

export async function transformBabel(src, options, ts = false) {
  const out = await transformAsync(src, {
    plugins: [[babelPlugin, options]],
    filename: ts ? 'input.ts' : 'input.mjs',
    sourceType: 'module',
    parserOpts: ts ? TS_PARSER : undefined,
    configFile: false,
    babelrc: false,
  });
  return out.code;
}

export function transformUnplugin(src, options, ts = false) {
  return createPlugin(options).transform(src, ts ? 'input.ts' : 'input.mjs')?.code ?? src;
}

// injected core-js import paths, normalized so @core-js/pure and core-js compare equal
const IMPORT_RE = /["'](?<path>@?core-js(?:\/pure)?\/[^"']+)["']/u;
export function importSet(code) {
  const set = new Set();
  for (const raw of code.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('import') && !line.includes('require(')) continue;
    const found = IMPORT_RE.exec(line);
    if (found) set.add(found.groups.path.replace('@core-js/pure', 'core-js'));
  }
  return set;
}

// strip TS syntax so a TS plugin-output becomes runnable; only TS nodes are removed, the injected
// polyfill imports / rewrites are untouched
async function stripTypeScript(code) {
  const out = await transformAsync(code, { plugins: STRIP_PLUGINS, parserOpts: TS_PARSER, filename: 'x.ts', configFile: false, babelrc: false });
  return out.code;
}

let counter = 0;
// write a module to a fresh temp file (no dynamic-import cache reuse) and execute it in THIS realm
// (full builtins). returns the observable result plus the file path, so the same file can later be
// re-run in the stripped worker without re-transforming. the filename carries the PID: parallel
// shard processes share `tmp/`, and a bare per-process counter would collide (shard A's `m0.mjs`
// overwriting shard B's mid-import -> cross-contaminated results)
async function evalModule(code, ts = false) {
  await mkdir(TMP, { recursive: true });
  const file = join(TMP, `m${ process.pid }_${ counter++ }.mjs`);
  await writeFile(file, ts ? await stripTypeScript(code) : code);
  try {
    const mod = await import(pathToFileURL(file).href);
    return { result: { ok: true, r: mod.r, effects: mod.effects }, file };
  } catch (error) {
    return { result: { ok: false, errorName: error?.name ?? 'Error' }, file };
  }
}

// --- stripped-realm worker (lazy, one per process; killed via closeStrippedWorker) ---
let worker = null;
let workerReady = null;
let nextId = 0;
const pending = new Map();
function ensureWorker() {
  if (workerReady) return workerReady;
  const stripUrl = pathToFileURL(join(HERE, 'strip-builtins.mjs')).href;
  worker = fork(join(HERE, 'stripped-worker.mjs'), [], { execArgv: ['--import', stripUrl] });
  workerReady = new Promise(resolve => {
    worker.on('message', msg => {
      if (msg.ready) return resolve();
      const settle = pending.get(msg.id);
      if (!settle) return;
      pending.delete(msg.id);
      settle(msg.key);
    });
  });
  return workerReady;
}
// re-run an already-written module file in the builtin-stripped realm; returns its runtimeKey
async function evalStripped(file) {
  await ensureWorker();
  const id = nextId++;
  return new Promise(resolve => {
    pending.set(id, resolve);
    worker.send({ id, file });
  });
}
export function closeStrippedWorker() {
  if (worker) worker.kill();
  worker = null;
  workerReady = null;
}

function setEqual(a, b) {
  return a.size === b.size && [...a].every(x => b.has(x));
}

// run both oracles on one snippet; returns the verdict + raw materials for reporting. a transform
// that THROWS (e.g. an unplugin composition invariant) is itself a bug - captured, not propagated
export async function checkSnippet(src, options, ts = false, stripCheck = false) {
  let babelOut;
  let unpluginOut;
  let babelError = null;
  let unpluginError = null;
  try {
    babelOut = await transformBabel(src, options, ts);
  } catch (error) {
    babelError = error?.message ?? String(error);
  }
  try {
    unpluginOut = transformUnplugin(src, options, ts);
  } catch (error) {
    unpluginError = error?.message ?? String(error);
  }
  if (babelError || unpluginError) return { transformCrash: true, babelError, unpluginError };

  const babelImports = importSet(babelOut);
  const unpluginImports = importSet(unpluginOut);

  const native = runtimeKey((await evalModule(src, ts)).result);
  const babelEval = await evalModule(babelOut, ts);
  const unpluginEval = await evalModule(unpluginOut, ts);
  const babelRun = runtimeKey(babelEval.result);
  const unpluginRun = runtimeKey(unpluginEval.result);

  // stripped-realm oracle: gated on the snippet's `strip` flag - the generator's assertion that this
  // shape MUST inject (strip:false shapes that may legitimately not inject - param-default / assignment
  // hosts - never reach here). the polyfilled output must reproduce the full-env native reference with
  // the native builtins gone. deliberately NOT gated on a non-empty import-set: a MISSED injection emits
  // no import, so gating on imports would skip this run for exactly the bug it exists to catch (both
  // plugins miss -> full-env three-way all agree on the present native -> only the stripped realm, where
  // the leftover native call now throws / diverges, can see it). a divergence here is a missed injection
  // or a polyfill that leaned on the native
  let strippedMismatch = false;
  let babelStripped = null;
  let unpluginStripped = null;
  // ALSO gate on native producing a value (not a throw): a vacuous-by-throw snippet makes the strip
  // oracle meaningless - a MISSED injection throws too, and runtimeKey collapses distinct errors to the
  // errorName, so ERR == ERR regardless of whether the polyfill ran. only a value-producing native gives
  // the stripped realm a reference that a leftover (now-throwing) native call would visibly diverge from
  if (stripCheck && !native.startsWith('ERR')) {
    babelStripped = await evalStripped(babelEval.file);
    unpluginStripped = await evalStripped(unpluginEval.file);
    strippedMismatch = babelStripped !== native || unpluginStripped !== native;
  }

  return {
    importMismatch: !setEqual(babelImports, unpluginImports),
    runtimeMismatch: !(native === babelRun && babelRun === unpluginRun),
    pluginRuntimeDiverge: babelRun !== unpluginRun,
    strippedMismatch,
    babelImports,
    unpluginImports,
    native,
    babelRun,
    unpluginRun,
    babelStripped,
    unpluginStripped,
  };
}

// interpret a verdict: is it a failure, and (if so) the human-readable detail. lives next to
// checkSnippet so the verdict's shape and its meaning stay in one place - a runner shouldn't decode
// the verdict's internals itself. `detail` is empty when not failed
export function summarizeVerdict(v) {
  if (!(v.transformCrash || v.importMismatch || v.runtimeMismatch || v.strippedMismatch)) {
    return { failed: false, detail: '' };
  }
  const details = [];
  if (v.babelError) details.push(`babel threw: ${ v.babelError }`);
  if (v.unpluginError) details.push(`unplugin threw: ${ v.unpluginError }`);
  if (v.importMismatch) {
    details.push(`import-set babel={ ${ [...v.babelImports].join(', ') } } unplugin={ ${ [...v.unpluginImports].join(', ') } }`);
  }
  if (v.runtimeMismatch) {
    const kind = v.pluginRuntimeDiverge ? 'PLUGIN DIVERGENCE' : 'polyfill vs native';
    details.push(`runtime [${ kind }] native=${ v.native } babel=${ v.babelRun } unplugin=${ v.unpluginRun }`);
  }
  if (v.strippedMismatch) {
    details.push(`stripped-realm native=${ v.native } babel=${ v.babelStripped } unplugin=${ v.unpluginStripped }`);
  }
  return { failed: true, detail: details.join('; ') };
}
