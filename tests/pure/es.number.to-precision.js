import toPrecision from 'core-js-pure/full/number/to-precision';

QUnit.test('Number#toPrecision', assert => {
  assert.isFunction(toPrecision);
  assert.same(toPrecision(0.00008, 3), '0.0000800', '0.00008.toPrecision(3)');
  assert.same(toPrecision(1.255, 2), '1.3', '1.255.toPrecision(2)');
  assert.same(toPrecision(1843654265.0774949, 13), '1843654265.077', '1843654265.0774949.toPrecision(13)');
  assert.same(toPrecision(NaN, 1), 'NaN', 'If x is NaN, return the String "NaN".');
  assert.same(toPrecision(123.456), '123.456', 'If precision is undefined, return ! ToString(x).');
  assert.same(toPrecision(123.456, undefined), '123.456', 'If precision is undefined, return ! ToString(x).');
  assert.throws(() => toPrecision(0.9, 0), RangeError, 'If p < 1 or p > 21, throw a RangeError exception.');
  assert.throws(() => toPrecision(0.9, 101), RangeError, 'If p < 1 or p > 21, throw a RangeError exception.');
  assert.throws(() => toPrecision({}, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision('123', 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision(false, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision(null, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision(undefined, 1), TypeError, '? thisNumberValue(this value)');
});
