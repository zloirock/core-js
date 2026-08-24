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
//
// The unplugin rides both oracles as a leg of its own: one detection feeds both plugins, so its
// import set must equal babel's exactly, while the BODY is its own reprint - the thing the fixture
// corpus can only compare structurally. Running it is what turns a wrong rewrite (a dropped effect,
// a receiver read twice, a guard that flipped a branch) from a shape difference into a runtime
// divergence.
import { transformAsync } from '@babel/core';
import { fork } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseSync } from 'oxc-parser';
import tsStrip from '@babel/plugin-transform-typescript';
import decoratorsPlugin from '@babel/plugin-proposal-decorators';
import classPropsPlugin from '@babel/plugin-transform-class-properties';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { printProgram } from '../../packages/core-js-unplugin/internals/print.js';
import { cached } from './cache-store.mjs';
import { runtimeKey } from './serialize.mjs';

const { outputFile } = fs;
const { dirname, join } = path;

// wall-time per phase, summed over this shard's sequential snippets - the coordinator aggregates
// the per-shard buckets into the run's phase table, which is what optimization decisions read.
// `ts strip` runs INSIDE the eval phases (writeModule) - it is reported as their subset, not a peer
export const phaseNs = {};
function mark(phase, t0) {
  phaseNs[phase] = (phaseNs[phase] ?? 0n) + (process.hrtime.bigint() - t0);
}

// single-emitter edit-loop mode (DIFF_EMITTER, set by the coordinator): the skipped emitter is
// neither transformed nor evaluated, and the import-parity oracle is OFF - the coordinator
// labels such a run as not a full verification. exported so the usage-global leg follows the
// same gating instead of re-parsing the env
export const EMITTER = process.env.DIFF_EMITTER ?? 'both';
export const WANT_BABEL = EMITTER !== 'unplugin';
export const WANT_UNPLUGIN = EMITTER !== 'babel';

const HERE = dirname(fileURLToPath(import.meta.url));
// the coordinator scopes each run to its own tmp subdirectory (DIFF_TMP) so concurrent runs
// never race each other's files; a bare shard run (no coordinator) falls back to the shared root
const TMP = process.env.DIFF_TMP ?? join(HERE, 'tmp');
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

// the AST-engine print-through leg: the esrap printer alone over the SOURCE, no mutations.
// the corpus then EXECUTES what the roundtrip gate can only structurally compare - a paren
// the printer failed to re-derive is a runtime divergence here. returns null when oxc
// cannot parse the snippet (the leg abstains; the emitters' own transform is the verdict there)
export function printThroughAst(src, ts = false) {
  const file = ts ? 'input.ts' : 'input.mjs';
  let parsed;
  try {
    // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
    parsed = parseSync(file, src, { sourceType: 'module' });
  } catch {
    return null;
  }
  if (parsed.errors?.some(error => error.severity === 'Error')) return null;
  return printProgram({ program: parsed.program, comments: parsed.comments, source: src, id: file }).code;
}

// run the active emitters over one source, capturing a transform crash as a message instead of
// propagating - a throwing transform is itself a verdict, not a harness failure. `timed` feeds
// the per-emitter phase buckets; the usage-global leg omits it, staying inside its own aggregate
export async function transformBoth({ src, options, ts = false, timed = false }) {
  let babelOut;
  let unpluginOut;
  let babelError = null;
  let unpluginError = null;
  let t0 = process.hrtime.bigint();
  if (WANT_BABEL) {
    try {
      babelOut = await transformBabel(src, options, ts);
    } catch (error) {
      babelError = error?.message ?? String(error);
    }
  }
  if (timed) mark('transform babel', t0);
  t0 = process.hrtime.bigint();
  if (WANT_UNPLUGIN) {
    try {
      unpluginOut = transformUnplugin(src, options, ts);
    } catch (error) {
      unpluginError = error?.message ?? String(error);
    }
  }
  if (timed) mark('transform unplugin', t0);
  return { babelOut, unpluginOut, babelError, unpluginError };
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
  const t0 = process.hrtime.bigint();
  const out = await transformAsync(code, { plugins: STRIP_PLUGINS, parserOpts: TS_PARSER, filename: 'x.ts', configFile: false, babelrc: false });
  mark('ts strip (inside evals)', t0);
  return out.code;
}

let counter = 0;
// write a module (TS stripped to runnable JS) to a fresh temp file - no dynamic-import cache
// reuse. the filename carries the PID: parallel shard processes share `tmp/`, and a bare
// per-process counter would collide (shard A's `m0.mjs` overwriting shard B's mid-import ->
// cross-contaminated results). exported for the usage-global leg, whose modules run in
// ShadowRealms instead of this realm
export async function writeModule(code, ts = false) {
  const file = join(TMP, `m${ process.pid }_${ counter++ }.mjs`);
  // fs-extra's outputFile creates the directory chain itself, so the tree needs no separate mkdir
  await outputFile(file, ts ? await stripTypeScript(code) : code);
  return file;
}
// a module file written ON DEMAND: the cache answers most evaluations, and an answered one needs no
// file at all. memoized, because a stripped MISS behind a full-env HIT still needs the same file -
// and both legs must run the identical bytes, not two writes of them
function lazyModule(code, ts) {
  let promise = null;
  return () => promise ??= writeModule(code, ts);
}
// execute a module in THIS realm (full builtins) and reduce it to its observable key
async function evalInRealm(file) {
  try {
    const mod = await import(pathToFileURL(await file()).href);
    return runtimeKey({ ok: true, r: mod.r, effects: mod.effects });
  } catch (error) {
    return runtimeKey({ ok: false, errorName: error?.name ?? 'Error' });
  }
}

// --- stripped-realm worker (lazy, one per process; killed via closeStrippedWorker) ---
let worker = null;
let workerReady = null;
let nextId = 0;
const pending = new Map();
// a worker death (crash / OOM / a stripped-realm `import()` that hard-exits) must FAIL the
// in-flight evals loudly instead of leaving their promises pending forever - an unhandled
// hang here wedges the shard, so the coordinator's Promise.all never settles and the whole
// run stalls with no diagnostic. every pending id settles with a sentinel key; the next
// `ensureWorker` call forks a fresh worker
function settleAllPending(reason) {
  for (const [id, settle] of pending) {
    pending.delete(id);
    settle(`stripped-worker-died: ${ reason }`);
  }
}
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
    function onDeath(reason) {
      resolve(); // a pre-ready death must not wedge ensureWorker's awaiters either
      settleAllPending(reason);
      worker = null;
      workerReady = null;
    }
    worker.on('error', error => onDeath(error?.message ?? 'error'));
    worker.on('exit', (code, signal) => onDeath(`exit ${ code ?? signal }`));
  });
  return workerReady;
}
// re-run an already-written module file in the builtin-stripped realm; returns its runtimeKey
async function evalStripped(file) {
  await ensureWorker();
  // the worker may have died while we awaited readiness - retry once against a fresh fork
  if (!worker) await ensureWorker();
  if (!worker) return 'stripped-worker-died: unavailable';
  const id = nextId++;
  return new Promise(resolve => {
    pending.set(id, resolve);
    // eslint-disable-next-line promise/prefer-await-to-callbacks -- node's send() error channel IS a callback
    worker.send({ id, file }, error => {
      // a send onto a dead IPC channel is otherwise dropped silently
      if (error && pending.has(id)) {
        pending.delete(id);
        resolve(`stripped-worker-died: ${ error.message }`);
      }
    });
  });
}
export function closeStrippedWorker() {
  if (worker) {
    // the intentional shutdown must not trigger the death-sentinel path
    worker.removeAllListeners('exit');
    worker.removeAllListeners('error');
    worker.kill();
  }
  worker = null;
  workerReady = null;
}

export function setEqual(a, b) {
  return a.size === b.size && [...a].every(x => b.has(x));
}

// run both oracles on one snippet; returns the verdict + raw materials for reporting. a transform
// that THROWS (e.g. an unplugin composition invariant) is itself a bug - captured, not propagated
export async function checkSnippet(src, options, ts = false, stripCheck = false) {
  const { babelOut, unpluginOut, babelError, unpluginError } = await transformBoth({ src, options, ts, timed: true });
  if (babelError || unpluginError) return { transformCrash: true, babelError, unpluginError };

  const babelImports = WANT_BABEL ? importSet(babelOut) : new Set();
  const unpluginImports = WANT_UNPLUGIN ? importSet(unpluginOut) : new Set();

  // the corpus uses `self` ONLY as a proxy-global alias in NATIVE (untranspiled) snippets
  // (`globalThis || self`); Node has no `self`, and core-js polyfills it (unlike `window`, which is not a
  // core-js target and never appears bare in the corpus). Alias it to globalThis for the native leg
  // ALONE, then `delete` (not `= undefined`: a deleted property makes a bare `self` reference throw, an
  // undefined-valued one resolves to undefined) so the TRANSPILED outputs run WITHOUT it - a plugin that
  // fails to rewrite a bare `self` to its pure import (`_self`) leaves a reference that must throw, the
  // missed-injection signal, the same way the stripped realm catches a missed `globalThis`. same shared
  // realm, evals are sequential, so the window between define and delete covers only the native import.
  // NON-enumerable so a globalThis rest/spread/Object.keys probe counts the same as the outputs (a bare
  // `self` still resolves - identifier [[Get]] ignores the enumerable flag)
  let t0 = process.hrtime.bigint();
  const native = await cached({
    type: 'native',
    code: src,
    evaluate: async () => {
      Object.defineProperty(globalThis, 'self', { value: globalThis, configurable: true, enumerable: false, writable: true });
      try {
        return await evalInRealm(lazyModule(src, ts));
      } finally {
        delete globalThis.self;
      }
    },
  });
  mark('eval native', t0);
  // AST-engine print-through leg: printed source must reproduce the native reference in the
  // full env. runs under the same `self` aliasing as native - it IS native semantics, only
  // re-printed. gated on native producing a value for the same reason the stripped leg is:
  // ERR == ERR would pass vacuously on error-name collapse
  let astPrintMismatch = false;
  let astPrintRun = null;
  if (!native.startsWith('ERR')) {
    t0 = process.hrtime.bigint();
    const astPrinted = printThroughAst(src, ts);
    if (astPrinted !== null) {
      astPrintRun = await cached({
        type: 'ast-print',
        code: astPrinted,
        evaluate: async () => {
          Object.defineProperty(globalThis, 'self', { value: globalThis, configurable: true, enumerable: false, writable: true });
          try {
            return await evalInRealm(lazyModule(astPrinted, ts));
          } finally {
            delete globalThis.self;
          }
        },
      });
      astPrintMismatch = astPrintRun !== native;
    }
    mark('ast print-through', t0);
  }
  t0 = process.hrtime.bigint();
  // the two files are shared with the stripped legs below: same bytes, written at most once, and
  // not written at all when both realms answer from the cache
  const babelFile = lazyModule(babelOut, ts);
  const unpluginFile = lazyModule(unpluginOut, ts);
  const babelRun = WANT_BABEL ? await cached({ type: 'pure-babel', code: babelOut, evaluate: () => evalInRealm(babelFile) }) : null;
  const unpluginRun = WANT_UNPLUGIN ? await cached({ type: 'pure-unplugin', code: unpluginOut, evaluate: () => evalInRealm(unpluginFile) }) : null;
  mark('eval transformed x2', t0);

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
    t0 = process.hrtime.bigint();
    babelStripped = WANT_BABEL
      ? await cached({ type: 'strip-babel', code: babelOut, evaluate: async () => evalStripped(await babelFile()) })
      : null;
    unpluginStripped = WANT_UNPLUGIN
      ? await cached({ type: 'strip-unplugin', code: unpluginOut, evaluate: async () => evalStripped(await unpluginFile()) })
      : null;
    strippedMismatch = (WANT_BABEL && babelStripped !== native) || (WANT_UNPLUGIN && unpluginStripped !== native);
    mark('stripped worker x2', t0);
  }

  return {
    importMismatch: EMITTER === 'both' && !setEqual(babelImports, unpluginImports),
    runtimeMismatch: (WANT_BABEL && native !== babelRun) || (WANT_UNPLUGIN && native !== unpluginRun),
    pluginRuntimeDiverge: EMITTER === 'both' && babelRun !== unpluginRun,
    strippedMismatch,
    astPrintMismatch,
    babelImports,
    unpluginImports,
    native,
    babelRun,
    unpluginRun,
    babelStripped,
    unpluginStripped,
    astPrintRun,
  };
}

// interpret a verdict: is it a failure, and (if so) the human-readable detail. lives next to
// checkSnippet so the verdict's shape and its meaning stay in one place - a runner shouldn't decode
// the verdict's internals itself. `detail` is empty when not failed
export function summarizeVerdict(v) {
  if (!(v.transformCrash || v.importMismatch || v.runtimeMismatch || v.strippedMismatch || v.astPrintMismatch)) {
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
  if (v.astPrintMismatch) {
    details.push(`ast print-through native=${ v.native } printed=${ v.astPrintRun }`);
  }
  return { failed: true, detail: details.join('; ') };
}
