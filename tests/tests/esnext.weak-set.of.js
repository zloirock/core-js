QUnit.test('WeakSet.of', assert => {
  const { of } = WeakSet;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.name(of, 'of');
  assert.looksNative(of);
  assert.nonEnumerable(WeakSet, 'of');
  const array = [];
  assert.ok(WeakSet.of() instanceof WeakSet);
  assert.ok(WeakSet.of(array).has(array));
  assert.throws(() => of(1));
  let arg = null;
  function F(it) {
    arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});
