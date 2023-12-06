import indexOf from '@core-js/pure/es/array/index-of';

QUnit.test('Array#indexOf', assert => {
  assert.isFunction(indexOf);

  assert.same(indexOf([1, 1, 1], 1), 0);
  assert.same(indexOf([1, 2, 3], 1, 1), -1);
  assert.same(indexOf([1, 2, 3], 2, 1), 1);
  assert.same(indexOf([1, 2, 3], 2, -1), -1);
  assert.same(indexOf([1, 2, 3], 2, -2), 1);
  assert.same(indexOf([NaN], NaN), -1);
  assert.same(indexOf(Array(2).concat([1, 2, 3]), 2), 3);
  assert.same(indexOf(Array(1), undefined), -1);
  assert.same(indexOf([1], 1, -0), 0, "shouldn't return negative zero");

  assert.throws(() => indexOf(null, 0), TypeError);
  assert.throws(() => indexOf(undefined, 0), TypeError);
});
