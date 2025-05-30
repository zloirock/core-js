import clamp from 'core-js-pure/full/math/clamp';

QUnit.test('Math.clamp', assert => {
  assert.isFunction(clamp);
  assert.arity(clamp, 3);

  assert.same(clamp(2, 4, 6), 4);
  assert.same(clamp(4, 2, 6), 4);
  assert.same(clamp(6, 2, 4), 4);

  assert.same(clamp(NaN, 4, 6), NaN, 'If value is NaN, return NaN.');
  assert.same(clamp(-0, 0, 1), 0, 'If value is -0𝔽 and min is +0𝔽, return +0𝔽.');
  assert.same(clamp(0, -0, 1), 0, 'If value is +0𝔽 and min is -0𝔽, return +0𝔽.');
  assert.same(clamp(-0, -1, 0), -0, 'If value is -0𝔽 and max is +0𝔽, return -0𝔽.');
  assert.same(clamp(0, -1, -0), -0, 'If value is +0𝔽 and max is -0𝔽, return -0𝔽.');
  assert.same(clamp(0, -0, -0), -0, 'If min = max return min.');

  assert.same(clamp(2, 0, -0), -0, 'min is +0𝔽 and max is -0𝔽');
  assert.same(clamp(2, 3, 1), 1, 'min > max');

  assert.throws(() => clamp(Object(2), 1, 3), TypeError, 'If value is not a Number, throw a TypeError exception.');
  assert.throws(() => clamp(2, Object(1), 3), TypeError, 'If min is not a Number, throw a TypeError exception.');
  assert.throws(() => clamp(2, NaN, 3), RangeError, 'If min is NaN, throw a RangeError exception.');
  assert.throws(() => clamp(2, 1, Object(3)), TypeError, 'If max is not a Number, throw a TypeError exception.');
  assert.throws(() => clamp(2, 1, NaN), RangeError, 'If max is NaN, throw a RangeError exception.');
});
