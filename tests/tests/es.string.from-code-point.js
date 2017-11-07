var test = QUnit.test;

test('String.fromCodePoint', function (assert) {
  var fromCodePoint = String.fromCodePoint;
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
  assert['throws'](function () {
    fromCodePoint('_');
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint('+Infinity');
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint('-Infinity');
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(-1);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(0x10FFFF + 1);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(3.14);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(3e-2);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(-Infinity);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(Infinity);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(NaN);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(undefined);
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint({});
  }, RangeError);
  assert['throws'](function () {
    fromCodePoint(/./);
  }, RangeError);
  var number = 0x60;
  assert.strictEqual(fromCodePoint({
    valueOf: function () {
      return ++number;
    }
  }), 'a');
  assert.strictEqual(number, 0x61);
  // one code unit per symbol
  var counter = Math.pow(2, 15) * 3 / 2;
  var result = [];
  while (--counter >= 0) result.push(0);
  // should not throw
  fromCodePoint.apply(null, result);
  counter = Math.pow(2, 15) * 3 / 2;
  result = [];
  while (--counter >= 0) result.push(0xFFFF + 1);
  // should not throw
  fromCodePoint.apply(null, result);
});
