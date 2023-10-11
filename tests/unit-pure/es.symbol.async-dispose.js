import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Symbol.asyncDispose', assert => {
  assert.true('asyncDispose' in Symbol, 'Symbol.asyncDispose available');
  assert.true(Object(Symbol.asyncDispose) instanceof Symbol, 'Symbol.asyncDispose is symbol');
});
