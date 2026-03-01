QUnit.test('Number#toExponential', assert => {
  const { toExponential } = Number.prototype;
  assert.isFunction(toExponential);
  assert.name(toExponential, 'toExponential');
  assert.arity(toExponential, 1);
  assert.looksNative(toExponential);
  assert.nonEnumerable(Number.prototype, 'toExponential');

  assert.same(toExponential.call(0.00008, 3), '8.000e-5');
  assert.same(toExponential.call(0.9, 0), '9e-1');
  assert.same(toExponential.call(1.255, 2), '1.25e+0'); // Chakra Edge 14- / IE11- bug
  assert.same(toExponential.call(1843654265.0774949, 5), '1.84365e+9');
  assert.same(toExponential.call(1000000000000000128.0, 0), '1e+18');

  assert.same(toExponential.call(1), '1e+0');
  assert.same(toExponential.call(1, 0), '1e+0');
  assert.same(toExponential.call(1, 1), '1.0e+0');
  assert.same(toExponential.call(1, 1.1), '1.0e+0');
  assert.same(toExponential.call(1, 0.9), '1e+0');
  assert.same(toExponential.call(1, '0'), '1e+0');
  assert.same(toExponential.call(1, '1'), '1.0e+0');
  assert.same(toExponential.call(1, '1.1'), '1.0e+0');
  assert.same(toExponential.call(1, '0.9'), '1e+0');
  assert.same(toExponential.call(1, NaN), '1e+0');
  assert.same(toExponential.call(1, 'some string'), '1e+0');
  assert.notThrows(() => toExponential.call(1, -0.1) === '1e+0');
  assert.same(toExponential.call(new Number(1)), '1e+0');
  assert.same(toExponential.call(new Number(1), 0), '1e+0');
  assert.same(toExponential.call(new Number(1), 1), '1.0e+0');
  assert.same(toExponential.call(new Number(1), 1.1), '1.0e+0');
  assert.same(toExponential.call(new Number(1), 0.9), '1e+0');
  assert.same(toExponential.call(new Number(1), '0'), '1e+0');
  assert.same(toExponential.call(new Number(1), '1'), '1.0e+0');
  assert.same(toExponential.call(new Number(1), '1.1'), '1.0e+0');
  assert.same(toExponential.call(new Number(1), '0.9'), '1e+0');
  assert.same(toExponential.call(new Number(1), NaN), '1e+0');
  assert.same(toExponential.call(new Number(1), 'some string'), '1e+0');
  assert.notThrows(() => toExponential.call(new Number(1), -0.1) === '1e+0');
  assert.same(toExponential.call(NaN), 'NaN');
  assert.same(toExponential.call(NaN, 0), 'NaN');
  assert.same(toExponential.call(NaN, 1), 'NaN');
  assert.same(toExponential.call(NaN, 1.1), 'NaN');
  assert.same(toExponential.call(NaN, 0.9), 'NaN');
  assert.same(toExponential.call(NaN, '0'), 'NaN');
  assert.same(toExponential.call(NaN, '1'), 'NaN');
  assert.same(toExponential.call(NaN, '1.1'), 'NaN');
  assert.same(toExponential.call(NaN, '0.9'), 'NaN');
  assert.same(toExponential.call(NaN, NaN), 'NaN');
  assert.same(toExponential.call(NaN, 'some string'), 'NaN');
  assert.notThrows(() => toExponential.call(NaN, -0.1) === 'NaN');

  assert.same(toExponential.call(new Number(1e21)), '1e+21');
  assert.same(toExponential.call(new Number(1e21), 0), '1e+21');
  assert.same(toExponential.call(new Number(1e21), 1), '1.0e+21');
  assert.same(toExponential.call(new Number(1e21), 1.1), '1.0e+21');
  assert.same(toExponential.call(new Number(1e21), 0.9), '1e+21');
  assert.same(toExponential.call(new Number(1e21), '0'), '1e+21');
  assert.same(toExponential.call(new Number(1e21), '1'), '1.0e+21');
  assert.same(toExponential.call(new Number(1e21), '1.1'), '1.0e+21');
  assert.same(toExponential.call(new Number(1e21), '0.9'), '1e+21');
  assert.same(toExponential.call(new Number(1e21), NaN), '1e+21');
  assert.same(toExponential.call(new Number(1e21), 'some string'), '1e+21');

  // somehow that randomly fails in FF16- on Linux
  assert.same(toExponential.call(5, 19), '5.0000000000000000000e+0', '5, 19');

  // ported from tests262, the license: https://github.com/tc39/test262/blob/main/LICENSE
  assert.same(toExponential.call(123.456, 0), '1e+2');
  assert.same(toExponential.call(123.456, 1), '1.2e+2');
  assert.same(toExponential.call(123.456, 2), '1.23e+2');
  assert.same(toExponential.call(123.456, 3), '1.235e+2');
  assert.same(toExponential.call(123.456, 4), '1.2346e+2');
  assert.same(toExponential.call(123.456, 5), '1.23456e+2');
  assert.same(toExponential.call(123.456, 6), '1.234560e+2');
  assert.same(toExponential.call(123.456, 7), '1.2345600e+2');
  // assert.same(toExponential.call(123.456, 17), '1.23456000000000003e+2');
  // assert.same(toExponential.call(123.456, 20), '1.23456000000000003070e+2');

  assert.same(toExponential.call(-123.456, 0), '-1e+2');
  assert.same(toExponential.call(-123.456, 1), '-1.2e+2');
  assert.same(toExponential.call(-123.456, 2), '-1.23e+2');
  assert.same(toExponential.call(-123.456, 3), '-1.235e+2');
  assert.same(toExponential.call(-123.456, 4), '-1.2346e+2');
  assert.same(toExponential.call(-123.456, 5), '-1.23456e+2');
  assert.same(toExponential.call(-123.456, 6), '-1.234560e+2');
  assert.same(toExponential.call(-123.456, 7), '-1.2345600e+2');
  // assert.same(toExponential.call(-123.456, 17), '-1.23456000000000003e+2');
  // assert.same(toExponential.call(-123.456, 20), '-1.23456000000000003070e+2');

  assert.same(toExponential.call(0.0001, 0), '1e-4');
  assert.same(toExponential.call(0.0001, 1), '1.0e-4');
  assert.same(toExponential.call(0.0001, 2), '1.00e-4');
  assert.same(toExponential.call(0.0001, 3), '1.000e-4');
  assert.same(toExponential.call(0.0001, 4), '1.0000e-4');
  // assert.same(toExponential.call(0.0001, 16), '1.0000000000000000e-4');
  // assert.same(toExponential.call(0.0001, 17), '1.00000000000000005e-4');
  // assert.same(toExponential.call(0.0001, 18), '1.000000000000000048e-4');
  // assert.same(toExponential.call(0.0001, 19), '1.0000000000000000479e-4');
  // assert.same(toExponential.call(0.0001, 20), '1.00000000000000004792e-4');

  assert.same(toExponential.call(0.9999, 0), '1e+0');
  assert.same(toExponential.call(0.9999, 1), '1.0e+0');
  assert.same(toExponential.call(0.9999, 2), '1.00e+0');
  assert.same(toExponential.call(0.9999, 3), '9.999e-1');
  assert.same(toExponential.call(0.9999, 4), '9.9990e-1');
  // assert.same(toExponential.call(0.9999, 16), '9.9990000000000001e-1');
  // assert.same(toExponential.call(0.9999, 17), '9.99900000000000011e-1');
  // assert.same(toExponential.call(0.9999, 18), '9.999000000000000110e-1');
  // assert.same(toExponential.call(0.9999, 19), '9.9990000000000001101e-1');
  // assert.same(toExponential.call(0.9999, 20), '9.99900000000000011013e-1');

  assert.same(toExponential.call(25, 0), '3e+1'); // FF86- and Chrome 49-50 bugs
  assert.same(toExponential.call(12345, 3), '1.235e+4'); // FF86- and Chrome 49-50 bugs

  assert.same(toExponential.call(Number.prototype, 0), '0e+0', 'Number.prototype, 0');
  assert.same(toExponential.call(0, 0), '0e+0', '0, 0');
  assert.same(toExponential.call(-0, 0), '0e+0', '-0, 0');
  assert.same(toExponential.call(0, -0), '0e+0', '0, -0');
  assert.same(toExponential.call(-0, -0), '0e+0', '-0, -0');
  assert.same(toExponential.call(0, 1), '0.0e+0', '0 and 1');
  assert.same(toExponential.call(0, 2), '0.00e+0', '0 and 2');
  assert.same(toExponential.call(0, 7), '0.0000000e+0', '0 and 7');
  assert.same(toExponential.call(0, 20), '0.00000000000000000000e+0', '0 and 20');
  assert.same(toExponential.call(-0, 1), '0.0e+0', '-0 and 1');
  assert.same(toExponential.call(-0, 2), '0.00e+0', '-0 and 2');
  assert.same(toExponential.call(-0, 7), '0.0000000e+0', '-0 and 7');
  assert.same(toExponential.call(-0, 20), '0.00000000000000000000e+0', '-0 and 20');

  // overflow / underflow edge cases
  assert.same(toExponential.call(9e307, 0), '9e+307', '9e307, 0');
  assert.same(toExponential.call(-9e307, 0), '-9e+307', '-9e307, 0');
  assert.same(toExponential.call(Number.MAX_VALUE, 0), '2e+308', 'MAX_VALUE, 0');
  assert.same(toExponential.call(Number.MAX_VALUE, 5), '1.79769e+308', 'MAX_VALUE, 5');
  assert.same(toExponential.call(Number.MIN_VALUE, 0), '5e-324', 'MIN_VALUE, 0');
  assert.same(toExponential.call(Number.MIN_VALUE, 1), '4.9e-324', 'MIN_VALUE, 1');
  assert.same(toExponential.call(1e-323, 0), '1e-323', '1e-323, 0');

  assert.same(toExponential.call(NaN, 1000), 'NaN', 'NaN check before fractionDigits check');
  assert.same(toExponential.call(Infinity, 1000), 'Infinity', 'Infinity check before fractionDigits check');
  assert.notThrows(() => toExponential.call(new Number(1e21), -0.1) === '1e+21');
  assert.throws(() => toExponential.call(1.0, -101), RangeError, 'If f < 0 or f > 20 (100), throw a RangeError exception.');
  assert.throws(() => toExponential.call(1.0, 101), RangeError, 'If f < 0 or f > 20 (100), throw a RangeError exception.');
  assert.throws(() => toExponential.call({}, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toExponential.call('123', 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toExponential.call(false, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toExponential.call(null, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toExponential.call(undefined, 1), TypeError, '? thisNumberValue(this value)');
});
