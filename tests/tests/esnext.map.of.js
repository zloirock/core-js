QUnit.test('Map.of', assert => {
  const { of } = Map;
  const toArray = Array.from;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.name(of, 'of');
  assert.looksNative(of);
  assert.nonEnumerable(Map, 'of');
  assert.ok(Map.of() instanceof Map);
  assert.deepEqual(toArray(Map.of([1, 2])), [[1, 2]]);
  assert.deepEqual(toArray(Map.of([1, 2], [2, 3], [1, 4])), [[1, 4], [2, 3]]);
  assert.throws(() => {
    of(1);
  });
  let arg = null;
  function F(it) {
    return arg = it;
  }
  of.call(F, 1, 2, 3);
  assert.deepEqual(arg, [1, 2, 3]);
});
