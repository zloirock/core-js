import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol.asyncIterator', assert => {
  assert.true('asyncIterator' in Symbol, 'Symbol.asyncIterator available');
  assert.true(Object(Symbol.asyncIterator) instanceof Symbol, 'Symbol.asyncIterator is symbol');
});
