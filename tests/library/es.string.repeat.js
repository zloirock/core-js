var test = QUnit.test;

test('String#repeat', function (assert) {
  var repeat = core.String.repeat;
  assert.isFunction(repeat);
  assert.strictEqual(repeat('qwe', 3), 'qweqweqwe');
  assert.strictEqual(repeat('qwe', 2.5), 'qweqwe');
  assert['throws'](function () {
    repeat('qwe', -1);
  }, RangeError);
  assert['throws'](function () {
    repeat('qwe', Infinity);
  }, RangeError);
  if (STRICT) {
    assert['throws'](function () {
      repeat(null, 1);
    }, TypeError);
    assert['throws'](function () {
      repeat(undefined, 1);
    }, TypeError);
  }
});
