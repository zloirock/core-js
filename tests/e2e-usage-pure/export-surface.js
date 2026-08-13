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
