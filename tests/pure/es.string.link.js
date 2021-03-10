import link from 'core-js-pure/full/string/link';

QUnit.test('String#link', assert => {
  assert.isFunction(link);
  assert.same(link('a', 'b'), '<a href="b">a</a>', 'lower case');
  assert.same(link('a', '"'), '<a href="&quot;">a</a>', 'escape quotes');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol === 'function') {
    assert.throws(() => link(Symbol(), 'b'), 'throws on symbol context');
    assert.throws(() => link('a', Symbol()), 'throws on symbol argument');
  }
});
