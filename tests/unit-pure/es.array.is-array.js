import isArray from 'core-js-pure/es/array/is-array';

QUnit.test('Array.isArray', assert => {
  assert.isFunction(isArray);
  assert.false(isArray({}));
  assert.false(isArray(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.true(isArray([]));
});
