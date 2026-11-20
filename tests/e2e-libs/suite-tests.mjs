import { deepEqual, rejects, strictEqual, throws } from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { runInNewContext } from 'node:vm';
import { assertES5 } from '../../scripts/assert-es5.mjs';
import { closeRollupBundle, makeStrictWarn } from '../transpiler-integration/warning-policy.mjs';
import { checkResultProblem } from './diagnostics.mjs';
import { deepEqual as exerciseEqual } from './exercises/checks.mjs';
import { reconcileRows, runtimeVerdict } from './manifest.mjs';
import { cellScript } from './page.mjs';
import { HERE, ROOT } from './paths.mjs';
import { assertWorkspacePayload } from './payload.mjs';

const sparse = [];
sparse.length = 2;
strictEqual(exerciseEqual(sparse, ['a', 'b']), false);
strictEqual(exerciseEqual(['a', 'b'], sparse), false);
strictEqual(exerciseEqual(sparse, sparse.slice()), true);
strictEqual(exerciseEqual(sparse, [undefined, undefined]), false);

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

const label = '\u2028\u2029</script>';
const script = cellScript(label, [label]);
assertES5(script, 'generated cell script');
const window = {};
runInNewContext(script, { window });
strictEqual(window.E2E_CELL.label, label);
strictEqual(window.E2E_CELL.expected[0], label);
strictEqual(script.includes('</script>'), false);

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
  window.onerror('uncaught in frame', 'bundle.js', 20);
  return { checks: valid };
};
await rejects(browserRun, /uncaught in frame/u);

// Model the DOM task queued for a rejection before toggle from the success path.
const timers = [];
const domTasks = [];
const rejectionEvents = new Map();
const details = {
  ontoggle: null,
  get open() { return false; },
  set open(value) { if (value) domTasks.push(this.ontoggle); },
};
const modernExercise = { run: () => ({ checks: valid }) };
const modern = {
  PromiseRejectionEvent: class {},
  addEventListener: (type, handler) => rejectionEvents.set(type, handler),
};
runInNewContext(browserPrograms, {
  window: modern,
  document: { createElement: () => details },
  E2E: modernExercise,
  setTimeout: task => timers.push(task),
});
const verdict = new Promise((resolve, reject) => modern.e2eRun(resolve, reject));
domTasks.push(() => rejectionEvents.get('unhandledrejection')({ reason: 'same-turn rejection' }));
timers.shift()();
strictEqual(timers.length, 0);
strictEqual(domTasks.length, 2);
while (domTasks.length) domTasks.shift()();
await rejects(verdict, /unhandled rejection - same-turn rejection/u);
delete modern.e2eUncaughtError;
modernExercise.run = () => {
  domTasks.push(() => rejectionEvents.get('unhandledrejection')({ reason: 'same-turn independent failure' }));
  throw new Error('known failure');
};
const afterThrow = new Promise((resolve, reject) => modern.e2eRun(resolve, reject));
timers.shift()?.();
while (domTasks.length) domTasks.shift()();
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
while (timers.length) timers.shift()();
while (immediates.length) immediates.shift()();
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
  import { rawChecks } from ${ JSON.stringify(rawModule) };
  import { strippedFails, strippedLeg } from ${ JSON.stringify(strippedModule) };
  const { run: highlight } = await import(${ JSON.stringify(highlightModule) });
  const hljs = createRequire(${ JSON.stringify(highlightModule) })('highlight.js');
  hljs.unregisterLanguage('ada');
  const grammar = highlight().checks.find(check => check.label === 'grammar_registry');
  deepEqual(grammar.actual, { missing: ['ada'], unexpected: [] });
  deepEqual(grammar.pass, false);

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
    const finish = 'setTimeout(() => { try { require("node:fs").writeFileSync('
      + JSON.stringify(completed) + ', "done"); } catch {} }, 5000)';
    await writeFile(blocked, 'import { execFileSync } from "node:child_process";'
      + 'import { writeFileSync } from "node:fs";'
      + 'export function run() { writeFileSync(' + JSON.stringify(marker) + ', "started");'
      + 'execFileSync(process.execPath, ["-e", ' + JSON.stringify(finish) + '], { stdio: "ignore" }); }');
    await rejects(rawChecks(blocked, { timeout: 1000 }), /blocked\\.mjs run\\(\\) did not finish within 1000ms/);
    deepEqual(await readFile(marker, 'utf8'), 'started');
    await rejects(access(completed), { code: 'ENOENT' }, 'the watchdog must interrupt the native wait');
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }

  const expected = ['ok'];
  const run = code => strippedLeg(code, 'probe', expected, 500);
  const expired = /probe in the stripped realm did not finish within 500ms/;
  const timeout = await run('for (;;) {}');
  match(timeout.reason, expired);
  deepEqual(strippedFails(timeout, 'pre'), true);
  const helperError = await run('this.E2E = {run: function () { Array.from([]); }}');
  match(helperError.reason, /Array.from is not a function/);
  deepEqual(strippedFails(helperError, 'pre'), false);
  deepEqual(strippedFails(helperError, 'post'), true);
  match((await run('this.E2E = {run: function () { for (;;) {} }}')).reason, expired);
  const unsettled = 'this.E2E = {run: function () { return {then: function () {}}; }}';
  match((await run(unsettled)).reason, expired);
  const valid = 'this.E2E = {run: function () { return {then: function (resolve) {'
    + 'setInterval(function () {}, 60000); setTimeout(function () { resolve({checks:[{label:"ok",pass:true}]}); }, 0);'
    + '}}; }}';
  deepEqual(await run(valid), { ok: true, count: 1 });
  const late = 'this.E2E={run:function(){function later(n){'
    + 'if(n)queueMicrotask(function(){later(n-1);});else setInterval(function(){},60000);'
    + '}later(25);return {checks:[{label:"ok",pass:true}]};}}';
  deepEqual(await run(late), { ok: true, count: 1 });
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
    match((await run(stalled)).reason, expired);
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
await promisify(execFile)(process.execPath, ['--input-type=module', '-e', probe], { timeout: 15_000 });
