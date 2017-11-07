var test = QUnit.test;

test('ArrayBuffer', function (assert) {
  var Symbol = global.Symbol || {};
  // in Safari 5 typeof ArrayBuffer is 'object'
  assert.same(ArrayBuffer, Object(ArrayBuffer), 'is object');
  // 0 in V8 ~ Chromium 27-
  assert.arity(ArrayBuffer, 1);
  // Safari 5 bug
  assert.name(ArrayBuffer, 'ArrayBuffer');
  // Safari 5 bug
  if (NATIVE) assert.looksNative(ArrayBuffer);
  assert.same(new ArrayBuffer(123).byteLength, 123, 'length');
  // fails in Safari
  assert['throws'](function () {
    new ArrayBuffer(-1);
  }, RangeError, 'negative length');
  assert.ok(function () {
    try {
      return new ArrayBuffer(0.5);
    } catch (e) { /* empty */ }
  }(), 'fractional length');
  assert.ok(function () {
    try {
      return new ArrayBuffer();
    } catch (e) { /* empty */ }
  }(), 'missed length');
  if (DESCRIPTORS) assert.same(ArrayBuffer[Symbol.species], ArrayBuffer, '@@species');
});
