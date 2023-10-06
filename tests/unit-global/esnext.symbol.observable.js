QUnit.test('Symbol.observable', assert => {
  assert.true('observable' in Symbol, 'Symbol.observable available');
  assert.nonEnumerable(Symbol, 'observable');
  assert.true(Object(Symbol.observable) instanceof Symbol, 'Symbol.observable is symbol');
  const descriptor = Object.getOwnPropertyDescriptor(Symbol, 'observable');
  assert.false(descriptor.enumerable, 'non-enumerable');
  assert.false(descriptor.writable, 'non-writable');
  assert.false(descriptor.configurable, 'non-configurable');
});
