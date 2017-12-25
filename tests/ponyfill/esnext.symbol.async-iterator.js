QUnit.test('Symbol.asyncIterator', assert => {
  const { Symbol } = core;
  assert.ok('asyncIterator' in Symbol, 'Symbol.asyncIterator available');
  assert.ok(Object(Symbol.asyncIterator) instanceof Symbol, 'Symbol.asyncIterator is symbol');
});
