import { deepEqual, rejects, strictEqual, throws } from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, parse } from 'node:path';
import { promisify, stripVTControlCharacters } from 'node:util';
import { runInNewContext } from 'node:vm';
import { assertES5 } from '../../scripts/assert-es5.mjs';
import { closeRollupBundle, makeStrictWarn } from '../transpiler-integration/warning-policy.mjs';
import { allCells, RUN_TIMEOUT_MS } from './cells.mjs';
import { checkFailureLine, checkResultProblem, errorReason, renderValue } from './diagnostics.mjs';
import { checker, deepEqual as exerciseEqual } from './exercises/checks.mjs';
import { assertExerciseRegistry, librariesMatching } from './libraries.mjs';
import { prepare, reconcileRows, runtimeVerdict } from './manifest.mjs';
import { announceCell, reportBrowserCell } from './output.mjs';
import { cellScript } from './page.mjs';
import { HERE, ROOT, isCoreJsModule } from './paths.mjs';
import { isSnapshotName } from './snapshots.mjs';
import { tsSources } from './ts-sources.mjs';
import { assertWorkspacePayload } from './payload.mjs';

const sparse = [];
sparse.length = 2;
strictEqual(exerciseEqual(sparse, ['a', 'b']), false);
strictEqual(exerciseEqual(['a', 'b'], sparse), false);
strictEqual(exerciseEqual(sparse, sparse.slice()), true);
strictEqual(exerciseEqual(sparse, [undefined, undefined]), false);

const enumerableX = { x: 1 };
const hiddenX = Object.defineProperty({ y: 2 }, 'x', { value: 1 });
strictEqual(exerciseEqual(enumerableX, hiddenX), false);
strictEqual(exerciseEqual(hiddenX, enumerableX), false);
strictEqual(exerciseEqual({ x: 1, y: 2 }, { y: 2, x: 1 }), true);
strictEqual(exerciseEqual(new Set([1]), new Set([2])), false);
strictEqual(exerciseEqual(new Set([1, 2]), new Set([2, 1])), false);
strictEqual(exerciseEqual(new Set([{ x: 1 }]), new Set([{ x: 1 }])), true);
strictEqual(exerciseEqual(new Map([['x', 1]]), new Map([['x', 2]])), false);
strictEqual(exerciseEqual(new Map([[{ x: 1 }, 2]]), new Map([[{ x: 1 }, 2]])), true);
const detached = checker();
for (const [name, first, second] of [
  ['set', new Set([1]), new Set([2])],
  ['map', new Map([['x', 1]]), new Map([['x', 2]])],
]) {
  const actual = Object.setPrototypeOf(first, null);
  const expected = Object.setPrototypeOf(second, Object.prototype);
  detached.check(name, actual, expected);
}
deepEqual(detached.checks.map(check => check.pass), [false, false]);
strictEqual(exerciseEqual(new Map(), new Set()), false);
strictEqual(exerciseEqual(new Set(), {}), false);
const foreign = runInNewContext('({ set: new Set([1]), map: new Map([["x", 1]]) })');
strictEqual(exerciseEqual(foreign.set, new Set([1])), true);
strictEqual(exerciseEqual(new Set([2]), foreign.set), false);
strictEqual(exerciseEqual(foreign.map, new Map([['x', 1]])), true);
strictEqual(exerciseEqual(foreign.map, {}), false);
strictEqual(exerciseEqual(new Set(), Object.create(Set.prototype)), false);
for (const [prototype, first, second, remote] of [
  [Set.prototype, new Set([1]), new Set([2]), foreign.set],
  [Map.prototype, new Map([['x', 1]]), new Map([['x', 2]]), foreign.map],
]) {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'forEach');
  delete prototype.forEach;
  try {
    strictEqual(exerciseEqual(first, remote), true);
    strictEqual(exerciseEqual(second, remote), false);
    strictEqual(exerciseEqual(first, second), false);
  } finally {
    Object.defineProperty(prototype, 'forEach', descriptor);
  }
}
class Bag {
  #items = [7];
  get size() { return this.#items.length; }
  add() { return this; }
  forEach(fn) { fn(7, 7, this); }
  toString() { throw new Error('comparison formatted an ordinary object'); }
}
strictEqual(exerciseEqual(new Set([7]), new Bag()), false);
strictEqual(exerciseEqual(new Bag(), foreign.set), false);
Object.defineProperty(Bag.prototype, Symbol.toStringTag, { value: 'Set' });
strictEqual(exerciseEqual(new Set([7]), new Bag()), false);
const requirePure = createRequire(import.meta.url);
const PureMap = requirePure('@core-js/pure/full/map');
const PureSet = requirePure('@core-js/pure/full/set');
const contents = new WeakMap();
const pureSize = Object.getOwnPropertyDescriptor(PureSet.prototype, 'size').get;
class SetView {
  constructor() { contents.set(this, new PureSet([7])); }
  get size() { return pureSize.call(contents.get(this)); }
  add(value) { contents.get(this).add(value); }
  forEach(visit) { contents.get(this).forEach(visit); }
}
Object.defineProperty(SetView.prototype, Symbol.toStringTag, { value: 'Set' });
strictEqual(exerciseEqual(new SetView(), new Set([7])), false);
strictEqual(exerciseEqual(new PureMap([['x', 1]]), foreign.map), true);
strictEqual(exerciseEqual(new PureSet([2]), foreign.set), false);
strictEqual(exerciseEqual(new PureSet([7]), new Bag()), false);
Object.defineProperty(Bag.prototype, 'size', { get() { return 1; } });
strictEqual(exerciseEqual(new Bag(), new Set([7])), false);
function ignoreElements() { /* The comparator must read elements through the prototype. */ }
const firstSet = Object.assign(new Set([1]), { forEach: ignoreElements, note: 'same' });
const secondSet = Object.assign(new Set([2]), { forEach: ignoreElements, note: 'same' });
strictEqual(exerciseEqual(firstSet, secondSet), false);
const sameSet = Object.assign(new Set([1]), { forEach: ignoreElements, note: 'different' });
strictEqual(exerciseEqual(firstSet, sameSet), false);
const field = Symbol('field');
for (const create of [() => ({}), () => [], () => new Map(), () => new Set([1])]) {
  const { checks, check } = checker();
  const actual = Object.assign(create(), { [field]: 1 });
  const expected = Object.assign(create(), { [field]: 1 });
  check('equal', actual, expected);
  expected[field] = 2;
  check('different value', actual, expected);
  strictEqual(checkFailureLine(checks[1]), 'different value actual=at [Symbol(field)] 1 expected=at [Symbol(field)] 2');
  delete expected[field];
  expected[Symbol('field')] = 1;
  check('different key', actual, expected);
  strictEqual(checkFailureLine(checks[2]), 'different key actual=at [Symbol(field)] 1 expected=at [Symbol(field)] <missing>');
  delete actual[field];
  check('extra key', actual, expected);
  strictEqual(checkFailureLine(checks[3]), 'extra key actual=at [Symbol(field)] <missing> expected=at [Symbol(field)] 1');
  deepEqual(checks.map(row => row.pass), [true, false, false, false]);
}
const diagnostic = checker();
const wide = Array(128).fill('long common prefix');
diagnostic.check('length', wide, [...wide, 'tail']);
strictEqual(checkFailureLine(diagnostic.checks[0]), 'length actual=at [length] 128 expected=at [length] 129');
const disappearing = { x: 1 };
diagnostic.check('removed', disappearing, new Proxy({}, {
  ownKeys() {
    delete disappearing.x;
    return [];
  },
}));
strictEqual(diagnostic.checks[1].pass, false);
strictEqual(checkFailureLine(diagnostic.checks[1]), 'removed actual=at [x] "<removed during enumeration>" expected=at [x] <missing>');
const cycle = { value: 1 };
cycle.self = cycle;
const twinCycle = { value: 1 };
twinCycle.self = twinCycle;
strictEqual(exerciseEqual(cycle, twinCycle), true);
strictEqual(exerciseEqual(cycle, { value: 1, self: twinCycle }), false);
const sharedRoot = { value: 1, self: cycle };
strictEqual(exerciseEqual(cycle, sharedRoot), false);
strictEqual(exerciseEqual(sharedRoot, cycle), false);
const leftRoot = {};
const sharedBranch = { parent: leftRoot };
leftRoot.branch = sharedBranch;
const rightRoot = { branch: sharedBranch };
strictEqual(exerciseEqual(leftRoot, rightRoot), false);
strictEqual(exerciseEqual(rightRoot, leftRoot), false);
// Two references per level, one distinct node per level. Bound property reads instead of wall time.
let leafReads = 0;
let branch = {
  get value() {
    leafReads++;
    return 1;
  },
};
const leaf = branch;
for (let i = 0; i < 16; i++) branch = { first: branch, second: branch };
strictEqual(exerciseEqual({ branch }, { branch }), true);
strictEqual(leafReads, 2);
leaf.self = leaf;
leafReads = 0;
strictEqual(exerciseEqual({ branch }, { branch }), true);
strictEqual(leafReads <= 4, true);
function linkedGraph(wrap) {
  const root = {};
  let node = {
    parent: root,
    get value() {
      leafReads++;
      return 1;
    },
  };
  for (let i = 0; i < 16; i++) node = { first: wrap(node), second: wrap(node) };
  root.start = node;
  return root;
}
for (const wrap of [node => node, node => ({ next: node })]) {
  leafReads = 0;
  strictEqual(exerciseEqual(linkedGraph(wrap), linkedGraph(wrap)), true);
  strictEqual(leafReads, 2);
}

// Forward shortcuts and backward edges give these twenty vertices many simple paths.
function ladder() {
  const nodes = Array.from({ length: 20 }, () => ({
    get value() {
      leafReads++;
      return 1;
    },
  }));
  for (const [index, node] of nodes.entries()) {
    if (index + 1 < nodes.length) node.next = nodes[index + 1];
    if (index + 2 < nodes.length) node.shortcut = nodes[index + 2];
    if (index) node.previous = nodes[index - 1];
  }
  return nodes[0];
}
leafReads = 0;
strictEqual(exerciseEqual(ladder(), ladder()), true);
strictEqual(leafReads, 40);

// A pair equal under one pair of ancestors can disagree when reached via another edge.
function ring(length) {
  const nodes = Array.from({ length }, () => ({}));
  for (const [index, node] of nodes.entries()) node.next = nodes[(index + 1) % length];
  return nodes[0];
}
strictEqual(exerciseEqual(ring(60), ring(61)), false);
function sharedPrefix(split, depth) {
  const child = {};
  const root = { first: child, second: split ? {} : child };
  root.first.back = root.second.back = root;
  let node = root;
  for (let i = 0; i < depth; i++) node = { first: node, second: node };
  return node;
}
let lookups = 0;
const mapHas = Map.prototype.has;
// eslint-disable-next-line no-extend-native -- count graph operations independently of machine speed
Map.prototype.has = function (key) {
  if (++lookups > 10000) throw new Error('shared cyclic graph exceeded its lookup budget');
  return mapHas.call(this, key);
};
try {
  strictEqual(exerciseEqual(sharedPrefix(false, 16), sharedPrefix(true, 16)), true);
} finally {
  // eslint-disable-next-line no-extend-native -- restore the intrinsic before any other test runs
  Map.prototype.has = mapHas;
}
const firstRing = { next: {} };
firstRing.next.next = firstRing;
const secondRing = { next: {} };
secondRing.next.next = secondRing;
strictEqual(exerciseEqual({ a: firstRing, b: firstRing.next }, { a: secondRing, b: { next: secondRing } }), false);
twinCycle.value = 2;
strictEqual(exerciseEqual(cycle, twinCycle), false);
const mapCycle = new Map();
const twinMapCycle = new Map();
mapCycle.set('self', mapCycle);
twinMapCycle.set('self', twinMapCycle);
strictEqual(exerciseEqual(mapCycle, twinMapCycle), true);

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

let projections = 0;
class ProjectedNode {
  constructor(value) { this.value = value; }
  toJSON() {
    projections++;
    return typeof this.value === 'number' ? this.value : { left: this.value, right: this.value };
  }
}
function projectedGraph(value) {
  let node = new ProjectedNode(value);
  for (let i = 0; i < 14; i++) node = new ProjectedNode(node);
  return node;
}
strictEqual(exerciseEqual(projectedGraph(1), projectedGraph(1)), true);
strictEqual(projections, 30);
strictEqual(exerciseEqual(projectedGraph(1), projectedGraph(2)), false);

const differing = checker();
function accessor(n) {
  return { get value() { return n; } };
}
differing.check('projected', accessor(2), accessor(1));
strictEqual(checkFailureLine(differing.checks[0]), 'projected actual=at [value] 2 expected=at [value] 1');
function projection(n) {
  return { toJSON() { return n; } };
}
differing.check('toJSON', projection(3), projection(1));
strictEqual(checkFailureLine(differing.checks[1]), 'toJSON actual=3 expected=1');
function proxy(value, stored) {
  return new Proxy({ n: stored }, { get: (target, key) => key === 'n' ? value : target[key] });
}
differing.check('proxy', proxy(1, 90), proxy(2, 91));
strictEqual(checkFailureLine(differing.checks[2]), 'proxy actual=at [n] 1 expected=at [n] 2');
const issues = [{ code: 'invalid_type', message: 'Expected a number' }];
strictEqual(errorReason(new Error(JSON.stringify(issues, null, 2))).includes('Expected a number'), true);
const indices = Array.from({ length: 150 }, (_, i) => i);
const damaged = indices.with(149, -1);
const mismatch = checkFailureLine({ label: 'geometry', actual: [indices], expected: [damaged] });
strictEqual(mismatch, 'geometry actual=at [0][149] 149 expected=at [0][149] -1');
strictEqual(errorReason(new Error(`raw exercise failed - ${ mismatch }`)), `raw exercise failed - ${ mismatch }`);
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
const shortString = `${ 'x'.repeat(2039) }A`;
const longTail = `${ 'x'.repeat(2039) }${ 'B'.repeat(4096) }`;
const shortWindow = `at offset 2039 "${ 'x'.repeat(24) }A"`;
const longWindow = `at offset 2039 "${ 'x'.repeat(24) }${ 'B'.repeat(24) }"`;
strictEqual(checkFailureLine({ label: 'asymmetric', actual: shortString, expected: longTail }),
  `asymmetric actual=${ shortWindow } expected=${ longWindow }`);
strictEqual(checkFailureLine({ label: 'asymmetric', actual: longTail, expected: shortString }),
  `asymmetric actual=${ longWindow } expected=${ shortWindow }`);
const earlyDifference = checkFailureLine({ label: 'svg', actual: `a${ longString }`, expected: `b${ longString }` });
strictEqual(earlyDifference.includes('actual=at offset 0 "a') && earlyDifference.includes('expected=at offset 0 "b'), true);
// URL's inspector needs the native internal slots.
strictEqual(renderValue(Object.create(URL.prototype)), '<unrenderable>');
throws(() => assertES5('() => 1', 'fixture'), /fixture: not ES5/u);
throws(() => librariesMatching('absent-library'), /no library matches filter/u);
assertExerciseRegistry(['one.mjs', 'checks.mjs', 'README.md'], ['one']);
throws(() => assertExerciseRegistry(['ready.mjs', 'unregistered.mjs'], ['ready', 'missing']),
  /missing: missing.mjs; unregistered: unregistered.mjs/u);
const resolveSource = tsSources().resolveId;
const resolvePublic = createRequire(import.meta.url).resolve;
for (const specifier of ['css-what/package.json', 'planck/dist/planck.mjs', 'planck/with-testbed']) {
  strictEqual(resolveSource(specifier), null);
  strictEqual(typeof resolvePublic(specifier), 'string');
}
strictEqual(resolveSource('entities/decode').endsWith(join('src', 'decode.ts')), true);
strictEqual(resolveSource('planck').endsWith(join('src', 'main.ts')), true);

const progressLog = [];
const verdictLog = [];
const printError = console.error;
const printVerdict = globalThis.echo;
const colorLevel = chalk.level;
try {
  console.error = line => progressLog.push(line);
  chalk.level = 1;
  globalThis.echo = line => verdictLog.push(line);
  const cell = { label: 'library/unplugin/usage-global' };
  announceCell(cell);
  reportBrowserCell(cell, ['Firefox']);
  reportBrowserCell(cell, ['IE'], true);
} finally {
  console.error = printError;
  globalThis.echo = printVerdict;
  chalk.level = colorLevel;
}
deepEqual(progressLog, ['Building library/unplugin/usage-global']);
strictEqual(verdictLog[0].startsWith('FAIL '), true);
strictEqual(verdictLog[0].includes('\x1B['), true);
deepEqual(verdictLog.map(stripVTControlCharacters), [
  'FAIL library/unplugin/usage-global in Firefox',
  '  expected browser diagnostic library/unplugin/usage-global in IE',
]);

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

const previousRun = await mkdtemp(join(tmpdir(), 'e2e-libs-artifacts-'));
let prepareTestError;
try {
  const manifest = join(previousRun, 'manifest.json');
  await writeFile(manifest, JSON.stringify({ cells: [] }));
  await rejects(prepare(176, 220, previousRun), /176 cells, under the floor of 220/u);
  await rejects(access(manifest), { code: 'ENOENT' });
} catch (error) {
  prepareTestError = error;
}
try {
  await rm(previousRun, { recursive: true, force: true });
} catch (cleanupError) {
  if (!prepareTestError) throw cleanupError;
  throw new AggregateError([prepareTestError, cleanupError], 'manifest preparation test and cleanup both failed', { cause: prepareTestError });
}
if (prepareTestError) throw prepareTestError;

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
throws(() => warn({ code: 'IMPORT_IS_UNDEFINED', message: 'absent export' }), /IMPORT_IS_UNDEFINED: absent export/u);
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
strictEqual(window.E2E_CELL.timeout, RUN_TIMEOUT_MS);
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
E2E.run = () => diagnostic;
const browserRows = await browserRun();
const pushed = [];
const driver = { ...window, E2E_FRAMES: [{ label: 'cell', frame: 'frame.html' }] };
runInNewContext(await readFile(join(HERE, 'harness/qunit.js'), 'utf8'), {
  window: driver,
  document: {
    getElementsByTagName: () => [{ src: '/test/frames.js' }],
    createElement: () => ({}),
    body: { appendChild() { driver.e2eFrameDone('cell', ['length', 'removed'], undefined, browserRows, null); } },
  },
  QUnit: {
    config: {},
    test(cellLabel, run) {
      strictEqual(cellLabel, 'cell');
      run({
        timeout() { /* synchronous frame */ },
        async: () => () => { /* synchronous frame */ },
        strictEqual,
        ok: (value, message) => strictEqual(value, true, message),
        pushResult: result => pushed.push({ ...result }),
      });
    },
  },
});
deepEqual(pushed, [
  { message: 'cell - length at [length]', result: false, actual: 128, expected: 129 },
  { message: 'cell - removed at [x] (missing on expected)', result: false, actual: '<removed during enumeration>', expected: '<missing>' },
]);
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
    function then(resolve) { if (this === oneRead) resolve(Promise.resolve({ checks: valid })); }
    then.call = null;
    return then;
  },
};
E2E.run = () => oneRead;
strictEqual((await browserRun())[0].label, valid[0].label);
strictEqual(thenReads, 1);
thenReads = 0;
E2E.run = () => ({
  // eslint-disable-next-line unicorn/no-thenable -- the first resolution adopts another thenable
  then(resolve, reject) {
    resolve(oneRead);
    resolve({ checks: [] });
    reject(new Error('late outer notification'));
  },
});
strictEqual((await browserRun())[0]?.label, valid[0].label);
strictEqual(thenReads, 1);
// Calling a nested thenable inline lets it observe an unfinished outer call and consumes
// one stack frame per resolution. The exercise's terminal checks still snapshot immediately.
for (const method of ['queueMicrotask', 'Promise', 'setImmediate']) {
  let scheduled = 0;
  class HostPromise extends Promise {
    // eslint-disable-next-line unicorn/no-thenable -- count jobs scheduled with the pre-bundle Promise method
    then(...args) {
      scheduled++;
      return Reflect.apply(Promise.prototype.then, this, args);
    }
  }
  const realm = {
    [method]: method === 'Promise' ? HostPromise : job => {
      scheduled++;
      globalThis[method](job);
    },
    addEventListener() { /* no independent rejection in this probe */ },
  };
  const check = { label: 'ready', pass: false };
  let chain = { checks: [check] };
  const depth = 5000;
  for (let index = 0; index < depth; index++) {
    const next = chain;
    chain = {
      // eslint-disable-next-line unicorn/no-thenable -- each step publishes state after resolving
      then(resolve) {
        resolve(next);
        check.pass = true;
      },
    };
  }
  runInNewContext(browserPrograms, { window: realm, E2E: { run: () => chain }, setTimeout });
  delete HostPromise.prototype.then;
  // The IE rejection tracker also uses setImmediate after the run.
  realm[method] = method === 'setImmediate' ? setImmediate : undefined;
  let timer;
  try {
    const rows = await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('nested thenables did not settle')), 10_000);
      realm.e2eRun(resolve, reject);
    });
    strictEqual(rows[0].pass, true);
    strictEqual(scheduled, depth - 1);
  } finally {
    clearTimeout(timer);
  }
}
E2E.run = () => ({
  // eslint-disable-next-line unicorn/no-thenable -- adoption must forward a nested getter failure
  then(resolve) { resolve({ get then() { throw new Error('nested getter'); } }); },
});
await rejects(browserRun, /nested getter/u);

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
await rejects(browserRun, /uncaught in frame \(bundle\.js:20\)/u);
delete window.e2eUncaughtError;
E2E.run = () => new Promise(() => { /* never settles */ });
let pendingError;
window.e2eRun(() => {
  throw new Error('pending exercise completed');
}, reason => { pendingError = reason; });
events.get('error')({ message: 'pending failure', filename: 'pending.js', lineno: 3 });
strictEqual(pendingError?.message, 'pending failure (pending.js:3)');
for (const mode of [7, 8, 10, 11, undefined]) {
  const document = { documentMode: mode };
  const realm = { document, addEventListener() { /* unused */ } };
  runInNewContext(browserPrograms, { window: realm, document, setTimeout });
  strictEqual(realm.e2eCompatibilityMode(), mode === 11 ? undefined : mode);
}

const banner = { innerText: '' };
const legacyDocument = { documentMode: 8, getElementById: id => id === 'banner' ? banner : null };
let frameResult;
const compatibilityWindow = {
  document: legacyDocument,
  parent: { e2eFrameDone: (...args) => { frameResult = args; } },
};
for (const name of ['frame.js', 'banner.js']) {
  const entry = await readFile(join(HERE, 'harness', name), 'utf8');
  runInNewContext(browserPrograms + script + entry, { window: compatibilityWindow, document: legacyDocument });
}
deepEqual(frameResult.slice(2), [8, null, 'IE compatibility mode']);
strictEqual(banner.className, 'red');
strictEqual(banner.innerText, 'IE compatibility mode - documentMode=8');

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
  import { fork } from 'node:child_process';
  import { once } from 'node:events';
  import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
  import { createRequire } from 'node:module';
  import { tmpdir } from 'node:os';
  import { join } from 'node:path';
  import { pathToFileURL } from 'node:url';
  import { preflight } from ${ JSON.stringify(new URL('./preflight.mjs', import.meta.url).href) };
  import { runWithDeadline, waitWithin } from ${ JSON.stringify(new URL('./deadline.mjs', import.meta.url).href) };
  import { errorReason } from ${ JSON.stringify(new URL('./diagnostics.mjs', import.meta.url).href) };
  import { rawChecks } from ${ JSON.stringify(rawModule) };
  import { strippedFails, strippedLeg } from ${ JSON.stringify(strippedModule) };
  const { run: highlight } = await import(${ JSON.stringify(highlightModule) });
  const hljs = createRequire(${ JSON.stringify(highlightModule) })('highlight.js');
  hljs.unregisterLanguage('ada');
  const grammar = highlight().checks.find(check => check.label === 'grammar_registry');
  deepEqual(grammar.actual, { missing: ['ada'], unexpected: [] });
  deepEqual(grammar.pass, false);
  hljs.getLanguage('abnf').unicodeRegex = true;
  const compiled = highlight().checks.find(check => check.label === 'compiled');
  deepEqual(compiled.actual.skipped, ['abnf', 'haskell', 'python', 'xml']);
  deepEqual(compiled.pass, false);

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
    await writeFile(stalled, 'export function run() { process.exit(23); }');
    await rejects(rawChecks(stalled), /exited with code 23 without a result/);
    // Windows reports a numeric exit code when a process terminates itself with SIGTERM.
    if (process.platform !== 'win32') {
      await writeFile(stalled, 'export function run() { process.kill(process.pid, "SIGTERM"); }');
      await rejects(rawChecks(stalled), /exited with SIGTERM without a result/);
    }
    const progress = join(scratch, 'progress.mjs');
    await writeFile(progress, 'export function run() { process.send({ action: "progress" });'
      + 'return { checks: [{ label: "ok", pass: true }] }; }');
    deepEqual(await rawChecks(progress), [{ label: 'ok', pass: true, failure: null }]);
    await writeFile(stalled, 'export function run() { process.send({ waiting: process.pid });'
      + 'Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30000); }');
    const supervised = fork(new URL(${ JSON.stringify(new URL('./deadline-child.mjs', import.meta.url).href) }), { execArgv: [] });
    const exited = once(supervised, 'exit');
    const waiting = new Promise(resolve => supervised.on('message', message => {
      if (message.waiting) resolve(message.waiting);
    }));
    let exercisePid;
    try {
      supervised.send({ module: pathToFileURL(stalled).href, method: 'run', args: [] });
      exercisePid = await waitWithin(waiting, 5000);
      if (!exercisePid) throw new Error('exercise never entered the blocking call');
      supervised.disconnect();
      deepEqual(await waitWithin(exited, 5000), [1, null]);
    } finally {
      if (supervised.exitCode === null && supervised.signalCode === null) {
        supervised.kill('SIGKILL');
        if (exercisePid) {
          try { process.kill(exercisePid, 'SIGKILL'); }
          catch (error) { if (error.code !== 'ESRCH') throw error; }
        }
      }
      await exited;
    }
    const mutating = join(scratch, 'mutating.mjs');
    await writeFile(mutating, 'const check = { label: "ok", pass: true, actual: { n: 0 } };'
      + 'export function run() { check.actual.n++; return { checks: [check] }; }');
    await rejects(rawChecks(mutating, { repeat: true }), /not deterministic: 'ok' gave .*1.*first run.*2.*second/);
    await writeFile(mutating, 'let n = 0; export function run() { return { checks: [{ label: "svg".repeat(100), pass: true,'
      + ' actual: "x".repeat(4096) + (++n === 1 ? "red" : "green") }] }; }');
    await rejects(rawChecks(mutating, { repeat: true }), error => {
      match(errorReason(error), /offset 4096 .*red.*first run.*offset 4096 .*green.*second/);
      return true;
    });
    for (const collection of [
      'new Set([n])',
      'new Map([["key", n]])',
      'Object.setPrototypeOf(new Set([n]), null)',
      'Object.setPrototypeOf(new Map([["key", n]]), null)',
      'new (class extends Set { *[Symbol.iterator]() {} })([n])',
      'new (class extends Map { *[Symbol.iterator]() {} })([["key", n]])',
      'new Map([[new Date(0), n], [new Date(0).toISOString(), 0]])',
      'new Set(n === 1 ? [1, 2] : [2, 1])',
      'Object.assign(new Map(), { map: n })',
      'Object.assign(new Set(), { set: n })',
      'Object.assign(new Map(), { [Symbol.for("note")]: n })',
      'Object.assign(new Set(), { [Symbol.for("note")]: n })',
      'Object.assign([], { [Symbol.for("note")]: n })',
      '({ [Symbol.for("note")]: n })',
    ]) {
      await writeFile(mutating, 'let n = 0; export function run() { n++; return { checks: [{ label: "collection", pass: true, actual: '
        + collection + ' }] }; }');
      await rejects(rawChecks(mutating, { repeat: true }), /collection.*1.*first run.*2.*second/);
    }
    await writeFile(mutating, 'let n = 0; export function run() { const actual = ++n === 1 ? new Set([1])'
      + ' : { entries: [1], properties: {} }; return { checks: [{ label: "brand", pass: true, actual }] }; }');
    await rejects(rawChecks(mutating, { repeat: true }), /not deterministic: 'brand' gave/);
    await writeFile(mutating, 'const actual = { toJSON() { if (this !== actual) throw Error("projected twice"); return this; } };'
      + ' export function run() { return { checks: [{ label: "projection", pass: true, actual }] }; }');
    deepEqual(await rawChecks(mutating, { repeat: true }), [{ label: 'projection', pass: true, failure: null }]);
    const graphFixture = 'let n = 0; export function run() { let node = { value: LEAF };'
      + ' for (let i = 0; i < 28; i++) node = { left: node, right: node };'
      + ' return { checks: [{ label: "graph", pass: true, expected: node }] }; }';
    await writeFile(mutating, graphFixture.replace('LEAF', '1'));
    deepEqual(await rawChecks(mutating, { repeat: true, timeout: 5000 }), [{ label: 'graph', pass: true, failure: null }]);
    await writeFile(mutating, graphFixture.replace('LEAF', '++n'));
    await rejects(rawChecks(mutating, { repeat: true, timeout: 5000 }), /'graph' expected .*1 on the first run and .*2 on the second/);
    const projectedFixture = graphFixture.replace('node = { left: node, right: node }',
      'node = { next: node, toJSON() { return { left: this.next, right: this.next }; } }');
    await writeFile(mutating, projectedFixture.replace('LEAF', '1'));
    deepEqual(await rawChecks(mutating, { repeat: true, timeout: 5000 }), [{ label: 'graph', pass: true, failure: null }]);
    await writeFile(mutating, projectedFixture.replace('LEAF', '++n'));
    await rejects(rawChecks(mutating, { repeat: true, timeout: 5000 }), /'graph' expected .*1 on the first run and .*2 on the second/);
    const changedKey = graphFixture.replace('LEAF', '1').replace('expected: node', 'expected: { node, [++n === 1 ? "before" : "after"]: 0 }');
    await writeFile(mutating, changedKey);
    await rejects(rawChecks(mutating, { repeat: true, timeout: 5000 }), /expected at \\[before\\] 0 on the first run and at \\[before\\] <missing>/);
    await writeFile(mutating, 'let pass = false; export function run() { pass = !pass; return { checks: [{ label: "ok", pass, actual: 1 }] }; }');
    await rejects(rawChecks(mutating, { repeat: true }), /pass changed from true to false/);
    await writeFile(mutating, 'let n = 0; export function run() { return { checks: [{ label: "row", actual: 0, expected: ++n, pass: false }] }; }');
    await rejects(rawChecks(mutating, { repeat: true }), /'row' expected 1 on the first run and 2 on the second/);
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
    try {
      await rm(scratch, { recursive: true, force: true });
    } catch (error) {
      console.warn('could not remove ' + scratch + ': ' + error.message);
    }
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
  const timerError = 'this.E2E={run:function(){setTimeout(function(){throw Error("queued timer")},0);'
    + 'return {checks:[{label:"ok",pass:true}]};}}';
  match((await run(timerError)).reason, /queued timer/);
  await rejects(preflight(timerError, 'timer'), /queued timer/);
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
