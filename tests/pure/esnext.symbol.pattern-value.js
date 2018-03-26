import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.patternValue', assert => {
  assert.ok('patternValue' in Symbol, 'Symbol.patternValue available');
  assert.ok(Object(Symbol.patternValue) instanceof Symbol, 'Symbol.patternValue is symbol');
});
