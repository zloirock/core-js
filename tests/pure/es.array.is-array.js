import isArray from '../../packages/core-js-pure/fn/array/is-array';

QUnit.test('Array.isArray', assert => {
  assert.isFunction(isArray);
  assert.ok(!isArray({}));
  assert.ok(!isArray(function () {
    return arguments;
  }()));
  assert.ok(isArray([]));
});
