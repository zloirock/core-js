import { deepEqual, rejects, strictEqual, throws } from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, join, parse } from 'node:path';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';
import { assertES5 } from '../../scripts/assert-es5.mjs';
import { closeRollupBundle, makeStrictWarn } from '../transpiler-integration/warning-policy.mjs';
import { allCells } from './cells.mjs';
import { checkFailureLine, checkResultProblem, errorReason, renderValue } from './diagnostics.mjs';
import { deepEqual as exerciseEqual } from './exercises/checks.mjs';
import { reconcileRows, runtimeVerdict } from './manifest.mjs';
import { cellScript } from './page.mjs';
import { HERE, ROOT, isCoreJsModule } from './paths.mjs';
import { isSnapshotName } from './snapshots.mjs';
import { assertWorkspacePayload } from './payload.mjs';

const sparse = [];
sparse.length = 2;
strictEqual(exerciseEqual(sparse, ['a', 'b']), false);
strictEqual(exerciseEqual(['a', 'b'], sparse), false);
strictEqual(exerciseEqual(sparse, sparse.slice()), true);
strictEqual(exerciseEqual(sparse, [undefined, undefined]), false);

let reads = 0;
const projected = {
  get toJSON() {
    const value = ++reads;
    function method() { return this === projected ? value : null; }
    method.call = () => 2;
    return method;
  },
};
strictEqual(exerciseEqual(projected, 1), true);
strictEqual(reads, 1);

strictEqual(errorReason({ get stderr() { throw new Error('broken stderr'); }, message: 'original cause' }), 'original cause');
strictEqual(renderValue(undefined) === renderValue('undefined'), false);
strictEqual(renderValue(sparse) === renderValue([undefined, undefined]), false);
function books(title) { return { author: { all: [{ title }] } }; }
const detail = checkFailureLine({ label: 'books', actual: books('BrokenA'), expected: books('Alpha') });
strictEqual(detail.includes('BrokenA') && detail.includes('Alpha'), true);
const longString = '\n'.repeat(4096);
strictEqual(renderValue(longString), `${ JSON.stringify(longString).slice(0, 2045) }...`);
for (const suffix of ['green', '']) {
  const failure = checkFailureLine({ label: 'svg', actual: `${ longString }red`, expected: longString + suffix });
  const tail = longString.slice(-24);
  strictEqual(failure, `svg actual=at offset 4096 ${ JSON.stringify(`${ tail }red`) } expected=at offset 4096 ${ JSON.stringify(tail + suffix) }`);
}
const earlyDifference = checkFailureLine({ label: 'svg', actual: `a${ longString }`, expected: `b${ longString }` });
strictEqual(earlyDifference.includes('actual=at offset 0 "a') && earlyDifference.includes('expected=at offset 0 "b'), true);
const hostile = { get [Symbol.toStringTag]() { throw new Error('broken tag'); } };
hostile.cycle = hostile;
strictEqual(checkFailureLine({ label: 'hostile', actual: hostile, expected: {} }).startsWith('hostile actual='), true);

const { hasOwn } = Object;
try {
  Object.hasOwn = () => false;
  strictEqual(exerciseEqual([1], [2]), false);
  strictEqual(exerciseEqual(sparse, ['a', 'b']), false);
} finally {
  Object.hasOwn = hasOwn;
}

const { isNaN } = Number;
try {
  Number.isNaN = () => true;
  strictEqual(exerciseEqual(1, 2), false);
  strictEqual(exerciseEqual(NaN, NaN), true);
  strictEqual(exerciseEqual(NaN, null), false);
} finally {
  Number.isNaN = isNaN;
}

const first = { label: 'first' };
const second = { label: 'second' };
const cells = [first, second];
deepEqual(reconcileRows(cells, [second, first]), cells);
throws(() => reconcileRows(cells, [first]), /expected 2 cell results/u);
throws(() => reconcileRows(cells, [first, first]), /1 unique/u);
throws(() => reconcileRows(cells, [first, { label: 'unrequested' }]), /missing result for second/u);
deepEqual(runtimeVerdict('drift', false), { runtime: 'failed', snapshotState: 'drift' });
deepEqual(runtimeVerdict('updated', false), { runtime: 'failed', snapshotState: 'updated' });
deepEqual(runtimeVerdict('ok', true), { runtime: 'failed', snapshotState: 'ok' });
deepEqual(runtimeVerdict('providers agree', false), { runtime: 'passed', snapshotState: 'providers agree' });

const legacy = join(HERE, 'node_modules', 'core-js-pure', 'modules', 'es.array.map.js');
const pure = join(ROOT, 'packages', 'core-js-pure', 'modules', 'es.array.map.js');
const global = join(ROOT, 'packages', 'core-js', 'modules', 'es.array.map.js');
strictEqual(isCoreJsModule(pure), true);
if (process.platform === 'win32') strictEqual(isCoreJsModule(join(ROOT.toUpperCase(), 'packages', 'core-js', 'index.js')), true);
strictEqual(isCoreJsModule(legacy), true);
const otherCheckout = join(parse(ROOT).root, `${ basename(ROOT) }-sibling`);
strictEqual(isCoreJsModule(join(otherCheckout, 'packages', 'core-js', 'index.js')), false);
strictEqual(isCoreJsModule(join(otherCheckout, 'node_modules', 'fixture', 'packages', 'core-js', 'tests', 'exercise.mjs')), false);
strictEqual(isCoreJsModule(join(ROOT, 'packages', 'core-js', 'node_modules', 'three', 'index.js')), false);
for (const { snapshot } of allCells([{ name: 'example' }])) {
  if (snapshot) strictEqual(isSnapshotName(snapshot), true);
}
// A previously emitted suffix stays recognizable after its phase is removed.
strictEqual(isSnapshotName('minimatch.unplugin.usage-global.pre+post.txt'), true);
strictEqual(isSnapshotName('minimatch.unplugin.usage-global.notes.txt'), false);
strictEqual(isSnapshotName('retired.lib.unplugin.usage-pure.pre+post.txt'), true);
strictEqual(isSnapshotName('review-notes.md'), false);
strictEqual(isSnapshotName('notes about.babel-plugin.usage-global.txt'), false);
strictEqual(isSnapshotName('.babel-plugin.usage-global.txt'), false);
const chunk = { modules: { [legacy]: { renderedLength: 199_000 }, [pure]: { renderedLength: 2_000 } } };
throws(() => assertWorkspacePayload({ chunk }, 'XRegExp'), /only 2000b of workspace core-js/u);
chunk.modules[global] = { renderedLength: 8_000 };
assertWorkspacePayload({ chunk }, 'XRegExp');

const warn = makeStrictWarn('core-js-unplugin');
const sibling = { code: 'PLUGIN_WARNING', plugin: 'core-js-unplugin-helper', message: 'sibling warning' };
let forwarded;
warn(sibling, warning => { forwarded = warning; });
strictEqual(forwarded, sibling);
for (const plugin of ['core-js-unplugin', 'core-js-unplugin:post']) {
  throws(() => warn({ ...sibling, plugin }), /sibling warning/u);
}

const { warn: logWarning } = console;
const warnings = [];
try {
  console.warn = message => warnings.push(message);
  await rejects(async () => {
    try {
      throw new Error('generation failed');
    } finally {
      await closeRollupBundle({ async close() { throw new Error('cleanup failed'); } });
    }
  }, /generation failed/u);
} finally {
  console.warn = logWarning;
}
deepEqual(warnings, ['could not close Rollup bundle: cleanup failed']);

const label = '\u2028\u2029<!--<script></script>';
const script = cellScript(label, [label]);
assertES5(script, 'generated cell script');
const window = {};
runInNewContext(script, { window });
strictEqual(window.E2E_CELL.label, label);
strictEqual(window.E2E_CELL.expected[0], label);
strictEqual(script.includes('<'), false);

const browserPrograms = (await Promise.all(['trap.js', 'shared.js']
  .map(name => readFile(join(HERE, 'harness', name), 'utf8')))).join('\n');
const E2E = { run: () => ({ checks: { length: 1 } }) };
const events = new Map();
window.addEventListener = (type, handler) => events.set(type, handler);
runInNewContext(browserPrograms, { window, E2E, setTimeout });
function browserRun() {
  return new Promise((resolve, reject) => window.e2eRun(resolve, reject));
}
await rejects(browserRun, /did not return a checks array/u);
E2E.run = () => ({ checks: sparse });
await rejects(browserRun, /malformed check at index 0/u);
const valid = [{ label: 'working', pass: true }];
E2E.run = () => ({ checks: valid });
strictEqual((await browserRun())[0].label, valid[0].label);
E2E.run = () => {
  const check = { label: 'first', pass: false };
  // eslint-disable-next-line unicorn/no-thenable -- exercise the browser's thenable boundary
  return { then(resolve, reject) {
    resolve({ checks: [check] });
    check.pass = true;
    reject(new Error('late thenable rejection'));
  } };
};
strictEqual((await browserRun())[0].pass, false);
let thenReads = 0;
const oneRead = {
  // eslint-disable-next-line unicorn/no-thenable -- exercise a thenable with an accessor
  get then() {
    if (++thenReads > 1) throw new Error('then read twice');
    function then(resolve) { if (this === oneRead) resolve({ checks: valid }); }
    then.call = null;
    return then;
  },
};
E2E.run = () => oneRead;
strictEqual((await browserRun())[0].label, valid[0].label);
strictEqual(thenReads, 1);
strictEqual(window.e2eReason({
  get message() { throw new Error('no message'); },
  toString() { throw new Error('no string'); },
  name: 'reason from name',
}), 'reason from name');
events.get('unhandledrejection')({ reason: 'rejected while loading the bundle' });
await rejects(browserRun, /unhandled rejection - rejected while loading the bundle/u);
delete window.e2eUncaughtError;
E2E.run = () => new Promise(resolve => {
  queueMicrotask(() => {
    events.get('unhandledrejection')({ reason: new Error('unhandled during active run') });
    resolve({ checks: valid });
  });
});
await rejects(browserRun, /unhandled rejection - unhandled during active run/u);
delete window.e2eUncaughtError;
E2E.run = async () => {
  window.onerror = () => true;
  events.get('error')({ message: 'uncaught in frame', filename: 'bundle.js', lineno: 20 });
  return { checks: valid };
};
await rejects(browserRun, /uncaught in frame/u);

// The exercise's rejection and the native marker share a tracker. Timers can run before
// either event. Only the marker itself may release a pending verdict.
function runTasks(tasks) {
  for (const task of tasks) task();
  tasks.length = 0;
}
const timers = [];
const pendingRejections = [];
const rejectionEvents = new Map();
let prevented = 0;
let stopped = 0;
function dispatch(promise, reason) {
  rejectionEvents.get('unhandledrejection')({
    promise, reason,
    preventDefault() { prevented++; },
    stopImmediatePropagation() { stopped++; },
  });
}
const modernExercise = { run: () => ({ checks: valid }) };
const modern = {
  PromiseRejectionEvent: class {},
  Promise: class {
    constructor(executor) {
      executor(undefined, reason => pendingRejections.push(() => dispatch(this, reason)));
    }
  },
  addEventListener: (type, handler) => rejectionEvents.set(type, handler),
};
runInNewContext(browserPrograms, {
  window: modern,
  // A queued toggle can run while WebKit still holds the rejection.
  document: { createElement: () => ({
    ontoggle: null,
    get open() { return false; },
    set open(value) { if (value) timers.push(this.ontoggle); },
  }) },
  E2E: modernExercise,
  setTimeout: task => timers.push(task),
});
const verdict = new Promise((resolve, reject) => modern.e2eRun(resolve, reject));
pendingRejections.push(() => dispatch({}, 'same-turn rejection'));
runTasks(timers);
strictEqual(pendingRejections.length, 2);
runTasks(pendingRejections);
await rejects(verdict, /unhandled rejection - same-turn rejection/u);
strictEqual(prevented, 1);
strictEqual(stopped, 1);
delete modern.e2eUncaughtError;
modernExercise.run = () => {
  pendingRejections.push(() => dispatch({}, 'same-turn independent failure'));
  throw new Error('known failure');
};
const afterThrow = new Promise((resolve, reject) => modern.e2eRun(resolve, reject));
runTasks(timers);
runTasks(pendingRejections);
await rejects(afterThrow, /unhandled rejection - same-turn independent failure/u);

const immediates = [];
delete modern.PromiseRejectionEvent;
delete modern.e2eUncaughtError;
modern.setImmediate = task => immediates.push(task);
modernExercise.run = () => {
  immediates.push(() => rejectionEvents.get('unhandledrejection')({ reason: 'legacy independent failure' }));
  throw new Error('known failure');
};
const legacyThrow = new Promise((resolve, reject) => modern.e2eRun(resolve, reject));
runTasks(timers);
runTasks(immediates);
await rejects(legacyThrow, /unhandled rejection - legacy independent failure/u);
strictEqual(modern.e2eLabelProblem(valid, ['working', 'lost']),
  'check #2 expected "lost" from the raw exercise, got no check');
strictEqual(modern.e2eLabelProblem(valid, ['working']), null);

const colorjsLabels = ['percent_parse', 'gamut', 'delta_e'];
const colorjsChecks = colorjsLabels.map(name => ({ label: name, pass: true }));
strictEqual(checkResultProblem(colorjsChecks, colorjsLabels), null);
strictEqual(checkResultProblem([colorjsChecks[0], colorjsChecks[2]], colorjsLabels),
  'check #2 expected "gamut" from the raw exercise, got "delta_e"');
strictEqual(checkResultProblem([colorjsChecks[1]], ['gamut', 'delta_e']),
  'check #2 expected "delta_e" from the raw exercise, got no check');
strictEqual(checkResultProblem(colorjsChecks.slice(1), ['gamut']),
  'unexpected check "delta_e" at #2');
strictEqual(checkResultProblem([{ label: 'gamut', pass: 'false' }], ['gamut']), 'run() returned a malformed check at index 0');

// A child makes lingering handles observable without leaving them in the raw tier.
const strippedModule = new URL('./stripped-realm.mjs', import.meta.url).href;
const rawModule = new URL('./raw-exercise.mjs', import.meta.url).href;
const highlightModule = new URL('./exercises/highlight.mjs', import.meta.url).href;
const probe = `
  import { deepEqual, match, rejects } from 'node:assert/strict';
  import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
  import { createRequire } from 'node:module';
  import { tmpdir } from 'node:os';
  import { join } from 'node:path';
  import { pathToFileURL } from 'node:url';
  import { preflight } from ${ JSON.stringify(new URL('./preflight.mjs', import.meta.url).href) };
  import { runWithDeadline } from ${ JSON.stringify(new URL('./deadline.mjs', import.meta.url).href) };
  import { rawChecks } from ${ JSON.stringify(rawModule) };
  import { strippedFails, strippedLeg } from ${ JSON.stringify(strippedModule) };
  const { run: highlight } = await import(${ JSON.stringify(highlightModule) });
  const hljs = createRequire(${ JSON.stringify(highlightModule) })('highlight.js');
  hljs.unregisterLanguage('ada');
  const grammar = highlight().checks.find(check => check.label === 'grammar_registry');
  deepEqual(grammar.actual, { missing: ['ada'], unexpected: [] });
  deepEqual(grammar.pass, false);

  const getter = 'this.E2E={run(){let reads=0; return {checks:[{label:"x",get pass(){return reads++ > 0;}}]};}};';
  deepEqual((await preflight(getter, 'single-read'))[0].pass, false);
  deepEqual((await strippedLeg(getter, 'single-read', ['x'])).checksFailed, true);
  const longLabel = '\u{1F30D}'.repeat(40_000);
  const bundle = 'console.log("library ready"); const value = { large: 1n }; value.self = value;'
    + 'this.E2E = { run() { setInterval(() => {}, 60000); return { checks: [{ label: '
    + JSON.stringify(longLabel) + ', pass: true, actual: value, expected: value }] }; } };';
  deepEqual(await preflight(bundle, 'ipc'), [{ label: longLabel, pass: true, failure: null }]);
  await rejects(preflight('this.E2E = { run() { return { checks: [{ label:"x", pass: Object(true) }] }; } };', 'type'),
    /malformed check/);
  await rejects(preflight('this.E2E = { run() { Promise.reject(new Error("late")); return { checks: [] }; } };', 'reject'),
    /unhandled rejection - late/);

  const scratch = await mkdtemp(join(tmpdir(), 'core-js-e2e-deadline-'));
  try {
    const stalled = join(scratch, 'stalled.mjs');
    const progress = join(scratch, 'progress.mjs');
    await writeFile(progress, 'export function run() { process.send({ action: "progress" });'
      + 'return { checks: [{ label: "ok", pass: true }] }; }');
    deepEqual(await rawChecks(progress), [{ label: 'ok', pass: true, failure: null }]);
    const mutating = join(scratch, 'mutating.mjs');
    await writeFile(mutating, 'const check = { label: "ok", pass: true, actual: { n: 0 } };'
      + 'export function run() { check.actual.n++; return { checks: [check] }; }');
    await rejects(rawChecks(mutating, { repeat: true }), /not deterministic: 'ok' gave .*1.*first run.*2.*second/);
    await writeFile(stalled, 'export function run() { for (;;) {} }');
    await rejects(rawChecks(stalled, { timeout: 500 }), /stalled\\.mjs run\\(\\) did not finish within 500ms/);
    const twice = join(scratch, 'twice.mjs');
    await writeFile(twice, 'export async function run() { await new Promise(resolve => setTimeout(resolve, 400));'
      + 'return { checks: [{ label: "ok", pass: true }] }; }');
    deepEqual(await rawChecks(twice, { repeat: true, timeout: 700 }), [{ label: 'ok', pass: true, failure: null }]);
    const blocked = join(scratch, 'blocked.mjs');
    const marker = join(scratch, 'started');
    const completed = join(scratch, 'completed');
    const release = join(scratch, 'release');
    const finish = 'const fs = require("node:fs"); fs.writeFileSync(' + JSON.stringify(marker) + ', "started");'
      + 'const timer = setInterval(() => { if (fs.existsSync(' + JSON.stringify(release) + ')) {'
      + 'fs.writeFileSync(' + JSON.stringify(completed) + ', "done"); clearInterval(timer); } }, 10);'
      + 'setTimeout(() => clearInterval(timer), 5000).unref();';
    // Wait for the nested Node to start before arming the short exercise watchdog.
    await writeFile(blocked, 'import { fork } from "node:child_process"; import { once } from "node:events";'
      + 'const child = fork(' + JSON.stringify(join(scratch, 'nested.cjs')) + ', [], { execArgv: [] });'
      + 'await once(child, "message"); export function run() { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0); }');
    await writeFile(join(scratch, 'nested.cjs'), finish + 'process.send("ready");');
    await rejects(runWithDeadline(pathToFileURL(blocked).href, 'run', [], { ms: 500, what: 'nested command' }),
      /nested command did not finish within 500ms/);
    deepEqual(await readFile(marker, 'utf8'), 'started');
    await writeFile(release, 'release');
    await new Promise(resolve => setTimeout(resolve, 250));
    await rejects(access(completed), { code: 'ENOENT' }, 'the watchdog must stop the nested command');
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }

  const expected = ['ok'];
  const run = (code, timeout) => strippedLeg(code, 'probe', expected, timeout);
  const expired = /probe in the stripped realm did not finish within 500ms/;
  const timeout = await run('for (;;) {}', 500);
  match(timeout.reason, expired);
  deepEqual(strippedFails(timeout, 'pre'), true);
  const startupOptions = process.env.NODE_OPTIONS;
  try {
    process.env.NODE_OPTIONS = (startupOptions || '') + ' --import="data:text/javascript,await new Promise(r=>setTimeout(r,750))"';
    const afterStartup = await run('this.E2E={run:function(){Array.from([]);}}', 500);
    match(afterStartup.reason, /Array.from is not a function/);
  } finally {
    if (startupOptions === undefined) delete process.env.NODE_OPTIONS;
    else process.env.NODE_OPTIONS = startupOptions;
  }
  const helperError = await run('this.E2E = {run: function () { Array.from([]); }}');
  match(helperError.reason, /Array.from is not a function/);
  deepEqual(strippedFails(helperError, 'pre'), false);
  deepEqual(strippedFails(helperError, 'post'), true);
  match((await run('this.E2E = {run: function () { for (;;) {} }}', 500)).reason, expired);
  const unsettled = 'this.E2E = {run: function () { return {then: function () {}}; }}';
  match((await run(unsettled, 500)).reason, expired);
  const valid = 'this.E2E = {run: function () { return {then: function (resolve) {'
    + 'setInterval(function () {}, 60000); setTimeout(function () { resolve({checks:[{label:"ok",pass:true}]}); }, 0);'
    + '}}; }}';
  deepEqual(await run(valid), { ok: true, count: 1 });
  const late = 'this.E2E={run:function(){function later(n){'
    + 'if(n)queueMicrotask(function(){later(n-1);});else setInterval(function(){},60000);'
    + '}later(25);return {checks:[{label:"ok",pass:true}]};}}';
  deepEqual(await run(late), { ok: true, count: 1 });
  const callbackError = 'this.E2E={run:function(){queueMicrotask(function(){queueMicrotask(function(){Promise.resolve();});});'
    + 'return {checks:[{label:"ok",pass:true}]};}}';
  match((await run(callbackError)).reason, /Promise is not defined/);
  const latePromise = 'this.E2E={run:function(){'
    + '(async function () { for (var i = 0; i < 25; i++) await 0; setInterval(function () {}, 60000); })();'
    + 'return {checks:[{label:"ok",pass:true}]};}}';
  deepEqual(await run(latePromise), { ok: true, count: 1 });
  // A raw Promise read would succeed in the pre-flight, but the stripped realm removes it.
  for (const schedule of ['setTimeout', 'setInterval', 'queueMicrotask']) {
    const broken = 'this.E2E={run:function(){return {then:function(){'
      + schedule + '(function(){Promise.resolve();},0);'
      + '}};}}';
    match((await run(broken)).reason, /Promise is not defined/);
    const stalled = 'this.E2E={run:function(){return {then:function(){'
      + schedule + '(function(){for (;;) {}},0);'
      + '}};}}';
    match((await run(stalled, 500)).reason, expired);
  }
  const truncated = 'this.E2E={run:function(){return {checks:[]};}}';
  const loss = await run(truncated);
  match(loss.reason, /expected "ok" from the raw exercise, got no check/);
  deepEqual(loss.checksFailed, true);
  const malformed = 'this.E2E={run:function(){return {checks:[{label:"ok",pass:"false"}]};}}';
  const bad = await run(malformed);
  match(bad.reason, /malformed check at index 0/);
  deepEqual(bad.checksFailed, true);
  deepEqual(await run(valid), { ok: true, count: 1 });
`;
await promisify(execFile)(process.execPath, ['--input-type=module', '-e', probe], { timeout: 120_000 });
