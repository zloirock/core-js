QUnit.test('Symbol.asyncIterator', assert => {
  assert.true('asyncIterator' in Symbol, 'Symbol.asyncIterator available');
  assert.nonEnumerable(Symbol, 'asyncIterator');
  assert.true(Object(Symbol.asyncIterator) instanceof Symbol, 'Symbol.asyncIterator is symbol');

  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncIterator');
  assert.false(descriptor.enumerable, 'non-enumerable');
  assert.false(descriptor.writable, 'non-writable');
  assert.false(descriptor.configurable, 'non-configurable');
});
