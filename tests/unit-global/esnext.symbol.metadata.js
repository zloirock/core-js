QUnit.test('Symbol.metadata', assert => {
  assert.true('metadata' in Symbol, 'Symbol.metadata available');
  assert.nonEnumerable(Symbol, 'metadata');
  assert.true(Object(Symbol.metadata) instanceof Symbol, 'Symbol.metadata is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'metadata');
  assert.false(descriptor.enumerable, 'non-enumerable');
  assert.false(descriptor.writable, 'non-writable');
  assert.false(descriptor.configurable, 'non-configurable');
});
