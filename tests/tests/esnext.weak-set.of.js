QUnit.test('WeakSet.of', function (assert) {
  var of = WeakSet.of;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.name(of, 'of');
  assert.looksNative(of);
  assert.nonEnumerable(WeakSet, 'of');
  var array = [];
  assert.ok(WeakSet.of() instanceof WeakSet);
  assert.ok(WeakSet.of(array).has(array));
  assert.throws(function () {
    of(1);
  });
  var arg = null;
  function F(it) {
    arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});
