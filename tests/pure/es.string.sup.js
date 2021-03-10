import sup from 'core-js-pure/full/string/sup';

QUnit.test('String#sup', assert => {
  assert.isFunction(sup);
  assert.same(sup('a'), '<sup>a</sup>', 'lower case');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol === 'function') {
    assert.throws(() => sup(Symbol()), 'throws on symbol context');
  }
});
