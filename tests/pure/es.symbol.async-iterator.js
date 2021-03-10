import Symbol from 'core-js-pure/full/symbol';

QUnit.test('Symbol.asyncIterator', assert => {
  assert.ok('asyncIterator' in Symbol, 'Symbol.asyncIterator available');
  assert.ok(Object(Symbol.asyncIterator) instanceof Symbol, 'Symbol.asyncIterator is symbol');
});
