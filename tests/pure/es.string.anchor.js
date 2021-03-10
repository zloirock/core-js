import anchor from 'core-js-pure/full/string/anchor';

QUnit.test('String#anchor', assert => {
  assert.isFunction(anchor);
  assert.same(anchor('a', 'b'), '<a name="b">a</a>', 'lower case');
  assert.same(anchor('a', '"'), '<a name="&quot;">a</a>', 'escape quotes');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol === 'function') {
    assert.throws(() => anchor(Symbol(), 'b'), 'throws on symbol context');
    assert.throws(() => anchor('a', Symbol()), 'throws on symbol argument');
  }
});
