import big from 'core-js-pure/full/string/big';

QUnit.test('String#big', assert => {
  assert.isFunction(big);
  assert.same(big('a'), '<big>a</big>', 'lower case');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol === 'function') {
    assert.throws(() => big(Symbol()), 'throws on symbol argument');
  }
});
