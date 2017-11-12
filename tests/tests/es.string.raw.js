QUnit.test('String.raw', function (assert) {
  var raw = String.raw;
  assert.isFunction(raw);
  assert.arity(raw, 1);
  assert.name(raw, 'raw');
  assert.looksNative(raw);
  assert.nonEnumerable(String, 'raw');
  assert.strictEqual(raw({ raw: ['Hi\\n', '!'] }, 'Bob'), 'Hi\\nBob!', 'raw is array');
  assert.strictEqual(raw({ raw: 'test' }, 0, 1, 2), 't0e1s2t', 'raw is string');
  assert.strictEqual(raw({ raw: 'test' }, 0), 't0est', 'lacks substituting');
  assert['throws'](function () {
    raw({});
  }, TypeError);
  assert['throws'](function () {
    raw({ raw: null });
  }, TypeError);
});
