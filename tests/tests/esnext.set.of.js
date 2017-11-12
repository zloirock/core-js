QUnit.test('Set.of', function (assert) {
  var of = Set.of;
  var toArray = Array.from;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.name(of, 'of');
  assert.looksNative(of);
  assert.nonEnumerable(Set, 'of');
  assert.ok(Set.of() instanceof Set);
  assert.deepEqual(toArray(Set.of(1)), [1]);
  assert.deepEqual(toArray(Set.of(1, 2, 3, 2, 1)), [1, 2, 3]);
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
