import Symbol from '@core-js/pure/full/symbol';

QUnit.test('Symbol.customMatcher', assert => {
  assert.true('customMatcher' in Symbol, 'Symbol.customMatcher available');
  assert.true(Object(Symbol.customMatcher) instanceof Symbol, 'Symbol.customMatcher is symbol');
});
