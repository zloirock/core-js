QUnit.test('Set.of', assert => {
  const { of } = Set;
  const toArray = Array.from;
  assert.isFunction(of);
  assert.arity(of, 0);
  assert.name(of, 'of');
  assert.looksNative(of);
  assert.nonEnumerable(Set, 'of');
  assert.true(of() instanceof Set);
  assert.deepEqual(toArray(of(1)), [1]);
  assert.deepEqual(toArray(of(1, 2, 3, 2, 1)), [1, 2, 3]);
});
