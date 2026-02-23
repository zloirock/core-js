import big from 'core-js-pure/es/string/big';

QUnit.test('String#big', assert => {
  assert.isFunction(big);
  assert.same(big('a'), '<big>a</big>', 'lower case');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => big(Symbol('big test')), 'throws on symbol context');
  }
});
