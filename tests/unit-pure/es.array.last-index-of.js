import lastIndexOf from '@core-js/pure/es/array/last-index-of';

QUnit.test('Array#lastIndexOf', assert => {
  assert.isFunction(lastIndexOf);

  assert.same(lastIndexOf([1, 1, 1], 1), 2);
  assert.same(lastIndexOf([1, 2, 3], 3, 1), -1);
  assert.same(lastIndexOf([1, 2, 3], 2, 1), 1);
  assert.same(lastIndexOf([1, 2, 3], 2, -3), -1);
  assert.same(lastIndexOf([1, 2, 3], 1, -4), -1);
  assert.same(lastIndexOf([1, 2, 3], 2, -2), 1);
  assert.same(lastIndexOf([NaN], NaN), -1);
  assert.same(lastIndexOf([1, 2, 3].concat(Array(2)), 2), 1);
  assert.same(lastIndexOf([1], 1, -0), 0, "shouldn't return negative zero");

  assert.throws(() => lastIndexOf(null, 0), TypeError);
  assert.throws(() => lastIndexOf(undefined, 0), TypeError);
});
