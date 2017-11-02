var test = QUnit.test;

test('String#padStart', function (assert) {
  var padStart = core.String.padStart;
  assert.isFunction(padStart);
  assert.strictEqual(padStart('abc', 5), '  abc');
  assert.strictEqual(padStart('abc', 4, 'de'), 'dabc');
  assert.strictEqual(padStart('abc'), 'abc');
  assert.strictEqual(padStart('abc', 5, '_'), '__abc');
  assert.strictEqual(padStart('', 0), '');
  assert.strictEqual(padStart('foo', 1), 'foo');
  assert.strictEqual(padStart('foo', 5, ''), 'foo');
  if (STRICT) {
    assert['throws'](function () {
      padStart(null, 0);
    }, TypeError);
    assert['throws'](function () {
      padStart(undefined, 0);
    }, TypeError);
  }
});
