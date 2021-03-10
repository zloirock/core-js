import fixed from 'core-js-pure/full/string/fixed';

QUnit.test('String#fixed', assert => {
  assert.isFunction(fixed);
  assert.same(fixed('a'), '<tt>a</tt>', 'lower case');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol === 'function') {
    assert.throws(() => fixed(Symbol()), 'throws on symbol context');
  }
});
