QUnit.test('WeakMap.of', assert => {
  const { of } = WeakMap;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.name(of, 'of');
  assert.looksNative(of);
  assert.nonEnumerable(WeakMap, 'of');
  const array = [];
  assert.true(of() instanceof WeakMap);
  assert.same(of([array, 2]).get(array), 2);
});
