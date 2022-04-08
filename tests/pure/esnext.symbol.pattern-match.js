import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.patternMatch', assert => {
  assert.true('patternMatch' in Symbol, 'Symbol.patternMatch available');
  assert.true(Object(Symbol.patternMatch) instanceof Symbol, 'Symbol.patternMatch is symbol');
});
