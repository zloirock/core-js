QUnit.test('Number#toPrecision', assert => {
  const { toPrecision } = Number.prototype;
  const zeros = count => Array(count + 1).join('0');
  assert.isFunction(toPrecision);
  assert.name(toPrecision, 'toPrecision');
  assert.arity(toPrecision, 1);
  assert.looksNative(toPrecision);
  assert.nonEnumerable(Number.prototype, 'toPrecision');
  assert.same(0.00008.toPrecision(3), '0.0000800', '0.00008.toPrecision(3)');
  assert.same(1.255.toPrecision(2), '1.3', '1.255.toPrecision(2)');
  assert.same(1843654265.0774949.toPrecision(13), '1843654265.077', '1843654265.0774949.toPrecision(13)');
  // exact ties
  assert.same(toPrecision.call(125, 2), '1.3e+2'); // FF86- bug
  assert.same(toPrecision.call(25, 1), '3e+1'); // FF86- bug
  assert.same(toPrecision.call(12345, 4), '1.235e+4'); // FF86- bug
  assert.same(toPrecision.call(2.5, 1), '3');
  assert.same(toPrecision.call(0.125, 2), '0.13');
  assert.same(toPrecision.call(-2.5, 1), '-3');
  // decimals close to a rounding half are rounded by their exact binary values
  assert.same(toPrecision.call(1.255, 3), '1.25'); // IE11- and Chakra-based Edge bug
  assert.same(toPrecision.call(0.825, 2), '0.82');
  assert.same(toPrecision.call(1.5545, 4), '1.554');
  assert.same(toPrecision.call(12.475, 4), '12.47');
  assert.same(toPrecision.call(4.675345, 6), '4.67535');
  // the notation
  assert.same(toPrecision.call(1e-7, 2), '1.0e-7');
  assert.same(toPrecision.call(0.000001, 2), '0.0000010');
  assert.same(toPrecision.call(9.5e-7, 1), '0.000001');
  assert.same(toPrecision.call(0.000999, 1), '0.001');
  assert.same(toPrecision.call(123456, 2), '1.2e+5');
  assert.same(toPrecision.call(123, 3), '123');
  assert.same(toPrecision.call(123.456, 5), '123.46');
  assert.same(toPrecision.call(-123.456, 4), '-123.5');
  assert.same(toPrecision.call(9.96, 2), '10');
  assert.same(toPrecision.call(99.96, 3), '100');
  assert.same(toPrecision.call(1e21, 1), '1e+21');
  assert.same(toPrecision.call(-6.9e-11, 5), '-6.9000e-11');
  assert.same(toPrecision.call(0, 1), '0');
  assert.same(toPrecision.call(0, 3), '0.00');
  assert.same(toPrecision.call(-0, 2), '0.0');
  // subnormals, Rhino 1.8.0- bugs
  assert.same(toPrecision.call(2.5e-323, 1), '2e-323');
  assert.same(toPrecision.call(2.5e-323, 3), '2.47e-323');
  assert.same(toPrecision.call(2.47936e-318, 1), '2e-318');
  assert.same(toPrecision.call(2.5e-323), '2.5e-323');
  // up to 100 digits
  assert.same(toPrecision.call(0.03125, 21), '0.0312500000000000000000'); // Rhino 1.8.1+ bug
  assert.same(toPrecision.call(1, 22), '1.000000000000000000000');
  assert.same(toPrecision.call(-1.5, 30), '-1.50000000000000000000000000000');
  assert.same(toPrecision.call(0.1, 60), '0.100000000000000005551115123125782702118158340454101562500000');
  assert.same(toPrecision.call(1, 100), `1.${ zeros(99) }`);
  assert.same(toPrecision.call(123.456, 100), `123.4560000000000030695446184836328029632568359375${ zeros(51) }`);
  assert.same(toPrecision.call(Number.MAX_VALUE, 100), '1.797693134862315708145274237317043567980705675258449965989174768031572607800285387605895586327668782e+308');
  assert.same(toPrecision.call(Number.MIN_VALUE, 100), '4.940656458412465441765687928682213723650598026143247644255856825006755072702087518652998363616359924e-324');
  assert.same(NaN.toPrecision(1), 'NaN', 'If x is NaN, return the String "NaN".');
  assert.same(toPrecision.call(NaN, 1000), 'NaN', 'NaN check before precision check');
  assert.same(toPrecision.call(Infinity, 1000), 'Infinity', 'Infinity check before precision check');
  assert.same(toPrecision.call(-Infinity, 0), '-Infinity', '-Infinity check before precision check');
  assert.same(123.456.toPrecision(), '123.456', 'If precision is undefined, return ! ToString(x).');
  assert.same(123.456.toPrecision(undefined), '123.456', 'If precision is undefined, return ! ToString(x).');
  assert.throws(() => 0.9.toPrecision(0), RangeError, 'If p < 1 or p > 100, throw a RangeError exception.');
  assert.throws(() => 0.9.toPrecision(101), RangeError, 'If p < 1 or p > 100, throw a RangeError exception.');
  assert.throws(() => 0.9.toPrecision(Infinity), RangeError, 'If p < 1 or p > 100, throw a RangeError exception.');
  assert.throws(() => 0.9.toPrecision(-Infinity), RangeError, 'If p < 1 or p > 100, throw a RangeError exception.');
  assert.throws(() => toPrecision.call({}, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision.call('123', 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision.call(false, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision.call(null, 1), TypeError, '? thisNumberValue(this value)');
  assert.throws(() => toPrecision.call(undefined, 1), TypeError, '? thisNumberValue(this value)');
});
