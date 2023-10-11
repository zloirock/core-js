import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Symbol.asyncIterator', assert => {
  assert.true('asyncIterator' in Symbol, 'Symbol.asyncIterator available');
  assert.true(Object(Symbol.asyncIterator) instanceof Symbol, 'Symbol.asyncIterator is symbol');
});
