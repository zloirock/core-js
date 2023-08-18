QUnit.test('Array.isArray', assert => {
  const { isArray } = Array;
  assert.isFunction(isArray);
  assert.arity(isArray, 1);
  assert.name(isArray, 'isArray');
  assert.looksNative(isArray);
  assert.nonEnumerable(Array, 'isArray');
  assert.false(isArray({}));
  assert.false(isArray(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.true(isArray([]));
});
