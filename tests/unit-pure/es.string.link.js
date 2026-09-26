import link from '@core-js/pure/es/string/link';

QUnit.test('String#link', assert => {
  assert.isFunction(link);
  assert.same(link('a', 'b'), '<a href="b">a</a>', 'lower case');
  assert.same(link('a', '"'), '<a href="&quot;">a</a>', 'escape quotes');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    const symbol = Symbol('link test');
    assert.throws(() => link(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => link('a', symbol), 'throws on symbol argument');
  }
});
