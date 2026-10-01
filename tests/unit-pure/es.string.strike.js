import strike from '@core-js/pure/es/string/strike';

QUnit.test('String#strike', assert => {
  assert.isFunction(strike);
  assert.same(strike('a'), '<strike>a</strike>', 'lower case');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol == 'function') {
    assert.throws(() => strike(Symbol('strike test')), 'throws on symbol context');
  }
});
