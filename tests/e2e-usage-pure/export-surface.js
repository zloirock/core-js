import * as retained from './export-retained-source.js';
import { events, nestedEvents } from './export-retained-input.js';

// the export surface of a module whose exported destructures get extraction statements: every
// user binding declared `export` must stay importable, and each SE key runs exactly once at
// module evaluation. presence is asserted per declared binding - a memo hoist stealing the
// `export` keyword drops ALL of them at once. the pattern's `_unused` sentinels legitimately
// join the surface (both emitters mirror the residual pattern into the export list), and the
// non-export of the internal memo temp is byte-locked by the transpiler fixtures - neither is
// asserted here
import * as ns from './export-surface-source.js';

QUnit.test('export surface: exported SE-key destructures keep every declared binding', assert => {
  for (const name of ['w', 't', 'm', 'other', 'from', 'fl', 'keyEvalCount']) {
    assert.true(Object.hasOwn(ns, name), `\`${ name }\` stayed on the module surface`);
  }
  assert.strictEqual(ns.keyEvalCount(), 4, 'each SE key evaluated once at module evaluation');
  assert.deepEqual(ns.w.call([9], 0, 5), [5], 'live-default binding got the instance polyfill');
  assert.deepEqual(ns.t.call([3, 1], 0, 2), [], 'second declarator of the split host stayed exported');
  assert.deepEqual(ns.m.call([[1]]), [1], 'member-memo binding stayed exported');
  assert.strictEqual(typeof ns.other, 'undefined', 'plain sibling binding carries its native undefined');
  assert.deepEqual(ns.from('ab'), ['a', 'b'], 'flatten-claimed declarator stayed exported');
  assert.strictEqual(ns.fl.call([1, 2], -1), 2, 'later-declarator memo binding stayed exported');
});

QUnit.test('exported retained slots keep only source names and read each getter once', assert => {
  // Babel's module lowering adds __esModule; all other names must come from the source.
  assert.deepEqual(Object.keys(retained).filter(name => name !== '__esModule').sort(), ['at', 'custom', 'from', 'lead', 'method', 'mid', 'overridden', 'tail']);
  assert.deepEqual(events, ['before', 'make', 'key', 'at', 'custom', 'after', 'last']);
  assert.same(retained.at(), 'custom');
  assert.deepEqual([retained.lead, retained.custom, retained.mid, retained.tail], [1, 2, 3, 4]);
  assert.deepEqual(retained.from('ab'), ['a', 'b']);
});

QUnit.test('exported guarded slots retain the actual constructor and private capture', assert => {
  assert.deepEqual(retained.method(1, 2), [1, 2]);
  assert.same(retained.overridden, undefined);
});

QUnit.test('exported nested reads visit each opaque getter once', assert => {
  assert.deepEqual(nestedEvents, ['Array', 'at', 'Object', 'other']);
  assert.same(ns.nestedAt(), 8);
  assert.deepEqual(ns.nestedKeys({}), ['custom']);
  assert.same(ns.nestedOther, 7);
});

QUnit.test('exported static binding follows its key and precedes the next key', assert => {
  assert.deepEqual(ns.bindingEvents, ['undefined', 'function']);
  assert.deepEqual(ns.keyedFrom('ab'), ['a', 'b']);
  assert.true(ns.keyedIsArray([]));
});

QUnit.test('exported nested static keys preserve all public siblings', assert => {
  assert.deepEqual(ns.nestedBindingEvents, ['undefined']);
  assert.deepEqual(ns.nestedFrom('ab'), ['a', 'b']);
  assert.deepEqual([ns.keyedBefore, ns.keyedAfter], [1, 2]);
  assert.false(Object.keys(ns).some(name => name.startsWith('_') && name !== '__esModule'));
});

QUnit.test('an exported constructor behind an effectful getter carries its static methods', assert => {
  assert.deepEqual(ns.RealmMap.groupBy([1, 2, 3], value => value % 2).get(1), [1, 3]);
  const deferred = ns.RealmPromise.withResolvers();
  assert.same(typeof deferred.resolve, 'function');
  assert.same(typeof deferred.reject, 'function');
  assert.same(typeof deferred.promise.then, 'function');
  assert.deepEqual(ns.realmEvents, ['getter', 'export']);
  assert.deepEqual([ns.realmBefore, ns.realmAfter], [1, 2]);
});
