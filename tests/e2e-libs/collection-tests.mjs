import { rejects, strictEqual, throws } from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { buildCell } from './bundle.mjs';
import { allCells } from './cells.mjs';
import { checker, deepEqual as exerciseEqual, observeRealm } from './exercises/checks.mjs';
import { checkFailureLine } from './diagnostics.mjs';
import { HERE } from './paths.mjs';
import { runRaw } from './raw-exercise.mjs';

const require = createRequire(import.meta.url);
// Load independent copies of pure. Their private collection state belongs to their realms.
const releaseRealms = [];
const collectionDir = await mkdtemp(join(HERE, 'collection-test-'));
try {
  const target = join(collectionDir, 'exercise.mjs');
  await writeFile(target, 'export const row = { label: "contents", pass: true }; export function run() { return { checks: [row] }; }');
  const { row } = await import(pathToFileURL(target).href);
  const exercise = join(collectionDir, 'constructors.mjs');
  await writeFile(exercise, `
    import { checker } from '../exercises/checks.mjs';
    export function run() {
      const { check, checks } = checker();
      const field = Symbol('field');
      const actual = { [field]: 1 };
      const expected = {};
      expected[field] = 2;
      check('value', actual, expected);
      expected[field] = 1;
      check('same symbol', actual, expected);
      expected[field] = 2;
      check('other symbol', actual, { [Symbol('field')]: 1 });
      const hidden = Object.defineProperty({}, field, { value: 1 });
      check('hidden', hidden, {});
      const left = {};
      const right = {};
      left.self = left;
      right.self = right;
      check('cycle', { node: left }, { node: right });
      const other = Symbol('field');
      check('same value', field, field);
      check('different values', field, other);
      check('symbol and object', field, {});
      check('map key identity', new Map([[field, 1]]), new Map([[other, 1]]));
      return { Map, Set, actual, expected, field, other, checks };
    }`);
  const cell = allCells([{ name: 'collections', exercise }]).find(candidate => candidate.isReference && candidate.method === 'usage-pure');
  const { code } = await buildCell(cell);
  const source = `${ code }
    const constructors = E2E.run();
    if (constructors.Map === Map || constructors.Set === Set) throw new Error('expected pure collection constructors');
    ({ constructors, realm: this });`;
  const { constructors: foreign, realm: nativeRealm } = runInNewContext(source, {
    process: { getBuiltinModule() { throw new Error('browser process shim'); } },
  });
  const { constructors: legacy, realm: legacyRealm } = runInNewContext(`delete this.globalThis; delete Object.getOwnPropertySymbols; delete Set.prototype.forEach; delete Map.prototype.forEach;
    ${ source }`, { Symbol: undefined });
  for (const { Set: RealmSet, Map: RealmMap } of [foreign, legacy]) {
    const { check } = checker();
    throws(() => check('set', new RealmSet([1]), new RealmSet([2])), /observeRealm/u);
    throws(() => check('map', new RealmMap([[1, 1]]), new RealmMap([[1, 2]])), /observeRealm/u);
    for (const [Constructor, first, second] of [[RealmSet, [1], [2]], [RealmMap, [[1, 1]], [[1, 2]]]]) {
      const descriptor = Object.getOwnPropertyDescriptor(Constructor.prototype, 'forEach');
      delete Constructor.prototype.forEach;
      try {
        throws(() => exerciseEqual(new Constructor(first), new Constructor(second)), /observeRealm/u);
      } finally {
        Object.defineProperty(Constructor.prototype, 'forEach', descriptor);
      }
    }
  }
  releaseRealms.push(observeRealm(nativeRealm), observeRealm(legacyRealm));
  for (const { checks } of [foreign, legacy]) {
    strictEqual(checks.map(check => check.pass).join(','), 'false,true,false,true,true,true,false,false,false');
  }
  row.actual = legacy.field;
  await rejects(runRaw(target, 'symbol', true, () => { row.actual = legacy.other; }), /not deterministic/u);
  strictEqual(exerciseEqual(legacy.actual, legacy.expected), false);
  for (const [name, Native, Pure, Foreign, Legacy] of [
    ['set', Set, require('@core-js/pure/full/set'), foreign.Set, legacy.Set],
    ['map', Map, require('@core-js/pure/full/map'), foreign.Map, legacy.Map],
  ]) {
    function inputs(n) { return name === 'set' ? [n] : [['key', n]]; }
    const { check, checks } = checker();
    check(name, new Foreign(inputs(1)), new Foreign());
    strictEqual(checkFailureLine(checks[0]), `${ name } actual=at [size] 1 expected=at [size] 0`);
    strictEqual(exerciseEqual(new Foreign(inputs(1)), new Native(inputs(1))), true);
    strictEqual(exerciseEqual(new Foreign(inputs(1)), new Foreign(inputs(2))), false);
    strictEqual(exerciseEqual(new Foreign(), Object.create(Foreign.prototype)), false);
    strictEqual(exerciseEqual(new Legacy(inputs(1)), new Foreign(inputs(1))), true);
    strictEqual(exerciseEqual(new Legacy(inputs(1)), new Pure(inputs(2))), false);
    for (const Constructor of [Pure, Foreign, Legacy]) {
      const detached = Object.setPrototypeOf(new Constructor(inputs(1)), null);
      strictEqual(exerciseEqual(detached, new Native(inputs(1))), true);
      strictEqual(exerciseEqual(detached, Object.setPrototypeOf(new Constructor(inputs(2)), null)), false);
      for (const [field, verb] of [['actual', 'gave'], ['expected', 'expected']]) {
        const value = new Constructor(inputs(1));
        row.actual = row.expected = 0;
        row[field] = value;
        await rejects(runRaw(target, name, true, () => {
          value.clear();
          if (name === 'set') value.add(2);
          else value.set('key', 2);
        }), new RegExp(`'contents' ${ verb } .*1.*first run.*2.*second`, 'u'));
      }
    }
  }
} finally {
  for (const release of releaseRealms) release();
  await rm(collectionDir, { recursive: true, force: true });
}
