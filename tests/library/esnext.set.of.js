QUnit.test('Set.of', function (assert) {
  var Set = core.Set;
  var of = Set.of;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.ok(Set.of() instanceof Set);
  assert.deepEqual(core.Array.from(Set.of(1)), [1]);
  assert.deepEqual(core.Array.from(Set.of(1, 2, 3, 2, 1)), [1, 2, 3]);
  assert.throws(function () {
    of(1);
  });
  var arg = null;
  function F(it) {
    return arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});
