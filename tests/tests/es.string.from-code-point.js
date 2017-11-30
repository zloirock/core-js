QUnit.test('String.fromCodePoint', assert => {
  const { fromCodePoint } = String;
  assert.isFunction(fromCodePoint);
  assert.arity(fromCodePoint, 1);
  assert.name(fromCodePoint, 'fromCodePoint');
  assert.looksNative(fromCodePoint);
  assert.nonEnumerable(String, 'fromCodePoint');
  assert.strictEqual(fromCodePoint(''), '\0');
  assert.strictEqual(fromCodePoint(), '');
  assert.strictEqual(fromCodePoint(-0), '\0');
  assert.strictEqual(fromCodePoint(0), '\0');
  assert.strictEqual(fromCodePoint(0x1D306), '\uD834\uDF06');
  assert.strictEqual(fromCodePoint(0x1D306, 0x61, 0x1D307), '\uD834\uDF06a\uD834\uDF07');
  assert.strictEqual(fromCodePoint(0x61, 0x62, 0x1D307), 'ab\uD834\uDF07');
  assert.strictEqual(fromCodePoint(false), '\0');
  assert.strictEqual(fromCodePoint(null), '\0');
  assert.throws(() => {
    return fromCodePoint('_');
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint('+Infinity');
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint('-Infinity');
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(-1);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(0x10FFFF + 1);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(3.14);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(3e-2);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(-Infinity);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(Infinity);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(NaN);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(undefined);
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint({});
  }, RangeError);
  assert.throws(() => {
    return fromCodePoint(/./);
  }, RangeError);
  let number = 0x60;
  assert.strictEqual(fromCodePoint({
    valueOf() {
      return ++number;
    },
  }), 'a');
  assert.strictEqual(number, 0x61);
  // one code unit per symbol
  let counter = 2 ** 15 * 3 / 2;
  let result = [];
  while (--counter >= 0) result.push(0);
  // should not throw
  fromCodePoint.apply(null, result);
  counter = 2 ** 15 * 3 / 2;
  result = [];
  while (--counter >= 0) result.push(0xFFFF + 1);
  // should not throw
  fromCodePoint.apply(null, result);
});
