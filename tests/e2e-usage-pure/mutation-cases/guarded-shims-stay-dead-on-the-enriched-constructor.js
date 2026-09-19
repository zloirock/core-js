
// popular shim patterns at runtime: the mutated key's entry is imported up front
// (polyfill-then-patch), so a guard finds the key PRESENT on the routed constructor and the
// shim stays dead code - on every target, including engines missing the global natively
QUnit.test('mutated-statics: guarded shims stay dead on the enriched constructor', assert => {
  Iterator.from ||= function () { return 'dead-shim'; };
  assert.same(Iterator.from([5].values()).next().value, 5);
  Promise.allSettled = Promise.allSettled || function () { return 'dead-shim'; };
  assert.same(typeof Promise.allSettled, 'function');
  return Promise.allSettled([Promise.resolve(7)]).then(rs => {
    assert.same(rs[0].value, 7);
  });
});
