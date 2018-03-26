import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.patternMatch', assert => {
  assert.ok('patternMatch' in Symbol, 'Symbol.patternMatch available');
  assert.ok(Object(Symbol.patternMatch) instanceof Symbol, 'Symbol.patternMatch is symbol');
});
