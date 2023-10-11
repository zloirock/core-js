import Symbol from '@core-js/pure/full/symbol';

QUnit.test('Symbol.observable', assert => {
  assert.true('observable' in Symbol, 'Symbol.observable available');
  assert.true(Object(Symbol.observable) instanceof Symbol, 'Symbol.observable is symbol');
});
