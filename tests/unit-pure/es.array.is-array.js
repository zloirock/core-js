import isArray from 'core-js-pure/es/array/is-array';

QUnit.test('Array.isArray', assert => {
  assert.isFunction(isArray);
  assert.name(isArray, 'isArray');
  assert.arity(isArray, 1);
  assert.false(isArray({}));
  assert.false(isArray(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.true(isArray([]));
});
