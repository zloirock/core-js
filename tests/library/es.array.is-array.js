QUnit.test('Array.isArray', assert => {
  const { isArray } = core.Array;
  assert.isFunction(isArray);
  assert.ok(!isArray({}));
  assert.ok(!isArray(function () {
    return arguments;
  }()));
  assert.ok(isArray([]));
});
