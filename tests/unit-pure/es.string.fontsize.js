import fontsize from '@core-js/pure/es/string/fontsize';

QUnit.test('String#fontsize', assert => {
  assert.isFunction(fontsize);
  assert.same(fontsize('a', 'b'), '<font size="b">a</font>', 'lower case');
  assert.same(fontsize('a', '"'), '<font size="&quot;">a</font>', 'escape quotes');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    const symbol = Symbol('fontsize test');
    assert.throws(() => fontsize(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => fontsize('a', symbol), 'throws on symbol argument');
  }
});
