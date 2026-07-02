import at from '@core-js/pure/es/array/at';

QUnit.test('Array#at', assert => {
  assert.isFunction(at);

  assert.same(at([1, 2, 3], 0), 1);
  assert.same(at([1, 2, 3], 1), 2);
  assert.same(at([1, 2, 3], 2), 3);
  assert.same(at([1, 2, 3], 3), undefined);
  assert.same(at([1, 2, 3], -1), 3);
  assert.same(at([1, 2, 3], -2), 2);
  assert.same(at([1, 2, 3], -3), 1);
  assert.same(at([1, 2, 3], -4), undefined);
  assert.same(at([1, 2, 3], 0.4), 1);
  assert.same(at([1, 2, 3], 0.5), 1);
  assert.same(at([1, 2, 3], 0.6), 1);
  assert.same(at([1], NaN), 1);
  assert.same(at([1]), 1);
  assert.same(at([1, 2, 3], -0), 1);
  assert.same(at(Array(1), 0), undefined);
  assert.same(at({ 0: 1, length: 1 }, 0), 1);

  assert.throws(() => at(null, 0), TypeError);
  assert.throws(() => at(undefined, 0), TypeError);
});
