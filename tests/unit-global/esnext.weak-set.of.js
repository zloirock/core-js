QUnit.test('WeakSet.of', assert => {
  const { of } = WeakSet;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.name(of, 'of');
  assert.looksNative(of);
  assert.nonEnumerable(WeakSet, 'of');
  const array = [];
  assert.true(of() instanceof WeakSet);
  assert.true(of(array).has(array));
});
