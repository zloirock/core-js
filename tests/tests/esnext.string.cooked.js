QUnit.test('String.cooked', assert => {
  const { cooked } = String;
  assert.isFunction(cooked);
  assert.arity(cooked, 1);
  assert.name(cooked, 'cooked');
  assert.looksNative(cooked);
  assert.nonEnumerable(String, 'cooked');
  assert.strictEqual(cooked(['Hi\\n', '!'], 'Bob'), 'Hi\\nBob!', 'template is an array');
  assert.strictEqual(cooked('test', 0, 1, 2), 't0e1s2t', 'template is a string');
  assert.strictEqual(cooked('test', 0), 't0est', 'lacks substituting');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => cooked([Symbol()]), TypeError, 'throws on symbol #1');
    assert.throws(() => cooked('test', Symbol()), TypeError, 'throws on symbol #2');
  }

  assert.throws(() => cooked([undefined]), TypeError);
  assert.throws(() => cooked(null), TypeError);
});
