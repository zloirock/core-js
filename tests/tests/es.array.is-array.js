QUnit.test('Array.isArray', assert => {
  const { isArray } = Array;
  assert.isFunction(isArray);
  assert.arity(isArray, 1);
  assert.name(isArray, 'isArray');
  assert.looksNative(isArray);
  assert.nonEnumerable(Array, 'isArray');
  assert.ok(!isArray({}));
  assert.ok(!isArray(function () {
    return arguments;
  }()));
  assert.ok(isArray([]));
});
